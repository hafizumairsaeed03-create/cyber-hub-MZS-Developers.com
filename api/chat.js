const https = require('https');

module.exports = async (req, res) => {
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

  let body = {};
  try {
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (e) {
    body = {};
  }

  const userQuery = body.message || body.query || body.userQuery || "Hello";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ 
      success: false, 
      error: 'Vercel Environment Variables mein GEMINI_API_KEY missing hai.' 
    });
  }

  const systemPrompt = "Tum 'CyberHub' (Cyber Academy) ke official AI Assistant ho. Short aur polite jawab do.";

  const postData = JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }]
      }
    ]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let responseData = '';

    apiRes.on('data', (chunk) => {
      responseData += chunk;
    });

    apiRes.on('end', () => {
      try {
        const parsedData = JSON.parse(responseData);
        if (parsedData.error) {
          return res.status(200).json({
            success: false,
            error: parsedData.error.message || 'Gemini API Error'
          });
        }

        const replyText = parsedData.candidates?.[0]?.content?.parts?.[0]?.text || "AI ne koi jawab nahi diya.";
        return res.status(200).json({
          success: true,
          reply: replyText
        });
      } catch (e) {
        return res.status(200).json({
          success: false,
          error: 'Response JSON Parse Error'
        });
      }
    });
  });

  apiReq.on('error', (e) => {
    return res.status(200).json({
      success: false,
      error: 'Google Gemini Connection Failed: ' + e.message
    });
  });

  apiReq.write(postData);
  apiReq.end();
};
