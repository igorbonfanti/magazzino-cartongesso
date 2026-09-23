import { describe, expect, it } from 'vitest';
import { cercaArticoli, leggiRigheListino, scontoABp, trovaIntestazione } from '../src/lib/listino';
import {
  euroADecimillesimi,
  formattaNettoDaListino,
  formattaPrezzoListino,
  totaleRigaDaListino,
} from '../src/money';

// Righe come le restituisce SheetJS con header: 1. I valori sono di prova,
// non prezzi del magazzino: servono solo a verificare la lettura.
const RIGHE: unknown[][] = [
  ['LISTINO VENDITA'],
  ['Codice articolo', 'Descrizione', 'Prezzo 1', 'UM', 'Note', 'Sconto', '', '', 'Fornitore', '', 'Categoria'],
  ['CAR13', 'CARTONGESSO BA13 LASTRA CM.200x120', 7.2, 'PZ', '', 0.1, '', '', 'SINIAT', '', 'CARTONGESSO'],
  ['VITE25', 'VITE FOSFATATA 3,5X25', '0,0125', 'PZ', '', '10', '', '', 'AKIFIX', '', 'VITERIA'],
  ['', 'riga senza codice', 1, '', '', '', '', '', '', '', ''],
  [' GUI7 ', 'GUIDA 75 BARRA 3 M', '4,95', 'ML', '', -5, '', '', 'SINIAT', '', 'PROFILI'],
  ['NOPRE', 'ARTICOLO SENZA PREZZO', 'su richiesta', '', '', '', '', '', '', '', ''],
];

describe('prezzi di listino in decimillesimi', () => {
  it('dall\'Excel o dal testo, senza passare per l\'arrotondamento al centesimo', () => {
    expect(euroADecimillesimi(7.2)).toBe(72000);
    expect(euroADecimillesimi(0.855)).toBe(8550);
    expect(euroADecimillesimi('0,0125')).toBe(125);
    expect(euroADecimillesimi('1.234,50')).toBe(12345000);
    expect(euroADecimillesimi('12.5')).toBe(125000);
    expect(euroADecimillesimi(0.123456)).toBe(1235);
    expect(euroADecimillesimi('')).toBeNull();
    expect(euroADecimillesimi('su richiesta')).toBeNull();
    expect(euroADecimillesimi(null)).toBeNull();
  });

  it('si mostrano con almeno due decimali e fino a quattro', () => {
    expect(formattaPrezzoListino(72000)).toBe('7,20');
    expect(formattaPrezzoListino(125)).toBe('0,0125');
    expect(formattaPrezzoListino(8550)).toBe('0,855');
    expect(formattaPrezzoListino(12345000)).toBe('1.234,50');
  });

  it('il totale di riga si arrotonda una volta sola, come nel gestionale', () => {
    // 100 pezzi da 0,95 al −10% fanno 85,50, non 86,00
    expect(totaleRigaDaListino(9500, [1000], 100_000)).toBe(8550);
    // 1000 viti da 0,0125: 12,50
    expect(totaleRigaDaListino(125, [], 1_000_000)).toBe(1250);
    // 132 m² a 3,20 al −10%: 380,16
    expect(totaleRigaDaListino(32000, [1000], 132_000)).toBe(38016);
    expect(formattaNettoDaListino(9500, [1000])).toBe('0,855');
  });
});

describe('lettura del listino, come nel gestionale', () => {
  it('trova l\'intestazione nelle prime righe', () => {
    expect(trovaIntestazione(RIGHE)).toEqual({ riga: 1, codice: 0, descrizione: 1, prezzo: 2, um: 3 });
  });

  it('legge codice, descrizione, prezzo, sconto (F), fornitore (I), categoria (K) e UM', () => {
    const a = leggiRigheListino(RIGHE);
    expect(a.map((x) => x.codice)).toEqual(['CAR13', 'VITE25', 'GUI7', 'NOPRE']);
    expect(a[0]).toEqual({
      codice: 'CAR13', descrizione: 'CARTONGESSO BA13 LASTRA CM.200x120', prezzo: 72000, scontoBp: 1000,
      fornitore: 'SINIAT', categoria: 'CARTONGESSO', um: 'PZ',
    });
    expect(a[1]).toMatchObject({ prezzo: 125, scontoBp: 1000 });
    expect(a[2]).toMatchObject({ codice: 'GUI7', prezzo: 49500, scontoBp: 500 });
    // prezzo illeggibile: 0, e l'articolo resta cercabile
    expect(a[3]).toMatchObject({ prezzo: 0, scontoBp: 0 });
  });

  it('sconto: frazione, percentuale o negativo valgono uguale', () => {
    expect(scontoABp(0.1)).toBe(1000);
    expect(scontoABp('10')).toBe(1000);
    expect(scontoABp(-10)).toBe(1000);
    expect(scontoABp(0.125)).toBe(1250);
    expect(scontoABp('12,5%')).toBe(1250);
    expect(scontoABp('')).toBe(0);
    expect(scontoABp(undefined)).toBe(0);
  });

  it('senza le intestazioni attese si ferma con un messaggio chiaro', () => {
    expect(() => leggiRigheListino([['a', 'b'], [1, 2]])).toThrow(/articolo.*descrizione.*prezzo/);
  });

  it('ricerca: tutte le parole, il codice identico per primo', () => {
    const a = leggiRigheListino(RIGHE);
    expect(cercaArticoli(a, 'vite 25').map((x) => x.codice)).toEqual(['VITE25']);
    expect(cercaArticoli(a, 'siniat').map((x) => x.codice)).toEqual(['CAR13', 'GUI7']);
    expect(cercaArticoli(a, 'gui7')[0]!.codice).toBe('GUI7');
    expect(cercaArticoli(a, '  ')).toEqual([]);
  });
});
