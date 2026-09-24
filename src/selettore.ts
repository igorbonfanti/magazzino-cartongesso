/**
 * Selettore delle soluzioni Siniat — funzioni pure, nessuna dipendenza da Firebase.
 *
 * Dai requisiti (cosa si realizza, fuoco, Rw, altezza, ambiente…) alle
 * soluzioni compatibili del catalogo:
 *
 *   certificate = configurazioni della guida antincendio con una classe
 *                 >= richiesta e Hmax al fuoco >= altezza
 *   sistemi     = schede del Memento con una variante di orditura che regge
 *                 l'altezza (e la classe, se richiesta)
 *
 * Per le certificate la statica viene dalla scheda Memento con le stesse
 * lastre: la configurazione della guida è "minima", quindi valgono anche
 * montanti più grandi e interassi più fitti. L'altezza utile è la minore fra
 * quella al fuoco e quella statica.
 */
import {
  CATALOGO, classiConSostituzioni, configurazione, HMAX_PER_SPESSORE, lastreConfigurazione, misuraMontante, sistema as trovaSistema,
  sostituisciStratigrafia, sostituzioniMagazzino,
} from './data/siniat/catalogo';
import { lastraDaTesto } from './data/siniat/articoli';
import { aMagazzino } from './data/magazzino';
import type {
  Ambiente, Classificazione, ConfigurazioneFuoco, Disponibilita, FuocoVariante, InterasseSiniat, Opera, Requisiti, SceltaLastre,
  SistemaSiniat, Sostituzione, Stratigrafia, VarianteSistema,
} from './types';

export interface OperaInfo {
  id: Opera;
  nome: string;
  nota: string;
  /** sezioni della guida antincendio */
  sezioni: string[];
  /** gruppi delle schede Memento */
  gruppi: string[];
  /** l'altezza conta (pareti) o no (soffitti, solai) */
  altezza: boolean;
}

export const OPERE: OperaInfo[] = [
  { id: 'parete', nome: 'Parete divisoria', nota: 'tra locali o tra unità diverse', sezioni: ['pareti'], gruppi: ['Parete a singola orditura', 'Parete a doppia orditura', 'Parete curva', 'Parete per raggi X'], altezza: true },
  { id: 'controparete', nome: 'Controparete', nota: 'su un muro esistente, anche per portarlo a EI 120', sezioni: ['prot_non_portanti', 'prot_portanti'], gruppi: ['Controparete', 'Riqualifica al fuoco'], altezza: true },
  { id: 'cavedio', nome: 'Cavedio o setto', nota: 'lastre su un solo lato, vani tecnici', sezioni: ['cavedi'], gruppi: ['Setto / cavedio'], altezza: true },
  { id: 'controsoffitto', nome: 'Controsoffitto', nota: 'finitura, acustica, a membrana EI', sezioni: ['membrana'], gruppi: ['Controsoffitto'], altezza: false },
  { id: 'solaio', nome: 'Protezione di un solaio', nota: 'laterocemento, predalles, lamiera, CLT', sezioni: ['solai'], gruppi: ['Protezione solaio'], altezza: false },
  { id: 'esterno', nome: 'Parete esterna', nota: 'tamponamenti e contropareti esterne', sezioni: ['esterne'], gruppi: ['Parete esterna', 'Controparete esterna'], altezza: true },
];

export function operaInfo(o: Opera): OperaInfo {
  return OPERE.find((x) => x.id === o)!;
}

export interface VarianteScelta {
  sistemaId: string;
  varianteId: string;
  nome: string | null;
  montante: string | null;
  montanti: 'singolo' | 'accoppiato' | null;
  interasse: InterasseSiniat | null;
  /** altezza statica della variante all'interasse scelto, m */
  hmaxStatica: number | null;
}

