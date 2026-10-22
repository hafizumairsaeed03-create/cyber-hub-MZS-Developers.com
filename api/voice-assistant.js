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
            return res.json({ success: true, reply: "Error: Vercel Environment Variables mein GEMINI_API_KEY add karna bhool gaye hain!" });
        }

        const systemPrompt = `Tum 'CyberHub' website ke official AI assistant ho. CyberHub cybersecurity education aur digital solutions provide karta hai. Owner Mr. Zubair Khan hain. User ke har alag sawaal ka mukammal, naya aur accurate jawab do.`;

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                system_instruction: { parts: [{ text: systemPrompt }] }
            })
        });

        const data = await apiResponse.json();

        if (data.error) {
            return res.json({ success: true, reply: "Gemini Error: " + data.error.message });
        }

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.json({ success: true, reply: replyText });
        } else {
            return res.json({ success: true, reply: "Main CyberHub AI hoon, farmayein kya madad karoon?" });
        }

    } catch (error) {
        return res.json({ success: true, reply: "Server Error: " + error.message });
    }
};
