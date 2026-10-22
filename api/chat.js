const https = require('https');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }
        
        const userQuery = body?.message || body?.query || body?.userQuery || "Hello";
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(200).json({
                success: true,
                reply: "Error: Vercel environment variables mein GEMINI_API_KEY add nahi hai."
            });
        }

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userQuery }]
                }],
                system_instruction: {
                    parts: [{ text: "Tum 'CyberHub' website ke official AI assistant ho. CyberHub cybersecurity education aur digital solutions provide karta hai. Owner Mr. Zubair Khan hain. User ke har alag sawaal ka mukammal aur naya jawab do." }]
                }
            })
        });

        const data = await apiResponse.json();

        if (data.error) {
            return res.status(200).json({
                success: true,
                reply: "API Error: " + data.error.message
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
                reply: "Response generate nahi ho saka. Dobara try karein."
            });
        }

    } catch (err) {
        return res.status(200).json({
            success: true,
            reply: "Server Error: " + err.message
        });
    }
};