export interface Candidato {
  tipo: 'certificata' | 'sistema';
  id: string;
  titolo: string;
  gruppo: string;
  /** la classe che soddisfa la richiesta (certificate): una di `classi` */
  classificazione?: Classificazione;
  /** certificate: le classi come valgono con le lastre in opera (con una lastra più spessa, fino a 4 m) */
  classi?: Classificazione[];
  /** la classe della variante scelta (schede Memento) */
  fuocoVariante?: FuocoVariante;
  /** orditura per statica e incidenze; null se non determinabile dai dati */
  variante: VarianteScelta | null;
  /** esiste una variante Memento che regge l'altezza richiesta */
  staticaVerificata: boolean;
  /** altezza utile: minore fra fuoco e statica, m */
  hmaxUtile: number | null;
  rw: number | null;
  /** numero di lastre, per ordinare dalla più leggera */
  lastre: number;
  /** fascia di prezzo Siniat (pallini pieni) */
  prezzo: number | null;
  /** la distinta automatica è disponibile */
  distinta: boolean;
  /** schede Memento: le configurazioni certificate con le stesse lastre */
  certificate?: string[];
  /**
   * lastre sostituite: per l'ambiente (nota della scheda Memento) o per il
   * magazzino (la stessa lastra più spessa, o la sostituzione della guida)
   */
  sostituzioni?: Sostituzione[];
  /** tutte le lastre a magazzino (dopo le sostituzioni); null se le lastre non si ricavano dai dati */
  aMagazzino: boolean | null;
  /** le lastre da ordinare */
  daOrdinare: string[];
  avvisi: string[];
}

const INTERASSI: InterasseSiniat[] = ['600', '400', '300'];

function contaLastre(c: { lato1: { n: number }[]; lato2: { n: number }[]; intermedia: { n: number }[] } | null): number {
  if (!c) return 99;
  return [...c.lato1, ...c.lato2, ...c.intermedia].reduce((a, s) => a + s.n, 0);
}

/** Le classi della variante che soddisfano la richiesta all'altezza data. */
function fuocoOk(v: VarianteSistema, minuti: number, altezza: number, conAltezza: boolean): FuocoVariante | null {
  const ok = v.fuoco
    .filter((f) => f.minuti >= minuti && (!conAltezza || !altezza || f.hmax == null || f.hmax >= altezza))
    .sort((a, b) => a.minuti - b.minuti || (a.esposizione === 'lato lastre' ? 1 : -1));
  return ok[0] ?? null;
}

export interface OpzioniOrditura {
  /** montante minimo (quello della configurazione certificata) */
  montanteMin?: string | null;
  /** interasse massimo in mm (quello della configurazione certificata) */
  interasseMax?: number;
  /** classe al fuoco richiesta alla variante (schede Memento) */
  fuocoMinuti?: number;
  /** Rw minimo della variante (schede Memento) */
  rw?: number;
}

export interface Orditura {
  v: VarianteSistema;
  interasse: InterasseSiniat;
  hmax: number;
  fuoco: FuocoVariante | null;
}

/**
 * Le orditure della scheda che reggono l'altezza, dalla più economica: prima
 * montanti singoli, poi interasse più largo, poi montante più piccolo.
 */
export function orditure(s: SistemaSiniat, altezza: number, opz: OpzioniOrditura = {}): Orditura[] {
  const minMont = misuraMontante(opz.montanteMin);
  const prove: (Orditura & { ordine: number[] })[] = [];
  for (const v of s.varianti) {
    if (!v.hmax) continue;
    const mis = misuraMontante(v.montante);
    if (minMont != null && (mis == null || mis < minMont)) continue;
    if (opz.rw && (v.rw ?? 0) < opz.rw) continue;
    for (const i of INTERASSI) {
      const h = v.hmax[i];
      if (typeof h !== 'number') continue;
      if (opz.interasseMax && +i > opz.interasseMax) continue;
      if (altezza && h < altezza) continue;
      const fuoco = opz.fuocoMinuti ? fuocoOk(v, opz.fuocoMinuti, altezza, true) : null;
      if (opz.fuocoMinuti && !fuoco) continue;
      prove.push({ v, interasse: i, hmax: h, fuoco, ordine: [v.montanti === 'accoppiato' ? 1 : 0, -+i, mis ?? 0, v.spessore ?? 0] });
    }
  }
  prove.sort((a, b) => {
    for (let k = 0; k < a.ordine.length; k++) if (a.ordine[k] !== b.ordine[k]) return a.ordine[k]! - b.ordine[k]!;
    return 0;
  });
  return prove.map(({ v, interasse, hmax, fuoco }) => ({ v, interasse, hmax, fuoco }));
}

