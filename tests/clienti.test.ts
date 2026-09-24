import { describe, expect, it } from 'vitest';
import { clienteDaAnagrafica, clienteDaDocumento, cercaClienti, leggiRigheClienti, unisciClienti } from '../src/lib/clienti';
import { IMPOSTAZIONI_PARTENZA, ibanLeggibile, ibanValido, impostazioniValide } from '../src/lib/impostazioni';

// Clienti di prova, non quelli dell'anagrafica.

describe('anagrafica del gestionale, in sola lettura', () => {
  const righe = [
    ['Cod', 'Ragione sociale', 'P.IVA', '', '', '', '', 'Email', 'Indirizzo', '', 'Città'],
    ['C1', ' EDIL PROVA SRL ', 1234567890, '', '', '', '', 'info@prova.it', 'VIA ROMA 1', '', 'MILANO'],
    ['C2', '', '999'],
    ['C3', 'Rossi Mario', 'RSSMRA80A01F205X'],
  ];

  it('clienti.xlsx letto come il gestionale: dalla seconda riga, colonne B C H I K', () => {
    expect(leggiRigheClienti(righe)).toEqual([
      { ragione: 'EDIL PROVA SRL', piva: '1234567890', email: 'info@prova.it', indirizzo: 'VIA ROMA 1', citta: 'MILANO' },
      { ragione: 'Rossi Mario', piva: 'RSSMRA80A01F205X', email: '', indirizzo: '', citta: '' },
    ]);
  });

  it('ricerca come il gestionale: da due lettere, ragione sociale o P.IVA, senza badare alle maiuscole', () => {
    const elenco = leggiRigheClienti(righe);
    expect(cercaClienti(elenco, 'e')).toEqual([]);
    expect(cercaClienti(elenco, 'edil').map((c) => c.ragione)).toEqual(['EDIL PROVA SRL']);
    expect(cercaClienti(elenco, 'rssmra').map((c) => c.ragione)).toEqual(['Rossi Mario']);
    expect(cercaClienti(elenco, 'o', 1)).toEqual([]);
    expect(cercaClienti(elenco, 'ro', 1)).toHaveLength(1);
  });

  it('i clienti aggiunti a mano nel gestionale, senza doppioni', () => {
    const doc = clienteDaDocumento({ ragione: 'EDIL PROVA SRL', piva: '1234567890', manual: true, timestamp: {} });
    expect(doc).toEqual({ ragione: 'EDIL PROVA SRL', piva: '1234567890', email: '', indirizzo: '', citta: '' });
    expect(clienteDaDocumento({ piva: '1' })).toBeNull();
    expect(unisciClienti(leggiRigheClienti(righe), [doc!])).toHaveLength(2);
  });

  it('sul preventivo: telefono e cantiere si scrivono ogni volta', () => {
    expect(clienteDaAnagrafica(leggiRigheClienti(righe)[0]!)).toEqual({
      ragione: 'EDIL PROVA SRL', piva: '1234567890', indirizzo: 'VIA ROMA 1', citta: 'MILANO', email: 'info@prova.it', tel: '', cantiere: '', daAnagrafica: true,
    });
  });
});

describe('impostazioni del preventivo', () => {
  it("l'IBAN del gestionale di partenza, IVA 22%", () => {
    expect(impostazioniValide(undefined)).toEqual(IMPOSTAZIONI_PARTENZA);
    expect(impostazioniValide({ iban: 'it85 j050 3401 7420 0000 0032 814', ivaBp: 1000 })).toEqual({ iban: 'IT85J0503401742000000032814', ivaBp: 1000 });
    expect(impostazioniValide({ iban: 'boh', ivaBp: 22.5 })).toEqual(IMPOSTAZIONI_PARTENZA);
  });

  it('IBAN: forma e lettura a gruppi di quattro', () => {
    expect(ibanValido('IT85 J050 3401 7420 0000 0032 814')).toBe('IT85J0503401742000000032814');
    expect(ibanValido('12345')).toBeNull();
    expect(ibanLeggibile('IT85J0503401742000000032814')).toBe('IT85 J050 3401 7420 0000 0032 814');
  });
});
