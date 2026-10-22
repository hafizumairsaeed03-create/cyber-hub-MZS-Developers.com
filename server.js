require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/voice-assistant', async (req, res) => {
    try {
        const userQuery = req.body.message || "Hello";

        // Yahan hum AI ko poori website ka data aur strict instruction de rahe hain
        const systemPrompt = `
        Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho. 
        Tumhe is website ki har cheez aur folders ke baray mein mukammal malumat hai:
        - Yeh website cybersecurity education, training, aur digital solutions provide karti hai.
        - Isme main files aur pages hain: home.html (main dashboard & hero section), services.html, about.html, courses.html, contact.html, aur enjoyment.html.
        - Iska design modern dark tactical command center aur sci-fi style par mabni hai.
        
        Rules:
        1. Tumne kisi bhi user se website ka link ya naam nahi maangna, kyunki yeh tum khud ho aur sab jaante ho.
        2. Tumne sirf CyberHub aur iske pages/features ke baray mein jawab dena hai.
        3. Agar koi aam ya gair-mutalliq sawal pooche, toh polite tareeqay se mana kar dena.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userQuery,
            config: {
                systemInstruction: systemPrompt
            }
        });

        res.json({ 
            success: true, 
            reply: response.text || "Main CyberHub AI hoon, farmayein kya madad karoon?" 
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ success: false, error: 'AI processing failed' });
    }
});

app.listen(3000, () => {
    console.log('Gemini AI Server running on http://localhost:3000');
});
module.exports = app;
