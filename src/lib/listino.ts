/**
 * Il listino del magazzino: listino.xlsx su Firebase Storage, lo stesso file
 * di magazzino-gestionale. Qui la lettura delle righe, pura e testata; lo
 * scaricamento e la cache stanno in listinoRemoto.ts.
 *
 * Le colonne si leggono come fa il gestionale (app.js, checkCloudUpdates):
 * intestazione cercata nelle prime 10 righe; codice nella colonna che contiene
 * "articolo", descrizione in "descrizione" (non categoria, gruppo o
 * fornitore), prezzo nella prima che contiene "prezzo"; sconto, fornitore e
 * categoria nelle colonne F, I e K, fisse come là. Se il file cambia forma
 * va cambiato in tutte e due le app.
 */
import { euroADecimillesimi } from '../money';

export interface ArticoloListino {
  codice: string;
  descrizione: string;
  /** prezzo di listino in decimillesimi di euro (vedi money.ts) */
  prezzo: number;
  /** sconto base del listino in punti base: lo sconto 1 del preventivo */
  scontoBp: number;
  fornitore: string;
  categoria: string;
  /** unità di misura, se il file ha la colonna */
  um?: string;
}

export interface Listino {
  /** data di modifica del file su Storage (metadata.updated) */
  aggiornato: string;
  /** l'ultima volta che l'app ha scaricato o verificato il file, ISO */
  verificato: string;
  articoli: ArticoloListino[];
}

/** Colonne fisse del gestionale: F = sconto, I = fornitore, K = categoria. */
const COLONNA_SCONTO = 5;
const COLONNA_FORNITORE = 8;
const COLONNA_CATEGORIA = 10;

function testo(x: unknown): string {
  return x == null ? '' : String(x).trim();
}

/**
 * Sconto del listino in punti base. Come nel gestionale: negativo vale come
 * positivo, fino a 1 è una frazione (0,1 = 10%), oltre è già in percentuale.
 */
export function scontoABp(valore: unknown): number {
  const n =
    typeof valore === 'number'
      ? valore
      : typeof valore === 'string'
        ? parseFloat(valore.replace(',', '.').replace(/[^0-9.-]/g, ''))
        : NaN;
  if (!Number.isFinite(n) || n === 0) return 0;
  const abs = Math.abs(n);
  const percento = abs <= 1 ? Math.round(abs * 10000) / 100 : abs;
  return Math.min(10000, Math.round(percento * 100));
}

/** Dove sono le colonne: null se nelle prime 10 righe non c'è un'intestazione riconoscibile. */
export function trovaIntestazione(righe: unknown[][]): { riga: number; codice: number; descrizione: number; prezzo: number; um: number } | null {
  for (let i = 0; i < Math.min(10, righe.length); i++) {
    const r = righe[i];
    if (!r) continue;
    const celle = Array.from(r, (c) => testo(c).toLowerCase());
    const codice = celle.findIndex((c) => c.includes('articolo'));
    const descrizione = celle.findIndex(
      (c) => c.includes('descrizione') && !c.includes('categoria') && !c.includes('gruppo') && !c.includes('fornitore'),
    );
    const prezzo = celle.findIndex((c) => c.includes('prezzo'));
    const um = celle.findIndex((c) => /^(um|u\.m\.?|unit[aà] di misura)$/.test(c));
    if (codice !== -1 && descrizione !== -1 && prezzo !== -1) return { riga: i, codice, descrizione, prezzo, um };
  }
  return null;
}

/**
 * Gli articoli dalle righe del primo foglio (sheet_to_json con header: 1).
 * Le righe senza codice si saltano; un prezzo illeggibile vale 0, come nel
 * gestionale, e l'articolo resta cercabile.
 */
export function leggiRigheListino(righe: unknown[][]): ArticoloListino[] {
  const col = trovaIntestazione(righe);
  if (!col) {
    throw new Error("Colonne del listino non riconosciute: servono le intestazioni 'articolo', 'descrizione' e 'prezzo'.");
  }
  const articoli: ArticoloListino[] = [];
  for (let i = col.riga + 1; i < righe.length; i++) {
    const r = righe[i];
    if (!r) continue;
    const codice = testo(r[col.codice]);
    if (!codice) continue;
    const um = col.um !== -1 ? testo(r[col.um]) : '';
    articoli.push({
      codice,
      descrizione: testo(r[col.descrizione]),
      prezzo: euroADecimillesimi(r[col.prezzo]) ?? 0,
      scontoBp: scontoABp(r[COLONNA_SCONTO]),
      fornitore: testo(r[COLONNA_FORNITORE]),
      categoria: testo(r[COLONNA_CATEGORIA]),
      ...(um ? { um } : {}),
    });
  }
  return articoli;
}

