/**
 * Distinte base dei sistemi a secco. Solo dati: il motore (src/engine.ts) li
 * legge, le pagine NON devono contenere incidenze.
 *
 * Fonti:
 *  - "classica" = Excel storico del magazzino (interasse 60)
 *  - "manuale"  = Manuale Fassa Gypsotech, solo dove differisce; altrimenti = classica
 *
 * Le voci marcate DA CONFERMARE sono ipotesi da verificare con il magazzino.
 */
import type { ArticoloGenerico, InfoPrestazione, Profilo, Ambito, Prestazione, Ruolo, Sistema, SistemaId } from '../types';

/** Lunghezza delle barre dei profili: 3 m. */
export const BARRA_CM = 300;

export const ARTICOLI: Record<Ruolo, ArticoloGenerico> = {
  LASTRA: { descrizione: 'Lastra cartongesso 200×120', um: 'mq', contenuto: 2.4, umConf: 'lastre', sfrido: 'lastre' },
  GUIDA: { descrizione: 'Guida a U', um: 'ml', contenuto: 3, umConf: 'barre' },
  MONTANTE: { descrizione: 'Montante a C', um: 'ml', contenuto: 3, umConf: 'barre' },
  ISOLANTE: { descrizione: 'Lana di roccia in pannelli', um: 'mq', contenuto: 0.72, umConf: 'pannelli', sfrido: 'isolante' },
  TASSELLI: { descrizione: 'Tasselli a vite 6×30', um: 'pz', contenuto: 100, umConf: 'conf.' },
  TASSELLI_FARFALLA: {
    descrizione: 'Tasselli a farfalla',
    um: 'pz',
    contenuto: 1,
    umConf: 'pz',
    daVerificare: 'confezione tasselli a farfalla',
  },
  VITI_25: { descrizione: 'Viti fosfatate 3,5×25', um: 'pz', contenuto: 1000, umConf: 'conf.' },
  VITI_35: { descrizione: 'Viti fosfatate 3,5×35', um: 'pz', contenuto: 1000, umConf: 'conf.' },
  VELOVETRO: { descrizione: 'Nastro velovetro', um: 'ml', contenuto: 90, umConf: 'rotoli' },
  STUCCO: { descrizione: 'Stucco per giunti', um: 'kg', contenuto: 10, umConf: 'sacchi' },
  PENDINI: { descrizione: 'Pendini', um: 'pz', contenuto: 2, umConf: 'conf.' },
  GANCIO_ORTOGONALE: {
    descrizione: 'Gancio ortogonale',
    um: 'pz',
    contenuto: 1,
    umConf: 'pz',
    daVerificare: 'confezione ganci ortogonali',
  },
  GANCIO_MOLLA: { descrizione: 'Gancio a molla', um: 'pz', contenuto: 1, umConf: 'pz', daVerificare: 'confezione ganci a molla' },
  PORTA_F: { descrizione: 'Profilo Porta F', um: 'ml', contenuto: 3, umConf: 'barre' },
  CAVALIERE: { descrizione: 'Gancio distanziatore (cavaliere)', um: 'pz', contenuto: 1, umConf: 'pz', daVerificare: 'confezione cavalieri' },
};

// Montanti in modalità classica a i40: l'Excel storico è solo a i60.
// DA CONFERMARE: estrapolato in proporzione 60/40 (2,0 → 3,0; 4,0 → 6,0).
const MONTANTE_CL = { i60: 2.0, i40: 3.0 };
const MONTANTE_CL_DORSO = { i60: 4.0, i40: 6.0 };
// Manuale Fassa: i40 = 2,6 (5,2 dorso/dorso); a i60 non indicato → come classica.
const MONTANTE_MAN = { i60: 2.0, i40: 2.6 };
const MONTANTE_MAN_DORSO = { i60: 4.0, i40: 5.2 };

// Gancio ortogonale: l'Excel riporta 7 (refuso). Si usa il valore Fassa, minimo della forchetta 1,4–2.
// DA CONFERMARE.
const GANCIO_ORTOGONALE = 1.4;

