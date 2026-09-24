/**
 * Tutte le voci che una distinta può contenere, con la loro chiave: quelle del
 * calcolo classico e quelle delle soluzioni Siniat (tabelle Memento, regole
 * per le certificate, lastre sostituite per il magazzino). E' l'elenco della
 * pagina di mappatura: ogni chiave va associata a un codice del listino.
 *
 * Si ricava dai dati, non si scrive a mano: se il catalogo cambia, cambia
 * anche l'elenco.
 */
import { ARTICOLI, PROFILI_PER_AMBITO, SISTEMI_PER_AMBITO, chiaveArticolo, nomeLastra } from './sistemi';
import { articoloSiniat } from './siniat/articoli';
import { CATALOGO, sostituisciStratigrafia, sostituzioniMagazzino } from './siniat/catalogo';
import { conSpessore, incidenzeDaRegola, nomeIsolante } from '../engine-siniat';
import type { Ambito, Prestazione, Ruolo, Um } from '../types';

export interface VoceNota {
  chiave: string;
  descrizione: string;
  /** LASTRA, GUIDA, VITI… per raggruppare */
  categoria: string;
  um: Um;
  contenuto: number;
  umConf: string;
  /** da dove arriva: il calcolo classico, le soluzioni Siniat o tutti e due */
  fonti: ('classico' | 'siniat')[];
}

const PRESTAZIONI: Prestazione[] = ['standard', 'antincendio', 'idro', 'acustica'];

/** Le categorie del calcolo classico con i nomi di quelle Siniat, per raggrupparle insieme. */
const CATEGORIA_CLASSICA: Record<Ruolo, string> = {
  LASTRA: 'LASTRA',
  GUIDA: 'GUIDA',
  MONTANTE: 'MONTANTE',
  ISOLANTE: 'ISOLANTE',
  TASSELLI: 'TASSELLI',
  TASSELLI_FARFALLA: 'TASSELLI',
  VITI_25: 'VITI',
  VITI_35: 'VITI',
  VELOVETRO: 'NASTRO',
  STUCCO: 'STUCCO',
  PENDINI: 'ACCESSORIO',
  GANCIO_ORTOGONALE: 'ACCESSORIO',
  GANCIO_MOLLA: 'ACCESSORIO',
  PORTA_F: 'PROFILO',
  CAVALIERE: 'ACCESSORIO',
};

function aggiungi(elenco: Map<string, VoceNota>, v: Omit<VoceNota, 'fonti'>, fonte: 'classico' | 'siniat') {
  const c = elenco.get(v.chiave);
  if (c) {
    if (!c.fonti.includes(fonte)) c.fonti.push(fonte);
    return;
  }
  elenco.set(v.chiave, { ...v, fonti: [fonte] });
}

function vociClassiche(elenco: Map<string, VoceNota>) {
  for (const ambito of Object.keys(SISTEMI_PER_AMBITO) as Ambito[]) {
    for (const ruolo of Object.keys(ARTICOLI) as Ruolo[]) {
      const a = ARTICOLI[ruolo];
      const profili = ruolo === 'GUIDA' || ruolo === 'MONTANTE' ? PROFILI_PER_AMBITO[ambito] : [PROFILI_PER_AMBITO[ambito][0]!];
      const prestazioni = ruolo === 'LASTRA' ? PRESTAZIONI : ['standard' as const];
      for (const profilo of profili) {
        for (const prestazione of prestazioni) {
          const chiave = chiaveArticolo(ruolo, ambito, prestazione, profilo);
          const descrizione =
            ruolo === 'LASTRA' ? nomeLastra(ambito, prestazione) : ruolo === 'GUIDA' || ruolo === 'MONTANTE' ? `${a.descrizione} ${profilo}` : a.descrizione;
          aggiungi(elenco, { chiave, descrizione, categoria: CATEGORIA_CLASSICA[ruolo], um: a.um, contenuto: a.contenuto, umConf: a.umConf }, 'classico');
        }
      }
    }
  }
}

function vocePerSiniat(elenco: Map<string, VoceNota>, prodotto: string, unita: string, montante: string | null | undefined) {
  const a = articoloSiniat(prodotto, unita, montante);
  aggiungi(elenco, { chiave: a.chiave, descrizione: a.descrizione, categoria: a.categoria, um: a.um, contenuto: a.contenuto, umConf: a.umConf }, 'siniat');
}

