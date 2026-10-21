export default async function handler(req, res) {
  // CORS Headers تاکہ براؤزر کی طرف سے کوئی بلاک نہ ہو
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // فرنٹ اینڈ کے بھیجے گئے کسی بھی فیلڈ نیم کو قبول کرے (message, query, ya userQuery)
  const userQuery = req.body?.message || req.body?.query || req.body?.userQuery || "Hello";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing', reply: 'API Key missing on server.' });
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
    
    // تمام ممکنہ رسپانس فارمیٹس بھیجیں تاکہ فرنٹ اینڈ جو بھی مانگ رہا ہو، مل جائے
    return res.status(200).json({ 
      reply: reply,
      response: reply,
      message: reply,
      text: reply
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect with AI service', reply: 'Server connection error.' });
  }
}
