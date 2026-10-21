export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userQuery = req.body.message || req.body.query || "Hello";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing' });
  }

  const systemPrompt = `Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho. Tumhe is website ki har cheez aur folders ke baray mein mukammal malumat hai.
Rules:
1. Tumne kisi bhi user se website ka link ya naam nahi maangna.
2. Tumne sirf Cyberhub aur iske pages/features ke baray mein jawab dena hai.
3. Agar koi aam ya gair-mutalliqat sawal poochay, toh politely refusal mein jawab dena hai.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }]
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from AI.";
    