function vociSiniat(elenco: Map<string, VoceNota>) {
  // tabelle Memento, con i montanti di ogni variante (guide e montanti 50…150)
  for (const s of CATALOGO.sistemi) {
    const montanti = [...new Set(s.varianti.map((v) => v.montante ?? null))];
    for (const v of s.incidenze?.voci ?? []) {
      for (const m of montanti.length ? montanti : [null]) vocePerSiniat(elenco, conSpessore(v.prodotto, s, m), v.unita, m);
    }
  }
  // regole per le certificate, anche con le lastre sostituite per il magazzino;
  // le chiavi non dipendono dall'interasse, solo le quantità
  for (const c of CATALOGO.configurazioni) {
    const st = c.stratigrafia;
    if (!st || c.promat || (st.tipo !== 'parete' && st.tipo !== 'setto')) continue;
    const varianti = [st, sostituisciStratigrafia(st, sostituzioniMagazzino(c) ?? [])];
    for (const x of varianti) {
      for (const acc of [false, true]) {
        for (const v of incidenzeDaRegola(x, '600', acc)) vocePerSiniat(elenco, v.prodotto, v.unita, x.montante);
      }
    }
    if (st.isolante) vocePerSiniat(elenco, nomeIsolante(st.isolante), 'm²', st.montante);
  }
  // tasselli delle guide, che il motore Siniat aggiunge sempre alle pareti
  aggiungi(elenco, { chiave: 'TASSELLI', descrizione: 'Tasselli per le guide', categoria: 'TASSELLI', um: 'pz', contenuto: 100, umConf: 'conf.' }, 'siniat');
}

/** L'elenco di tutte le voci, ordinato per categoria e chiave. */
export function vociNote(): VoceNota[] {
  const elenco = new Map<string, VoceNota>();
  vociClassiche(elenco);
  vociSiniat(elenco);
  return [...elenco.values()].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.chiave.localeCompare(b.chiave));
}

/**
 * Le parole con cui cominciare a cercare la voce nel listino: radici brevi
 * ("guid", "montant", "vit") perché i listini scrivono GUIDA, GUIDE o
 * GUIDA U, e il numero che conta (75, 25, 4927). Si possono cambiare: è
 * solo il punto di partenza della ricerca.
 */
export function terminiRicerca(v: Pick<VoceNota, 'chiave' | 'descrizione' | 'categoria'>): string {
  const d = v.descrizione.toLowerCase();
  const numero = /_(\d{2,3})(?:_MM)?$/.exec(v.chiave)?.[1];
  switch (v.categoria) {
    case 'LASTRA': {
      const famiglia = /(pregyflam|solidtex|pregydro|ladura|aquaboard|easy pro|easy|pregyflex|soundboard|vapor|creason|ignifug|idro|acustic)/.exec(d)?.[1];
      const spessore = /ba\s?(\d{1,2})\b/.exec(d)?.[1] ?? /\b(\d{1,2})\s*mm/.exec(d)?.[1];
      if (famiglia) return famiglia === 'ignifug' || famiglia === 'idro' || famiglia === 'acustic' ? famiglia : `${famiglia}${spessore && famiglia !== 'solidtex' && famiglia !== 'aquaboard' ? ` ${spessore}` : ''}`;
      return spessore ? `ba${spessore}` : 'lastr';
    }
    case 'GUIDA':
      return /PERIMETRAL/.test(v.chiave) ? 'guid perimetral' : numero ? `guid ${numero}` : 'guid';
    case 'MONTANTE':
      return /^PROFILO_S(\d{4})/.exec(v.chiave)?.[1] ?? (numero ? `montant ${numero}` : 'montant');
    case 'PROFILO':
      return /S(\d{4})/.exec(v.chiave)?.[1] ?? (/porta f/.test(d) ? 'porta f' : 'profil');
    case 'VITI':
      return numero ? `vit ${numero}` : 'vit';
    case 'TASSELLI':
      return /farfalla/.test(d) ? 'tassel farfalla' : 'tassel';
    case 'ISOLANTE':
      return /eps/.test(d) ? 'eps' : /roccia/.test(d) ? 'lana roccia' : 'lana';
    case 'NASTRO':
      return /velovetro/.test(d) ? 'velovetro' : 'nastro';
    case 'STUCCO':
      return /aquaboard/.test(d) ? 'stucco aquaboard' : 'stucco';
    case 'BANDA':
      return 'banda';
    default: {
      if (v.chiave === 'CAVALIERE') return 'cavalier';
      // accessori e rasatura: la prima parola che dice cos'è
      const parola = d.split(/[^a-zà-ù]+/).find((w) => w.length > 3 && !['lastra', 'pregymetal', 'siniat'].includes(w));
      return parola ? parola.slice(0, 6) : v.chiave.toLowerCase();
    }
  }
}
