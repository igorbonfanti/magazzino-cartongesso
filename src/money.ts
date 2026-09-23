/**
 * Tutti gli importi viaggiano in centesimi interi.
 * Nessun calcolo monetario in virgola mobile.
 *
 * La prima parte e' identica a money.ts di magazzino-scorte. La seconda porta
 * la catena dei prezzi del preventivo, con la stessa regola di
 * magazzino-gestionale (correzione del 18/09/2026): il prezzo unitario netto
 * NON si arrotonda mai; si arrotonda una volta sola, il totale di riga.
 */

/** Somma di importi in centesimi. */
export function sommaCent(valori: readonly number[]): number {
  let tot = 0;
  for (const v of valori) tot += Math.trunc(v);
  return tot;
}

/** Prodotto quantità (intera) × prezzo unitario in centesimi. */
export function moltiplicaCent(quantita: number, prezzoCent: number): number {
  return Math.trunc(quantita) * Math.trunc(prezzoCent);
}

/** "77.848" centesimi -> "778,48" */
export function formattaCent(cent: number): string {
  const n = Math.trunc(cent);
  const negativo = n < 0;
  const abs = Math.abs(n);
  const intero = Math.floor(abs / 100);
  const dec = String(abs % 100).padStart(2, '0');
  return `${negativo ? '-' : ''}${formattaIntero(intero)},${dec}`;
}

/** "77.848" centesimi -> "778,48 €" */
export function formattaEuro(cent: number): string {
  return `${formattaCent(cent)} €`;
}

/** Separatore delle migliaia italiano: 1185 -> "1.185" */
export function formattaIntero(n: number): string {
  const negativo = n < 0;
  const cifre = String(Math.abs(Math.trunc(n)));
  let out = '';
  for (let i = 0; i < cifre.length; i++) {
    if (i > 0 && (cifre.length - i) % 3 === 0) out += '.';
    out += cifre[i];
  }
  return (negativo ? '-' : '') + out;
}

/** Numero con un decimale, virgola italiana: 14.2 -> "14,2" */
export function formattaDecimale(n: number, decimali = 1): string {
  const fattore = 10 ** decimali;
  const arrotondato = Math.round(n * fattore) / fattore;
  const intero = Math.trunc(Math.abs(arrotondato));
  const resto = Math.abs(arrotondato) - intero;
  const dec = String(Math.round(resto * fattore)).padStart(decimali, '0');
  const segno = arrotondato < 0 ? '-' : '';
  return decimali > 0 ? `${segno}${formattaIntero(intero)},${dec}` : `${segno}${formattaIntero(intero)}`;
}

/** Da euro con virgola/punto a centesimi interi (input admin). */
export function euroACent(testo: string): number | null {
  const pulito = testo.trim().replace(/\./g, '').replace(',', '.');
  if (pulito === '' || !/^-?\d+(\.\d{0,2})?$/.test(pulito)) return null;
  const [int, dec = ''] = pulito.replace('-', '').split('.');
  const cent = Number(int) * 100 + Number((dec + '00').slice(0, 2));
  return pulito.startsWith('-') ? -cent : cent;
}

// ===========================================================================
// CATENA DEI PREZZI DEL PREVENTIVO
// ===========================================================================
// Sconti e aliquote in punti base interi: 10% = 1000, 12,5% = 1250, 22% = 2200.
// Quantità in millesimi interi: 2,5 mq = 2500. Cosi' tutta la catena
// listino → sconti → quantità → totale resta in interi e si arrotonda una volta.
//
// Perché non si arrotonda il netto unitario: un articolo da 0,95 con il 10% di
// sconto costa 0,855. Arrotondando il pezzo a 0,86 e moltiplicando per 100
// vengono 86,00 invece di 85,50 — il caso segnalato dal campo sul gestionale.

