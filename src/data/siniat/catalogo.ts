/**
 * Catalogo Siniat per l'app.
 *
 * Il JSON è GENERATO da docs/studio-siniat/script/catalogo_app.py a partire
 * dallo studio dei manuali (guida antincendio luglio 2026, Memento 2024).
 * Non si modifica a mano: un valore sbagliato si corregge nello script o
 * nelle estrazioni e si rigenera, come il seed di magazzino-scorte.
 */
import dati from './catalogo.json';
import { aMagazzino } from '../magazzino';
import { lastraDaTesto } from './articoli';
import type { CatalogoSiniat, ConfigurazioneFuoco, SistemaSiniat, Sostituzione, Strato, Stratigrafia, VarianteSistema } from '../../types';

export const CATALOGO = dati as unknown as CatalogoSiniat;

const CONFIGURAZIONI = new Map(CATALOGO.configurazioni.map((c) => [c.id, c]));
const SISTEMI = new Map(CATALOGO.sistemi.map((s) => [s.id, s]));
const LASTRE = new Map(CATALOGO.lastre.map((l) => [l.nome, l]));

export function configurazione(id: string): ConfigurazioneFuoco | undefined {
  return CONFIGURAZIONI.get(id);
}

export function sistema(id: string): SistemaSiniat | undefined {
  return SISTEMI.get(id);
}

/** La variante di una scheda, dal suo id ("memento-p33-SX#2"). */
export function variante(id: string): { sistema: SistemaSiniat; variante: VarianteSistema } | undefined {
  const s = SISTEMI.get(id.split('#')[0]!);
  const v = s?.varianti.find((x) => x.id === id);
  return s && v ? { sistema: s, variante: v } : undefined;
}

/** Spessore in mm di una lastra del catalogo; 12,5 se non è in elenco. */
export function spessoreLastra(nome: string): number {
  return LASTRE.get(nome)?.spessore ?? 12.5;
}

/** Montanti confrontabili: C50 < C75 < C100 < C150. null per i profili da controsoffitto. */
export function misuraMontante(m: string | null | undefined): number | null {
  const x = /^C(\d+)/.exec(m ?? '');
  return x ? +x[1]! : null;
}

// ---------------------------------------------------------------- lastre e magazzino

const RIGA_LASTRA = /^\s*(?:n\.\s*)?(\d+)\s*(?:x\s*(\d+)\s*mm\s*)?(.+)$/i;

/** "2 pregyflam BA15" → "pregyflam BA15"; null se la riga non è una lastra del catalogo. */
function lastraDaRiga(riga: string): string | null {
  if (/orditura|lana|intercapedine|guida|montant|placcaggio|supporto|isolamento/i.test(riga)) return null;
  const m = RIGA_LASTRA.exec(riga);
  if (!m) return null;
  const nome = lastraDaTesto(m[2] ? riga : m[3]!);
  return LASTRE.has(nome) ? nome : null;
}

/** Le lastre di una configurazione: dalla stratigrafia o, se manca, dalle righe degli strati. */
export function lastreConfigurazione(c: ConfigurazioneFuoco): string[] {
  const st = c.stratigrafia;
  const tutte = st
    ? [...st.lato1, ...st.lato2, ...st.intermedia].map((s) => s.lastra)
    : c.strati.map(lastraDaRiga).filter((x): x is string => !!x);
  return [...new Set(tutte)];
}

/** La stratigrafia con le lastre sostituite. */
export function sostituisciStratigrafia(st: Stratigrafia, sostituzioni: Sostituzione[]): Stratigrafia {
  if (!sostituzioni.length) return st;
  const sost = (l: Strato[]) =>
    l.map((s) => {
      const x = sostituzioni.find((y) => y.da === s.lastra);
      return x ? { lastra: x.a, n: s.n } : s;
    });
  return { ...st, lato1: sost(st.lato1), lato2: sost(st.lato2), intermedia: sost(st.intermedia) };
}

/**
 * Un nome della sostituibilità ("solidtex indoor", "pregydro"…) come lastra
 * del catalogo, nello spessore della lastra che sostituisce.
 */
function lastraSostitutiva(nome: string, originale: string): string {
  const n = nome.toLowerCase().trim();
  const quindici = spessoreLastra(originale) >= 15;
  if (n === 'pregydro') return 'pregydro H2 BA13';
  if (n === 'pregyplac') return quindici ? nome : 'pregyplac BA13';
  if (n === 'pregyflam') return quindici ? 'pregyflam BA15' : 'pregyflam BA13';
  if (n.startsWith('solidtex indoor')) return 'solidtex indoor';
  // le altre non sono a magazzino: basta non confonderle con quelle che ci sono
  return nome;
}

/**
 * Le sostituzioni che la guida ammette per questa configurazione e che la
 * portano tutta su lastre a magazzino: [] se lo è già, null se non basta.
 * Per ogni lastra la prima sostituta a magazzino nell'ordine della guida, con
 * lo stesso spessore di quella provata.
 */
export function sostituzioniMagazzino(c: ConfigurazioneFuoco): Sostituzione[] | null {
  const sostituzioni: Sostituzione[] = [];
  for (const da of lastreConfigurazione(c)) {
    if (aMagazzino(da)) continue;
    const a = (c.sostituibilita[da] ?? [])
      .map((nome) => lastraSostitutiva(nome, da))
      .find((l) => aMagazzino(l) && spessoreLastra(l) === spessoreLastra(da));
    if (!a) return null;
    sostituzioni.push({ da, a, fonte: 'guida', motivo: `sostituibilità indicata dalla guida antincendio per ${c.id}` });
  }
  return sostituzioni;
}

/**
 * Spessore della lana in una scheda Memento per il montante scelto: la scheda
 * lo dice per ogni orditura ("Lana minerale sp. 40/60/80/140 mm" con
 * M(50/75/100/150)), o una volta sola ("sp. min. 50 mm"). Dove non lo dice,
 * l'abbinamento delle pareti a singola orditura: 40 mm sul 50, 60 sul 75, 80
 * sul 100, 140 sul 150. null per i profili dei controsoffitti.
 */
const SPESSORE_PER_MONTANTE: Record<number, number> = { 50: 40, 75: 60, 100: 80, 150: 140 };

export function spessoreIsolante(s: SistemaSiniat, montante: string | null | undefined): number | null {
  const mis = misuraMontante(montante);
  const testo = (s.isolante ?? '').toLowerCase();
  const elenco = /sp\.\s*([\d/]+)\s*mm/.exec(testo)?.[1]?.split('/').map(Number);
  const montanti = /m\(([\d/]+)\)/i.exec(s.codice ?? '')?.[1]?.split('/').map(Number);
  if (elenco && elenco.length === 1) return elenco[0]!;
  if (elenco && montanti && elenco.length === montanti.length && mis != null) {
    const i = montanti.indexOf(mis);
    if (i >= 0) return elenco[i]!;
  }
  const minimo = /sp\.\s*min\.\s*(\d+)\s*mm/.exec(testo)?.[1];
  if (minimo) return Number(minimo);
  return mis != null ? SPESSORE_PER_MONTANTE[mis] ?? null : null;
}
