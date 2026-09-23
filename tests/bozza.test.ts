import { describe, expect, it } from 'vitest';
import {
  bozzaValida,
  bozzaVuota,
  campituraPerMotore,
  campituraVuota,
  conAmbito,
  leggiNumero,
  sceltePerMotore,
} from '../src/lib/bozza';
import { calcolaDistinta } from '../src/engine';

describe('numeri digitati', () => {
  it('virgola, punto e migliaia', () => {
    expect(leggiNumero('4,32')).toBe(4.32);
    expect(leggiNumero('4.32')).toBe(4.32);
    expect(leggiNumero('1.234,5')).toBe(1234.5);
    expect(leggiNumero(' 30 ')).toBe(30);
    expect(leggiNumero(',5')).toBe(0.5);
  });

  it('vuoto o sbagliato: null', () => {
    expect(leggiNumero('')).toBeNull();
    expect(leggiNumero('4,')).toBeNull();
    expect(leggiNumero('abc')).toBeNull();
    expect(leggiNumero('-3')).toBeNull();
  });
});

describe('dalla bozza al motore', () => {
  it('campiture incomplete ignorate, aperture incomplete ignorate', () => {
    expect(campituraPerMotore({ ...campituraVuota(), l: '30' })).toBeNull();
    expect(
      campituraPerMotore({
        ...campituraVuota(),
        l: '5',
        h: '3',
        aperture: [
          { id: 'a', l: '0,9', h: '2,1', n: '2' },
          { id: 'b', l: '1', h: '', n: '1' },
        ],
      }),
    ).toEqual({ modo: 'LxH', l: 5, h: 3, aperture: [{ l: 0.9, h: 2.1, n: 2 }] });
    expect(campituraPerMotore({ ...campituraVuota(), modo: 'mq', mq: '12,5' })).toEqual({
      modo: 'mq',
      mq: 12.5,
      aperture: [],
    });
  });

  it('senza sistema non si calcola', () => {
    expect(sceltePerMotore(bozzaVuota())).toBeNull();
  });

  it('il caso reale digitato come al banco da le 95 lastre', () => {
    const b = {
      ...conAmbito(bozzaVuota(), 'controparete'),
      sistemaId: 'controparete_singola' as const,
      sfridoIsolante: '0',
      campiture: [
        { ...campituraVuota(), l: '30', h: '2,50' },
        { ...campituraVuota(), l: '30', h: '4,32' },
      ],
    };
    const d = calcolaDistinta(sceltePerMotore(b)!);
    expect(d.righe.find((r) => r.ruolo === 'LASTRA')!.pezzi).toBe(95);
  });

  it('cambiando ambito si azzera il sottotipo e il profilo resta ammesso', () => {
    const parete = { ...conAmbito(bozzaVuota(), 'parete'), sistemaId: 'parete_singola' as const };
    const soffitto = conAmbito(parete, 'controsoffitto');
    expect(soffitto.sistemaId).toBeNull();
    expect(soffitto.profilo).toBe(30);
  });

  it('acustica forza la lana anche se tolta', () => {
    const b = { ...bozzaVuota(), sistemaId: 'parete_singola' as const, prestazione: 'acustica' as const, isolante: false };
    expect(sceltePerMotore(b)!.isolante).toBe(true);
  });

  it('bozza salvata: si riconosce quella buona', () => {
    expect(bozzaValida(bozzaVuota())).toBe(true);
    expect(bozzaValida({ ...bozzaVuota(), sistemaId: 'inesistente' })).toBe(false);
    expect(bozzaValida(null)).toBe(false);
    expect(bozzaValida({ campiture: 'x' })).toBe(false);
  });
});
