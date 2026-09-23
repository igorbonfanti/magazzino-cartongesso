/**
 * Le lastre che il magazzino tiene a scaffale (indicazione del 23/09/2026):
 * normali da 6, 10 e 13 mm, fuoco da 15, idro da 13 e le rinforzate solidtex.
 * Le altre arrivano su ordinazione in 3-4 giorni: si propongono, ma dopo le
 * soluzioni con quello che c'è.
 *
 * Nomi canonici del catalogo Siniat (vedi lastraDaTesto): la Siniat da 6 mm è
 * la pregyflex BA6. Con la Fase 3 la disponibilità arriverà dal listino.
 */
export const LASTRE_A_MAGAZZINO: readonly string[] = [
  'pregyflex BA6',
  'pregyplac BA10',
  'pregyplac BA13',
  'pregyflam BA15',
  'pregydro H2 BA13',
  'solidtex indoor',
];

export const FORNITORE_ORDINI = { nome: 'ATS Isolanti', giorni: '3–4' };

export function aMagazzino(lastra: string): boolean {
  return LASTRE_A_MAGAZZINO.includes(lastra);
}

/** "su ordinazione da ATS Isolanti, 3–4 giorni" */
export function testoOrdine(): string {
  return `su ordinazione da ${FORNITORE_ORDINI.nome}, ${FORNITORE_ORDINI.giorni} giorni`;
}
