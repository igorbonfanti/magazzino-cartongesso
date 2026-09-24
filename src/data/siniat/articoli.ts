/**
 * Dalle voci delle distinte Siniat ("Viti SNT 35 mm", "Guide pregymetal"…)
 * agli articoli generici dell'app: chiave per cgp_mapping, unità, confezione.
 *
 * Le confezioni sono NOSTRE, non di Siniat: dove non le conosciamo ancora
 * l'articolo è marcato daVerificare e i pezzi coincidono con la quantità.
 * Si sistemano con la mappatura del listino (Fase 3).
 */
import type { Um } from '../../types';

export type CategoriaVoce =
  | 'LASTRA' | 'GUIDA' | 'MONTANTE' | 'PROFILO' | 'VITI' | 'TASSELLI' | 'BANDA'
  | 'STUCCO' | 'NASTRO' | 'ISOLANTE' | 'ACCESSORIO' | 'RASATURA';

export interface ArticoloSiniat {
  categoria: CategoriaVoce;
  /** chiave dell'articolo generico per cgp_mapping */
  chiave: string;
  descrizione: string;
  um: Um;
  contenuto: number;
  umConf: string;
  sfrido?: 'lastre' | 'isolante';
  daVerificare?: string;
}

function slug(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function um(u: string): Um {
  const x = u.toLowerCase();
  if (x.startsWith('m²') || x.startsWith('m2') || x === 'mq') return 'mq';
  if (x.startsWith('kg')) return 'kg';
  if (x.startsWith('m')) return 'ml';
  return 'pz';
}

/**
 * Nome canonico di una lastra citata in una voce ("Lastre PregyPlac BA13" →
 * "pregyplac BA13"). Stesse regole di lastra_canonica nello script del
 * catalogo; un nome che non si riconosce resta com'è, non diventa una BA13.
 */
export function lastraDaTesto(t: string): string {
  const l = t.toLowerCase().replace(/[®™]/g, '');
  const a1 = /(?<![a-z0-9])a1(?![0-9])/.test(l);
  const pm = /(\d+)\s*mm\s*promatect/.exec(l);
  if (pm) return 'PROMATECT-100X ' + pm[1];
  if (/promatect/.test(l)) return 'PROMATECT-100X 12';
  if (/outdoor xt/.test(l)) return 'solidtex outdoor XT';
  if (/solidtex|s-tex/.test(l)) return 'solidtex indoor';
  if (/aquaboard/.test(l)) return /\bpro\b/.test(l) ? 'aquaboard pro' : 'aquaboard';
  if (/ladura/.test(l)) return 'ladura plus BA13';
  if (/easy pro/.test(l)) return 'easy pro 13';
  if (/easy/.test(l)) return 'easy 13';
  if (/pregyflex|ba6/.test(l)) return 'pregyflex BA6';
  if (/soundboard/.test(l)) return 'pregysoundboard BA13';
  if (/creason|createx/.test(l)) return 'creason/createx';
  if (/vapor/.test(l)) return 'pregyvapor BA13';
  if (/pregydro/.test(l)) return 'pregydro H2 BA13';
  if (/pregy-?rx/.test(l)) return 'pregy-RX';
  if (/flam/.test(l)) {
    const ba15 = /ba\s*15|flam\s*15/.test(l);
    return a1 ? (ba15 ? 'pregyflam A1 BA15' : 'pregyflam A1 BA13') : ba15 ? 'pregyflam BA15' : 'pregyflam BA13';
  }
  if (/pregyplac|^(lastr[ae]\s+)?ps\b/.test(l)) {
    if (/plus/.test(l)) return 'pregyplac plus BA13';
    if (/ba18/.test(l)) return 'pregyplac BA18';
    if (/ba10/.test(l)) return 'pregyplac BA10';
    return a1 ? 'pregyplac A1 BA13' : 'pregyplac BA13';
  }
  return t.replace(/^lastr[ae]\s+/i, '').trim();
}

const CHIAVI_LASTRE: Record<string, string> = {
  // stessa chiave della lastra standard del flusso generico: in magazzino è CAR13
  'pregyplac BA13': 'LASTRA_BA13_STD',
};

/**
 * L'articolo per una voce di distinta Siniat.
 * `montante` serve a guide e montanti (C75 → GUIDA_75, come nel flusso generico).
 */
export function articoloSiniat(prodotto: string, unita: string, montante?: string | null): ArticoloSiniat {
  const p = prodotto.trim();
  const l = p.toLowerCase();
  const m = /^C(\d+)/.exec(montante ?? '')?.[1];
  const profiloS = /^S\d{4}/.test(montante ?? '') ? montante! : null;
  // "S4915/27" → "S4915_27": le chiavi diventano id di documenti in cgp_mapping
  const chiaveS = profiloS ? slug(profiloS) : null;

  if (/^lastr/.test(l)) {
    // "Lastra ladura plus /solidtex indoor": lastre a scelta, in distinta la prima
    const [prima, ...altre] = /creason|createx/.test(l) ? [p] : p.split(/\s*\/\s*/);
    const nome = lastraDaTesto(prima!);
    const verifiche = [
      ...(nome === 'pregyplac BA13' ? [] : ['formato lastra (1200 × 2000 mm = 2,4 m²)']),
      ...(altre.length ? [`in alternativa ${altre.map(lastraDaTesto).join(', ')}`] : []),
    ];
    return {
      categoria: 'LASTRA',
      chiave: CHIAVI_LASTRE[nome] ?? 'LASTRA_' + slug(nome),
      descrizione: 'Lastra ' + nome,
      um: 'mq',
      contenuto: 2.4,
      umConf: 'lastre',
      sfrido: 'lastre',
      ...(verifiche.length ? { daVerificare: verifiche.join('; ') } : {}),
    };
  }
  if (/^guid/.test(l)) {
    // controsoffitti: la guida a U lungo il perimetro, per l'orditura della scheda
    if (profiloS) {
      return {
        categoria: 'GUIDA',
        chiave: `GUIDA_PERIMETRALE_${chiaveS}`,
        descrizione: `Guida perimetrale pregymetal U per ${profiloS}`,
        um: 'ml',
        contenuto: 3,
        umConf: 'barre',
        daVerificare: 'profilo e lunghezza barre della guida perimetrale',
      };
    }
    return {
      categoria: 'GUIDA',
      chiave: m ? `GUIDA_${m}` : 'GUIDA_' + slug(p),
      // "Guide pregymetal U75", come "Montanti pregymetal C75"
      descrizione: m ? `${p.replace(/\s+U$/i, '')} U${m}` : p,
      um: 'ml',
      contenuto: 3,
      umConf: 'barre',
      ...(/perimetral/.test(l) ? { daVerificare: 'lunghezza barre guida perimetrale' } : {}),
    };
  }
  if (/^montant/.test(l)) {
    return { categoria: 'MONTANTE', chiave: m ? `MONTANTE_${m}` : chiaveS ? `PROFILO_${chiaveS}` : 'MONTANTE_' + slug(p), descrizione: p + (m ? ` C${m}` : profiloS ? ` ${profiloS}` : ''), um: 'ml', contenuto: 3, umConf: 'barre' };
  }
  if (/orditura/.test(l)) {
    return { categoria: 'PROFILO', chiave: 'PROFILO_' + (chiaveS ?? slug(p)), descrizione: p + (profiloS ? ` ${profiloS}` : ''), um: 'ml', contenuto: 3, umConf: 'barre', daVerificare: 'lunghezza barre profili da controsoffitto' };
  }
  if (/^viti/.test(l)) {
    const lung = /(\d{2})\s*mm/.exec(l)?.[1];
    const snt = /snt/.test(l);
    // SNT 25 e 35: gli stessi articoli del flusso generico (CARTOVIT2 / CARTOVIT3, conf. 1000)
    // "Viti solidtex 32 mm" e "Viti S-tex 32 mm" sono lo stesso articolo (le XT outdoor no)
    const nome = /outdoor/.test(l) ? p.replace(/^viti\s*/i, '') : p.replace(/^viti\s*/i, '').replace(/solidtex/i, 'S-tex');
    const chiave = snt && lung === '25' ? 'VITI_25' : snt && lung === '35' ? 'VITI_35' : 'VITI_' + slug(nome);
    return { categoria: 'VITI', chiave, descrizione: p, um: 'pz', contenuto: 1000, umConf: 'conf.', ...(snt ? {} : { daVerificare: 'confezione viti speciali' }) };
  }
  if (/banda in polietilene/.test(l)) {
    // la banda si compra per larghezza: quella della struttura (BIACAR5 per il 50…)
    const chiave = m ? `BANDA_${m}` : profiloS ? 'BANDA_PERIMETRALE' : 'BANDA_POLIETILENE';
    const descrizione = m ? `Banda in polietilene per struttura ${m}` : profiloS ? 'Banda in polietilene per guida perimetrale' : p;
    return { categoria: 'BANDA', chiave, descrizione, um: 'ml', contenuto: 1, umConf: 'm', daVerificare: 'lunghezza rotolo banda' };
  }
  if (/stucco per giunti/.test(l)) {
    // lo stesso articolo del flusso generico: STUGES, sacco da 10 kg
    return { categoria: 'STUCCO', chiave: 'STUCCO', descrizione: p, um: 'kg', contenuto: 10, umConf: 'sacchi' };
  }
  if (/stucco/.test(l)) {
    return { categoria: 'STUCCO', chiave: 'STUCCO_' + slug(p.replace(/^stucco\s*/i, '')), descrizione: p, um: um(unita), contenuto: 1, umConf: um(unita), daVerificare: 'confezione stucco' };
  }
  if (/nastro per giunti/.test(l)) {
    return { categoria: 'NASTRO', chiave: 'NASTRO_CARTA', descrizione: 'Nastro in carta per giunti', um: 'ml', contenuto: 1, umConf: 'm', daVerificare: 'lunghezza rotolo nastro' };
  }
  if (/\beps\b/.test(l)) {
    return { categoria: 'ISOLANTE', chiave: 'ISOLANTE_EPS', descrizione: p, um: 'mq', contenuto: 1, umConf: 'm²', sfrido: 'isolante', daVerificare: 'formato pannelli EPS' };
  }
  if (/isolante|lana/.test(l)) {
    const roccia = /roccia/.test(l) && !/minerale\/roccia|minerale/.test(l);
    // spessore e densità fanno l'articolo (e per il fuoco la densità è un requisito)
    const sp = /sp\.?\s*(\d+)\s*mm/.exec(l)?.[1];
    const densita = /(\d+(?:[.,]\d+)?)\s*kg\/m/.exec(l)?.[1]?.replace(/[.,]\d+$/, '');
    const vetro = !roccia && /vetro/.test(l) && !/roccia/.test(l);
    const chiave = (roccia ? 'LANA_ROCCIA' : vetro ? 'LANA_VETRO' : 'LANA_MINERALE') + (sp ? `_SP${sp}` : '') + (sp && densita ? `_D${densita}` : '');
    return { categoria: 'ISOLANTE', chiave, descrizione: p, um: 'mq', contenuto: 0.72, umConf: 'pannelli', sfrido: 'isolante' };
  }
  if (/adesivo|rasante|\brete\b|nastro in rete|banda in rete/.test(l)) {
    return { categoria: 'RASATURA', chiave: 'RASATURA_' + slug(p), descrizione: p, um: um(unita), contenuto: 1, umConf: um(unita), daVerificare: 'confezione prodotti di rasatura' };
  }
  return { categoria: 'ACCESSORIO', chiave: 'ACCESSORIO_' + slug(p), descrizione: p, um: um(unita), contenuto: 1, umConf: 'pz', daVerificare: 'confezione accessorio' };
}
