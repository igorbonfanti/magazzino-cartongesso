import { describe, expect, it } from 'vitest';
import { CATALOGO, sistema } from '../src/data/siniat/catalogo';
import { articoloSiniat } from '../src/data/siniat/articoli';
import { calcolaDistintaSiniat, incidenzeDaRegola } from '../src/engine-siniat';
import type { DistintaSiniat, OpzioniSiniat } from '../src/engine-siniat';
import type { Campitura, InterasseSiniat, SoluzioneScelta } from '../src/types';

const CENTO: Campitura[] = [{ modo: 'mq', mq: 100 }];
const SENZA_SFRIDO: OpzioniSiniat = { sfrido: { lastre: 0, isolante: 0 } };

function distinta(sol: SoluzioneScelta, campiture: Campitura[] = CENTO, opz: OpzioniSiniat = SENZA_SFRIDO): DistintaSiniat {
  const d = calcolaDistintaSiniat(sol, campiture, opz);
  if ('errore' in d) throw new Error(d.errore);
  return d;
}

function riga(d: DistintaSiniat, chiave: string) {
  const r = d.righe.find((x) => x.chiave === chiave);
  if (!r) throw new Error(`manca la riga ${chiave}: ${d.righe.map((x) => x.chiave).join(', ')}`);
  return r;
}

