/**
 * Motore di calcolo della distinta materiali — funzioni pure, nessuna
 * dipendenza da Firebase né dal listino.
 *
 * Le incidenze NON si calcolano qui: stanno in src/data/sistemi.ts, una tabella
 * per sistema, in due versioni (Excel storico e manuale Fassa). Qui si
 * applicano alle misure:
 *
 *   quantita = incidenza × mq netti            [× (1 + sfrido) su lastre e isolante]
 *   pezzi    = ceil(quantita / confezione)
 *   con sfrido:  pezzi = ceil(ceil(q netta / confezione) × (1 + sfrido))
 *
 * Per pareti e contropareti misurate a L×H si corregge con la geometria:
 *
 *   guide    = 2 × L × file di orditura, in barre da 3 m          (sostituisce l'incidenza)
 *   montanti = (floor(L / interasse) + 1) × file, una barra se h ≤ 3 m,
 *              altrimenti n × h arrotondati a barre             (vince il maggiore)
 *
 * Nessun prezzo qui: la catena dei prezzi sta in money.ts.
 */
import {
  ARTICOLI,
  BARRA_CM,
  PRESTAZIONI,
  PROFILI_PER_AMBITO,
  SISTEMI,
  chiaveArticolo,
  nomeLastra,
} from './data/sistemi';
import type { Ambito, Campitura, Incidenza, Interasse, Modalita, Prestazione, Profilo, Ruolo, Scelte, Sistema, Um, Voce } from './types';

export const SFRIDO_DEFAULT = { lastre: 10, isolante: 10 };

/** Taglia l'errore di virgola mobile alla sesta cifra decimale (come in magazzino-scorte). */
export function round6(x: number): number {
  return Math.floor(x * 1e6 + 0.5) / 1e6;
}

/** ceil senza sorprese: 0,7 × 100 / 10 fa 7,000000000000001 e non deve diventare 8. */
export function arrotondaSu(x: number): number {
  return Math.ceil(round6(x));
}

/** metri → centimetri interi: le misure si prendono al centimetro. */
function cm(m: number): number {
  return Math.round(m * 100);
}

export interface RigaDistinta {
  /** ruolo nel flusso generico (LASTRA, GUIDA…), categoria nel flusso Siniat */
  ruolo: Ruolo | string;
  /** chiave dell'articolo generico per cgp_mapping (LASTRA_BA13_STD, GUIDA_75…) */
  chiave: string;
  descrizione: string;
  um: Um;
  /** incidenza per mq usata */
  incidenza: number;
  /** quantità complessiva nella um, sfrido compreso dove previsto */
  quantita: number;
  /** contenuto della confezione nella um */
  contenuto: number;
  umConf: string;
  /** pezzi o confezioni da ordinare */
  pezzi: number;
  sfridoPct: number;
  /** da dove viene il numero di pezzi */
  metodo: 'incidenza' | 'geometrico';
  /** da dove vengono le incidenze */
  fonte?: 'excel' | 'fassa' | 'memento' | 'regola';
  /** avvertenza sulla riga (es. passo dei tasselli) */
  nota?: string;
  daVerificare?: string;
}

export interface Avviso {
  livello: 'info' | 'attenzione';
  codice:
    | 'ALTEZZA_75_I60' | 'GIUNTO_DILATAZIONE' | 'LANA_OBBLIGATORIA' | 'PROFILO_NON_AMMESSO' | 'MQ_NULLI'
    | 'ALTEZZA_OLTRE_HMAX' | 'STATICA_DA_VERIFICARE' | 'INCIDENZE_STIMATE' | 'VOCE_DA_CALCOLARE' | 'LASTRA_SOSTITUITA';
  testo: string;
}

export interface Distinta {
  sistema: Sistema;
  mqLordi: number;
  mqAperture: number;
  mqNetti: number;
  righe: RigaDistinta[];
  avvisi: Avviso[];
  /** suggerimenti legati alla prestazione, non vincolanti */
  hint: string[];
  /** dicitura obbligatoria sul preventivo (antincendio) */
  dicitura?: string;
}

function valoreIncidenza(inc: Incidenza, interasse: Interasse): number {
  return typeof inc === 'number' ? inc : interasse === 40 ? inc.i40 : inc.i60;
}

function incidenzaVoce(voce: Voce, modalita: Modalita, interasse: Interasse): number | null {
  const inc = modalita === 'manuale' && voce.manuale !== undefined ? voce.manuale : voce.classica;
  return inc === null ? null : valoreIncidenza(inc, interasse);
}

/** Una campitura in interi: superfici in cm², lati in cm. */
export interface Misura {
  lorda: number;
  aperture: number;
  l?: number;
  h?: number;
}

