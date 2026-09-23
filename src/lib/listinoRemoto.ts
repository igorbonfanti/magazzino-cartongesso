/**
 * Scaricamento del listino da Firebase Storage, con la copia locale.
 *
 * Come il gestionale: si guarda la data di modifica del file (metadata
 * "updated") e si riscarica solo se è cambiata. In più, come chiede la
 * specifica, la copia locale vale 24 ore senza nemmeno chiedere, e si può
 * forzare l'aggiornamento. Senza rete si usa la copia che c'è.
 */
import { getDownloadURL, getMetadata, ref } from 'firebase/storage';
import { FILE_LISTINO } from './firebase';
import { storage } from './firebaseDati';
import { leggiArchivio, scriviArchivio } from './archivio';
import { leggiRigheListino } from './listino';
import type { Listino } from './listino';

const CHIAVE = 'listino';
const VALIDITA_MS = 24 * 60 * 60 * 1000;

export interface EsitoListino {
  listino: Listino;
  /** "rete" se appena scaricato, "copia" se dalla copia locale */
  fonte: 'rete' | 'copia';
  /** la copia locale è stata usata perché la rete non ha risposto */
  errore?: string;
}

export async function caricaListino(opzioni: { forza?: boolean } = {}): Promise<EsitoListino> {
  const copia = await leggiArchivio<Listino>(CHIAVE);
  const fresca = copia && Date.now() - Date.parse(copia.verificato) < VALIDITA_MS;
  if (copia && fresca && !opzioni.forza) return { listino: copia, fonte: 'copia' };

  try {
    const rif = ref(storage, FILE_LISTINO);
    const meta = await getMetadata(rif);
    const adesso = new Date().toISOString();
    if (copia && copia.aggiornato === meta.updated) {
      const listino = { ...copia, verificato: adesso };
      await scriviArchivio(CHIAVE, listino);
      return { listino, fonte: 'copia' };
    }
    const risposta = await fetch(await getDownloadURL(rif));
    if (!risposta.ok) throw new Error(`scaricamento non riuscito (${risposta.status})`);
    const dati = await risposta.arrayBuffer();
    // SheetJS si carica solo qui: pesa, e serve una volta al giorno
    const XLSX = await import('xlsx');
    const libro = XLSX.read(dati, { type: 'array' });
    const foglio = libro.Sheets[libro.SheetNames[0]!]!;
    const righe = XLSX.utils.sheet_to_json<unknown[]>(foglio, { header: 1 });
    const listino: Listino = { aggiornato: meta.updated, verificato: adesso, articoli: leggiRigheListino(righe) };
    await scriviArchivio(CHIAVE, listino);
    return { listino, fonte: 'rete' };
  } catch (e) {
    const errore = messaggioErroreListino(e);
    if (copia) return { listino: copia, fonte: 'copia', errore };
    throw new Error(errore);
  }
}

/** Traduce gli errori di Storage in messaggi per l'operatore. */
export function messaggioErroreListino(e: unknown): string {
  const codice = (e as { code?: string })?.code ?? '';
  if (codice === 'storage/unauthorized') return 'Il listino non è accessibile con questo utente.';
  if (codice === 'storage/object-not-found') return 'listino.xlsx non c’è su Firebase Storage.';
  if (codice === 'storage/retry-limit-exceeded' || /network|fetch/i.test(String(e))) return 'Rete assente: listino non raggiungibile.';
  return e instanceof Error ? e.message : 'Listino non caricato.';
}
