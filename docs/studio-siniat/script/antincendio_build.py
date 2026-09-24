# Trascrizione della "Guida pratica alle soluzioni antincendio" Siniat, versione Luglio 2026.
# Una riga R(...) per ogni riga delle tabelle del manuale, nell'ordine delle pagine.
# Le righe con lo stesso codice di configurazione vengono poi consolidate: stessa stratigrafia,
# piu' classificazioni (classe, Hmax, rapporti).
import json, re, os
from collections import OrderedDict

QUI = os.path.dirname(os.path.abspath(__file__))

# --- Sostituibilita' (note a pie' di pagina). Regola comune: "anche parzialmente, con lastre
# aventi spessore almeno pari a quello testato".
S = {
 'PS@p6': ['pregyplac plus','pregyplac A1','pregyvapor','pregydro','ladura plus','ladura A1','solidtex indoor','pregyflam','pregyflam A1'],
 'PSplus@p7': ['pregyplac A1','pregyvapor','pregydro','ladura plus','ladura A1','solidtex indoor','pregyflam','pregyflam A1'],
 'PF@p8': ['pregyflam A1','ladura plus','ladura A1','solidtex indoor'],
 'LD@p9': ['ladura A1','ladura vapor','solidtex indoor','pregyflam','pregyflam A1'],
 'STEX@p9': ['ladura plus','ladura A1','ladura vapor','pregyflam','pregyflam A1'],
 'EASY@p9': ['pregyplac','pregyplac plus','pregyplac A1','pregyvapor','pregydro','white air','ydro white air','pregydur I','pregydur white','pregysoundboard','easy pro 13','ladura plus','ladura A1','ladura air','ladura vapor','solidtex indoor','solidtex outdoor XT','aquaboard pro','pregyflam','pregyflam A1'],
 'PF@p10': ['pregyflam A1','ladura plus','ladura A1','ladura vapor','solidtex indoor'],
 'EASYPRO@p11': ['ladura plus','ladura A1','ladura air','solidtex indoor','solidtex outdoor XT','pregyflam','pregyflam A1'],
 'PF15@p12': ['pregyflam A1 BA15','ladura plus BA15','ladura A1 BA15'],
 'PSplus@p16': ['pregyplac A1','pregyvapor','pregydro','white air','ydro white air','pregydur I','pregydur white','pregysoundboard','easy pro 13','ladura plus','ladura A1','ladura air','ladura vapor','solidtex indoor','solidtex outdoor XT','aquaboard pro','pregyflam','pregyflam A1'],
 'AB@p18': ['solidtex outdoor XT'],
 'LD@p18': ['ladura A1','ladura air','solidtex indoor','solidtex outdoor XT','aquaboard pro','pregyflam','pregyflam A1'],
 'PV@p18': ['pregyplac','pregyplac plus','pregyplac A1','pregydro','white air','ydro white air','pregydur I','pregydur white','pregysoundboard','easy pro 13','ladura plus','ladura A1','ladura air','solidtex indoor','solidtex outdoor XT','aquaboard pro','pregyflam','pregyflam A1'],
 'XT@p18': ['aquaboard pro'],
 'STEX@p18': ['ladura plus','ladura A1','ladura air','solidtex outdoor XT','pregyflam','pregyflam A1'],
 'PS@p19': ['pregyplac plus','pregyplac A1','pregyvapor','pregydro','white air','ydro white air','pregydur I','pregydur white','pregysoundboard','easy pro 13','ladura plus','ladura A1','ladura air','solidtex indoor','solidtex outdoor XT','aquaboard pro','pregyflam','pregydroflam','pregyflam A1'],
 'PF13@p19': ['ladura plus','ladura A1','ladura air','solidtex indoor','solidtex outdoor XT','pregydroflam','pregyflam A1'],
 'PF15@p20': ['ladura plus','ladura A1','pregydroflam','pregyflam A1'],
 'PF13@p22': ['pregyflam A1','pregydroflam','ladura plus','ladura A1','solidtex indoor'],
 'PF15@p22': ['pregyflam A1 BA15','pregydroflam BA15','ladura plus BA15','ladura A1 BA15'],
}

SEZIONI = {
 'pareti': ('Pareti leggere', 'EN 1364-1'),
 'esterne': ('Pareti esterne', 'EN 1364-1'),
 'cavedi': ('Setti indipendenti / cavedi tecnici', 'EN 1364-1'),
 'prot_non_portanti': ('Protezione di pareti non portanti', 'EN 1364-1'),
 'prot_portanti': ('Protezione di pareti portanti', 'EN 1365-1'),
 'membrana': ('Controsoffitti a membrana / indipendenti', 'EN 1364-2'),
 'solai': ('Protezione di solai', 'EN 1365-2'),
 'acciaio': ('Protezione di strutture in acciaio', 'EN 13381-4'),
 'scatole': ('Protezione scatole elettriche', 'EN 1366-3'),
}

RIGHE = []
def R(p, sez, gruppo, codice, strati, classe, rif, hmax=None, rw=None, sost=None, esposizione=None,
      supporto=None, note=None, orditura='singola', luce=None):
    RIGHE.append(OrderedDict(pagina=p, sezione=sez, gruppo=gruppo, orditura=orditura, codice=codice,
        supporto=supporto, strati=strati, classe=classe, hmax_m=hmax, luce_max_m=luce, rw_db=rw,
        riferimenti=rif, sostituibilita=sost or {}, esposizione=esposizione, note=note or []))

FT17 = 'FT SI-017/06/2022'; FT19 = 'FT SI-019/04/2024-01'; FT12 = 'FT SI-012/03/2025'; FT11 = 'FT SI-011-04-2025'; FT22 = 'FT SI-022-06-2025'
LM40 = 'Lana di vetro o di roccia sp. 40 mm'

# ------------------------------------------------------------------ p6 EI 30
R(6,'pareti','Lastre standard','Pregy D75/M50 - 2 PS',['1 pregyplac BA13','Orditura C50/50 dorso-dorso int. 600 mm','1 pregyplac BA13'],'EI 30',['Efectis 05-V-151 Indice A',FT17],5.0,32,{'pregyplac BA13':'PS@p6'})
R(6,'pareti','Lastre standard','Pregy D75/M50 - 2 PS - LM',['1 pregyplac BA13','Orditura C50/50 int. 600 mm','Lana di vetro min. 13,5 kg/m3 sp. 40 mm','1 pregyplac BA13'],'EI 30',['WFRG 17757B',FT17],5.0,43,{'pregyplac BA13':'PS@p6'})
R(6,'pareti','Lastre standard','Pregy D125/M75 - 4 PSplus',['2 pregyplac plus BA13','Orditura C75/50 int. 600 mm','2 pregyplac plus BA13'],'EI 30',['Ist. Giordano 338285-3822FR',FT17],12.0,43)
R(6,'pareti','Lastre standard','Pregy D125/M75 - 4 PSplus - LM',['2 pregyplac plus BA13','Orditura C75/50 int. 600 mm',LM40,'2 pregyplac plus BA13'],'EI 30',['Ist. Giordano 390158-4189FR',FT17],12.0,55)
R(6,'pareti','Lastre easy','Pregy D100/M50 - 4 easy - LM',['2 easy 13','Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','2 easy 13'],'EI 30',['Ist. Giordano 412557-4367FR',FT19],12.0,51)
R(6,'pareti','Lastre speciali','Pregy D125/M75 - 2 PSplus + 2 LaDura - LM',['1 ladura plus BA13','1 pregyplac plus BA13','Orditura C75/50 int. 600 mm','Lana di vetro o di roccia sp. 60 mm','1 pregyplac plus BA13','1 ladura plus BA13'],'EI 30',['Ist. Giordano 399811-4274FR','Rapporto EXAP I.G. 412201'],12.0,59)
R(6,'pareti','PROMATECT-100X (Promat)','Promat - Parete EI30 a grande altezza con isolante 1x20',['1 x 20 mm PROMATECT-100X','Orditura C50/50 int. 600 mm','Lana di vetro o roccia min. 15 kg/m3 sp. 60 mm','1 x 20 mm PROMATECT-100X'],'EI 30',['Applus 22/32307429','Rapporto EXAP 23-32301545'],12.0,49,note=['Lastre PROMATECT-100X in classe A1 di reazione al fuoco','Certificato scaricabile da MyPromat'])

