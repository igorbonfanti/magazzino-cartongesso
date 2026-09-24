/**
 * Il preventivo cliente — funzioni pure, senza Firebase.
 *
 * Nasce dalla distinta (le righe con i codici e i prezzi del listino), si
 * completa a mano (cliente, sconti extra, righe fuori listino) e si salva con
 * un numero della serie PCG-YYYY-NNNN, separata dalla PREV del gestionale.
 *
 * I soldi seguono le regole del gestionale: sconto 1 = sconto base del
 * listino, sconto 2 = sconto extra del venditore, a cascata; il netto
 * unitario non si arrotonda, si arrotonda una volta il totale di riga; lo
 * sconto arrotondamento si dà sul totale IVA inclusa e l'imponibile si
 * ricava da quello.
 */
import { leggiNumero } from './lib/bozza';
import type { ArticoloListino } from './lib/listino';
import type { RigaDistinta } from './engine';
import type { PrezzoRiga } from './prezzi';
import type { SchedaTecnica } from './schedaTecnica';
import {
  euroACent, euroADecimillesimi, formattaCent, formattaNettoDaListino, formattaPercento, formattaPrezzoListino, percentoABp,
  quantitaAMilli, scorporaIva, totaleRigaDaListino, totaliPreventivo,
} from './money';

// ---------------------------------------------------------------- tipi

/** Il cliente del preventivo: dall'anagrafica del gestionale (sola lettura) o scritto qui. */
export interface ClientePreventivo {
  ragione: string;
  /** partita IVA; scritta a mano, solo cifre */
  piva: string;
  indirizzo: string;
  citta: string;
  email: string;
  tel: string;
  cantiere: string;
  daAnagrafica: boolean;
}

/** Una riga del preventivo in lavorazione: i campi che si digitano restano testo, come le misure. */
export interface RigaBozzaPreventivo {
  id: string;
  /** listino: prezzo e sconto base del listino, fissi; manuale: prezzo scritto a mano, senza sconto base */
  tipo: 'listino' | 'manuale';
  codice: string;
  descrizione: string;
  /** unità della quantità: lastre, barre, conf., mq… */
  um: string;
  /** listino: prezzo in decimillesimi di euro e sconto base in punti base */
  prezzoDm: number;
  sconto1Bp: number;
  /** manuale: prezzo unitario come digitato ("12,50"); vuoto vale 0 */
  prezzo: string;
  /** sconto extra del venditore, come digitato ("5") */
  sconto2: string;
  qta: string;
  /** la voce della distinta da cui viene */
  chiave?: string;
  /** voce senza codice di listino, o con un codice che il listino non ha: riga gialla, prezzo da scrivere */
  daMappare?: boolean;
}

export interface BozzaPreventivo {
  cliente: ClientePreventivo | null;
  righe: RigaBozzaPreventivo[];
  /** aliquota IVA come digitata ("22") */
  iva: string;
  /** sconto arrotondamento in euro, IVA inclusa, come digitato */
  arrotondamento: string;
  note: string;
  /** le soluzioni delle distinte da cui nasce, per la scheda tecnica */
  schede: SchedaTecnica[];
  /** data del listino con cui sono stati presi i prezzi */
  listinoDel: string | null;
  /** duplicato da questo preventivo */
  daNumero?: string;
}

/** Una riga salvata: tutto in interi, come esce dai conti. */
export interface RigaSalvata {
  codice: string;
  descrizione: string;
  um: string;
  prezzoDm: number;
  sconto1Bp: number;
  sconto2Bp: number;
  quantitaMilli: number;
  totaleCent: number;
  manuale: boolean;
  chiave?: string;
}

export interface TotaliBozza {
  /** somma dei totali di riga */
  imponibileCent: number;
  ivaCent: number;
  /** IVA inclusa, prima dello sconto arrotondamento */
  totaleCent: number;
  /** lo sconto arrotondamento applicato (non oltre il totale) */
  arrotondamentoCent: number;
  /** dopo lo sconto arrotondamento; senza sconto sono uguali ai precedenti */
  nettoFinaleCent: number;
  ivaFinaleCent: number;
  finaleCent: number;
}

