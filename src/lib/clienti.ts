/**
 * L'anagrafica clienti del gestionale, in sola lettura (decisione del
 * 24/09/2026): clienti.xlsx su Storage, letto come fa il gestionale (dalla
 * seconda riga; ragione sociale in B, P.IVA in C, email in H, indirizzo in I,
 * città in K), più i clienti che gli operatori aggiungono a mano nella
 * collection "clienti". Qui non si scrive niente: un cliente nuovo resta sul
 * preventivo, in anagrafica lo aggiunge il gestionale.
 */
import type { ClientePreventivo } from '../preventivo';

export interface ClienteAnagrafica {
  ragione: string;
  piva: string;
  email: string;
  indirizzo: string;
  citta: string;
}

const testo = (x: unknown) => (x == null ? '' : String(x).trim());

/** I clienti dalle righe del primo foglio (sheet_to_json con header: 1). */
export function leggiRigheClienti(righe: unknown[][]): ClienteAnagrafica[] {
  const out: ClienteAnagrafica[] = [];
  for (let i = 1; i < righe.length; i++) {
    const r = righe[i];
    if (!r || !testo(r[1])) continue;
    out.push({ ragione: testo(r[1]), piva: testo(r[2]), email: testo(r[7]), indirizzo: testo(r[8]), citta: testo(r[10]) });
  }
  return out;
}

/** Un documento della collection "clienti" del gestionale; null se non ha la ragione sociale. */
export function clienteDaDocumento(x: unknown): ClienteAnagrafica | null {
  if (!x || typeof x !== 'object') return null;
  const d = x as Record<string, unknown>;
  const ragione = testo(d.ragione);
  return ragione ? { ragione, piva: testo(d.piva), email: testo(d.email), indirizzo: testo(d.indirizzo), citta: testo(d.citta) } : null;
}

/** Come il gestionale: almeno due lettere, dentro la ragione sociale o la P.IVA, al massimo 20. */
export function cercaClienti(elenco: readonly ClienteAnagrafica[], cerca: string, massimo = 20): ClienteAnagrafica[] {
  const q = cerca.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: ClienteAnagrafica[] = [];
  for (const c of elenco) {
    if (c.ragione.toLowerCase().includes(q) || c.piva.toLowerCase().includes(q)) {
      out.push(c);
      if (out.length >= massimo) break;
    }
  }
  return out;
}

/** Senza doppioni: stessa ragione sociale e stessa P.IVA. */
export function unisciClienti(...liste: (readonly ClienteAnagrafica[])[]): ClienteAnagrafica[] {
  const visti = new Set<string>();
  const out: ClienteAnagrafica[] = [];
  for (const l of liste) {
    for (const c of l) {
      const k = `${c.ragione.toLowerCase()}|${c.piva}`;
      if (visti.has(k)) continue;
      visti.add(k);
      out.push(c);
    }
  }
  return out;
}

/** Il cliente dell'anagrafica sul preventivo: telefono e cantiere si scrivono per ogni preventivo, come nel gestionale. */
export function clienteDaAnagrafica(c: ClienteAnagrafica): ClientePreventivo {
  return { ragione: c.ragione, piva: c.piva, indirizzo: c.indirizzo, citta: c.citta, email: c.email, tel: '', cantiere: '', daAnagrafica: true };
}
