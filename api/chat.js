const https = require('https');

async function makeGeminiRequest(apiKey, postData) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
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
            reply: "Vercel Environment Variables mein GEMINI_API_KEY add nahi hai. Baraye meherbani API key check karein."
        });
    }

    const systemPrompt = "Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho. CyberHub cybersecurity education, training, courses, aur digital solutions provide karta hai. Main pages: home.html, services.html, about.html, courses.html, contact.html. Founder/owner Mr. Zubair Khan hain. Rules: 1. User ke har sawaal ka specific aur alag jawab do. 2. Hello/Hi par poora introductory welcome message do. 3. Sirf CyberHub ke baare mein baat karo. Outside topics par mana kar do.";

    const postData = JSON.stringify({
        contents: [{
            parts: [{ text: userQuery }]
        }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        generationConfig: {
            maxOutputTokens: 250,
            temperature: 0.7
        }
    });

    try {
        const parsedData = await makeGeminiRequest(apiKey, postData);
        
        if (parsedData.error) {
            return res.status(200).json({
                success: true,
                reply: `API Error: ${parsedData.error.message || 'Gemini API issue'}`
            });
        }

        const replyText = parsedData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return res.status(200).json({
                success: true,
                reply: replyText
            });
        } else {
            return res.status(200).json({
                success: true,
                reply: "CyberHub mein aapka swagat hai! Main aap ki courses, services aur owner details ke baray mein kya madad kar sakta hoon?"
            });
        }
    } catch (err) {
        return res.status(200).json({
            success: true,
            reply: "Server connect karne mein masla aa raha hai. Baraye meherbani thodi der baad try karein."
        });
    }
};
