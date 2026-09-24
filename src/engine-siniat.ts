/**
 * Motore della distinta per le soluzioni Siniat — funzioni pure.
 *
 * Le quantità vengono dalle incidenze medie del Memento per la scheda e la
 * variante scelte (per m², h = 3 m, sfrido Siniat del 5% già compreso):
 *
 *   lastre, isolante:  netto = incidenza / 1,05 × mq      poi il nostro sfrido,
 *                      pezzi come nel flusso generico (pezziConSfrido)
 *   altre voci:        q = incidenza × mq                 (il 5% Siniat resta)
 *                      pezzi = ceil(q / confezione)
 *
 * Per le configurazioni certificate senza una scheda Memento con le stesse
 * lastre si usano le regole con cui il Memento costruisce le sue tabelle
 * (incidenzeDaRegola), verificate nei test contro le tabelle stesse.
 *
 * Con misure L×H, guide e montanti si correggono con la geometria come nel
 * motore generico; i tasselli delle guide sono uno ogni 50 cm (manuale del
 * posatore). Il Memento non li conta.
 */
import {
  CATALOGO, configurazione, sistema as trovaSistema, sostituisciStratigrafia, spessoreIsolante, spessoreLastra, variante as trovaVariante,
} from './data/siniat/catalogo';
import { articoloSiniat, lastraDaTesto } from './data/siniat/articoli';
import { aMagazzino, testoOrdine } from './data/magazzino';
import { arrotondaSu, guideGeometriche, metri, misura, montantiGeometrici, netta, pezziConSfrido } from './engine';
import type { Avviso, RigaDistinta } from './engine';
import type { Campitura, Classificazione, InterasseSiniat, SistemaSiniat, SoluzioneScelta, Strato, Stratigrafia } from './types';

/** sfrido già compreso nelle incidenze Siniat */
export const SFRIDO_SINIAT = 5;

type Isolante = NonNullable<Stratigrafia['isolante']>;

export interface VoceCalcolo {
  prodotto: string;
  unita: string;
  valore: number | string | null;
}

export interface DistintaSiniat {
  titolo: string;
  codice: string | null;
  fonteIncidenze: 'memento' | 'regola';
  variante: { nome: string | null; montante: string | null; montanti: string | null; interasse: InterasseSiniat | null };
  mqLordi: number;
  mqAperture: number;
  mqNetti: number;
  righe: RigaDistinta[];
  avvisi: Avviso[];
  hint: string[];
  dicitura?: string;
  classificazioni: Classificazione[];
}

interface Base {
  titolo: string;
  codice: string | null;
  tipo: 'parete' | 'setto' | 'controparete' | 'controsoffitto' | 'esterno';
  file: number;
  accoppiati: boolean;
  interasse: InterasseSiniat | null;
  montante: string | null;
  voci: VoceCalcolo[];
  fonte: 'memento' | 'regola';
  variante: DistintaSiniat['variante'];
  classificazioni: Classificazione[];
  /** configurazioni certificate: l'isolante lo decide la stratigrafia certificata */
  isolante?: Isolante | null;
}

// ---------------------------------------------------------------- regole del Memento

const MONTANTI: Record<InterasseSiniat, [number, number]> = { '600': [1.8, 3.5], '400': [2.6, 5.3], '300': [3.5, 7.0] };
/** viti per m² di parete sulle due facce: lastra a vista e ogni strato interno; [montanti singoli, accoppiati] */
const VITI_VISTA: Record<InterasseSiniat, [number, number]> = { '600': [20, 30], '400': [25, 40], '300': [35, 50] };
const VITI_INTERNE: Record<InterasseSiniat, [number, number]> = { '600': [10, 15], '400': [15, 20], '300': [15, 30] };
/** viti SNT: entrano almeno 10 mm nel metallo (posatore p.23) */
const LUNGHEZZE_SNT = [25, 35, 45, 55, 70];

