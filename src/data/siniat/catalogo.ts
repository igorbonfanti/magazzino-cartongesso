/**
 * Catalogo Siniat per l'app.
 *
 * Il JSON è GENERATO da docs/studio-siniat/script/catalogo_app.py a partire
 * dallo studio dei manuali (guida antincendio luglio 2026, Memento 2024).
 * Non si modifica a mano: un valore sbagliato si corregge nello script o
 * nelle estrazioni e si rigenera, come il seed di magazzino-scorte.
 */
import dati from './catalogo.json';
import type { CatalogoSiniat, ConfigurazioneFuoco, SistemaSiniat, VarianteSistema } from '../../types';

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