# ------------------------------------------------------------------ p7 EI 45 / EI 60
R(7,'pareti','Lastre antincendio','Pregy D125/M75 - 4 PF 13',['2 pregyflam BA13','Orditura C75/50 int. 600 mm','2 pregyflam BA13'],'EI 45',['Ist. Giordano 381597-4112FR',FT17],12.0,45)
R(7,'pareti','Lastre antincendio','Pregy D125/M75 - 4 PF 13 - LM',['2 pregyflam BA13','Orditura C75/50 int. 600 mm','Lana di vetro o di roccia sp. 45 mm','2 pregyflam BA13'],'EI 45',['Ist. Giordano 381599-4114FR',FT17],12.0,56,note=['A p.7 (EI 45) la lana e\' indicata sp. 45 mm, a p.12 (EI 120) sp. 40 mm: DA VERIFICARE sul rapporto'])
R(7,'pareti','Lastre standard','Pregy D100/M50 - 4 PS',['2 pregyplac BA13','Orditura C50/50 int. 600 mm','2 pregyplac BA13'],'EI 60',['SP P805090',FT17],4.0,42,{'pregyplac BA13':'PS@p6'})
R(7,'pareti','Lastre standard','Pregy D125/M75 - 4 PSplus',['2 pregyplac plus BA13','Orditura C75/50 int. 600 mm','2 pregyplac plus BA13'],'EI 60',['Ist. Giordano 338285-3822FR',FT17],5.0,43,{'pregyplac plus BA13':'PSplus@p7'})
R(7,'pareti','Lastre standard','Pregy D100/M50 - 4 PS - LM',['2 pregyplac BA13','Orditura C50/50 int. 600 mm',LM40,'2 pregyplac BA13'],'EI 60',['Efectis R001815',FT17],6.0,52,{'pregyplac BA13':'PS@p6'})
R(7,'pareti','Lastre standard','Pregy D150/M75 - 6 PSplus',['3 pregyplac plus BA13','Orditura C75/50 int. 600 mm','3 pregyplac plus BA13'],'EI 60',['Ist. Giordano 338285-3822FR',FT17],6.0,49,{'pregyplac plus BA13':'PSplus@p7'})
R(7,'pareti','Lastre standard','Pregy D125/M50 - 6 PS - LM',['3 pregyplac BA13','Orditura C50/50 int. 600 mm',LM40,'3 pregyplac BA13'],'EI 60',['Efectis R001815',FT17],7.0,56,{'pregyplac BA13':'PS@p6'})

# ------------------------------------------------------------------ p8 EI 60
R(8,'pareti','Lastre standard','Pregy D147/M75 - 4 PS BA18 - LM',['2 pregyplac BA18','Orditura C75/50 int. 600 mm','Lana di vetro o di roccia (min. 15 kg/m3 sp. 45 mm)','2 pregyplac BA18'],'EI 60',['LAPI 279-C-22-385FR','Rapporto EXAP LAPI 074-C-22-AR1-22'],12.0,59,note=['Il file del certificato e\' intitolato EI 120: possibile classe superiore ad altezze minori, DA VERIFICARE sul rapporto'])
R(8,'pareti','Lastre antincendio','Pregy D105/M75 - 2 PF 15',['1 pregyflam BA15','Orditura C75/50 int. 600 mm','1 pregyflam BA15'],'EI 60',['Ist. Giordano 381598-4113FR',FT17],5.0,37,{'pregyflam BA15':'PF@p8'})
R(8,'pareti','Lastre antincendio','Pregy D105/M75 - 2 PF 15 - LR',['1 pregyflam BA15','Orditura C75/50 int. 600 mm','Lana di roccia 60 kg/m3 sp. 50 mm','1 pregyflam BA15'],'EI 60',['Ist. Giordano 295257-3419FR',FT17],5.0,50,{'pregyflam BA15':'PF@p8'})
R(8,'pareti','Lastre antincendio','Pregy D130/M75 - 2 PF 15 + 2 PF 13',['1 pregyflam BA13','1 pregyflam BA15','Orditura C75/50 int. 600 mm','1 pregyflam BA15','1 pregyflam BA13'],'EI 60',['Ist. Giordano 381598-4113FR',FT17],6.0,47,{'pregyflam BA13':'PF@p8','pregyflam BA15':'PF@p8'})
R(8,'pareti','Lastre antincendio','Pregy D100/M50 - 4 PF 13 - LR',['2 pregyflam BA13','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','2 pregyflam BA13'],'EI 60',['Ist. Giordano 351340-3917FR',FT17],6.2,54,{'pregyflam BA13':'PF@p8'})
R(8,'pareti','Lastre antincendio','Pregy D135/M75 - 4 PF 15',['2 pregyflam BA15','Orditura C75/50 int. 600 mm','2 pregyflam BA15'],'EI 60',['Ist. Giordano 381600-4115FR',FT17],12.0,48,note=['Nel manuale il codice e\' stampato "2 PF 15" ma la stratigrafia e\' 2+2 pregyflam BA15 (e il certificato e\' intitolato D135 4PF15): refuso del manuale','Il Memento indica anche EI 120 con Hmax 6,9 m per 2+2 PF15: DA VERIFICARE sul rapporto'])
R(8,'pareti','Lastre antincendio','Pregy D135/M75 - 4 PF 15 - LM',['2 pregyflam BA15','Orditura C75/50 int. 600 mm',LM40,'2 pregyflam BA15'],'EI 60',['Ist. Giordano 401066-4286FR','Rapporto EXAP 412204'],12.0,57,note=['Accessori: scatole elettriche protette con PROMASEAL-PLSK 503 Wall','Il file del certificato e\' intitolato EI 120: DA VERIFICARE sul rapporto'])

# ------------------------------------------------------------------ p9 EI 60
R(9,'pareti','Lastre easy','Pregy D100/M50 - 4 easy',['2 easy 13','Orditura C50/50 int. 600 mm','2 easy 13'],'EI 60',[FT19],5.0,41,{'easy 13':'EASY@p9'})
R(9,'pareti','Lastre easy','Pregy D100/M50 - 4 easy - LM',['2 easy 13','Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','2 easy 13'],'EI 60',['Ist. Giordano 412557-4367FR',FT19],5.0,51,{'easy 13':'EASY@p9'})
R(9,'pareti','Lastre speciali','Pregy D75/M50 - 2 LD - LR',['1 ladura plus BA13','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','1 ladura plus BA13'],'EI 60',['Ist. Giordano 351340-3917FR',FT17],5.2,48,{'ladura plus BA13':'LD@p9'})
R(9,'pareti','Lastre speciali','Pregy D75/M50 - 2 S-tex - LR',['1 solidtex indoor','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','1 solidtex indoor'],'EI 60',['Ist. Giordano 351340-3917FR',FT17],5.2,50,{'solidtex indoor':'STEX@p9'})
R(9,'pareti','Lastre speciali','Pregy D100/M50 - 4 LD - LR',['2 ladura plus BA13','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','2 ladura plus BA13'],'EI 60',['Ist. Giordano 351340-3917FR',FT17],6.2,59,{'ladura plus BA13':'LD@p9'})
R(9,'pareti','Lastre speciali','Pregy D100/M50 - 4 S-tex - LR',['2 solidtex indoor','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','2 solidtex indoor'],'EI 60',['Ist. Giordano 351340-3917FR',FT17],6.2,61,{'solidtex indoor':'STEX@p9'})
R(9,'pareti','Parete curva','Pregy D-Curva 89/M50 - 6 Flex - LR (Efectis 06-E-130)',['3 pregyflex BA6','Orditura C50/50 int. 195 mm','Lana di roccia 40 kg/m3 sp. 45 mm','3 pregyflex BA6'],'EI 60',['Efectis 06-E-130'],4.0,49,note=['Classificata anche E 90','Raggio di curvatura >= 300 mm'])