/** Percentuale digitata ("10", "12,5", "-10%") in punti base. null se non valida. */
export function percentoABp(testo: string): number | null {
  const pulito = testo.trim().replace('%', '').replace('-', '').replace(',', '.').trim();
  if (pulito === '') return 0;
  if (!/^\d+(\.\d{0,2})?$/.test(pulito)) return null;
  const [int, dec = ''] = pulito.split('.');
  const bp = Number(int) * 100 + Number((dec + '00').slice(0, 2));
  return bp <= 10000 ? bp : null;
}

/** 1250 -> "12,5" ; 1000 -> "10" */
export function formattaPercento(bp: number): string {
  const intero = Math.trunc(bp / 100);
  const dec = String(bp % 100).padStart(2, '0').replace(/0+$/, '');
  return dec ? `${intero},${dec}` : String(intero);
}

/** Quantità (al massimo 3 decimali) in millesimi interi. */
export function quantitaAMilli(qta: number): number {
  return Math.round(qta * 1000);
}

/** Divisione intera, meta' per eccesso (tutti i valori della catena sono positivi). */
function dividiArrotonda(num: bigint, den: bigint): bigint {
  return (2n * num + den) / (2n * den);
}

/** Π(10000 − sconto) e 10000^n: il fattore di sconto a cascata come frazione intera. */
function fattoreSconti(scontiBp: readonly number[]): { num: bigint; den: bigint } {
  let num = 1n;
  let den = 1n;
  for (const s of scontiBp) {
    if (!Number.isInteger(s) || s < 0 || s > 10000) throw new Error(`Sconto non valido: ${s}`);
    num *= BigInt(10000 - s);
    den *= 10000n;
  }
  return { num, den };
}

/**
 * Totale della riga: listino × (1 − s1) × (1 − s2) × quantità.
 * E' qui, e solo qui, che si arrotonda al centesimo.
 */
export function totaleRigaCent(listinoCent: number, scontiBp: readonly number[], quantitaMilli: number): number {
  if (!Number.isInteger(listinoCent) || !Number.isInteger(quantitaMilli)) {
    throw new Error('Listino e quantità vanno passati interi (centesimi e millesimi)');
  }
  const { num, den } = fattoreSconti(scontiBp);
  return Number(dividiArrotonda(BigInt(listinoCent) * num * BigInt(quantitaMilli), den * 1000n));
}

/**
 * Netto unitario da MOSTRARE, a piena precisione fino a 4 decimali e senza
 * zeri inutili: "0,855" e non "0,86", come nel gestionale. Non va usato per
 * calcolare niente: il totale si fa con totaleRigaCent.
 */
export function formattaNettoUnitario(listinoCent: number, scontiBp: readonly number[]): string {
  const { num, den } = fattoreSconti(scontiBp);
  // in decimillesimi di euro (4 decimali)
  const dm = Number(dividiArrotonda(BigInt(listinoCent) * 100n * num, den));
  const intero = Math.floor(dm / 10000);
  // almeno 2 decimali, poi via gli zeri in coda: 0,8550 -> 0,855 ; 7,2000 -> 7,20
  const dec = String(dm % 10000).padStart(4, '0').replace(/0{1,2}$/, '');
  return `${formattaIntero(intero)},${dec}`;
}

/** Imposta sull'imponibile, al centesimo. */
export function ivaCent(imponibileCent: number, aliquotaBp: number): number {
  return Number(dividiArrotonda(BigInt(imponibileCent) * BigInt(aliquotaBp), 10000n));
}

export interface TotaliPreventivo {
  nettoCent: number;
  ivaCent: number;
  totaleCent: number;
}

/** Piede del PREV: Totale Netto, IVA, Totale IVA inclusa. */
export function totaliPreventivo(totaliRigaCent: readonly number[], aliquotaBp: number): TotaliPreventivo {
  const netto = sommaCent(totaliRigaCent);
  const iva = ivaCent(netto, aliquotaBp);
  return { nettoCent: netto, ivaCent: iva, totaleCent: netto + iva };
}
