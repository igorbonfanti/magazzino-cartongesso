# Genera il catalogo Siniat usato dall'app: src/data/siniat/catalogo.json
#
# Parte dalle estrazioni (estrazioni/*.json) e le porta in uno schema unico e rigido:
#  - configurazioni certificate al fuoco (guida 2026) con la stratigrafia interpretata
#    e, dove esiste, il collegamento alla scheda Memento con le stesse lastre;
#  - schede Memento con varianti normalizzate (Hmax per interasse, fuoco, Rw) e incidenze
#    con colonne normalizzate ("600]" = interasse 600 montante singolo, "600][" = accoppiato).
#
# Il JSON generato NON si modifica a mano: si corregge qui o nelle estrazioni.
import json, os, re, datetime
from collections import OrderedDict

QUI = os.path.dirname(os.path.abspath(__file__))
EST = os.path.join(QUI, '..', 'estrazioni')
USCITA = os.path.join(QUI, '..', '..', '..', 'src', 'data', 'siniat', 'catalogo.json')

def carica(n): return json.load(open(os.path.join(EST, n), encoding='utf-8'))

# ---------------------------------------------------------------- lastre
# nome canonico -> spessore mm, sigla
LASTRE = OrderedDict([
    ('pregyplac BA13', (12.5, 'PS')), ('pregyplac plus BA13', (12.5, 'PSplus')), ('pregyplac BA18', (18, 'PS18')),
    ('pregyplac BA10', (9.5, 'PS10')), ('pregyplac A1 BA13', (12.5, 'PS A1')),
    ('pregyflam BA13', (12.5, 'PF13')), ('pregyflam BA15', (15, 'PF15')), ('pregyflam A1 BA13', (12.5, 'PF13 A1')), ('pregyflam A1 BA15', (15, 'PF15 A1')),
    ('pregydro H2 BA13', (12.5, 'PH')), ('ladura plus BA13', (12.5, 'LD')), ('solidtex indoor', (12.5, 'S-tex')),
    ('easy 13', (12.5, 'easy')), ('easy pro 13', (12.5, 'easy pro')), ('pregyflex BA6', (6.5, 'Flex')),
    ('pregyvapor BA13', (12.5, 'PV')), ('pregysoundboard BA13', (12.5, 'SB')), ('creason/createx', (12.5, 'creason')),
    ('aquaboard', (12.5, 'AB')), ('aquaboard pro', (12.5, 'AB pro')), ('solidtex outdoor XT', (12.5, 'XT')),
    ('pregy-RX', (12.5, 'RX')), ('PROMATECT-100X 12', (12, 'P100X 12')), ('PROMATECT-100X 20', (20, 'P100X 20')),
])
SIGLE = {'PS': 'pregyplac BA13', 'PSplus': 'pregyplac plus BA13', 'PS18': 'pregyplac BA18', 'PF13': 'pregyflam BA13',
         'PF15': 'pregyflam BA15', 'LD': 'ladura plus BA13', 'S-tex': 'solidtex indoor', 'AB': 'aquaboard',
         'XT': 'solidtex outdoor XT', 'SB': 'pregysoundboard BA13', 'PV': 'pregyvapor BA13'}

def lastra_canonica(t):
    t = t.replace('®', '').replace('™', '').replace('TM', '').strip()
    l = t.lower()
    m = re.search(r'(\d+)\s*mm\s*promatect', l)
    if m: return 'PROMATECT-100X ' + m.group(1)
    if 'promatect' in l: return 'PROMATECT-100X 12'
    if 'outdoor xt' in l: return 'solidtex outdoor XT'
    if 'solidtex' in l or 's-tex' in l: return 'solidtex indoor'
    if 'aquaboard' in l: return 'aquaboard pro' if 'pro' in l else 'aquaboard'
    if 'ladura' in l: return 'ladura plus BA13'
    if 'easy pro' in l: return 'easy pro 13'
    if 'easy' in l: return 'easy 13'
    if 'pregyflex' in l or 'ba6' in l: return 'pregyflex BA6'
    if 'soundboard' in l: return 'pregysoundboard BA13'
    if 'creason' in l or 'createx' in l: return 'creason/createx'
    if 'vapor' in l: return 'pregyvapor BA13'
    if 'pregydro' in l: return 'pregydro H2 BA13'
    if 'pregy-rx' in l or 'pregyrx' in l: return 'pregy-RX'
    if 'pregyflam' in l or 'flam' in l:
        if re.search(r'(?<![a-z0-9])a1(?![0-9])', l): return 'pregyflam A1 BA15' if re.search(r'ba\s*15', l) else 'pregyflam A1 BA13'
        return 'pregyflam BA15' if re.search(r'ba\s*15|flam\s*15', l) else 'pregyflam BA13'
    if 'pregyplac' in l or l.startswith('ps'):
        if 'plus' in l: return 'pregyplac plus BA13'
        if 'ba18' in l: return 'pregyplac BA18'
        if 'ba10' in l: return 'pregyplac BA10'
        if re.search(r'(?<![a-z0-9])a1(?![0-9])', l): return 'pregyplac A1 BA13'
        return 'pregyplac BA13'
    return None

