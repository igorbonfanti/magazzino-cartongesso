import { describe, expect, it } from 'vitest';
import { configurazione, sostituisciStratigrafia } from '../src/data/siniat/catalogo';
import { alternativeLastre, conOrditura, orditurePossibili, perDisponibilita, selezionaSoluzioni } from '../src/selettore';
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

  it('AF-009 a EI 120 e 5 m: C75 a interasse 600 della scheda p33-SX, altezza utile 5 m (oltre i 4 m le solidtex della guida)', () => {
    const c = trova(selezionaSoluzioni(req({ fuoco: 120, altezza: 5 })).certificate, 'AF-009');
    expect(c.classificazione).toMatchObject({ tipo: 'EI', minuti: 120, hmax: 5 });
    expect(c.variante).toMatchObject({ sistemaId: 'memento-p33-SX', varianteId: 'memento-p33-SX#2', montante: 'C75', montanti: 'singolo', interasse: '600', hmaxStatica: 5 });
    expect(c.staticaVerificata).toBe(true);
    expect(c.hmaxUtile).toBe(5);
    expect(c.distinta).toBe(true);
    // le pregyflam BA13 non sono a magazzino: la guida ammette le solidtex indoor
    expect(c.sostituzioni).toEqual([
      { da: 'pregyflam BA13', a: 'solidtex indoor', fonte: 'guida', motivo: 'sostituibilità indicata dalla guida antincendio per AF-009' },
    ]);
    expect(c.aMagazzino).toBe(true);
    expect(c.avvisi).toEqual([
      'Con le lastre a magazzino: solidtex indoor al posto delle pregyflam BA13, sostituzione ammessa dalla guida antincendio per questa configurazione.',
      'Rw misurato con le lastre della prova.',
    ]);
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

  it('a parità di disponibilità, prima le soluzioni con la distinta automatica', () => {
    const { certificate } = selezionaSoluzioni(req({ fuoco: 120, altezza: 5 }));
    for (const gruppo of [true, false, null]) {
      const g = certificate.filter((c) => c.aMagazzino === gruppo);
      const primaSenza = g.findIndex((c) => !c.distinta);
      if (primaSenza >= 0) expect(g.slice(primaSenza).every((c) => !c.distinta), String(gruppo)).toBe(true);
    }
    // le Promat, senza distinta, sono da ordinare e stanno in fondo
    expect(certificate.slice(-3).every((c) => !c.distinta)).toBe(true);
  });

  it('ambiente umido: lastre di tipo H a vista, anche grazie alle sostituzioni della guida', () => {
    const { certificate } = selezionaSoluzioni(req({ fuoco: 60, ambiente: 'umido' }));
    expect(certificate.length).toBeGreaterThan(0);
    for (const c of certificate) {
      const st = sostituisciStratigrafia(configurazione(c.id)!.stratigrafia!, c.sostituzioni ?? []);
      const vista = [st.lato1[0]!.lastra, st.lato2[st.lato2.length - 1]!.lastra].join(' ');
      expect(vista, c.id).toMatch(/pregydro|ladura|solidtex|aquaboard/);
    }
    expect(certificate.map((c) => c.id)).toContain('AF-009');
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
      { da: 'pregyplac BA13', a: 'pregydro H2 BA13', fonte: 'memento', motivo: 'Per applicazione in ambienti umidi prevedere lastre pregydro H2 BA13' },
    ]);
    // le lastre H a vista non si sostituiscono
    expect(trova(selezionaSoluzioni(req({ ambiente: 'umido' })).sistemi, 'memento-p30-DX').sostituzioni).toBeUndefined();
    // la parete curva in pregyflex no: la nota vale per la lastra standard
    expect(selezionaSoluzioni(req({ ambiente: 'umido' })).sistemi.map((c) => c.id)).not.toContain('memento-p35-SX');
  });
});

