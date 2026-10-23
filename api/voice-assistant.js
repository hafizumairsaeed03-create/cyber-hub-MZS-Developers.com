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
            return res.json({ success: true, reply: "Error: Vercel Environment Variables mein GEMINI_API_KEY Missing hai!" });
        }

        const systemPrompt = `
        Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho. 
        Tumhe is website ki har cheez aur pages ke baray mein mukammal malumat hai:
        - Yeh website cybersecurity education, training, aur digital solutions provide karti hai.
        - Founder aur Owner Mr. Zubair Khan hain.
        - Main pages: home.html, services.html, about.html, courses.html, contact.html, enjoyment.html.
        
        Rules:
        1. Always speak politely, professionally, and keep answers concise so Web Speech API can speak it smoothly.
        2. Give full details about CyberHub, its training programs, and founder Mr. Zubair Khan when greeted or asked.
        3. Do not ask for website link/name because you are embedded directly inside CyberHub.
        `;

     // FIXED MODEL NAME TO gemini-3.8-flash:
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
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
            return res.json({ 
                success: true, 
                reply: "Hello! Main CyberHub ka official AI assistant hoon. Mr. Zubair Khan ki banai gayi is platform par aapka swagat hai. Main aapki kya madad kar sakta hoon?" 
            });
        }

    } catch (error) {
        return res.json({ success: true, reply: "Server Error: " + error.message });
    }
};
