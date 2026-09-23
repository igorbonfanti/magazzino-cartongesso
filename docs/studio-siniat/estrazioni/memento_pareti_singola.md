# Memento Siniat 2024 – 01 Pareti a singola orditura

Fonte: `siniat_memento_2024_02.pdf`, pagine PDF **25–35** (stampate 48–69). Testo: `memento_meta/p25_SX.txt` … `p35_DX.txt`. Dati strutturati completi (tutte le varianti, tutte le incidenze) in `memento_pareti_singola.json`.

Metodo: tabelle altezze/fuoco/Rw/peso e incidenze lette dal testo estratto con uno script e confrontate a campione con le immagini delle pagine; le valutazioni a pallini (urti, carico sospeso, prezzo) lette dagli oggetti vettoriali del PDF (cerchio pieno, vuoto, mezzo riempito) e ricontrollate a vista. Immagini di controllo: `img/sing_*.png`.

## 1. Mappa delle pagine

| PDF | lato | pag. stampata | contenuto | id JSON |
|---|---|---|---|---|
| 25 | SX | 48 | copertina sezione "01 Pareti a singola orditura" | — |
| 25 | DX | 49 | pagina vuota | — |
| 26 | SX | 50 | copertina sottosezione "Sistemi con singola lastra e doppia lastra" | — |
| 26 | DX | 51 | Parete a singola orditura - Lastra pregyplac BA13 – `2 PS` | `memento-p26-DX` |
| 27 | SX | 52 | Parete a singola orditura - Lastra pregyplac BA13 – `2 PS - LM` | `memento-p27-SX` |
| 27 | DX | 53 | Parete a singola orditura - Lastra ladura plus BA13 – `2 LD - LM` | `memento-p27-DX` |
| 28 | SX | 54 | Parete a singola orditura - Lastra solidtex indoor – `2 S-tex - LM` | `memento-p28-SX` |
| 28 | DX | 55 | Parete a singola orditura - Lastra pregyflam BA15 – `2 PF15` | `memento-p28-DX` |
| 29 | SX | 56 | Parete a singola orditura - Lastra pregyflam BA15 – `2 PF15 - LR` | `memento-p29-SX` |
| 29 | DX | 57 | Parete a singola orditura - Lastra pregyplac BA13 – `4 PS` | `memento-p29-DX` |
| 30 | SX | 58 | Parete a singola orditura - Lastra pregyplac BA13 – `4 PS - LM` | `memento-p30-SX` |
| 30 | DX | 59 | Parete a singola orditura - Lastre pregyplac BA13 + ladura plus BA13 – `2 PS + 2 LD - LM` | `memento-p30-DX` |
| 31 | SX | 60 | Parete a singola orditura - Lastra ladura plus BA13 – `4 LD - LM` | `memento-p31-SX` |
| 31 | DX | 61 | Parete a singola orditura - Lastre pregyplac BA13 + solidtex indoor – `2 PS + 2 S-tex - LM` | `memento-p31-DX` |
| 32 | SX | 62 | Parete a singola orditura - Lastra solidtex indoor – `4 S-tex - LM` | `memento-p32-SX` |
| 32 | DX | 63 | Parete a singola orditura - Lastra pregyflam BA13 – `4 PF13` | `memento-p32-DX` |
| 33 | SX | 64 | Parete a singola orditura - Lastra pregyflam BA13 – `4 PF13 - LM` | `memento-p33-SX` |
| 33 | DX | 65 | Parete a singola orditura - Lastra pregyflam BA15 – `4 PF15` | `memento-p33-DX` |
| 34 | SX | 66 | Parete a singola orditura - Lastra pregyflam BA15 – `6 PF15` | `memento-p34-SX` |
| 34 | DX | 67 | Parete a singola orditura - Lastre ladura plus BA13 + aquaboard – `2 LD + 2 AB - LM` | `memento-p34-DX` |
| 35 | SX | 68 | Pareti curve - Lastra pregyflex BA6 – `Curva pregyflex BA6` | `memento-p35-SX` |
| 35 | DX | 69 | Pareti per raggi X - Lastra pregyplac BA13 + Lastra pregy-RX – `3 PS + 1 RX - LM` | `memento-p35-DX` |

Totale: **19 schede** = 17 pareti piane a singola orditura + 1 parete curva (pregyflex BA6) + 1 parete per raggi X (pregy-RX, senza tabelle proprie). Per la scheda raggi X ho usato `famiglia: "parete_raggi_x"` (non rientra né in singola orditura "standard" né in curva).

## 2. Tabella di sintesi

Valori di Hmax, Rw e peso calcolati dalle righe della tabella della scheda (tra parentesi quadre la testata quando diversa). Pallini: scala a 4 (● = 1, ◐ = 0,5). Lastre in ordine dal lato 1 al lato 2.

