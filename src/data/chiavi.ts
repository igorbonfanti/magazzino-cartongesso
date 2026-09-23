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
import { incidenzeDaRegola } from '../engine-siniat';
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
      for (const m of montanti.length ? montanti : [null]) vocePerSiniat(elenco, v.prodotto, v.unita, m);
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
    if (st.isolante) {
      const tipo = st.isolante.tipo === 'LR' ? 'lana di roccia' : st.isolante.tipo === 'LV' ? 'lana di vetro' : 'lana minerale';
      vocePerSiniat(elenco, `Isolante in ${tipo}`, 'm²', st.montante);
    }
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