RIGA_LASTRA = re.compile(r'^\s*(?:n\.\s*)?(\d+)\s*(?:x\s*(\d+)\s*mm\s*)?(.+)$', re.I)
def leggi_lastra(riga):
    """'2 pregyflam BA13' -> ('pregyflam BA13', 2); None se la riga non e' una lastra."""
    if re.search(r'orditura|lana|intercapedine|guida|montant|placcaggio|supporto', riga, re.I): return None
    m = RIGA_LASTRA.match(riga)
    if not m: return None
    n = int(m.group(1)); resto = riga if m.group(2) else m.group(3)
    nome = lastra_canonica(resto.split(' / ')[0])
    return (nome, n) if nome else None

def alternative_lastra(riga):
    """'1 pregyflam / ladura plus / solidtex indoor' -> le tre lastre ammesse; None se non c'e' scelta."""
    m = RIGA_LASTRA.match(riga)
    if not m or m.group(2) or ' / ' not in m.group(3): return None
    return [lastra_canonica(x) for x in m.group(3).split(' / ')]

# ---------------------------------------------------------------- stratigrafia delle configurazioni certificate
def isolante_da(riga):
    l = riga.lower()
    tipo = 'LR' if ('roccia' in l and 'vetro' not in l) else 'LV' if ('vetro' in l and 'roccia' not in l) else 'LM'
    sp = re.search(r'sp\.\s*(?:min\.\s*)?(\d+)(?:\s*\+\s*(\d+))?', l)
    spessore = (int(sp.group(1)) + (int(sp.group(2)) if sp.group(2) else 0)) if sp else None
    de = re.search(r'(\d+(?:,\d+)?)\s*kg/m', l)
    densita = float(de.group(1).replace(',', '.')) if de else None
    return OrderedDict(descrizione=riga, tipo=tipo, spessore=spessore, densita=densita, opzionale='opzional' in l)

def orditura_da(riga):
    l = riga.lower()
    m = re.search(r'c(\d+)/50', l)
    inter = re.search(r'int\.\s*(\d+)(?:/(\d+))?\s*mm', l)
    return OrderedDict(montante=('C' + m.group(1)) if m else None,
                       interasse=int(inter.group(1)) if inter else None,
                       montanti='accoppiato' if 'dorso-dorso' in l.split(' o ')[0] else 'singolo')

def stratigrafia_config(c):
    sez = c['sezione']
    if sez not in ('pareti', 'esterne', 'cavedi'): return None
    righe = c['strati']
    if any('PROMATECT' in r for r in righe) and sez != 'pareti': return None
    doppia = c['orditura'] == 'doppia' or any('ntercapedine' in r for r in righe) or c['codice'].startswith('Pregy S')
    lato1, lato2, intermedia = [], [], []
    iso = None; ord_info = None; fase = 0   # 0 = lato1, 1 = dopo la prima orditura, 2 = dopo l'intercapedine/seconda orditura
    for r in righe:
        if re.search(r'orditura', r, re.I):
            o = orditura_da(r)
            if ord_info is None: ord_info = o
            fase = 1 if fase == 0 else 2
            continue
        if re.search(r'intercapedine', r, re.I): fase = 2; continue
        if re.search(r'lana|isolamento', r, re.I):
            if iso is None: iso = isolante_da(r)
            continue
        l = leggi_lastra(r)
        if not l: continue
        l = l + (alternative_lastra(r),)
        if fase == 0: lato1.append(l)
        elif fase == 1 and doppia: intermedia.append(l)
        else: lato2.append(l)
    if sez == 'cavedi':           # lastre su un solo lato: la sola faccia a vista
        lato1, lato2 = lato2 or lato1, []
    # senza un montante C riconoscibile (es. SLA con connettori PHONI) la distinta non si ricava
    if not ord_info or not ord_info['montante'] or not (lato1 or lato2): return None
    def strato(n, k, alt):
        return OrderedDict([('lastra', n), ('n', k)] + ([('alternative', alt)] if alt else []))
    return OrderedDict(tipo='setto' if sez == 'cavedi' else 'parete', file=2 if doppia else 1,
        lato1=[strato(*x) for x in lato1], lato2=[strato(*x) for x in lato2],
        intermedia=[strato(*x) for x in intermedia],
        montante=ord_info['montante'], interasse=ord_info['interasse'] or 600, montanti=ord_info['montanti'],
        isolante=iso)

