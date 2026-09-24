/**
 * I preventivi su Firestore: cgp_preventivi, un documento per numero
 * (PCG-2026-0001); il contatore dell'anno in cgp_contatori/{anno}; le
 * impostazioni in cgp_impostazioni/preventivo.
 *
 * Il numero si prende e il preventivo si scrive nella stessa transazione: se
 * il salvataggio non riesce, il numero non si consuma. Un preventivo salvato
 * non si modifica: si duplica.
 */
import {
  collection, doc, getDoc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, setDoc, startAfter,
} from 'firebase/firestore';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { COLL, auth } from './firebase';
import { db } from './firebaseDati';
import { ID_IMPOSTAZIONI, impostazioniValide } from './impostazioni';
import type { ImpostazioniPreventivo } from './impostazioni';
import { numeroPreventivo, preventivoValido, testoRicerca } from '../preventivo';
import type { DatiPreventivo, PreventivoSalvato } from '../preventivo';

const quando = (x: unknown): string | null => (x as { toDate?: () => Date } | undefined)?.toDate?.().toISOString() ?? null;

/** Firestore non accetta undefined: si tolgono, e con loro qualunque cosa non sia un dato semplice. */
function soloDati<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export async function leggiImpostazioni(): Promise<ImpostazioniPreventivo> {
  try {
    const s = await getDoc(doc(db, COLL.impostazioni, ID_IMPOSTAZIONI));
    return impostazioniValide(s.exists() ? s.data() : null);
  } catch {
    return impostazioniValide(null);
  }
}

export async function salvaImpostazioni(i: ImpostazioniPreventivo): Promise<void> {
  await setDoc(doc(db, COLL.impostazioni, ID_IMPOSTAZIONI), {
    iban: i.iban, ivaBp: i.ivaBp, aggiornatoDa: auth.currentUser?.email ?? '', aggiornatoIl: serverTimestamp(),
  });
}

/** Salva con il prossimo numero dell'anno della data del preventivo; restituisce il numero. */
export async function salvaPreventivo(dati: DatiPreventivo): Promise<string> {
  const anno = Number(dati.data.slice(0, 4));
  const pulito = soloDati(dati);
  return runTransaction(db, async (t) => {
    const rifContatore = doc(db, COLL.contatori, String(anno));
    const contatore = await t.get(rifContatore);
    const ultimo: unknown = contatore.exists() ? contatore.data().valore : 0;
    if (typeof ultimo !== 'number' || !Number.isInteger(ultimo) || ultimo < 0) throw new Error(`Il contatore ${anno} non è valido.`);
    const progressivo = ultimo + 1;
    const numero = numeroPreventivo(anno, progressivo);
    const rif = doc(db, COLL.preventivi, numero);
    if ((await t.get(rif)).exists()) throw new Error(`${numero} esiste già: il contatore ${anno} va controllato.`);
    t.set(rifContatore, { valore: progressivo, aggiornatoIl: serverTimestamp() });
    t.set(rif, { ...pulito, numero, anno, progressivo, cerca: testoRicerca(numero, dati.cliente), creatoIl: serverTimestamp() });
    return numero;
  });
}

export async function leggiPreventivo(numero: string): Promise<PreventivoSalvato | null> {
  const s = await getDoc(doc(db, COLL.preventivi, numero));
  if (!s.exists()) return null;
  const d = s.data();
  return preventivoValido(s.id, d, quando(d.creatoIl));
}

export interface PaginaPreventivi {
  preventivi: PreventivoSalvato[];
  /** da passare per la pagina dopo; null se non ce ne sono altri */
  cursore: QueryDocumentSnapshot | null;
  /** documenti che non si sono potuti leggere */
  scartati: number;
}

/** I preventivi dal più recente, a pagine. */
export async function elencoPreventivi(dopo: QueryDocumentSnapshot | null = null, quanti = 30): Promise<PaginaPreventivi> {
  const q = dopo
    ? query(collection(db, COLL.preventivi), orderBy('creatoIl', 'desc'), startAfter(dopo), limit(quanti))
    : query(collection(db, COLL.preventivi), orderBy('creatoIl', 'desc'), limit(quanti));
  const s = await getDocs(q);
  const letti = s.docs.map((d) => preventivoValido(d.id, d.data(), quando(d.data().creatoIl)));
  const preventivi = letti.filter((p): p is PreventivoSalvato => !!p);
  return { preventivi, cursore: s.docs.length === quanti ? s.docs[s.docs.length - 1]! : null, scartati: letti.length - preventivi.length };
}

export function messaggioErrore(e: unknown): string {
  const codice = (e as { code?: string })?.code ?? '';
  if (codice === 'permission-denied') return 'Firestore non concede l’operazione: serve un utente autorizzato e le regole cgp_* pubblicate.';
  if (codice === 'unavailable') return 'Rete assente: Firestore non raggiungibile.';
  if (codice === 'failed-precondition') return 'Operazione non riuscita (indice o transazione): riprova.';
  return e instanceof Error ? e.message : 'Operazione non riuscita.';
}