function famigliaViti(lastra: string): { nome: string; lunghezze?: number[] } {
  if (/ladura/.test(lastra)) return { nome: 'ladura', lunghezze: [25, 35] };
  if (/solidtex indoor/.test(lastra)) return { nome: 'S-tex', lunghezze: [32, 42] };
  if (/aquaboard|outdoor XT/.test(lastra)) return { nome: 'aquaboard', lunghezze: [32, 42] };
  return { nome: 'SNT' };
}

export function nomeIsolante(i: Isolante): string {
  const tipo = i.tipo === 'LR' ? 'lana di roccia' : i.tipo === 'LV' ? 'lana di vetro' : 'lana minerale';
  return `Isolante in ${tipo}` + (i.spessore ? ` sp. ${i.spessore} mm` : '') + (i.densita ? ` ${String(i.densita).replace('.', ',')} kg/m³` : '');
}

function arrotonda5(x: number): number {
  return Math.ceil(Math.round(x * 1000) / 1000 / 5) * 5;
}

/**
 * Le incidenze di una stratigrafia secondo le regole delle tabelle Memento:
 * lastre 1,05 m² per strato, guide e banda 0,7 m per fila di orditura,
 * montanti 1,05 / interasse (doppi se accoppiati), viti per strato con la
 * lunghezza data dalla profondità, stucco 0,35 kg e nastro 0,9 m per faccia.
 */
export function incidenzeDaRegola(st: Stratigrafia, interasse: InterasseSiniat, accoppiati: boolean): VoceCalcolo[] {
  const k = accoppiati ? 1 : 0;
  const voci = new Map<string, VoceCalcolo>();
  const somma = (prodotto: string, unita: string, q: number) => {
    const x = voci.get(prodotto);
    if (x) x.valore = (x.valore as number) + q;
    else voci.set(prodotto, { prodotto, unita, valore: q });
  };

  for (const s of [...st.lato1, ...st.lato2, ...st.intermedia]) somma('Lastre ' + s.lastra, 'm²', 1.05 * s.n);
  somma('Guide pregymetal', 'm', 0.7 * st.file);
  somma('Montanti pregymetal', 'm', MONTANTI[interasse][k] * st.file);

  // viti: per faccia, dall'orditura verso l'esterno; la tabella vale per due facce
  const facce = [[...st.lato1].reverse(), st.lato2].filter((f) => f.length);
  const viti = new Map<string, number>();
  const conta = (nome: string, q: number) => viti.set(nome, (viti.get(nome) ?? 0) + q);
  const lunghezza = (lastra: string, i: number, prof: number) => {
    const f = famigliaViti(lastra);
    const l = f.lunghezze ? f.lunghezze[Math.min(i, f.lunghezze.length - 1)] : (LUNGHEZZE_SNT.find((x) => x >= prof + 10) ?? 70);
    return `Viti ${f.nome} ${l} mm`;
  };
  for (const faccia of facce) {
    const strati = faccia.flatMap((s) => Array<string>(s.n).fill(s.lastra));
    let prof = 0;
    strati.forEach((lastra, i) => {
      prof += spessoreLastra(lastra);
      const tab = i === strati.length - 1 ? VITI_VISTA : VITI_INTERNE;
      conta(lunghezza(lastra, i, prof), tab[interasse][k] / 2);
    });
  }
  // lastra intermedia della doppia orditura: fissata da un lato solo, come uno strato interno
  let prof = 0;
  st.intermedia.flatMap((s) => Array<string>(s.n).fill(s.lastra)).forEach((lastra, i) => {
    prof += spessoreLastra(lastra);
    conta(lunghezza(lastra, i, prof), arrotonda5(VITI_INTERNE[interasse][k] / 2));
  });
  for (const [nome, q] of viti) somma(nome, 'cad.', arrotonda5(q));

  somma('Banda in polietilene', 'm', 0.7 * st.file);
  somma('Stucco per giunti Siniat', 'kg', 0.35 * facce.length);
  somma('Nastro per giunti', 'm', 0.9 * facce.length);
  if (st.isolante && !st.isolante.opzionale) somma(nomeIsolante(st.isolante), 'm²', 1.05 * st.file);
  return [...voci.values()].map((v) => ({ ...v, valore: Math.round((v.valore as number) * 1000) / 1000 }));
}