# ------------------------------------------------------------------ p10 EI 90
R(10,'pareti','Lastre standard','Pregy D125/M75 - 4 PSplus',['2 pregyplac plus BA13','Orditura C75/50 int. 600 mm','2 pregyplac plus BA13'],'EI 90',['Ist. Giordano 338285-3822FR',FT17],5.0,43,{'pregyplac plus BA13':'PSplus@p7'})
R(10,'pareti','Lastre standard','Pregy D125/M75 - 4 PSplus - LM',['2 pregyplac plus BA13','Orditura C75/50 int. 600 mm',LM40,'2 pregyplac plus BA13'],'EI 90',['Ist. Giordano 390158-4189FR',FT17],4.0,55,{'pregyplac plus BA13':'PSplus@p7'})
R(10,'pareti','Lastre antincendio','Pregy D105/M75 - 2 PF 15 - LR',['1 pregyflam BA15','Orditura C75/50 int. 600 mm','Lana di roccia 60 kg/m3 sp. 50 mm','1 pregyflam BA15'],'EI 90',['Ist. Giordano 295257-3419FR',FT17],3.0,50,{'pregyflam BA15':'PF@p10'})
R(10,'pareti','Lastre antincendio','Pregy D100/M50 - 4 PF 13 - LR',['2 pregyflam BA13','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','2 pregyflam BA13'],'EI 90',['WFRG 19056B',FT17],6.0,54,{'pregyflam BA13':'PF@p10'})
R(10,'pareti','Lastre antincendio','Pregy D125/M50 - 6 PF 13 - LR',['3 pregyflam BA13','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','3 pregyflam BA13'],'EI 90',['WFRG 19056B',FT17],7.0,60,{'pregyflam BA13':'PF@p10'})
R(10,'pareti','Lastre antincendio','Pregy D150/M75 - 6 PF13 - LM',['3 pregyflam BA13','Orditura C75/50 int. 600 mm','3 pregyflam BA13'],'EI 90',['Ist. Giordano 407264-4339FR','Rapporto EXAP 412200'],12.0,53,note=['Il codice riporta "LM" ma la configurazione stampata non elenca l\'isolante (e Rw 53 e\' coerente con parete senza isolante): DA VERIFICARE sul rapporto'])

# ------------------------------------------------------------------ p11 EI 90 (verificata sull'immagine)
R(11,'pareti','Lastre easy','Pregy D100/M50 - 2 easy + 2 easy pro',['1 easy pro 13','1 easy 13','Orditura C50/50 int. 600 mm','1 easy 13','1 easy pro 13'],'EI 90',[FT19],4.0,46,{'easy 13':'EASY@p9','easy pro 13':'EASYPRO@p11'})
R(11,'pareti','Lastre easy','Pregy D100/M50 - 2 easy + 2 easy pro - LM',['1 easy pro 13','1 easy 13','Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','1 easy 13','1 easy pro 13'],'EI 90',[FT19],4.0,54,{'easy 13':'EASY@p9','easy pro 13':'EASYPRO@p11'})
R(11,'pareti','Lastre speciali','Pregy D125/M75 - 2 PSplus + 2 LaDura - LM',['1 ladura plus BA13','1 pregyplac plus BA13','Orditura C75/50 int. 600 mm','Lana di vetro o di roccia sp. 60 mm','1 pregyplac plus BA13','1 ladura plus BA13'],'EI 90',['Ist. Giordano 399811-4274FR','Rapporto EXAP I.G. 412201'],5.0,59)
R(11,'pareti','Lastre speciali','Pregy D125/M75 - 2 PSplus + 2 S-tex - LR',['1 pregyplac plus BA13','1 solidtex indoor','Orditura C75/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 60 mm','1 solidtex indoor','1 pregyplac plus BA13'],'EI 90',['Ist. Giordano 351103-3915FR',FT17],5.2,61,{'pregyplac plus BA13':'PSplus@p7','solidtex indoor':'STEX@p9'})
R(11,'pareti','Parete curva','Pregy D-Curva 89/M50 - 6 Flex - LR (Efectis 06-E-115)',['3 pregyflex BA6','Orditura C50/50 int. 195 mm','Lana di roccia 40 kg/m3 sp. 45 mm','3 pregyflex BA6'],'EI 90',['Efectis 06-E-115'],4.0,49,note=['Raggio di curvatura >= 300 mm','Lunghezza semi-conchiglia <= 1200 mm'])

# ------------------------------------------------------------------ p12 EI 120
R(12,'pareti','Lastre antincendio','Pregy D100/M50 - 4 PF 13 - LR',['2 pregyflam BA13','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','2 pregyflam BA13'],'EI 120',['WFRG 19056B',FT17],5.0,54,{'pregyflam BA13':'PF@p10'})
R(12,'pareti','Lastre antincendio','Pregy D125/M75 - 4 PF 13',['2 pregyflam BA13','Orditura C75/50 int. 600 mm','2 pregyflam BA13'],'EI 120',['Ist. Giordano 381597-4112FR',FT17],5.0,45,{'pregyflam BA13':'PF@p10'})
R(12,'pareti','Lastre antincendio','Pregy D125/M75 - 4 PF 13 - LM',['2 pregyflam BA13','Orditura C75/50 int. 600 mm',LM40,'2 pregyflam BA13'],'EI 120',['Ist. Giordano 381599-4114FR',FT17],5.0,56,{'pregyflam BA13':'PF@p10'})
R(12,'pareti','Lastre antincendio','Pregy D150/M75 - 6 PF 13',['3 pregyflam BA13','Orditura C75/50 int. 600 mm','3 pregyflam BA13'],'EI 120',['Ist. Giordano 381597-4112FR',FT17],6.0,51,{'pregyflam BA13':'PF@p10'})
R(12,'pareti','Lastre antincendio','Pregy D150/M75 - 6 PF 13 - LM',['3 pregyflam BA13','Orditura C75/50 int. 600 mm',LM40,'3 pregyflam BA13'],'EI 120',['Ist. Giordano 381599-4114FR',FT17],6.0,61,{'pregyflam BA13':'PF@p10'})
R(12,'pareti','Lastre antincendio','Pregy D160/M100 - 4 PF 15',['2 pregyflam BA15','Orditura C100/50 int. 600 mm','2 pregyflam BA15'],'EI 120',['FT SI-020-10-2024'],8.0,48,{'pregyflam BA15':'PF15@p12'})
R(12,'pareti','Lastre antincendio','Pregy D160/M100 - 4 PF15 - LM',['2 pregyflam BA15','Orditura C100/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','2 pregyflam BA15'],'EI 120',['FT SI-020-10-2024','CSTB DSSF24-31994/A'],8.0,58,{'pregyflam BA15':'PF15@p12'})