def firma(tipo, file, lato1, lato2, intermedia):
    def lato(l):
        t = {}
        for s in l: t[s['lastra']] = t.get(s['lastra'], 0) + s['n']
        return '+'.join(f"{k}x{t[k]}" for k in sorted(t))
    lati = sorted([lato(lato1), lato(lato2)])
    return f"{tipo}|{file}|{lati[0]}|{lati[1]}|{lato(intermedia)}"

# ---------------------------------------------------------------- classificazioni
def classificazione(k):
    cl = k['classe']
    m = re.match(r'(REI|EI|E|R)\s*(\d{2,3})', cl)
    if not m:
        m2 = re.search(r'(EI|REI|R)\s*(\d{2,3})', cl)
        if not m2: return None
        m = m2
    h = k['hmax_m']; hmax = None; oltre = False; nota = None
    if isinstance(h, (int, float)): hmax = float(h)
    elif isinstance(h, str):
        oltre = h.strip().startswith('>')
        v = re.search(r'(\d+(?:,\d+)?)', h)
        hmax = float(v.group(1).replace(',', '.')) if v else None
        if '*' in h: nota = 'Oltre 4 m in funzione dello spessore del supporto: vedi Fascicolo Tecnico'
    direzione = None
    d = re.search(r'\((a[^)]*b)\)', cl)
    if d: direzione = d.group(1)
    out = OrderedDict(tipo=m.group(1), minuti=int(m.group(2)))
    if direzione: out['direzione'] = direzione
    if hmax is not None: out['hmax'] = hmax
    if oltre: out['hmaxOltre'] = True
    if nota: out['hmaxNota'] = nota
    if k.get('luce_max_m'): out['luce'] = k['luce_max_m']
    out['riferimenti'] = [OrderedDict((('testo', r['testo']),) + ((('url', r['url']),) if r.get('url') else ())
                                      + ((('provata', r['provata']),) if r.get('provata') else ())) for r in k['riferimenti']]
    out['pagina'] = k['pagina']
    return out

# ---------------------------------------------------------------- schede Memento
def montante_norm(t):
    if not t: return None
    m = re.search(r'C\s*(\d+)', t)
    if m: return 'C' + m.group(1)
    m = re.search(r'S\s*(\d{4})', t)
    return ('S' + m.group(1)) if m else t

INTER = {'i60': '600', 'i40': '400', 'i30': '300', 'i600': '600', 'i400': '400', 'i300': '300', 'int_600': '600', 'int_400': '400', 'int_300': '300'}
def col(inter, montanti): return inter + (']' if montanti == 'singolo' else '][')

def fuoco_variante(v):
    out = []
    fd = v.get('fuoco_dettaglio')
    if isinstance(fd, dict):
        for k, d in fd.items():
            if d and d.get('disponibile'):
                m = re.match(r'(EI|REI)\s*(\d+)', k)
                if m: out.append(OrderedDict([('tipo', m.group(1)), ('minuti', int(m.group(2)))] + ([('hmax', d['hmax_limite_m'])] if d.get('hmax_limite_m') else [])))
    rf = v.get('resistenza_fuoco')
    if isinstance(rf, dict):
        for k, d in rf.items():
            m = re.match(r'(EI|REI)\s*(\d+)', k)
            if not m or not isinstance(d, dict): continue
            if 'disponibile' in d:
                if d['disponibile']: out.append(OrderedDict([('tipo', m.group(1)), ('minuti', int(m.group(2)))] + ([('hmax', d['hmax_fuoco_m'])] if d.get('hmax_fuoco_m') else [])))
            else:
                for chiave, espo in (('fuoco_lato_lastre', 'lato lastre'), ('fuoco_bidirezionale', 'bidirezionale')):
                    e = d.get(chiave)
                    if e and str(e.get('originale', '')).strip() not in ('', '-'):
                        out.append(OrderedDict([('tipo', m.group(1)), ('minuti', int(m.group(2)))] + ([('hmax', e['hmax_fuoco_m'])] if e.get('hmax_fuoco_m') else []) + [('esposizione', espo)]))
    if isinstance(v.get('EI'), (int, float)) and v.get('EI'):
        out.append(OrderedDict([('tipo', 'EI'), ('minuti', int(v['EI']))] + ([('hmax', v['EI_Hmax_m'])] if v.get('EI_Hmax_m') else [])))
    if isinstance(v.get('REI'), (int, float)):
        out.append(OrderedDict([('tipo', 'REI'), ('minuti', int(v['REI']))]))
    return out

