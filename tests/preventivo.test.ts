import { describe, expect, it } from 'vitest';
import type { RigaDistinta } from '../src/engine';
import type { ArticoloListino } from '../src/lib/listino';
import { scorporaIva } from '../src/money';
import type { PrezzoRiga } from '../src/prezzi';
import {
  aggiungiRighe, bozzaDaSalvato, bozzaPreventivoVuota, calcolaRiga, calcolaTotali, clienteVuoto, dataItaliana, datiDaBozza,
  leggiBozzaPreventivo, nettoUnitario, numeroPreventivo, oggi, preventivoValido, righeAZero, righeDaDistinta, testoRicerca, totaliBozza,
} from '../src/preventivo';
import type { BozzaPreventivo, RigaBozzaPreventivo } from '../src/preventivo';

// Codici e prezzi di prova, non quelli del listino del magazzino.

let n = 0;
const id = () => `r${++n}`;

function riga(x: Partial<RigaBozzaPreventivo>): RigaBozzaPreventivo {
  return { id: id(), tipo: 'listino', codice: 'ART1', descrizione: 'Articolo', um: 'pz', prezzoDm: 0, sconto1Bp: 0, prezzo: '', sconto2: '', qta: '1', ...x };
}

describe('numeri e date', () => {
  it('serie PCG, quattro cifre almeno', () => {
    expect(numeroPreventivo(2026, 1)).toBe('PCG-2026-0001');
    expect(numeroPreventivo(2026, 231)).toBe('PCG-2026-0231');
    expect(numeroPreventivo(2026, 12345)).toBe('PCG-2026-12345');
  });

  it("la data è quella dell'orologio locale, non UTC", () => {
    expect(oggi(new Date(2026, 8, 24, 23, 30))).toBe('2026-09-24');
    expect(oggi(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
    expect(dataItaliana('2026-09-24')).toBe('24/09/2026');
  });
});

describe('righe: sconti a cascata, netto mai arrotondato', () => {
  it('il caso del gestionale: 100 pezzi da 0,95 al −10% fanno 85,50', () => {
    const c = calcolaRiga(riga({ prezzoDm: 9500, sconto1Bp: 1000, qta: '100' }));
    expect(c).toMatchObject({ totaleCent: 8550 });
    expect(nettoUnitario(c as never)).toBe('0,855');
  });

  it('sconto base del listino e sconto extra, a cascata', () => {
    // 7,20 −10% −5% = 6,156 × 38 = 233,928 → 233,93
    const c = calcolaRiga(riga({ prezzoDm: 72000, sconto1Bp: 1000, sconto2: '5', qta: '38' }));
    expect(c).toEqual({ prezzoDm: 72000, sconto1Bp: 1000, sconto2Bp: 500, quantitaMilli: 38000, totaleCent: 23393 });
  });

  it('riga manuale: prezzo scritto, niente sconto base; vuoto vale zero', () => {
    expect(calcolaRiga(riga({ tipo: 'manuale', prezzo: '12,5', qta: '2,5', sconto1Bp: 1000 }))).toMatchObject({ sconto1Bp: 0, totaleCent: 3125 });
    expect(calcolaRiga(riga({ tipo: 'manuale', prezzo: '', qta: '3' }))).toMatchObject({ totaleCent: 0 });
  });

  it('valori non validi', () => {
    expect(calcolaRiga(riga({ qta: '' }))).toEqual({ errore: 'quantità non valida' });
    expect(calcolaRiga(riga({ sconto2: 'abc' }))).toEqual({ errore: 'sconto non valido' });
    expect(calcolaRiga(riga({ tipo: 'manuale', prezzo: '-5' }))).toEqual({ errore: 'prezzo non valido' });
  });
});

describe('totali', () => {
  it('Totale Netto, IVA 22%, Totale IVA inclusa', () => {
    expect(calcolaTotali([8550, 23393], 2200)).toEqual({
      imponibileCent: 31943, ivaCent: 7027, totaleCent: 38970, arrotondamentoCent: 0, nettoFinaleCent: 31943, ivaFinaleCent: 7027, finaleCent: 38970,
    });
  });

  it('sconto arrotondamento sul totale IVA inclusa, imponibile scorporato', () => {
    // 389,70 − 0,70 = 389,00 → 318,85 + 70,15
    expect(calcolaTotali([8550, 23393], 2200, 70)).toMatchObject({
      totaleCent: 38970, arrotondamentoCent: 70, nettoFinaleCent: 31885, ivaFinaleCent: 7015, finaleCent: 38900,
    });
    // non oltre il totale
    expect(calcolaTotali([1000], 2200, 5000)).toMatchObject({ arrotondamentoCent: 1220, finaleCent: 0, nettoFinaleCent: 0, ivaFinaleCent: 0 });
    expect(scorporaIva(12200, 2200)).toEqual({ nettoCent: 10000, ivaCent: 2200, totaleCent: 12200 });
  });

  it('nella bozza le righe non valide contano zero', () => {
    const b: BozzaPreventivo = { ...bozzaPreventivoVuota(), righe: [riga({ prezzoDm: 100000, qta: '2' }), riga({ qta: 'x' })] };
    expect(totaliBozza(b)).toMatchObject({ imponibileCent: 2000, totaleCent: 2440 });
  });
});

describe('dalla distinta al preventivo', () => {
  const rd = (x: Partial<RigaDistinta>): RigaDistinta => ({
    ruolo: 'LASTRA', chiave: 'LASTRA_BA13_STD', descrizione: 'Lastra BA13', um: 'mq', incidenza: 2, quantita: 88, contenuto: 2.4, umConf: 'lastre',
    pezzi: 37, sfridoPct: 10, metodo: 'incidenza', ...x,
  });
  const art: ArticoloListino = { codice: 'CAR13', descrizione: 'CARTONGESSO BA13 (PROVA)', prezzo: 72000, scontoBp: 1000, fornitore: '', categoria: '' };

  it('prezzate dal listino, con lo sconto extra della mappatura; le altre gialle senza prezzo né codice inventato', () => {
    const prezzi: PrezzoRiga[] = [
      { stato: 'prezzata', articolo: art, mappatura: { chiave: 'LASTRA_BA13_STD', codice: 'CAR13', prezzoPer: 'confezione', scontoExtraBp: 500, origine: 'archivio' }, quantitaMilli: 37000, unita: 'lastre', totaleCent: 0 },
      { stato: 'fuori_listino', mappatura: { chiave: 'VITI_25', codice: 'VITX', prezzoPer: 'confezione', origine: 'archivio' }, quantitaMilli: 1000, unita: 'conf.', totaleCent: 0 },
      { stato: 'da_mappare', quantitaMilli: 3000, unita: 'rotoli', totaleCent: 0 },
      { stato: 'da_mappare', quantitaMilli: 0, unita: 'pz', totaleCent: 0 },
    ];
    const righe = righeDaDistinta(
      [rd({}), rd({ chiave: 'VITI_25', descrizione: 'Viti 25', umConf: 'conf.', pezzi: 1 }), rd({ chiave: 'NASTRO_CARTA', descrizione: 'Nastro', umConf: 'rotoli', pezzi: 3 }), rd({ pezzi: 0 })],
      prezzi, id,
    );
    expect(righe.map(({ id: _id, ...r }) => r)).toEqual([
      { tipo: 'listino', codice: 'CAR13', descrizione: 'CARTONGESSO BA13 (PROVA)', um: 'lastre', prezzoDm: 72000, sconto1Bp: 1000, prezzo: '', sconto2: '5', qta: '37', chiave: 'LASTRA_BA13_STD' },
      { tipo: 'manuale', codice: 'VITX', descrizione: 'Viti 25', um: 'conf.', prezzoDm: 0, sconto1Bp: 0, prezzo: '', sconto2: '', qta: '1', chiave: 'VITI_25', daMappare: true },
      { tipo: 'manuale', codice: '', descrizione: 'Nastro', um: 'rotoli', prezzoDm: 0, sconto1Bp: 0, prezzo: '', sconto2: '', qta: '3', chiave: 'NASTRO_CARTA', daMappare: true },
    ]);
  });

  it('prezzo al m²: la quantità è quella venduta (38 lastre da 2,4 = 91,2 m²)', () => {
    const p: PrezzoRiga = { stato: 'prezzata', articolo: art, mappatura: { chiave: 'LASTRA_BA13_STD', codice: 'CAR13', prezzoPer: 'um', origine: 'archivio' }, quantitaMilli: 91200, unita: 'mq', totaleCent: 0 };
    expect(righeDaDistinta([rd({ pezzi: 38 })], [p], id)[0]).toMatchObject({ qta: '91,2', um: 'mq' });
  });

  it('una seconda distinta si somma: stesso articolo, unità e sconto extra', () => {
    const a = [riga({ codice: 'CAR13', um: 'lastre', qta: '37' }), riga({ tipo: 'manuale', codice: '', descrizione: 'Nastro', qta: '3' })];
    const b = [riga({ codice: 'CAR13', um: 'lastre', qta: '12' }), riga({ codice: 'CAR13', um: 'lastre', sconto2: '5', qta: '1' }), riga({ tipo: 'manuale', codice: '', descrizione: 'Nastro', qta: '2' })];
    const tutte = aggiungiRighe(a, b);
    expect(tutte.map((r) => `${r.codice || r.descrizione}:${r.qta}:${r.sconto2}`)).toEqual(['CAR13:49:', 'Nastro:3:', 'CAR13:1:5', 'Nastro:2:']);
    expect(a[0]!.qta).toBe('37');
  });
});

describe('salvataggio e lettura', () => {
  const bozza = (): BozzaPreventivo => ({
    ...bozzaPreventivoVuota(),
    cliente: { ...clienteVuoto(), ragione: ' Edil  Prova srl ', piva: 'IT 012 345 678 90', cantiere: 'Via Roma 1' },
    righe: [riga({ codice: 'CAR13', prezzoDm: 72000, sconto1Bp: 1000, sconto2: '5', qta: '38' }), riga({ tipo: 'manuale', codice: '', descrizione: 'Trasporto', prezzo: '50', qta: '1' })],
    arrotondamento: '0,70',
    note: ' Validità 30 giorni ',
  });

  it('i dati da salvare: interi, cliente pulito, P.IVA scritta a mano solo cifre', () => {
    const d = datiDaBozza(bozza(), { data: '2026-09-24', iban: 'IT85J0503401742000000032814', creatoDa: 'prova@esempio.it' });
    if ('errori' in d) throw new Error(d.errori.join(' '));
    expect(d.cliente).toMatchObject({ ragione: 'Edil Prova srl', piva: '01234567890', cantiere: 'Via Roma 1', daAnagrafica: false });
    expect(d.righe.map((r) => [r.codice, r.totaleCent, r.manuale])).toEqual([['CAR13', 23393, false], ['', 5000, true]]);
    expect(d.totali).toMatchObject({ imponibileCent: 28393, totaleCent: 34639, arrotondamentoCent: 70, finaleCent: 34569 });
    expect(d.note).toBe('Validità 30 giorni');
  });

  it('errori: senza righe, righe non valide, manuali senza descrizione, IVA sbagliata', () => {
    const opz = { data: '2026-09-24', iban: '', creatoDa: '' };
    expect(datiDaBozza(bozzaPreventivoVuota(), opz)).toEqual({ errori: ['Il preventivo non ha righe.'] });
    const b = bozza();
    b.righe.push(riga({ qta: '' }), riga({ tipo: 'manuale', descrizione: ' ', prezzo: '1' }));
    b.iva = 'x';
    expect(datiDaBozza(b, opz)).toEqual({ errori: ['Aliquota IVA non valida.', 'Riga 3: quantità non valida.', 'Riga 4: manca la descrizione.'] });
  });

  it('senza ragione sociale niente cliente; le righe a zero si contano', () => {
    const b = { ...bozza(), cliente: clienteVuoto() };
    b.righe.push(riga({ tipo: 'manuale', descrizione: 'Omaggio', prezzo: '', qta: '1' }));
    const d = datiDaBozza(b, { data: '2026-09-24', iban: '', creatoDa: '' });
    expect('errori' in d ? d : d.cliente).toBeNull();
    expect(righeAZero(b)).toBe(1);
  });

  it('il documento letto da Firestore torna uguale; con un altro numero no', () => {
    const d = datiDaBozza(bozza(), { data: '2026-09-24', iban: 'IT85J0503401742000000032814', creatoDa: 'prova@esempio.it' });
    if ('errori' in d) throw new Error();
    const doc = JSON.parse(JSON.stringify({ ...d, numero: 'PCG-2026-0007', anno: 2026, progressivo: 7, cerca: testoRicerca('PCG-2026-0007', d.cliente) }));
    const p = preventivoValido('PCG-2026-0007', doc, '2026-09-24T08:00:00.000Z');
    expect(p).toMatchObject({ numero: 'PCG-2026-0007', anno: 2026, progressivo: 7, righe: d.righe, totali: d.totali, cliente: d.cliente });
    expect(p?.cerca).toBe('pcg-2026-0007 edil prova srl 01234567890 via roma 1');
    expect(preventivoValido('PCG-2026-0008', doc)).toBeNull();
    expect(preventivoValido('PCG-2026-0007', { ...doc, righe: [{ codice: 'X' }] })).toBeNull();
  });

  it('duplicato con i prezzi di oggi: gli articoli spariti dal listino restano, gialli, con il loro netto', () => {
    const d = datiDaBozza(
      { ...bozza(), righe: [...bozza().righe, riga({ codice: 'VECCHIO', descrizione: 'Non più a listino', prezzoDm: 100000, sconto1Bp: 2000, qta: '2' })] },
      { data: '2026-09-24', iban: '', creatoDa: '' },
    );
    if ('errori' in d) throw new Error();
    const p = preventivoValido('PCG-2026-0007', JSON.parse(JSON.stringify({ ...d, numero: 'PCG-2026-0007' })))!;
    const listino = new Map<string, ArticoloListino>([['CAR13', { codice: 'CAR13', descrizione: 'CARTONGESSO BA13', prezzo: 75000, scontoBp: 1000, fornitore: '', categoria: '' }]]);
    const { bozza: b, aggiornati, spariti } = bozzaDaSalvato(p, listino, '2026-10-01T00:00:00Z', id);
    expect([aggiornati, spariti]).toEqual([1, 1]);
    expect(b.righe.map(({ id: _id, ...r }) => r)).toEqual([
      { tipo: 'listino', codice: 'CAR13', descrizione: 'CARTONGESSO BA13', um: 'pz', prezzoDm: 75000, sconto1Bp: 1000, prezzo: '', sconto2: '5', qta: '38' },
      { tipo: 'manuale', codice: '', descrizione: 'Trasporto', um: 'pz', prezzoDm: 0, sconto1Bp: 0, prezzo: '50,00', sconto2: '', qta: '1' },
      { tipo: 'manuale', codice: 'VECCHIO', descrizione: 'Non più a listino', um: 'pz', prezzoDm: 0, sconto1Bp: 0, prezzo: '8,00', sconto2: '', qta: '2', daMappare: true },
    ]);
    expect(b).toMatchObject({ iva: '22', arrotondamento: '0,70', daNumero: 'PCG-2026-0007', listinoDel: '2026-10-01T00:00:00Z' });
  });

  it('la bozza torna uguale da localStorage; se è rovinata no', () => {
    const b = bozza();
    expect(leggiBozzaPreventivo(JSON.parse(JSON.stringify(b)))).toEqual(b);
    expect(leggiBozzaPreventivo({ ...b, righe: [{ id: 1 }] })).toBeNull();
    expect(leggiBozzaPreventivo(null)).toBeNull();
  });
});
