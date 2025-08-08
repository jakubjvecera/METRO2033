let flashlightTime = parseInt(localStorage.getItem("flashlightTime")) || 30;
let flashlightActive = false;
let flashlightInterval;

const flashlightBtn = document.getElementById("flashlight-btn");
const mapBtn = document.getElementById("map-btn");
const content = document.getElementById("content");
const flashlightScreen = document.getElementById("flashlight-screen");
const timer = document.getElementById("timer");

const codeInput = document.getElementById("code-input");
const codeSubmit = document.getElementById("code-submit");

// Kódy a jejich efekty
const codes = {
    "BATERKA": () => { flashlightTime += 30; saveTime(); alert("+30s svítilny"); },
};

// Uložit čas
function saveTime() {
    localStorage.setItem("flashlightTime", flashlightTime);
}

// Aktualizace časovače
function updateTimer() {
    timer.textContent = flashlightTime + "s";
}

// Zapnutí/vypnutí svítilny
flashlightBtn.addEventListener("click", () => {
    if (!flashlightActive && flashlightTime > 0) {
        flashlightActive = true;
        flashlightScreen.style.display = "flex";
        updateTimer();
        flashlightInterval = setInterval(() => {
            flashlightTime--;
            updateTimer();
            saveTime();
            if (flashlightTime <= 0) {
                clearInterval(flashlightInterval);
                flashlightActive = false;
                flashlightScreen.style.display = "none";
            }
        }, 1000);
    } else {
        flashlightActive = false;
        flashlightScreen.style.display = "none";
        clearInterval(flashlightInterval);
    }
});

// Mapa
mapBtn.addEventListener("click", () => {
    content.innerHTML = `<img src="images/mapa.png" style="width:100%;">`;
});

// Zadání kódu
codeSubmit.addEventListener("click", () => {
    const code = codeInput.value.trim().toUpperCase();
    if (codes[code]) {
        codes[code]();
    } else {
        alert("Neplatný kód");
    }
    codeInput.value = "";
});
