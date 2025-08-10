import { activate as flashlightOn, deactivate as flashlightOff, getTimeLeft } from './src/mechanics/flashlight.js';

// ... ostatní importy a kód ...

const flashlightBtn = document.getElementById('tool-flashlight');
const batteryReplaceBtn = document.getElementById('battery-replace');
let flashlightActive = false;

function showBatteryReplaceButton() {
  batteryReplaceBtn.style.display = 'block';
}

function hideBatteryReplaceButton() {
  batteryReplaceBtn.style.display = 'none';
}

if (flashlightBtn) {
  flashlightBtn.addEventListener('click', () => {
    if (flashlightActive) {
      flashlightOff();
      flashlightActive = false;
      flashlightBtn.classList.remove('active');
      hideBatteryReplaceButton();
    } else {
      // Předáme callback pro vybití
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
batteryReplaceBtn.addEventListener('click', () => {
  // Odečíst baterii
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