# ------------------------------------------------------------------ p13 EI 120 (verificata sull'immagine)
R(13,'pareti','Lastre antincendio','Pregy D165/M75 - 6 PF 15',['3 pregyflam BA15','Orditura C75/50 int. 600 mm','3 pregyflam BA15'],'EI 120',['Ist. Giordano 344892-3869FR',FT17],12.0,53,note=['Il Memento indica anche EI 180 con Hmax 5,0 m e il file del certificato e\' intitolato EI 180: la guida 2026 non la elenca fra le EI 180, DA VERIFICARE sul rapporto'])
R(13,'pareti','Lastre antincendio','Pregy D175/M75 - 8 PF 13',['4 pregyflam BA13','Orditura C75/50 int. 600 mm','4 pregyflam BA13'],'EI 120',['Ist. Giordano 344892-3869FR',FT17],12.0,55)
R(13,'pareti','Lastre antincendio','Pregy D175/M75 - 8 PF 13 - LM',['4 pregyflam BA13','Orditura C75/50 int. 600 mm','Lana di vetro o di roccia (min. 15 kg/m3 sp. 45 mm)','4 pregyflam BA13'],'EI 120',['LAPI 284-C-22-388FR','Rapporto EXAP LAPI 075-C-22-AR1-22'],12.0,64)
R(13,'pareti','PROMATECT-100X (Promat)','Promat - Parete EI120 a singola lastra per lato 1x12',['1 x 12 mm PROMATECT-100X','Orditura C75/50 int. 600 mm','Lana di roccia min. 70 kg/m3 sp. 60 mm','1 x 12 mm PROMATECT-100X'],'EI 120',['Ist. Giordano 415821-4381FR','Rapporto EXAP IG 423022'],5.0,45,note=['Lastre PROMATECT-100X in classe A1','Certificato su MyPromat'])
R(13,'pareti','PROMATECT-100X (Promat)','Promat - Parete EI30 a grande altezza con isolante 1x20',['1 x 20 mm PROMATECT-100X','Orditura C50/50 int. 600 mm','Lana di vetro o roccia min. 15 kg/m3 sp. 60 mm','1 x 20 mm PROMATECT-100X'],'EI 120',['Applus 22/32307429','Rapporto EXAP 23-32301544'],5.0,49,note=['Stessa stratigrafia della EI 30 a grande altezza (12 m): EI 120 fino a 5 m','Lastre PROMATECT-100X in classe A1','Certificato su MyPromat'])
R(13,'pareti','PROMATECT-100X (Promat)','Promat - Parete EI 120 a grande altezza C100 dorso-dorso 2x12',['2 x 12 mm PROMATECT-100X','Orditura C100/50 dorso-dorso int. 600 mm con giunto telescopico in sommita','Lana di vetro o di roccia (min. 24 kg/m3 sp. 100 mm)','2 x 12 mm PROMATECT-100X'],'EI 120',['FT PR-026/11/2021'],9.0,57,note=['Lastre PROMATECT-100X in classe A1','Certificato su MyPromat'])
R(13,'pareti','PROMATECT-100X (Promat)','Promat - Parete EI 120 a grande altezza C150 dorso-dorso 2x12',['2 x 12 mm PROMATECT-100X','Orditura C150/50 dorso-dorso int. 600 mm con giunto telescopico in sommita','Lana di vetro o di roccia (min. 15 kg/m3 sp. 70+70 mm)','2 x 12 mm PROMATECT-100X'],'EI 120',['CSTB RS22-011','Rapporto EXAP CSTB DSSF22-11503'],11.0,58,note=['Hmax 12 m con 3 x 12 mm PROMATECT-100X per lato','Lastre PROMATECT-100X in classe A1','Certificato su MyPromat'])

# ------------------------------------------------------------------ p14 EI 120 lastre speciali
R(14,'pareti','Lastre speciali','Pregy D125/M75 - 2 PSplus + 2 S-tex - LR',['1 pregyplac plus BA13','1 solidtex indoor','Orditura C75/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 60 mm','1 solidtex indoor','1 pregyplac plus BA13'],'EI 120',['Ist. Giordano 351103-3915FR',FT17],4.2,61,{'pregyplac plus BA13':'PSplus@p7','solidtex indoor':'STEX@p9'})
R(14,'pareti','Lastre speciali','Pregy D100/M50 - 4 LD - LR',['2 ladura plus BA13','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','2 ladura plus BA13'],'EI 120',['WFRG 19056B',FT17],5.0,59,{'ladura plus BA13':'LD@p9'})
R(14,'pareti','Lastre speciali','Pregy D125/M75 - 4 LD - LM',['2 ladura plus BA13','Orditura C75/50 int. 600 mm','Lana di vetro o di roccia sp. 60 mm','2 ladura plus BA13'],'EI 120',['Ist. Giordano 381599-4114FR',FT17],5.0,62,{'ladura plus BA13':'LD@p9'})
R(14,'pareti','Lastre speciali','Pregy D125/M75 - 4 S-tex - LM',['2 solidtex indoor','Orditura C75/50 int. 600 mm','Lana di vetro o di roccia sp. 60 mm','2 solidtex indoor'],'EI 120',['Ist. Giordano 381599-4114FR',FT17],5.0,63,{'solidtex indoor':'STEX@p9'})

# ------------------------------------------------------------------ p15 EI 180 / EI 240
R(15,'pareti','Lastre antincendio','Pregy D150/M75 - 6 PF 13',['3 pregyflam BA13','Orditura C75/50 int. 600 mm','3 pregyflam BA13'],'EI 180',['Ist. Giordano 383047-4129FR',FT17],5.0,51,{'pregyflam BA13':'PF@p10'})
R(15,'pareti','Lastre antincendio','Pregy D175/M75 - 8 PF 13 - LM',['4 pregyflam BA13','Orditura C75/50 int. 600 mm','Lana di vetro o di roccia (min. 15 kg/m3 sp. 45 mm)','4 pregyflam BA13'],'EI 180',['LAPI 284-C-22-388FR','Rapporto EXAP LAPI 075-C-22-AR1-22'],5.0,64)
R(15,'pareti','Lastre antincendio','Pregy D190/M75 - 6 PF 15 + 2 PF 13',['1 pregyflam BA13 (o BA15)','3 pregyflam BA15','Orditura C75/50 int. 600 mm','3 pregyflam BA15','1 pregyflam BA13 (o BA15)'],'EI 180',['Ist. Giordano 383047-4129FR',FT17],6.0,55,{'pregyflam BA13':'PF@p10'})
R(15,'pareti','Lastre antincendio','Pregy D175/M75 - 8 PF 13 - LM',['4 pregyflam BA13','Orditura C75/50 int. 600 mm','Lana di vetro o di roccia (min. 15 kg/m3 sp. 45 mm)','4 pregyflam BA13'],'EI 240',['LAPI 284-C-22-388FR','Rapporto EXAP LAPI 075-C-22-AR1-22'],4.0,64)

# ------------------------------------------------------------------ p16-17 doppia orditura
R(16,'pareti','Lastre easy','Pregy S150/2M50 - 4 easy - LM',['2 easy 13','Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm',"Intercapedine d'aria",'Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','2 easy 13'],'EI 60',[FT19],4.0,60,{'easy 13':'EASY@p9'},orditura='doppia')
R(16,'pareti','Lastre speciali','Pregy S140/2M50 - 3 S-tex - LR',['1 solidtex indoor','Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','1 solidtex indoor',"Intercapedine d'aria",'Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 40 mm','1 solidtex indoor'],'EI 60',['Ist. Giordano 351340-3917FR',FT17],5.2,66,orditura='doppia')
R(16,'pareti','Parete per cinema','Pregy SLA260/2M100 - 2 PS + 2 PS 18 - LM',['1 pregyplac BA18','1 pregyplac BA13','Doppia orditura metallica legata con connettori acustici PHONI SL int. 2,0 m','C50/50 dorso-dorso per h <= 11,05 m; C100/50 dorso-dorso per h <= 13,45 m (sp. 500 mm)','Doppio isolamento in lana di vetro','1 pregyplac BA13','1 pregyplac BA18'],'EI 60',['Efectis 07-A-011'],13.45,None,orditura='doppia',note=['Rw > 73 dB'])
R(16,'pareti','Lastre standard','Pregy S150/2M50 - 4 PS Plus - LM',['2 pregyplac plus BA13','Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm',"Intercapedine d'aria",'Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','2 pregyplac plus BA13'],'EI 90',['Ist. Giordano 415849-4382FR','FT SI-019/04/2024'],4.0,61,{'pregyplac plus BA13':'PSplus@p16'},orditura='doppia')
R(16,'pareti','Lastre easy','Pregy S163/2M50 - 5 easy - LM',['2 easy 13','Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','1 easy 13',"Intercapedine d'aria",'Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','2 easy 13'],'EI 90',[FT19],4.0,61,{'easy 13':'EASY@p9'},orditura='doppia')
R(17,'pareti','Lastre antincendio','Pregy S125-200/2M50-100 - 4 PF - LM',['2 pregyflam BA13','Doppia orditura metallica int. 400/600 mm: C50/50 singoli/doppi hmax 3,7-4,2 m; C100/50 singoli/doppi hmax 4,4-5,3 m','Doppio isolamento in lana di vetro','2 pregyflam BA13'],'EI 120',['Efectis 09-E-533'],5.3,64,orditura='doppia')
R(17,'pareti','Lastre easy','Pregy S163/2M50 - 2 easy + 3 easy pro - LM',['1 easy pro 13','1 easy 13','Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','1 easy pro 13',"Intercapedine d'aria",'Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','1 easy 13','1 easy pro 13'],'EI 120',[FT19],4.0,65,{'easy 13':'EASY@p9','easy pro 13':'EASYPRO@p11'},orditura='doppia')
R(17,'pareti','Lastre easy','Pregy S163/2M50 - 4 easy + 1 PF13 - LM',['2 easy 13','Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','1 pregyflam / ladura plus / solidtex indoor',"Intercapedine d'aria",'Orditura C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm','2 easy 13'],'EI 120',['Ist. Giordano 415850-4383FR',FT19],4.0,62,{'easy 13':'EASY@p9'},orditura='doppia')

