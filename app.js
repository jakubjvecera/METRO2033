import { loadCodesDB, isValidCode, processCode } from './codes.js';
import { renderHistory, setStatus, updateResourcesPanel } from './console.js';
import { loadResources, resetResources } from './resources.js';
import { resetHistory } from './history.js';
import { activate as flashlightOn, deactivate as flashlightOff, getTimeLeft } from './src/mechanics/flashlight.js';

const form = document.getElementById('code-form');
const input = document.getElementById('code-input');
const flashlightBtn = document.getElementById('tool-flashlight');
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
if (flashlightBtn) {
  flashlightBtn.addEventListener('click', () => {
    if (flashlightActive) {
      flashlightOff();
      flashlightActive = false;
      flashlightBtn.classList.remove('active');
    } else {
      flashlightOn();
      flashlightActive = true;
      flashlightBtn.classList.add('active');
    }
    // Pro testování: zobraz aktuální čas svítilny
    setStatus(`Svítilna zbývá: ${getTimeLeft()} s`);
  });
}

(async () => {
  await loadCodesDB();
  loadResources();
  renderHistory();
  updateResourcesPanel();
  input.focus();
})();