describe('distinta dalle tabelle Memento', () => {
  it('a 100 m² con lo sfrido Siniat (5%) le quantità sono le incidenze × 100', () => {
    const sol: SoluzioneScelta = { tipo: 'sistema', id: 'memento-p26-DX', varianteId: 'memento-p26-DX#2', interasse: '600' };
    const d = distinta(sol, CENTO, { sfrido: { lastre: 5, isolante: 5 } });
    const voci = sistema('memento-p26-DX')!.incidenze!.voci;
    let confrontate = 0;
    for (const v of voci) {
      const x = v.valori['600]'];
      if (typeof x !== 'number' || !x) continue;
      expect(riga(d, articoloSiniat(v.prodotto, v.unita, 'C75').chiave).quantita, v.prodotto).toBeCloseTo(x * 100, 6);
      confrontate++;
    }
    // lastre, guide, montanti, viti SNT 25, banda, stucco, nastro
    expect(confrontate).toBe(7);
    expect(d.fonteIncidenze).toBe('memento');
    expect(d.dicitura).toBeUndefined();
  });

  it('AF-009 dalla scheda p33-SX, con l\'isolante della configurazione certificata', () => {
    const d = distinta({ tipo: 'certificata', id: 'AF-009', varianteId: 'memento-p33-SX#2', interasse: '600' });
    expect(d.fonteIncidenze).toBe('memento');
    expect(d.variante).toEqual({ nome: 'D125/M75', montante: 'C75', montanti: 'singolo', interasse: '600' });
    expect(riga(d, 'LASTRA_PREGYFLAM_BA13')).toMatchObject({ incidenza: 4.2, quantita: 400, pezzi: 167 });
    expect(riga(d, 'LANA_MINERALE')).toMatchObject({ descrizione: 'Isolante in lana minerale sp. 45 mm', incidenza: 1.05, quantita: 100 });
    expect(d.righe.filter((r) => r.ruolo === 'ISOLANTE')).toHaveLength(1);
    expect(d.classificazioni.map((k) => k.minuti)).toEqual([45, 120]);
    expect(d.dicitura).toMatch(/verificare su certificato produttore/);
  });

  it('controsoffitto a membrana AF-078: lastre PF15 e orditura dalla scheda, guide "secondo necessità" da calcolare', () => {
    const d = distinta({ tipo: 'certificata', id: 'AF-078' });
    expect(riga(d, 'LASTRA_PREGYFLAM_BA15')).toMatchObject({ incidenza: 2.1, quantita: 200 });
    expect(riga(d, 'PROFILO_S4927')).toMatchObject({ incidenza: 3.8, quantita: 380 });
    expect(d.righe.some((r) => r.chiave.includes('SNT_55'))).toBe(false);
    expect(d.avvisi.filter((a) => a.codice === 'VOCE_DA_CALCOLARE').map((a) => a.testo)).toEqual([
      'Guide pregymetal U: Secondo necessità.', 'Banda in polietilene: Secondo necessità.',
    ]);
    expect(d.classificazioni.map((k) => `${k.tipo} ${k.minuti}`)).toEqual(['EI 60']);
  });

  it('sostituzione ammessa dalla scheda: pregydro H2 al posto delle pregyplac', () => {
    const d = distinta({
      tipo: 'sistema', id: 'memento-p26-DX', varianteId: 'memento-p26-DX#2', interasse: '600',
      sostituzioni: [{ da: 'pregyplac BA13', a: 'pregydro H2 BA13', fonte: 'memento', motivo: 'Per applicazione in ambienti umidi prevedere lastre pregydro H2 BA13' }],
    });
    expect(riga(d, 'LASTRA_PREGYDRO_H2_BA13').incidenza).toBe(2.1);
    expect(d.righe.some((r) => r.chiave === 'LASTRA_BA13_STD')).toBe(false);
    expect(d.avvisi.map((a) => a.codice)).toContain('LASTRA_SOSTITUITA');
  });

  it('AF-009 con le solidtex a magazzino: tabella della scheda Memento con quelle lastre (p32-SX), viti S-tex', () => {
    const d = distinta({
      tipo: 'certificata', id: 'AF-009', varianteId: 'memento-p33-SX#2', interasse: '600',
      sostituzioni: [{ da: 'pregyflam BA13', a: 'solidtex indoor', fonte: 'guida', motivo: 'sostituibilità indicata dalla guida antincendio per AF-009' }],
    });
    expect(d.fonteIncidenze).toBe('memento');
    expect(riga(d, 'LASTRA_SOLIDTEX_INDOOR')).toMatchObject({ incidenza: 4.2, quantita: 400 });
    expect(riga(d, 'LASTRA_SOLIDTEX_INDOOR').nota).toBeUndefined();
    expect(d.righe.map((r) => r.chiave).filter((k) => k.startsWith('VITI'))).toEqual(['VITI_S_TEX_32_MM', 'VITI_S_TEX_42_MM']);
    expect(riga(d, 'LANA_MINERALE').descrizione).toBe('Isolante in lana minerale sp. 45 mm');
    expect(d.avvisi.find((a) => a.codice === 'LASTRA_SOSTITUITA')?.testo).toBe(
      'Lastre solidtex indoor al posto delle pregyflam BA13: sostituibilità indicata dalla guida antincendio per AF-009, per usare le lastre a magazzino.',
    );
  });

  it('senza scheda Memento con le lastre sostitute valgono le regole, con le viti della lastra sostituta', () => {
    // AF-003 4 PSplus → pregydro H2: il Memento non ha una parete di sole pregydro
    const d = distinta({
      tipo: 'certificata', id: 'AF-003',
      sostituzioni: [{ da: 'pregyplac plus BA13', a: 'pregydro H2 BA13', fonte: 'guida', motivo: 'sostituibilità indicata dalla guida antincendio per AF-003' }],
    });
    expect(d.fonteIncidenze).toBe('regola');
    expect(riga(d, 'LASTRA_PREGYDRO_H2_BA13').incidenza).toBe(4.2);
    expect(d.righe.map((r) => r.chiave).filter((k) => k.startsWith('VITI'))).toEqual(['VITI_25', 'VITI_35']);
  });

  it('le lastre non a magazzino portano la nota dell\'ordine', () => {
    const d = distinta({ tipo: 'certificata', id: 'AF-009', varianteId: 'memento-p33-SX#2', interasse: '600' });
    expect(riga(d, 'LASTRA_PREGYFLAM_BA13').nota).toBe('su ordinazione da ATS Isolanti, 3–4 giorni');
  });

  it('niente distinta automatica per Promat e protezioni di solai', () => {
    expect(calcolaDistintaSiniat({ tipo: 'certificata', id: 'AF-042' }, CENTO, SENZA_SFRIDO)).toHaveProperty('errore');
    expect(calcolaDistintaSiniat({ tipo: 'certificata', id: 'AF-084' }, CENTO, SENZA_SFRIDO)).toHaveProperty('errore');
  });
});

