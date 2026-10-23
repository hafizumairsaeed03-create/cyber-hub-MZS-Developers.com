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
            return res.json({ success: true, reply: "Error: GEMINI_API_KEY missing!" });
        }

        const systemPrompt = `
        Tum 'CyberHub' (Cyber Academy) ke official AI Assistant ho.
        Founder: Mr. Zubair Khan.
        STRICT RULE: Sirf 1 chota aur short sentence mein jawab do. Fast speed boht zaroori hai.
        `;

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                system_instruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    maxOutputTokens: 60, // Boht chota response = Super Fast Processing
                    temperature: 0.5
                }
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
            return res.json({ 
                success: true, 
                reply: "CyberHub mein aapka swagat hai!" 
            });
        }

    } catch (error) {
        return res.json({ success: true, reply: "Server Error: " + error.message });
    }
};
