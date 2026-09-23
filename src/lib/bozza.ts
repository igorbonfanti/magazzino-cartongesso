/**
 * La bozza del wizard: quello che l'operatore sta compilando, cosi' come lo
 * digita. Le misure restano testo finche' non vanno al motore, altrimenti
 * scrivere "4," per arrivare a "4,32" cancellerebbe la virgola.
 *
 * Funzioni pure: la conversione verso le Scelte del motore e' testata.
 */
import { PRESTAZIONI, PROFILI_PER_AMBITO, SISTEMI, SISTEMI_PER_AMBITO } from '../data/sistemi';
import { SFRIDO_DEFAULT } from '../engine';
import type { Ambito, Campitura, Interasse, Modalita, Prestazione, Profilo, Scelte, SistemaId } from '../types';

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

export interface Bozza {
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

export function bozzaVuota(): Bozza {
  return {
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
    sfrido: { lastre: sfrido(b.sfridoLastre), isolante: sfrido(b.sfridoIsolante) },
    modalita: b.modalita,
    campiture: b.campiture.flatMap((c) => {
      const m = campituraPerMotore(c);
      return m ? [m] : [];
    }),
  };
}

/**
 * Bozza riletta da localStorage: si tiene solo se ha la forma giusta, per non
 * rompere la pagina con un salvataggio di una versione precedente.
 */
export function bozzaValida(x: unknown): x is Bozza {
  if (!x || typeof x !== 'object') return false;
  const b = x as Partial<Bozza>;
  const ambitoOk = b.ambito === null || (typeof b.ambito === 'string' && b.ambito in SISTEMI_PER_AMBITO);
  const sistemaOk = b.sistemaId === null || (typeof b.sistemaId === 'string' && b.sistemaId in SISTEMI);
  return (
    ambitoOk &&
    sistemaOk &&
    typeof b.prestazione === 'string' &&
    b.prestazione in PRESTAZIONI &&
    Array.isArray(b.campiture) &&
    b.campiture.every((c) => c && typeof c === 'object' && Array.isArray((c as CampituraBozza).aperture))
  );
}
