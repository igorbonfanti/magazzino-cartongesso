/**
 * La bozza del wizard: quello che l'operatore sta compilando, cosi' come lo
 * digita. Le misure restano testo finche' non vanno al motore, altrimenti
 * scrivere "4," per arrivare a "4,32" cancellerebbe la virgola.
 *
 * Funzioni pure: la conversione verso le Scelte del motore e' testata.
 */
import { PRESTAZIONI, PROFILI_PER_AMBITO, SISTEMI, SISTEMI_PER_AMBITO } from '../data/sistemi';
import { SFRIDO_DEFAULT } from '../engine';
import { OPERE, operaInfo } from '../selettore';
import type {
  Ambiente, Ambito, Campitura, Disponibilita, Interasse, InterasseSiniat, Modalita, Opera, Prestazione, Profilo, Requisiti, Scelte,
  SistemaId,
} from '../types';

export interface AperturaBozza {
  id: string;
  l: string;
  h: string;
  n: string;
}

export interface CampituraBozza {
  id: string;
  modo: 'mq' | 'LxH';
  mq: string;
  l: string;
  h: string;
  aperture: AperturaBozza[];
}

/** I requisiti come li compila l'operatore: l'altezza resta testo, come le misure. */
export interface RequisitiBozza {
  /** minuti, 0 = nessuna */
  fuoco: number;
  /** dB, 0 = nessuno */
  rw: number;
  altezza: string;
  ambiente: Ambiente;
  urti: boolean;
  carichi: boolean;
  antieffrazione: boolean;
}

/**
 * La soluzione scelta: una del catalogo Siniat (con l'orditura scelta a mano,
 * se l'operatore l'ha cambiata) oppure il calcolo classico Excel/Fassa.
 */
export type SoluzioneBozza =
  | { tipo: 'certificata' | 'sistema'; id: string; varianteId?: string; interasse?: InterasseSiniat }
  | { tipo: 'classico' };

export interface Bozza {
  opera: Opera | null;
  requisiti: RequisitiBozza;
  /** quali soluzioni mostrare: a magazzino (di partenza), su ordinazione o tutte */
  disponibilita: Disponibilita;
  soluzione: SoluzioneBozza | null;
  /** flusso classico: ambito e sottotipo delle nove distinte storiche */
  ambito: Ambito | null;
  sistemaId: SistemaId | null;
  prestazione: Prestazione;
  interasse: Interasse;
  profilo: Profilo;
  isolante: boolean;
  /** percentuali intere, come testo digitato */
  sfridoLastre: string;
  sfridoIsolante: string;
  modalita: Modalita;
  campiture: CampituraBozza[];
}

let contatore = 0;
/** ID locale per le chiavi React: non finisce mai su Firestore. */
export function nuovoId(): string {
  contatore += 1;
  return `${Date.now().toString(36)}-${contatore}`;
}

export function campituraVuota(): CampituraBozza {
  return { id: nuovoId(), modo: 'LxH', mq: '', l: '', h: '', aperture: [] };
}

export function aperturaVuota(): AperturaBozza {
  return { id: nuovoId(), l: '', h: '', n: '1' };
}

export function requisitiVuoti(): RequisitiBozza {
  return { fuoco: 0, rw: 0, altezza: '', ambiente: 'normale', urti: false, carichi: false, antieffrazione: false };
}

export function bozzaVuota(): Bozza {
  return {
    opera: null,
    requisiti: requisitiVuoti(),
    disponibilita: 'magazzino',
    soluzione: null,
    ambito: null,
    sistemaId: null,
    prestazione: 'standard',
    interasse: 60,
    profilo: 75,
    isolante: true,
    sfridoLastre: String(SFRIDO_DEFAULT.lastre),
    sfridoIsolante: String(SFRIDO_DEFAULT.isolante),
    modalita: 'classica',
    campiture: [campituraVuota()],
  };
}