/** La variante di orditura più economica che regge l'altezza. */
export function varianteMigliore(s: SistemaSiniat, altezza: number, opz: OpzioniOrditura = {}): Orditura | null {
  return orditure(s, altezza, opz)[0] ?? null;
}

/** "C75 a 600 mm", "C100 accoppiati a 400 mm" */
export function nomeOrditura(o: { montante: string | null; montanti: string | null; interasse: InterasseSiniat | null }): string {
  return `${o.montante ?? 'orditura'}${o.montanti === 'accoppiato' ? ' accoppiati' : ''}${o.interasse ? ` a ${o.interasse} mm` : ''}`;
}

/** Il minore dei limiti noti, null se non ce n'è nessuno. */
function minimo(...x: (number | null | undefined)[]): number | null {
  const noti = x.filter((y): y is number => y != null);
  return noti.length ? Math.min(...noti) : null;
}

/** La configurazione certificata è quella minima: montanti più grandi o interassi più fitti si dicono. */
function avvisoOrditura(st: Stratigrafia, o: { v: VarianteSistema; interasse: InterasseSiniat }): string | null {
  const piuGrande = (misuraMontante(o.v.montante) ?? 0) > (misuraMontante(st.montante) ?? 0);
  const piuFitto = st.interasse != null && +o.interasse < st.interasse;
  if (!piuGrande && !piuFitto && o.v.montanti !== 'accoppiato') return null;
  const nome = nomeOrditura({ montante: o.v.montante ?? null, montanti: o.v.montanti ?? null, interasse: o.interasse });
  return `Orditura ${nome}: più robusta di quella certificata (${st.montante}, int. ${st.interasse} mm), che è la minima ammessa.`;
}

function scelta(s: SistemaSiniat, r: { v: VarianteSistema; interasse: InterasseSiniat | null; hmax: number | null }): VarianteScelta {
  return {
    sistemaId: s.id, varianteId: r.v.id, nome: r.v.nome, montante: r.v.montante ?? null, montanti: r.v.montanti ?? null,
    interasse: r.interasse, hmaxStatica: r.hmax,
  };
}

/** Le lastre a vista: la più esterna di ogni lato; senza stratigrafia, tutte quelle elencate. */
function lastreVista(st: Stratigrafia | null, lastre: string[]): string {
  return (st ? [st.lato1[0]?.lastra, st.lato2[st.lato2.length - 1]?.lastra].join(' ') : lastre.join(' ')).toLowerCase();
}

// ---------------------------------------------------------------- certificate

/**
 * Lastre di tipo H (EN 520 H1/H2, EN 15283-1 GM-H1) per gli ambienti umidi
 * interni; per l'umidità altissima il sistema aquaboard (studio, regole R01-R02).
 */
const LASTRE_H = /pregydro|ladura|solidtex|aquaboard/;

function adattaAmbiente(c: ConfigurazioneFuoco, ambiente: Ambiente, sostituzioni: Sostituzione[]): boolean {
  if (ambiente === 'normale') return true;
  const st = c.stratigrafia ? sostituisciStratigrafia(c.stratigrafia, sostituzioni) : null;
  const lastre = lastreConfigurazione(c).map((l) => sostituzioni.find((x) => x.da === l)?.a ?? l);
  const vista = lastreVista(st, lastre);
  if (ambiente === 'umido') return LASTRE_H.test(vista);
  if (ambiente === 'bagnato') return /aquaboard/.test(vista);
  return c.sezione === 'esterne' || /aquaboard|outdoor/.test(vista);
}

/** Le lastre non a magazzino fra quelle date. */
function mancanti(lastre: string[]): string[] {
  return [...new Set(lastre)].filter((l) => !aMagazzino(l));
}

/** Le stesse sostituzioni (da → a), in qualunque ordine. */
function stesseSostituzioni(a: readonly Sostituzione[], b: readonly Sostituzione[]): boolean {
  const k = (x: readonly Sostituzione[]) => x.map((s) => `${s.da}→${s.a}`).sort().join('|');
  return k(a) === k(b);
}

