import { describe, expect, it } from 'vitest';
import {
  bozzaValida,
  bozzaVuota,
  campituraPerMotore,
  campituraVuota,
  conAmbito,
  conOpera,
  leggiBozza,
  leggiNumero,
  requisitiPerSelettore,
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

describe('bozza con il selettore Siniat', () => {
  it('cambiando opera si riparte dalla soluzione, i requisiti restano', () => {
    const b = { ...conOpera(bozzaVuota(), 'parete'), soluzione: { tipo: 'sistema' as const, id: 'memento-p26-DX' } };
    const conFuoco = { ...b, requisiti: { ...b.requisiti, fuoco: 60 } };
    const soffitto = conOpera(conFuoco, 'controsoffitto');
    expect(soffitto.soluzione).toBeNull();
    expect(soffitto.ambito).toBe('controsoffitto');
    expect(soffitto.requisiti.fuoco).toBe(60);
    // il solaio non ha il calcolo classico
    expect(conOpera(conFuoco, 'solaio').ambito).toBeNull();
  });

  it("l'altezza conta solo per le opere verticali", () => {
    const b = { ...conOpera(bozzaVuota(), 'parete'), requisiti: { ...bozzaVuota().requisiti, altezza: '4,5' } };
    expect(requisitiPerSelettore(b)!.altezza).toBe(4.5);
    expect(requisitiPerSelettore(conOpera(b, 'controsoffitto'))!.altezza).toBe(0);
    expect(requisitiPerSelettore(bozzaVuota())).toBeNull();
  });

  it('una bozza della versione precedente riparte dal calcolo classico', () => {
    const { opera: _o, requisiti: _r, soluzione: _s, ...vecchia } = {
      ...conAmbito(bozzaVuota(), 'controparete'),
      sistemaId: 'controparete_singola' as const,
    };
    const b = leggiBozza(vecchia)!;
    expect(b.opera).toBe('controparete');
    expect(b.soluzione).toEqual({ tipo: 'classico' });
    expect(b.requisiti.fuoco).toBe(0);
    expect(b.disponibilita).toBe('magazzino');
    expect(leggiBozza({ ...bozzaVuota(), soluzione: { tipo: 'boh' } })).toBeNull();
    expect(leggiBozza({ ...bozzaVuota(), opera: 'tetto' })).toBeNull();
  });
});

describe('bozza — soluzioni a magazzino o su ordinazione', () => {
  it('si parte da quelle a magazzino e la scelta si ricorda', () => {
    expect(bozzaVuota().disponibilita).toBe('magazzino');
    const salvata = { ...conOpera(bozzaVuota(), 'parete'), disponibilita: 'ordine' as const };
    expect(leggiBozza(JSON.parse(JSON.stringify(salvata)))!.disponibilita).toBe('ordine');
  });

  it('una bozza senza la scelta (versione di ieri) parte da quelle a magazzino, senza perdere la soluzione', () => {
    const { disponibilita: _d, ...ieri } = {
      ...conOpera(bozzaVuota(), 'parete'),
      soluzione: { tipo: 'certificata' as const, id: 'AF-009' },
    };
    const b = leggiBozza(ieri)!;
    expect(b.disponibilita).toBe('magazzino');
    expect(b.soluzione).toEqual({ tipo: 'certificata', id: 'AF-009' });
    expect(b.opera).toBe('parete');
  });

  it('un valore sconosciuto non passa', () => {
    expect(bozzaValida({ ...bozzaVuota(), disponibilita: 'boh' })).toBe(false);
  });
});

describe('bozza — lastre a magazzino delle certificate', () => {
  it('la scelta delle solidtex si ricorda; senza, valgono le BA15 di partenza', () => {
    const conGuida = { ...conOpera(bozzaVuota(), 'parete'), soluzione: { tipo: 'certificata' as const, id: 'AF-009', lastre: 'guida' as const } };
    expect(leggiBozza(JSON.parse(JSON.stringify(conGuida)))!.soluzione).toEqual({ tipo: 'certificata', id: 'AF-009', lastre: 'guida' });
    expect(bozzaValida({ ...bozzaVuota(), soluzione: { tipo: 'certificata', id: 'AF-009' } })).toBe(true);
    expect(bozzaValida({ ...bozzaVuota(), soluzione: { tipo: 'certificata', id: 'AF-009', lastre: 'boh' } })).toBe(false);
  });
});
