export function renderHistory() {
  const list = loadHistory();
  hist.innerHTML = '';
  if(list.length === 0){
    const li = document.createElement('li');
    li.textContent = '(Žádné kódy)';
    li.style.color = '#9a9a9a';
    hist.appendChild(li);
    return;
  }
  list.slice().reverse().forEach(item=>{
    const li = document.createElement('li');
    const time = new Date(item.t).toLocaleTimeString();
    li.textContent = `${item.code} — ${time}`;
    hist.appendChild(li);
  });
}

export function setStatus(text) {
  statusMsg.textContent = text;
}

export function updateResourcesPanel() {
  const { batteryCount, filterCount, waterCount } = getResources();
  resB.textContent = batteryCount;
  resF.textContent = filterCount;
  resW.textContent = waterCount;
}