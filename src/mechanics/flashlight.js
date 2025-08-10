import { save, load } from '../core/storage.js';

let timer = null;
let timeLeft = 60;
const LS_KEY = 'flashlightTimeLeft';

function updateDebug() {
  const debugEl = document.getElementById('flashlight-debug');
  if (debugEl) debugEl.textContent = `Zbývá času: ${timeLeft}s`;
}

export function activate(defaultDuration = 60, onDeplete) {
  // načti uložený čas nebo použij default
  timeLeft = load(LS_KEY, defaultDuration);
  document.getElementById('flashlight-overlay').classList.add('active');
  updateDebug();

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
  save(LS_KEY, timeLeft); // uloží aktuální hodnotu
  updateDebug();
}

export function getTimeLeft() {
  return load(LS_KEY, 60);
}
