/**
 * La scheda tecnica del preventivo: com'è fatta la soluzione, con quali classi
 * e rapporti, l'Rw, le varianti e la dicitura. È una fotografia presa quando
 * nasce il preventivo: quello salvato non cambia se poi cambia il catalogo.
 *
 * Le prestazioni sono quelle dichiarate dal produttore, riportate con il
 * riferimento: il preventivo non le certifica.
 */
import { configurazione, sistema } from './data/siniat/catalogo';
import { PRESTAZIONI } from './data/sistemi';
import { nomeOrditura } from './selettore';
import type { Candidato } from './selettore';
import type { DistintaSiniat } from './engine-siniat';
import type { Avviso, Distinta } from './engine';
import type { Riferimento, Scelte } from './types';

export interface ClasseScheda {
  classe: string;
  /** "altezza fino a 4 m", "luce fino a 3 m" */
  limite: string;
  nota?: string;
  /** nota: il rapporto è su una configurazione affine, estesa dal fascicolo tecnico o dall'EXAP */
  rapporti: { testo: string; url?: string; nota?: string }[];
  /** la classe che soddisfa i requisiti */
  richiesta?: boolean;
}

export interface SchedaTecnica {
  titolo: string;
  riferimento: string;
  /** com'è fatta, come la scrive il produttore */
  strati: string[];
  /** lastre in opera diverse da quelle provate: "pregyflam BA15 al posto delle pregyflam BA13" */
  inOpera: string[];
  orditura: string | null;
  altezzaUtile: number | null;
  classi: ClasseScheda[];
  rw: number | null;
  rwNota: string | null;
  /** superficie netta della distinta, m² */
  mq: number;
  avvisi: string[];
  dicitura: string | null;
}

/** Gli avvisi della distinta che servono al cliente; gli altri (quantità stimate, voci da calcolare) sono per il banco. */
const AVVISI_PER_IL_CLIENTE = new Set<Avviso['codice']>([
  'ALTEZZA_OLTRE_HMAX', 'GIUNTO_DILATAZIONE', 'LASTRA_SOSTITUITA', 'STATICA_DA_VERIFICARE', 'ALTEZZA_75_I60', 'LANA_OBBLIGATORIA',
]);

const metri = (x: number) => String(x).replace('.', ',');

/**
 * "prova su D125/M75 2+2 pregyflam BA13, estesa dal fascicolo tecnico SI-017/06/2022":
 * il rapporto linkato è di una parete affine, e la classe vale con gli altri
 * riferimenti della stessa riga. null se il rapporto è sulla configurazione proposta.
 */
export function notaProvata(r: Riferimento, riga: readonly Riferimento[]): string | null {
  if (!r.provata) return null;
  const da = riga
    .filter((x) => x !== r)
    .map((x) =>
      x.testo.startsWith('FT ') ? `dal fascicolo tecnico ${x.testo.slice(3)}`
        : x.testo.startsWith('Est. ') ? `dall'estensione ${x.testo.slice(5)}`
          : /^Rapporto EXAP/i.test(x.testo) ? `dal rapporto ${x.testo.slice(9)}`
            : `da ${x.testo}`,
    );
  return `prova su ${r.provata}${da.length ? `, estesa ${da.join(' e ')}` : ''}`;
}

