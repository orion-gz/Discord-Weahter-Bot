import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'defaults.json');

function loadStore(): Record<string, string> {
  if (!fs.existsSync(STORE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, string>): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export function getDefaultCity(userId: string): string | null {
  return loadStore()[userId] ?? null;
}

export function setDefaultCity(userId: string, city: string): void {
  const store = loadStore();
  store[userId] = city;
  saveStore(store);
}