/**
 * La configurazione certificata come candidato, con le lastre a magazzino se
 * si può: prima la scelta (di partenza la stessa lastra più spessa), poi
 * l'altra strada, infine le lastre della prova, da ordinare. Vale la prima che
 * soddisfa i requisiti: con le pregyflam BA15 al posto delle BA13 si arriva a
 * 4 m e non ci sono lastre H a vista, quindi oltre i 4 m o in ambiente umido
 * restano le solidtex della guida.
 */
function candidatoCertificato(c: ConfigurazioneFuoco, req: Requisiti, op: OperaInfo, scelta: SceltaLastre = 'spessore'): Candidato | null {
  const prove: Sostituzione[][] = [];
  for (const s of [scelta, scelta === 'spessore' ? 'guida' : 'spessore'] as const) {
    const x = sostituzioniMagazzino(c, s);
    if (x && !prove.some((p) => stesseSostituzioni(p, x))) prove.push(x);
  }
  if (!prove.some((p) => p.length === 0)) prove.push([]);
  const oltre = op.altezza && req.altezza > HMAX_PER_SPESSORE;
  for (const s of prove) {
    if (oltre && s.some((x) => x.fonte === 'spessore')) continue;
    const x = valutaCertificato(c, req, op, s);
    if (x) return x;
  }
  return null;
}

/**
 * Le due proposte di lastre a magazzino per una configurazione certificata,
 * per la scelta nella scheda: la stessa lastra più spessa (di partenza) e la
 * sostituzione della guida. null se non c'è da scegliere: una sola possibile
 * per i requisiti, oppure uguali.
 */
export function alternativeLastre(c: Candidato, req: Requisiti): Record<SceltaLastre, Candidato> | null {
  const conf = c.tipo === 'certificata' ? configurazione(c.id) : undefined;
  if (!conf) return null;
  const op = operaInfo(req.opera);
  const spessore = candidatoCertificato(conf, req, op, 'spessore');
  const guida = candidatoCertificato(conf, req, op, 'guida');
  if (!spessore || !guida || stesseSostituzioni(spessore.sostituzioni ?? [], guida.sostituzioni ?? [])) return null;
  return { spessore, guida };
}