/** Le opere che hanno anche il calcolo classico (le nove distinte storiche). */
const AMBITO_DA_OPERA: Partial<Record<Opera, Ambito>> = {
  parete: 'parete',
  controparete: 'controparete',
  controsoffitto: 'controsoffitto',
};

export function ambitoClassico(opera: Opera | null): Ambito | null {
  return (opera && AMBITO_DA_OPERA[opera]) ?? null;
}

/** Cambiando opera si riparte dalla scelta della soluzione; i requisiti restano. */
export function conOpera(b: Bozza, opera: Opera): Bozza {
  if (b.opera === opera) return b;
  const ambito = ambitoClassico(opera);
  const base = ambito ? conAmbito(b, ambito) : { ...b, ambito: null, sistemaId: null };
  return { ...base, opera, soluzione: null };
}

/** I requisiti per il selettore; l'altezza conta solo per le opere verticali. */
export function requisitiPerSelettore(b: Bozza): Requisiti | null {
  if (!b.opera) return null;
  const r = b.requisiti;
  const altezza = operaInfo(b.opera).altezza ? leggiNumero(r.altezza) ?? 0 : 0;
  return { opera: b.opera, fuoco: r.fuoco, rw: r.rw, altezza, ambiente: r.ambiente, urti: r.urti, carichi: r.carichi, antieffrazione: r.antieffrazione };
}

/** Cambiando ambito si riparte dal sottotipo, e il profilo torna quello tipico. */
export function conAmbito(b: Bozza, ambito: Ambito): Bozza {
  if (b.ambito === ambito) return b;
  const profili = PROFILI_PER_AMBITO[ambito];
  return {
    ...b,
    ambito,
    sistemaId: null,
    profilo: profili.includes(b.profilo) ? b.profilo : profili[0]!,
  };
}

/**
 * Numero digitato all'italiana: "4,32", "4.32", "1.234,5". null se vuoto o
 * non valido. Il punto e' separatore delle migliaia solo se c'e' anche la
 * virgola, altrimenti e' il decimale (sulla tastiera numerica del telefono
 * spesso c'e' solo quello).
 */
export function leggiNumero(testo: string): number | null {
  let s = testo.trim().replace(/\s/g, '');
  if (s === '') return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s) && !/^\.\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Una campitura della bozza nel formato del motore; null se incompleta. */
export function campituraPerMotore(c: CampituraBozza): Campitura | null {
  const aperture = c.aperture.flatMap((a) => {
    const l = leggiNumero(a.l);
    const h = leggiNumero(a.h);
    const n = leggiNumero(a.n) ?? 1;
    return l && h && n > 0 ? [{ l, h, n: Math.trunc(n) }] : [];
  });
  if (c.modo === 'mq') {
    const mq = leggiNumero(c.mq);
    return mq ? { modo: 'mq', mq, aperture } : null;
  }
  const l = leggiNumero(c.l);
  const h = leggiNumero(c.h);
  return l && h ? { modo: 'LxH', l, h, aperture } : null;
}

/** Sfrido digitato → percentuale intera fra 0 e 100. */
function sfrido(testo: string): number {
  const n = leggiNumero(testo);
  return n === null ? 0 : Math.min(100, Math.round(n));
}

export function sfridoPerMotore(b: Bozza): { lastre: number; isolante: number } {
  return { lastre: sfrido(b.sfridoLastre), isolante: sfrido(b.sfridoIsolante) };
}

/** Le campiture complete, nel formato del motore. */
export function campiturePerMotore(b: Bozza): Campitura[] {
  return b.campiture.flatMap((c) => {
    const m = campituraPerMotore(c);
    return m ? [m] : [];
  });
}