/** La scheda di una soluzione Siniat, dal candidato scelto (orditura e lastre comprese) e dalla sua distinta. */
export function schedaSiniat(c: Candidato, d: DistintaSiniat): SchedaTecnica {
  const conf = c.tipo === 'certificata' ? configurazione(c.id) : undefined;
  const sis = c.tipo === 'sistema' ? sistema(c.id) : undefined;
  const classi: ClasseScheda[] = conf
    ? (c.classi ?? conf.classificazioni).map((k) => ({
        classe: `${k.tipo} ${k.minuti}${k.direzione ? ` ${k.direzione}` : ''}`,
        limite: k.hmax != null ? `altezza ${k.hmaxOltre ? 'oltre' : 'fino a'} ${metri(k.hmax)} m` : k.luce != null ? `luce fino a ${metri(k.luce)} m` : '',
        ...(k.hmaxNota ? { nota: k.hmaxNota } : {}),
        rapporti: k.riferimenti.map((r) => {
          const nota = notaProvata(r, k.riferimenti);
          return { testo: r.testo, ...(r.url ? { url: r.url } : {}), ...(nota ? { nota } : {}) };
        }),
        ...(k === c.classificazione ? { richiesta: true } : {}),
      }))
    : sis?.fuocoTesto
      ? [{
          classe: sis.fuocoTesto,
          limite: 'dichiarata dal Memento Siniat',
          rapporti: (c.certificate ?? []).map((id) => ({ testo: `${id} ${configurazione(id)?.codice ?? ''}`.trim() })),
        }]
      : [];
  const sost = c.sostituzioni ?? [];
  return {
    titolo: c.titolo,
    riferimento: conf
      ? `${conf.id} · ${conf.sezioneNome} · prova ${conf.normaProva} · guida antincendio Siniat, luglio 2026, p. ${conf.pagine.join(', ')}`
      : `${sis?.codice ?? c.id} · Memento Siniat 2024, p. ${sis?.pagina ?? '?'}`,
    strati: conf?.strati ?? sis?.configurazione ?? [],
    inOpera: sost.map((x) => `${x.a} al posto delle ${x.da}`),
    orditura: c.variante?.montante ? nomeOrditura(c.variante) : conf?.stratigrafia?.montante ?? null,
    altezzaUtile: c.hmaxUtile,
    classi,
    rw: c.rw,
    rwNota: c.rw == null
      ? null
      : `valore di laboratorio del produttore${conf && sost.length ? ', misurato con le lastre della prova' : ''}; in opera si perdono 6–8 dB`,
    mq: d.mqNetti,
    avvisi: [
      // le sostituzioni sono già in "in opera" e negli avvisi della distinta
      ...c.avvisi.filter((a) => !/^Con le lastre a magazzino|^Rw misurato|^Ambiente umido: lastre/.test(a)),
      ...d.avvisi
        .filter((a) => AVVISI_PER_IL_CLIENTE.has(a.codice))
        // la variante per spessore la dice già la dicitura
        .filter((a) => !(a.codice === 'LASTRA_SOSTITUITA' && /aumento dello spessore/.test(a.testo) && /aumento dello spessore/.test(d.dicitura ?? '')))
        .map((a) => a.testo),
    ],
    dicitura: d.dicitura
      ?? (sis?.fuocoTesto ? 'Classe dichiarata dal Memento Siniat: da verificare sul rapporto di classificazione della configurazione certificata.' : null),
  };
}

/** La scheda del calcolo classico (Excel storico o manuale Fassa): niente classi, la dicitura se antincendio. */
export function schedaClassico(d: Distinta, s: Scelte): SchedaTecnica {
  const prestazione = PRESTAZIONI[s.prestazione];
  return {
    titolo: `${d.sistema.nome}${s.prestazione !== 'standard' ? ` · ${prestazione.nome}` : ''}`,
    riferimento: `Calcolo classico, incidenze ${s.modalita === 'manuale' ? 'del manuale Fassa' : "dell'Excel storico"}`,
    strati: d.righe.filter((r) => ['LASTRA', 'GUIDA', 'MONTANTE', 'ISOLANTE'].includes(r.ruolo)).map((r) => r.descrizione),
    inOpera: [],
    orditura: `interasse ${s.interasse} cm`,
    altezzaUtile: null,
    classi: [],
    rw: null,
    rwNota: null,
    mq: d.mqNetti,
    avvisi: [...d.avvisi.filter((a) => AVVISI_PER_IL_CLIENTE.has(a.codice)).map((a) => a.testo), ...d.hint],
    dicitura: d.dicitura ?? null,
  };
}
