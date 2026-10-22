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
        const userQuery = req.body.message || req.body.query || "Hello";

        const systemPrompt = `
        Tum 'CyberHub' (Cyber Academy) website ke official AI Assistant ho. 
        Tumhe is website ki har cheez aur folders ke baray mein mukammal malumat hai:
        - Yeh website cybersecurity education, training, aur digital solutions provide karti hai.
        - Isme main files aur pages hain: home.html (main dashboard & hero section), services.html, about.html, courses.html, contact.html, aur enjoyment.html.
        - Iska design modern dark tactical command center aur sci-fi style par mabni hai.
        - Founder/owner Mr. Zubair Khan hain.
        
        Rules:
        1. Tumne kisi bhi user se website ka link ya naam nahi maangna, kyunki yeh tum khud ho aur sab jaante ho.
        2. Tumne sirf CyberHub aur iske pages/features ke baray mein jawab dena hai.
        3. Agar koi aam ya gair-mutalliq sawal pooche, toh polite tareeqay se mana kar dena.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                { role: 'user', parts: [{ text: userQuery }] }
            ],
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
                maxOutputTokens: 250
            }
        });

        // SDK ke mutabiq text extract karne ka sahi tareeqa
        const replyText = response.text || "Hello! CyberHub mein aapka swagat hai. Main aapki kya madad kar sakta hoon?";

        res.json({ 
            success: true, 
            reply: replyText 
        });

    } catch (error) {
        console.error('Server Error Detail:', error);
        res.status(200).json({ 
            success: true, 
            reply: "Server Error: " + (error.message || 'AI processing failed') 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gemini AI Server running on port ${PORT}`);
});

module.exports = app;
