import { describe, expect, it } from 'vitest';
import { calcolaDistinta } from '../src/engine';
import { calcolaDistintaSiniat } from '../src/engine-siniat';
import { terminiRicerca, vociNote } from '../src/data/chiavi';
import { MAPPING_SEED } from '../src/data/mapping_seed';
import { SISTEMI } from '../src/data/sistemi';
import { chiaveValida, mappaturaPer, mappaturaValida } from '../src/lib/mappatura';
import type { Mappatura } from '../src/lib/mappatura';
import type { ArticoloListino } from '../src/lib/listino';
import { indiceListino, prezzaRiga, totaleDistinta } from '../src/prezzi';
import { selezionaSoluzioni } from '../src/selettore';
import type { Opera, Prestazione, SistemaId } from '../src/types';

// Articoli e prezzi di prova, non quelli del magazzino.
const LISTINO: ArticoloListino[] = [
  { codice: 'CAR13', descrizione: 'CARTONGESSO BA13', prezzo: 72000, scontoBp: 1000, fornitore: 'SINIAT', categoria: '' },
  { codice: 'LASTRAMQ', descrizione: 'LASTRA AL MQ', prezzo: 32000, scontoBp: 1000, fornitore: '', categoria: '' },
  { codice: 'CARTOVIT2', descrizione: 'VITI 25 CONF.1000', prezzo: 150000, scontoBp: 0, fornitore: '', categoria: '' },
];
const INDICE = indiceListino(LISTINO);
const NESSUNA = new Map<string, Mappatura>();

const lastra = { chiave: 'LASTRA_BA13_STD', pezzi: 55, contenuto: 2.4, um: 'mq' as const, umConf: 'lastre' };

describe('mappatura', () => {
  it('quella salvata vince su quella di partenza; senza nessuna delle due è da mappare', () => {
    expect(mappaturaPer('LASTRA_BA13_STD', NESSUNA)).toMatchObject({ codice: 'CAR13', origine: 'partenza', prezzoPer: 'confezione' });
    const salvate = new Map([['LASTRA_BA13_STD', { chiave: 'LASTRA_BA13_STD', codice: 'LASTRAMQ', prezzoPer: 'um' as const }]]);
    expect(mappaturaPer('LASTRA_BA13_STD', salvate)).toMatchObject({ codice: 'LASTRAMQ', origine: 'archivio', prezzoPer: 'um' });
    expect(mappaturaPer('LASTRA_SOLIDTEX_INDOOR', NESSUNA)).toBeUndefined();
  });

  it('i documenti di cgp_mapping si controllano prima di usarli', () => {
    expect(mappaturaValida('X', { codice: ' CAR13 ', prezzoPer: 'um', scontoExtraBp: 500 })).toEqual({ chiave: 'X', codice: 'CAR13', prezzoPer: 'um', scontoExtraBp: 500 });
    expect(mappaturaValida('X', { codice: 'CAR13', prezzoPer: 'boh', scontoExtraBp: 1.5 })).toEqual({ chiave: 'X', codice: 'CAR13', prezzoPer: 'confezione' });
    expect(mappaturaValida('X', { codice: '' })).toBeNull();
    expect(mappaturaValida('X', null)).toBeNull();
  });

  it('chiavi valide come ID di documento', () => {
    expect(chiaveValida('GUIDA_PERIMETRALE_S4915_27')).toBe(true);
    expect(chiaveValida('PROFILO_S4915/27')).toBe(false);
    expect(chiaveValida('')).toBe(false);
  });
});

describe('prezzi delle righe', () => {
  it('prezzo per lastra: 55 lastre da 7,20 al −10% = 356,40', () => {
    const p = prezzaRiga(lastra, NESSUNA, INDICE);
    expect(p).toMatchObject({ stato: 'prezzata', quantitaMilli: 55_000, unita: 'lastre', totaleCent: 35640 });
  });

  it('prezzo al m²: 55 lastre = 132 m² a 3,20 al −10% = 380,16', () => {
    const salvate = new Map([['LASTRA_BA13_STD', { chiave: 'LASTRA_BA13_STD', codice: 'LASTRAMQ', prezzoPer: 'um' as const }]]);
    expect(prezzaRiga(lastra, salvate, INDICE)).toMatchObject({ stato: 'prezzata', quantitaMilli: 132_000, unita: 'mq', totaleCent: 38016 });
  });

  it('da mappare e codice che non è nel listino: nessun prezzo inventato', () => {
    expect(prezzaRiga({ ...lastra, chiave: 'LASTRA_SOLIDTEX_INDOOR' }, NESSUNA, INDICE)).toMatchObject({ stato: 'da_mappare', totaleCent: 0 });
    expect(prezzaRiga({ ...lastra, chiave: 'GUIDA_75' }, NESSUNA, INDICE)).toMatchObject({ stato: 'fuori_listino', totaleCent: 0 });
  });

  it('il totale somma le righe prezzate e conta quelle che mancano', () => {
    const prezzi = [
      prezzaRiga(lastra, NESSUNA, INDICE),
      prezzaRiga({ chiave: 'VITI_25', pezzi: 3, contenuto: 1000, um: 'pz', umConf: 'conf.' }, NESSUNA, INDICE),
      prezzaRiga({ ...lastra, chiave: 'LASTRA_SOLIDTEX_INDOOR' }, NESSUNA, INDICE),
      prezzaRiga({ ...lastra, chiave: 'GUIDA_75' }, NESSUNA, INDICE),
    ];
    // 356,40 di lastre + 3 confezioni di viti da 15,00 = 401,40
    expect(totaleDistinta(prezzi)).toEqual({ totaleCent: 35640 + 4500, prezzate: 2, daMappare: 1, fuoriListino: 1 });
  });
});