| # | pag. (stamp.) | Sistema | Lastre per lato | Isolante | Sp. mm | Hmax m | Rw dB | EI max | Peso kg/m² | Urti | Carico sosp. | Prezzo | Plus |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 26 DX (51) | Lastra pregyplac BA13<br>`2 PS` | 1 × pregyplac BA13 | — | 75 a 175 | 2,1–10,5 | 32 | EI 30 | 18,0–18,6 | ●○○○ 1/4 | ●○○○ 1/4 | ◐○○○ 0,5/4 | — |
| 2 | 27 SX (52) | Lastra pregyplac BA13<br>`2 PS - LM` | 1 × pregyplac BA13 | Lana minerale sp. 40/60/80/140 mm | 75 a 175 | 2,1–10,5 | 43–47 | EI 30 | 18,5–20,3 | ●○○○ 1/4 | ●○○○ 1/4 | ●○○○ 1/4 | — |
| 3 | 27 DX (53) | Lastra ladura plus BA13<br>`2 LD - LM` | 1 × ladura plus BA13 | Lana minerale sp. 40/60/80/140 mm | 75 a 175 | 2,7–10,8 | 48–54 | EI 60 | 27,5–29,2 | ●●○○ 2/4 | ●●○○ 2/4 | ●◐○○ 1,5/4 | Ambienti umidi, Carichi sospesi |
| 4 | 28 SX (54) | Lastra solidtex indoor<br>`2 S-tex - LM` | 1 × solidtex indoor | Lana minerale sp. 40/60/80/140 mm | 75 a 175 | 2,7–10,8 | 50–55 | EI 60 | 32,7–34,4 | ●●○○ 2/4 | ●●●○ 3/4 | ●●○○ 2/4 | Ambienti umidi, Carichi sospesi |
| 5 | 28 DX (55) | Lastra pregyflam BA15<br>`2 PF15` | 1 × pregyflam BA15 | — | 105 a 180 | 4,1–5,0 | 37 | EI 60 | 28,6–29,3 | ●●○○ 2/4 | — | ●○○○ 1/4 | Resistenza al fuoco |
| 6 | 29 SX (56) | Lastra pregyflam BA15<br>`2 PF15 - LR` | 1 × pregyflam BA15 | Lana di roccia 60 kg/m3 (sp. min. 50 mm) | 105 a 180 | 4,1–5,0 | 50–52 [testata 50 – 51 dB] | EI 90 | 31,6–37,7 | ●●○○ 2/4 | — | ●◐○○ 1,5/4 | Resistenza al fuoco |
| 7 | 29 DX (57) | Lastra pregyplac BA13<br>`4 PS` | 2 × pregyplac BA13 | — | 100 a 200 | 2,8–11,0 | 42–43 | EI 60 | 34,3–35,1 | ●●○○ 2/4 | ●○○○ 1/4 | ●○○○ 1/4 | — |
| 8 | 30 SX (58) | Lastra pregyplac BA13<br>`4 PS - LM` | 2 × pregyplac BA13 | Lana minerale sp. 40/60/80/140 mm | 100 a 200 | 2,8–11,0 | 52–57 | EI 60 | 34,8–36,8 | ●●○○ 2/4 | ●○○○ 1/4 | ●◐○○ 1,5/4 | — |
| 9 | 30 DX (59) | Lastre pregyplac BA13 + ladura plus BA13<br>`2 PS + 2 LD - LM` | 2: ladura plus BA13 (esterna) + pregyplac BA13 (interna) | Lana minerale sp. 40/60/80/140 mm | 100 a 200 | 3,1–11,0 | 57–61 | EI 60 | 43,8–45,8 | ●●●○ 3/4 | ●●○○ 2/4 | ●●○○ 2/4 | Ambienti umidi, Carichi sospesi, Resistenza agli urti |
| 10 | 31 SX (60) | Lastra ladura plus BA13<br>`4 LD - LM` | 2 × ladura plus BA13 | Lana minerale sp. 40/60/80/140 mm | 100 a 200 | 3,4–11,2 [testata 3,4 – 11,0 m] | 59–63 | EI 120 | 52,8–54,8 | ●●●● 4/4 | ●●●○ 3/4 | ●●●○ 3/4 | Ambienti umidi, Carichi sospesi, Isolamento acustico, Resistenza agli urti |
| 11 | 31 DX (61) | Lastre pregyplac BA13 + solidtex indoor<br>`2 PS + 2 S-tex - LM` | 2: solidtex indoor (esterna) + pregyplac BA13 (interna) | Lana minerale sp. 40/60/80/140 mm | 100 a 200 | 3,5–11,0 | 61–63 | EI 60 | 49,0–51,0 | ●●●● 4/4 | ●●●○ 3/4 | ●●◐○ 2,5/4 | Ambienti umidi, Carichi sospesi, Resistenza agli urti, Isolamento acustico |
| 12 | 32 SX (62) | Lastra solidtex indoor<br>`4 S-tex - LM` | 2 × solidtex indoor | Lana minerale sp. 40/60/80/140 mm | 100 a 200 | 3,9–11,5 | 61–64 | EI 120 | 63,2–65,2 | ●●●●● 5/5 | ●●●● 4/4 | ●●●○ 3/4 | Ambienti umidi, Carichi sospesi, Resistenza agli urti, Isolamento acustico |
| 13 | 32 DX (63) | Lastra pregyflam BA13<br>`4 PF13` | 2 × pregyflam BA13 | — | 125 a 200 | 5,0–11,2 | 45 | EI 120 | 45,7–46,4 | ●●○○ 2/4 | — | ●◐○○ 1,5/4 | Resistenza al fuoco |
| 14 | 33 SX (64) | Lastra pregyflam BA13<br>`4 PF13 - LM` | 2 × pregyflam BA13 | Lana minerale sp. 40/60/80/140 mm | 125 a 200 | 5,0–11,2 | 57–58 | EI 120 | 46,4–48,0 | ●●○○ 2/4 | — | ●●○○ 2/4 | Resistenza al fuoco |
| 15 | 33 DX (65) | Lastra pregyflam BA15<br>`4 PF15` | 2 × pregyflam BA15 | — | 135 a 210 | 5,5–12,0 | 48 | EI 120 | 55,3–56,4 | ●●○○ 2/4 | — | ●◐○○ 1,5/4 | Resistenza al fuoco, Grandi altezze |
| 16 | 34 SX (66) | Lastra pregyflam BA15<br>`6 PF15` | 3 × pregyflam BA15 | — | 165 a 240 | 6,0–12,0 | 53 | EI 180 | 82,1–82,7 | ●●●○ 3/4 | — | ●●◐○ 2,5/4 | Resistenza al fuoco, Grandi altezze |
| 17 | 34 DX (67) | Lastre ladura plus BA13 + aquaboard<br>`2 LD + 2 AB - LM` | 2: aquaboard (esterna) + ladura plus BA13 (interna) | Lana minerale sp. 40/60/80/140 mm | 100 a 200 | 3,1–11,0 | 57–62 | EI 60 | 49,5–51,4 | ●●○○ 2/4 | ●●○○ 2/4 | ●●●◐ 3,5/4 | Elevata umidità |
| 18 | 35 SX (68) | Pareti curve - Lastra pregyflex BA6<br>`Curva pregyflex BA6` | 3 × pregyflex BA6 (min. 2 BA6, o 1 BA10/BA13) | Lana di roccia (eventuale) 40 kg/m3 sp. 45 mm | 62 | — | da 49 dB | EI 90 | 32,7 | — | — | — | — |
| 19 | 35 DX (69) | Pareti per raggi X - Lastra pregyplac BA13 + Lastra pregy-RX<br>`3 PS + 1 RX - LM` | pregy-RX + pregyplac BA13 (1–2 per lato) | Lana minerale (eventuale) | 75 a 200 | — | da 49 dB | — | — | — | — | — | — |

