import { describe, expect, it } from 'vitest';
import { calcolaDistinta } from '../src/engine';
import { calcolaDistintaSiniat } from '../src/engine-siniat';
import { schedaClassico, schedaSiniat } from '../src/schedaTecnica';
import { selezionaSoluzioni } from '../src/selettore';
import type { Requisiti, Scelte } from '../src/types';

const req = (x: Partial<Requisiti>): Requisiti => ({
  opera: 'parete', fuoco: 0, rw: 0, altezza: 3, ambiente: 'normale', urti: false, carichi: false, antieffrazione: false, ...x,
});

describe('scheda tecnica del preventivo', () => {
  it('AF-009 con le pregyflam BA15: stratigrafia, lastre in opera, classi fino a 4 m, rapporti e dicitura', () => {
    const c = selezionaSoluzioni(req({ fuoco: 120, altezza: 3 })).certificate.find((x) => x.id === 'AF-009')!;
    const d = calcolaDistintaSiniat(
      { tipo: 'certificata', id: c.id, varianteId: c.variante?.varianteId ?? null, interasse: c.variante?.interasse ?? null, sostituzioni: c.sostituzioni ?? [] },
      [{ modo: 'LxH', l: 10, h: 3 }],
      { sfrido: { lastre: 10, isolante: 10 }, hmaxUtile: c.hmaxUtile },
    );
    if ('errore' in d) throw new Error(d.errore);
    const s = schedaSiniat(c, d);
    expect(s.titolo).toBe('Pregy D125/M75 - 4 PF 13 - LM');
    expect(s.riferimento).toMatch(/^AF-009 · Pareti leggere · prova EN 1364-1 · guida antincendio Siniat, luglio 2026, p\. 7, 12$/);
    expect(s.strati).toContain('Orditura C75/50 int. 600 mm');
    expect(s.inOpera).toEqual(['pregyflam BA15 al posto delle pregyflam BA13']);
    expect(s.orditura).toBe('C75 a 600 mm');
    expect(s.altezzaUtile).toBe(4);
    expect(s.classi.map((k) => `${k.classe} ${k.limite}${k.richiesta ? ' *' : ''}`)).toEqual(['EI 45 altezza fino a 4 m', 'EI 120 altezza fino a 4 m *']);
    expect(s.classi[1]!.rapporti[0]).toMatchObject({ testo: 'Ist. Giordano 381599-4114FR' });
    expect(s.rw).toBe(56);
    expect(s.rwNota).toMatch(/misurato con le lastre della prova/);
    expect(s.mq).toBe(30);
    // la variante la dicono "in opera" e la dicitura: niente doppioni, niente note da banco
    expect(s.avvisi.filter((a) => /pregyflam BA15/.test(a))).toHaveLength(0);
    expect(s.avvisi.join(' ')).not.toMatch(/Quantità ricavate/);
    expect(s.dicitura).toMatch(/aumento dello spessore delle lastre \(UNI EN 1364-1, art\. 13\)/);
  });

  it('calcolo classico antincendio: la dicitura di rinvio al certificato, niente classi', () => {
    const scelte: Scelte = {
      sistemaId: 'parete_doppia', prestazione: 'antincendio', interasse: 60, profilo: 75, isolante: true,
      sfrido: { lastre: 10, isolante: 10 }, modalita: 'classica', campiture: [{ modo: 'mq', mq: 50 }],
    };
    const s = schedaClassico(calcolaDistinta(scelte), scelte);
    expect(s.titolo).toMatch(/Antincendio/);
    expect(s.riferimento).toBe("Calcolo classico, incidenze dell'Excel storico");
    expect(s.classi).toEqual([]);
    expect(s.mq).toBe(50);
    expect(s.dicitura).toBe('Sistema da verificare su certificato produttore.');
  });
});
