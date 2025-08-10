import { loadCodesDB, isValidCode, processCode } from './codes.js';
import { renderHistory, setStatus, updateResourcesPanel } from './console.js';
import { loadResources, resetResources } from './resources.js';
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

  if(!code){
    setStatus('Zadej kód!');
    return;
  }

  if(code === 'AZ4658'){
    if(confirm('Opravdu chceš vymazat celou lokální paměť? Tato akce je nevratná.')){
      localStorage.clear();
      resetResources();
      resetHistory();
      renderHistory();
      updateResourcesPanel();
      setStatus('Lokální paměť byla vymazána.');
    } else {
      setStatus('Vymazání zrušeno.');
    }
    input.value = '';
    return;
  }

  if(!isValidCode(code)){
    setStatus('Neplatný kód.');
    input.value = '';
    return;
  }

  if(processCode(code)){
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
  flashlightBtn.addEventListener('click', () => {
    if (flashlightActive) {
      flashlightOff();
      flashlightActive = false;
      flashlightBtn.classList.remove('active');
      hideBatteryReplaceButton();
    } else {
      flashlightOn(60, () => {
        flashlightActive = false;
        flashlightBtn.classList.remove('active');
        showBatteryReplaceButton();
      });
      flashlightActive = true;
      flashlightBtn.classList.add('active');
    }
    setStatus(`Svítilna zbývá: ${getTimeLeft()} s`);
  });
}

// Handler pro tlačítko výměny baterie
if (batteryReplaceBtn) {
  batteryReplaceBtn.addEventListener('click', () => {
    const batterySpan = document.getElementById('res-b');
    let count = parseInt(batterySpan.textContent, 10);
    if (count > 0) {
      batterySpan.textContent = count - 1;
      hideBatteryReplaceButton();
      flashlightBtn.classList.add('active');
      flashlightActive = true;
      // Znovu zapnout svítilnu, např. na 30 sekund
      flashlightOn(30, () => {
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