def primo(*vals):
    for x in vals:
        if x not in (None, '', [], {}): return x
    return None

def scalari(v, escludi):
    return OrderedDict((k, x) for k, x in v.items() if k not in escludi and isinstance(x, (int, float, str, bool)) and x is not None)

# refusi delle tabelle Memento, documentati nello studio (estrazioni/memento_doppia_contropareti.md)
CORREZIONI_VOCI = {
    # sistema di sole solidtex indoor: la riga lastre riporta "pregyplac BA13"
    ('memento-p38-DX', 'Lastre pregyplac BA13'): 'Lastre solidtex indoor',
    # controsoffitto a membrana "2 o 3 PF15": la riga lastre non dice lo spessore
    ('mem24_cdo_membrana_pregyflam_ba15', 'Lastre pregyflam'): 'Lastre pregyflam BA15',
}

def incidenze_normalizzate(s):
    """Voci con valori per colonna normalizzata. Restituisce (voci, colonne_disponibili)."""
    im = s.get('incidenze_medie') or {}
    voci = []
    for v in im.get('voci') or []:
        v = dict(v, prodotto=CORREZIONI_VOCI.get((s['id'], v.get('prodotto')), v.get('prodotto')))
        valori = OrderedDict()
        grezzi = v.get('valori')
        if grezzi is None:   # formato pareti a singola orditura: i60/i40/i30 -> {singolo, accoppiato}
            grezzi = {k: v[k] for k in ('i60', 'i40', 'i30') if k in v}
        for k, x in grezzi.items():
            if isinstance(x, dict):
                for kk, y in x.items():
                    mont = 'singolo' if kk.startswith('sing') else 'accoppiato'
                    if k in INTER: valori[col(INTER[k], mont)] = y
            elif k in INTER:
                valori[INTER[k] + ']'] = x      # colonna unica per interasse
            elif re.match(r'i(600|400|300)_accoppiato', k):
                valori[k[1:4] + ']['] = x
            elif re.match(r'i(60|40|30)cm', k):
                valori[k[1:3] + '0'] = x      # i60cm -> 600
            else:
                valori[k] = x
        if any(y is not None for y in valori.values()):
            voci.append(OrderedDict(prodotto=v.get('prodotto'), unita=(v.get('unita') or '').replace('m2', 'm²'), valori=valori))
    chiavi = OrderedDict()
    for v in voci:
        for k in v['valori']: chiavi[k] = 1
    return voci, list(chiavi)

def colonne_variante(s, v, chiavi):
    """Quale colonna di incidenza vale per la variante (per interasse o unica)."""
    fam = s['famiglia']
    nome = (v.get('variante') or '').lower()
    if fam in ('parete_singola_orditura', 'parete_doppia_orditura', 'setto_autoportante'):
        mont = v.get('montanti') or v.get('montanti_config_descrizione') or ''
        mont = 'accoppiato' if ('accopp' in mont or v.get('montanti_config') == '][') else 'singolo'
        out = OrderedDict()
        for i in ('600', '400', '300'):
            if col(i, mont) in chiavi: out[i] = col(i, mont)
        return out
    def unica(k): return OrderedDict(unica=k) if k in chiavi else OrderedDict()
    if fam == 'controparete_vincolata' or fam == 'controparete_esterna':
        m = montante_norm(v.get('montanti_tipo') or '') or ''
        if m.startswith('S6027'): return unica('S6027')
        if m.startswith('S49'): return unica('S4915/27')
        return unica('M50/75/100/150')
    if fam.startswith('controsoffitto'):
        if len(chiavi) == 1: return unica(chiavi[0])
        anti = 'antisf' in nome
        for k in chiavi:
            kl = k.lower()
            if ('interni' in kl and 'interni' in nome) or ('esterni' in kl and 'esterni' in nome): return unica(k)
            if kl.startswith('ei') and str(v.get('EI')) in kl: return unica(k)
            if 'cso' in kl and 'cso' in nome and (('antisf' in kl) == anti): return unica(k)
            if 'cdo' in kl and 'cdo' in nome and (('antisf' in kl) == anti): return unica(k)
        for k in chiavi:
            if (k.lower().startswith('antisf') and anti) or (k.lower().startswith('standard') and not anti): return unica(k)
        return OrderedDict()
    if fam == 'parete_esterna':
        if 'singola' in chiavi:
            return unica('singola' if v.get('n_lastre_intercapedine') == 1 else 'doppia')
        return OrderedDict((i, i) for i in ('600', '400', '300') if i in chiavi)
    return OrderedDict()

