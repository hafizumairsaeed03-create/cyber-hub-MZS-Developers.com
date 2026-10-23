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
        
        // Dynamic query check (message ya query dono accept karega)
        const userQuery = body?.message || body?.query || req.query?.message || "Hello";
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.json({ success: true, reply: "GEMINI_API_KEY Missing in Vercel!" });
        }

        const systemPrompt = `
        Tum 'CyberHub' (Cyber Academy) ke official AI Assistant ho.
        Founder aur Owner: Mr. Zubair Khan.
        
        Rules:
        1. User ke poocha gaya sawal ka direct aur accurate jawab do.
        2. Sirf tab hi "CyberHub mein aapka swagat hai" kaho jab user "Hello" ya greeting kare. Baaki sawalon par unka specific jawab do.
        3. Jawab concise aur short rakho (1-2 sentences) taake fast response aaye.
        `;

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                system_instruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    maxOutputTokens: 100,
                    temperature: 0.7
                }
            })
        });

        const data = await apiResponse.json();

        // Agar Google API se koi error aaye to real error show ho
        if (data.error) {
            return res.json({ success: true, reply: "API Error: " + data.error.message });
        }

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.json({ success: true, reply: replyText.trim() });
        } else {
            return res.json({ success: true, reply: "Main aapki CyberHub ke hawale se kya madad kar sakta hoon?" });
        }

    } catch (error) {
        return res.json({ success: true, reply: "Server Error: " + error.message });
    }
};
