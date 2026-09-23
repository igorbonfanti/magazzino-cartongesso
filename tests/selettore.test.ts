import { describe, expect, it } from 'vitest';
import { conOrditura, orditurePossibili, selezionaSoluzioni } from '../src/selettore';
import type { Candidato } from '../src/selettore';
import type { Requisiti } from '../src/types';

function req(extra: Partial<Requisiti>): Requisiti {
  return { opera: 'parete', fuoco: 0, rw: 0, altezza: 3, ambiente: 'normale', urti: false, carichi: false, antieffrazione: false, ...extra };
}

function trova(lista: Candidato[], id: string): Candidato {
  const c = lista.find((x) => x.id === id);
  if (!c) throw new Error(`manca ${id}`);
  return c;
}

describe('selettore — configurazioni certificate', () => {
  it('ogni classe proposta soddisfa fuoco e altezza richiesti', () => {
    for (const [fuoco, altezza] of [[60, 3], [120, 5], [120, 6], [45, 7], [180, 4]] as const) {
      for (const c of selezionaSoluzioni(req({ fuoco, altezza })).certificate) {
        const k = c.classificazione!;
        expect(k.minuti, c.id).toBeGreaterThanOrEqual(fuoco);
        if (k.hmax != null && !k.hmaxOltre) expect(k.hmax, c.id).toBeGreaterThanOrEqual(altezza);
      }
    }
  });

  it('AF-009 a EI 120 e 5 m: C75 a interasse 600 della scheda p33-SX, altezza utile 5 m', () => {
    const c = trova(selezionaSoluzioni(req({ fuoco: 120, altezza: 5 })).certificate, 'AF-009');
    expect(c.classificazione).toMatchObject({ tipo: 'EI', minuti: 120, hmax: 5 });
    expect(c.variante).toMatchObject({ sistemaId: 'memento-p33-SX', varianteId: 'memento-p33-SX#2', montante: 'C75', montanti: 'singolo', interasse: '600', hmaxStatica: 5 });
    expect(c.staticaVerificata).toBe(true);
    expect(c.hmaxUtile).toBe(5);
    expect(c.distinta).toBe(true);
    expect(c.avvisi).toEqual([]);
  });

  it('AF-009 non regge EI 120 a 5,5 m', () => {
    expect(selezionaSoluzioni(req({ fuoco: 120, altezza: 5.5 })).certificate.map((c) => c.id)).not.toContain('AF-009');
  });

  it('AF-009 a EI 45 e 7 m: montante più grande di quello certificato, e lo dice', () => {
    const c = trova(selezionaSoluzioni(req({ fuoco: 45, altezza: 7 })).certificate, 'AF-009');
    expect(c.classificazione).toMatchObject({ minuti: 45, hmax: 12 });
    expect(c.variante).toMatchObject({ montante: 'C150', interasse: '600', hmaxStatica: 8.2 });
    expect(c.hmaxUtile).toBe(8.2);
    expect(c.avvisi.join(' ')).toMatch(/Orditura C150 a 600 mm: più robusta di quella certificata \(C75, int\. 600 mm\)/);
  });

  it('orditure fra cui scegliere per AF-009 a 7 m, e il candidato con quella scelta', () => {
    const r = req({ fuoco: 45, altezza: 7 });
    const o = orditurePossibili('certificata', 'AF-009', r);
    // prima i montanti singoli, poi l'interasse più largo, poi il montante più piccolo
    const nomi = o.map((x) => `${x.v.montante}${x.v.montanti === 'accoppiato' ? '][' : ''}@${x.interasse}`);
    expect(nomi).toEqual(['C150@600', 'C150@400', 'C150@300', 'C150][@600', 'C100][@400', 'C150][@400', 'C100][@300', 'C150][@300']);
    const c = conOrditura(trova(selezionaSoluzioni(r).certificate, 'AF-009'), o[nomi.indexOf('C100][@400')]!);
    expect(c.variante).toMatchObject({ varianteId: 'memento-p33-SX#5', montante: 'C100', montanti: 'accoppiato', interasse: '400', hmaxStatica: 7.6 });
    expect(c.hmaxUtile).toBe(7.6);
    expect(c.avvisi.filter((a) => a.startsWith('Orditura '))).toEqual([
      'Orditura C100 accoppiati a 400 mm: più robusta di quella certificata (C75, int. 600 mm), che è la minima ammessa.',
    ]);
  });

  it('Hmax al fuoco "oltre 4 m" non limita l\'altezza: AF-063 a 5 m vale per la statica', () => {
    const c = trova(selezionaSoluzioni(req({ opera: 'cavedio', fuoco: 60, altezza: 5 })).certificate, 'AF-063');
    expect(c.classificazione).toMatchObject({ minuti: 60, hmax: 4, hmaxOltre: true });
    expect(c.hmaxUtile).toBe(5.9);
  });

  it('Rw minimo: AF-009 (56 dB) sì a 56, no a 57', () => {
    const a56 = selezionaSoluzioni(req({ rw: 56 }));
    expect(a56.certificate.map((c) => c.id)).toContain('AF-009');
    for (const c of [...a56.certificate, ...a56.sistemi]) expect(c.rw ?? 0, c.id).toBeGreaterThanOrEqual(56);
    expect(selezionaSoluzioni(req({ rw: 57 })).certificate.map((c) => c.id)).not.toContain('AF-009');
  });

  it('controsoffitto EI 60: le membrane certificate hanno orditura e distinta dalla scheda Memento', () => {
    const { certificate } = selezionaSoluzioni(req({ opera: 'controsoffitto', fuoco: 60 }));
    const c = trova(certificate, 'AF-078');
    expect(c.variante?.varianteId).toBe('mem24_cdo_membrana_pregyflam_ba15#0');
    expect(c.distinta).toBe(true);
    expect(trova(certificate, 'AF-079').variante?.varianteId).toBe('mem24_cdo_membrana_pregyflam_ba15#1');
  });

  it('protezione solai REI 120: le sette configurazioni della guida', () => {
    expect(selezionaSoluzioni(req({ opera: 'solaio', fuoco: 120 })).certificate.map((c) => c.id).sort()).toEqual(
      ['AF-084', 'AF-085', 'AF-086', 'AF-087', 'AF-088', 'AF-089', 'AF-090'],
    );
  });

  it('prima le soluzioni con la distinta automatica', () => {
    const { certificate } = selezionaSoluzioni(req({ fuoco: 120, altezza: 5 }));
    const primaSenza = certificate.findIndex((c) => !c.distinta);
    expect(primaSenza).toBeGreaterThan(0);
    expect(certificate.slice(primaSenza).every((c) => !c.distinta)).toBe(true);
  });

  it('ambiente umido: lastre di tipo H a vista', () => {
    const { certificate } = selezionaSoluzioni(req({ fuoco: 60, ambiente: 'umido' }));
    expect(certificate.length).toBeGreaterThan(0);
    for (const c of certificate) expect(c.titolo, c.id).toMatch(/LD|LaDura|S-tex/);
  });
});