function valutaCertificato(c: ConfigurazioneFuoco, req: Requisiti, op: OperaInfo, sostituzioni: Sostituzione[]): Candidato | null {
  if (!adattaAmbiente(c, req.ambiente, sostituzioni)) return null;
  const classi = classiConSostituzioni(c, sostituzioni);
  let classe: Classificazione | undefined;
  if (req.fuoco) {
    const ok = classi
      .filter((k) => k.minuti >= req.fuoco && k.tipo !== 'E')
      .filter((k) => !op.altezza || !req.altezza || k.hmax == null || k.hmaxOltre || k.hmax >= req.altezza)
      .sort((a, b) => a.minuti - b.minuti || (b.hmax ?? 99) - (a.hmax ?? 99));
    if (!ok.length) return null;
    classe = ok[0];
  } else {
    classe = [...classi].sort((a, b) => b.minuti - a.minuti)[0];
  }
  if (req.rw && (c.rw == null || c.rw < req.rw)) return null;

  const avvisi: string[] = [];
  let variante: VarianteScelta | null = null;
  let staticaVerificata = false;
  const st = c.stratigrafia;
  const m = c.sistemaMemento ? trovaSistema(c.sistemaMemento) : undefined;
  if (m && c.varianteMemento) {
    // variante fissa (controsoffitti a membrana): orditura e pendinatura sono quelle certificate
    const v = m.varianti.find((x) => x.id === c.varianteMemento);
    if (v) { variante = scelta(m, { v, interasse: null, hmax: null }); staticaVerificata = true; }
  } else if (op.altezza && m && st) {
    const r = varianteMigliore(m, req.altezza, { montanteMin: st.montante, interasseMax: st.interasse });
    if (r) {
      variante = scelta(m, r);
      staticaVerificata = true;
      const a = avvisoOrditura(st, r);
      if (a) avvisi.push(a);
    } else {
      avvisi.push(`Nessuna orditura della scheda Memento con queste lastre regge ${String(req.altezza).replace('.', ',')} m: serve una verifica statica.`);
    }
  } else if (op.altezza && st) {
    avvisi.push('La scheda Memento con queste lastre non c\'è: l\'orditura va verificata staticamente (NTC 2018).');
  } else if (op.altezza && !c.promat) {
    avvisi.push('Orditura e statica secondo il rapporto di classificazione: da verificare.');
  }
  if (c.promat) avvisi.push('Sistema Promat (gruppo Etex): certificato e posa secondo la documentazione Promat.');
  for (const x of sostituzioni) {
    avvisi.push(
      x.fonte === 'spessore'
        ? `Con le lastre a magazzino: ${x.a} al posto delle ${x.da}, più spesse di quelle provate: variante nel campo di applicazione diretta del rapporto di classificazione (UNI EN 1364-1, art. 13), fino a ${HMAX_PER_SPESSORE} m. Da verificare sul rapporto.`
        : `Con le lastre a magazzino: ${x.a} al posto delle ${x.da}, sostituzione ammessa dalla guida antincendio per questa configurazione.`,
    );
  }
  if (sostituzioni.length && c.rw != null) avvisi.push('Rw misurato con le lastre della prova.');
  const lastre = lastreConfigurazione(c).map((l) => sostituzioni.find((x) => x.da === l)?.a ?? l);
  // "> 4,00 m": oltre quel valore vale il Fascicolo Tecnico, quindi non limita l'altezza
  const fuocoH = classe?.hmaxOltre ? null : (classe?.hmax ?? null);
  return {
    tipo: 'certificata', id: c.id, titolo: c.codice, gruppo: c.gruppo, classificazione: classe, classi, variante, staticaVerificata,
    hmaxUtile: minimo(fuocoH, variante?.hmaxStatica), rw: c.rw ?? null, lastre: contaLastre(st), prezzo: null,
    distinta: (!!variante && !!m?.incidenze && !!c.varianteMemento) ||
      (!!st && !c.promat && (st.tipo === 'parete' || st.tipo === 'setto') && c.sezione !== 'esterne' && !/curva/i.test(c.codice)),
    ...(sostituzioni.length ? { sostituzioni } : {}),
    aMagazzino: lastre.length ? mancanti(lastre).length === 0 : null,
    daOrdinare: mancanti(lastre),
    avvisi,
  };
}

// ---------------------------------------------------------------- schede Memento