export function misura(c: Campitura): Misura {
  const aperture = (c.aperture ?? []).reduce((acc, a) => acc + cm(a.l) * cm(a.h) * (a.n ?? 1), 0);
  if (c.modo === 'mq') return { lorda: Math.round(c.mq * 10000), aperture };
  const l = cm(c.l);
  const h = cm(c.h);
  return { lorda: l * h, aperture, l, h };
}

export function netta(m: Misura): number {
  return m.lorda - Math.min(m.aperture, m.lorda);
}

/** La distinta materiali per le scelte del wizard. */
export function calcolaDistinta(scelte: Scelte): Distinta {
  const sistema = SISTEMI[scelte.sistemaId];
  const ambito: Ambito = sistema.ambito;
  const prestazione = PRESTAZIONI[scelte.prestazione];
  const avvisi: Avviso[] = [];
  const hint: string[] = [];

  const misure = scelte.campiture.map(misura);
  const lordaCm2 = misure.reduce((a, m) => a + m.lorda, 0);
  const nettaCm2 = misure.reduce((a, m) => a + netta(m), 0);
  const mqNetti = nettaCm2 / 10000;

  if (!PROFILI_PER_AMBITO[ambito].includes(scelte.profilo)) {
    avvisi.push({
      livello: 'attenzione',
      codice: 'PROFILO_NON_AMMESSO',
      testo: `Profilo ${scelte.profilo} non previsto per ${ambito}.`,
    });
  }

  let isolante = scelte.isolante;
  if (prestazione.lanaObbligatoria && !isolante) {
    isolante = true;
    avvisi.push({
      livello: 'info',
      codice: 'LANA_OBBLIGATORIA',
      testo: 'Prestazione acustica: la lana di roccia è obbligatoria ed è stata inserita.',
    });
  }

  // Solo suggerimenti: l'app non certifica nessuna prestazione.
  if (scelte.prestazione === 'antincendio') {
    if (sistema.lastrePerLato === 1) hint.push('Per sistemi antincendio si consiglia la doppia lastra.');
    if (scelte.interasse === 60) hint.push('Per sistemi antincendio si consiglia interasse 40 cm.');
    hint.push('Per classificazioni EI verificare il certificato del sistema.');
  }
  if (scelte.prestazione === 'acustica' && sistema.lastrePerLato === 1) {
    hint.push('Per prestazioni acustiche si consiglia la doppia lastra.');
  }

  const muro = ambito === 'parete' || ambito === 'controparete';
  if (muro) {
    misure.forEach((m, i) => {
      if (m.l === undefined || m.h === undefined) return;
      // con piu' campiture l'avviso dice quale, altrimenti non si sa dove guardare
      const dove = misure.length > 1 ? `Campitura ${i + 1} — ` : '';
      if (m.h > 400 && scelte.profilo === 75 && scelte.interasse === 60 && !sistema.rinforzato) {
        avvisi.push({
          livello: 'attenzione',
          codice: 'ALTEZZA_75_I60',
          testo: `${dove}altezza ${metri(m.h)} m oltre i 4 m con profilo 75 a interasse 60: valutare interasse 40, orditura doppia (dorso/dorso) o cavalieri.`,
        });
      }
      if (m.l > 1500) {
        avvisi.push({
          livello: 'attenzione',
          codice: 'GIUNTO_DILATAZIONE',
          testo: `${dove}lunghezza ${metri(m.l)} m oltre i 15 m: prevedere un giunto di dilatazione ogni 10 m (UNI 11424).`,
        });
      }
    });
  }

  if (nettaCm2 <= 0) {
    avvisi.push({ livello: 'attenzione', codice: 'MQ_NULLI', testo: 'Superficie netta nulla: inserire le misure.' });
  }

  const righe: RigaDistinta[] = [];
  if (nettaCm2 > 0) {
    for (const voce of sistema.voci) {
      if (voce.ruolo === 'ISOLANTE' && !isolante) continue;
      const inc = incidenzaVoce(voce, scelte.modalita, scelte.interasse);
      if (inc === null || inc === 0) continue;

      const art = ARTICOLI[voce.ruolo];
      const sfridoPct = art.sfrido ? scelte.sfrido[art.sfrido] : 0;
      const qtaNetta = inc * mqNetti;

      let quantita = (qtaNetta * (100 + sfridoPct)) / 100;
      let pezzi = pezziConSfrido(qtaNetta, art.contenuto, sfridoPct);
      let metodo: RigaDistinta['metodo'] = 'incidenza';

      if (muro && voce.ruolo === 'GUIDA') {
        const geo = guideGeometriche(misure, inc, sistema.fileOrditura);
        if (geo) {
          // DA CONFERMARE: con le misure L×H vale la geometria anche se da' meno
          // dell'incidenza. Il caso reale vuole 40 guide; con 0,67 ml/mq sarebbero 46.
          quantita = geo.ml;
          pezzi = geo.barre;
          metodo = 'geometrico';
        }
      }
      if (muro && voce.ruolo === 'MONTANTE') {
        const geo = montantiGeometrici(misure, inc, scelte.interasse, sistema.fileOrditura);
        if (geo && geo.barre > pezzi) {
          quantita = geo.ml;
          pezzi = geo.barre;
          metodo = 'geometrico';
        }
      }

      righe.push({
        ruolo: voce.ruolo,
        chiave: chiaveArticolo(voce.ruolo, ambito, scelte.prestazione, scelte.profilo),
        descrizione: descrizioneRiga(voce.ruolo, ambito, scelte.prestazione, scelte.profilo),
        um: art.um,
        incidenza: inc,
        quantita: Math.round(quantita * 1000) / 1000,
        contenuto: art.contenuto,
        umConf: art.umConf,
        pezzi,
        sfridoPct,
        metodo,
        fonte: scelte.modalita === 'manuale' ? 'fassa' : 'excel',
        ...(art.daVerificare ? { daVerificare: art.daVerificare } : {}),
      });
    }
  }

  return {
    sistema,
    mqLordi: lordaCm2 / 10000,
    mqAperture: (lordaCm2 - nettaCm2) / 10000,
    mqNetti,
    righe,
    avvisi,
    hint,
    ...(prestazione.dicitura ? { dicitura: prestazione.dicitura } : {}),
  };
}

