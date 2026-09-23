import { describe, expect, it } from 'vitest';
// Il catalogo è GENERATO da docs/studio-siniat/script/catalogo_app.py: questi
// test ne fissano la forma e alcuni valori letti a mano sui manuali. Se uno
// diventa rosso dopo una rigenerazione, si corregge lo script, non il test.
import { CATALOGO, configurazione, sistema, variante } from '../src/data/siniat/catalogo';

describe('catalogo Siniat — forma', () => {
  it('96 configurazioni certificate e 53 schede Memento', () => {
    expect(CATALOGO.configurazioni).toHaveLength(96);
    expect(CATALOGO.sistemi).toHaveLength(53);
  });

  it('ogni configurazione ha almeno una classe, ogni classe almeno un riferimento', () => {
    for (const c of CATALOGO.configurazioni) {
      expect(c.classificazioni.length, c.id).toBeGreaterThan(0);
      for (const k of c.classificazioni) expect(k.riferimenti.length, `${c.id} ${k.tipo} ${k.minuti}`).toBeGreaterThan(0);
    }
  });

  it('i link ai rapporti di classificazione sono quelli della guida: siti Siniat o del gruppo Etex', () => {
    const url = CATALOGO.configurazioni.flatMap((c) => c.classificazioni.flatMap((k) => k.riferimenti.map((r) => r.url))).filter(Boolean);
    expect(url.length).toBeGreaterThan(80);
    for (const u of url) expect(u).toMatch(/^https:\/\/(www\.siniat\.it|media\.siniat\.it|etexassets\.azureedge\.net)\//);
  });

  it('ogni scheda Memento collegata esiste e ha le incidenze; la variante fissa è sua', () => {
    for (const c of CATALOGO.configurazioni.filter((x) => x.sistemaMemento)) {
      const s = sistema(c.sistemaMemento!);
      expect(s?.incidenze, c.id).toBeDefined();
      if (c.varianteMemento) expect(variante(c.varianteMemento)?.sistema.id, c.id).toBe(s!.id);
    }
  });

  it('le colonne delle varianti esistono nelle tabelle di incidenza', () => {
    for (const s of CATALOGO.sistemi) {
      const colonne = new Set((s.incidenze?.voci ?? []).flatMap((v) => Object.keys(v.valori)));
      for (const v of s.varianti) for (const col of Object.values(v.colonne)) expect(colonne.has(col!), `${v.id} ${col}`).toBe(true);
    }
  });

  it('lato1 si legge dall\'esterno verso l\'orditura, lato2 dall\'orditura verso l\'esterno', () => {
    for (const c of CATALOGO.configurazioni) {
      const st = c.stratigrafia;
      if (!st || !st.lato2.length) continue;
      // pareti simmetriche: lato1 è lo specchio di lato2
      const l1 = st.lato1.map((x) => x.lastra).join('|');
      const l2 = [...st.lato2].reverse().map((x) => x.lastra).join('|');
      if (c.id !== 'AF-055' && c.id !== 'AF-056' && c.id !== 'AF-054') expect(l1, c.id).toBe(l2);
    }
  });
});

describe('catalogo Siniat — valori letti sui manuali', () => {
  it('AF-009 D125/M75 4 PF13 LM: EI 45 fino a 12 m, EI 120 fino a 5 m (Ist. Giordano 381599-4114FR)', () => {
    const c = configurazione('AF-009')!;
    expect(c.classificazioni.map((k) => [k.tipo, k.minuti, k.hmax])).toEqual([['EI', 45, 12], ['EI', 120, 5]]);
    expect(c.classificazioni[1]!.riferimenti[0]!.testo).toBe('Ist. Giordano 381599-4114FR');
    expect(c.rw).toBe(56);
    expect(c.sistemaMemento).toBe('memento-p33-SX');
    expect(c.stratigrafia).toMatchObject({ tipo: 'parete', file: 1, montante: 'C75', interasse: 600, montanti: 'singolo' });
    expect(c.stratigrafia!.isolante).toMatchObject({ tipo: 'LM', spessore: 45 });
  });

  it('AF-006 2 PSplus + 2 LaDura: la ladura è a vista su entrambi i lati', () => {
    const st = configurazione('AF-006')!.stratigrafia!;
    expect(st.lato1.map((x) => x.lastra)).toEqual(['ladura plus BA13', 'pregyplac plus BA13']);
    expect(st.lato2.map((x) => x.lastra)).toEqual(['pregyplac plus BA13', 'ladura plus BA13']);
  });

  it('Memento p30-DX 2 PS + 2 LD: PS verso l\'orditura, LD a vista (lo dicono le viti della tabella)', () => {
    const st = sistema('memento-p30-DX')!.stratigrafia!;
    expect(st.lato1.map((x) => x.lastra)).toEqual(['ladura plus BA13', 'pregyplac BA13']);
    expect(st.lato2.map((x) => x.lastra)).toEqual(['pregyplac BA13', 'ladura plus BA13']);
  });

  it('AF-048 SLA con connettori PHONI: stratigrafia non ricavabile, niente distinta automatica', () => {
    expect(configurazione('AF-048')!.stratigrafia).toBeNull();
  });

  it('AF-053: la lastra intermedia è a scelta fra tre, in distinta la prima', () => {
    expect(configurazione('AF-053')!.stratigrafia!.intermedia).toEqual([
      { lastra: 'pregyflam BA13', n: 1, alternative: ['pregyflam BA13', 'ladura plus BA13', 'solidtex indoor'] },
    ]);
  });

  it('controsoffitti a membrana certificati collegati alla scheda Memento a membrana', () => {
    expect(configurazione('AF-078')!.varianteMemento).toBe('mem24_cdo_membrana_pregyflam_ba15#0');
    expect(configurazione('AF-079')!.varianteMemento).toBe('mem24_cdo_membrana_pregyflam_ba15#1');
  });

  it('refusi del Memento corretti nello script: p38-DX solidtex, membrana PF15', () => {
    expect(sistema('memento-p38-DX')!.incidenze!.voci[0]!.prodotto).toBe('Lastre solidtex indoor');
    expect(sistema('mem24_cdo_membrana_pregyflam_ba15')!.incidenze!.voci[0]!.prodotto).toBe('Lastre pregyflam BA15');
  });

  it('parete a cappotto: colonne per interasse 600/400/300', () => {
    for (const v of sistema('mem24_parete_perimetrale_aqb_cappotto')!.varianti) {
      expect(v.colonne).toEqual({ '600': '600', '400': '400', '300': '300' });
    }
  });
});