def variante_norm(s, v, idx, chiavi):
    fam = s['famiglia']
    h = v.get('hmax_m')
    hmax = None
    if isinstance(h, dict):
        hmax = OrderedDict((INTER[k], x) for k, x in h.items() if k in INTER and isinstance(x, (int, float)))
    mont = v.get('montanti') or v.get('montanti_config_descrizione')
    montanti = None
    if mont: montanti = 'accoppiato' if 'accopp' in mont else 'singolo'
    if v.get('montanti_config') == '][': montanti = 'accoppiato'
    rw = primo(v.get('rw_db'), v.get('rw_con_lana_db'), v.get('Rw_con_lana_dB'), v.get('Rw_dB'))
    out = OrderedDict(
        id=f"{s['id']}#{idx}", nome=v.get('variante'),
        spessore=primo(v.get('spessore_mm'), v.get('spessore_totale_mm')),
        montante=montante_norm(primo(v.get('montante'), v.get('montanti_tipo'), v.get('orditura_tipo'), v.get('orditura_primaria_tipo'), v.get('orditura'))),
        montanti=montanti,
    )
    if hmax: out['hmax'] = hmax
    hu = primo(v.get('Hmax_m_P1kN_m2'))
    if hu: out['hmaxUnica'] = hu
    if v.get('hmax_note'): out['hmaxNote'] = v['hmax_note']
    out['fuoco'] = fuoco_variante(v)
    if rw is not None: out['rw'] = rw
    rws = primo(v.get('rw_senza_lana_db'), v.get('Rw_senza_lana_dB'))
    if rws is not None: out['rwSenzaLana'] = rws
    if v.get('rw_supporto_riferimento_db'): out['rwSupporto'] = v['rw_supporto_riferimento_db']
    peso = primo(v.get('peso_kg_m2'), v.get('peso_kg_m2_circa'))
    if peso is not None: out['peso'] = peso
    if v.get('antieffrazione'): out['antieffrazione'] = v['antieffrazione']
    if v.get('resistenza_sfondellamento') or v.get('antisfondellamento') or 'antisf' in (v.get('variante') or '').lower(): out['antisfondellamento'] = True
    out['colonne'] = colonne_variante(s, v, chiavi)
    out['altro'] = scalari(v, {'variante', 'spessore_mm', 'spessore_totale_mm', 'montante', 'montanti_tipo', 'montanti', 'montanti_config',
                               'montanti_config_descrizione', 'simbolo_config', 'disponibile', 'rw_db', 'rw_con_lana_db', 'Rw_con_lana_dB',
                               'Rw_dB', 'rw_senza_lana_db', 'Rw_senza_lana_dB', 'peso_kg_m2', 'peso_kg_m2_circa', 'hmax_note', 'EI', 'EI_Hmax_m',
                               'EI_cella', 'REI', 'antieffrazione', 'nota', 'rw_note', 'campi_con_trattino'})
    return out

def lastre_da_codice(codice):
    """'... - 2 PS + 2 LD - LM' -> [('pregyplac BA13', 2), ('ladura plus BA13', 2)]"""
    if not codice: return []
    parte = re.split(r'[–-]\s*(?=\d+\s*[A-Za-z])', codice, maxsplit=1)
    if len(parte) < 2: return []
    out = []
    for n, sig in re.findall(r'(\d+)\s*(PF13|PF15|PS18|PSplus|PS|LD|S-tex|AB|XT|SB|PV)\b', parte[1]):
        out.append((SIGLE[sig], int(n)))
    return out