# ------------------------------------------------------------------ p18 pareti esterne (fuoco bidirezionale)
R(18,'esterne','Pareti esterne','Parete esterna aquaboard pro - EI 60',['1 aquaboard pro + rasatura XT','Orditura C100/50 int. 600 mm','Lana di vetro o roccia sp. min. 70 mm','1 ladura plus BA13'],'EI 60',['Ist. Giordano 399848-4276FR',FT22],5.0,50,{'aquaboard pro':'AB@p18','ladura plus BA13':'LD@p18'},esposizione='bidirezionale',note=["Consentita l'aggiunta su un lato di 1 lastra di gesso rivestito Siniat (es. pregyvapor BA13), in qualunque posizione"])
R(18,'esterne','Pareti esterne','Parete esterna aquaboard pro - EI 120',['1 aquaboard pro + rasatura XT','Orditura C100/50 int. 600 mm','Lana di vetro o roccia sp. 80 mm','1 ladura plus BA13','Orditura C75/50 int. 600 mm','Lana di vetro o roccia sp. 60 mm','1 pregyvapor BA13','1 ladura plus BA13'],'EI 120',['Ist. Giordano 386318-4160FR',FT22],4.2,64,{'aquaboard pro':'AB@p18','ladura plus BA13':'LD@p18','pregyvapor BA13':'PV@p18'},esposizione='bidirezionale',orditura='doppia')
R(18,'esterne','Pareti esterne','Parete esterna Solidtex Wall System - EI 120',['1 solidtex outdoor XT + rasatura XT','Orditura C100/50 int. 600 mm','Lana di vetro o roccia sp. 80 mm','1 solidtex indoor','Orditura C75/50 int. 600 mm','Lana di vetro o roccia sp. 60 mm','1 pregyvapor BA13','1 solidtex indoor'],'EI 120',['Ist. Giordano 386318-4160FR',FT22],4.2,74,{'solidtex outdoor XT':'XT@p18','solidtex indoor':'STEX@p18','pregyvapor BA13':'PV@p18'},esposizione='bidirezionale',orditura='doppia',note=['Possibile rivestimento incollato come da specifiche Siniat'])

# ------------------------------------------------------------------ p19-21 cavedi / setti (lastre su un solo lato)
def CAV(p, classe, codice, lastre, rif, hbid, rw, rwiso, sost, extra=None):
    base = ['Orditura minima: C50/50 dorso-dorso int. 600 mm o C75/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm (opzionale, rimozione consentita)', lastre]
    R(p,'cavedi','Setti / cavedi',codice+' (fuoco bidirezionale)',base,classe,rif,hbid,rw,sost,esposizione='bidirezionale',note=[f'Rw {rwiso} dB con isolante']+(extra or []))
    base2 = ['Orditura minima: C50/50 int. 600 mm','Lana di vetro o roccia sp. 40 mm (opzionale, rimozione consentita)', lastre]
    R(p,'cavedi','Setti / cavedi',codice+' (fuoco lato lastre)',base2,classe,rif,f'> {hbid:.2f}'.replace('.',','),rw,sost,esposizione='lato lastre',note=[f'Rw {rwiso} dB con isolante','Hmax oltre il valore della variante bidirezionale: vedi Fascicolo Tecnico']+(extra or []))
CAV(19,'EI 30','Pregy CW75/M50 - 2 PS13 - LM (opzionale)','2 pregyplac BA13',['Efectis 07-A-030','Est. 09/3',FT12],3.3,31,33,{'pregyplac BA13':'PS@p19'})
CAV(19,'EI 45','Pregy CW75/M50 - 2 PF13 - LM (opzionale)','2 pregyflam BA13',['WFRGENT n.17656B',FT12],4.0,33,35,{'pregyflam BA13':'PF13@p19'})
R(20,'cavedi','Setti / cavedi','Pregy CW86/M50 - 2 PS 18 - LM',['Orditura min. C50/50 dorso-dorso int. 600 mm (vedi documento di riferimento)','Lana di vetro sp. min. 45 mm','2 pregyplac BA18'],'EI 60',['Efectis 06-V-384','Est. 07/2'],10.15,36,esposizione='bidirezionale')
CAV(20,'EI 60','Pregy CW80/M50 - 2 PF15 - LM (opzionale)','2 pregyflam BA15',['WFRGENT n.17658B',FT12],4.0,33,36,{'pregyflam BA15':'PF15@p20'})
CAV(20,'EI 60','Pregy CW88/M50 - 3 PF13 - LM (opzionale)','3 pregyflam BA13',[FT12],4.0,36,39,{'pregyflam BA13':'PF13@p19'})
CAV(21,'EI 120','Pregy CW95/M50 - 3 PF15 - LM (opzionale)','3 pregyflam BA15',['CSTB RS12-076','Est. 13/2',FT12],4.0,36,40,{'pregyflam BA15':'PF15@p20'})
CAV(21,'EI 120','Pregy CW100/M50 - 4 PF13 - LM (opzionale)','4 pregyflam BA13',[FT12],4.0,38,41,{'pregyflam BA13':'PF13@p19'})

# ------------------------------------------------------------------ p22-23 protezione di pareti non portanti
R(22,'prot_non_portanti','Muratura in laterizio forato','Placcaggio Pregy CW Incollata - 1 PF 15',['1 pregyflam BA15 incollata con plotte di colla P120 ogni 30x30 cm + tasselli metallici (n. 3/m2)'],'EI 120',['LAPI 115/C/13-177FR'],4.0,supporto='Blocchi forati di laterizio sp. min. 80 mm NON intonacati',esposizione='placcaggio sul lato esposto',note=['Nel manuale i tasselli sono indicati "n. 3/m3": inteso per m2'])
R(22,'prot_non_portanti','Muratura in laterizio forato','Placcaggio Pregy CW Incollata - 1 PF 13',['1 pregyflam BA13 incollata con plotte di colla P120 ogni 30x30 cm + tasselli metallici (n. 3/m2)'],'EI 120',['LAPI 157/C/14-229FR',FT11],'8,00 *',supporto='Blocchi forati di laterizio sp. min. 80 mm (fino H = 4 m) con 10 mm di intonaco sul lato non esposto',sost={'pregyflam BA13':'PF13@p22'},esposizione='placcaggio sul lato esposto',note=['* Oltre 4 m in funzione dello spessore del supporto: consultare il Fascicolo Tecnico'])
R(22,'prot_non_portanti','Muratura in laterizio forato','Controparete Pregy CW 40/S4927 - 1 PF',['Orditura S4927 int. 600 mm vincolata con gancio distanziatore S4915/27 int. 1000 mm','1 pregyflam BA13'],'EI 120',['Ist. Giordano 305030-3540FR',FT11],'8,00 *',supporto='Blocchi forati di laterizio sp. min. 80 mm (fino H = 4 m) con 10 mm di intonaco su entrambi i lati',sost={'pregyflam BA13':'PF13@p22'},esposizione='controparete sul lato esposto',note=['* Oltre 4 m in funzione dello spessore del supporto: consultare il Fascicolo Tecnico'])
R(22,'prot_non_portanti','Muratura in laterizio forato','Controparete Pregy CW 65/M50 - 1 PF 15 - LR',['Orditura C50/50 int. 600 mm','Lana di roccia 40 kg/m3 sp. 50 mm','1 pregyflam BA15'],'EI 120',['Ist. Giordano 297101-3447FR',FT11],'8,00 *',supporto='Blocchi forati di laterizio sp. min. 80 mm (fino H = 4 m) con 10 mm di intonaco sul lato non esposto',sost={'pregyflam BA15':'PF15@p22'},esposizione='controparete sul lato esposto',note=['* Oltre 4 m in funzione dello spessore del supporto: consultare il Fascicolo Tecnico'])
R(23,'prot_non_portanti','Muratura in blocchi di calcestruzzo','Controparete Pregy CW 28/S4915 - 1 PF',['Orditura S4915 int. 600 mm vincolata con gancio distanziatore S4915/27 int. 1000 mm','1 pregyflam BA13'],'EI 120',['Ist. Giordano 351087-3914FR',FT11],'8,00 *',supporto='Blocchi di calcestruzzo pieni, monocamera o multicamera, sp. min. 80 mm (fino H = 4 m)',sost={'pregyflam BA13':'PF13@p22'},esposizione='controparete sul lato esposto',note=['* Oltre 4 m in funzione dello spessore del supporto: consultare il Fascicolo Tecnico'])
for classe,h,rif in (('EI 60',12.0,['Ist. Giordano 342212-3849FR',FT17]),('EI 90',5.0,['Ist. Giordano 342212-3849FR',FT17]),('EI 120',4.0,['Ist. Giordano 342212-3849FR'])):
    R(23,'prot_non_portanti','Parete in cartongesso esistente','Riqualifica cartongesso esistente + 2 PF13',['Lastre aggiuntive: 2 pregyflam BA13 avvitate sul lato esposto'],classe,rif,h,supporto='Parete in cartongesso sp. min. 75 mm: orditura minimo C50/50 int. 600 mm e almeno 1 lastra tipo A (EN 520) sp. 12,5 mm per lato',esposizione='fuoco lato lastre aggiuntive')