// ---------------------------------------------------------------- dalla scelta ai dati

function tipoDaFamiglia(f: string): Base['tipo'] {
  if (f.startsWith('controsoffitto') || f === 'riqualifica_solaio') return 'controsoffitto';
  if (f === 'setto_autoportante') return 'setto';
  if (f === 'controparete_vincolata') return 'controparete';
  if (f === 'parete_esterna' || f === 'controparete_esterna') return 'esterno';
  return 'parete';
}

function vociDaTabella(s: SistemaSiniat, colonna: string, montante?: string | null): VoceCalcolo[] {
  return (s.incidenze?.voci ?? []).map((v) => ({ prodotto: conSpessore(v.prodotto, s, montante), unita: v.unita, valore: v.valori[colonna] ?? null }));
}

/** "Isolante in lana minerale" → "Isolante in lana minerale sp. 60 mm", con lo spessore della scheda per il montante. */
export function conSpessore(prodotto: string, s: SistemaSiniat, montante?: string | null): string {
  // solo la lana: l'EPS del cappotto ha spessori suoi
  if (!/lana/i.test(prodotto) || /\bsp\./i.test(prodotto)) return prodotto;
  const sp = spessoreIsolante(s, montante);
  return sp ? `${prodotto} sp. ${sp} mm` : prodotto;
}

/** La stessa parete per il Memento: tipo, file e lastre per lato, senza guardare l'ordine dei lati. */
function firma(st: Stratigrafia): string {
  const lato = (l: Strato[]) => {
    const t = new Map<string, number>();
    for (const s of l) t.set(s.lastra, (t.get(s.lastra) ?? 0) + s.n);
    return [...t].sort().map(([k, n]) => `${k}x${n}`).join('+');
  };
  const lati = [lato(st.lato1), lato(st.lato2)].sort();
  return `${st.tipo}|${st.file}|${lati[0]}|${lati[1]}|${lato(st.intermedia)}`;
}

/** La scheda Memento con le stesse lastre, se c'è; a parità, quella con o senza isolante come la stratigrafia. */
function schedaPer(st: Stratigrafia): SistemaSiniat | undefined {
  const f = firma(st);
  const uguali = CATALOGO.sistemi.filter((s) => s.stratigrafia && s.incidenze && firma(s.stratigrafia) === f);
  const conLana = (s: SistemaSiniat) => (s.incidenze?.voci ?? []).some((v) => /isolante|lana/i.test(v.prodotto));
  return uguali.find((s) => conLana(s) === !!st.isolante) ?? uguali[0];
}

function interasseDa(mm: number | undefined): InterasseSiniat {
  return !mm || mm >= 600 ? '600' : mm >= 400 ? '400' : '300';
}