// Doppia lastra, manuale Fassa: viti 25 solo sulla 1ª lastra + viti 35 sulla 2ª.
// Le forchette del manuale sono lette come i60 (valore basso) / i40 (valore alto). DA CONFERMARE.
const VITI25_MAN_PARETE = { i60: 5, i40: 8 };
const VITI35_MAN_PARETE = { i60: 15, i40: 21 };
const VITI25_MAN_CP = { i60: 3, i40: 4 };
const VITI35_MAN_CP = { i60: 8, i40: 11 };

export const SISTEMI: Record<SistemaId, Sistema> = {
  // ── PARETI ───────────────────────────────────────────────────────────────
  parete_singola: {
    id: 'parete_singola',
    ambito: 'parete',
    nome: 'Parete singola lastra per lato',
    lastrePerLato: 1,
    fileOrditura: 1,
    rinforzato: false,
    voci: [
      { ruolo: 'LASTRA', classica: 2.0 },
      { ruolo: 'GUIDA', classica: 0.67 },
      { ruolo: 'MONTANTE', classica: MONTANTE_CL, manuale: MONTANTE_MAN },
      { ruolo: 'ISOLANTE', classica: 1.0 },
      { ruolo: 'TASSELLI', classica: 1.7 },
      { ruolo: 'VITI_25', classica: 25 },
      { ruolo: 'VELOVETRO', classica: 3.0 },
      { ruolo: 'STUCCO', classica: 0.7 },
    ],
  },
  parete_doppia: {
    id: 'parete_doppia',
    ambito: 'parete',
    nome: 'Parete doppia lastra per lato',
    lastrePerLato: 2,
    fileOrditura: 1,
    rinforzato: false,
    voci: [
      { ruolo: 'LASTRA', classica: 4.0 },
      { ruolo: 'GUIDA', classica: 0.67 },
      { ruolo: 'MONTANTE', classica: MONTANTE_CL, manuale: MONTANTE_MAN },
      { ruolo: 'ISOLANTE', classica: 1.0 },
      { ruolo: 'TASSELLI', classica: 1.7 },
      { ruolo: 'VITI_25', classica: 45, manuale: VITI25_MAN_PARETE },
      { ruolo: 'VITI_35', classica: null, manuale: VITI35_MAN_PARETE },
      { ruolo: 'VELOVETRO', classica: 3.0 },
      { ruolo: 'STUCCO', classica: 1.0 },
    ],
  },
  parete_dorso: {
    id: 'parete_dorso',
    ambito: 'parete',
    nome: 'Parete doppia lastra, orditura doppia (dorso/dorso)',
    lastrePerLato: 2,
    fileOrditura: 2,
    rinforzato: true,
    voci: [
      { ruolo: 'LASTRA', classica: 4.0 },
      { ruolo: 'GUIDA', classica: 0.67, manuale: 1.4 },
      { ruolo: 'MONTANTE', classica: MONTANTE_CL_DORSO, manuale: MONTANTE_MAN_DORSO },
      { ruolo: 'ISOLANTE', classica: 1.0 },
      { ruolo: 'TASSELLI', classica: 1.7 },
      { ruolo: 'VITI_25', classica: 45, manuale: VITI25_MAN_PARETE },
      { ruolo: 'VITI_35', classica: null, manuale: VITI35_MAN_PARETE },
      { ruolo: 'VELOVETRO', classica: 3.0 },
      { ruolo: 'STUCCO', classica: 1.0 },
    ],
  },

  // ── CONTROPARETI ─────────────────────────────────────────────────────────
  controparete_singola: {
    id: 'controparete_singola',
    ambito: 'controparete',
    nome: 'Controparete singola lastra su orditura',
    lastrePerLato: 1,
    fileOrditura: 1,
    rinforzato: false,
    voci: [
      { ruolo: 'LASTRA', classica: 1.0 },
      { ruolo: 'GUIDA', classica: 0.67 },
      { ruolo: 'MONTANTE', classica: MONTANTE_CL, manuale: MONTANTE_MAN },
      { ruolo: 'ISOLANTE', classica: 1.0 },
      { ruolo: 'TASSELLI', classica: 1.7 },
      { ruolo: 'VITI_25', classica: 13 },
      { ruolo: 'VELOVETRO', classica: 1.5 },
      { ruolo: 'STUCCO', classica: 0.5 },
    ],
  },
  controparete_doppia: {
    id: 'controparete_doppia',
    ambito: 'controparete',
    nome: 'Controparete doppia lastra su orditura',
    lastrePerLato: 2,
    fileOrditura: 1,
    rinforzato: false,
    voci: [
      { ruolo: 'LASTRA', classica: 2.0 },
      { ruolo: 'GUIDA', classica: 0.67 },
      { ruolo: 'MONTANTE', classica: MONTANTE_CL, manuale: MONTANTE_MAN },
      { ruolo: 'ISOLANTE', classica: 1.0 },
      { ruolo: 'TASSELLI', classica: 1.7 },
      { ruolo: 'VITI_25', classica: 20, manuale: VITI25_MAN_CP },
      { ruolo: 'VITI_35', classica: null, manuale: VITI35_MAN_CP },
      { ruolo: 'VELOVETRO', classica: 1.5 },
      { ruolo: 'STUCCO', classica: 0.5 },
    ],
  },
  controparete_cavaliere: {
    id: 'controparete_cavaliere',
    ambito: 'controparete',
    nome: 'Controparete singola lastra con gancio distanziatore (cavaliere)',
    lastrePerLato: 1,
    fileOrditura: 1,
    rinforzato: true,
    voci: [
      { ruolo: 'LASTRA', classica: 1.0 },
      { ruolo: 'GUIDA', classica: 0.67 },
      { ruolo: 'MONTANTE', classica: MONTANTE_CL, manuale: MONTANTE_MAN },
      { ruolo: 'ISOLANTE', classica: 1.0 },
      { ruolo: 'TASSELLI', classica: 1.7 },
      { ruolo: 'VITI_25', classica: 13 },
      { ruolo: 'VELOVETRO', classica: 1.5 },
      { ruolo: 'STUCCO', classica: 0.5 },
      // Excel: 4 pz/mq (indipendente dall'interasse). Fassa: 1,8 a i60, 2,6 a i40.
      { ruolo: 'CAVALIERE', classica: 4, manuale: { i60: 1.8, i40: 2.6 } },
    ],
  },

  // ── CONTROSOFFITTI (profilo 30 fisso; manuale = classica, nessuna differenza nota) ──
  controsoffitto_sospeso: {
    id: 'controsoffitto_sospeso',
    ambito: 'controsoffitto',
    nome: 'Controsoffitto sospeso, orditura doppia',
    lastrePerLato: 1,
    fileOrditura: 1,
    rinforzato: false,
    voci: [
      { ruolo: 'LASTRA', classica: 1.0 },
      { ruolo: 'GUIDA', classica: 0.4 },
      { ruolo: 'MONTANTE', classica: 3.0 },
      { ruolo: 'ISOLANTE', classica: 1.0 },
      { ruolo: 'TASSELLI_FARFALLA', classica: 0.84 },
      { ruolo: 'PENDINI', classica: 0.84 },
      { ruolo: 'VITI_25', classica: 15 },
      { ruolo: 'VELOVETRO', classica: 1.2 },
      { ruolo: 'STUCCO', classica: 0.4 },
      { ruolo: 'GANCIO_ORTOGONALE', classica: GANCIO_ORTOGONALE },
      { ruolo: 'GANCIO_MOLLA', classica: 0.84 },
    ],
  },
  controsoffitto_portaf: {
    id: 'controsoffitto_portaf',
    ambito: 'controsoffitto',
    nome: 'Controsoffitto con Porta F',
    lastrePerLato: 1,
    fileOrditura: 1,
    rinforzato: false,
    voci: [
      { ruolo: 'LASTRA', classica: 1.0 },
      { ruolo: 'GUIDA', classica: 0.4 },
      { ruolo: 'MONTANTE', classica: 2.1 },
      { ruolo: 'PORTA_F', classica: 0.9 },
      { ruolo: 'ISOLANTE', classica: 1.0 },
      { ruolo: 'TASSELLI_FARFALLA', classica: 0.84 },
      { ruolo: 'PENDINI', classica: 0.84 },
      { ruolo: 'VITI_25', classica: 15 },
      { ruolo: 'VELOVETRO', classica: 1.2 },
      { ruolo: 'STUCCO', classica: 0.4 },
      { ruolo: 'GANCIO_MOLLA', classica: 0.84 },
    ],
  },
  controsoffitto_aderenza: {
    id: 'controsoffitto_aderenza',
    ambito: 'controsoffitto',
    nome: 'Controsoffitto in aderenza',
    lastrePerLato: 1,
    fileOrditura: 1,
    rinforzato: false,
    voci: [
      { ruolo: 'LASTRA', classica: 1.0 },
      { ruolo: 'GUIDA', classica: 0.4 },
      { ruolo: 'MONTANTE', classica: 2.0 },
      { ruolo: 'ISOLANTE', classica: 1.0 },
      { ruolo: 'TASSELLI', classica: 2.0 },
      { ruolo: 'VITI_25', classica: 15 },
      { ruolo: 'VELOVETRO', classica: 1.2 },
      { ruolo: 'STUCCO', classica: 0.4 },
      { ruolo: 'CAVALIERE', classica: 2.0 },
    ],
  },
};