# ------------------------------------------------------------------ p24 pareti portanti in CLT (carico 42 kN/m)
R(24,'prot_portanti','Parete portante CLT/XLAM','Placcaggio in aderenza 1 PF13 su CLT',['1 pregyflam BA13 avvitata al supporto con viti SNT/45 int. 250 x 600 mm'],'REI 120',['CSI 2299FR'],3.0,35,supporto='Parete portante in legno lamellare incrociato (CLT) sp. 100 mm',esposizione='rivestimento sul lato esposto',note=['Carico applicato 42 kN/m'])
R(24,'prot_portanti','Parete portante CLT/XLAM','Controparete CW 63/M50 - 1 LD - LR su CLT',['Orditura C50/50 int. 600 mm vincolata','Lana di roccia 40 kg/m3 sp. 40 mm','1 ladura plus BA13'],'REI 120',['CSI 2297FR'],3.0,54,supporto='Parete portante in legno lamellare incrociato (CLT) sp. 100 mm',esposizione='controparete sul lato esposto',note=['Carico applicato 42 kN/m','Accessori: scatole elettriche protette con PROMASEAL-PLSK (503)'])

# ------------------------------------------------------------------ p25-26 controsoffitti a membrana / autoportanti
R(25,'membrana','Controsoffitto a membrana sospeso','Pregy CDO S4927/90/40/120 - 2 PF 15',['Doppia orditura S4927: primari int. 90 cm, secondari int. 40 cm','Pendinatura int. 120 cm con gancio con molla per S4915/27 + pendino ad occhiello diam. 3,9 mm','2 pregyflam BA15'],'EI 60 (a<-b)',['Ist. Giordano 288062-3350FR','FT CDOM 001/2013'],None,33,{'pregyflam BA15':'PF15@p22'},esposizione='dal basso (a<-b)')
R(25,'membrana','Controsoffitto a membrana sospeso','Pregy CDO S4927/75/40/60 - 3 PF 15',['Doppia orditura S4927: primari int. 75 cm, secondari int. 40 cm','Pendinatura int. 60 cm con gancio con molla per S4915/27 + pendino ad occhiello diam. 3,9 mm','3 pregyflam BA15'],'EI 90 (a<-b)',['Ist. Giordano 322721-3711FR'],None,36,esposizione='dal basso (a<-b)')
R(25,'membrana','PROMATECT-100X (Promat)','Promat - Controsoffitto a membrana EI 120 2x20',['Doppia orditura S4927: primari int. 75 cm, secondari int. 50 cm','Pendinatura int. 80 cm con gancio con molla per S4915/27 + pendino ad occhiello diam. 3,9 mm','2 x 20 mm PROMATECT-100X'],'EI 120 (a<-b)',['Ist. Giordano 353244-3930FR'],None,33,esposizione='dal basso (a<-b)',note=['Accessori: botole d\'ispezione, faretti, attraversamenti impiantistici','Certificato su MyPromat'])
R(26,'membrana','Controsoffitto autoportante','Pregy C-AUTO125/M75 - 4 PF',['2 pregyflam BA13','Orditura C75/50 dorso-dorso int. 400 mm','2 pregyflam BA13'],'EI 120 (a<->b)',['Ist. Giordano 383049-4131FR','FT SI-016/01/2022'],None,45,esposizione='bidirezionale (a<->b)',luce=3.0,note=['Larghezza illimitata'])
R(26,'membrana','PROMATECT-100X (Promat)','Promat - Controsoffitto autoportante 1x12 + lana di roccia',['1 x 12 mm PROMATECT-100X','Orditura C100/50 x 1 mm dorso-dorso int. 500 mm','Lana di roccia 80 kg/m3 sp. 40+40 mm','1 x 12 mm PROMATECT-100X'],'EI 120 (a<->b)',['Ist. Giordano 379558-4086FR','FT 023/04/2021'],None,43,esposizione='bidirezionale (a<->b)',luce=4.4,note=['Larghezza illimitata','Accessori: botole, faretti, attraversamenti impiantistici, elementi sospesi','Certificato su MyPromat'])
R(26,'membrana','PROMATECT-100X (Promat)','Promat - Controsoffitto autoportante 2x20',['Orditura C100/50 dorso-dorso int. 400 mm','2 x 20 mm PROMATECT-100X'],'EI 120 (a<-b)',['Ist. Giordano 417324-4388FR'],None,31,esposizione='dal basso (a<-b)',luce=4.0,note=['Larghezza illimitata','Lastre in classe A1','Accessori: botole, faretti, elementi sospesi','Certificato su MyPromat'])

# ------------------------------------------------------------------ p27-28 protezione di solai (EN 1365-2)
R(27,'solai','Solaio in laterocemento','Pregy CSO S4927/50/75 - 1 PF 15',['Singola orditura in semi-aderenza: profili S4927 int. 50 cm','Pendinatura int. 75 cm con gancio distanziatore per S4915/27','1 pregyflam BA15'],'REI 120',['Ist. Giordano 298753-3469FR'],supporto='Solaio in laterocemento 16+4 cm non intonacato')
R(27,'solai','Solaio in laterocemento','Pregy CDO S4927/75/40/100 - 1 PF',['Doppia orditura S4927: primari int. 75 cm, secondari int. 40 cm','Pendinatura int. 100 cm con gancio con molla per S4915/27 + pendino ad occhiello diam. 3,9 mm','1 pregyflam BA13','Plenum >= 15 cm'],'REI 120',['Ist. Giordano 305005-3539FR'],supporto='Solaio in laterocemento 16+4 cm non intonacato')
R(27,'solai','PROMATECT-100X (Promat)','Promat - Controsoffitto ispezionabile PROMATECT-100X 12 mm su PregyGrid',['Orditura PregyGrid: principale e secondaria a T 38x24x0,4 mm int. 600 mm','Pendinatura int. 800 mm con pendini ad occhiello diam. 3,9 mm','1 x 12 mm PROMATECT-100X (moduli 595x595 mm)'],'REI 120',['FT 028-10-2022'],supporto='Solaio in laterocemento 16+4 cm non intonacato (applicabile anche a solai in C.A. piani, alveolari/alleggeriti in C.A. e C.A.P., predalles, nervati, lamiera grecata, carpenteria metallica)',note=['Lastre in classe A1','Certificato su MyPromat'])
R(27,'solai','Solaio predalles','Pregy CSO S4927/50/60 - 2 PF 13',['Singola orditura in semi-aderenza: profili S4927 int. 50 cm','Pendinatura int. 60 cm con gancio distanziatore per S4915/27','2 pregyflam BA13'],'REI 120',['Ist. Giordano 275957-3242FR'],supporto='Solaio predalles sp. 20 cm (4+12+4)')
R(28,'solai','Solaio tipo PLASTBAU','Pregy CSO S4915/50/60 - 1 PF 15',['Singola orditura in semi-aderenza: profili S4915 int. 50 cm','Pendinatura int. 60 cm con gancio distanziatore per S4915/27','1 pregyflam BA15'],'REI 180',['CSI 2323FR'],supporto='Solaio in C.A. con pannelli cassero in EPS tipo PLASTBAU sp. 29 cm (20/4 + 5)')
R(28,'solai','Solaio in lamiera grecata collaborante','Pregy CDO S4927/90/40/75 - 2 PF 15',['Doppia orditura S4927: primari int. 90 cm, secondari int. 40 cm','Pendinatura int. 75 cm con gancio distanziatore per S4915/27 + barra filettata M6 con dado e controdado','2 pregyflam BA15','Plenum >= 15 cm','Distanza minima lastre - intradosso travi = 5 cm'],'REI 120',['Ist. Giordano 269134-3195FR'],supporto='Lamiera grecata collaborante con soletta in C.A. spessore totale circa 14 cm, travi in acciaio HEB 100')
R(28,'solai','Solaio in CLT/XLAM','Placcaggio in aderenza 2 PF13 su solaio CLT',['2 pregyflam BA13 fissate con viti SNT/55 e SNT/70'],'REI 120',['CSI 2300FR'],supporto='Solaio in legno lamellare incrociato (CLT) sp. 137 mm')
R(28,'solai','Solaio misto cls e acciaio','Pregy CDO S6027/80/40/100 - 1 AB + LM',['Doppia orditura PregyMetal XT S6027: primari int. 800 mm, secondari int. 400 mm','Pendinatura int. 1000 mm con pendini Nonius','Lana minerale sp. 45 mm','1 aquaboard pro'],'REI 60',['Ist. Giordano 421850-4411FR'],supporto='Solaio misto con soletta in C.A. e travi in carpenteria metallica',note=['Soluzione conforme a RTV 13','Lastre aquaboard pro in classe A1'])

