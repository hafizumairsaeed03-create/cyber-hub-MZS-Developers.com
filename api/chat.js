export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userQuery = req.body?.message || req.body?.query || req.body?.userQuery || "Hello";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ 
      success: false, 
      error: 'GEMINI_API_KEY is missing on server.' 
    });
  }

  const systemPrompt = `Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho. Tumhe is website ki har cheez aur folders ke baray mein mukammal malumat hai.
Rules:
1. Tumne kisi bhi user se website ka link ya naam nahi maangna.
2. Tumne sirf Cyberhub aur iske pages/features ke baray mein jawab dena hai.
3. Agar koi aam ya gair-mutalliqat sawal poochay, toh politely refusal mein jawab dena hai.`;

  try {
    // Model name updated to gemini-2.0-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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

    if (data.error) {
      return res.status(200).json({
        success: false,
        error: data.error.message || 'Gemini API Error'
      });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return res.status(200).json({
        success: false,
        error: 'AI ne koi jawab nahi diya.'
      });
    }

    return res.status(200).json({ 
      success: true, 
      reply: replyText 
    });

  } catch (err) {
    return res.status(200).json({ 
      success: false, 
      error: err.message || 'Server connection issue' 
    });
  }
}
