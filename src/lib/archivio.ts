/**
 * Archivio locale chiave-valore in IndexedDB, per il listino.
 *
 * Non localStorage: tutte le app stanno su igorbonfanti.github.io e ne
 * dividono la quota (circa 5 MB), di cui il gestionale usa già una parte per
 * la sua copia del listino. IndexedDB ha spazio a parte, e il listino lo
 * rilegge anche senza rete, come chiede la specifica.
 */
const NOME_DB = 'cartongesso';
const STORE = 'archivio';

function apri(): Promise<IDBDatabase> {
  return new Promise((risolvi, rifiuta) => {
    const r = indexedDB.open(NOME_DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => risolvi(r.result);
    r.onerror = () => rifiuta(r.error);
  });
}

async function transazione<T>(modo: IDBTransactionMode, fai: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await apri();
  try {
    return await new Promise<T>((risolvi, rifiuta) => {
      const r = fai(db.transaction(STORE, modo).objectStore(STORE));
      r.onsuccess = () => risolvi(r.result as T);
      r.onerror = () => rifiuta(r.error);
    });
  } finally {
    db.close();
  }
}

/** Il valore salvato, undefined se non c'è o se IndexedDB non si apre (navigazione privata). */
export async function leggiArchivio<T>(chiave: string): Promise<T | undefined> {
  try {
    return await transazione<T | undefined>('readonly', (s) => s.get(chiave));
  } catch {
    return undefined;
  }
}

/** Salva; se non si può, l'app va avanti senza copia locale. */
export async function scriviArchivio(chiave: string, valore: unknown): Promise<void> {
  try {
    await transazione('readwrite', (s) => s.put(valore, chiave));
  } catch {
    /* senza archivio si riscarica al prossimo avvio */
  }
}
