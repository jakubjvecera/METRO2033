import { save, load } from '../core/storage.js';

let timer = null;
let timeLeft = 60;
const LS_KEY = 'flashlightTimeLeft';

function updateDebug() {
  const debugEl = document.getElementById('flashlight-debug');
  if (debugEl) debugEl.textContent = `Zbývá času: ${timeLeft}s`;
}

// Upravená aktivace: pokud není explicitně požadován nový čas, použije čas z úložiště
export function activate(defaultDuration = 60, onDeplete, forceNewTime = false) {
  if (forceNewTime) {
    timeLeft = defaultDuration;
  } else {
    const stored = load(LS_KEY, defaultDuration);
    timeLeft = (stored > 0) ? stored : defaultDuration;
  }
  save(LS_KEY, timeLeft);
  document.getElementById('flashlight-overlay').classList.add('active');
  updateDebug();

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    save(LS_KEY, timeLeft);
    updateDebug();
    if (timeLeft <= 10) {
      document.getElementById('flashlight-overlay').classList.add('dim');
    }
    if (timeLeft <= 0) {
      deactivate();
      if (onDeplete) onDeplete();
    }
  }, 1000);
}

export function deactivate() {
  clearInterval(timer);
  timer = null;
  document.getElementById('flashlight-overlay').classList.remove('active', 'dim');
  save(LS_KEY, timeLeft);
  updateDebug();
}

export function getTimeLeft() {
  return load(LS_KEY, 60);
}
