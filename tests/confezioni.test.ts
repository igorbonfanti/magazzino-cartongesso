import { describe, expect, it } from 'vitest';
import { articoloSiniat } from '../src/data/siniat/articoli';
import { sistema, spessoreIsolante } from '../src/data/siniat/catalogo';
import type { RigaDistinta } from '../src/engine';
import { confezioneDaDescrizione } from '../src/lib/listino';
import { mappaturaValida } from '../src/lib/mappatura';
import { conConfezione, indiceListino, prezzaRiga } from '../src/prezzi';

// Codici e prezzi di prova, non quelli del magazzino (salvo i nomi degli
// esempi fatti dall'utente: MICRO, BIACAR5).

describe('confezione letta dalla descrizione del listino', () => {
  it('i casi del magazzino: rotoli, barre, sacchi, confezioni, lastre, pacchi', () => {
    expect(confezioneDaDescrizione('MICRO: carta microforata rotolo ml.23', 'ml')).toEqual({ contenuto: 23, confezione: 'rotoli' });
    expect(confezioneDaDescrizione('BIACAR5: biadesivo per cartongesso cm5 ml.20', 'ml')).toEqual({ contenuto: 20, confezione: 'rotoli' });
    expect(confezioneDaDescrizione('VELOVETRO ML.90 AKIFIX', 'ml')).toEqual({ contenuto: 90, confezione: 'rotoli' });
    expect(confezioneDaDescrizione('GUIDA U 75/40 BARRA 3 M', 'ml')).toEqual({ contenuto: 3, confezione: 'barre' });
    expect(confezioneDaDescrizione('STUCCO KG.10 SINIAT', 'kg')).toEqual({ contenuto: 10, confezione: 'sacchi' });
    expect(confezioneDaDescrizione('VITI 3,5X25 FOSFATATE CONF.1000', 'pz')).toEqual({ contenuto: 1000, confezione: 'conf.' });
    expect(confezioneDaDescrizione('CARTONGESSO BA13 LASTRA CM.200x120', 'mq')).toEqual({ contenuto: 2.4, confezione: 'lastre' });
    expect(confezioneDaDescrizione('LASTRA REI 15 MM 300X120', 'mq')).toEqual({ contenuto: 3.6, confezione: 'lastre' });
    expect(confezioneDaDescrizione('LANA ROCCIA SP.40 PACCO MQ 4,32', 'mq')).toEqual({ contenuto: 4.32, confezione: 'pacchi' });
  });

  it('non inventa: senza misura nella descrizione niente proposta, e M75 non sono 75 metri', () => {
    expect(confezioneDaDescrizione('MONTANTE M75 SINIAT', 'ml')).toBeNull();
    expect(confezioneDaDescrizione('NASTRO CARTA', 'ml')).toBeNull();
    expect(confezioneDaDescrizione('STUCCO IN PASTA', 'kg')).toBeNull();
  });
});