Note alla tabella:
- Hmax con **montanti singoli e interasse 600 mm** è il valore minimo di ogni riga; il massimo è sempre montanti accoppiati a 300 mm. Il dimensionamento vale per carico orizzontale Hk = 1 kN/m (DM 17/01/2018) e pressione ±20 daN/m² (nota 2).
- "Carico sosp. —" = la voce non è stampata in testata (schede pregyflam e pareti speciali), non significa valore zero.
- #12 (4 S-tex – LM): la resistenza agli urti è disegnata con **5 pallini pieni** (unico caso; altrove la scala è di 4): da leggere come "massimo, fuori scala".
- Ideale per (icone): #3 Commerciale, Uffici; #4 Commerciale, Residenziale; #5 Commerciale, Industria; #6 Commerciale, Industria; #9 Residenziale, Scuola, Albergo, Commerciale, Ospedali RSA; #10 Residenziale, Scuola, Albergo; #11 Residenziale, Scuola, Albergo; #12 Residenziale, Scuola, Albergo; #13 Commerciale, Industria; #14 Commerciale, Industria, Ospedali RSA; #15 Commerciale, Industria; #16 Commerciale, Industria; #17 Docce, Piscine e SPA. Schede con testo invece di icone: #1–#2 "divisori interni senza requisiti acustici…", #7–#8 "divisori interni con limitati requisiti acustici…", #18 opere decorative curve (raggio ≥ 30 cm), #19 sale raggi X / radiologia / studi dentistici.

## 3. Resistenza al fuoco per variante (limiti di altezza)

Nella colonna fuoco il manuale usa: ✔ = classe valida per tutte le altezze della riga; `Hmax=x m` = classe valida solo fino a x m; `-` = non disponibile. "(]/][)" = vale per montante singolo e accoppiato.

