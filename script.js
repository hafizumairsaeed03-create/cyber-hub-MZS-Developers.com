// === BUTTON CLICK & REDIRECT EVENT ===
// === BUTTON CLICK & RED ALERT EFFECT ===
const startCyberBtn = document.getElementById("startCyberBtn");

if (startCyberBtn) {
    startCyberBtn.addEventListener("click", function () {
        // 1. Instant Red Color & Glow Effect
        this.style.setProperty("background", "rgba(255, 0, 51, 0.9)", "important");
        this.style.setProperty("border-color", "#ff0033", "important");
        this.style.setProperty("color", "#ffffff", "important");
        this.style.setProperty("box-shadow", "0 0 35px #ff0033, inset 0 0 15px #ff0033", "important");
        
        // 2. Button Text Change Effect
        this.innerText = "INITIALIZING...";

        // 3. Smooth Redirect Delay
        setTimeout(function () {
            const splash = document.getElementById("cyber-splash");
            if (splash) {
                splash.classList.add("hidden");
            }
            
            // Redirect to target page
            window.location.href = "home.html";
        }, 400);
    });
}

// === AUTOMATIC MATRIX RAIN ANIMATION ===
const canvas = document.getElementById('matrixCanvas');

if (canvas) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix Characters (Cyber & Binary Text)
    const chars = '01101001010101010101001101MZCYBERHUB0101';
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = Array(columns).fill(1);

    // Canvas resize hone par columns adjust karne ke liye
    window.addEventListener('resize', () => {
        columns = Math.floor(canvas.width / fontSize);
        drops = Array(columns).fill(1);
    });

    function drawMatrix() {
        // Background fade effect
        ctx.fillStyle = 'rgba(2, 5, 11, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff66'; // Neon Green
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    // Continuous Loop
    setInterval(drawMatrix, 33);
}
// === FIX FOR BACK BUTTON / BLACK SCREEN ISSUE ===
window.addEventListener("pageshow", function (event) {
    // Agar page BFCache (back button) se load ho raha ho
    if (event.persisted) {
        const splash = document.getElementById("cyber-splash");
        if (splash) {
            // Splash screen ki hidden class hata kar original state reset kar dein
            splash.classList.remove("hidden");
            splash.style.display = "flex";
        }
        
        // Button ki red style ko wapis original green kar dein
        if (startCyberBtn) {
            startCyberBtn.innerText = "INITIALIZE SYSTEM →";
            startCyberBtn.style.removeProperty("background");
            startCyberBtn.style.removeProperty("border-color");
            startCyberBtn.style.removeProperty("color");
            startCyberBtn.style.removeProperty("box-shadow");
        }
    }
});