describe('selettore — lastre a magazzino', () => {
  it('prima le soluzioni tutte a magazzino, poi quelle da ordinare', () => {
    for (const r of [req({ fuoco: 120, altezza: 5 }), req({ rw: 56 }), req({ opera: 'cavedio', fuoco: 60, altezza: 4 })]) {
      const { certificate, sistemi } = selezionaSoluzioni(r);
      for (const lista of [certificate, sistemi]) {
        const primaDaOrdinare = lista.findIndex((c) => c.aMagazzino !== true);
        if (primaDaOrdinare >= 0) expect(lista.slice(primaDaOrdinare).every((c) => c.aMagazzino !== true)).toBe(true);
      }
      expect(certificate[0]!.aMagazzino).toBe(true);
    }
  });

  it('AF-028, senza sostituzioni nella guida: fino a 4 m le pregyflam BA15, oltre si ordinano le BA13', () => {
    const a4 = trova(selezionaSoluzioni(req({ fuoco: 90, altezza: 4 })).certificate, 'AF-028');
    expect(a4).toMatchObject({ aMagazzino: true, daOrdinare: [] });
    expect(a4.sostituzioni?.map((x) => [x.a, x.fonte])).toEqual([['pregyflam BA15', 'spessore']]);
    const a5 = trova(selezionaSoluzioni(req({ fuoco: 90, altezza: 5 })).certificate, 'AF-028');
    expect(a5).toMatchObject({ aMagazzino: false, daOrdinare: ['pregyflam BA13'] });
    expect(a5.sostituzioni).toBeUndefined();
    expect(a5.classificazione).toMatchObject({ minuti: 90, hmax: 12 });
  });

  it('PF15, pregyplac, solidtex e le membrane PF15 sono a magazzino senza sostituzioni', () => {
    const pareti = selezionaSoluzioni(req({ fuoco: 60, altezza: 3 })).certificate;
    for (const id of ['AF-015', 'AF-019', 'AF-023', 'AF-010']) {
      expect(trova(pareti, id), id).toMatchObject({ aMagazzino: true, daOrdinare: [] });
      expect(trova(pareti, id).sostituzioni, id).toBeUndefined();
    }
    expect(trova(selezionaSoluzioni(req({ opera: 'controsoffitto', fuoco: 60 })).certificate, 'AF-078').aMagazzino).toBe(true);
  });

  it('le schede Memento non si sostituiscono: la p33-SX in pregyflam BA13 è da ordinare, la p34-SX in PF15 no', () => {
    const { sistemi } = selezionaSoluzioni(req({ fuoco: 120, altezza: 5 }));
    expect(trova(sistemi, 'memento-p33-SX')).toMatchObject({ aMagazzino: false, daOrdinare: ['pregyflam BA13'] });
    expect(trova(sistemi, 'memento-p34-SX')).toMatchObject({ aMagazzino: true, daOrdinare: [] });
  });

  it('Promat e PROMASEAL: da ordinare o lastre non note', () => {
    const c = trova(selezionaSoluzioni(req({ fuoco: 120, altezza: 5 })).certificate, 'AF-040');
    expect(c).toMatchObject({ aMagazzino: false, daOrdinare: ['PROMATECT-100X 12'] });
  });
});

describe('selettore — a magazzino o su ordinazione', () => {
  it('le due liste si dividono tutte le soluzioni, senza doppioni', () => {
    for (const r of [req({ fuoco: 120, altezza: 5 }), req({ rw: 56 }), req({ opera: 'solaio', fuoco: 120 })]) {
      const { certificate, sistemi } = selezionaSoluzioni(r);
      for (const lista of [certificate, sistemi]) {
        const mag = perDisponibilita(lista, 'magazzino');
        const ord = perDisponibilita(lista, 'ordine');
        expect(mag.every((c) => c.aMagazzino === true)).toBe(true);
        expect(ord.every((c) => c.aMagazzino !== true)).toBe(true);
        expect(mag.length + ord.length).toBe(lista.length);
        expect(perDisponibilita(lista, 'tutte')).toEqual(lista);
      }
    }
  });

  it('EI 120 a 5 m: AF-009 (con solidtex) fra quelle a magazzino, AF-051 e le Promat su ordinazione', () => {
    const { certificate } = selezionaSoluzioni(req({ fuoco: 120, altezza: 5 }));
    expect(perDisponibilita(certificate, 'magazzino').map((c) => c.id)).toContain('AF-009');
    const ord = perDisponibilita(certificate, 'ordine').map((c) => c.id);
    expect(ord).toEqual(expect.arrayContaining(['AF-051', 'AF-040', 'AF-041', 'AF-042']));
    expect(ord).not.toContain('AF-009');
  });
});

