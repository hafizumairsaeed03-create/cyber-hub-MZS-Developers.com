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
            return res.json({ success: true, reply: "Error: Vercel environment variables mein GEMINI_API_KEY missing hai!" });
        }

        const systemPrompt = `
        Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho. 
        Tumhe is website ki har cheez aur folders ke baray mein mukammal malumat hai:
        - Yeh website cybersecurity education, training, aur digital solutions provide karti hai.
        - Isme main files aur pages hain: home.html (main dashboard & hero section), services.html, about.html, courses.html, contact.html, aur enjoyment.html.
        - Iska design modern dark tactical command center aur sci-fi style par mabni hai.
        - Founder/owner Mr. Zubair Khan hain.
        
        Rules:
        1. Jab bhi koi Hello, Hi ya website ka intro pooche, toh CyberHub ka mukammal, shandar aur professional introduction do (mentioning cybersecurity training, digital solutions, founder Mr. Zubair Khan, aur main pages).
        2. User ke har sawaal ka mukammal, naya aur accurate jawab do. Sirf CyberHub ke baray mein baat karo.
        `;

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
            return res.json({ 
                success: true, 
                reply: "Hello! Main CyberHub ka official AI assistant hoon. Mr. Zubair Khan ki banai gayi is platform par aapko cybersecurity education aur digital solutions milte hain. Main aapki kya madad kar sakta hoon?" 
            });
        }

    } catch (error) {
        return res.json({ success: true, reply: "Server Error: " + error.message });
    }
};