/**
 * Pezzi con sfrido: prima i pezzi netti arrotondati, poi lo sfrido, poi di
 * nuovo per eccesso.
 *
 * DA CONFERMARE: e' l'unica lettura che riproduce le 95 lastre del caso reale
 * (204,6 mq / 2,4 = 86 lastre, +10% = 94,6 → 95). La formula secca
 * ceil(204,6 × 1,10 / 2,4) darebbe 94.
 */
export function pezziConSfrido(qtaNetta: number, contenuto: number, sfridoPct: number): number {
  const netti = arrotondaSu(qtaNetta / contenuto);
  return sfridoPct > 0 ? arrotondaSu((netti * (100 + sfridoPct)) / 100) : netti;
}

/**
 * Guide: 2 × L (sopra e sotto) per ogni fila di orditura, in barre da 3 m.
 * Le campiture date a mq contribuiscono con l'incidenza. null se nessuna e' a L×H.
 */
export function guideGeometriche(misure: Misura[], inc: number, file: number): { ml: number; barre: number } | null {
  if (!misure.some((m) => m.l !== undefined)) return null;
  let mlCm = 0;
  for (const m of misure) {
    if (m.l !== undefined) mlCm += 2 * m.l * file;
    else mlCm += (inc * netta(m)) / 100; // cm² × ml/mq → cm
  }
  return { ml: mlCm / 100, barre: arrotondaSu(mlCm / BARRA_CM) };
}

/**
 * Montanti: n = floor(L / interasse) + 1 per campitura e per fila.
 * h ≤ 3 m: una barra intera per montante. h > 3 m: ml = n × h arrotondati a
 * barre, perche' lo spezzone di giunzione si recupera dalle altre barre.
 */
export function montantiGeometrici(
  misure: Misura[],
  inc: number,
  /** interasse in cm (60, 40, 30) */
  interasse: number,
  /** montanti per posizione: file di orditura, x2 se accoppiati */
  file: number,
): { ml: number; barre: number } | null {
  if (!misure.some((m) => m.l !== undefined)) return null;
  let mlCm = 0;
  for (const m of misure) {
    if (m.l !== undefined && m.h !== undefined) {
      const n = (Math.floor(m.l / interasse) + 1) * file;
      mlCm += n * (m.h <= BARRA_CM ? BARRA_CM : m.h);
    } else {
      mlCm += (inc * netta(m)) / 100;
    }
  }
  return { ml: mlCm / 100, barre: arrotondaSu(mlCm / BARRA_CM) };
}

function descrizioneRiga(ruolo: Ruolo, ambito: Ambito, prestazione: Prestazione, profilo: Profilo): string {
  if (ruolo === 'LASTRA') return nomeLastra(ambito, prestazione);
  if (ruolo === 'GUIDA' || ruolo === 'MONTANTE') return `${ARTICOLI[ruolo].descrizione} ${profilo}`;
  return ARTICOLI[ruolo].descrizione;
}

/** 432 cm → "4,32" */
export function metri(centimetri: number): string {
  const dec = String(centimetri % 100).padStart(2, '0').replace(/0+$/, '');
  return dec ? `${Math.floor(centimetri / 100)},${dec}` : String(centimetri / 100);
}