describe('voci della pagina di mappatura', () => {
  const voci = vociNote();
  const chiavi = new Set(voci.map((v) => v.chiave));

  it('una per chiave, tutte valide come ID di documento, le mappature di partenza comprese', () => {
    expect(chiavi.size).toBe(voci.length);
    for (const v of voci) expect(chiaveValida(v.chiave), v.chiave).toBe(true);
    for (const k of Object.keys(MAPPING_SEED)) expect(chiavi.has(k), k).toBe(true);
  });

  it('comprende ogni voce delle distinte classiche', () => {
    const prestazioni: Prestazione[] = ['standard', 'antincendio', 'idro', 'acustica'];
    for (const id of Object.keys(SISTEMI) as SistemaId[]) {
      const profilo = id.startsWith('controsoffitto') ? 30 : 75;
      for (const prestazione of prestazioni) {
        const d = calcolaDistinta({
          sistemaId: id, prestazione, interasse: 60, profilo, isolante: true, sfrido: { lastre: 10, isolante: 10 },
          modalita: 'classica', campiture: [{ modo: 'mq', mq: 100 }],
        });
        for (const r of d.righe) expect(chiavi.has(r.chiave), `${id} ${prestazione} ${r.chiave}`).toBe(true);
      }
    }
  });

  it('comprende ogni voce delle distinte Siniat, a magazzino e no', () => {
    const casi: [Opera, number, number][] = [['parete', 0, 3], ['parete', 120, 5], ['parete', 45, 7], ['cavedio', 60, 4], ['controparete', 0, 3], ['controsoffitto', 0, 0], ['controsoffitto', 60, 0], ['esterno', 0, 3]];
    let distinte = 0;
    for (const [opera, fuoco, altezza] of casi) {
      const { certificate, sistemi } = selezionaSoluzioni({ opera, fuoco, rw: 0, altezza, ambiente: 'normale', urti: false, carichi: false, antieffrazione: false });
      for (const c of [...certificate, ...sistemi].filter((x) => x.distinta)) {
        const d = calcolaDistintaSiniat(
          { tipo: c.tipo, id: c.id, varianteId: c.variante?.varianteId ?? null, interasse: c.variante?.interasse ?? null, ...(c.sostituzioni ? { sostituzioni: c.sostituzioni } : {}) },
          [{ modo: 'LxH', l: 5, h: 2.7 }],
          { sfrido: { lastre: 10, isolante: 10 } },
        );
        if ('errore' in d) continue;
        distinte++;
        for (const r of d.righe) expect(chiavi.has(r.chiave), `${c.id} ${r.chiave}`).toBe(true);
      }
    }
    expect(distinte).toBeGreaterThan(60);
  });
});

describe('ricerca impostata nella mappatura', () => {
  it('ogni voce parte da qualcosa da cercare', () => {
    for (const v of vociNote()) expect(terminiRicerca(v).trim().length, v.chiave).toBeGreaterThan(1);
  });

  it('radici brevi e il numero che conta', () => {
    const t = (chiave: string) => terminiRicerca(vociNote().find((v) => v.chiave === chiave)!);
    expect(t('GUIDA_75')).toBe('guid 75');
    expect(t('MONTANTE_100')).toBe('montant 100');
    expect(t('VITI_25')).toBe('vit 25');
    expect(t('VITI_S_TEX_32_MM')).toBe('vit 32');
    expect(t('PROFILO_S4927')).toBe('4927');
    expect(t('LASTRA_PREGYFLAM_BA15')).toBe('pregyflam 15');
    expect(t('LASTRA_BA13_STD')).toBe('ba13');
    expect(t('LASTRA_SOLIDTEX_INDOOR')).toBe('solidtex');
    expect(t('CAVALIERE')).toBe('cavalier');
  });
});