/** Quello che si salva in cgp_preventivi, oltre a numero e data di creazione. */
export interface DatiPreventivo {
  /** data del preventivo, AAAA-MM-GG */
  data: string;
  cliente: ClientePreventivo | null;
  righe: RigaSalvata[];
  ivaBp: number;
  totali: TotaliBozza;
  note: string;
  schede: SchedaTecnica[];
  listinoDel: string | null;
  iban: string;
  creatoDa: string;
  daNumero: string | null;
  /** numero, ragione sociale, P.IVA e cantiere in minuscolo, per la ricerca nell'archivio */
  cerca: string;
}

export interface PreventivoSalvato extends DatiPreventivo {
  numero: string;
  anno: number;
  progressivo: number;
  /** ISO, dal timestamp del server */
  creatoIl: string | null;
}

// ---------------------------------------------------------------- numeri

/** PCG-2026-0001 */
export function numeroPreventivo(anno: number, progressivo: number): string {
  return `PCG-${anno}-${String(progressivo).padStart(4, '0')}`;
}

export const FORMA_NUMERO = /^PCG-(\d{4})-(\d{4,})$/;

/** 132500 millesimi → "132,5"; 167000 → "167" */
export function testoQuantita(milli: number): string {
  return String(milli / 1000).replace('.', ',');
}

