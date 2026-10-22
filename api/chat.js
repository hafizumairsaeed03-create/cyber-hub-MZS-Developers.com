const https = require('https');

async function makeGeminiRequest(apiKey, postData, retries = 2) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', async () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (parsed.error && retries > 0) {
                        // Agar error aaye toh 1.5 second rukk kar dobara try karo
                        await new Promise(r => setTimeout(r, 1500));
                        return resolve(await makeGeminiRequest(apiKey, postData, retries - 1));
                    }
                    resolve(parsed);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
}
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
            reply: "Vercel Environment Variables mein GEMINI_API_KEY missing hai."
        });
    }

    const systemPrompt = `
    Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho.
    Tumhe is website ki har cheez aur folders ke baray mein mukammal malumat hai:
    - Yeh website cybersecurity education, training, aur digital solutions provide karti hai.
    - Isme main files aur pages hain: home.html (main dashboard & hero section), services.html, about.html, courses.html, contact.html.
    - Owner Profile: Website ke founder/owner Mr. Zubair Khan hain.

    Rules:
    1. Tumne kisi bhi user se website ka link ya naam nahi maangna.
    2. Tumne sirf CyberHub aur iske pages/features ke baray mein jawab dena hai.
    3. User ke har sawaal ka friendly aur accurate jawab do.
    `;
 const postData = JSON.stringify({
    contents: [{
        parts: [{ text: userQuery }]
    }],
    systemInstruction: {
        parts: [{ text: systemPrompt }]
    },
    generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7
    }
});

    try {
        const parsedData = await makeGeminiRequest(apiKey, postData);
        const replyText = parsedData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.status(200).json({
                success: true,
                reply: replyText
            });
        } else {
            return res.status(200).json({
                success: true,
                reply: "CyberHub AI aapki khidmat mein hazir hai! Aap CyberHub ke courses, services, ya owner profile ke baray mein pooch sakte hain."
            });
        }
    } catch (err) {
        return res.status(200).json({
            success: true,
            reply: "Main CyberHub AI Assistant hoon. Main aapki kya madad kar sakta hoon?"
        });
    }
};
