import { describe, expect, it } from 'vitest';
// Il motore si verifica contro valori CONGELATI in un file a parte, non contro
// numeri riscritti nei test: se un giorno cambia sistemi.ts e qualcosa diventa
// rosso qui, il problema e' nelle incidenze, e il file non si riallinea.
import atteseRaw from './distinte_attese.json';
import { calcolaDistinta } from '../src/engine';
import type { Distinta } from '../src/engine';
import type { Ruolo, Scelte, SistemaId } from '../src/types';

type Coppia = [quantita: number, pezzi: number];

interface Attese {
  excel_100mq: Record<SistemaId, Partial<Record<Ruolo, Coppia>>>;
  caso_reale: { scelte: Scelte; mq_netti: number; pezzi: Partial<Record<Ruolo, number>> };
}

const attese = atteseRaw as unknown as Attese;

function scelte(sistemaId: SistemaId, extra: Partial<Scelte> = {}): Scelte {
  return {
    sistemaId,
    prestazione: 'standard',
    interasse: 60,
    profilo: sistemaId.startsWith('controsoffitto') ? 30 : 75,
    isolante: true,
    sfrido: { lastre: 0, isolante: 0 },
    modalita: 'classica',
    campiture: [{ modo: 'mq', mq: 100 }],
    ...extra,
  };
}

/** ruolo -> [quantità, pezzi] */
function coppie(d: Distinta): Record<string, Coppia> {
  return Object.fromEntries(d.righe.map((r) => [r.ruolo, [r.quantita, r.pezzi]]));
}

function riga(d: Distinta, ruolo: Ruolo) {
  const r = d.righe.find((x) => x.ruolo === ruolo);
  if (!r) throw new Error(`manca la riga ${ruolo}`);
  return r;
}

describe('Excel storico — 100 mq, sfrido 0, interasse 60, classica', () => {
  const sistemi = Object.keys(attese.excel_100mq).filter((k) => !k.startsWith('_')) as SistemaId[];

  it('ci sono tutti e nove i sistemi', () => {
    expect(sistemi).toHaveLength(9);
  });

  for (const id of sistemi) {
    it(id, () => {
      // tutta la mappa: niente voci in piu' ne' in meno rispetto all'Excel
      expect(coppie(calcolaDistinta(scelte(id)))).toEqual(attese.excel_100mq[id]);
    });
  }
});

describe('Caso reale — controparete singola 75, 30 × 2,50 + 30 × 4,32', () => {
  const caso = attese.caso_reale;
  const d = calcolaDistinta(caso.scelte);

  it('mq netti', () => expect(d.mqNetti).toBeCloseTo(caso.mq_netti, 6));

  for (const [ruolo, pezzi] of Object.entries(caso.pezzi) as [Ruolo, number][]) {
    it(`${ruolo}: ${pezzi}`, () => expect(riga(d, ruolo).pezzi).toBe(pezzi));
  }

  it('guide dalla geometria, montanti dall incidenza (geometrico 125 < 137)', () => {
    expect(riga(d, 'GUIDA').metodo).toBe('geometrico');
    expect(riga(d, 'MONTANTE').metodo).toBe('incidenza');
  });

  it('avvisi: altezza 4,32 con 75 a i60, e due pareti oltre i 15 m', () => {
    const codici = d.avvisi.map((a) => a.codice);
    expect(codici.filter((c) => c === 'ALTEZZA_75_I60')).toHaveLength(1);
    expect(codici.filter((c) => c === 'GIUNTO_DILATAZIONE')).toHaveLength(2);
    expect(d.avvisi.find((a) => a.codice === 'ALTEZZA_75_I60')!.testo).toContain('4,32 m');
  });
});

