// Templates live in this browser only (IndexedDB): they carry the signature and seal, so they're never uploaded.

export interface Template {
  id: string;
  name: string;
  hue: number; // index into the tab hues
  background: Uint8Array; // blank certificate, one A5 page
  thumb: string; // small PNG data URL for the tab
  addedAt: string;
}

const DB = "certificate-generator";
const STORE = "templates";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("This browser won't keep templates (private window?)."));
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export const listTemplates = async () =>
  (await run<Template[]>("readonly", (s) => s.getAll())).sort((a, b) => a.addedAt.localeCompare(b.addedAt));
export const saveTemplate = (t: Template) => run<IDBValidKey>("readwrite", (s) => s.put(t));
export const removeTemplate = (id: string) => run<undefined>("readwrite", (s) => s.delete(id));

/** Small per-browser conveniences (last template, batch details). Never required: storage can be blocked. */
export const prefs = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(`cg.${key}`);
      return v === null ? fallback : (JSON.parse(v) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(`cg.${key}`, JSON.stringify(value));
    } catch {
      /* storage blocked — the page works without it */
    }
  },
};
