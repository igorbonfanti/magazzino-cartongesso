/**
 * Chi può usare listino, prezzi, mappatura e preventivi.
 *
 * Gli stessi UID di autorizzato() in magazzino-scorte/firestore.rules, che
 * danno i permessi veri: questo elenco decide solo cosa l'app fa vedere, e
 * va tenuto allineato alle regole (aggiungendo una persona si toccano
 * tutti e due). I magazzinieri di scorte qui non entrano.
 */
export const UID_AUTORIZZATI = [
  '0nGqBTD30QTsovcf7f19KASy9Eg1', // bonfanti.igor
  '4Dak4tLe20O8gWtnSOh3h7Z3h5X2', // amministrazione
  'iJRRRJDpvSeKwqfU1bJKQ3oSNy83', // commerciale
  'pET8M4MguvfvZaEwt2DilGwRUuC2', // carnevale.carlino
] as const;

export function autorizzato(uid: string | undefined): boolean {
  return !!uid && (UID_AUTORIZZATI as readonly string[]).includes(uid);
}