describe('selettore — schede Memento', () => {
  it('le classi dichiarate dal Memento rimandano alla guida 2026 e alle certificate collegate', () => {
    const s = trova(selezionaSoluzioni(req({ fuoco: 120, altezza: 5 })).sistemi, 'memento-p33-SX');
    expect(s.fuocoVariante).toMatchObject({ tipo: 'EI', minuti: 120, hmax: 5 });
    expect(s.avvisi.join(' ')).toMatch(/guida antincendio 2026/);
    expect(s.certificate).toContain('AF-009');
  });

  it('variante più economica che regge l\'altezza: p26-DX a 3 m prende C75 singoli a 600 prima dei C50 accoppiati', () => {
    const s = trova(selezionaSoluzioni(req({ altezza: 3 })).sistemi, 'memento-p26-DX');
    expect(s.variante).toMatchObject({ varianteId: 'memento-p26-DX#2', montante: 'C75', montanti: 'singolo', interasse: '600', hmaxStatica: 3.7 });
  });

  it('ambiente umido: le schede con lastre standard passano a pregydro H2, come dice la nota della scheda', () => {
    const s = trova(selezionaSoluzioni(req({ ambiente: 'umido' })).sistemi, 'memento-p26-DX');
    expect(s.sostituzioni).toEqual([
      { da: 'pregyplac BA13', a: 'pregydro H2 BA13', motivo: 'Per applicazione in ambienti umidi prevedere lastre pregydro H2 BA13' },
    ]);
    // le lastre H a vista non si sostituiscono
    expect(trova(selezionaSoluzioni(req({ ambiente: 'umido' })).sistemi, 'memento-p30-DX').sostituzioni).toBeUndefined();
    // la parete curva in pregyflex no: la nota vale per la lastra standard
    expect(selezionaSoluzioni(req({ ambiente: 'umido' })).sistemi.map((c) => c.id)).not.toContain('memento-p35-SX');
  });
});
