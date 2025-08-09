let timer = null;
let timeLeft = 0;

export function activate(duration = 60, onDeplete) {
  timeLeft = duration;
  document.getElementById('flashlight-overlay').classList.add('active');
  timer = setInterval(() => {
    timeLeft--;
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
}