/**
 * Ricerca per la mappatura: ogni parola deve comparire in codice, descrizione
 * o fornitore. Il codice identico viene per primo.
 */
export function cercaArticoli(articoli: readonly ArticoloListino[], cerca: string, massimo = 30): ArticoloListino[] {
  const parole = cerca.toLowerCase().split(/\s+/).filter(Boolean);
  if (!parole.length) return [];
  const esatto = cerca.trim().toLowerCase();
  const trovati = articoli.filter((a) => {
    const t = `${a.codice} ${a.descrizione} ${a.fornitore}`.toLowerCase();
    return parole.every((p) => t.includes(p));
  });
  trovati.sort((a, b) => +(b.codice.toLowerCase() === esatto) - +(a.codice.toLowerCase() === esatto) || a.codice.localeCompare(b.codice));
  return trovati.slice(0, massimo);
}

function numeroIt(t: string): number {
  return Number(t.replace(',', '.'));
}

/**
 * La confezione scritta nella descrizione dell'articolo, nell'unità della
 * voce: "ROTOLO ML.23" → 23 ml, "KG.10" → 10 kg, "CONF.1000" → 1000 pz,
 * "LASTRA CM.200X120" → 2,4 m². È solo una proposta per la mappatura: si
 * conferma o si corregge a mano. null se la descrizione non la dice.
 */
export function confezioneDaDescrizione(descrizione: string, um: 'mq' | 'ml' | 'kg' | 'pz'): { contenuto: number; confezione: string } | null {
  const d = descrizione.toUpperCase();
  // al plurale, come le confezioni della distinta ("3 rotoli")
  const nome = (predefinito: string) =>
    /ROTOL/.test(d) ? 'rotoli' : /BARR/.test(d) ? 'barre' : /SACC/.test(d) ? 'sacchi' : /SECCHI/.test(d) ? 'secchi' : /SCATOL/.test(d) ? 'scatole'
      : /PANNELL/.test(d) ? 'pannelli' : /PACC/.test(d) ? 'pacchi' : /LASTR/.test(d) ? 'lastre' : predefinito;
  let x: RegExpExecArray | null;
  switch (um) {
    case 'ml':
      // "ML.23", "MT 20", oppure "3 M": non la M da sola davanti al numero, che è il montante (M75)
      x = /\b(?:ML|MT)\.?\s*(\d+(?:[.,]\d+)?)\b/.exec(d) ?? /\b(\d+(?:[.,]\d+)?)\s*(?:ML|MT|M)\b/.exec(d);
      return x ? { contenuto: numeroIt(x[1]!), confezione: nome('rotoli') } : null;
    case 'kg':
      x = /\bKG\.?\s*(\d+(?:[.,]\d+)?)/.exec(d) ?? /\b(\d+(?:[.,]\d+)?)\s*KG\b/.exec(d);
      return x ? { contenuto: numeroIt(x[1]!), confezione: nome('sacchi') } : null;
    case 'pz':
      x = /\b(?:CONF|SCATOLA|SCAT|PZ)\.?\s*(?:DA\s*)?(\d+)/.exec(d) ?? /\b(\d+)\s*PZ\b/.exec(d);
      return x ? { contenuto: Number(x[1]!), confezione: /SCAT/.test(d) ? 'scatole' : 'conf.' } : null;
    case 'mq': {
      // le misure in cm (200X120), o i m² della confezione (MQ 4,32)
      x = /\b(\d{2,3})\s*[X×]\s*(\d{2,3})\b/.exec(d);
      if (x) return { contenuto: Math.round(Number(x[1]) * Number(x[2])) / 10000, confezione: nome('lastre') };
      x = /\bMQ\.?\s*(\d+(?:[.,]\d+)?)/.exec(d) ?? /\b(\d+(?:[.,]\d+)?)\s*MQ\b/.exec(d);
      return x ? { contenuto: numeroIt(x[1]!), confezione: nome('pacchi') } : null;
    }
  }
}