| # | Sistema | Classe | ✔ su tutta l'altezza tabellata | Limitata in altezza | Non disponibile | Prescrizione (note) |
|---|---|---|---|---|---|---|
| 1 | `2 PS` | EI 30 | D75/M50 (][) | Hmax 5,0 m: D100/M75 (][), D125/M100 (][), D175/M150 (][) | D75/M50 (]), D100/M75 (]), D125/M100 (]), D175/M150 (]) | — |
| 2 | `2 PS - LM` | EI 30 | D75/M50 (]/][), D100/M75 (]) | Hmax 5,0 m: D100/M75 (][), D125/M100 (]/][), D175/M150 (]/][) | — | ** Prevedere lana di vetro min. 13,5 kg/m3 |
| 3 | `2 LD - LM` | EI 30 | D75/M50 (]/][) | Hmax 5,0 m: D100/M75 (]/][), D125/M100 (]/][), D175/M150 (]/][) | — | ** Prevedere lana di vetro min. 13,5 kg/m3 |
| 3 | `2 LD - LM` | EI 60 | D75/M50 (]/][) | Hmax 5,2 m: D100/M75 (]/][), D125/M100 (]/][), D175/M150 (]/][) | — | *** Prevedere lana di roccia min. 40 kg/m3 |
| 4 | `2 S-tex - LM` | EI 30 | D75/M50 (]/][) | Hmax 5,0 m: D100/M75 (]/][), D125/M100 (]/][), D175/M150 (]/][) | — | ** Prevedere lana di vetro min. 13,5 kg/m3 |
| 4 | `2 S-tex - LM` | EI 60 | D75/M50 (]/][) | Hmax 5,2 m: D100/M75 (]/][), D125/M100 (]/][), D175/M150 (]/][) | — | *** Prevedere lana di roccia min. 40 kg/m3 |
| 5 | `2 PF15` | EI 60 | D105/M75 (]/][), D130/M100 (]/][), D180/M150 (]/][) | — | — | — |
| 6 | `2 PF15 - LR` | EI 60 | D105/M75 (]/][), D130/M100 (]/][), D180/M150 (]/][) | — | — | — |
| 6 | `2 PF15 - LR` | EI 90 | — | Hmax 3,0 m: D105/M75 (]/][), D130/M100 (]/][), D180/M150 (]/][) | — | — |
| 7 | `4 PS` | EI 60 | D100/M50 (]) | Hmax 4,0 m: D100/M50 (][), D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | — |
| 8 | `4 PS - LM` | EI 60 | D100/M50 (]/][), D125/M75 (]) | Hmax 6,0 m: D125/M75 (][), D150/M100 (]/][), D200/M150 (]/][) | — | — |
| 9 | `2 PS + 2 LD - LM` | EI 60 | D100/M50 (]/][), D125/M75 (]) | Hmax 6,0 m: D125/M75 (][), D150/M100 (]/][), D200/M150 (]/][) | — | — |
| 10 | `4 LD - LM` | EI 60 | D100/M50 (]/][), D125/M75 (]) | Hmax 6,0 m: D125/M75 (][), D150/M100 (]/][), D200/M150 (]/][) | — | — |
| 10 | `4 LD - LM` | EI 120 | D100/M50 (]/][) | Hmax 5,0 m: D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | * Prevedere lana di roccia min. 40 kg/m3 |
| 11 | `2 PS + 2 S-tex - LM` | EI 60 | D100/M50 (]/][), D125/M75 (]) | Hmax 6,0 m: D125/M75 (][), D150/M100 (]/][), D200/M150 (]/][) | — | — |
| 12 | `4 S-tex - LM` | EI 60 | D100/M50 (]/][) | Hmax 6,0 m: D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | — |
| 12 | `4 S-tex - LM` | EI 120 | D100/M50 (]) | Hmax 5,0 m: D100/M50 (][), D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | * Prevedere lana di roccia min. 40 kg/m3 |
| 13 | `4 PF13` | EI 45 | D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | — | — |
| 13 | `4 PF13` | EI 120 | — | Hmax 5,0 m: D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | — |
| 14 | `4 PF13 - LM` | EI 45 | D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | — | — |
| 14 | `4 PF13 - LM` | EI 120 | — | Hmax 5,0 m: D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | — |
| 15 | `4 PF15` | EI 60 | D135/M75 (]/][), D160/M100 (]/][), D210/M150 (]/][), D210/M150x1 (]/][) | — | — | — |
| 15 | `4 PF15` | EI 120 | — | Hmax 6,9 m: D210/M150 (]/][), D210/M150x1 (]/][) | D135/M75 (]/][), D160/M100 (]/][) | * Per soluzione EI 120 prevedere in sommità il giunto pregyIndustry |
| 16 | `6 PF15` | EI 120 | D165/M75 (]/][), D190/M100 (]/][), D240/M150 (]/][) | — | — | — |
| 16 | `6 PF15` | EI 180 | — | Hmax 5,0 m: D165/M75 (]/][), D190/M100 (]/][), D240/M150 (]/][) | — | — |
| 17 | `2 LD + 2 AB - LM` | EI 30 | D100/M50 (]/][) | Hmax 5,0 m: D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | * Prevedere lana di vetro min. 13,5 kg/m3 |
| 17 | `2 LD + 2 AB - LM` | EI 60 | D100/M50 (]/][) | Hmax 5,2 m: D125/M75 (]/][), D150/M100 (]/][), D200/M150 (]/][) | — | ** Prevedere lana di roccia min. 40 kg/m3 |
| 18 | `Curva pregyflex BA6` | EI 90 | — | Hmax 4,0 m: D89/M50 (]) | — | — |