/** Le scelte per il motore, o null finche' manca il sistema. */
export function sceltePerMotore(b: Bozza): Scelte | null {
  if (!b.sistemaId) return null;
  const ambito = SISTEMI[b.sistemaId].ambito;
  const profili = PROFILI_PER_AMBITO[ambito];
  return {
    sistemaId: b.sistemaId,
    prestazione: b.prestazione,
    interasse: b.interasse,
    profilo: profili.includes(b.profilo) ? b.profilo : profili[0]!,
    isolante: b.isolante || PRESTAZIONI[b.prestazione].lanaObbligatoria,
    sfrido: sfridoPerMotore(b),
    modalita: b.modalita,
    campiture: campiturePerMotore(b),
  };
}

const AMBIENTI: Ambiente[] = ['normale', 'umido', 'bagnato', 'esterno'];

function requisitiValidi(x: unknown): x is RequisitiBozza {
  if (!x || typeof x !== 'object') return false;
  const r = x as Partial<RequisitiBozza>;
  return (
    typeof r.fuoco === 'number' && typeof r.rw === 'number' && typeof r.altezza === 'string' &&
    AMBIENTI.includes(r.ambiente as Ambiente) &&
    typeof r.urti === 'boolean' && typeof r.carichi === 'boolean' && typeof r.antieffrazione === 'boolean'
  );
}

function soluzioneValida(x: unknown): x is SoluzioneBozza | null {
  if (x === null) return true;
  if (!x || typeof x !== 'object') return false;
  const s = x as { tipo?: unknown; id?: unknown };
  return s.tipo === 'classico' || ((s.tipo === 'certificata' || s.tipo === 'sistema') && typeof s.id === 'string');
}

/**
 * Bozza riletta da localStorage: si tiene solo se ha la forma giusta, per non
 * rompere la pagina con un salvataggio di una versione precedente. Opera,
 * requisiti e soluzione, se ci sono, devono essere validi anche loro.
 */
export function bozzaValida(x: unknown): x is Bozza {
  if (!x || typeof x !== 'object') return false;
  const b = x as Partial<Bozza>;
  const ambitoOk = b.ambito === null || (typeof b.ambito === 'string' && b.ambito in SISTEMI_PER_AMBITO);
  const sistemaOk = b.sistemaId === null || (typeof b.sistemaId === 'string' && b.sistemaId in SISTEMI);
  const operaOk = b.opera === undefined || b.opera === null || OPERE.some((o) => o.id === b.opera);
  const requisitiOk = b.requisiti === undefined || requisitiValidi(b.requisiti);
  const soluzioneOk = b.soluzione === undefined || soluzioneValida(b.soluzione);
  const disponibilitaOk = b.disponibilita === undefined || ['magazzino', 'ordine', 'tutte'].includes(b.disponibilita);
  return (
    ambitoOk &&
    sistemaOk &&
    operaOk &&
    requisitiOk &&
    soluzioneOk &&
    disponibilitaOk &&
    typeof b.prestazione === 'string' &&
    b.prestazione in PRESTAZIONI &&
    Array.isArray(b.campiture) &&
    b.campiture.every((c) => c && typeof c === 'object' && Array.isArray((c as CampituraBozza).aperture))
  );
}

/**
 * Una bozza salvata, completata dove manca: quelle della versione senza
 * selettore Siniat ripartono dal calcolo classico con l'ambito che avevano.
 * null se non è una bozza.
 */
export function leggiBozza(x: unknown): Bozza | null {
  if (!bozzaValida(x)) return null;
  const b: Partial<Bozza> & Bozza = x;
  // senza selettore Siniat (prima versione) si riparte dal calcolo classico
  const primaVersione = b.opera === undefined;
  return {
    ...b,
    opera: primaVersione ? b.ambito ?? null : b.opera,
    requisiti: b.requisiti ?? requisitiVuoti(),
    disponibilita: b.disponibilita ?? 'magazzino',
    soluzione: b.soluzione !== undefined ? b.soluzione : b.ambito ? { tipo: 'classico' } : null,
  };
}
