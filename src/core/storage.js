export function loadJSON(key, def = {}) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
  } catch {
    return def;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load(key, def) {
  const val = localStorage.getItem(key);
  return val !== null ? Number(val) : def;
}

export function save(key, value) {
  localStorage.setItem(key, String(value));
}