function candidatoSistema(s: SistemaSiniat, req: Requisiti, op: OperaInfo): Candidato | null {
  const vista = lastreVista(s.stratigrafia, s.lastre);
  const sostituzioni: Sostituzione[] = [];
  if (req.ambiente === 'umido' && !LASTRE_H.test(vista)) {
    // "Per applicazione in ambienti umidi prevedere lastre pregydro H2 BA13"
    const nota = s.noteConfigurazione.find((n) => /ambienti umidi prevedere lastre/i.test(n));
    const lastra = nota && /prevedere lastre\s+(.+?)\.?$/i.exec(nota)?.[1];
    if (!nota || !lastra) return null;
    const lastre = s.stratigrafia
      ? [...s.stratigrafia.lato1, ...s.stratigrafia.lato2, ...s.stratigrafia.intermedia].map((x) => x.lastra)
      : s.lastre.map(lastraDaTesto);
    // la nota sostituisce la lastra standard dello stesso formato: non le flessibili o le speciali
    for (const da of new Set(lastre.filter((l) => /^pregyplac BA13$/.test(l)))) {
      sostituzioni.push({ da, a: lastraDaTesto(lastra), fonte: 'memento', motivo: nota });
    }
    if (!sostituzioni.length) return null;
  }
  if (req.ambiente === 'bagnato' && !/aquaboard/.test(vista)) return null;
  if (req.ambiente === 'esterno' && !/esterna/i.test(s.gruppo) && !(op.id === 'controsoffitto' && /aquaboard/.test(vista))) return null;
  // pallini del Memento, su 4 o su 5: "resistente" da tre quarti della scala in su
  const alto = (v: [number, number] | null) => !!v && v[0] / v[1] >= 0.75;
  if (req.urti && !alto(s.valutazioni.urti)) return null;
  if (req.carichi && !alto(s.valutazioni.carico)) return null;
  if (req.antieffrazione && !s.antieffrazione && !s.varianti.some((v) => v.antieffrazione)) return null;

  let variante: VarianteScelta | null = null;
  let fuoco: FuocoVariante | null = null;
  let staticaVerificata = false;
  const conHmax = s.varianti.some((v) => v.hmax);

  if (op.altezza && conHmax) {
    // l'Rw cresce con lo spessore: se serve si passa a una variante più spessa
    const r = varianteMigliore(s, req.altezza, { fuocoMinuti: req.fuoco || undefined, rw: req.rw || undefined });
    if (!r) return null;
    variante = scelta(s, r);
    fuoco = r.fuoco;
    staticaVerificata = true;
  } else {
    // soffitti, contropareti, esterni: la prima variante che soddisfa fuoco, Rw e altezza unica
    const ok = s.varianti.filter((v) =>
      (!req.fuoco || fuocoOk(v, req.fuoco, req.altezza, op.altezza)) &&
      (!req.rw || (v.rw ?? 0) >= req.rw) &&
      (!op.altezza || !req.altezza || v.hmaxUnica == null || v.hmaxUnica >= req.altezza));
    if (!ok.length) return null;
    const v = ok[0]!;
    fuoco = req.fuoco ? fuocoOk(v, req.fuoco, req.altezza, op.altezza) : null;
    variante = scelta(s, { v, interasse: v.colonne['600'] ? '600' : null, hmax: v.hmaxUnica ?? null });
    staticaVerificata = v.hmaxUnica != null;
  }
  if (req.fuoco && !fuoco) return null;

  const v = s.varianti.find((x) => x.id === variante?.varianteId);
  const col = v ? (variante?.interasse ? v.colonne[variante.interasse] : v.colonne.unica) : undefined;
  const rw = v?.rw ?? null;
  const hmaxUtile = minimo(fuoco?.hmax, variante?.hmaxStatica);
  const avvisi: string[] = [];
  if (s.gruppo === 'Controparete' && rw) avvisi.push(`Rw del sistema con muro di riferimento da ${v?.rwSupporto ?? 46} dB.`);
  if (req.fuoco && fuoco) avvisi.push('Classe dichiarata dal Memento: per il preventivo vale la configurazione certificata della guida antincendio 2026.');
  for (const x of sostituzioni) {
    avvisi.push(`Ambiente umido: lastre ${x.a} al posto delle ${x.da}, come prevede la scheda.`);
    if (req.fuoco) avvisi.push('La classe al fuoco è provata con le lastre della scheda: con la sostituzione vale solo un certificato che la preveda.');
  }
  // il Memento non ammette sostituzioni oltre alle sue note: si ordina quello che manca
  const tutte = s.stratigrafia
    ? [...s.stratigrafia.lato1, ...s.stratigrafia.lato2, ...s.stratigrafia.intermedia].map((x) => x.lastra)
    : s.lastre.map(lastraDaTesto);
  const lastre = tutte.map((l) => sostituzioni.find((x) => x.da === l)?.a ?? l);
  return {
    tipo: 'sistema', id: s.id, titolo: s.titolo, gruppo: s.gruppo, fuocoVariante: fuoco ?? undefined, variante, staticaVerificata,
    hmaxUtile, rw, lastre: contaLastre(s.stratigrafia),
    prezzo: s.valutazioni.prezzo?.[0] ?? null, distinta: !!(s.incidenze && col),
    certificate: CATALOGO.configurazioni.filter((c) => c.sistemaMemento === s.id).map((c) => c.id),
    ...(sostituzioni.length ? { sostituzioni } : {}),
    aMagazzino: lastre.length ? mancanti(lastre).length === 0 : null,
    daOrdinare: mancanti(lastre),
    avvisi,
  };
}

/** Prima le soluzioni tutte a magazzino, poi quelle da ordinare, in fondo quelle senza lastre note. */
function ordineMagazzino(c: Candidato): number {
  return c.aMagazzino === true ? 0 : c.aMagazzino === false ? 1 : 2;
}