Lettura per il selettore: la classe EI richiesta va verificata **per variante e per altezza**; la testata "fino EI xx" è solo il massimo teorico. Esempi: 2 PS senza lana ha EI 30 **solo con montanti accoppiati**; 4 PS senza lana ha EI 60 al massimo fino a 4,0 m (con lana, 4 PS – LM, fino a 6,0 m); 2 PF15 + lana di roccia arriva a EI 90 solo fino a 3,0 m; 4 PF15 dà EI 120 solo con montanti C150 fino a 6,9 m (e con giunto di testa pregyIndustry).

## 4. Particolarità, prescrizioni e regole utili

### 4.1 Altezze
- **Singola lastra per lato (1 strato): altezza consigliata ≤ 5,0 m** per limitare le micro-fessurazioni dei giunti (nota * di p26 DX, p27 SX, p27 DX, p28 SX). In tabella le altezze oltre questo consiglio sono marcate con asterisco (campo `hmax_note`): il motore dovrebbe segnalarle o proporre il sistema a doppia lastra.
- pregyflam BA15 a lastra singola (2 PF15, p28 DX / p29 SX): altezze tabellate **tutte bloccate a 5,0 m**, e montanti C50 non ammessi (riga D80/M50 vuota).
- Nei sistemi pregyflam (2 PF15, 4 PF13, 4 PF15, 6 PF15) il montante minimo è **C75**: le righe con C50 esistono ma sono tutte "-".
- 4 PF15 (p33 DX) ha una variante in più **D210/M150x1** (montante "C150/50x1") che porta Hmax a **12,0 m**; il suffisso x1 non è spiegato in pagina (presumibilmente acciaio 1 mm – DA VERIFICARE).
- Montanti accoppiati `][`: aumentano l'altezza di circa uno "scalino" di montante (es. 2 PS D75/M50: 2,1 → 2,7 m a i=600) e raddoppiano l'incidenza montanti.
- Il glifo del montante singolo nel PDF è a volte `]` e a volte `[` (stesso significato; normalizzato in `montanti: "singolo"`, glifo originale in `simbolo_config`).

