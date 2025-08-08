let batteryTime = 30; // výchozí čas v sekundách
let timerInterval = null;
let flashlightOn = false;
let alarmTriggered = false;

const timerEl = document.getElementById("timer");
const toggleBtn = document.getElementById("toggleBtn");
const codeInput = document.getElementById("codeInput");
const addBatteryBtn = document.getElementById("addBatteryBtn");
const alarmMsg = document.getElementById("alarmMsg");
const flashlightEl = document.getElementById("flashlight");
const fallbackEl = document.getElementById("fallback");

// Zvuk alarmu (dej si do projektu soubor alarm.mp3)
const alarmSound = new Audio('alarm.mp3');
alarmSound.preload = 'auto';

// --- Funkce timeru a aktualizace ---
function updateTimer() {
  let min = Math.floor(batteryTime / 60);
  let sec = batteryTime % 60;
  timerEl.textContent = `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    if (batteryTime > 0) {
      batteryTime--;
      updateTimer();
      if (batteryTime === 0) {
        turnOffFlashlight();
        alarmMsg.textContent = "Baterka vybitá! Zadej kód pro nové baterky.";
      }
      saveState();
    } else {
      stopTimer();
    }
  }, 1000);
}

// --- Simulovaná svítilna (pouze bílá obrazovka) ---
function turnOnFlashlight() {
  if (flashlightOn) return;
  flashlightEl.style.display = 'flex'; // zobraz bílou obrazovku
  flashlightOn = true;
  alarmMsg.textContent = "";
  startTimer();
  toggleBtn.textContent = "Vypnout svítilnu";
}

function turnOffFlashlight() {
  if (!flashlightOn) return;
  flashlightEl.style.display = 'none';
  flashlightOn = false;
  stopTimer();
  toggleBtn.textContent = "Zapnout svítilnu";
  saveState();
}
// --- Ovládání tlačítek ---
toggleBtn.addEventListener('click', () => {
  if (batteryTime <= 0) {
    alarmMsg.textContent = "Baterka vybitá! Zadej kód pro nové baterky.";
    return;
  }
  if (flashlightOn) {
    turnOffFlashlight();
  } else {
    turnOnFlashlight();
  }
  saveState();
});

addBatteryBtn.addEventListener('click', () => {
  const code = codeInput.value.trim();
  if (!code) return;
  if (code === "asd") {
    // Reset alarmu
    alarmTriggered = false;
    alarmMsg.textContent = "Alarm resetován.";
    codeInput.value = "";
    saveState();
    return;
  }
  if (alarmTriggered) {
    alarmMsg.textContent = "Nejdřív resetuj alarm zadáním kódu 'asd'.";
    return;
  }
  // Přidání +60 sekund baterky
  batteryTime += 60;
  alarmMsg.textContent = "Baterka přidána +60 s.";
  codeInput.value = "";
  updateTimer();
  saveState();
});

// Tlačítko vypnutí na bílé obrazovce fallbacku
fallbackEl.onclick = () => {
  turnOffFlashlight();
};

// --- Uložení a načtení stavu ---
function saveState() {
  localStorage.setItem('batteryTime', batteryTime);
  localStorage.setItem('flashlightOn', flashlightOn);
  localStorage.setItem('alarmTriggered', alarmTriggered);
}

function loadState() {
  const savedBattery = localStorage.getItem('batteryTime');
  if (savedBattery !== null) batteryTime = parseInt(savedBattery);
  const savedFlashlight = localStorage.getItem('flashlightOn');
  flashlightOn = savedFlashlight === 'true';
  const savedAlarm = localStorage.getItem('alarmTriggered');
  alarmTriggered = savedAlarm === 'true';
  updateTimer();
  if (flashlightOn) {
    turnOnFlashlight();
  } else {
    toggleBtn.textContent = "Zapnout svítilnu";
  }
  if (alarmTriggered) {
    alarmMsg.textContent = "Alarm aktivní! Zadej kód 'asd' pro reset.";
  }
}

// --- Alarmový režim při opuštění appky ---
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    localStorage.setItem("leftAt", Date.now());
  } else {
    const leftAt = localStorage.getItem("leftAt");
    if (leftAt) {
      const awayTime = Date.now() - leftAt;
      if (awayTime > 3000) { // více než 3 sekundy pryč
        batteryTime -= 30;
        if (batteryTime < 0) batteryTime = 0;
        alarmTriggered = true;
        updateTimer();
        saveState();
        alarmMsg.textContent = "Opustil jsi aplikaci! Baterka -30 s. Zadej kód 'asd' pro reset.";

        // Spustit alarm (pokud to prohlížeč dovolí)
        alarmSound.currentTime = 0;
        alarmSound.play().catch(() => {});
      }
    }
  }
});

// --- Blokování scrollu a gesta na mobilu ---
window.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });

window.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});

// --- Po načtení ---
window.addEventListener('load', () => {
  loadState();
  updateTimer();
});