/** La data di oggi dell'orologio locale, AAAA-MM-GG (non UTC: a mezzanotte cambierebbe giorno). */
export function oggi(d = new Date()): string {
  const due = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}`;
}

/** "2026-09-24" → "24/09/2026" */
export function dataItaliana(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

// ---------------------------------------------------------------- righe e totali

export interface RigaCalcolata {
  prezzoDm: number;
  sconto1Bp: number;
  sconto2Bp: number;
  quantitaMilli: number;
  totaleCent: number;
}

/** I numeri della riga, o perché non si possono calcolare. */
export function calcolaRiga(r: RigaBozzaPreventivo): RigaCalcolata | { errore: string } {
  const prezzoDm = r.tipo === 'listino' ? r.prezzoDm : r.prezzo.trim() === '' ? 0 : euroADecimillesimi(r.prezzo);
  if (prezzoDm === null || prezzoDm < 0) return { errore: 'prezzo non valido' };
  const sconto1Bp = r.tipo === 'listino' ? r.sconto1Bp : 0;
  const sconto2Bp = percentoABp(r.sconto2);
  if (sconto2Bp === null) return { errore: 'sconto non valido' };
  const q = leggiNumero(r.qta);
  if (q === null) return { errore: 'quantità non valida' };
  const quantitaMilli = quantitaAMilli(q);
  const sconti = [sconto1Bp, sconto2Bp].filter((s) => s > 0);
  return { prezzoDm, sconto1Bp, sconto2Bp, quantitaMilli, totaleCent: totaleRigaDaListino(prezzoDm, sconti, quantitaMilli) };
}

/** Il netto unitario da mostrare, a quattro decimali al massimo e mai arrotondato nei conti. */
export function nettoUnitario(c: RigaCalcolata): string {
  return formattaNettoDaListino(c.prezzoDm, [c.sconto1Bp, c.sconto2Bp].filter((s) => s > 0));
}

/** Piede del preventivo, con lo sconto arrotondamento sul totale IVA inclusa come nel gestionale. */
export function calcolaTotali(totaliRigaCent: readonly number[], ivaBp: number, arrotondamentoCent = 0): TotaliBozza {
  const t = totaliPreventivo(totaliRigaCent, ivaBp);
  const finale = Math.max(0, t.totaleCent - Math.max(0, arrotondamentoCent));
  const f = finale === t.totaleCent ? t : scorporaIva(finale, ivaBp);
  return {
    imponibileCent: t.nettoCent,
    ivaCent: t.ivaCent,
    totaleCent: t.totaleCent,
    arrotondamentoCent: t.totaleCent - finale,
    nettoFinaleCent: f.nettoCent,
    ivaFinaleCent: f.ivaCent,
    finaleCent: finale,
  };
}

/** Aliquota e sconto arrotondamento digitati, o l'errore. */
function letturePiede(b: Pick<BozzaPreventivo, 'iva' | 'arrotondamento'>): { ivaBp: number; arrotondamentoCent: number } | { errore: string } {
  const ivaBp = b.iva.trim() === '' ? null : percentoABp(b.iva);
  if (ivaBp === null) return { errore: 'Aliquota IVA non valida.' };
  const arrotondamentoCent = b.arrotondamento.trim() === '' ? 0 : euroACent(b.arrotondamento);
  if (arrotondamentoCent === null || arrotondamentoCent < 0) return { errore: 'Sconto arrotondamento non valido.' };
  return { ivaBp, arrotondamentoCent };
}

/** I totali della bozza: le righe non valide contano zero finché non si correggono. */
export function totaliBozza(b: BozzaPreventivo): TotaliBozza {
  const piede = letturePiede(b);
  const righe = b.righe.map(calcolaRiga).map((c) => ('errore' in c ? 0 : c.totaleCent));
  return 'errore' in piede ? calcolaTotali(righe, 2200) : calcolaTotali(righe, piede.ivaBp, piede.arrotondamentoCent);
}

// ---------------------------------------------------------------- dalla distinta

/**
 * Le righe del preventivo dalla distinta: quelle con un articolo del listino
 * prendono codice, descrizione, prezzo e sconto base dal listino e lo sconto
 * extra di partenza dalla mappatura; le altre restano gialle, con il prezzo da
 * scrivere. Il codice non si inventa: senza mappatura resta vuoto.
 */
export function righeDaDistinta(
  righe: readonly RigaDistinta[],
  prezzi: readonly (PrezzoRiga | undefined)[] | null,
  nuovoId: () => string,
): RigaBozzaPreventivo[] {
  const out: RigaBozzaPreventivo[] = [];
  righe.forEach((r, i) => {
    if (r.pezzi <= 0) return;
    const p = prezzi?.[i];
    if (p?.stato === 'prezzata' && p.articolo) {
      out.push({
        id: nuovoId(), tipo: 'listino', codice: p.articolo.codice, descrizione: p.articolo.descrizione || r.descrizione, um: p.unita,
        prezzoDm: p.articolo.prezzo, sconto1Bp: p.articolo.scontoBp, prezzo: '',
        sconto2: p.mappatura?.scontoExtraBp ? formattaPercento(p.mappatura.scontoExtraBp) : '',
        qta: testoQuantita(p.quantitaMilli), chiave: r.chiave,
      });
    } else {
      out.push({
        id: nuovoId(), tipo: 'manuale', codice: p?.mappatura?.codice ?? '', descrizione: r.descrizione, um: r.umConf,
        prezzoDm: 0, sconto1Bp: 0, prezzo: '', sconto2: '', qta: testoQuantita(quantitaAMilli(r.pezzi)), chiave: r.chiave, daMappare: true,
      });
    }
  });
  return out;
}

/**
 * Aggiunge righe a quelle che ci sono: lo stesso articolo del listino, con la
 * stessa unità e lo stesso sconto extra, somma le quantità (due distinte con
 * le stesse lastre fanno una riga sola). Le altre si accodano.
 */
export function aggiungiRighe(esistenti: readonly RigaBozzaPreventivo[], nuove: readonly RigaBozzaPreventivo[]): RigaBozzaPreventivo[] {
  const out = esistenti.map((r) => ({ ...r }));
  for (const n of nuove) {
    const q = leggiNumero(n.qta);
    const uguale = n.tipo === 'listino' && n.codice && q !== null
      ? out.find((r) => r.tipo === 'listino' && r.codice === n.codice && r.um === n.um && percentoABp(r.sconto2) === percentoABp(n.sconto2) && leggiNumero(r.qta) !== null)
      : undefined;
    if (uguale) uguale.qta = testoQuantita(quantitaAMilli(leggiNumero(uguale.qta)!) + quantitaAMilli(q!));
    else out.push({ ...n });
  }
  return out;
}

// ---------------------------------------------------------------- salvataggio

/** In minuscolo, per cercare nell'archivio senza indici di testo. */
export function testoRicerca(numero: string, cliente: ClientePreventivo | null): string {
  return [numero, cliente?.ragione, cliente?.piva, cliente?.cantiere, cliente?.citta].filter(Boolean).join(' ').toLowerCase();
}

/**
 * I dati da salvare, controllati: almeno una riga, tutte calcolabili, le
 * manuali con la descrizione. Le righe a prezzo zero non sono un errore
 * (possono essere volute), le segnala `righeAZero`.
 */
export function datiDaBozza(
  b: BozzaPreventivo,
  opz: { data: string; iban: string; creatoDa: string },
): DatiPreventivo | { errori: string[] } {
  const errori: string[] = [];
  if (!b.righe.length) errori.push('Il preventivo non ha righe.');
  const piede = letturePiede(b);
  if ('errore' in piede) errori.push(piede.errore);
  const righe: RigaSalvata[] = [];
  b.righe.forEach((r, i) => {
    const c = calcolaRiga(r);
    if ('errore' in c) {
      errori.push(`Riga ${i + 1}: ${c.errore}.`);
      return;
    }
    if (!r.descrizione.trim()) errori.push(`Riga ${i + 1}: manca la descrizione.`);
    righe.push({
      codice: r.codice.trim(), descrizione: r.descrizione.trim(), um: r.um.trim(),
      prezzoDm: c.prezzoDm, sconto1Bp: c.sconto1Bp, sconto2Bp: c.sconto2Bp, quantitaMilli: c.quantitaMilli, totaleCent: c.totaleCent,
      manuale: r.tipo === 'manuale', ...(r.chiave ? { chiave: r.chiave } : {}),
    });
  });
  if (errori.length || 'errore' in piede) return { errori };
  const cliente = b.cliente && b.cliente.ragione.trim() ? pulisciCliente(b.cliente) : null;
  return {
    data: opz.data, cliente, righe, ivaBp: piede.ivaBp,
    totali: calcolaTotali(righe.map((r) => r.totaleCent), piede.ivaBp, piede.arrotondamentoCent),
    note: b.note.trim(), schede: b.schede, listinoDel: b.listinoDel, iban: opz.iban.trim(), creatoDa: opz.creatoDa,
    daNumero: b.daNumero ?? null, cerca: testoRicerca('', cliente),
  };
}

/** Le righe che resterebbero a zero euro: da confermare prima di salvare. */
export function righeAZero(b: BozzaPreventivo): number {
  return b.righe.filter((r) => {
    const c = calcolaRiga(r);
    return !('errore' in c) && c.totaleCent === 0;
  }).length;
}

/** Spazi tolti; la P.IVA scritta a mano solo cifre, come chiede la specifica. */
export function pulisciCliente(c: ClientePreventivo): ClientePreventivo {
  const t = (s: string) => s.trim().replace(/\s+/g, ' ');
  return {
    ragione: t(c.ragione), piva: c.daAnagrafica ? t(c.piva) : c.piva.replace(/\D/g, ''),
    indirizzo: t(c.indirizzo), citta: t(c.citta), email: t(c.email), tel: t(c.tel), cantiere: t(c.cantiere), daAnagrafica: c.daAnagrafica,
  };
}

export function clienteVuoto(): ClientePreventivo {
  return { ragione: '', piva: '', indirizzo: '', citta: '', email: '', tel: '', cantiere: '', daAnagrafica: false };
}

// ---------------------------------------------------------------- lettura e duplicazione

const intero = (x: unknown, min = 0): number | null => (typeof x === 'number' && Number.isInteger(x) && x >= min ? x : null);
const testo = (x: unknown): string => (typeof x === 'string' ? x : '');

function clienteValido(x: unknown): ClientePreventivo | null {
  if (!x || typeof x !== 'object') return null;
  const c = x as Record<string, unknown>;
  if (!testo(c.ragione).trim()) return null;
  return {
    ragione: testo(c.ragione), piva: testo(c.piva), indirizzo: testo(c.indirizzo), citta: testo(c.citta), email: testo(c.email),
    tel: testo(c.tel), cantiere: testo(c.cantiere), daAnagrafica: c.daAnagrafica === true,
  };
}

function rigaValida(x: unknown): RigaSalvata | null {
  if (!x || typeof x !== 'object') return null;
  const r = x as Record<string, unknown>;
  const prezzoDm = intero(r.prezzoDm);
  const sconto1Bp = intero(r.sconto1Bp);
  const sconto2Bp = intero(r.sconto2Bp);
  const quantitaMilli = intero(r.quantitaMilli);
  const totaleCent = intero(r.totaleCent);
  if (prezzoDm === null || sconto1Bp === null || sconto2Bp === null || quantitaMilli === null || totaleCent === null) return null;
  return {
    codice: testo(r.codice), descrizione: testo(r.descrizione), um: testo(r.um), prezzoDm, sconto1Bp, sconto2Bp, quantitaMilli, totaleCent,
    manuale: r.manuale === true, ...(typeof r.chiave === 'string' ? { chiave: r.chiave } : {}),
  };
}

function totaliValidi(x: unknown): TotaliBozza | null {
  if (!x || typeof x !== 'object') return null;
  const t = x as Record<string, unknown>;
  const campi = ['imponibileCent', 'ivaCent', 'totaleCent', 'arrotondamentoCent', 'nettoFinaleCent', 'ivaFinaleCent', 'finaleCent'] as const;
  const v = campi.map((k) => intero(t[k]));
  if (v.some((n) => n === null)) return null;
  return Object.fromEntries(campi.map((k, i) => [k, v[i]])) as unknown as TotaliBozza;
}

/**
 * Un documento di cgp_preventivi letto da Firestore, controllato campo per
 * campo; null se non ha la forma giusta. Le schede tecniche si tengono come
 * sono: servono solo a mostrarle.
 */
export function preventivoValido(id: string, x: unknown, creatoIl: string | null = null): PreventivoSalvato | null {
  if (!x || typeof x !== 'object') return null;
  const d = x as Record<string, unknown>;
  const m = FORMA_NUMERO.exec(id);
  if (!m || d.numero !== id) return null;
  const righe = Array.isArray(d.righe) ? d.righe.map(rigaValida) : null;
  const totali = totaliValidi(d.totali);
  const ivaBp = intero(d.ivaBp);
  if (!righe || righe.some((r) => !r) || !totali || ivaBp === null || !/^\d{4}-\d{2}-\d{2}$/.test(testo(d.data))) return null;
  return {
    numero: id, anno: Number(m[1]), progressivo: Number(m[2]), creatoIl,
    data: testo(d.data), cliente: clienteValido(d.cliente), righe: righe as RigaSalvata[], ivaBp, totali, note: testo(d.note),
    schede: Array.isArray(d.schede) ? (d.schede as SchedaTecnica[]) : [], listinoDel: typeof d.listinoDel === 'string' ? d.listinoDel : null,
    iban: testo(d.iban), creatoDa: testo(d.creatoDa), daNumero: typeof d.daNumero === 'string' ? d.daNumero : null, cerca: testo(d.cerca),
  };
}

/**
 * Un preventivo salvato come nuova bozza, con i prezzi del listino di oggi:
 * un preventivo nuovo parte dai prezzi correnti. Gli articoli che il listino
 * non ha più restano con il netto del preventivo di partenza, gialli.
 */
export function bozzaDaSalvato(
  p: PreventivoSalvato,
  listino: ReadonlyMap<string, ArticoloListino>,
  listinoDel: string | null,
  nuovoId: () => string,
): { bozza: BozzaPreventivo; aggiornati: number; spariti: number } {
  let aggiornati = 0;
  let spariti = 0;
  const righe = p.righe.map((r): RigaBozzaPreventivo => {
    const base = {
      id: nuovoId(), codice: r.codice, descrizione: r.descrizione, um: r.um, qta: testoQuantita(r.quantitaMilli),
      sconto2: r.sconto2Bp ? formattaPercento(r.sconto2Bp) : '', ...(r.chiave ? { chiave: r.chiave } : {}),
    };
    const a = !r.manuale && r.codice ? listino.get(r.codice) : undefined;
    if (a) {
      if (a.prezzo !== r.prezzoDm || a.scontoBp !== r.sconto1Bp) aggiornati++;
      return { ...base, tipo: 'listino', descrizione: a.descrizione || r.descrizione, prezzoDm: a.prezzo, sconto1Bp: a.scontoBp, prezzo: '' };
    }
    if (!r.manuale) spariti++;
    // fuori listino: il prezzo della riga, già al netto dello sconto base
    const prezzo = formattaNettoDaListino(r.prezzoDm, r.sconto1Bp ? [r.sconto1Bp] : []).replace(/\./g, '');
    return { ...base, tipo: 'manuale', prezzoDm: 0, sconto1Bp: 0, prezzo, ...(r.manuale ? {} : { daMappare: true }) };
  });
  const t = p.totali;
  return {
    bozza: {
      cliente: p.cliente, righe, iva: formattaPercento(p.ivaBp), arrotondamento: t.arrotondamentoCent ? formattaCent(t.arrotondamentoCent).replace(/\./g, '') : '',
      note: p.note, schede: p.schede, listinoDel, daNumero: p.numero,
    },
    aggiornati,
    spariti,
  };
}

// ---------------------------------------------------------------- bozza in locale

export function bozzaPreventivoVuota(ivaBp = 2200): BozzaPreventivo {
  return { cliente: null, righe: [], iva: formattaPercento(ivaBp), arrotondamento: '', note: '', schede: [], listinoDel: null };
}

function rigaBozzaValida(x: unknown): x is RigaBozzaPreventivo {
  if (!x || typeof x !== 'object') return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === 'string' && (r.tipo === 'listino' || r.tipo === 'manuale') && typeof r.codice === 'string' &&
    typeof r.descrizione === 'string' && typeof r.um === 'string' && intero(r.prezzoDm) !== null && intero(r.sconto1Bp) !== null &&
    typeof r.prezzo === 'string' && typeof r.sconto2 === 'string' && typeof r.qta === 'string'
  );
}

/** Il cliente della bozza, anche a metà (la ragione sociale si sta ancora scrivendo). */
function clienteBozza(x: unknown): ClientePreventivo | null {
  if (!x || typeof x !== 'object') return null;
  const c = x as Record<string, unknown>;
  return {
    ragione: testo(c.ragione), piva: testo(c.piva), indirizzo: testo(c.indirizzo), citta: testo(c.citta), email: testo(c.email),
    tel: testo(c.tel), cantiere: testo(c.cantiere), daAnagrafica: c.daAnagrafica === true,
  };
}

/** La bozza riletta da localStorage, se ha la forma giusta. */
export function leggiBozzaPreventivo(x: unknown): BozzaPreventivo | null {
  if (!x || typeof x !== 'object') return null;
  const b = x as Record<string, unknown>;
  if (!Array.isArray(b.righe) || !b.righe.every(rigaBozzaValida)) return null;
  if (typeof b.iva !== 'string' || typeof b.arrotondamento !== 'string' || typeof b.note !== 'string') return null;
  return {
    cliente: clienteBozza(b.cliente),
    righe: b.righe as RigaBozzaPreventivo[], iva: b.iva, arrotondamento: b.arrotondamento, note: b.note,
    schede: Array.isArray(b.schede) ? (b.schede as SchedaTecnica[]) : [], listinoDel: typeof b.listinoDel === 'string' ? b.listinoDel : null,
    ...(typeof b.daNumero === 'string' ? { daNumero: b.daNumero } : {}),
  };
}

/** Il prezzo di listino da mostrare in una riga (per le manuali quello digitato). */
export function prezzoRiga(r: RigaBozzaPreventivo): string {
  return r.tipo === 'listino' ? formattaPrezzoListino(r.prezzoDm) : r.prezzo;
}
