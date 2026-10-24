JavaScript
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
        const queryLower = userQuery.toLowerCase().trim();

        // 1. CUSTOM ANSWERS (Aap yahan apni marzi ke jitne marzi sawal aur jawab add kar sakte hain!)
        if (queryLower.includes('website kis baray') || queryLower.includes('cyberhub') || queryLower.includes('about')) {
            return res.json({ success: true, reply: "Yeh CyberHub ek advanced digital solutions aur cyber academy platform hai, jahan modern tech aur security services provide ki jati hain!" });
        } 
        if (queryLower.includes('founder') || queryLower.includes('owner') || queryLower.includes('zubair')) {
            return res.json({ success: true, reply: "Is amazing platform ke founder aur owner Mr. Zubair Khan hain." });
        } 
        if (queryLower.includes('hello') || queryLower.includes('salam') || queryLower.includes('hi')) {
            return res.json({ success: true, reply: "Hello! Main CyberHub ka AI Assistant hoon, bataiye main aapki kya madad kar sakta hoon?" });
        }

        // 2. GEMINI API CALL (Agar custom match na ho toh AI API call karega)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.json({ success: true, reply: "CyberHub Assistant active hai! (API Key missing hai)" });
        }

        const systemPrompt = `Tum 'CyberHub' (Cyber Academy) ke official AI Assistant ho. Founder: Mr. Zubair Khan. Sawal ka short aur accurate jawab do.`;

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                system_instruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
            })
        });

        const data = await apiResponse.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.json({ success: true, reply: replyText.trim() });
        } else {
            return res.json({ success: true, reply: "Main CyberHub ke hawale se aapki kya madad kar sakta hoon?" });
        }

    } catch (error) {
        // Agar API error de toh apna custom friendly message bhej do taake user ko error show na ho
        return res.json({ success: true, reply: "Main CyberHub ka assistant hoon, aap mujhse website ya courses ke baray mein pooch sakte hain!" });
    }
};
