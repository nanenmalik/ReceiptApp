export async function extractReceiptInfo(apiKey, imageBase64, mimeType = 'image/jpeg') {
  try {
    // Ensure image is in base64 data URL format
    const imageUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:${mimeType};base64,${imageBase64}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'baidu/qianfan-ocr-fast:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this receipt image and extract the following information.
Return ONLY a valid JSON object with the exact keys:
- "merchantName": string (The name of the store or merchant)
- "date": string (The date of the transaction in YYYY-MM-DD format if possible, otherwise exactly as written)
- "totalAmount": number or string (The final total amount paid)
- "currency": string (The currency symbol or code, e.g., $, USD, MYR, EUR)

If you cannot find a field, set its value to null.
Do not include markdown code block formatting like \`\`\`json, just the raw JSON object.`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData?.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || '';

    // Clean up potential markdown formatting
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('Error extracting receipt info:', error);
    throw new Error(error.message || 'Failed to parse receipt. Please try again.');
  }
}
