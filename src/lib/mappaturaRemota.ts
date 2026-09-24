/**
 * La mappatura su Firestore: cgp_mapping, un documento per chiave.
 * Letta tutta all'accesso (sono poche decine di voci) e tenuta anche in copia
 * locale, per lavorare senza rete.
 */
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { COLL, auth } from './firebase';
import { db } from './firebaseDati';
import { leggiArchivio, scriviArchivio } from './archivio';
import { chiaveValida, mappaturaValida } from './mappatura';
import type { Mappatura } from './mappatura';

const CHIAVE_COPIA = 'mappature';

export interface EsitoMappature {
  mappature: Map<string, Mappatura>;
  /** si lavora con la copia locale perché Firestore non ha risposto */
  errore?: string;
}

export async function leggiMappature(): Promise<EsitoMappature> {
  try {
    const istantanea = await getDocs(collection(db, COLL.mapping));
    const mappature = new Map<string, Mappatura>();
    istantanea.forEach((d) => {
      const dati = d.data();
      const quando = dati.aggiornatoIl?.toDate?.() as Date | undefined;
      const m = mappaturaValida(d.id, { ...dati, aggiornatoIl: quando?.toISOString() });
      if (m) mappature.set(d.id, m);
    });
    await scriviArchivio(CHIAVE_COPIA, [...mappature.values()]);
    return { mappature };
  } catch (e) {
    const copia = (await leggiArchivio<Mappatura[]>(CHIAVE_COPIA)) ?? [];
    return { mappature: new Map(copia.map((m) => [m.chiave, m])), errore: messaggioErroreFirestore(e) };
  }
}

export async function salvaMappatura(
  m: Pick<Mappatura, 'chiave' | 'codice' | 'prezzoPer' | 'scontoExtraBp' | 'contenuto' | 'confezione'>,
): Promise<void> {
  if (!chiaveValida(m.chiave)) throw new Error(`Chiave non valida: ${m.chiave}`);
  if (!m.codice.trim()) throw new Error('Manca il codice di listino.');
  await setDoc(doc(db, COLL.mapping, m.chiave), {
    chiave: m.chiave,
    codice: m.codice.trim(),
    prezzoPer: m.prezzoPer,
    ...(m.contenuto ? { contenuto: m.contenuto } : {}),
    ...(m.confezione ? { confezione: m.confezione } : {}),
    ...(m.scontoExtraBp ? { scontoExtraBp: m.scontoExtraBp } : {}),
    aggiornatoDa: auth.currentUser?.email ?? '',
    aggiornatoIl: serverTimestamp(),
  });
}

/** Toglie la mappatura salvata: la chiave torna a quella di partenza, o da mappare. */
export async function togliMappatura(chiave: string): Promise<void> {
  await deleteDoc(doc(db, COLL.mapping, chiave));
}

export function messaggioErroreFirestore(e: unknown): string {
  const codice = (e as { code?: string })?.code ?? '';
  if (codice === 'permission-denied') {
    return 'Firestore non concede cgp_mapping: vanno pubblicate le regole cgp_* (docs/regole-firestore-cgp.md).';
  }
  if (codice === 'unavailable') return 'Rete assente: Firestore non raggiungibile.';
  return e instanceof Error ? e.message : 'Operazione non riuscita.';
}
