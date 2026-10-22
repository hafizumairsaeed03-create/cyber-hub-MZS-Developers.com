module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let body = {};
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch (e) {
        body = {};
    }

    const userQuery = body.message || body.query || body.userQuery || "Hello";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({
            success: true,
            reply: "GEMINI_API_KEY environment variable missing hai."
        });
    }

    const systemPrompt = "Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho. CyberHub cybersecurity education, training, aur digital solutions provide karta hai. Founder Mr. Zubair Khan hain. Rules: 1. User ke har alag sawaal ka mukammal, naya aur accurate jawab do. 2. Hello/Hi par introduction do. 3. Sirf CyberHub ke baare mein baat karo.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userQuery }]
                }],
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                generationConfig: {
                    maxOutputTokens: 250,
                    temperature: 0.7
                }
            })
        });

        const data = await response.json();

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
                reply: "CyberHub assistant active hai. Aap apna sawaal pooch sakte hain!"
            });
        }
    } catch (err) {
        return res.status(200).json({
            success: true,
            reply: "Server error: " + err.message
        });
    }
};
