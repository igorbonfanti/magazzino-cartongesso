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

// ===========================================================================
// CATALOGO SINIAT (src/data/siniat/catalogo.json, generato dallo studio dei manuali)
// ===========================================================================

export type TipoClasse = 'EI' | 'REI' | 'R' | 'E';

export interface Riferimento {
  /** es. "Ist. Giordano 381599-4114FR", "FT SI-017/06/2022" */
  testo: string;
  /** PDF del rapporto su siniat.it, quando la guida lo collega */
  url?: string;
}

/** Una classe ottenuta da una configurazione, con l'altezza per cui vale. */
export interface Classificazione {
  tipo: TipoClasse;
  minuti: number;
  /** direzione del fuoco per i controsoffitti: "a<-b" dal basso, "a<->b" da entrambi */
  direzione?: string;
  /** altezza massima riferita al solo fuoco, m */
  hmax?: number;
  /** "> 4,00 m": oltre il valore, secondo il Fascicolo Tecnico */
  hmaxOltre?: boolean;
  hmaxNota?: string;
  /** luce massima dei controsoffitti autoportanti, m */
  luce?: number;
  riferimenti: Riferimento[];
  pagina: number;
}

export interface Strato {
  lastra: string;
  n: number;
  /** lastre ammesse in alternativa dalla configurazione; la prima è quella in distinta */
  alternative?: string[];
}

/** Stratigrafia letta dalla configurazione: lato1 dall'esterno verso l'orditura, lato2 dall'orditura verso l'esterno. */
export interface Stratigrafia {
  tipo: 'parete' | 'setto' | 'controparete';
  file: 1 | 2;
  lato1: Strato[];
  lato2: Strato[];
  intermedia: Strato[];
  montante?: string | null;
  interasse?: number;
  montanti?: 'singolo' | 'accoppiato';
  isolante?: { descrizione: string; tipo: 'LV' | 'LR' | 'LM'; spessore: number | null; densita: number | null; opzionale: boolean } | null;
}

export interface ConfigurazioneFuoco {
  id: string;
  sezione: string;
  sezioneNome: string;
  normaProva: string;
  gruppo: string;
  orditura: 'singola' | 'doppia';
  codice: string;
  supporto?: string | null;
  esposizione?: string | null;
  strati: string[];
  stratigrafia: Stratigrafia | null;
  classificazioni: Classificazione[];
  rw?: number | null;
  sostituibilita: Record<string, string[]>;
  note: string[];
  pagine: number[];
  promat: boolean;
  /** scheda Memento con le stesse lastre: da lì statica e incidenze */
  sistemaMemento?: string;
  /** variante fissa della scheda Memento (controsoffitti a membrana) */
  varianteMemento?: string;
}

export type InterasseSiniat = '600' | '400' | '300';

export interface FuocoVariante {
  tipo: TipoClasse;
  minuti: number;
  hmax?: number;
  esposizione?: 'lato lastre' | 'bidirezionale';
}

export interface VarianteSistema {
  id: string;
  nome: string | null;
  spessore?: number | null;
  montante?: string | null;
  montanti?: 'singolo' | 'accoppiato' | null;
  /** altezza statica per interasse (Hk = 1 kN/m), m */
  hmax?: Partial<Record<InterasseSiniat, number>>;
  /** pareti esterne: altezza massima unica */
  hmaxUnica?: number;
  hmaxNote?: string;
  fuoco: FuocoVariante[];
  rw?: number;
  rwSenzaLana?: number;
  /** Rw della parete di supporto a cui si riferisce l'Rw delle contropareti */
  rwSupporto?: number;
  peso?: number;
  antieffrazione?: string;
  antisfondellamento?: boolean;
  /** colonna delle incidenze: per interasse (pareti) o unica */
  colonne: Partial<Record<InterasseSiniat | 'unica', string>>;
  altro: Record<string, string | number | boolean>;
}

export interface VoceIncidenza {
  prodotto: string;
  unita: string;
  /** per colonna: numero, oppure testo come "Secondo necessità" */
  valori: Record<string, number | string | null>;
}

export interface SistemaSiniat {
  id: string;
  famiglia: string;
  gruppo: string;
  titolo: string;
  codice: string | null;
  pagina: number | null;
  paginaPdf: number | null;
  lastre: string[];
  isolante: string | null;
  idealePer: string | null;
  badge: string[];
  configurazione: string[];
  noteConfigurazione: string[];
  valutazioni: { urti: [number, number] | null; carico: [number, number] | null; prezzo: [number, number] | null };
  fuocoTesto: string | null;
  antieffrazione: string | null;
  stratigrafia: Stratigrafia | null;
  varianti: VarianteSistema[];
  note: string[];
  /** quantità medie Siniat per m², sfrido già compreso */
  incidenze?: { condizioni: string | null; sfridoIncluso: number; voci: VoceIncidenza[] };
}

export interface CatalogoSiniat {
  generato: string;
  fonti: { id: string; titolo: string; versione: string }[];
  avvertenze: string[];
  lastre: { nome: string; spessore: number; sigla: string }[];
  configurazioni: ConfigurazioneFuoco[];
  sistemi: SistemaSiniat[];
}

// ===========================================================================
// SELETTORE
// ===========================================================================

/** Cosa si vuole realizzare: decide quali famiglie di soluzioni entrano in gioco. */
export type Opera = 'parete' | 'controparete' | 'cavedio' | 'controsoffitto' | 'solaio' | 'esterno';
export type Ambiente = 'normale' | 'umido' | 'bagnato' | 'esterno';

/** Quali soluzioni proporre: con tutte le lastre a magazzino, su ordinazione o tutte. */
export type Disponibilita = 'magazzino' | 'ordine' | 'tutte';

export interface Requisiti {
  opera: Opera;
  /** resistenza al fuoco in minuti, 0 = nessuna */
  fuoco: number;
  /** Rw minimo in dB, 0 = nessuno */
  rw: number;
  /** altezza della parete in m (pareti, contropareti, cavedi, esterni) */
  altezza: number;
  ambiente: Ambiente;
  urti: boolean;
  carichi: boolean;
  antieffrazione: boolean;
}

/** La soluzione scelta dall'operatore: una configurazione certificata o una scheda Memento. */
/**
 * Lastra sostituita come ammette il produttore: la nota di una scheda Memento
 * (pregydro H2 negli ambienti umidi) o la sostituibilità di una configurazione
 * della guida antincendio (per usare le lastre a magazzino).
 */
export interface Sostituzione {
  da: string;
  a: string;
  fonte: 'memento' | 'guida';
  /** la nota o la regola che la ammette */
  motivo: string;
}

export interface SoluzioneScelta {
  tipo: 'certificata' | 'sistema';
  id: string;
  /** variante Memento (orditura) e interasse usati per statica e incidenze */
  varianteId?: string | null;
  interasse?: InterasseSiniat | null;
  sostituzioni?: Sostituzione[];
}