def stratigrafia_memento(s):
    fam = s['famiglia']
    if fam not in ('parete_singola_orditura', 'parete_doppia_orditura', 'setto_autoportante', 'controparete_vincolata'): return None
    lastre = lastre_da_codice(s.get('codice') or '')
    if not lastre: return None
    det = s.get('lastre_dettaglio')
    if fam == 'parete_doppia_orditura' and isinstance(det, dict) and det.get('paramento_1'):
        conv = lambda l: [OrderedDict(lastra=lastra_canonica(x['tipo']), n=x['n']) for x in l]
        return OrderedDict(tipo='parete', file=2, lato1=conv(det['paramento_1']), lato2=conv(det.get('paramento_2') or []), intermedia=conv(det.get('intermedia') or []))
    if fam in ('setto_autoportante', 'controparete_vincolata'):
        return OrderedDict(tipo='setto' if fam == 'setto_autoportante' else 'controparete', file=1,
                           lato1=[OrderedDict(lastra=n, n=k) for n, k in reversed(lastre)], lato2=[], intermedia=[])
    # pareti a singola orditura: lastre simmetriche, meta' per lato. Il codice ("2 PS + 2 LD") elenca
    # le lastre dall'orditura verso l'esterno (le viti delle tabelle lo confermano: PS interna, LD a vista);
    # lato1 si scrive dall'esterno verso l'orditura, come nella guida antincendio
    lato = [OrderedDict(lastra=n, n=k // 2) for n, k in lastre if k >= 2]
    return OrderedDict(tipo='parete', file=1, lato1=[OrderedDict(x) for x in reversed(lato)], lato2=lato, intermedia=[])

GRUPPO = {
  'parete_singola_orditura': 'Parete a singola orditura', 'parete_curva': 'Parete curva', 'parete_raggi_x': 'Parete per raggi X',
  'parete_doppia_orditura': 'Parete a doppia orditura', 'controparete_vincolata': 'Controparete', 'riqualifica_fuoco': 'Riqualifica al fuoco',
  'setto_autoportante': 'Setto / cavedio', 'controsoffitto_semiaderenza': 'Controsoffitto', 'controsoffitto_aderenza': 'Controsoffitto',
  'controsoffitto_pendinato': 'Controsoffitto', 'controsoffitto_fonoassorbente': 'Controsoffitto', 'riqualifica_solaio': 'Protezione solaio',
  'parete_esterna': 'Parete esterna', 'controparete_esterna': 'Controparete esterna',
}

def sistema_norm(s):
    voci, chiavi = incidenze_normalizzate(s)
    varianti = [variante_norm(s, v, i, chiavi) for i, v in enumerate(s.get('varianti') or []) if v.get('disponibile') is not False]
    val = lambda r: [r['pieni'], r['su']] if r else None
    out = OrderedDict(
        id=s['id'], famiglia=s['famiglia'], gruppo=GRUPPO.get(s['famiglia'], s['famiglia']), titolo=s['titolo'], codice=s.get('codice'),
        pagina=s.get('pagina_stampata'), paginaPdf=s.get('pagina_pdf'), lastre=s.get('lastre') or [], isolante=s.get('isolante'),
        idealePer=s.get('ideale_per'), badge=s.get('badge') or [], configurazione=s.get('configurazione') or [],
        noteConfigurazione=s.get('note_configurazione') or [],
        valutazioni=OrderedDict(urti=val(s.get('urti')), carico=val(s.get('carico_sospeso')), prezzo=val(s.get('prezzo'))),
        fuocoTesto=s.get('fuoco'), antieffrazione=s.get('antieffrazione'),
        stratigrafia=stratigrafia_memento(s),
        varianti=varianti,
    )
    nt = s.get('note_tabella')
    out['note'] = [f"{k} {v}" for k, v in nt.items()] if isinstance(nt, dict) else (nt or [])
    if voci:
        im = s.get('incidenze_medie') or {}
        out['incidenze'] = OrderedDict(condizioni=im.get('condizioni'), sfridoIncluso=5, voci=voci)
    return out

# ---------------------------------------------------------------- assemblaggio
af = carica('antincendio.json')
cat = carica('catalogo.json')
sistemi = [sistema_norm(s) for s in cat['sistemi']]

firme_memento = {}
for s in sistemi:
    st = s.get('stratigrafia')
    if st and s.get('incidenze'):
        f = firma(st['tipo'], st['file'], st['lato1'], st['lato2'], st['intermedia'])
        firme_memento.setdefault(f, []).append(s['id'])

configurazioni = []
for c in af['configurazioni']:
    cls = [x for x in (classificazione(k) for k in c['classificazioni']) if x]
    st = stratigrafia_config(c)
    out = OrderedDict(
        id=c['id'], sezione=c['sezione'], sezioneNome=c['sezione_nome'], normaProva=c['norma_prova'], gruppo=c['gruppo'],
        orditura=c['orditura'], codice=c['codice'], supporto=c.get('supporto'), esposizione=c.get('esposizione'),
        strati=c['strati'], stratigrafia=st, classificazioni=cls, rw=c.get('rw_db'),
        sostituibilita=c.get('sostituibilita') or {}, note=c.get('note') or [], pagine=c['pagine'],
        promat=('PROMATECT' in c['codice'] or c['codice'].startswith('Promat')),
    )
    if st:
        f = firma(st['tipo'], st['file'], st['lato1'], st['lato2'], st['intermedia'])
        cand = firme_memento.get(f, [])
        if cand:
            # a parita' di lastre, la scheda con/senza isolante come la configurazione
            con_iso = bool(st.get('isolante')) and not st['isolante']['opzionale']
            def ha_iso(sid):
                s = next(x for x in sistemi if x['id'] == sid)
                return any('isolante' in (v['prodotto'] or '').lower() for v in s['incidenze']['voci'])
            cand.sort(key=lambda sid: 0 if ha_iso(sid) == con_iso else 1)
            out['sistemaMemento'] = cand[0]
    # controsoffitti a membrana: la scheda Memento a membrana ha le quantita' per 2 e 3 pregyflam BA15
    if c['sezione'] == 'membrana' and 'CDO S4927' in c['codice'] and 'PF 15' in c['codice']:
        m = next((s for s in sistemi if s['id'] == 'mem24_cdo_membrana_pregyflam_ba15'), None)
        n = re.search(r'-\s*(\d)\s*PF', c['codice'])
        if m and n:
            v = next((v for v in m['varianti'] if f"{n.group(1)}-PF" in (v['nome'] or '')), None)
            if v:
                out['sistemaMemento'] = m['id']
                out['varianteMemento'] = v['id']
    configurazioni.append(out)

catalogo = OrderedDict(
    generato=datetime.date.today().isoformat(),
    fonti=[
        OrderedDict(id='antincendio', titolo='Siniat - Guida pratica alle soluzioni antincendio', versione='luglio 2026'),
        OrderedDict(id='memento', titolo='Siniat - Memento 2024, guida completa', versione='giugno 2025'),
    ],
    avvertenze=af['avvertenze'],
    lastre=[OrderedDict(nome=k, spessore=v[0], sigla=v[1]) for k, v in LASTRE.items()],
    configurazioni=configurazioni,
    sistemi=sistemi,
    acciaio=OrderedDict(riferimento=af['acciaio']['riferimento'], spessori={k: v for k, v in af['acciaio'].items() if k.startswith('Tcr_')},
                        anomalie=af['acciaio']['anomalie'], massivita=carica('acciaio_massivita.json')['profili']),
)
os.makedirs(os.path.dirname(USCITA), exist_ok=True)
testo = json.dumps(catalogo, ensure_ascii=False, indent=1)
# l'estrazione del Memento incolla "pregymetal" e "aquaboard" (nome della linea di profili)
testo = testo.replace('pregymetalaquaboard', 'pregymetal aquaboard')
open(USCITA, 'w', encoding='utf-8').write(testo)

# riepilogo
n_strat = sum(1 for c in configurazioni if c['stratigrafia'])
n_match = sum(1 for c in configurazioni if c.get('sistemaMemento'))
print('configurazioni', len(configurazioni), '| con stratigrafia', n_strat, '| collegate a una scheda Memento', n_match)
print('sistemi', len(sistemi), '| con incidenze', sum(1 for s in sistemi if s.get('incidenze')))
senza_col = [(s['id'], v['nome']) for s in sistemi if s.get('incidenze') for v in s['varianti'] if not v['colonne']]
print('varianti senza colonna di incidenza:', senza_col)
print('byte', os.path.getsize(USCITA))