### 4.2 Isolante: prescrizioni legate al fuoco
- Lana minerale standard nei sistemi "- LM": spessori **40/60/80/140 mm** (in pratica abbinati a M50/M75/M100/M150 – mia lettura, il manuale elenca solo gli spessori). Incidenza 1,05 m²/m².
- Pareti a lastra singola con lana (2 PS / 2 LD / 2 S-tex – LM) e 2 LD + 2 AB: **EI 30 richiede lana di vetro ≥ 13,5 kg/m³**, **EI 60 richiede lana di roccia ≥ 40 kg/m³**.
- 4 LD – LM e 4 S-tex – LM: **EI 120 con lana di roccia ≥ 40 kg/m³** (asterisco stampato solo su alcune celle: applicarlo prudenzialmente a tutto l'EI 120 – DA VERIFICARE).
- 2 PF15 – LR: **lana di roccia 60 kg/m³, sp. min. 50 mm** (EI 90 fino a 3,0 m).
- 4 PS – LM, 2 PS + 2 LD, 2 PS + 2 S-tex, 4 PF13 – LM: nessuna densità prescritta in pagina.
- Senza lana (2 PS, 2 PF15, 4 PS, 4 PF13, 4 PF15, 6 PF15) l'Rw non cresce (o cresce di 1 dB) con la larghezza del montante: 32 / 37 / 42–43 / 45 / 48 / 53 dB. Con lana invece sale con il montante; il guadagno dato dalla lana è circa **+11…15 dB** (2 PS 32 → 43–47; 4 PS 42–43 → 52–57; 4 PF13 45 → 57–58).

### 4.3 Sostituzioni di lastra indicate dal manuale
- Classe **A1** di reazione al fuoco: pregyplac → **pregyplac A1 BA13**; ladura plus → **ladura A1 BA13**; pregyflam BA15 → **pregyflam A1 BA15**; pregyflam BA13 → **pregyflam A1 BA13** (p33 SX; in p32 DX è stampato "A1 BA15", probabile refuso).
- **Ambienti umidi**: nei sistemi pregyplac (2 PS, 2 PS–LM, 4 PS, 4 PS–LM, curve) → **pregydro H2 BA13**.
- ladura plus e solidtex indoor hanno di serie il badge "Ambienti umidi" (nessuna sostituzione richiesta).
- **Elevata umidità / docce / piscine**: sistema dedicato 2 LD + 2 AB (aquaboard esterna) con orditura **pregymetalaquaboard**: interni a elevata umidità → profili pregymetalaquaboard + accessori C3; piscine e SPA → profili e accessori **C5**. Finitura con stucco in pasta aquaboard (1 kg/m²) e banda in rete aquaboard (1,8 m/m²).

### 4.4 Composizione e viti
- Sistemi misti: la lastra "speciale" sta **all'esterno** (ladura plus, solidtex indoor, aquaboard), il pregyplac/ladura all'interno.
- Viti per strato: 1° strato 25 mm (SNT, ladura o S-tex 32 per solidtex), 2° strato 35 mm (SNT/ladura), 42 mm (S-tex, aquaboard), 45 mm (pregyflam BA15), 3° strato 55 mm (6 PF15). Con più strati il 1° (e 2°) strato ha circa metà viti, l'ultimo strato il numero pieno (vedi § 5.2).

### 4.5 Pareti curve (p35 SX)
- Interasse montanti **≤ 1/5 del raggio** di curvatura (fino a 300 cm), 60 cm oltre 300 cm; guide **pregymetal flex**.
- Minimi: **pregyflex BA6 ≥ 2 lastre per lato**; pregyplac BA10 o BA13 ≥ 1 lastra per lato.
- Preparazione (tabella a icone): pregyflex BA6 → raggio 30–70 cm precurvatura dopo bagnatura energica, 70–100 cm bagnatura leggera, ≥100 cm a secco; pregyplac BA10 → non per 30–70, 70–100 energica, 100–150 leggera, ≥150 a secco; pregyplac BA13 → non sotto 100, 100–150 energica, 150–200 leggera, ≥200 a secco.
- Unica variante prestazionale: D89/M50, C50/50 singolo, interasse max 195 mm, **3 BA6 per lato**, EI 90 con Hmax 4,0 m, Rw 49 dB (con lana), ≈ 32,7 kg/m².
- Incidenze proprie (colonne "lastra singola PS BA13" e "lastra doppia PS BA6/10/13", montante singolo): vedi § 5.4.

### 4.6 Pareti per raggi X (p35 DX)
- Lastra **pregy-RX** (accoppiata a lamina di piombo) + pregyplac BA13; piombo in spessori standard **5/10, 10/10, 20/10, 30/10** (fuori standard a richiesta; lo spessore lo decide il progettista).
- Il piombo va sul lato da cui arrivano i raggi, rivolto verso l'intercapedine; le teste delle viti si schermano con **profilo a L in piombo** sull'anima dei montanti oppure (doppia lastra, tipo 2) con **strisce adesive di piombo** sulle file di viti e seconda lastra incollata con colla P120.
- Nessuna tabella: dimensionamento e incidenze **come la parete singola orditura pregyplac BA13 con 1 o 2 lastre per lato**; grandi altezze → ufficio tecnico. Resistenza al fuoco non dichiarata.

## 5. Incidenze medie – confronto per il motore di calcolo

Condizioni (nota 3): **per m² di parete, altezza 3 m, vuoto per pieno, sfrido 5%, stuccatura dei soli strati a vista, finitura Q2**. Valori espressi come ]/][ (montante singolo / accoppiato). Nel JSON: `incidenze_medie.voci[]` con i60/i40/i30 × singolo/accoppiato.

### 5.1 Voci identiche in tutte le 17 pareti piane

| Voce | Unità | i = 60 cm | i = 40 cm | i = 30 cm |
|---|---|---|---|---|
| Guide pregymetal | m/m² | 0,7 | 0,7 | 0,7 |
| Montanti pregymetal | m/m² | 1,8 / 3,5 | 2,6 / 5,3 | 3,5 / 7,0 |
| Banda in polietilene | m/m² | 0,7 | 0,7 | 0,7 |
| Stucco per giunti Siniat | kg/m² | 0,7 | 0,7 | 0,7 |
| Nastro per giunti | m/m² | 1,8 | 1,8 | 1,8 |
| Isolante (quando presente) | m²/m² | 1,05 | 1,05 | 1,05 |

Eccezione: 2 LD + 2 AB (aquaboard) usa guide/montanti **pregymetalaquaboard** (stesse quantità), **stucco in pasta aquaboard 1 kg/m²** e **banda in rete aquaboard 1,8 m/m²** al posto di stucco/nastro standard. Stucco e nastro **non aumentano** con il numero di strati (si stucca solo lo strato a vista).

### 5.2 Lastre e viti per sistema

| # | Sistema | Lastre m²/m² | Viti (i60 ]/][ · i40 ]/][ · i30 ]/][) | Isolante |
|---|---|---|---|---|
| 1 | `2 PS` | pregyplac BA13: 2,1 | SNT 25 mm: 20/30 · 25/40 · 35/50 | — |
| 2 | `2 PS - LM` | PregyPlac BA13: 2,1 | SNT 25 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |
| 3 | `2 LD - LM` | ladura plus BA13: 2,1 | ladura 25 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |
| 4 | `2 S-tex - LM` | solidtex indoor: 2,1 | S-tex 32 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |
| 5 | `2 PF15` | pregyflam BA15: 2,1 | SNT 25 mm: 20/30 · 25/40 · 35/50 | — |
| 6 | `2 PF15 - LR` | pregyflam BA15: 2,1 | SNT 25 mm: 20/30 · 25/40 · 35/40 ⚠ | lana di roccia 1,05 |
| 7 | `4 PS` | pregyplac BA13: 4,2 | SNT 25 mm: 10/15 · 15/20 · 15/30<br>SNT 35 mm: 20/30 · 25/40 · 35/50 | — |
| 8 | `4 PS - LM` | pregyplac BA13: 4,2 | SNT 25 mm: 10/15 · 15/20 · 15/30<br>SNT 35 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |
| 9 | `2 PS + 2 LD - LM` | pregyplac BA13: 2,1<br>ladura plus BA13: 2,1 | SNT 25 mm: 10/15 · 15/20 · 15/30<br>ladura 35 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |
| 10 | `4 LD - LM` | ladura plus BA13: 4,2 | ladura 25 mm: 10/15 · 15/20 · 15/30<br>ladura 35 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |
| 11 | `2 PS + 2 S-tex - LM` | pregyplac BA13: 2,1<br>solidtex indoor: 2,1 | SNT 25 mm: 10/15 · 15/20 · 15/30<br>S-tex 42 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |
| 12 | `4 S-tex - LM` | solidtex indoor: 4,2 | S-tex 32 mm: 10/15 · 15/20 · 15/30<br>S-tex 42 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |
| 13 | `4 PF13` | pregyflam BA13: 4,2 | SNT 25 mm: 10/15 · 15/20 · 15/30<br>SNT 35 mm: 20/30 · 25/40 · 35/50 ⚠ | — |
| 14 | `4 PF13 - LM` | pregyflam BA13: 4,2 | SNT 25 mm: 10/15 · 15/20 · 15/30<br>SNT 35 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |
| 15 | `4 PF15` | pregyflam BA15: 4,2 | SNT 25 mm: 10/15 · 15/20 · 15/30<br>SNT 45 mm: 20/30 · 25/40 · 35/50 | — |
| 16 | `6 PF15` | pregyflam BA15: 6,3 | SNT 25 mm: 10/15 · 15/20 · 15/30<br>SNT 45 mm: 10/15 · 15/20 · 15/30<br>SNT 55 mm: 20/30 · 25/40 · 35/50 | — |
| 17 | `2 LD + 2 AB - LM` | aquaboard: 2,1<br>ladura plus BA13: 2,1 | ladura 25 mm: 10/15 · 15/20 · 15/30<br>aquaboard 42 mm: 20/30 · 25/40 · 35/50 | lana minerale 1,05 |

⚠ = valore anomalo segnalato nel JSON (`nota`): 2 PF15 – LR, SNT 25 a i30 ][ = 40 (altrove 50); 4 PF13, unità "m" stampata per viti SNT 35 (letta come cad.).

Schema ricorrente delle viti (cad./m², ]/][):