/** Dalla soluzione scelta ai dati per il calcolo, o il motivo per cui la distinta non è disponibile. */
export function risolviSoluzione(sol: SoluzioneScelta): Base | string {
  if (sol.tipo === 'sistema') {
    const s = trovaSistema(sol.id);
    if (!s) return 'Scheda non trovata nel catalogo.';
    if (!s.incidenze) return 'Per questa scheda il Memento non dà le quantità: distinta automatica non disponibile.';
    const v = (sol.varianteId && trovaVariante(sol.varianteId)?.variante) || s.varianti[0];
    if (!v) return 'La scheda non ha varianti.';
    const interasse = sol.interasse && v.colonne[sol.interasse] ? sol.interasse
      : (['600', '400', '300'] as InterasseSiniat[]).find((i) => v.colonne[i]) ?? null;
    const colonna = interasse ? v.colonne[interasse] : v.colonne.unica;
    if (!colonna) return 'Per questa variante il Memento non dà le quantità: distinta automatica non disponibile.';
    return {
      titolo: s.titolo, codice: s.codice, tipo: tipoDaFamiglia(s.famiglia),
      file: s.stratigrafia?.file ?? (s.famiglia === 'parete_doppia_orditura' ? 2 : 1),
      accoppiati: v.montanti === 'accoppiato', interasse, montante: v.montante ?? null,
      voci: vociDaTabella(s, colonna, v.montante), fonte: 'memento',
      variante: { nome: v.nome, montante: v.montante ?? null, montanti: v.montanti ?? null, interasse }, classificazioni: [],
    };
  }

  const c = configurazione(sol.id);
  if (!c) return 'Configurazione non trovata nel catalogo.';
  const m = c.sistemaMemento ? trovaSistema(c.sistemaMemento) : undefined;
  const vv = trovaVariante(sol.varianteId ?? c.varianteMemento ?? '');
  // lastre sostituite come ammette la guida: la parete che si monta è quella con le sostitute
  const sostGuida = (sol.sostituzioni ?? []).filter((x) => x.fonte === 'guida');
  const st = c.stratigrafia && sostGuida.length ? sostituisciStratigrafia(c.stratigrafia, sostGuida) : c.stratigrafia;
  if (st && sostGuida.length && !c.promat && (st.tipo === 'parete' || st.tipo === 'setto')) {
    const scheda = schedaPer(st);
    const accoppiati = (vv?.variante.montanti ?? st.montanti) === 'accoppiato';
    const interasse = sol.interasse ?? interasseDa(st.interasse);
    const colonna = `${interasse}${accoppiati ? '][' : ']'}`;
    if (scheda?.incidenze && scheda.incidenze.voci.some((v) => typeof v.valori[colonna] === 'number')) {
      const v = vv?.variante;
      return {
        titolo: c.codice, codice: c.codice, tipo: st.tipo, file: st.file, accoppiati, interasse, montante: v?.montante ?? st.montante ?? null,
        voci: vociDaTabella(scheda, colonna, v?.montante ?? st.montante), fonte: 'memento',
        variante: { nome: v?.nome ?? null, montante: v?.montante ?? st.montante ?? null, montanti: v?.montanti ?? st.montanti ?? null, interasse },
        classificazioni: c.classificazioni, isolante: st.isolante ?? null,
      };
    }
  } else if (m?.incidenze && vv && vv.sistema.id === m.id && !c.promat) {
    const v = vv.variante;
    const interasse = sol.interasse && v.colonne[sol.interasse] ? sol.interasse : (['600', '400', '300'] as InterasseSiniat[]).find((i) => v.colonne[i]) ?? null;
    const colonna = interasse ? v.colonne[interasse] : v.colonne.unica;
    if (colonna) {
      return {
        titolo: c.codice, codice: c.codice, tipo: st?.tipo ?? tipoDaFamiglia(m.famiglia), file: st?.file ?? m.stratigrafia?.file ?? 1,
        accoppiati: v.montanti === 'accoppiato', interasse, montante: v.montante ?? st?.montante ?? null, voci: vociDaTabella(m, colonna, v.montante ?? st?.montante), fonte: 'memento',
        variante: { nome: v.nome, montante: v.montante ?? null, montanti: v.montanti ?? null, interasse },
        classificazioni: c.classificazioni, ...(st ? { isolante: st.isolante ?? null } : {}),
      };
    }
  }
  if (!st || c.promat || (st.tipo !== 'parete' && st.tipo !== 'setto') || c.sezione === 'esterne' || /curva/i.test(c.codice)) {
    return 'Per questa configurazione la distinta automatica non è ancora disponibile: si compone dal rapporto di classificazione.';
  }
  // l'orditura scelta per l'altezza, se c'è, altrimenti quella certificata
  const v = vv && m && vv.sistema.id === m.id ? vv.variante : undefined;
  const interasse = sol.interasse ?? interasseDa(st.interasse);
  const accoppiati = (v?.montanti ?? st.montanti) === 'accoppiato';
  const montante = v?.montante ?? st.montante ?? null;
  return {
    titolo: c.codice, codice: c.codice, tipo: st.tipo, file: st.file, accoppiati, interasse, montante,
    voci: incidenzeDaRegola(st, interasse, accoppiati), fonte: 'regola',
    variante: { nome: v?.nome ?? null, montante, montanti: v?.montanti ?? st.montanti ?? null, interasse },
    classificazioni: c.classificazioni, isolante: st.isolante ?? null,
  };
}

