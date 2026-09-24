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
import { arrotondaSu } from './engine';
import type { RigaDistinta } from './engine';
import type { ArticoloListino } from './lib/listino';
import { mappaturaPer } from './lib/mappatura';
import type { Mappatura, MappaturaRisolta } from './lib/mappatura';
import { quantitaAMilli, sommaCent, totaleRigaDaListino } from './money';
import type { Um } from './types';

export type StatoPrezzo = 'prezzata' | 'da_mappare' | 'fuori_listino';

/** Una riga della distinta, con la confezione dell'articolo mappato se diversa da quella della voce. */
export type RigaVenduta = RigaDistinta & {
  /** il codice di listino della cui confezione si contano i pezzi (MICRO, BIACAR5…) */
  confezioneListino?: string;
};

/**
 * La riga con la confezione dell'articolo del listino: il nastro in rotoli
 * MICRO da 23 ml, la banda in BIACAR5 da 20 ml, le lastre da 3,6 m². La
 * quantità resta quella della distinta, sfrido compreso; i pezzi da ordinare
 * sono quanti articoli interi la coprono. Lo sfrido si conta sulla quantità e
 * non sui pezzi come fa il motore (pezziConSfrido): con i rotoli di lana da
 * 12 m² 17,82 m² sono 2 rotoli, e lo sfrido sui pezzi ne aggiungeva un terzo.
 * I montanti contati a barre per posizione (misure L×H) restano come sono se
 * l'articolo è più lungo di 3 m: il conto per barre più lunghe va rifatto a
 * mano, e la riga lo dice.
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
  if (r.metodo === 'geometrico' && r.ruolo === 'MONTANTE' && contenuto > r.contenuto) {
    pezzi = r.pezzi;
    nota = [r.nota, `contati a barre da ${String(r.contenuto).replace('.', ',')} m: con barre più lunghe il numero va ricontrollato`]
      .filter(Boolean)
      .join('; ');
  } else {
    // la quantità ha già lo sfrido (lastre e isolante): articoli interi, arrotondati una volta sola
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
  /** pagata a confezione, il prezzo per unità che ne viene è troppo basso: decimillesimi al pz, al m… */
  prezzoSospetto?: number;
}

/**
 * Il prezzo più basso che un'unità della voce (pz, ml, m², kg) può avere, in
 * decimillesimi di euro: sotto, il prezzo del listino non è della confezione
 * ma dell'unità. Soglie prudenti, lette sul listino del 10/06/2026: i tasselli
 * Akifix a 0,11–0,65 € "pz.100/200" sarebbero 0,0006–0,013 € al tassello, la
 * lana PAR45 a 4,60 € 0,38 € al m² di un rotolo da 12 m², la fascia FONO200 a
 * 1,45 € 0,03 € al m di un rotolo da 50; invece le viti più economiche costano
 * 0,013 € al pz a scatola, le lastre da 3,9 € al m², i profili da 0,7 € al m.
 */
function prezzoMinimoUnita(chiave: string, um: Um): number {
  if (/^TASSELLI/.test(chiave)) return 300; // 0,03 € al tassello
  if (/^(LASTRA|LANA|ISOLANTE)/.test(chiave)) return 10000; // 1 € al m²
  if (/^(GUIDA|MONTANTE|PROFILO|PORTA_F)/.test(chiave)) return 3000; // 0,30 € al m
  return { pz: 40, ml: 500, mq: 2000, kg: 1000 }[um]; // 0,004 € al pz, 0,05 € al m, 0,20 € al m², 0,10 € al kg
}

/**
 * Il prezzo per unità che dà un articolo pagato a confezione, quando è troppo
 * basso per essere vero: 0,12 € per la scatola da 100 tasselli farebbero
 * 0,0012 € al tassello, quindi 0,12 € è il prezzo del tassello e la riga va
 * pagata a pz. In decimillesimi, anche con i decimali; null se è plausibile,
 * se la riga si paga già a unità o se la confezione è di un'unità sola.
 */
export function prezzoUnitaSospetto(
  voce: { chiave: string; um: Um },
  prezzoPer: 'confezione' | 'um',
  contenuto: number,
  prezzo: number,
): number | null {
  if (prezzoPer !== 'confezione' || contenuto <= 1 || prezzo <= 0) return null;
  const unita = prezzo / contenuto;
  return unita < prezzoMinimoUnita(voce.chiave, voce.um) ? unita : null;
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
  const sospetto = prezzoUnitaSospetto(r, mappatura.prezzoPer, r.contenuto, articolo.prezzo);
  return { stato: 'prezzata', mappatura, articolo, quantitaMilli, unita, totaleCent, ...(sospetto !== null ? { prezzoSospetto: sospetto } : {}) };
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
