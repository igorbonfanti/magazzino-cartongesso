import { describe, expect, it } from 'vitest';
import {
  euroACent,
  formattaCent,
  formattaDecimale,
  formattaEuro,
  formattaIntero,
  formattaNettoUnitario,
  formattaPercento,
  ivaCent,
  moltiplicaCent,
  percentoABp,
  quantitaAMilli,
  sommaCent,
  totaleRigaCent,
  totaliPreventivo,
} from '../src/money';

describe('importi in centesimi interi (come magazzino-scorte)', () => {
  it('somma e moltiplica senza virgola mobile', () => {
    expect(sommaCent([77848, 70221, 96720])).toBe(244789);
    expect(moltiplicaCent(296, 263)).toBe(77848);
    expect(sommaCent([10, 20])).toBe(30);
  });

  it('formatta con separatore delle migliaia italiano', () => {
    expect(formattaIntero(1185)).toBe('1.185');
    expect(formattaCent(6851059)).toBe('68.510,59');
    expect(formattaEuro(77848)).toBe('778,48 €');
    expect(formattaDecimale(14.24)).toBe('14,2');
  });

  it('legge gli euro digitati', () => {
    expect(euroACent('778,48')).toBe(77848);
    expect(euroACent('1.185,00')).toBe(118500);
    expect(euroACent('12')).toBe(1200);
    expect(euroACent('abc')).toBeNull();
  });
});

describe('catena dei prezzi del preventivo', () => {
  it('legge le percentuali in punti base', () => {
    expect(percentoABp('10')).toBe(1000);
    expect(percentoABp('12,5')).toBe(1250);
    expect(percentoABp('-20%')).toBe(2000);
    expect(percentoABp('')).toBe(0);
    expect(percentoABp('abc')).toBeNull();
    expect(percentoABp('120')).toBeNull();
    expect(formattaPercento(1250)).toBe('12,5');
    expect(formattaPercento(1000)).toBe('10');
  });

  it('il caso del gestionale: 100 pezzi da 0,95 al -10% fanno 85,50, non 86,00', () => {
    expect(totaleRigaCent(95, [1000], quantitaAMilli(100))).toBe(8550);
    expect(formattaNettoUnitario(95, [1000])).toBe('0,855');
  });

  it('sconti a cascata -10% -20%, arrotondando solo il totale', () => {
    // 10,00 × 0,90 × 0,80 = 7,20
    expect(totaleRigaCent(1000, [1000, 2000], quantitaAMilli(1))).toBe(720);
    expect(formattaNettoUnitario(1000, [1000, 2000])).toBe('7,20');
    // 3,33 × 0,9 × 0,8 = 2,3976 → 95 pezzi = 227,772 → 227,77 (col netto arrotondato sarebbe 228,00)
    expect(totaleRigaCent(333, [1000, 2000], quantitaAMilli(95))).toBe(22777);
    expect(formattaNettoUnitario(333, [1000, 2000])).toBe('2,3976');
  });

  it('quantità decimali e mezzo centesimo per eccesso', () => {
    expect(totaleRigaCent(333, [], quantitaAMilli(2.5))).toBe(833); // 8,325 → 8,33
    expect(totaleRigaCent(125, [5000], quantitaAMilli(1))).toBe(63); // 0,625 → 0,63
  });

  it('rifiuta sconti e importi non interi', () => {
    expect(() => totaleRigaCent(100, [10001], 1000)).toThrow();
    expect(() => totaleRigaCent(1.5, [], 1000)).toThrow();
  });

  it('IVA e piede del preventivo', () => {
    expect(ivaCent(10000, 2200)).toBe(2200);
    expect(ivaCent(12345, 2200)).toBe(2716); // 27,159 → 27,16
    expect(totaliPreventivo([10000, 2345], 2200)).toEqual({ nettoCent: 12345, ivaCent: 2716, totaleCent: 15061 });
  });
});
