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
            return res.json({ success: true, reply: "GEMINI_API_KEY Missing!" });
        }

        const systemPrompt = `
        Tum 'CyberHub' (Cyber Academy) ke official AI Assistant ho.
        Founder aur Owner: Mr. Zubair Khan.
        
        Rules:
        1. Agar user "hello" ya greeting kare, toh complete intro do: "Hello! Main CyberHub ka official AI Assistant hoon. Mr. Zubair Khan ki is platform par aapka swagat hai. Main aapki kya madad kar sakta hoon?"
        2. Baki sawaalon par CyberHub, courses, aur services ka accurate aur fast jawab do.
        3. Response direct, clear, aur helpful rakho.
        `;

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                system_instruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    maxOutputTokens: 200,
                    temperature: 0.7
                }
            })
        });

        const data = await apiResponse.json();

        if (data.error) {
            return res.json({ success: true, reply: "API Error: " + data.error.message });
        }

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.json({ success: true, reply: replyText.trim() });
        } else {
            return res.json({ success: true, reply: "Hello! Main CyberHub ka official AI Assistant hoon. Mr. Zubair Khan ki is platform par aapka swagat hai. Main aapki kya madad kar sakta hoon?" });
        }

    } catch (error) {
        return res.json({ success: true, reply: "Server Error: " + error.message });
    }
};