describe('selettore — pregyflam BA15 al posto delle BA13 (decisione del 24/09/2026)', () => {
  const MOTIVO = 'aumento dello spessore delle lastre, nel campo di applicazione diretta del rapporto di classificazione (UNI EN 1364-1, art. 13), fino a 4 m di altezza';

  it('AF-009 a EI 120 e 3 m: di partenza le BA15, con le classi fino a 4 m', () => {
    const c = trova(selezionaSoluzioni(req({ fuoco: 120, altezza: 3 })).certificate, 'AF-009');
    expect(c.sostituzioni).toEqual([{ da: 'pregyflam BA13', a: 'pregyflam BA15', fonte: 'spessore', motivo: MOTIVO }]);
    expect(c.classificazione).toMatchObject({ tipo: 'EI', minuti: 120, hmax: 4 });
    expect(c.classificazione?.hmaxNota).toMatch(/fino a 4 m \(campo di applicazione diretta\)/);
    expect(c.classi).toContain(c.classificazione);
    expect(c.hmaxUtile).toBe(4);
    expect(c).toMatchObject({ aMagazzino: true, daOrdinare: [] });
    expect(c.avvisi).toEqual([
      'Con le lastre a magazzino: pregyflam BA15 al posto delle pregyflam BA13, più spesse di quelle provate: variante nel campo di applicazione diretta del rapporto di classificazione (UNI EN 1364-1, art. 13), fino a 4 m. Da verificare sul rapporto.',
      'Rw misurato con le lastre della prova.',
    ]);
  });

  it('nella scheda si sceglie fra le BA15 e le solidtex della guida, che arrivano a 5 m', () => {
    const r = req({ fuoco: 120, altezza: 3 });
    const alt = alternativeLastre(trova(selezionaSoluzioni(r).certificate, 'AF-009'), r)!;
    expect(alt.spessore.sostituzioni?.map((x) => x.a)).toEqual(['pregyflam BA15']);
    expect(alt.guida.sostituzioni?.map((x) => x.a)).toEqual(['solidtex indoor']);
    expect(alt.guida.classificazione).toMatchObject({ minuti: 120, hmax: 5 });
    expect(alt.guida.hmaxUtile).toBe(5);
    // le configurazioni già a magazzino non hanno niente da scegliere
    expect(alternativeLastre(trova(selezionaSoluzioni(r).certificate, 'AF-036'), r)).toBeNull();
  });

  it('oltre i 4 m e in ambiente umido restano le solidtex, senza scelta', () => {
    const a5 = req({ fuoco: 120, altezza: 5 });
    const c5 = trova(selezionaSoluzioni(a5).certificate, 'AF-009');
    expect(c5.sostituzioni?.map((x) => x.a)).toEqual(['solidtex indoor']);
    expect(alternativeLastre(c5, a5)).toBeNull();
    // le pregyflam non sono lastre H: a vista servono le solidtex
    const umido = req({ fuoco: 60, altezza: 3, ambiente: 'umido' });
    const cu = trova(selezionaSoluzioni(umido).certificate, 'AF-009');
    expect(cu.sostituzioni?.map((x) => x.a)).toEqual(['solidtex indoor']);
    expect(alternativeLastre(cu, umido)).toBeNull();
  });

  it("senza l'altezza nei requisiti si parte dalle BA15, con altezza utile 4 m", () => {
    const c = trova(selezionaSoluzioni(req({ fuoco: 60, altezza: 0 })).certificate, 'AF-009');
    expect(c.sostituzioni?.map((x) => x.a)).toEqual(['pregyflam BA15']);
    expect(c.hmaxUtile).toBe(4);
  });

  it('"oltre 4 m" dei setti diventa "fino a 4 m" con le BA15', () => {
    const c = trova(selezionaSoluzioni(req({ opera: 'cavedio', fuoco: 45, altezza: 3 })).certificate, 'AF-060');
    expect(c.sostituzioni?.map((x) => x.a)).toEqual(['pregyflam BA15']);
    expect(c.classificazione).toMatchObject({ minuti: 45, hmax: 4 });
    expect(c.classificazione?.hmaxOltre).toBeUndefined();
  });

  it('solo le prove EN 1364-1: le protezioni di solai in pregyflam BA13 restano da ordinare', () => {
    const { certificate } = selezionaSoluzioni(req({ opera: 'solaio', fuoco: 120 }));
    for (const id of ['AF-085', 'AF-087']) {
      expect(trova(certificate, id), id).toMatchObject({ aMagazzino: false, daOrdinare: ['pregyflam BA13'] });
      expect(trova(certificate, id).sostituzioni, id).toBeUndefined();
    }
  });
});