# ------------------------------------------------------------------ p29 acciaio (tabella a parte) e p31-32 scatole elettriche
R(29,'acciaio','Strutture in acciaio','Inscatolamento pregyflam BA13/BA15 su guide U28/28 con Clip CB',['1, 2 o 3 strati di pregyflam BA13 e/o BA15 avvitati su guide U28/28','Guide vincolate alle ali di travi o pilastri mediante Clip CB'],'R 30 / R 60 / R 90 / R 120',['Efectis 10-U-519 A'],supporto='Elementi strutturali in acciaio con sezione a I o H, massivita < 360 m-1',note=['Spessore di protezione in funzione di massivita, temperatura critica e classe R: vedi tabella acciaio'])
for supp, iso, cl in (
    ('Parete a secco sp. >= 125 mm, almeno 2 x 12,5 mm di lastre per lato, lana di roccia >= 60 mm','lana di roccia', {'503':'EI 120','504':'EI 120','506':'EI 120','derivazione 152x196x75':'EI 120','derivazione 152x392x75':'EI 120'}),
    ('Parete a secco sp. >= 125 mm, almeno 2 x 12,5 mm di lastre per lato, lana di vetro di qualsiasi spessore','lana di vetro', {'503':'EI 120','504':'EI 90*','506':'EI 90*','derivazione 152x196x75':None,'derivazione 152x392x75':None}),
    ('Parete a secco sp. >= 125 mm, almeno 2 x 12,5 mm di lastre per lato, non isolata','nessuno', {'503':'EI 120','504':'EI 90*','506':'EI 90*','derivazione 152x196x75':None,'derivazione 152x392x75':None}),
    ('Parete in muratura sp. >= 125 mm','muratura', {'503':'EI 120','504':'EI 120','506':'EI 120','derivazione 152x196x75':'EI 120','derivazione 152x392x75':'EI 120'})):
    R(31 if iso!='muratura' else 32,'scatole','Scatole elettriche','PROMASEAL-PLSK in scatole su '+iso,['Guarnizione intumescente PROMASEAL-PLSK 503/504/506 Wall nella scatola; per le derivazioni 2 x PROMASEAL-PLSK 2,5 mm'],'fino a EI 120',['Ist. Giordano 400581-4282FR'],supporto=supp,esposizione='scatole sul lato esposto e/o non esposto',
      note=['Classi per elemento: '+', '.join(f'{k}: {v or "non classificata"}' for k,v in cl.items())]+(['* Fino a EI 120 per 504, 506 e derivazioni con pannello locale in lana di roccia sp. min. 60 mm (consultare Ufficio Tecnico)'] if iso in ('lana di vetro','nessuno') else []))

# ------------------------------------------------------------------ tabella acciaio (p29, trascritta dall'immagine ingrandita)
def fasce(*t):  # (da, a, protezione)
    return [dict(massivita_da=a, massivita_a=b, protezione=c) for a,b,c in t]
ACCIAIO = {
 'riferimento': 'Efectis 10-U-519 A', 'norma': 'EN 13381-4', 'massivita_max_m-1': 360,
 'nota': 'Valori letti dalla tabella a pagina 29 (fasce di massivita in m-1, passo 10). Flam13 = pregyflam BA13, Flam15 = pregyflam BA15.',
 'Tcr_350': {
   'R15': fasce((40,360,'1 Flam13')),
   'R30': fasce((40,220,'1 Flam13'),(230,350,'2 Flam15'),(360,360,'2 Flam13')),
   'R60': fasce((40,70,'1 Flam13'),(80,90,'1 Flam15'),(100,220,'2 Flam13'),(230,340,'1 Flam13 + 1 Flam15'),(350,360,'2 Flam15')),
   'R90': fasce((40,40,'1 Flam15'),(50,80,'2 Flam13'),(90,100,'1 Flam13 + 1 Flam15'),(110,130,'2 Flam15'),(140,360,'3 Flam13')),
   'R120': fasce((40,40,'2 Flam13'),(50,50,'1 Flam13 + 1 Flam15'),(60,60,'2 Flam15'),(70,100,'3 Flam13'),(110,120,'2 Flam13 + 1 Flam15'),(130,140,'1 Flam13 + 2 Flam15'),(150,360,'3 Flam15')),
 },
 'Tcr_450': {
   'R15': fasce((40,360,'1 Flam13')),
   'R30': fasce((40,330,'1 Flam13'),(340,360,'1 Flam15')),
   'R60': fasce((40,90,'1 Flam13'),(100,130,'1 Flam15'),(140,300,'2 Flam13'),(310,360,'1 Flam13 + 1 Flam15')),
   'R90': fasce((40,50,'1 Flam13'),(60,70,'1 Flam15'),(80,100,'2 Flam13'),(110,120,'1 Flam13 + 1 Flam15'),(130,160,'2 Flam15'),(170,360,'3 Flam13')),
   'R120': fasce((40,40,'1 Flam15'),(50,50,'2 Flam13'),(60,60,'1 Flam13 + 1 Flam15'),(70,80,'2 Flam15'),(90,120,'3 Flam13'),(130,160,'2 Flam13 + 1 Flam15'),(170,220,'1 Flam13 + 2 Flam15'),(230,360,'3 Flam15')),
 },
 'Tcr_550': {
   'R15': fasce((40,360,'1 Flam13')),
   'R30': fasce((40,360,'1 Flam13')),
   'R60': fasce((40,140,'1 Flam13'),(150,200,'1 Flam15'),(210,360,'2 Flam13')),
   'R90': fasce((40,70,'1 Flam13'),(80,90,'1 Flam15'),(100,110,'2 Flam13'),(120,140,'1 Flam13 + 1 Flam15'),(150,190,'2 Flam15'),(200,360,'3 Flam13')),
   'R120': fasce((40,40,'1 Flam13'),(50,50,'1 Flam15'),(60,60,'2 Flam13'),(70,70,'1 Flam13 + 1 Flam15'),(80,90,'2 Flam15'),(100,130,'3 Flam13'),(140,170,'2 Flam13 + 1 Flam15'),(180,240,'1 Flam13 + 2 Flam15'),(250,360,'3 Flam15')),
 },
 'anomalie': ['Tcr 350 R30: a 360 m-1 la tabella riporta 2 Flam13 dopo 2 Flam15 (230-350): DA VERIFICARE sul rapporto'],
}

