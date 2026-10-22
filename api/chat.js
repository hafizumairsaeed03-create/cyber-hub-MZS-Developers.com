async function sendQueryToAI(userMessage) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userMessage })
        });
        
        const data = await response.json();
        if (data.success && data.reply) {
            appendMessageToChat(data.reply, 'ai');
            speakResponse(data.reply); // Voice output ke liye
        } else {
            appendMessageToChat("CyberHub mein aapka swagat hai! Main aapki kya madad kar sakta hoon?", 'ai');
        }
    } catch (err) {
        appendMessageToChat("Main CyberHub ka official AI assistant hoon.", 'ai');
    }
}
