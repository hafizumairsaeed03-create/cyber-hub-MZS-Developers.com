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
            return res.status(200).json({ success: true, reply: "Error: API Key missing hai." });
        }

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userQuery }]
                }],
                system_instruction: {
                    parts: [{ text: "Tum 'CyberHub' website ke official AI assistant ho. CyberHub cybersecurity education provide karta hai. Owner Mr. Zubair Khan hain. Har sawaal ka mukammal jawab do." }]
                }
            })
        });

        const data = await apiResponse.json();

        // Agar Gemini ki taraf se koi error ya block aaye toh wo direct dikh jaye
        if (data.error) {
            return res.status(200).json({ success: true, reply: "Gemini Error: " + data.error.message });
        }

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.status(200).json({ success: true, reply: replyText });
        } else {
            // Raw JSON print karwayenge taake asal waja pata chale
            return res.status(200).json({ success: true, reply: "Raw Response: " + JSON.stringify(data) });
        }

    } catch (err) {
        return res.status(200).json({ success: true, reply: "Catch Error: " + err.message });
    }
};
