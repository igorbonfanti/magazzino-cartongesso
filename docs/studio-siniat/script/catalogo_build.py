# Unisce le estrazioni in un catalogo unico e normalizzato:
#  - fuoco:   configurazioni certificate della guida antincendio 2026 (antincendio.json)
#  - sistemi: schede del Memento 2024 (4 file degli agenti), con riepilogo uniforme
#  - acciaio: tabella spessori + massivita' dei profili
# Output: catalogo.json (dati) e catalogo_dati.js (per la pagina di prova).
import json, os, re

QUI = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'estrazioni')
def carica(n): return json.load(open(os.path.join(QUI, n), encoding='utf-8'))

GRUPPI = {
  'parete_singola_orditura': 'Parete a singola orditura', 'parete_curva': 'Parete curva', 'parete_raggi_x': 'Parete per raggi X',
  'parete_doppia_orditura': 'Parete a doppia orditura', 'controparete_vincolata': 'Controparete',
  'riqualifica_fuoco': 'Riqualifica al fuoco', 'setto_autoportante': 'Setto / cavedio',
  'controsoffitto_semiaderenza': 'Controsoffitto', 'controsoffitto_aderenza': 'Controsoffitto', 'controsoffitto_pendinato': 'Controsoffitto',
  'controsoffitto_fonoassorbente': 'Controsoffitto', 'riqualifica_solaio': 'Protezione solaio', 'parete_esterna': 'Parete esterna',
  'controparete_esterna': 'Controparete esterna',
}

def primo(*vals):
    for v in vals:
        if v not in (None, '', [], {}): return v
    return None

def rating(r):
    """Valutazioni a pallini in forma uniforme: {pieni, su, grafica}."""
    if not r or not isinstance(r, dict): return None
    pieni = primo(r.get('valore'), r.get('pallini_pieni'))
    su = primo(r.get('su'), r.get('pallini_totali'))
    graf = primo(r.get('pallini'), r.get('grafica'))
    if pieni is None: return None
    return {'pieni': pieni, 'su': su, 'grafica': graf}

def num_ei(testo):
    m = re.findall(r'(?:R?EI|R)\s*(\d{2,3})', testo or '')
    return max(int(x) for x in m) if m else None

def badge_lista(b):
    if isinstance(b, list): return b
    if isinstance(b, dict):
        out = []
        for k in ('plus', 'ideale_per'):
            v = b.get(k)
            if isinstance(v, list): out += v
        return out
    return []

def testo_isolante(i):
    if not i: return None
    if isinstance(i, str): return i
    return primo(i.get('testo'), (i.get('tipo') or '') + (' (eventuale)' if i.get('eventuale') or i.get('presenza') == 'eventuale' else ''))

def lista_lastre(l):
    """Le lastre come elenco di testi, qualunque forma abbia scelto l'agente."""
    if not l: return []
    if isinstance(l, dict):
        if l.get('per_tipo'): return [f"{n} × {t}" for t, n in l['per_tipo'].items()]
        return [json.dumps(l, ensure_ascii=False)]
    out = []
    for x in l:
        if isinstance(x, str): out.append(x)
        elif isinstance(x, dict):
            t = x.get('prodotto') or x.get('tipo') or ''
            n = x.get('strati') or x.get('n')
            p = x.get('posizione')
            out.append((f"{n} × " if n not in (None, '') else '') + t + (f" ({p})" if p else ''))
    return out

def testo_ideale(i):
    if not i: return None
    if isinstance(i, str): return i
    if isinstance(i, dict): return i.get('testo') or ', '.join(i.get('icone') or []) or None
    if isinstance(i, list): return ', '.join(str(x) for x in i)
    return str(i)

def configurazioni(c):
    """Configurazione principale (elenco di righe) e, se la scheda ne ha piu' d'una, le alternative per nome."""
    if isinstance(c, dict):
        nomi = list(c.keys())
        return (c[nomi[0]] if isinstance(c[nomi[0]], list) else [str(c[nomi[0]])]), c
    return (c or []), None

