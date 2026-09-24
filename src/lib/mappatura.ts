/**
 * Mappatura: dall'articolo generico della distinta (LASTRA_BA13_STD,
 * GUIDA_75, VITI_S_TEX_32_MM…) al codice del listino del magazzino.
 *
 * Sta in cgp_mapping, un documento per chiave. Dove non c'è, vale la
 * mappatura di partenza di mapping_seed.ts (i codici già usati nei
 * preventivi). Le chiavi senza né l'una né l'altra restano "da mappare": il
 * codice non si inventa.
 */
import { MAPPING_SEED } from '../data/mapping_seed';
import { confezioneDaDescrizione } from './listino';

export interface Mappatura {
  chiave: string;
  /** codice del listino */
  codice: string;
  /**
   * A cosa si riferisce il prezzo di listino: alla confezione della distinta
   * (lastra, barra, conf.) o all'unità di misura (m², ml, kg, pz). Una lastra
   * a listino "al m²" si vende a lastre ma si paga 2,4 m² l'una.
   */
  prezzoPer: 'confezione' | 'um';
  /**
   * Quanto contiene un articolo del listino, nell'unità della voce: il rotolo
   * MICRO da 23 ml, il BIACAR5 da 20 ml, la lastra da 2,4 m². L'articolo non si
   * divide: "Da ordinare" diventa il numero di articoli. Se manca, vale la
   * confezione della voce.
   */
  contenuto?: number;
  /** come si chiama l'articolo che si vende: rotolo, lastra, sacco, scatola… */
  confezione?: string;
  /** sconto extra di partenza del venditore, in punti base (sconto 2, Fase 4) */
  scontoExtraBp?: number;
  /** chi l'ha salvata e quando, per l'elenco */
  aggiornatoDa?: string;
  aggiornatoIl?: string;
}

export type OrigineMappatura = 'archivio' | 'partenza';

export interface MappaturaRisolta extends Mappatura {
  origine: OrigineMappatura;
}

/** La mappatura di una chiave: quella salvata, altrimenti quella di partenza; undefined se da mappare. */
export function mappaturaPer(chiave: string, salvate: ReadonlyMap<string, Mappatura>): MappaturaRisolta | undefined {
  const s = salvate.get(chiave);
  if (s) return { ...s, origine: 'archivio' };
  const p = MAPPING_SEED[chiave];
  return p ? { chiave, codice: p.codice, prezzoPer: 'confezione', origine: 'partenza' } : undefined;
}

/** Un documento letto da cgp_mapping, controllato: null se non ha la forma giusta. */
export function mappaturaValida(chiave: string, dati: unknown): Mappatura | null {
  if (!dati || typeof dati !== 'object') return null;
  const d = dati as Record<string, unknown>;
  if (typeof d.codice !== 'string' || !d.codice.trim()) return null;
  const prezzoPer = d.prezzoPer === 'um' ? 'um' : 'confezione';
  const extra = typeof d.scontoExtraBp === 'number' && Number.isInteger(d.scontoExtraBp) && d.scontoExtraBp >= 0 && d.scontoExtraBp <= 10000
    ? d.scontoExtraBp
    : undefined;
  const contenuto = typeof d.contenuto === 'number' && Number.isFinite(d.contenuto) && d.contenuto > 0 ? d.contenuto : undefined;
  const confezione = typeof d.confezione === 'string' && d.confezione.trim() ? d.confezione.trim().slice(0, 30) : undefined;
  return {
    chiave,
    codice: d.codice.trim(),
    prezzoPer,
    ...(contenuto !== undefined ? { contenuto } : {}),
    ...(confezione !== undefined ? { confezione } : {}),
    ...(extra !== undefined ? { scontoExtraBp: extra } : {}),
    ...(typeof d.aggiornatoDa === 'string' ? { aggiornatoDa: d.aggiornatoDa } : {}),
    ...(typeof d.aggiornatoIl === 'string' ? { aggiornatoIl: d.aggiornatoIl } : {}),
  };
}

/**
 * Le chiavi diventano ID di documenti: niente "/" (Firestore separa i
 * segmenti) e niente altro che lettere, cifre e trattino basso, come le
 * chiavi che l'app genera.
 */
export function chiaveValida(chiave: string): boolean {
  return /^[A-Z0-9_]{1,120}$/.test(chiave);
}

/**
 * La confezione che la descrizione dell'articolo propone, quando è diversa da
 * quella che la mappatura usa (la sua, o quella della voce se non la dice).
 * Serve a ritrovare le mappature salvate con una proposta sbagliata: guide e
 * montanti "a rotoli", lastre 3000×1200 o pannelli 1000×600 contati con la
 * misura della voce. null se coincidono o se la descrizione non dice niente;
 * una scelta diversa fatta apposta resta segnalata, ma non cambia niente.
 */
export function confezioneDaRivedere(
  voce: { um: 'mq' | 'ml' | 'kg' | 'pz'; contenuto: number; umConf: string },
  m: Pick<Mappatura, 'contenuto' | 'confezione'>,
  descrizione: string,
): { contenuto: number; confezione: string } | null {
  const p = confezioneDaDescrizione(descrizione, voce.um, voce.umConf);
  if (!p) return null;
  const contenuto = m.contenuto ?? voce.contenuto;
  const confezione = m.confezione ?? voce.umConf;
  return Math.abs(p.contenuto - contenuto) < 1e-9 && p.confezione === confezione ? null : p;
}