describe('regole del motore', () => {
  it('montanti: vince la geometria quando da piu barre (parete corta)', () => {
    // 1,25 × 2,40 a i60: incidenza 2,0 × 3 mq = 6 ml → 2 barre; floor(125/60)+1 = 3 montanti → 3 barre
    const m = riga(calcolaDistinta(scelte('parete_singola', { campiture: [{ modo: 'LxH', l: 1.25, h: 2.4 }] })), 'MONTANTE');
    expect(m.pezzi).toBe(3);
    expect(m.metodo).toBe('geometrico');
  });

  it('dorso/dorso raddoppia le guide geometriche', () => {
    const d = calcolaDistinta(scelte('parete_dorso', { campiture: [{ modo: 'LxH', l: 6, h: 2.7 }] }));
    expect(riga(d, 'GUIDA').pezzi).toBe(8); // 2 × 6 m × 2 file = 24 ml
  });

  it('le aperture si detraggono', () => {
    const d = calcolaDistinta(
      scelte('parete_singola', { campiture: [{ modo: 'LxH', l: 5, h: 3, aperture: [{ l: 0.9, h: 2.1, n: 2 }] }] }),
    );
    expect(d.mqLordi).toBe(15);
    expect(d.mqAperture).toBeCloseTo(3.78, 6);
    expect(d.mqNetti).toBeCloseTo(11.22, 6);
  });

  it('acustica: lana obbligatoria, cambia solo la lastra', () => {
    const std = calcolaDistinta(scelte('parete_singola', { isolante: false }));
    const ac = calcolaDistinta(scelte('parete_singola', { isolante: false, prestazione: 'acustica' }));
    expect(std.righe.some((r) => r.ruolo === 'ISOLANTE')).toBe(false);
    expect(ac.righe.some((r) => r.ruolo === 'ISOLANTE')).toBe(true);
    expect(ac.avvisi.map((a) => a.codice)).toContain('LANA_OBBLIGATORIA');
    expect(riga(ac, 'LASTRA').chiave).toBe('LASTRA_ACUSTICA');
    expect(riga(ac, 'LASTRA').pezzi).toBe(riga(std, 'LASTRA').pezzi);
  });

  it('antincendio: suggerimenti e dicitura, nessuna certificazione', () => {
    const d = calcolaDistinta(scelte('parete_singola', { prestazione: 'antincendio' }));
    expect(d.dicitura).toBe('Sistema da verificare su certificato produttore.');
    expect(d.hint).toHaveLength(3);
    expect(riga(d, 'LASTRA').chiave).toBe('LASTRA_REI');
  });

  it('chiavi articolo: BA10 nel controsoffitto, profilo in guide e montanti', () => {
    const cs = calcolaDistinta(scelte('controsoffitto_sospeso'));
    expect(riga(cs, 'LASTRA').chiave).toBe('LASTRA_BA10_STD');
    expect(riga(cs, 'GUIDA').chiave).toBe('GUIDA_30');
    expect(riga(calcolaDistinta(scelte('parete_singola', { profilo: 50 })), 'MONTANTE').chiave).toBe('MONTANTE_50');
  });

  it('manuale Fassa, doppia lastra: viti 25 sulla prima e viti 35 sulla seconda', () => {
    const p = coppie(calcolaDistinta(scelte('parete_doppia', { modalita: 'manuale' })));
    expect(p.VITI_25).toEqual([500, 1]);
    expect(p.VITI_35).toEqual([1500, 2]);
    const c = coppie(calcolaDistinta(scelte('controparete_doppia', { modalita: 'manuale', interasse: 40 })));
    expect(c.VITI_25).toEqual([400, 1]);
    expect(c.VITI_35).toEqual([1100, 2]);
    expect(c.MONTANTE).toEqual([260, 87]);
  });

  it('manuale Fassa, dorso/dorso a i40: guida 1,4 e montante 5,2', () => {
    const d = coppie(calcolaDistinta(scelte('parete_dorso', { modalita: 'manuale', interasse: 40 })));
    expect(d.GUIDA).toEqual([140, 47]);
    expect(d.MONTANTE).toEqual([520, 174]);
  });

  it('sfrido su lastre e isolante, mai sui profili', () => {
    const d = coppie(calcolaDistinta(scelte('controparete_singola', { sfrido: { lastre: 10, isolante: 10 } })));
    // lo sfrido sulla quantità, arrotondata una volta sola (dal 24/09/2026)
    expect(d.LASTRA).toEqual([110, 46]); // 110 mq / 2,4 = 45,8 → 46 (sui pezzi: 42 → 46,2 → 47)
    expect(d.ISOLANTE).toEqual([110, 153]); // 110 mq / 0,72 = 152,8 → 153
    expect(d.GUIDA).toEqual([67, 23]);
  });

  it('virgola mobile: 0,7 kg × 100 mq fa 7 sacchi, non 8', () => {
    expect(coppie(calcolaDistinta(scelte('parete_singola'))).STUCCO).toEqual([70, 7]);
  });

  it('senza misure: nessuna riga e un avviso', () => {
    const d = calcolaDistinta(scelte('parete_singola', { campiture: [] }));
    expect(d.righe).toHaveLength(0);
    expect(d.avvisi.map((a) => a.codice)).toContain('MQ_NULLI');
  });
});
