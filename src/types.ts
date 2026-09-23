export type Ambito = 'parete' | 'controparete' | 'controsoffitto';
export type Prestazione = 'standard' | 'antincendio' | 'idro' | 'acustica';
/** interasse dei montanti, in cm */
export type Interasse = 60 | 40;
/** quale tabella di incidenze: Excel storico o manuale Fassa */
export type Modalita = 'classica' | 'manuale';
export type Profilo = 75 | 50 | 30;

export type SistemaId =
  | 'parete_singola'
  | 'parete_doppia'
  | 'parete_dorso'
  | 'controparete_singola'
  | 'controparete_doppia'
  | 'controparete_cavaliere'
  | 'controsoffitto_sospeso'
  | 'controsoffitto_portaf'
  | 'controsoffitto_aderenza';

/** Ruolo dell'articolo nella distinta: l'articolo "generico", prima di sapere che codice ha in magazzino. */
export type Ruolo =
  | 'LASTRA'
  | 'GUIDA'
  | 'MONTANTE'
  | 'ISOLANTE'
  | 'TASSELLI'
  | 'TASSELLI_FARFALLA'
  | 'VITI_25'
  | 'VITI_35'
  | 'VELOVETRO'
  | 'STUCCO'
  | 'PENDINI'
  | 'GANCIO_ORTOGONALE'
  | 'GANCIO_MOLLA'
  | 'PORTA_F'
  | 'CAVALIERE';

export type Um = 'mq' | 'ml' | 'pz' | 'kg';

export interface ArticoloGenerico {
  descrizione: string;
  /** unità dell'incidenza (per mq di superficie) */
  um: Um;
  /** contenuto della confezione, nella stessa um: 2,4 mq per lastra, 3 ml per barra */
  contenuto: number;
  /** come si chiama la confezione (lastre, barre, rotoli…) */
  umConf: string;
  /** a quale sfrido è soggetto l'articolo; nessuno se assente */
  sfrido?: 'lastre' | 'isolante';
  /** confezione non ancora verificata sul listino */
  daVerificare?: string;
}

/** Incidenza per mq: unica, oppure diversa per interasse. */
export type Incidenza = number | { i60: number; i40: number };

export interface Voce {
  ruolo: Ruolo;
  /** null = voce assente in modalità classica */
  classica: Incidenza | null;
  /** undefined = uguale a classica; null = voce assente in modalità manuale */
  manuale?: Incidenza | null;
}

export interface Sistema {
  id: SistemaId;
  ambito: Ambito;
  nome: string;
  /** lastre per lato: 1 singola, 2 doppia */
  lastrePerLato: 1 | 2;
  /** file di orditura: 2 = dorso/dorso, raddoppia montanti e guide nel calcolo geometrico */
  fileOrditura: 1 | 2;
  /** sistema che già regge le altezze elevate (dorso/dorso, cavalieri) */
  rinforzato: boolean;
  voci: Voce[];
}

export interface InfoPrestazione {
  nome: string;
  /** l'isolante non si può togliere */
  lanaObbligatoria: boolean;
  /** dicitura da riportare sul preventivo */
  dicitura?: string;
}

/** Apertura da detrarre (porta, finestra): misure in metri, n = quante. */
export interface Apertura {
  l: number;
  h: number;
  n?: number;
}

/** Campitura: mq diretti oppure L×H in metri. */
export type Campitura =
  | { modo: 'mq'; mq: number; aperture?: Apertura[] }
  | { modo: 'LxH'; l: number; h: number; aperture?: Apertura[] };

/** Le scelte del wizard: tutto quello che serve al motore. */
export interface Scelte {
  sistemaId: SistemaId;
  prestazione: Prestazione;
  interasse: Interasse;
  profilo: Profilo;
  isolante: boolean;
  /** sfrido in percentuale intera (10 = 10%) */
  sfrido: { lastre: number; isolante: number };
  modalita: Modalita;
  campiture: Campitura[];
}
