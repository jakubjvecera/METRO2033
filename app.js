let batteryTime = 30; // v sekundách, výchozí čas baterky
let timerInterval = null;
let flashlightOn = false;
let alarmTriggered = false;
let wakeLock = null;

const timerEl = document.getElementById("timer");
const toggleBtn = document.getElementById("toggleBtn");
const codeInput = document.getElementById("codeInput");
const addBatteryBtn = document.getElementById("addBatteryBtn");
const alarmMsg = document.getElementById("alarmMsg");
const flashlightEl = document.getElementById("flashlight");
const fallbackEl = document.getElementById("fallback");

// Zvuk alarmu
const alarmSound = new Audio('alarm.mp3');
alarmSound.preload = 'auto';

// Kontrola podpory svítilny (iOS neumožňuje ovládání true svítilny)
const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);
const supportsTorch = !isIOS && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

let stream = null;
let track = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock uvolněn');
      });
      console.log('Wake Lock aktivní');
    }
  } catch (err) {
    console.warn('Nelze aktivovat Wake Lock:', err);
  }
}

async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

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

async function enterFullscreen() {
  if (document.documentElement.requestFullscreen) {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      console.warn("Nelze přepnout do fullscreen:", e);
    }
  }
}

async function exitFullscreen() {
  if (document.exitFullscreen) {
    try {
      await document.exitFullscreen();
    } catch (e) {
      console.warn("Nelze ukončit fullscreen:", e);
    }
  }
}

async function turnOnFlashlight() {
  if (flashlightOn) return;
  if (supportsTorch) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', torch: true }
      });
      track = stream.getVideoTracks()[0];
      await track.applyConstraints({ advanced: [{ torch: true }] });
    } catch(e) {
      console.warn("Nelze zapnout svítilnu:", e);
      fallbackEl.style.display = 'block';
    }
  } else {
    // fallback bílá obrazovka na iOS
    fallbackEl.style.display = 'block';
  }
  flashlightEl.style.display = 'block';
  flashlightOn = true;
  alarmMsg.textContent = "";
  startTimer();
  await enterFullscreen();
  await requestWakeLock();
}

async function turnOffFlashlight() {
  if (!flashlightOn) return;
  if (supportsTorch && track) {
    track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
    track.stop();
    stream && stream.getTracks().forEach(t => t.stop());
    stream = null;
    track = null;
  }
  fallbackEl.style.display = 'none';
  flashlightEl.style.display = 'none';
  flashlightOn = false;
  stopTimer();
  await releaseWakeLock();
  await exitFullscreen();
}

toggleBtn.addEventListener('click', async () => {
  if (batteryTime <= 0) {
    alarmMsg.textContent = "Baterka vybitá! Zadej kód pro nové baterky.";
    return;
  }
  if (flashlightOn) {
    await turnOffFlashlight();
    toggleBtn.textContent = "Zapnout svítilnu";
  } else {
    await turnOnFlashlight();
    toggleBtn.textContent = "Vypnout svítilnu";
  }
  saveState();
});

addBatteryBtn.addEventListener('click', () => {
  const code = codeInput.value.trim();
  if (!code) return;
  if (code === "asd") {
    // Reset alarm flag
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
  // Předpokládáme, že každý jiný kód je platný pro +60 s
  batteryTime += 60;
  alarmMsg.textContent = "Baterka přidána +60 s.";
  codeInput.value = "";
  updateTimer();
  saveState();
});

// Uložit stav do localStorage
function saveState() {
  localStorage.setItem('batteryTime', batteryTime);
  localStorage.setItem('flashlightOn', flashlightOn);
  localStorage.setItem('alarmTriggered', alarmTriggered);
}

// Načíst stav z localStorage
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
    toggleBtn.textContent = "Vypnout svítilnu";
  } else {
    toggleBtn.textContent = "Zapnout svítilnu";
  }
  if (alarmTriggered) {
    alarmMsg.textContent = "Alarm aktivní! Zadej kód 'asd' pro reset.";
  }
}

// Detekce opuštění aplikace - alarmový režim
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    localStorage.setItem("leftAt", Date.now());
  } else {
    const leftAt = localStorage.getItem("leftAt");
    if (leftAt) {
      const awayTime = Date.now() - leftAt;
      if (awayTime > 3000) { // více než 3s pryč
        batteryTime -= 30;
        if (batteryTime < 0) batteryTime = 0;
        alarmTriggered = true;
        updateTimer();
        saveState();

        // Přehrát alarm
        alarmSound.currentTime = 0;
        alarmSound.play().catch(() => {});

        alarmMsg.textContent = "Opustil jsi aplikaci! Baterka -30 s. Zadej kód 'asd' pro reset.";
      }
    }
  }
});

// Blokování gesta pro stažení lišty a scroll
window.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });

// Zabránit zoomování (pinch zoom)
window.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});

// Při startu načti stav
window.addEventListener('load', () => {
  loadState();
  updateTimer();
});