# ------------------------------------------------------------------ link ai certificati (dai QR del PDF)
LINK = json.load(open(os.path.join(QUI, '..', 'estrazioni', 'antincendio_certificati_url.json'), encoding='utf-8'))
def chiave_rapporto(r):
    # Ist. Giordano: basta il numero di prova (nei nomi file il suffisso -xxxxFR a volte manca)
    m = re.search(r'(\d{6})-\d{4}FR', r)
    if m: return m.group(1)
    m = re.search(r'(\d{2}-[A-Z]-\d{3}|R\d{6}|P\d{6}|\d{5}B|\d{3}-C-\d{2}-\d{3}|\d{3}/C/\d{2}-\d{3}|CSI ?\d{4}FR|RS\d{2}-\d{3}|10-U-519)', r)
    return m.group(1) if m else None
def _norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower().replace('csi ', 'csi'))
# Host che la guida usa ma che non rispondono più: lo stesso file è su www.siniat.it.
# etexassets.azureedge.net (rapporto 351103-3915FR, p. 11 e 14): il dominio non si risolve,
# la copia su siniat.it c'è ed è "D125/M75 - 2 S-tex + 2 PS Plus BA13 - LR" (verificato il 24/09/2026).
HOST_DISMESSI = {'https://etexassets.azureedge.net/': 'https://www.siniat.it/'}
def url_vivo(u):
    for vecchio, nuovo in HOST_DISMESSI.items():
        if u and u.startswith(vecchio): return nuovo + u[len(vecchio):]
    return u

def url_per(rif, pagina):
    if rif.startswith(('FT', 'Rapporto', 'Est.')): return None
    k = chiave_rapporto(rif)
    if not k: return None
    cand = [l for l in LINK if l['file'] and _norm(k) in _norm(l['file'])]
    if not cand: return None
    cand.sort(key=lambda l: abs(l['pagina'] - pagina))
    return url_vivo(cand[0]['url'])

# Rapporti di una configurazione affine: la guida li abbina alla riga insieme al fascicolo
# tecnico, all'EXAP o a un'estensione, ma la parete provata è un'altra. L'elemento provato è
# letto nei rapporti stessi (verifica del 24/09/2026, docs/studio-siniat/verifica-rapporti-2026-09-24.md):
# l'app lo scrive accanto al link, così aprendo il PDF non ci si sorprende.
STEX_LR = 'D75/M50 1+1 solidtex indoor con lana di roccia'
PF_LR = 'D100/M50 2+2 pregyflam BA13 con lana di roccia'
PF_LV = 'D125/M75 2+2 pregyflam BA13 con lana di vetro'
PROVATA = {
    ('Pregy D150/M75 - 6 PSplus', '338285'): 'D125/M75 2+2 pregyplac plus BA13',
    ('Pregy D125/M50 - 6 PS - LM', 'R001815'): 'D100/M50 2+2 pregyplac con lana minerale',
    ('Pregy D130/M75 - 2 PF 15 + 2 PF 13', '381598'): 'D105/M75 1+1 pregyflam BA15',
    ('Pregy D100/M50 - 4 PF 13 - LR', '351340'): STEX_LR,
    ('Pregy D75/M50 - 2 LD - LR', '351340'): STEX_LR,
    ('Pregy D100/M50 - 4 LD - LR', '351340'): STEX_LR,
    ('Pregy D100/M50 - 4 LD - LR', '19056B'): PF_LR,
    ('Pregy D100/M50 - 4 S-tex - LR', '351340'): STEX_LR,
    ('Pregy D125/M50 - 6 PF 13 - LR', '19056B'): PF_LR,
    ('Pregy D150/M75 - 6 PF 13', '381597'): 'D125/M75 2+2 pregyflam BA13',
    ('Pregy D150/M75 - 6 PF 13 - LM', '381599'): PF_LV,
    ('Pregy D175/M75 - 8 PF 13', '344892'): 'D160/M75 3+3 pregyflam BA15',
    ('Pregy D125/M75 - 4 LD - LM', '381599'): PF_LV,
    ('Pregy D125/M75 - 4 S-tex - LM', '381599'): PF_LV,
    ('Pregy D190/M75 - 6 PF 15 + 2 PF 13', '383047'): 'D150/M75 3+3 pregyflam BA13',
    ('Pregy S140/2M50 - 3 S-tex - LR', '351340'): STEX_LR,
    ('Parete esterna aquaboard pro - EI 120', '386318'): 'Solidtex Wall System 240 (solidtex outdoor XT)',
    ('Pregy CW95/M50 - 3 PF15 - LM (opzionale) (fuoco bidirezionale)', 'RS12-076'): 'controparete 3 pregyplac BA18',
    ('Pregy CW95/M50 - 3 PF15 - LM (opzionale) (fuoco lato lastre)', 'RS12-076'): 'controparete 3 pregyplac BA18',
}
PROVATA_USATE = set()
def provata(codice, rif):
    k = (codice, chiave_rapporto(rif))
    if k in PROVATA:
        PROVATA_USATE.add(k)
        return PROVATA[k]
    return None

# ------------------------------------------------------------------ consolidamento per configurazione
configurazioni = OrderedDict()
for r in RIGHE:
    k = (r['sezione'], r['codice'], r['supporto'] or '')
    c = configurazioni.get(k)
    if not c:
        c = OrderedDict(id=f"AF-{len(configurazioni)+1:03d}", sezione=r['sezione'], sezione_nome=SEZIONI[r['sezione']][0],
                        norma_prova=SEZIONI[r['sezione']][1], gruppo=r['gruppo'], orditura=r['orditura'], codice=r['codice'],
                        supporto=r['supporto'], strati=r['strati'], rw_db=r['rw_db'], esposizione=r['esposizione'],
                        classificazioni=[], sostituibilita={}, note=[], pagine=[])
        configurazioni[k] = c
    rif = []
    for x in r['riferimenti']:
        d = OrderedDict(testo=x, url=url_per(x, r['pagina']))
        p = provata(r['codice'], x)
        if p: d['provata'] = p
        rif.append(d)
    c['classificazioni'].append(OrderedDict(classe=r['classe'], hmax_m=r['hmax_m'], luce_max_m=r['luce_max_m'], riferimenti=rif, pagina=r['pagina']))
    for lastra, chiave in r['sostituibilita'].items():
        c['sostituibilita'][lastra] = S[chiave]
    for n in r['note']:
        if n not in c['note']: c['note'].append(n)
    if r['pagina'] not in c['pagine']: c['pagine'].append(r['pagina'])
    if c['rw_db'] is None and r['rw_db'] is not None: c['rw_db'] = r['rw_db']

out = OrderedDict(
  fonte='Siniat - Guida pratica alle soluzioni antincendio, versione Luglio 2026 (Etex Building Performance S.p.A.)',
  avvertenze=[
    'Hmax (#) riferita alla sola prestazione antincendio: l\'orditura va dimensionata per altezza di progetto e azioni secondo NTC 17/01/2018.',
    'Per progettazione e posa consultare Rapporti di Classificazione, Rapporti di Valutazione (EXAP) e Fascicoli Tecnici; certificati scaricabili da www.siniat.it (link riportati).',
    'Sostituibilita\': dove indicato le lastre si possono sostituire anche parzialmente con quelle elencate, di spessore almeno pari a quello testato.',
    'Le prestazioni valgono solo per sistemi realizzati con prodotti Siniat (lastre, orditure, stucchi, accessori).',
    'PROMATECT-100X e PROMASEAL sono prodotti Promat (gruppo Etex): certificati su MyPromat.'],
  righe_manuale=len(RIGHE), configurazioni=list(configurazioni.values()), acciaio=ACCIAIO, sostituibilita_note=S)
json.dump(out, open(os.path.join(QUI,'..','estrazioni','antincendio.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=1)

# ogni voce di PROVATA deve trovare la sua riga: un codice scritto male non passa in silenzio
mancanti = set(PROVATA) - PROVATA_USATE
assert not mancanti, f'PROVATA senza riga: {mancanti}'

# riepilogo
senza_url = [(c['id'], x['testo']) for c in configurazioni.values() for cl in c['classificazioni'] for x in cl['riferimenti'] if x['url'] is None and not x['testo'].startswith(('FT','Rapporto','Est.'))]
print('righe', len(RIGHE), 'configurazioni', len(configurazioni))
print('rapporti senza link:', len(senza_url)); [print('  ', s) for s in senza_url]
EOF_MARKER = True