describe("confezione dell'articolo mappato", () => {
  const riga = (x: Partial<RigaDistinta>): RigaDistinta => ({
    ruolo: 'NASTRO', chiave: 'NASTRO_CARTA', descrizione: 'Nastro in carta per giunti', um: 'ml', incidenza: 1.8, quantita: 54,
    contenuto: 1, umConf: 'm', pezzi: 54, sfridoPct: 0, metodo: 'incidenza', ...x,
  });

  it('nastro in rotoli MICRO da 23 ml: 54 m fanno 3 rotoli, pagati a rotolo', () => {
    const m = { chiave: 'NASTRO_CARTA', codice: 'MICRO', prezzoPer: 'confezione' as const, contenuto: 23, confezione: 'rotoli' };
    const r = conConfezione(riga({}), m);
    expect(r).toMatchObject({ pezzi: 3, contenuto: 23, umConf: 'rotoli', confezioneListino: 'MICRO', quantita: 54 });
    const listino = indiceListino([{ codice: 'MICRO', descrizione: 'CARTA MICROFORATA ROTOLO ML.23', prezzo: 25000, scontoBp: 0, fornitore: '', categoria: '' }]);
    // 3 rotoli da 2,50 = 7,50
    expect(prezzaRiga(r, new Map([['NASTRO_CARTA', m]]), listino)).toMatchObject({ stato: 'prezzata', quantitaMilli: 3000, totaleCent: 750 });
  });

  it('banda BIACAR5 da 20 ml per la struttura da 50: 21 m fanno 2 rotoli', () => {
    const r = conConfezione(riga({ ruolo: 'BANDA', chiave: 'BANDA_50', quantita: 21, pezzi: 21 }), { codice: 'BIACAR5', contenuto: 20, confezione: 'rotoli' });
    expect(r.pezzi).toBe(2);
  });

  it('lastre da 3,6 m² con lo sfrido: 132 m² (120 netti + 10%) fanno 38 lastre', () => {
    const r = conConfezione(
      riga({ ruolo: 'LASTRA', chiave: 'LASTRA_PREGYFLAM_BA15', um: 'mq', quantita: 132, contenuto: 2.4, umConf: 'lastre', pezzi: 55, sfridoPct: 10 }),
      { codice: 'PF15300', contenuto: 3.6, confezione: 'lastre' },
    );
    // come il motore: ceil(ceil(120 / 3,6) × 1,10) = ceil(34 × 1,1) = 38
    expect(r.pezzi).toBe(38);
  });

  it('guide dal perimetro in barre da 4 m; i montanti per posizione restano e la riga lo dice', () => {
    const g = conConfezione(
      riga({ ruolo: 'GUIDA', chiave: 'GUIDA_75', quantita: 12, contenuto: 3, umConf: 'barre', pezzi: 4, metodo: 'geometrico' }),
      { codice: 'GUI74', contenuto: 4 },
    );
    expect(g.pezzi).toBe(3);
    const mo = conConfezione(
      riga({ ruolo: 'MONTANTE', chiave: 'MONTANTE_75', quantita: 55, contenuto: 3, umConf: 'barre', pezzi: 19, metodo: 'geometrico' }),
      { codice: 'MON74', contenuto: 4 },
    );
    expect(mo.pezzi).toBe(19);
    expect(mo.nota).toMatch(/ricontrollato/);
  });

  it('con la confezione dalla mappatura spariscono le verifiche su formato e lunghezza, restano le altre', () => {
    const r = conConfezione(
      riga({ daVerificare: 'lunghezza rotolo nastro' }),
      { codice: 'MICRO', contenuto: 23, confezione: 'rotoli' },
    );
    expect(r.daVerificare).toBeUndefined();
    const l = conConfezione(
      riga({ ruolo: 'LASTRA', um: 'mq', quantita: 132, contenuto: 2.4, umConf: 'lastre', pezzi: 55, sfridoPct: 10,
        daVerificare: 'formato lastra (1200 × 2000 mm = 2,4 m²); in alternativa solidtex indoor' }),
      { codice: 'PF15300', contenuto: 3.6, confezione: 'lastre' },
    );
    expect(l.daVerificare).toBe('in alternativa solidtex indoor');
  });

  it('confermata uguale a quella della voce: stessi pezzi, via solo le verifiche sulla confezione', () => {
    const v = riga({ ruolo: 'VITI', chiave: 'VITI_S_TEX_32_MM', um: 'pz', contenuto: 1000, umConf: 'conf.', quantita: 2500, pezzi: 3,
      daVerificare: 'confezione viti speciali' });
    const r = conConfezione(v, { codice: 'STEX32', contenuto: 1000, confezione: 'conf.' });
    expect(r).toMatchObject({ pezzi: 3, contenuto: 1000, umConf: 'conf.' });
    expect(r.daVerificare).toBeUndefined();
    expect('confezioneListino' in r).toBe(false);
  });

  it('senza confezione nella mappatura la riga non cambia', () => {
    const r = riga({});
    expect(conConfezione(r, { codice: 'MICRO' })).toBe(r);
    expect(conConfezione(r, undefined)).toBe(r);
  });

  it('i documenti di cgp_mapping portano contenuto e confezione, se sensati', () => {
    expect(mappaturaValida('NASTRO_CARTA', { codice: 'MICRO', contenuto: 23, confezione: ' rotoli ' })).toMatchObject({ contenuto: 23, confezione: 'rotoli' });
    expect(mappaturaValida('NASTRO_CARTA', { codice: 'MICRO', contenuto: -1, confezione: 5 })).toEqual({ chiave: 'NASTRO_CARTA', codice: 'MICRO', prezzoPer: 'confezione' });
  });
});

describe('voci che dipendono dalla struttura', () => {
  it('la banda per larghezza della struttura, la perimetrale per i controsoffitti', () => {
    expect(articoloSiniat('Banda in polietilene', 'm', 'C50').chiave).toBe('BANDA_50');
    expect(articoloSiniat('Banda in polietilene', 'm', 'C75').chiave).toBe('BANDA_75');
    expect(articoloSiniat('Banda in polietilene', 'm', 'S4927').chiave).toBe('BANDA_PERIMETRALE');
  });

  it('la lana per spessore, e per densità quando la configurazione la chiede', () => {
    expect(articoloSiniat('Isolante in lana minerale sp. 45 mm', 'm²').chiave).toBe('LANA_MINERALE_SP45');
    expect(articoloSiniat('Isolante in lana di roccia sp. 40 mm 40 kg/m³', 'm²').chiave).toBe('LANA_ROCCIA_SP40_D40');
    expect(articoloSiniat('Isolante in lana di vetro sp. 40 mm 13,5 kg/m³', 'm²').chiave).toBe('LANA_VETRO_SP40_D13');
    expect(articoloSiniat('Isolante in lana minerale', 'm²').chiave).toBe('LANA_MINERALE');
  });

  it('lo spessore della lana dalle schede Memento, per montante', () => {
    const s = (id: string) => sistema(id)!;
    expect(spessoreIsolante(s('memento-p33-SX'), 'C75')).toBe(60);
    expect(spessoreIsolante(s('memento-p33-SX'), 'C100')).toBe(80);
    // "sp. min. 50 mm": una volta sola
    expect(spessoreIsolante(s('memento-p29-SX'), 'C75')).toBe(50);
    // doppia orditura senza spessore: l'abbinamento delle pareti (60 sul 75)
    expect(spessoreIsolante(s('memento-p37-SX'), 'C75')).toBe(60);
    // controsoffitti: nessuno spessore dal profilo
    expect(spessoreIsolante(s('mem24_cdo_pendinato_pregyplac_ba13'), 'S4927')).toBeNull();
  });
});
