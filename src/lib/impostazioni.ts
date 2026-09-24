/**
 * Le impostazioni del preventivo, in cgp_impostazioni/preventivo: coordinate
 * bancarie e aliquota IVA di partenza. Finché non si salvano valgono quelle
 * del gestionale, che le ha scritte nel codice: là l'IBAN è fisso, qui si
 * cambia dall'archivio.
 */
export interface ImpostazioniPreventivo {
  iban: string;
  /** aliquota IVA di partenza dei preventivi nuovi, in punti base */
  ivaBp: number;
}

export const IMPOSTAZIONI_PARTENZA: ImpostazioniPreventivo = {
  // lo stesso IBAN che il gestionale stampa sui PREV (app.js)
  iban: 'IT85J0503401742000000032814',
  ivaBp: 2200,
};

export const ID_IMPOSTAZIONI = 'preventivo';

/** IBAN italiano o estero, senza spazi, in maiuscolo; null se non ha la forma di un IBAN. */
export function ibanValido(testo: string): string | null {
  const s = testo.replace(/\s+/g, '').toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s) ? s : null;
}

/** "IT85J0503401742000000032814" → "IT85 J050 3401 7420 0000 0032 814" */
export function ibanLeggibile(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

export function impostazioniValide(x: unknown): ImpostazioniPreventivo {
  const d = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>;
  const iban = typeof d.iban === 'string' ? ibanValido(d.iban) : null;
  const ivaBp = typeof d.ivaBp === 'number' && Number.isInteger(d.ivaBp) && d.ivaBp >= 0 && d.ivaBp <= 10000 ? d.ivaBp : null;
  return { iban: iban ?? IMPOSTAZIONI_PARTENZA.iban, ivaBp: ivaBp ?? IMPOSTAZIONI_PARTENZA.ivaBp };
}
