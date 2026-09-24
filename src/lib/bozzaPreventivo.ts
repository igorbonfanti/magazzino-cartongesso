/**
 * Il preventivo in lavorazione resta nel browser finché non si salva, come la
 * bozza del wizard: al banco capita di essere interrotti. Chiave prefissata
 * "cartongesso.", come vogliono le app che dividono l'origine.
 */
import { leggiBozzaPreventivo } from '../preventivo';
import type { BozzaPreventivo } from '../preventivo';

const CHIAVE = 'cartongesso.preventivo';

export function leggiBozzaLocale(): BozzaPreventivo | null {
  try {
    return leggiBozzaPreventivo(JSON.parse(localStorage.getItem(CHIAVE) ?? 'null'));
  } catch {
    return null;
  }
}

export function scriviBozzaLocale(b: BozzaPreventivo | null): void {
  try {
    if (b) localStorage.setItem(CHIAVE, JSON.stringify(b));
    else localStorage.removeItem(CHIAVE);
  } catch {
    /* senza spazio si lavora lo stesso, senza ricordarsela */
  }
}