| Configurazione | i = 60 | i = 40 | i = 30 |
|---|---|---|---|
| 1 lastra per lato (unico tipo di vite) | 20 / 30 | 25 / 40 | 35 / 50 |
| 2 lastre per lato – vite 1° strato | 10 / 15 | 15 / 20 | 15 / 30 |
| 2 lastre per lato – vite 2° strato | 20 / 30 | 25 / 40 | 35 / 50 |
| 3 lastre per lato – 1° e 2° strato (ciascuno) | 10 / 15 | 15 / 20 | 15 / 30 |
| 3 lastre per lato – 3° strato | 20 / 30 | 25 / 40 | 35 / 50 |

### 5.3 Come si ricostruiscono i numeri (mia verifica, non scritta nel manuale)

I valori tornano esattamente con queste formule (h = 3 m, sfrido 1,05), utili per scalare ad altre altezze:
- lastre = n. lastre totali (due facce) × 1,05 → 2,1 / 4,2 / 6,3 m²/m²;
- guide = 2 guide × 1,05 / h = 0,70 m/m² a 3 m → **dipende dall'altezza** (a 2,7 m ≈ 0,78; a 4 m ≈ 0,53); la banda in polietilene 0,7 segue la stessa logica (sotto le guide);
- montanti = 1,05 / interasse → 1,75 (≈1,8) · 2,63 (≈2,6) · 3,5 m/m²; accoppiati ×2 → 3,5 · 5,3 · 7,0 (indipendenti dall'altezza, vuoto per pieno);
- nastro = 2 facce × (1 giunto ogni 1,20 m) × 1,05 ≈ 1,75 → 1,8 m/m²; stucco 0,7 kg/m² = ~0,35 kg per m² di faccia a vista (Q2);
- isolante = 1,05 m²/m² (uno strato).
Questa lettura è coerente su tutte le 17 schede, ma resta un'interpretazione: per preventivi con altezze molto diverse da 3 m conviene ricalcolare guide e banda in funzione di h.

### 5.4 Pareti curve (p35 SX) – incidenze proprie

| Voce | Unità | Lastra singola PS BA13 (i60 · i40 · i30) | Lastra doppia PS BA6/10/13 (i60 · i40 · i30) |
|---|---|---|---|
| Lastra pregyplac | m² | 2,1 | 4,2 |
| Guide pregymetal flex | m | 0,7 | 0,7 |
| Montanti pregymetal | m | 3,0 · 3,8 · 5,4 | 3,0 · 3,8 · 5,4 |
| Viti SNT 25 mm | cad. | 30 · 40 · 50 | 15 · 20 · 25 |
| Viti SNT 35 mm | cad. | — · — · — | 30 · 40 · 50 |
| Banda in polietilene | m | 0,7 | 0,7 |
| Stucco per giunti Siniat | kg | 0,7 | 0,7 |
| Nastro per giunti | m | 3,0 | 3,0 |
| Isolante in lana di roccia | m² | 1,05 | 1,05 |

Differenze rispetto alle pareti piane: montanti 3,0 / 3,8 / 5,4 m/m² (invece di 1,8 / 2,6 / 3,5), nastro 3,0 m/m² (invece di 1,8), guide "flex". La colonna "doppia" copre 2 lastre per lato: la variante tabellata con 3 BA6 per lato richiederebbe ~6,3 m²/m² di lastra (non indicato – DA VERIFICARE). La nota 3 (condizioni) è richiamata ma non stampata su questa pagina.

## 6. Punti DA VERIFICARE / anomalie del manuale

- #6 `memento-p29-SX` (p. stampata 56): testata Rw '50 – 51 dB' ma in tabella D180/M150 = 52 dB.
- #6 `memento-p29-SX` (p. stampata 56): incidenza viti SNT 25 mm a i=30 cm con montanti accoppiati = 40 (in tutte le altre schede 50): probabile refuso, trascritto com'è.
- #10 `memento-p31-SX` (p. stampata 60): testata Hmax '3,4 – 11,0 m' ma in tabella D200/M150 ][ a i=30 cm = 11,2 m.
- #10 `memento-p31-SX` (p. stampata 60): Asterisco (lana di roccia ≥ 40 kg/m3) stampato solo sulle celle EI 120 di D100/M50; per prudenza applicarlo a tutto l'EI 120 (DA VERIFICARE su Guida antincendio).
- #12 `memento-p32-SX` (p. stampata 62): Asterisco (lana di roccia ≥ 40 kg/m3) stampato solo sulle celle EI 120 di D100/M50; per prudenza applicarlo a tutto l'EI 120 (DA VERIFICARE).
- #13 `memento-p32-DX` (p. stampata 63): la nota A1 cita 'pregyflam A1 BA15' in una scheda con lastre BA13 (nella scheda gemella p33 SX è 'pregyflam A1 BA13').
- #13 `memento-p32-DX` (p. stampata 63): colonne fuoco intestate 'EI 45' (✔ su tutte le altezze) e 'EI 120' (Hmax 5,0 m): classe EI 45 insolita, confermare sulla Guida antincendio.
- #13 `memento-p32-DX` (p. stampata 63): in incidenze 'Viti SNT 35 mm' ha unità 'm' (refuso per 'cad.'); nel JSON riportato 'cad.' con nota.
- #14 `memento-p33-SX` (p. stampata 64): colonne fuoco 'EI 45' / 'EI 120' come nella versione senza lana (p32 DX).
- #15 `memento-p33-DX` (p. stampata 65): Variante aggiuntiva D210/M150x1 con montante 'C150/50x1' (Hmax fino a 12,0 m): il suffisso 'x1' non è spiegato nella pagina, presumibilmente montante spessore 1 mm (DA VERIFICARE).
- #15 `memento-p33-DX` (p. stampata 65): riga D110/M50 con Sp. = 100 mm (refuso: 4x15+50 = 110); riga comunque non disponibile ('-').
- #16 `memento-p34-SX` (p. stampata 66): riga D140/M50 con Sp. = 100 mm (refuso: 6x15+50 = 140); riga non disponibile ('-').
- #18 `memento-p35-SX` (p. stampata 68): spessore minimo 'da 62 mm' corrisponde a 1 lastra da 6 mm per lato su montante 50, mentre la regola chiede min. 2 BA6 per lato.
- Tutte le classi di fuoco vanno confermate con la "Guida pratica alle soluzioni antincendio" e i rapporti di classificazione (nota 1 di ogni scheda): il Memento non riporta numeri di rapporto.

## 7. Note comuni a tutte le schede

- **nota_1_fuoco**: Verificare sempre la configurazione dei sistemi resistenti al fuoco sull'ultima versione della 'Guida pratica alle soluzioni antincendio' e sui Rapporti di Classificazione / Fascicoli Tecnici specifici.
- **nota_2_hmax**: Hmax calcolate per sovraccarico orizzontale lineare Hk = 1 kN/m (DM 17/01/2018) e pressione uniforme +/- 20 daN/m².
- **nota_3_incidenze**: Quantità medie per m² di parete alta 3 m, calcolate vuoto per pieno con sfrido 5%, stuccando solo gli strati di lastre a vista, finitura Q2.
- **validita**: Prestazioni valide solo per sistemi interamente Siniat (lastre, orditure, stucchi, accessori).
- **nota_singola_lastra**: Per le pareti a singola lastra per lato il manuale consiglia di non superare 5,0 m di altezza (micro-fessurazioni sui giunti).
- Riquadro sostenibilità (tutte le schede tranne raggi X): EPD, Cradle to Cradle Bronze, Indoor Air Comfort Gold (Eurofins), contenuto di riciclato validato ICMQ, PregyGreenService (ritiro e riciclo scarti in gesso).
