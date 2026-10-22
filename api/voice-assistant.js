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
            return res.json({ success: true, reply: "CRITICAL ERROR: Vercel environment variables mein GEMINI_API_KEY set nahi hai!" });
        }

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                system_instruction: { parts: [{ text: "Tum CyberHub ke official AI assistant ho. Har sawaal ka naya jawab do." }] }
            })
        });

        const data = await apiResponse.json();

        // Agar Google API ki taraf se koi error aaya ho
        if (data.error) {
            return res.json({ success: true, reply: "Google API Error: " + data.error.message });
        }

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.json({ success: true, reply: replyText });
        } else {
            // Agar text na mile toh poora raw JSON print karwa do taake asal waja pata chale
            return res.json({ success: true, reply: "RAW DEBUG DATA: " + JSON.stringify(data) });
        }

    } catch (error) {
        return res.json({ success: true, reply: "Server Catch Error: " + error.message });
    }
};
