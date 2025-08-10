import { loadCodesDB, isValidCode, processCode } from './codes.js';
import { renderHistory, setStatus, updateResourcesPanel } from './console.js';
import { loadResources, resetResources, addBattery } from './resources.js';
import { resetHistory } from './history.js';
import { activate as flashlightOn, deactivate as flashlightOff, getTimeLeft } from './src/mechanics/flashlight.js';

const form = document.getElementById('code-form');
const input = document.getElementById('code-input');
const flashlightBtn = document.getElementById('tool-flashlight');
const batteryReplaceBtn = document.getElementById('battery-replace');
let flashlightActive = false;

// Kódy
form.addEventListener('submit', e => {
  e.preventDefault();
  const code = input.value.trim().toUpperCase();

  if (!code) {
    setStatus('Zadej kód!');
    return;
  }

  if (code === 'AZ4658') {
    // Reset všeho v localStorage včetně svítilny
    localStorage.clear();
    resetResources();
    resetHistory();
    renderHistory();
    updateResourcesPanel();
    if (flashlightActive) {
      flashlightOff();
      flashlightActive = false;
      if (flashlightBtn) flashlightBtn.classList.remove('active');
    }
    if (batteryReplaceBtn) batteryReplaceBtn.style.display = 'none';
    setStatus('Lokální paměť byla vymazána.');
    input.value = '';
    return;
  }

  if (!isValidCode(code)) {
    setStatus('Neplatný kód.');
    input.value = '';
    return;
  }

  if (processCode(code)) {
    input.value = '';
  } else {
    input.value = '';
  }
  input.focus();
});

// Svítilna
function showBatteryReplaceButton() {
  if (batteryReplaceBtn) batteryReplaceBtn.style.display = 'block';
}
function hideBatteryReplaceButton() {
  if (batteryReplaceBtn) batteryReplaceBtn.style.display = 'none';
}

if (flashlightBtn) {
  let timeLeft = Number(localStorage.getItem("flashlightTimeLeft")); 
  if (timeLeft > 0) {
    flashlightBtn.addEventListener('click', () => {
      if (flashlightActive) {
        flashlightOff();
        flashlightActive = false;
        flashlightBtn.classList.remove('active');
        hideBatteryReplaceButton();
      } else {
        flashlightOn(0, () => { // Výchozí čas svítilny
          flashlightActive = false;
          flashlightBtn.classList.remove('active');
          showBatteryReplaceButton();
        });
        flashlightActive = true;
        flashlightBtn.classList.add('active');
      }
    });
  }
  setStatus(`Svítilna zbývá: ${getTimeLeft()} s`);
  showBatteryReplaceButton();
}

// Handler pro tlačítko výměny baterie
if (batteryReplaceBtn) {
  batteryReplaceBtn.addEventListener('click', () => {
    const batterySpan = document.getElementById('res-b');
    let count = parseInt(batterySpan.textContent, 10);
    if (count > 0) {
      addBattery(-1);
      updateResourcesPanel();
      hideBatteryReplaceButton();
      flashlightBtn.classList.add('active');
      flashlightActive = true;
      flashlightOn(30, () => { // Po výměně 30 sekund
        flashlightActive = false;
        flashlightBtn.classList.remove('active');
        showBatteryReplaceButton();
      });
      setStatus('Baterie vyměněna. Svítilna opět svítí.');
    } else {
      setStatus('Nemáš žádné baterie!');
    }
  });
}

(async () => {
  await loadCodesDB();
  loadResources();
  renderHistory();
  updateResourcesPanel();
  input.focus();
})();
