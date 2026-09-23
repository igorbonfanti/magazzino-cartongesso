/**
 * I prezzi della distinta — funzioni pure, senza Firebase.
 *
 *   riga della distinta → mappatura (cgp_mapping o di partenza) → articolo
 *   del listino → totale = prezzo × (1 − sconto base) × quantità
 *
 * La quantità è quella che si vende: i pezzi della distinta (lastre, barre,
 * confezioni) se il listino prezza la confezione, oppure pezzi × contenuto
 * (m², ml, kg) se prezza l'unità di misura. Il totale si arrotonda una volta
 * sola, al centesimo, come nel gestionale; lo sconto del venditore (sconto 2)
 * arriva col preventivo.
 */
import type { RigaDistinta } from './engine';
import type { ArticoloListino } from './lib/listino';
import { mappaturaPer } from './lib/mappatura';
import type { Mappatura, MappaturaRisolta } from './lib/mappatura';
import { quantitaAMilli, sommaCent, totaleRigaDaListino } from './money';

export type StatoPrezzo = 'prezzata' | 'da_mappare' | 'fuori_listino';

export interface PrezzoRiga {
  stato: StatoPrezzo;
  mappatura?: MappaturaRisolta;
  articolo?: ArticoloListino;
  /** quantità venduta nell'unità del prezzo, in millesimi */
  quantitaMilli: number;
  /** l'unità della quantità venduta: "lastre", "barre" oppure "mq", "ml"… */
  unita: string;
  /** totale al prezzo di listino con lo sconto base, in centesimi; 0 se non prezzata */
  totaleCent: number;
}

export function prezzaRiga(
  r: Pick<RigaDistinta, 'chiave' | 'pezzi' | 'contenuto' | 'um' | 'umConf'>,
  salvate: ReadonlyMap<string, Mappatura>,
  listino: ReadonlyMap<string, ArticoloListino>,
): PrezzoRiga {
  const mappatura = mappaturaPer(r.chiave, salvate);
  const perUm = mappatura?.prezzoPer === 'um';
  const quantitaMilli = perUm ? quantitaAMilli(r.pezzi * r.contenuto) : Math.trunc(r.pezzi) * 1000;
  const unita = perUm ? r.um : r.umConf;
  if (!mappatura) return { stato: 'da_mappare', quantitaMilli, unita, totaleCent: 0 };
  const articolo = listino.get(mappatura.codice);
  if (!articolo) return { stato: 'fuori_listino', mappatura, quantitaMilli, unita, totaleCent: 0 };
  const totaleCent = totaleRigaDaListino(articolo.prezzo, articolo.scontoBp ? [articolo.scontoBp] : [], quantitaMilli);
  return { stato: 'prezzata', mappatura, articolo, quantitaMilli, unita, totaleCent };
}

export interface TotaleDistinta {
  totaleCent: number;
  prezzate: number;
  daMappare: number;
  fuoriListino: number;
}

/** Il totale delle righe prezzate e quante mancano all'appello. */
export function totaleDistinta(prezzi: readonly PrezzoRiga[]): TotaleDistinta {
  return {
    totaleCent: sommaCent(prezzi.map((p) => p.totaleCent)),
    prezzate: prezzi.filter((p) => p.stato === 'prezzata').length,
    daMappare: prezzi.filter((p) => p.stato === 'da_mappare').length,
    fuoriListino: prezzi.filter((p) => p.stato === 'fuori_listino').length,
  };
}

/** Il listino indicizzato per codice, per le ricerche della distinta. */
export function indiceListino(articoli: readonly ArticoloListino[]): Map<string, ArticoloListino> {
  const m = new Map<string, ArticoloListino>();
  // a codice doppio vale la prima riga, come nella ricerca del gestionale
  for (const a of articoli) if (!m.has(a.codice)) m.set(a.codice, a);
  return m;
}
