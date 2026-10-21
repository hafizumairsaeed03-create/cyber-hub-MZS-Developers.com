export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing' });
  }

  try {
    const response = await fetch(https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect with AI service' });
  }
}