/** Le soluzioni compatibili con i requisiti, già ordinate. */
export function selezionaSoluzioni(req: Requisiti): { certificate: Candidato[]; sistemi: Candidato[] } {
  const op = operaInfo(req.opera);
  const certificate = CATALOGO.configurazioni
    .filter((c) => op.sezioni.includes(c.sezione))
    .map((c) => candidatoCertificato(c, req, op))
    .filter((x): x is Candidato => !!x)
    // prima quelle a magazzino, poi con la distinta, poi le più leggere, poi con la statica verificata
    .sort((a, b) =>
      ordineMagazzino(a) - ordineMagazzino(b) || +b.distinta - +a.distinta || a.lastre - b.lastre ||
      +b.staticaVerificata - +a.staticaVerificata || (b.rw ?? 0) - (a.rw ?? 0));
  const sistemi = CATALOGO.sistemi
    .filter((s) => op.gruppi.includes(s.gruppo))
    .map((s) => candidatoSistema(s, req, op))
    .filter((x): x is Candidato => !!x)
    .sort((a, b) => ordineMagazzino(a) - ordineMagazzino(b) || (a.prezzo ?? 9) - (b.prezzo ?? 9) || (b.rw ?? 0) - (a.rw ?? 0));
  return { certificate, sistemi };
}

/**
 * Le orditure fra cui l'operatore può scegliere per la soluzione, dalla più
 * economica; vuoto se l'orditura è fissa (membrane) o non si ricava dai dati.
 */
export function orditurePossibili(tipo: 'certificata' | 'sistema', id: string, req: Requisiti): Orditura[] {
  const op = operaInfo(req.opera);
  if (!op.altezza) return [];
  if (tipo === 'certificata') {
    const c = CATALOGO.configurazioni.find((x) => x.id === id);
    const m = c?.sistemaMemento ? trovaSistema(c.sistemaMemento) : undefined;
    const st = c?.stratigrafia;
    if (!c || !m || !st || c.varianteMemento) return [];
    return orditure(m, req.altezza, { montanteMin: st.montante, interasseMax: st.interasse });
  }
  const s = trovaSistema(id);
  if (!s || !s.varianti.some((v) => v.hmax)) return [];
  return orditure(s, req.altezza, { fuocoMinuti: req.fuoco || undefined, rw: req.rw || undefined });
}

/**
 * Il candidato con un'altra orditura scelta dall'operatore fra quelle
 * possibili: cambiano altezza utile, avviso sull'orditura e, per le schede
 * Memento, Rw e classe della variante.
 */
export function conOrditura(c: Candidato, o: Orditura): Candidato {
  const st = c.tipo === 'certificata' ? CATALOGO.configurazioni.find((x) => x.id === c.id)?.stratigrafia : null;
  const variante: VarianteScelta = {
    sistemaId: o.v.id.split('#')[0]!, varianteId: o.v.id, nome: o.v.nome, montante: o.v.montante ?? null,
    montanti: o.v.montanti ?? null, interasse: o.interasse, hmaxStatica: o.hmax,
  };
  const avvisi = c.avvisi.filter((a) => !/^Orditura .+: più robusta/.test(a));
  const nuovo = st ? avvisoOrditura(st, o) : null;
  if (nuovo) avvisi.unshift(nuovo);
  if (c.tipo === 'certificata') {
    const k = c.classificazione;
    return { ...c, variante, hmaxUtile: minimo(k?.hmaxOltre ? null : k?.hmax, o.hmax), avvisi };
  }
  const fuocoVariante = o.fuoco ?? c.fuocoVariante;
  return { ...c, variante, fuocoVariante, rw: o.v.rw ?? null, hmaxUtile: minimo(o.fuoco?.hmax, o.hmax), avvisi };
}

/**
 * Le soluzioni da proporre secondo la disponibilità: "magazzino" quelle con
 * tutte le lastre a scaffale (sostituzioni comprese), "ordine" le altre,
 * lastre non note comprese.
 */
export function perDisponibilita(candidati: Candidato[], d: Disponibilita): Candidato[] {
  if (d === 'tutte') return candidati;
  return candidati.filter((c) => (c.aMagazzino === true) === (d === 'magazzino'));
}
