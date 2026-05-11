import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Receipt, UploadCloud, X, CheckCircle, AlertCircle, RefreshCw, History, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { extractReceiptInfo } from './utils/ai'
import './index.css'

const STORAGE_KEY = 'receipt_history'

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveToHistory(entry) {
  const history = loadHistory()
  const newEntry = { ...entry, id: Date.now(), submittedAt: new Date().toLocaleString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...history]))
  return newEntry
}

function App() {
  const [imageSrc, setImageSrc] = useState(null)
  const [mimeType, setMimeType] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [history, setHistory] = useState(loadHistory)
  const [showHistory, setShowHistory] = useState(false)

  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setMimeType(file.type)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageSrc(e.target.result)
      setExtractedData(null)
      setError(null)
      setSuccess(false)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => fileInputRef.current?.click()

  const handleExtract = async () => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
    if (!imageSrc || !apiKey) {
      if (!apiKey) setError('API Key is missing from .env file')
      return
    }
    setIsExtracting(true)
    setError(null)
    setExtractedData(null)
    try {
      const data = await extractReceiptInfo(apiKey, imageSrc, mimeType)
      setExtractedData({
        merchantName: data.merchantName || '',
        date: data.date || '',
        totalAmount: data.totalAmount?.toString() || '',
        currency: data.currency || ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setExtractedData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newEntry = saveToHistory(extractedData)
    setHistory(prev => [newEntry, ...prev])
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleDeleteEntry = (id) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const resetApp = () => {
    setImageSrc(null)
    setExtractedData(null)
    setError(null)
    setSuccess(false)
  }

  return (
    <div className="app-container">
      <header className="header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Receipt AI Extractor</h1>
          <p>Instantly extract key information from any receipt using AI</p>
        </motion.div>
      </header>

      <div className="main-content">
        {/* Upload Panel */}
        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt /> Upload Receipt
          </h2>

          {!imageSrc ? (
            <div className="upload-area" onClick={triggerFileInput}>
              <UploadCloud className="upload-icon" />
              <h3>Click to upload</h3>
              <p style={{ color: 'var(--text-secondary)' }}>JPG, PNG, WebP up to 5MB</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <img src={imageSrc} alt="Receipt preview" className="preview-image" />
              <button
                className="btn"
                onClick={resetApp}
                style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.5rem' }}
              >
                <X size={16} />
              </button>
              {!extractedData && !isExtracting && (
                <button
                  className="btn btn-primary"
                  onClick={handleExtract}
                  style={{ width: '100%', marginTop: '1.5rem' }}
                >
                  Extract Information
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Extracted Details Panel */}
        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 style={{ marginBottom: '1.5rem' }}>Extracted Details</h2>

          {isExtracting ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Analyzing receipt with AI...</p>
            </div>
          ) : extractedData ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {success && (
                <div className="status-message status-success">
                  <CheckCircle size={20} />
                  Receipt saved to history!
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Merchant Name</label>
                  <input type="text" name="merchantName" className="form-input" value={extractedData.merchantName} onChange={handleFormChange} placeholder="e.g. Starbucks" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="text" name="date" className="form-input" value={extractedData.date} onChange={handleFormChange} placeholder="YYYY-MM-DD" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Total Amount</label>
                    <input type="text" name="totalAmount" className="form-input" value={extractedData.totalAmount} onChange={handleFormChange} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <input type="text" name="currency" className="form-input" value={extractedData.currency} onChange={handleFormChange} placeholder="USD" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Save Receipt
                  </button>
                  <button type="button" className="btn" onClick={handleExtract} title="Re-extract">
                    <RefreshCw size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          ) : error ? (
            <div className="status-message status-error">
              <AlertCircle size={20} />
              {error}
            </div>
          ) : (
            <div className="loader-container" style={{ opacity: 0.5 }}>
              <p>Upload a receipt and click "Extract Information" to see the results here.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* History Section */}
      <motion.div
        className="glass-panel"
        style={{ marginTop: '2rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setShowHistory(p => !p)}
        >
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={22} /> Saved Receipts
            <span className="history-badge">{history.length}</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {history.length > 0 && showHistory && (
              <button
                className="btn"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                onClick={(e) => { e.stopPropagation(); handleClearHistory() }}
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
            {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              {history.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', textAlign: 'center' }}>
                  No receipts saved yet. Extract and save a receipt to see it here.
                </p>
              ) : (
                <div className="history-grid" style={{ marginTop: '1.5rem' }}>
                  {history.map(entry => (
                    <motion.div
                      key={entry.id}
                      className="history-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p className="history-merchant">{entry.merchantName || 'Unknown Merchant'}</p>
                          <p className="history-date">{entry.date || '—'}</p>
                        </div>
                        <button
                          className="btn"
                          style={{ padding: '0.35rem', minWidth: 'unset' }}
                          onClick={() => handleDeleteEntry(entry.id)}
                          title="Delete"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="history-amount">
                        {entry.currency} {entry.totalAmount || '—'}
                      </div>
                      <p className="history-timestamp">Saved: {entry.submittedAt}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default App
