module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }
        
        const userQuery = body?.message || body?.query || "Hello";
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(200).json({ 
                success: true, 
                reply: "ERROR: Vercel environment variables mein GEMINI_API_KEY missing hai!" 
            });
        }

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userQuery }]
                }]
            })
        });

        const data = await apiResponse.json();

        if (data.error) {
            return res.status(200).json({ 
                success: true, 
                reply: "Google API Error: " + data.error.message 
            });
        }

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.status(200).json({ 
                success: true, 
                reply: replyText 
            });
        } else {
            return res.status(200).json({ 
                success: true, 
                reply: "Debug Response: " + JSON.stringify(data) 
            });
        }

    } catch (err) {
        return res.status(200).json({ 
            success: true, 
            reply: "Server Catch Error: " + err.message 
        });
    }
};
