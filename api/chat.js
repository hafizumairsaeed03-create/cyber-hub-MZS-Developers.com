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

    const systemPrompt = "Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho. Tumhe is website ki har cheez aur folders ke baray mein mukammal malumat hai: Yeh website cybersecurity education, training, aur digital solutions provide karti hai. Isme main files hain: home.html, services.html, about.html, courses.html, contact.html. Founder/owner Mr. Zubair Khan hain. Rules: 1. Greeting Rule: Jab bhi user 'Hello', 'Hi', ya 'Hey' bheje, tumne full introduction dena hai: 'Hello! CyberHub mein aapka swagat hai. Main CyberHub ka official AI assistant hoon. CyberHub cybersecurity education, training, aur digital solutions provide karta hai. Main aapki CyberHub ke courses, services, ya owner profile (Mr. Zubair Khan) ke baare mein kya madad kar sakta hoon?' 2. Scope Rule: Tumne SIRF aur SIRF CyberHub website aur iske owner (Mr. Zubair Khan) ke baare mein jawab dena hai. 3. Out of Topic Rule: Agar user CyberHub ke ilawa koi bhi aam sawaal pooche, toh seedha yeh jawab do: 'Main CyberHub ka official AI assistant hoon. Main sirf CyberHub aur iske services/courses ke baare mein malumat de sakta hoon.' 4. Friendly aur Roman Urdu mein fast jawab do.";

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
                reply: "Hello! CyberHub mein aapka swagat hai. Main CyberHub ka official AI assistant hoon. Main aapki CyberHub ke courses, services, ya owner profile ke baare mein kya madad kar sakta hoon?"
            });
        }
    } catch (err) {
        return res.status(200).json({
            success: true,
            reply: "Hello! CyberHub mein aapka swagat hai. Main CyberHub ka official AI assistant hoon. Aap CyberHub ke baare mein kya poochna chahte hain?"
        });
    }
};