def riepilogo(s, fonte_file):
    c = s.get('caratteristiche') or {}
    fam = s.get('famiglia')
    fam = fam[0] if isinstance(fam, list) else fam
    rw_min = primo(c.get('rw_db_min'), c.get('rw_min_db'), c.get('Rw_min_dB'))
    rw_max = primo(c.get('rw_db_max'), c.get('rw_max_db'), c.get('Rw_max_dB'))
    fuoco = primo(c.get('resistenza_fuoco'), c.get('resistenza_al_fuoco'))
    conf, conf_alt = configurazioni(s.get('configurazione'))
    return {
        'id': s['id'], 'fonte': fonte_file, 'pagina_pdf': s.get('pagina_pdf'), 'lato': s.get('lato'), 'pagina_stampata': s.get('pagina_stampata'),
        'famiglia': fam, 'gruppo': GRUPPI.get(fam, fam), 'titolo': s.get('titolo'), 'codice': s.get('codice_sistema'),
        'lastre': lista_lastre(s.get('lastre')), 'lastre_dettaglio': s.get('lastre'), 'isolante': testo_isolante(s.get('isolante')),
        'configurazione': conf, 'configurazioni_alternative': conf_alt, 'note_configurazione': s.get('note_configurazione'),
        'ideale_per': testo_ideale(s.get('ideale_per')), 'badge': badge_lista(s.get('badge')),
        'spessore_mm': [primo(c.get('spessore_mm_min'), c.get('spessore_min_mm')), primo(c.get('spessore_mm_max'), c.get('spessore_max_mm'))],
        'spessore_testo': c.get('spessore'),
        'hmax_m': [primo(c.get('hmax_m_min'), c.get('hmax_min_m')), primo(c.get('hmax_m_max'), c.get('hmax_max_m'), c.get('Hmax_m'))],
        'rw_db': [rw_min, rw_max] if (rw_min or rw_max) else None,
        'delta_rw_max_db': primo(c.get('delta_rw_max_db'), c.get('delta_Rw_max_dB')),
        'fuoco': fuoco, 'fuoco_max': num_ei(fuoco),
        'antieffrazione': primo(c.get('resistenza_effrazione')),
        'urti': rating(c.get('resistenza_urti')), 'carico_sospeso': rating(c.get('carico_sospeso')), 'prezzo': rating(c.get('fascia_prezzo')),
        'varianti': s.get('varianti'), 'note_tabella': s.get('note_tabella'), 'incidenze_medie': s.get('incidenze_medie'),
    }

sistemi = []
for f in ('memento_pareti_singola.json', 'memento_doppia_contropareti.json', 'memento_soffitti_esterni.json'):
    for s in carica(f)['sistemi']:
        sistemi.append(riepilogo(s, f.replace('.json', '')))

af = carica('antincendio.json')
massivita = carica('acciaio_massivita.json')

catalogo = {
    'fonti': [
        {'id': 'antincendio', 'titolo': 'Siniat - Guida pratica alle soluzioni antincendio', 'versione': 'Luglio 2026'},
        {'id': 'memento', 'titolo': 'Siniat - Memento 2024, guida completa', 'versione': 'Giugno 2025'},
        {'id': 'posatore', 'titolo': 'Siniat - Manuale del posatore', 'versione': 'Luglio 2025 (contenuti in parte datati)'},
    ],
    'avvertenze_fuoco': af['avvertenze'],
    'fuoco': af['configurazioni'],
    'sostituibilita_note': af['sostituibilita_note'],
    'acciaio': {'spessori': af['acciaio'], 'massivita': massivita['profili']},
    'sistemi': sistemi,
}
json.dump(catalogo, open(os.path.join(QUI, 'catalogo.json'), 'w', encoding='utf-8'), ensure_ascii=False)
with open(os.path.join(QUI, 'catalogo_dati.js'), 'w', encoding='utf-8') as fh:
    fh.write('window.CATALOGO = ')
    json.dump(catalogo, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')

# controlli
print('configurazioni fuoco', len(catalogo['fuoco']), '| sistemi memento', len(sistemi), '| profili acciaio', len(massivita['profili']))
from collections import Counter
print(Counter(s['gruppo'] for s in sistemi))
for s in sistemi:
    if not s['titolo'] or s['famiglia'] is None: print('MANCA', s['id'])
print('byte js', os.path.getsize(os.path.join(QUI, 'catalogo_dati.js')))
