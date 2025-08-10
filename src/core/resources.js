import { loadJSON, saveJSON } from './storage.js';

const STORAGE_KEY = 'metro_resources_v1';

let batteryCount = 3; // Začínáme třeba se třemi bateriemi
let filterCount = 0;
let waterCount = 0;

export function loadResources() {
  const r = loadJSON(STORAGE_KEY, { b: batteryCount, f: filterCount, w: waterCount });
  batteryCount = r.b;
  filterCount = r.f;
  waterCount = r.w;
}

export function saveResources() {
  saveJSON(STORAGE_KEY, { b: batteryCount, f: filterCount, w: waterCount });
}

export function addBattery(amount) {
  batteryCount += amount;
  saveResources();
}

export function addFilter(amount) {
  filterCount += amount;
  saveResources();
}

export function addWater(amount) {
  waterCount += amount;
  saveResources();
}

export function getResources() {
  return { batteryCount, filterCount, waterCount };
}

export function dBattery(amount) {
  batteryCount = Math.max(0, batteryCount - amount);
  saveResources();
}

export function getBattery() {
  return batteryCount;
}

export function getFilter() {
  return filterCount;
}

export function getWater() {
  return waterCount;
}

export function resetResources() {
  batteryCount = 3;
  filterCount = 0;
  waterCount = 0;
  saveResources();
}
