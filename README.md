# 🧾 Receipt AI Extractor

A web application that uses AI to automatically extract key information from receipt images. Upload a receipt photo, let AI read it, review/edit the extracted data, and save it to your local history.

![Receipt AI Extractor](https://img.shields.io/badge/Built%20with-React%20%2B%20Vite-61dafb?style=flat-square&logo=react) ![AI](https://img.shields.io/badge/AI-OpenRouter-blueviolet?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

- 📸 Upload receipt images (JPG, PNG, WebP)
- 🤖 AI automatically extracts merchant name, date, total amount, and currency
- ✏️ Editable form to correct any extracted data
- 💾 Save receipts to browser localStorage (persists across sessions)
- 🗂️ View, manage, and delete saved receipt history
- 🔒 API key stored locally in `.env` — never pushed to GitHub

---

## 🚀 How to Run

### 1. Clone the repository

```bash
git clone https://github.com/nanenmalik/ReceiptApp.git
cd ReceiptApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

Create a `.env` file in the root of the project:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Get your free API key at 👉 [https://openrouter.ai/keys](https://openrouter.ai/keys)

> **Note:** The `.env` file is listed in `.gitignore` and will never be committed to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open your browser and go to `http://localhost:5173`

---

## 🤖 AI Model & Prompt

### Model

This app uses **[`baidu/qianfan-ocr-fast:free`](https://openrouter.ai/baidu/qianfan-ocr-fast)** via [OpenRouter](https://openrouter.ai), a free vision model specialized in OCR (Optical Character Recognition) — ideal for reading text from receipt images.

### Prompt

```
Analyze this receipt image and extract the following information.
Return ONLY a valid JSON object with the exact keys:
- "merchantName": string (The name of the store or merchant)
- "date": string (The date of the transaction in YYYY-MM-DD format if possible, otherwise exactly as written)
- "totalAmount": number or string (The final total amount paid)
- "currency": string (The currency symbol or code, e.g., $, USD, MYR, EUR)

If you cannot find a field, set its value to null.
Do not include markdown code block formatting like ```json, just the raw JSON object.
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [React](https://react.dev) + [Vite](https://vitejs.dev) | Frontend framework & build tool |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [Lucide React](https://lucide.dev) | Icons |
| [OpenRouter](https://openrouter.ai) | AI API gateway |
| `localStorage` | Receipt history persistence |

---

## 📁 Project Structure

```
ReceiptApp/
├── public/
│   └── favicon.svg         # Receipt icon favicon
├── src/
│   ├── utils/
│   │   └── ai.js           # OpenRouter API call & prompt
│   ├── App.jsx             # Main app component
│   └── index.css           # Styles
├── .env                    # 🔒 Not committed (add your key here)
├── .env.example            # Template for .env
└── index.html
```

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter API key |

---

## 📄 License

MIT
