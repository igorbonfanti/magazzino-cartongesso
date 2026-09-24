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
import { arrotondaSu, pezziConSfrido } from './engine';
import type { RigaDistinta } from './engine';
import type { ArticoloListino } from './lib/listino';
import { mappaturaPer } from './lib/mappatura';
import type { Mappatura, MappaturaRisolta } from './lib/mappatura';
import { quantitaAMilli, sommaCent, totaleRigaDaListino } from './money';

export type StatoPrezzo = 'prezzata' | 'da_mappare' | 'fuori_listino';

/** Una riga della distinta, con la confezione dell'articolo mappato se diversa da quella della voce. */
export type RigaVenduta = RigaDistinta & {
  /** il codice di listino della cui confezione si contano i pezzi (MICRO, BIACAR5…) */
  confezioneListino?: string;
};

/**
 * La riga con la confezione dell'articolo del listino: il nastro in rotoli
 * MICRO da 23 ml, la banda in BIACAR5 da 20 ml, le lastre da 3,6 m². La
 * quantità resta quella della distinta; cambiano i pezzi da ordinare, contati
 * come il motore: con lo sfrido su lastre e isolante (pezziConSfrido), altrimenti
 * a confezioni intere. I montanti contati a barre per posizione (misure L×H)
 * restano come sono se l'articolo è più lungo di 3 m: il conto per barre più
 * lunghe va rifatto a mano, e la riga lo dice.
 *
 * La confezione confermata nella mappatura toglie dalla riga le verifiche su
 * formato, lunghezze e confezioni; le altre ("in alternativa…") restano. Le
 * mappature senza confezione (quelle di partenza, quelle salvate prima) non
 * cambiano niente.
 */
export function conConfezione(r: RigaDistinta, m: Pick<Mappatura, 'codice' | 'contenuto' | 'confezione'> | undefined): RigaVenduta {
  if (!m?.contenuto) return r;
  const contenuto = m.contenuto;
  const umConf = m.confezione?.trim() || r.umConf;
  const verifiche = r.daVerificare
    ?.split('; ')
    .filter((v) => !/^(formato|lunghezza|confezione|profilo e lunghezza)/.test(v))
    .join('; ');
  const { daVerificare: _vecchia, ...resto } = r;
  const confermata: RigaDistinta = { ...resto, ...(verifiche ? { daVerificare: verifiche } : {}) };
  if (Math.abs(contenuto - r.contenuto) < 1e-9 && umConf === r.umConf) return confermata;
  let pezzi: number;
  let nota = r.nota;
  if (r.sfridoPct > 0) {
    // la quantità della riga ha già lo sfrido: si torna alla netta e si ricontano i pezzi
    pezzi = pezziConSfrido((r.quantita * 100) / (100 + r.sfridoPct), contenuto, r.sfridoPct);
  } else if (r.metodo === 'geometrico' && r.ruolo === 'MONTANTE' && contenuto > r.contenuto) {
    pezzi = r.pezzi;
    nota = [r.nota, `contati a barre da ${String(r.contenuto).replace('.', ',')} m: con barre più lunghe il numero va ricontrollato`]
      .filter(Boolean)
      .join('; ');
  } else {
    pezzi = arrotondaSu(r.quantita / contenuto);
  }
  return { ...confermata, contenuto, umConf, pezzi, ...(nota ? { nota } : {}), confezioneListino: m.codice };
}

/** Le righe con le confezioni degli articoli mappati. */
export function adattaRighe(righe: readonly RigaDistinta[], salvate: ReadonlyMap<string, Mappatura>): RigaVenduta[] {
  return righe.map((r) => conConfezione(r, mappaturaPer(r.chiave, salvate)));
}

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