// ---------------------------------------------------------------- calcolo

export interface OpzioniSiniat {
  /** il nostro sfrido su lastre e isolante, al posto del 5% Siniat */
  sfrido: { lastre: number; isolante: number };
  /** altezza utile della soluzione (minore fra fuoco e statica), per l'avviso */
  hmaxUtile?: number | null;
}

export function calcolaDistintaSiniat(sol: SoluzioneScelta, campiture: Campitura[], opz: OpzioniSiniat): DistintaSiniat | { errore: string } {
  const b = risolviSoluzione(sol);
  if (typeof b === 'string') return { errore: b };

  const avvisi: Avviso[] = [];
  const misure = campiture.map(misura);
  const lordaCm2 = misure.reduce((a, m) => a + m.lorda, 0);
  const nettaCm2 = misure.reduce((a, m) => a + netta(m), 0);
  const mqNetti = nettaCm2 / 10000;
  const muro = b.tipo === 'parete' || b.tipo === 'setto' || b.tipo === 'controparete';

  misure.forEach((m, i) => {
    if (m.l === undefined || m.h === undefined) return;
    const dove = misure.length > 1 ? `Campitura ${i + 1} — ` : '';
    if (muro && opz.hmaxUtile && m.h > Math.round(opz.hmaxUtile * 100)) {
      avvisi.push({ livello: 'attenzione', codice: 'ALTEZZA_OLTRE_HMAX', testo: `${dove}altezza ${metri(m.h)} m oltre l'altezza utile della soluzione (${String(opz.hmaxUtile).replace('.', ',')} m): scegliere un'orditura più robusta o un'altra soluzione.` });
    }
    if (muro && m.l > 1500) {
      avvisi.push({ livello: 'attenzione', codice: 'GIUNTO_DILATAZIONE', testo: `${dove}lunghezza ${metri(m.l)} m oltre i 15 m: prevedere giunti di dilatazione (UNI 11424).` });
    }
  });
  if (nettaCm2 <= 0) avvisi.push({ livello: 'attenzione', codice: 'MQ_NULLI', testo: 'Superficie netta nulla: inserire le misure.' });
  if (b.fonte === 'regola') {
    avvisi.push({ livello: 'info', codice: 'INCIDENZE_STIMATE', testo: 'Quantità ricavate con le regole delle schede Memento: non esiste una scheda con queste lastre. Da confermare.' });
  }

  let voci = b.voci;
  for (const x of sol.sostituzioni ?? []) {
    voci = voci.map((v) => (/^lastr/i.test(v.prodotto) && lastraDaTesto(v.prodotto) === x.da ? { ...v, prodotto: 'Lastre ' + x.a } : v));
    avvisi.push({
      livello: 'info',
      codice: 'LASTRA_SOSTITUITA',
      testo: x.fonte === 'guida'
        ? `Lastre ${x.a} al posto delle ${x.da}: ${x.motivo}, per usare le lastre a magazzino.`
        : `Lastre ${x.a} al posto delle ${x.da}. Nota della scheda Memento: «${x.motivo.replace(/\.$/, '')}».`,
    });
  }
  if (b.isolante !== undefined) {
    voci = voci.filter((v) => !/isolante|lana/i.test(v.prodotto));
    if (b.isolante && !b.isolante.opzionale) voci.push({ prodotto: nomeIsolante(b.isolante), unita: 'm²', valore: 1.05 * b.file });
  }

  const righe: RigaDistinta[] = [];
  const montantiPerPosizione = b.file * (b.accoppiati ? 2 : 1);
  if (nettaCm2 > 0) {
    for (const v of voci) {
      const art = articoloSiniat(v.prodotto, v.unita, b.montante);
      if (typeof v.valore !== 'number') {
        // guide perimetrali dei controsoffitti e banda sotto le guide: "secondo necessità" = perimetro della stanza
        if (b.tipo === 'controsoffitto' && (art.categoria === 'GUIDA' || art.categoria === 'BANDA') && misure.length && misure.every((m) => m.l !== undefined && m.h !== undefined)) {
          const ml = misure.reduce((a, m) => a + 2 * ((m.l ?? 0) + (m.h ?? 0)), 0) / 100;
          righe.push({ ruolo: art.categoria, chiave: art.chiave, descrizione: art.descrizione, um: art.um, incidenza: 0, quantita: Math.round(ml * 1000) / 1000,
            contenuto: art.contenuto, umConf: art.umConf, pezzi: arrotondaSu(ml / art.contenuto), sfridoPct: 0, metodo: 'geometrico', fonte: b.fonte,
            nota: 'perimetro delle campiture', ...(art.daVerificare ? { daVerificare: art.daVerificare } : {}) });
        } else if (v.valore) {
          avvisi.push({ livello: 'info', codice: 'VOCE_DA_CALCOLARE', testo: `${v.prodotto}: ${v.valore}.` });
        }
        continue;
      }
      if (v.valore === 0) continue;
      const sfridoPct = art.sfrido ? opz.sfrido[art.sfrido] : 0;
      let quantita: number, pezzi: number, metodo: RigaDistinta['metodo'] = 'incidenza';
      if (art.sfrido) {
        const nettoQ = (v.valore / (1 + SFRIDO_SINIAT / 100)) * mqNetti;
        quantita = (nettoQ * (100 + sfridoPct)) / 100;
        pezzi = pezziConSfrido(nettoQ, art.contenuto, sfridoPct);
      } else {
        quantita = v.valore * mqNetti;
        pezzi = arrotondaSu(quantita / art.contenuto);
      }
      if (muro && art.categoria === 'GUIDA') {
        const geo = guideGeometriche(misure, v.valore, b.file);
        if (geo) { quantita = geo.ml; pezzi = geo.barre; metodo = 'geometrico'; }
      }
      if (muro && art.categoria === 'MONTANTE' && b.interasse) {
        const geo = montantiGeometrici(misure, v.valore, +b.interasse / 10, montantiPerPosizione);
        if (geo && geo.barre > pezzi) { quantita = geo.ml; pezzi = geo.barre; metodo = 'geometrico'; }
      }
      const ordine = art.categoria === 'LASTRA' && !aMagazzino(lastraDaTesto(v.prodotto.split(/\s*\/\s*/)[0]!));
      righe.push({
        ruolo: art.categoria, chiave: art.chiave, descrizione: art.descrizione, um: art.um, incidenza: v.valore,
        quantita: Math.round(quantita * 1000) / 1000, contenuto: art.contenuto, umConf: art.umConf, pezzi, sfridoPct, metodo, fonte: b.fonte,
        ...(ordine ? { nota: testoOrdine() } : {}),
        ...(art.daVerificare ? { daVerificare: art.daVerificare } : {}),
      });
    }
    // tasselli delle guide a pavimento e soffitto: uno ogni 50 cm (il Memento non li conta)
    const guida = righe.find((r) => r.ruolo === 'GUIDA');
    if (muro && guida) {
      const q = Math.ceil(guida.quantita * 2);
      righe.push({ ruolo: 'TASSELLI', chiave: 'TASSELLI', descrizione: 'Tasselli per le guide', um: 'pz', incidenza: 2, quantita: q, contenuto: 100,
        umConf: 'conf.', pezzi: arrotondaSu(q / 100), sfridoPct: 0, metodo: guida.metodo, nota: 'uno ogni 50 cm di guida (manuale del posatore)' });
    }
  }

  return {
    titolo: b.titolo, codice: b.codice, fonteIncidenze: b.fonte, variante: b.variante,
    mqLordi: lordaCm2 / 10000, mqAperture: (lordaCm2 - nettaCm2) / 10000, mqNetti,
    righe, avvisi, hint: [],
    ...(b.classificazioni.length ? { dicitura: 'Sistema da verificare su certificato produttore: posa secondo il rapporto di classificazione.' } : {}),
    classificazioni: b.classificazioni,
  };
}