export const SISTEMI_PER_AMBITO: Record<Ambito, SistemaId[]> = {
  parete: ['parete_singola', 'parete_doppia', 'parete_dorso'],
  controparete: ['controparete_singola', 'controparete_doppia', 'controparete_cavaliere'],
  controsoffitto: ['controsoffitto_sospeso', 'controsoffitto_portaf', 'controsoffitto_aderenza'],
};

export const PROFILI_PER_AMBITO: Record<Ambito, Profilo[]> = {
  parete: [75, 50],
  controparete: [75, 50, 30],
  controsoffitto: [30],
};

export const PRESTAZIONI: Record<Prestazione, InfoPrestazione> = {
  standard: { nome: 'Standard', lanaObbligatoria: false },
  antincendio: {
    nome: 'Antincendio / REI',
    lanaObbligatoria: false,
    dicitura: 'Sistema da verificare su certificato produttore.',
  },
  idro: { nome: 'Idro (locali umidi)', lanaObbligatoria: false },
  acustica: { nome: 'Acustica', lanaObbligatoria: true },
};

/**
 * Chiave dell'articolo generico usata da `cgp_mapping` per trovare il codice di magazzino.
 * La prestazione cambia SOLO la lastra; il profilo cambia guide e montanti.
 */
export function chiaveArticolo(ruolo: Ruolo, ambito: Ambito, prestazione: Prestazione, profilo: Profilo): string {
  switch (ruolo) {
    case 'LASTRA':
      return chiaveLastra(ambito, prestazione);
    case 'GUIDA':
      return `GUIDA_${profilo}`;
    case 'MONTANTE':
      return `MONTANTE_${profilo}`;
    case 'ISOLANTE':
      return 'LANA_ROCCIA';
    default:
      return ruolo;
  }
}

function chiaveLastra(ambito: Ambito, prestazione: Prestazione): string {
  switch (prestazione) {
    case 'standard':
      return ambito === 'controsoffitto' ? 'LASTRA_BA10_STD' : 'LASTRA_BA13_STD';
    case 'antincendio':
      return 'LASTRA_REI';
    case 'idro':
      return 'LASTRA_H2';
    case 'acustica':
      return 'LASTRA_ACUSTICA';
  }
}

export function nomeLastra(ambito: Ambito, prestazione: Prestazione): string {
  switch (prestazione) {
    case 'standard':
      return ambito === 'controsoffitto' ? 'Lastra cartongesso BA10 200×120' : 'Lastra cartongesso BA13 200×120';
    case 'antincendio':
      return 'Lastra ignifuga (tipo DF) 200×120';
    case 'idro':
      return 'Idrolastra H2 200×120';
    case 'acustica':
      return 'Lastra acustica 200×120';
  }
}
