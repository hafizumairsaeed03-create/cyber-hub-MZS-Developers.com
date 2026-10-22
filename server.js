require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

app.post('/api/voice-assistant', async (req, res) => {
    try {
        const userQuery = req.body.message || req.body.query || "Hello";
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.json({ success: true, reply: "Error: GEMINI_API_KEY missing in .env" });
        }

        const systemPrompt = `Tum 'CyberHub' website ke official AI assistant ho. CyberHub cybersecurity education aur digital solutions provide karta hai. Owner Mr. Zubair Khan hain. User ke har alag sawaal ka mukammal, naya aur accurate jawab do.`;

        // Direct fetch request to Gemini API (No SDK version mismatch issues)
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
            return res.json({ success: true, reply: "Main CyberHub AI hoon, farmayein kya madad karoon?" });
        }

    } catch (error) {
        console.error('Server Error:', error);
        res.json({ success: true, reply: "Server Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