describe('distinta con le regole del Memento (certificate senza scheda)', () => {
  it('AF-003 4 PSplus a 100 m²', () => {
    const d = distinta({ tipo: 'certificata', id: 'AF-003' });
    expect(d.fonteIncidenze).toBe('regola');
    expect(d.avvisi.map((a) => a.codice)).toContain('INCIDENZE_STIMATE');
    const q = Object.fromEntries(d.righe.map((r) => [r.chiave, [r.incidenza, r.quantita, r.pezzi]]));
    expect(q).toEqual({
      LASTRA_PREGYPLAC_PLUS_BA13: [4.2, 400, 167],
      GUIDA_75: [0.7, 70, 24],
      MONTANTE_75: [1.8, 180, 60],
      VITI_25: [10, 1000, 1],
      VITI_35: [20, 2000, 2],
      BANDA_POLIETILENE: [0.7, 70, 70],
      STUCCO: [0.7, 70, 7],
      NASTRO_CARTA: [1.8, 180, 180],
      TASSELLI: [2, 140, 2],
    });
  });

  // Le regole ricostruiscono le tabelle: si verificano su tutte le schede di
  // pareti e setti. Eccezioni documentate nello studio:
  //  - p34-DX: linea aquaboard (profili, stucco in pasta, banda in rete);
  //  - p29-SX a 300 accoppiati: la tabella dà 40 viti SNT 25, la regola 50;
  //  - doppia orditura: le viti della lastra centrale il Memento le arrotonda
  //    ora per eccesso ora per difetto, scarto massimo 5 viti/m².
  it('riproducono le tabelle delle pareti a singola e doppia orditura e dei setti', () => {
    const famiglie = ['parete_singola_orditura', 'parete_doppia_orditura', 'setto_autoportante'];
    let colonne = 0;
    for (const s of CATALOGO.sistemi.filter((x) => famiglie.includes(x.famiglia) && x.stratigrafia && x.incidenze && x.id !== 'memento-p34-DX')) {
      for (const col of Object.keys(s.incidenze!.voci[0]!.valori)) {
        const k = (p: string, u: string) => articoloSiniat(p, u).chiave;
        const regola = new Map(incidenzeDaRegola(s.stratigrafia!, col.slice(0, 3) as InterasseSiniat, col.endsWith('][')).map((v) => [k(v.prodotto, v.unita), v.valore as number]));
        for (const v of s.incidenze!.voci) {
          const t = v.valori[col];
          if (typeof t !== 'number' || /isolante/i.test(v.prodotto)) continue;
          const chiave = k(v.prodotto, v.unita);
          const r = regola.get(chiave);
          regola.delete(chiave);
          const dove = `${s.id} ${col} ${v.prodotto}`;
          if (s.id === 'memento-p29-SX' && col === '300][' && chiave === 'VITI_25') { expect(r, dove).toBe(50); continue; }
          if (s.famiglia === 'parete_doppia_orditura' && chiave.startsWith('VITI')) { expect(Math.abs(r! - t), dove).toBeLessThanOrEqual(5); continue; }
          expect(r, dove).toBeCloseTo(t, 6);
        }
        expect([...regola.keys()], `${s.id} ${col}: voci in più`).toEqual([]);
        colonne++;
      }
    }
    expect(colonne).toBeGreaterThanOrEqual(130);
  });
});

describe('geometria delle campiture', () => {
  it('parete 1,20 × 3,50: guide dal perimetro, montanti per posizione e tasselli ogni 50 cm', () => {
    const d = distinta({ tipo: 'sistema', id: 'memento-p26-DX', varianteId: 'memento-p26-DX#2', interasse: '600' }, [{ modo: 'LxH', l: 1.2, h: 3.5 }]);
    expect(d.mqNetti).toBeCloseTo(4.2, 9);
    expect(riga(d, 'GUIDA_75')).toMatchObject({ quantita: 2.4, pezzi: 1, metodo: 'geometrico' });
    // 3 montanti alti 3,50 m: 10,5 m = 4 barre; con l'incidenza sarebbero 7,56 m = 3 barre
    expect(riga(d, 'MONTANTE_75')).toMatchObject({ quantita: 10.5, pezzi: 4, metodo: 'geometrico' });
    expect(riga(d, 'TASSELLI')).toMatchObject({ quantita: 5, pezzi: 1 });
  });

  it('controsoffitto 4 × 5 m: guide perimetrali e banda sul perimetro, niente tasselli da parete', () => {
    const d = distinta({ tipo: 'sistema', id: 'mem24_cdo_pendinato_pregyplac_ba13' }, [{ modo: 'LxH', l: 4, h: 5 }]);
    expect(d.righe.find((r) => r.ruolo === 'GUIDA')).toMatchObject({ quantita: 18, pezzi: 6, metodo: 'geometrico' });
    expect(riga(d, 'BANDA_POLIETILENE')).toMatchObject({ quantita: 18, metodo: 'geometrico' });
    expect(d.righe.some((r) => r.ruolo === 'TASSELLI')).toBe(false);
    expect(riga(d, 'LASTRA_BA13_STD')).toMatchObject({ quantita: 20, pezzi: 9 });
  });

  it('avvisa se la parete è più alta dell\'altezza utile della soluzione', () => {
    const d = distinta({ tipo: 'sistema', id: 'memento-p26-DX', varianteId: 'memento-p26-DX#2', interasse: '600' }, [{ modo: 'LxH', l: 4, h: 4 }], { ...SENZA_SFRIDO, hmaxUtile: 3.7 });
    expect(d.avvisi.map((a) => a.codice)).toContain('ALTEZZA_OLTRE_HMAX');
  });
});
