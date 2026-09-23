# Memento Siniat 2024 — Pareti a doppia orditura (sez. 02) e Contropareti (sez. 03)

**Fonte:** `siniat_memento_2024_02.pdf`, pagine PDF 36–46 (doppie pagine: metà SX = pagina stampata 2N−2, metà DX = 2N−1).  
**Dati strutturati:** `memento_doppia_contropareti.json` (stesso prefisso, array `sistemi`, 18 schede).  
**Metodo:** testo da `memento_meta/pNN_SX|DX.txt`; ogni metà pagina renderizzata in PNG (`img/dc_pNN_SX|DX.png`) per controllare tabelle, icone e disegni; le valutazioni a pallini sono state lette dagli oggetti vettoriali del PDF (cerchi pieni/vuoti, mezzi riempimenti) e ricontrollate a vista. Un confronto automatico JSON ↔ testo (righe varianti, simboli fuoco, incidenze) non ha dato differenze.

| Sezione | Copertina | Schede | Pagine stampate |
|---|---|---|---|
| 02 Pareti a doppia orditura | PDF p36 (pp. 70–71) | PDF p37–39 (6 schede) | 72–77 |
| 03 Contropareti | PDF p40 (pp. 78–79) | PDF p41–46 (12 schede: 9 vincolate, 1 riqualifica al fuoco, 2 setti) | 80–91 |

> Nessuna scheda di **controparete autoportante** nel Memento: la sezione 03 contiene solo contropareti vincolate al supporto, la tabella di riqualifica al fuoco e i setti autoportanti (per cavedi). Le coperture p36/p40 contengono solo titolo e numero di pagina.

## 1. Sintesi di tutti i sistemi

Valutazioni a pallini: pieni/totali (◐ = mezzo pallino). "—" = voce assente nella scheda.

| ID | Pag. | Famiglia | Sistema / codice | Lastre | Sp. mm | Hmax m | Rw dB | Fuoco | Antieffr. | Urti | Carichi sospesi | Prezzo | Peso kg/m² |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| memento-p37-SX | 37 SX / 72 | parete doppia orditura | Lastra pregyplac BA13 — `PREGY S(173/223/273) / 2xM(50/75/100) – 5 PS - LM` | 5× pregyplac BA13 | 173–273 | 2,0 - 7,0 | 62 – 63 | fino EI 30 | — | ●●○○ (2/4) | ●○○○ (1/4) | ●●◐○ (2,5/4) | 44,4–45,5 |
| memento-p37-DX | 37 DX / 73 | parete doppia orditura | Lastre pregyplac BA13 + ladura plus BA13 — `PREGY S(173/223/273) / 2xM(50/75/100) – 3 LD + 2 PS - LM` | 3× ladura plus BA13 + 2× pregyplac BA13 | 173–273 | 2,3 - 7,0 | 64 – 65 | fino EI 120 | fino RC2 | ●●●○ (3/4) | ●●○○ (2/4) | ●●●○ (3/4) | 57,8–59,0 |
| memento-p38-SX | 38 SX / 74 | parete doppia orditura | Lastra ladura plus BA13 — `PREGY S(173/223/273) / 2xM(50/75/100) – 5 LD - LM` | 5× ladura plus BA13 | 173–273 | 2,3 - 7,0 | 69 – 70 | fino EI 120 | fino RC2 | ●●●● (4/4) | ●●●○ (3/4) | ●●●◐ (3,5/4) | 66,8–68,0 |
| memento-p38-DX | 38 DX / 75 | parete doppia orditura | Lastre solidtex indoor — `PREGY S(173/223/273) / 2xM(50/75/100) – 3 S-tex - LM` | 3× solidtex indoor | 148–248 | 2,2 - 7,0 | 66 – 67 | fino EI 60 | fino RC2 | ●●○○ (2/4) | ●●●○ (3/4) | ●●●○ (3/4) | 49,3–50,4 |
| memento-p39-SX | 39 SX / 76 | parete doppia orditura | Lastre pregyplac BA13 + solidtex indoor — `PREGY S(173/223/273) / 2xM(50/75/100) – 3 S-tex + 2 PS - LM` | 3× solidtex indoor + 2× pregyplac BA13 | 173–273 | 2,5 - 7,0 | 67 – 69 | fino EI 120 | fino RC2 | ●●●● (4/4) | ●●●○ (3/4) | ●●●◐ (3,5/4) | 65,6–66,8 |
| memento-p39-DX | 39 DX / 77 | parete doppia orditura | Lastra solidtex indoor — `PREGY S(173/223/273) / 2xM(50/75/100) – 5 S-tex - LM` | 5× solidtex indoor | 173–273 | 2,9 - 8,0 | 72 – 74 | fino EI 120 | fino RC3 | ●●●●● (5/5) | ●●●● (4/4) | ●●●● (4/4) | 79,8–81,0 |
| memento-p41-SX | 41 SX / 80 | controparete vincolata | Lastra pregyplac BA13 — `PREGY CW(28/40/63/88/113/163) S(4915/27) M(50/75/100/150) - 1 PS con o senza isolante` | 1× pregyplac BA13 | 28–163 | n.d. (vincoli ogni 80–150 cm) | 54–63 (sistema con supporto 44 dB; ΔRw ≤ 19) | — | — | ●○○○○ (1/5) | necessari rinforzi | — | 9,0–12,0 |
| memento-p41-DX | 41 DX / 81 | controparete vincolata | Lastra pregyplac BA13 — `PREGY CW(40/52/75/100/125/175) S(4915/27) M(50/75/100/150) - 2 PS con o senza isolante` | 2× pregyplac BA13 | 40–175 | n.d. (vincoli ogni 80–150 cm) | 57–66 (sistema con supporto 44 dB; ΔRw ≤ 22) | — | — | ●●○○○ (2/5) | necessari rinforzi | — | 18,0–21,0 |
| memento-p42-SX | 42 SX / 82 | controparete vincolata | Lastra ladura plus BA13 — `PREGY CW(28/40/63/88/113/163) S(4915/27) M(50/75/100/150) - 1 LD con o senza isolante` | 1× ladura plus BA13 | 28–163 | n.d. (vincoli ogni 80–150 cm) | 58–66 (sistema con supporto 46 dB; ΔRw ≤ 20) | — | — | ●●○○○ (2/5) | ●●○○ (2/4) | — | 13,0–16,0 |
| memento-p42-DX | 42 DX / 83 | controparete vincolata | Lastra pregyplac BA13 + ladura plus BA13 — `PREGY CW(40/52/75/100/125/175) S(4915/27) M(50/75/100/150) – 1 PS + 1 LD con o senza isolante` | 1× ladura plus BA13 + 1× pregyplac BA13 | 40–175 | n.d. (vincoli ogni 80–150 cm) | 60–69 (sistema con supporto 46 dB; ΔRw ≤ 23) | — | — | ●●○○○ (2/5) | ●●○○ (2/4) | — | 22,0–25,0 |
| memento-p43-SX | 43 SX / 84 | controparete vincolata | Lastra ladura plus BA13 — `PREGY CW(40/52/75/100/125/175) S(4915/27) M(50/75/100/150) – 2 LD con o senza isolante` | 2× ladura plus BA13 | 40–175 | n.d. (vincoli ogni 80–150 cm) | 61–70 (sistema con supporto 46 dB; ΔRw ≤ 24) | — | — | ●●●○○ (3/5) | ●●●○ (3/4) | — | 26,0–29,0 |
| memento-p43-DX | 43 DX / 85 | controparete vincolata | Lastra solidtex indoor — `PREGY CW(28/40/63/88/113/163) S(4915/27) M(50/75/100/150) - 1 S-tex con o senza isolante` | 1× solidtex indoor | 28–163 | n.d. (vincoli ogni 80–150 cm) | 59–68 (sistema con supporto 46 dB; ΔRw ≤ 22) | — | — | ●●○○○ (2/5) | ●●●○ (3/4) | — | 16,0–19,0 |
| memento-p44-SX | 44 SX / 86 | controparete vincolata | Lastra pregyplac BA13 + solidtex indoor — `PREGY CW(40/52/75/100/125/175) S(4915/27) M(50/75/100/150) – 1 PS + 1 S-tex con o senza isolante` | 1× solidtex indoor + 1× pregyplac BA13 | 40–175 | n.d. (vincoli ogni 80–150 cm) | 61–70 (sistema con supporto 46 dB; ΔRw ≤ 24) | — | — | ●●●●● (5/5) | ●●●○ (3/4) | — | 25,0–28,0 |
| memento-p44-DX | 44 DX / 87 | controparete vincolata | Lastra solidtex indoor — `PREGY CW(40/52/75/100/125/175) S(4915/27) M(50/75/100/150) – 2 S-tex con o senza isolante` | 2× solidtex indoor | 40–175 | n.d. (vincoli ogni 80–150 cm) | 62–71 (sistema con supporto 46 dB; ΔRw ≤ 25) | — | — | ●●●●● (5/5) | ●●●● (4/4) | — | 31,0–34,0 |
| memento-p45-SX | 45 SX / 88 | controparete vincolata | Lastra aquaboard + ladura plus BA13 — `PREGY CW(40/75/100/125/175) S6027 M(50/75/100/150) – 1 LD + 1 AB con o senza isolante` | 1× aquaboard + 1× ladura plus BA13 | 40–175 | n.d. (vincoli ogni 80–150 cm) | 60–69 (sistema con supporto 46 dB; ΔRw ≤ 23) | — | — | ●●●○ (3/4) | ●●●○ (3/4) | — | 27,0–30,0 |
| memento-p45-DX | 45 DX / 89 | riqualifica fuoco | Riqualifica al fuoco di pareti non portanti (Lastra pregyflam BA13/BA15) | 1× pregyflam BA13 o BA15 | 13–65 | 3,00–8,00 | — | EI 120 / EI 180 / REI 120 (CLT) | — | — | — | — | — |
| memento-p46-SX | 46 SX / 90 | setto autoportante | Lastra pregyflam BA15 — `PREGY CW(80/105/130/180) / M(50/75/100/150) – 2 PF15` | 2× pregyflam BA15 | 80–180 | 2,7 – 10,0 | 33-42 | EI 60 | — | ●●○○ (2/4) | — | — | 29,0–34,0 |
| memento-p46-DX | 46 DX / 91 | setto autoportante | Lastra pregyflam BA15 — `PREGY CW(95/120/145/195) / M(50/75/100/150) – 3 PF15` | 3× pregyflam BA15 | 95–195 | 2,7 – 10,0 | 36 - 45 | EI 120 | — | ●●●○ (3/4) | — | — | 43,0–47,0 |

Note alla sintesi: per p37 SX l'intestazione dice Rw 62–63 dB ma la tabella (e la panoramica di PDF p23) dà 61–62 dB; per p38 DX il codice stampato è S(173/223/273) ma le varianti sono S148/S198/S248.

## 2. Legenda e convenzioni di lettura

- **Sigle lastre:** PS = pregyplac BA13; LD = ladura plus BA13; S-tex = solidtex indoor; AB = aquaboard; PF15 / PF BA15 = pregyflam BA15; PF BA13 = pregyflam BA13; LM = lana minerale. Varianti A1 citate nelle schede: pregyplac A1 BA13, ladura A1 BA13, pregyflam A1 BA15; per umido pregydro H2 BA13; verso ambienti freddi pregyvapor BA13.
- **Codici:** `PREGY S173/2M50` = parete a doppia orditura spessa 173 mm con due orditure di montanti M50; `PREGY CW63/M50` = controparete spessa 63 mm su montanti C50/50; `CW28/S4915` = controparete su profili da controsoffitto S4915.
- **Montanti:** `]` singolo, `][` accoppiati. Nelle tabelle della sez. 02 la riga del montante singolo delle varianti S223/S273 (e S198/S248) è stampata `[`: è un refuso tipografico, trattato come `]` (il JSON conserva il carattere stampato in `montanti_config_stampato`).
- **Celle fuoco:** `✔` = classe valida per quella riga fino alla sua Hmax meccanica; `Hmax=x m` = classe valida solo fino all'altezza x; `*` = rimando alla nota sotto tabella (tipo e densità minima della lana). La lettura è coerente con i numeri: il limite compare sempre quando la Hmax meccanica della riga supera x (con due eccezioni segnalate in §10).
- **Trattino "-"** = prestazione non dichiarata o voce non prevista (nel JSON: `null` + elenco `campi_con_trattino` / `trattino`).
- **Pallini:** più pallini pieni = prestazione migliore (per la fascia di prezzo = più costoso). Scala a 4 pallini, ma "Resistenza agli urti" è su 5 pallini in p39 DX e nelle contropareti p41–p44. Nel JSON c'è anche `normalizzato_0_1` = pieni/totali per confrontare scale diverse.
- **Badge "Plus"** (icone): Ambienti Umidi, Carichi sospesi, Antieffrazione, Resistenza agli Urti, Isolamento Acustico, Elevata umidità, Resistenza al fuoco, Grandi altezze.

## 3. Pareti a doppia orditura (sez. 02, PDF p37–39)

**Struttura comune a tutte e 6 le schede** (lettura della sezione disegnata e delle incidenze):

- due orditure pregymetal indipendenti (montanti C50/50, C75/50 o C100/50; interassi 600/400/300 mm; montanti singoli o accoppiati), ciascuna con lana minerale "sp. 40/60/80 mm";
- un paramento su ogni faccia (1 o 2 lastre) più **una lastra intermedia** in intercapedine, avvitata a una sola orditura;
- **orditure non legate**: nessun connettore, gancio o distanziatore tra le due orditure né nel disegno né nelle incidenze; montanti delle due orditure sfalsati;
- intercapedine tra lastra intermedia e seconda orditura **non quotata**; dal bilancio degli spessori risulta circa 10,5 mm (dedotto, es. 173 − 5×12,5 − 2×50);
- banda in polietilene su entrambe le orditure (1,4 m/m²);
- Hmax meccanica calcolata per Hk = 1 kN/m (DM 17/01/2018) e ±20 daN/m².

### Parete a doppia orditura - Lastra pregyplac BA13 — PDF p37 SX (p. 72)

`PREGY S(173/223/273) / 2xM(50/75/100) – 5 PS - LM`

- **Configurazione:** n.2 pregyplac BA13 / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.1 pregyplac BA13 / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.2 pregyplac BA13
- **Varianti di lastra:** Per classe A1 di reazione al fuoco prevedere lastre pregyplac A1 BA13; Per applicazione in ambienti umidi prevedere lastre pregydro H2 BA13
- **Ideale per:** Parete di separazione con moderati requisiti acustici e prestazionali
- **Caratteristiche:** sp. da 173 a 273 mm; Hmax 2,0 - 7,0 m; Rw 62 – 63 dB; fuoco fino EI 30; urti ●●○○ (2/4); carico sospeso ●○○○ (1/4); prezzo ●●◐○ (2,5/4)

| Variante | Sp. mm | Montanti | Conf. | Hmax i600 | Hmax i400 | Hmax i300 | EI 30 | Rw dB | Antieffr. | Peso ≈ kg/m² |
|---|---|---|---|---|---|---|---|---|---|---|
| S173/2M50 | 173 | C50/50 | ] | 2,0 | 2,3 | 2,7 | ✔* | 61 | - | 44,4 |
| S173/2M50 | 173 | C50/50 | ][ | 2,7 | 3,3 | 3,7 | ✔* | 61 | - | 44,4 |
| S223/2M75 | 223 | C75/50 | ] (stamp. `[`) | 3,3 | 4,0 | 4,5 | ✔* | 62 | - | 44,9 |
| S223/2M75 | 223 | C75/50 | ][ | 4,5 | 5,0 | 5,5 | Hmax=5,0 m* | 62 | - | 44,9 |
| S273/2M100 | 273 | C100/50 | ] (stamp. `[`) | 4,8 | 5,5 | 5,9 | Hmax=5,0 m* | 62 | - | 45,5 |
| S273/2M100 | 273 | C100/50 | ][ | 5,9 | 6,5 | 7,0 | Hmax=5,0 m* | 62 | - | 45,5 |

Note tabella: *Prevedere lana di vetro min. 13,5 kg/m3 — Colonna Antieff. presente ma con "-" in tutte le righe (nessuna classe antieffrazione).

### Parete a doppia orditura - Lastre pregyplac BA13 + ladura plus BA13 — PDF p37 DX (p. 73)

`PREGY S(173/223/273) / 2xM(50/75/100) – 3 LD + 2 PS - LM`

- **Configurazione:** n.1 ladura plus BA13 / n.1 pregyplac BA13 / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.1 ladura plus BA13 / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.1 pregyplac BA13 / n.1 ladura plus BA13
- **Strati:** Ordine come elencato in configurazione (da una faccia all'altra). Che la ladura plus sia lo strato a vista è dedotto: viti ladura 35 mm per i due strati esterni, SNT 25 mm per i pregyplac interni, ladura 25 mm per la lastra intermedia.
- **Varianti di lastra:** Per classe A1 di reazione al fuoco prevedere lastre ladura A1 BA13
- **Ideale per:** Residenziale, Albergo, Ospedali RSA — **Plus:** Ambienti Umidi, Carichi sospesi, Antieffrazione, Resistenza agli Urti
- **Caratteristiche:** sp. da 173 a 273 mm; Hmax 2,3 - 7,0 m; Rw 64 – 65 dB; fuoco fino EI 120; effrazione fino RC2 (nota 4); urti ●●●○ (3/4); carico sospeso ●●○○ (2/4); prezzo ●●●○ (3/4)

| Variante | Sp. mm | Montanti | Conf. | Hmax i600 | Hmax i400 | Hmax i300 | EI 120 | Rw dB | Antieffr. | Peso ≈ kg/m² |
|---|---|---|---|---|---|---|---|---|---|---|
| S173/2M50 | 173 | C50/50 | ] | 2,3 | 2,7 | 3,3 | ✔* | 64 | - | 57,8 |
| S173/2M50 | 173 | C50/50 | ][ | 3,3 | 3,8 | 4,2 | Hmax=4,0 m* | 64 | - | 57,8 |
| S223/2M75 | 223 | C75/50 | ] (stamp. `[`) | 4,0 | 4,4 | 5,1 | Hmax=4,0 m* | 65 | RC2 | 58,4 |
| S223/2M75 | 223 | C75/50 | ][ | 5,1 | 5,5 | 6,0 | Hmax=4,0 m* | 65 | RC2 | 58,4 |
| S273/2M100 | 273 | C100/50 | ] (stamp. `[`) | 4,8 | 5,5 | 5,9 | Hmax=4,0 m* | 65 | RC2 | 59,0 |
| S273/2M100 | 273 | C100/50 | ][ | 5,9 | 6,5 | 7,0 | Hmax=4,0 m* | 65 | RC2 | 59,0 |

Note tabella: *Prevedere lana di roccia min. 40 kg/m3 — Antieff.4: (Antieffrazione) Posa dei montanti a interasse 40 cm sfalsati tra le orditure.

### Parete a doppia orditura - Lastra ladura plus BA13 — PDF p38 SX (p. 74)

`PREGY S(173/223/273) / 2xM(50/75/100) – 5 LD - LM`

- **Configurazione:** n.2 ladura plus BA13 / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.1 ladura plus BA13 / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.2 ladura plus BA13
- **Varianti di lastra:** Per classe A1 di reazione al fuoco prevedere lastre ladura A1 BA13
- **Ideale per:** Residenziale, Albergo — **Plus:** Ambienti Umidi, Carichi sospesi, Antieffrazione, Resistenza agli Urti, Isolamento Acustico
- **Caratteristiche:** sp. da 173 a 273 mm; Hmax 2,3 - 7,0 m; Rw 69 – 70 dB; fuoco fino EI 120; effrazione fino RC2 (nota 4); urti ●●●● (4/4); carico sospeso ●●●○ (3/4); prezzo ●●●◐ (3,5/4)

| Variante | Sp. mm | Montanti | Conf. | Hmax i600 | Hmax i400 | Hmax i300 | EI 120 | Rw dB | Antieffr. | Peso ≈ kg/m² |
|---|---|---|---|---|---|---|---|---|---|---|
| S173/2M50 | 173 | C50/50 | ] | 2,3 | 2,7 | 3,3 | ✔* | 69 | - | 66,8 |
| S173/2M50 | 173 | C50/50 | ][ | 3,3 | 3,8 | 4,2 | Hmax=4,0 m* | 69 | - | 66,8 |
| S223/2M75 | 223 | C75/50 | ] (stamp. `[`) | 4,0 | 4,4 | 5,1 | Hmax=4,0 m* | 70 | RC2 | 67,4 |
| S223/2M75 | 223 | C75/50 | ][ | 5,1 | 5,5 | 6,0 | Hmax=4,0 m* | 70 | RC2 | 67,4 |
| S273/2M100 | 273 | C100/50 | ] (stamp. `[`) | 4,8 | 5,5 | 5,9 | Hmax=4,0 m* | 70 | RC2 | 68,0 |
| S273/2M100 | 273 | C100/50 | ][ | 5,9 | 6,5 | 7,0 | Hmax=4,0 m* | 70 | RC2 | 68,0 |

Note tabella: *Prevedere lana di roccia min. 40 kg/m3 — Antieff.4: (Antieffrazione) Prevedere montanti a interasse 400 mm e sfalsati di 200 mm tra le orditure.

### Parete a doppia orditura – Lastre solidtex indoor — PDF p38 DX (p. 75)

`PREGY S(173/223/273) / 2xM(50/75/100) – 3 S-tex - LM`  
⚠ DA VERIFICARE: codice stampato S(173/223/273) ma spessori, varianti e disegno sono 148-248 mm (S148/S198/S248): il codice coerente sarebbe S(148/198/248). Probabile refuso della scheda.

- **Configurazione:** n.1 solidtex indoor / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.1 solidtex indoor / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.1 solidtex indoor
- **Ideale per:** Residenziale, Albergo, Ospedali RSA — **Plus:** Ambienti Umidi, Carichi sospesi, Antieffrazione, Resistenza agli Urti
- **Caratteristiche:** sp. da 148 a 248 mm; Hmax 2,2 - 7,0 m; Rw 66 – 67 dB; fuoco fino EI 60; effrazione fino RC2 (nota 4); urti ●●○○ (2/4); carico sospeso ●●●○ (3/4); prezzo ●●●○ (3/4)

| Variante | Sp. mm | Montanti | Conf. | Hmax i600 | Hmax i400 | Hmax i300 | EI 60 | Rw dB | Antieffr. | Peso ≈ kg/m² |
|---|---|---|---|---|---|---|---|---|---|---|
| S148/2M50 | 148 | C50/50 | ] | 2,2 | 2,5 | 2,9 | ✔* | 66 | - | 49,3 |
| S148/2M50 | 148 | C50/50 | ][ | 2,9 | 3,5 | 4,0 | ✔* | 66 | - | 49,3 |
| S198/2M75 | 198 | C75/50 | ] (stamp. `[`) | 3,7 | 4,5 | 5,1 | ✔* | 66 | RC2 | 49,8 |
| S198/2M75 | 198 | C75/50 | ][ | 5,1 | 5,5 | 6,0 | Hmax=5,2 m* | 66 | RC2 | 49,8 |
| S248/2M100 | 248 | C100/50 | ] (stamp. `[`) | 4,8 | 5,5 | 5,9 | Hmax=5,2 m* | 67 | RC2 | 50,4 |
| S248/2M100 | 248 | C100/50 | ][ | 5,9 | 6,5 | 7,0 | Hmax=5,2 m* | 67 | RC2 | 50,4 |

Note tabella: *Prevedere lana di roccia min. 40 kg/m3 — Antieff.4: (Antieffrazione) Posa dei montanti a interasse 40 cm sfalsati tra le orditure.

### Parete a doppia orditura - Lastre pregyplac BA13 + solidtex indoor — PDF p39 SX (p. 76)

`PREGY S(173/223/273) / 2xM(50/75/100) – 3 S-tex + 2 PS - LM`

- **Configurazione:** n.1 solidtex indoor / n.1 pregyplac BA13 / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.1 solidtex indoor / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.1 pregyplac BA13 / n.1 solidtex indoor
- **Strati:** Ordine come elencato in configurazione. Posizione a vista del solidtex dedotta dalle viti: S-tex 42 mm per gli strati esterni, SNT 25 mm per i pregyplac interni, S-tex 32 mm per la lastra intermedia.
- **Ideale per:** Residenziale, Albergo — **Plus:** Ambienti Umidi, Carichi sospesi, Antieffrazione, Resistenza agli Urti, Isolamento Acustico
- **Caratteristiche:** sp. da 173 a 273 mm; Hmax 2,5 - 7,0 m; Rw 67 – 69 dB; fuoco fino EI 120; effrazione fino RC2 (nota 4); urti ●●●● (4/4); carico sospeso ●●●○ (3/4); prezzo ●●●◐ (3,5/4)

| Variante | Sp. mm | Montanti | Conf. | Hmax i600 | Hmax i400 | Hmax i300 | EI 60 | EI 120 | Rw dB | Antieffr. | Peso ≈ kg/m² |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S173/2M50 | 173 | C50/50 | ] | 2,5 | 2,8 | 3,3 | ✔* | ✔* | 67 | - | 65,6 |
| S173/2M50 | 173 | C50/50 | ][ | 3,3 | 3,9 | 4,2 | ✔* | ✔* | 67 | - | 65,6 |
| S223/2M75 | 223 | C75/50 | ] (stamp. `[`) | 4,0 | 4,5 | 5,1 | ✔* | Hmax=4,0 m* | 68 | RC2 | 66,2 |
| S223/2M75 | 223 | C75/50 | ][ | 5,1 | 5,5 | 6,0 | Hmax=5,2 m* | Hmax=4,0 m* | 68 | RC2 | 66,2 |
| S273/2M100 | 273 | C100/50 | ] (stamp. `[`) | 5,0 | 5,5 | 6,0 | Hmax=5,2 m* | Hmax=4,0 m* | 69 | RC2 | 66,8 |
| S273/2M100 | 273 | C100/50 | ][ | 6,0 | 6,5 | 7,0 | Hmax=5,2 m* | Hmax=4,0 m* | 69 | RC2 | 66,8 |

Note tabella: *Prevedere lana di roccia min. 40 kg/m3 — Antieff.4: (Antieffrazione) Posa dei montanti a interasse 40 cm sfalsati tra le orditure.
  
⚠ S173/2M50 `][`: DA VERIFICARE: EI 120 con ✔ (nessun limite) ma Hmax a int. 400/300 = 3,9/4,2 m; nelle altre righe e schede EI 120 è limitata a Hmax 4,0 m (es. p37 DX e p38 SX, stessa riga 3,3/3,8/4,2 -> "Hmax=4,0 m").

### Parete a doppia orditura – Lastra solidtex indoor — PDF p39 DX (p. 77)

`PREGY S(173/223/273) / 2xM(50/75/100) – 5 S-tex - LM`

- **Configurazione:** n.2 solidtex indoor / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.1 solidtex indoor / Orditura pregymetal + Lana minerale sp. 40/60/80 mm / n.2 solidtex indoor
- **Ideale per:** Residenziale, Albergo — **Plus:** Ambienti Umidi, Carichi sospesi, Antieffrazione, Resistenza agli Urti, Isolamento Acustico
- **Caratteristiche:** sp. da 173 a 273 mm; Hmax 2,9 - 8,0 m; Rw 72 – 74 dB; fuoco fino EI 120; effrazione fino RC3 (nota 4); urti ●●●●● (5/5); carico sospeso ●●●● (4/4); prezzo ●●●● (4/4)

| Variante | Sp. mm | Montanti | Conf. | Hmax i600 | Hmax i400 | Hmax i300 | EI 60 | EI 120 | Rw dB | Antieffr. | Peso ≈ kg/m² |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S173/2M50 | 173 | C50/50 | ] | 2,9 | 3,1 | 3,4 | ✔ | ✔* | 72 | - | 79,8 |
| S173/2M50 | 173 | C50/50 | ][ | 3,4 | 4,2 | 4,5 | ✔ | ✔* | 72 | - | 79,8 |
| S223/2M75 | 223 | C75/50 | ] (stamp. `[`) | 4,5 | 5,3 | 5,6 | Hmax=5,2 m | Hmax=4,0 m* | 73 | RC3 | 80,4 |
| S223/2M75 | 223 | C75/50 | ][ | 5,6 | 6,2 | 6,5 | Hmax=5,2 m | Hmax=4,0 m* | 73 | RC3 | 80,4 |
| S273/2M100 | 273 | C100/50 | ] (stamp. `[`) | 5,0 | 6,0 | 6,8 | Hmax=5,2 m | Hmax=4,0 m* | 74 | RC3 | 81,0 |
| S273/2M100 | 273 | C100/50 | ][ | 6,8 | 7,6 | 8,0 | Hmax=5,2 m | Hmax=4,0 m* | 74 | RC3 | 81,0 |

Note tabella: *Prevedere lana di roccia min. 40 kg/m3 (in questa scheda l'asterisco compare solo nella colonna EI 120) — Antieff.4: (Antieffrazione) Posa dei montanti a interasse 40 cm sfalsati tra le orditure.
  
⚠ S173/2M50 `][`: DA VERIFICARE: EI 120 con ✔ (nessun limite) ma Hmax a int. 400/300 = 4,2/4,5 m, oltre il limite 4,0 m applicato alle altre righe EI 120.

## 4. Contropareti vincolate al supporto (sez. 03, PDF p41–45 SX)

**Struttura comune:** una sola orditura addossata alla parete esistente e vincolata ad essa con squadre a "L" o staffe registrabili (aquaboard: squadra a "L" o barra dentata); montanti a interasse 600 mm. Due famiglie di profili:

- **profili da controsoffitto S4915 / S4927** (ingombro minimo 28–52 mm): servono anche il **gancio di unione o distanziatore**; vincoli ogni **80 cm** (S4915) o **100 cm** (S4927);
- **montanti da parete C50/50…C150/50** (63–175 mm, spazio per impianti e lana): vincoli ogni **150 cm**.

Lo spessore dichiarato è profondità del profilo + lastre (es. CW63 = 50 + 12,5): nessuna lama d'aria verso il supporto è conteggiata. **Nessuna scheda ha classe di resistenza al fuoco** (colonna EI "-"); **Rw "senza lana" mai dichiarato**; per le varianti S4915 manca anche Rw con lana. Gli **Rw sono del sistema supporto + controparete**, con supporto in laterizio forato 12 cm intonacato sui due lati: Rw supporto **44 dB** in p41 (pregyplac) e **46 dB** in p42–p45. Per confrontare le contropareti conviene quindi usare ΔRw (intestazione "fino a …") o la differenza Rw − Rw supporto (nel JSON: `delta_rw_con_lana_db_calcolato`).

### 4.1 Schede

| ID | Pag. | Lastre (dall'esterno) | Viti | Urti | Carichi sospesi | ΔRw max | Ideale per | Plus | Note lastra |
|---|---|---|---|---|---|---|---|---|---|
| memento-p41-SX | 41 SX / 80 | 1× pregyplac BA13 | SNT 25 mm | ●○○○○ (1/5) | necessari rinforzi | 19 dB | Riqualifica di pareti esistenti e/o integrazione impiantistica per ambienti non suscettibili di affollamento. | — | Per classe A1 di reazione al fuoco prevedere lastre pregyplac A1 BA13; Per applicazione in ambienti umidi prevedere lastre pregydro H2 BA13; Per contropareti verso ambienti freddi prevedere lastre pregyvapor BA13 |
| memento-p41-DX | 41 DX / 81 | 2× pregyplac BA13 | SNT 25 mm, SNT 35 mm | ●●○○○ (2/5) | necessari rinforzi | 22 dB | Riqualifica di pareti esistenti e/o integrazione impiantistica per ambienti con moderate esigenze prestazionali. | — | Per classe A1 di reazione al fuoco prevedere lastre pregyplac A1 BA13; Per applicazione in ambienti umidi prevedere lastre pregydro H2 BA13; Per contropareti verso ambienti freddi prevedere lastre pregyvapor BA13 |
| memento-p42-SX | 42 SX / 82 | 1× ladura plus BA13 | ladura 25 mm | ●●○○○ (2/5) | ●●○○ (2/4) | 20 dB | Uffici, Commerciale | Ambienti Umidi, Carichi sospesi | Per classe A1 di reazione al fuoco prevedere lastre ladura A1 BA13 |
| memento-p42-DX | 42 DX / 83 | 1× ladura plus BA13 + 1× pregyplac BA13 | SNT 25 mm, ladura 35 mm | ●●○○○ (2/5) | ●●○○ (2/4) | 23 dB | Residenziale, Albergo, Ospedali RSA, Scuola, Commerciale, Uffici | Ambienti Umidi, Carichi sospesi, Resistenza agli Urti | Per classe A1 di reazione al fuoco prevedere lastre ladura A1 BA13; Per contropareti verso ambienti freddi prevedere lastre pregyvapor BA13 |
| memento-p43-SX | 43 SX / 84 | 2× ladura plus BA13 | ladura 25 mm, ladura 35 mm | ●●●○○ (3/5) | ●●●○ (3/4) | 24 dB | Residenziale, Albergo, Scuola | Ambienti Umidi, Carichi sospesi, Resistenza agli Urti, Isolamento Acustico | Per classe A1 di reazione al fuoco prevedere lastre ladura A1 BA13 |
| memento-p43-DX | 43 DX / 85 | 1× solidtex indoor | S-tex 32 mm | ●●○○○ (2/5) | ●●●○ (3/4) | 22 dB | Residenziale, Commerciale | Ambienti Umidi, Carichi sospesi, Isolamento Acustico | — |
| memento-p44-SX | 44 SX / 86 | 1× solidtex indoor + 1× pregyplac BA13 | SNT 25 mm, S-tex 42 mm | ●●●●● (5/5) | ●●●○ (3/4) | 24 dB | Residenziale, Albergo, Scuola | Ambienti Umidi, Carichi sospesi, Resistenza agli Urti, Isolamento Acustico | Per contropareti verso ambienti freddi prevedere lastre pregyvapor BA13 |
| memento-p44-DX | 44 DX / 87 | 2× solidtex indoor | S-tex 32 mm, S-tex 42 mm | ●●●●● (5/5) | ●●●● (4/4) | 25 dB | Residenziale, Scuola, Albergo | Ambienti Umidi, Carichi sospesi, Resistenza agli Urti, Isolamento Acustico | — |
| memento-p45-SX | 45 SX / 88 | 1× aquaboard + 1× ladura plus BA13 | ladura 25 mm, aquaboard 42 mm | ●●●○ (3/4) | ●●●○ (3/4) | 23 dB | Docce, Piscine e SPA | Elevata umidità | *Scelta dei profili e degli accessori in funzione dell'aggressività dell'ambiente di utilizzo: Interni elevata umidità -> profili pregymetalaquaboard, accessori pregymetalaquaboard C3; Piscine e SPA -> profili pregymetalaquaboard C5, accessori pregymetalaquaboard C5. |

### 4.2 Varianti: Rw con lana (dB) e peso (≈ kg/m²)

Le schede a una lastra hanno varianti CW28/40/63/88/113/163, quelle a due lastre CW40/52/75/100/125/175 (stessi profili: S4915, S4927, C50, C75, C100, C150). Interasse montanti sempre 600 mm; interasse vincoli 80 / 100 / 150 / 150 / 150 / 150 cm.

| Scheda | Supporto Rw | S4915 | S4927 | C50/50 | C75/50 | C100/50 | C150/50 |
|---|---|---|---|---|---|---|---|
| 41 SX (1PS) | 44 dB | CW28: - / 9,0 | CW40: 54 dB / 9,0 | CW63: 61 dB / 10,0 | CW88: 62 dB / 11,0 | CW113: 62 dB / 11,0 | CW163: 63 dB / 12,0 |
| 41 DX (2PS) | 44 dB | CW40: - / 18,0 | CW52: 57 dB / 18,0 | CW75: 64 dB / 19,0 | CW100: 65 dB / 20,0 | CW125: 65 dB / 20,0 | CW175: 66 dB / 21,0 |
| 42 SX (1LD) | 46 dB | CW28: - / 13,0 | CW40: 58 dB / 13,0 | CW63: 64 dB / 14,0 | CW88: 65 dB / 14,0 | CW113: 65 dB / 15,0 | CW163: 66 dB / 16,0 |
| 42 DX (1LD + 1PS) | 46 dB | CW40: - / 22,0 | CW52: 60 dB / 22,0 | CW75: 67 dB / 23,0 | CW100: 68 dB / 24,0 | CW125: 68 dB / 24,0 | CW175: 69 dB / 25,0 |
| 43 SX (2LD) | 46 dB | CW40: - / 26,0 | CW52: 61 dB / 26,0 | CW75: 68 dB / 27,0 | CW100: 69 dB / 28,0 | CW125: 69 dB / 28,0 | CW175: 70 dB / 29,0 |
| 43 DX (1S-tex) | 46 dB | CW28: - / 16,0 | CW40: 59 dB / 16,0 | CW63: 66 dB / 17,0 | CW88: 67 dB / 18,0 | CW113: 67 dB / 18,0 | CW163: 68 dB / 19,0 |
| 44 SX (1S-tex + 1PS) | 46 dB | CW40: - / 25,0 | CW52: 61 dB / 25,0 | CW75: 68 dB / 26,0 | CW100: 69 dB / 27,0 | CW125: 69 dB / 27,0 | CW175: 70 dB / 28,0 |
| 44 DX (2S-tex) | 46 dB | CW40: - / 31,0 | CW52: 62 dB / 31,0 | CW75: 69 dB / 32,0 | CW100: 70 dB / 33,0 | CW125: 70 dB / 33,0 | CW175: 71 dB / 34,0 |
| 45 SX (1AB + 1LD) | 46 dB | (S6027) CW40: 60 dB / 27,0 | — | CW75: 67 dB / 28,0 | CW100: 68 dB / 29,0 | CW125: 68 dB / 29,0 | CW175: 69 dB / 30,0 |

p45 SX (aquaboard + ladura plus) non ha la variante S4927: l'unica variante a profilo S è CW40/S6027 (vincoli 80 cm), che ha Rw con lana dichiarato (60 dB).

### 4.3 Specifiche della controparete aquaboard (p45 SX)

- Orditura, guide, montanti e accessori **pregymetalaquaboard**; la classe di protezione dipende dall'aggressività dell'ambiente: interni a elevata umidità → profili pregymetalaquaboard e accessori pregymetalaquaboard C3; piscine e SPA → profili e accessori pregymetalaquaboard C5.
- Staffatura: squadra a "L" o **barra dentata aquaboard**; niente ganci/distanziatori nelle incidenze.
- Giunti con **stucco in pasta aquaboard** (0,50 kg/m²) e **banda in rete aquaboard** (0,9 m/m²) invece di stucco/nastro standard; viti aquaboard 42 mm per lo strato esterno.
- Ideale per docce, piscine e SPA; badge "Elevata umidità"; urti e carichi sospesi 3/4.

## 5. Riqualifica al fuoco di pareti non portanti — PDF p45 DX (p. 89)

Tabella senza riquadro caratteristiche né incidenze: una sola lastra **pregyflam** (BA13 o BA15) applicata su una parete esistente non portante, con diversi metodi di montaggio.

| Supporto | Sp. mm | Montaggio | Hmax (m) | Intonaco | Lastra | Classe |
|---|---|---|---|---|---|---|
| Blocchi forati di laterizio, sp. min 80 mm | 28 | Colla + tasselli | 4,00 | No | n.1 PF BA15 | EI 120 |
| Blocchi forati di laterizio, sp. min 80 mm | 28 | Colla + tasselli | 8,00* | Si. 10 mm di intonaco sul lato non esposto | n.1 PF BA13 | EI 120 |
| Blocchi forati di laterizio, sp. min 80 mm | 43 | S4927 int. 600 mm | 8,00* | Si. 10 mm di intonaco su entrambi i lati | n.1 PF BA13 | EI 120 |
| Blocchi forati di laterizio, sp. min 80 mm | 65 | C50/50 int. 600 mm | 8,00* | Si. 10 mm di intonaco sul lato non esposto | n.1 PF BA15 | EI 180 |
| Blocchi in calcestruzzo, sp. min 80 mm | 28 | S4915 int. 600 mm | 8,00* | No | n.1 PF BA13 | EI 120 |
| Placcaggio CLT/XLAM | 13 | Viti SNT/45 int. 250x600 mm | 3,00 | No | n.1 PF BA13 | REI 120 |

\* Le altezze massime dipendono dallo spessore del supporto: vanno prese dai rapporti di classificazione / fascicoli tecnici specifici. L'unità della colonna Hmax non è stampata (valori da intendere in metri). La colonna fuoco riporta "120"/"180" sotto l'intestazione EI; per il CLT "REI 120".

Letture utili: la **placcatura incollata e tassellata** su laterizio forato ≥80 mm arriva a EI 120 con una sola lastra (BA15 senza intonaco fino a 4,00 m; BA13 con 10 mm di intonaco sul lato non esposto fino a 8,00 m*); l'unica **EI 180** è con pregyflam BA15 su montanti C50/50 a 600 mm e intonaco sul lato non esposto; il **CLT/XLAM** si protegge avvitando direttamente una PF BA13 ("Viti SNT/45 int. 250x600 mm"), REI 120 fino a 3,00 m. Coerente con il Manuale del posatore (PDF p49): sistemi certificati REI 120 su forati da 8 cm intonacati, sia in aderenza (S4927) sia con montanti M50 + lana di roccia.

## 6. Setti autoportanti (sez. 03, PDF p46)

Orditura singola **non vincolata** a un supporto, con **montanti sempre accoppiati `][`** e lastre pregyflam BA15 **su un solo lato** (colonna "Fuoco lato lastre"); lana minerale eventuale (Rw dichiarato con e senza lana, ma nessuna incidenza di isolante). Ideale per **cavedi impiantistici**; badge "Resistenza al fuoco" e "Grandi altezze".

### Setto autoportante - Lastra pregyflam BA15 — PREGY CW(80/105/130/180) / M(50/75/100/150) – 2 PF15 — PDF p46 SX (p. 90)

Sp. da 80 a 180 mm; Hmax 2,7 – 10,0 m; Rw 33-42 dB; EI 60; urti ●●○○ (2/4). Per classe A1 di reazione al fuoco prevedere lastre pregyflam A1 BA15.

| Variante | Sp. mm | Montanti | Conf. | Hmax i600 | Hmax i400 | Hmax i300 | EI 60 fuoco lato lastre | EI 60 fuoco bidirezionale | Rw senza lana | Rw con lana | Peso ≈ kg/m² |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CW80/M50 | 80 | C50/50 | ][ | 2,7 | 3,8 | 4,2 | ✔ | Hmax=4,0 m | 33 | 36 | 29,0 |
| CW105/M75 | 105 | C75/50 | ][ | 4,4 | 5,5 | 6,0 | ✔ | Hmax=4,0 m | 33 | 37 | 30,0 |
| CW130/M100 | 130 | C100/50 | ][ | 5,9 | 6,5 | 7,0 | ✔ | Hmax=4,0 m | 33 | 39 | 31,0 |
| CW180/M150 | 180 | C150/50 | ][ | 7,0 | 8,0 | 9,0 | ✔ | Hmax=4,0 m | 33 | 42 | 32,0 |
| CW180/M150x1 | 180 | C150/50x1 | ][ | 8,5 | 9,5 | 10,0 | ✔ | Hmax=4,0 m | 33 | 42 | 34,0 |

### Setto autoportante - Lastra pregyflam BA15 — PREGY CW(95/120/145/195) / M(50/75/100/150) – 3 PF15 — PDF p46 DX (p. 91)

Sp. da 95 a 195 mm; Hmax 2,7 – 10,0 m; Rw 36 - 45 dB; EI 120; urti ●●●○ (3/4). Per classe A1 di reazione al fuoco prevedere lastre pregyflam A1 BA15.

| Variante | Sp. mm | Montanti | Conf. | Hmax i600 | Hmax i400 | Hmax i300 | EI 120 fuoco lato lastre | EI 120 fuoco bidirezionale | Rw senza lana | Rw con lana | Peso ≈ kg/m² |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CW95/M50 | 95 | C50/50 | ][ | 2,7 | 3,8 | 4,2 | ✔ | Hmax=4,0 m | 36 | 40 | 43,0 |
| CW120/M75 | 120 | C75/50 | ][ | 4,4 | 5,5 | 6,0 | ✔ | Hmax=4,0 m | 36 | 41 | 44,0 |
| CW145/M100 | 145 | C100/50 | ][ | 5,9 | 6,5 | 7,0 | ✔ | Hmax=4,0 m | 36 | 42 | 45,0 |
| CW195/M150 | 195 | C150/50 | ][ | 7,0 | 8,0 | 9,0 | ✔ | Hmax=4,0 m | 36 | 45 | 45,0 |
| CW195/M150x1 | 195 | C150/50x1 | ][ | 8,5 | 9,5 | 10,0 | ✔ | Hmax=4,0 m | 36 | 45 | 47,0 |

`C150/50x1`: il suffisso x1 indica presumibilmente lamiera 10/10 mm (da verificare); è la variante che arriva a 10,0 m (interasse 300 mm).

## 7. Controparete vincolata, controparete autoportante, setto: differenze e quando usarle

| | Controparete vincolata (p41–45) | Controparete autoportante | Setto autoportante (p46) |
|---|---|---|---|
| Collegamento | orditura fissata alla parete esistente con squadre a "L" / staffe registrabili (+ ganci/distanziatori con profili S) | guide + montanti come una parete a singola orditura, fissata solo a pavimento e soffitto (posatore PDF p48) | orditura libera, fissata solo a pavimento e soffitto |
| Scheda nel Memento | sì, 9 schede | **nessuna** | sì, 2 schede (2 o 3 pregyflam BA15) |
| Profili | S4915 / S4927 / S6027 oppure C50…C150, singoli, int. 600 mm | — | C50…C150 (anche C150/50x1), **sempre accoppiati ][**, int. 600/400/300 mm |
| Altezza | nessuna Hmax: conta l'interasse dei vincoli (80/100/150 cm) | — | Hmax da tabella: fino a 10,0 m |
| Lastre | 1 o 2 strati sul lato a vista | — | 2 o 3 pregyflam BA15 su un lato |
| Fuoco | nessuna classe (per la riqualifica al fuoco vedi p45 DX) | — | EI 60 / EI 120: fuoco lato lastre fino a Hmax, fuoco bidirezionale solo fino a 4,0 m |
| Acustica | Rw del sistema supporto + controparete (ΔRw 19–25 dB) | — | Rw del setto da solo: 33–45 dB |
| Uso tipico | riqualifica di pareti esistenti, isolamento acustico/termico, passaggio impianti | quando la parete retrostante non può ricevere fissaggi o serve disaccoppiarsi | cavedi impiantistici, chiusure alte e compartimentazioni senza parete di appoggio |

**Criteri di scelta** (dalle schede, dall'introduzione del Memento a PDF p3 e dal Manuale del posatore, PDF p48–49, riassunti):

1. **Si può fissare alla parete esistente?** Se sì, la controparete vincolata è la soluzione standard: ingombro minimo e nessun limite di altezza tabellato, ma servono vincoli ogni 80–150 cm. Se il supporto non può ricevere fissaggi (o non c'è una parete), serve una soluzione autoportante: nel Memento esistono solo i **setti**.
2. **Ingombro disponibile:** senza prescrizioni particolari il minimo si ottiene con profili da controsoffitto S4915 (28 mm con una lastra); con S4915/S4927 la lana può stare solo in spessori ridotti (il posatore indica al massimo 30–40 mm) e per S4915 il Memento non dà Rw. Con impianti da far passare, o con requisiti acustici o termici, si usano montanti da parete C50…C150.
3. **Requisiti prestazionali:** acustica → più lastre, lastre ad alta densità (ladura plus, solidtex indoor) e lana; urti → solidtex/ladura (le due schede solidtex a 2 lastre sono 5/5); carichi sospesi → evitare la sola pregyplac ("necessari rinforzi"); fuoco → le contropareti vincolate non hanno classe: per portare una parete esistente a EI 120/180 serve la tabella di riqualifica p45 DX (pregyflam), per un cavedio i setti p46.
4. **Ambienti:** umidi → pregydro H2 (varianti pregyplac) o schede con badge "Ambienti Umidi"; docce/piscine/SPA → aquaboard con profili C3/C5; verso ambienti freddi → pregyvapor BA13 (barriera al vapore).

> Per il selettore: la famiglia **controparete_autoportante** non ha dati nel Memento. Le tabelle del setto valgono solo per la configurazione certificata (pregyflam BA15 su montanti accoppiati): usarle per una controparete autoportante con altre lastre è una **estrapolazione**, da confermare con l'Ufficio Tecnico Siniat.

## 8. Incidenze medie: confronto (per il motore di calcolo)

**Condizioni comuni a tutte le tabelle:** quantità per m² di parete alta **3 m**, calcolate **vuoto per pieno** con **sfrido 5%**, stuccatura dei **soli strati a vista**, finitura **Q2**. Le prestazioni valgono solo con componenti Siniat.

### 8.1 Pareti a doppia orditura (voci uguali in tutte e 6 le schede)

| Voce | Unità | i=60 `]` | i=60 `][` | i=40 `]` | i=40 `][` | i=30 `]` | i=30 `][` |
|---|---|---|---|---|---|---|---|
| Guide pregymetal | m | 1,4 | 1,4 | 1,4 | 1,4 | 1,4 | 1,4 |
| Montanti pregymetal | m | 3,6 | 7,0 | 5,2 | 10,6 | 7,0 | 14,0 |
| Banda in polietilene | m | 1,4 | 1,4 | 1,4 | 1,4 | 1,4 | 1,4 |
| Stucco per giunti Siniat | kg | 0,7 | 0,7 | 0,7 | 0,7 | 0,7 | 0,7 |
| Nastro per giunti | m | 1,8 | 1,8 | 1,8 | 1,8 | 1,8 | 1,8 |
| Isolante in lana minerale | m2 | 2,1 | 2,1 | 2,1 | 2,1 | 2,1 | 2,1 |

Lastre e viti per scheda (lastre: stesso valore per tutti gli interassi; viti: cad./m²):

| Scheda | Lastre (m²/m²) | Viti | i=60 `]` | i=60 `][` | i=40 `]` | i=40 `][` | i=30 `]` | i=30 `][` |
|---|---|---|---|---|---|---|---|---|
| 37 SX | pregyplac BA13 5,25 | SNT 25 mm | 15 | 20 | 20 | 30 | 25 | 45 |
|  |  | SNT 35 mm | 20 | 30 | 25 | 40 | 35 | 50 |
| 37 DX | pregyplac BA13 2,1; ladura plus BA13 3,15 | SNT 25 mm | 10 | 15 | 15 | 20 | 15 | 30 |
|  |  | ladura 25 mm | 5 | 10 | 10 | 10 | 10 | 15 |
|  |  | ladura 35 mm | 20 | 30 | 25 | 40 | 35 | 50 |
| 38 SX | ladura plus BA13 5,25 | ladura 25 mm | 15 | 20 | 20 | 30 | 25 | 45 |
|  |  | ladura 35 mm | 20 | 30 | 25 | 40 | 35 | 50 |
| 38 DX | pregyplac BA13 3,15 | S-tex 32 mm | 25 | 40 | 40 | 50 | 50 | 65 |
| 39 SX | pregyplac BA13 2,1; solidtex indoor 3,15 | SNT 25 mm | 10 | 15 | 15 | 20 | 15 | 30 |
|  |  | S-tex 32 mm | 5 | 10 | 10 | 10 | 10 | 15 |
|  |  | S-tex 42 mm | 20 | 30 | 25 | 40 | 35 | 50 |
| 39 DX | solidtex indoor 5,25 | solidtex 32 mm | 15 | 20 | 20 | 30 | 25 | 45 |
|  |  | solidtex 42 mm | 20 | 30 | 25 | 40 | 35 | 50 |

⚠ In p38 DX la riga lastre si chiama "Lastre pregyplac BA13" (3,15) ma il sistema è di sole solidtex indoor: da intendere solidtex indoor (DA VERIFICARE).

### 8.2 Contropareti vincolate (interasse montanti 60 cm)

Voci comuni (valore colonna S4915/27 → colonna M50/75/100/150):

| Voce | Unità | S4915/27 | M50/75/100/150 |
|---|---|---|---|
| Guide pregymetal | m | 0,7 | 0,7 |
| Montanti pregymetal | m | 1,8 | 1,8 |
| Squadra a "L" o staffa registrabile (int. 1 m) | cad. | 1,8 | 1,8 |
| Gancio di unione o distanziatore (int. 1 m) | cad. | 1,8 | - |
| Banda in polietilene | m | 0,7 | 0,7 |
| Stucco per giunti Siniat | kg | 0,35 | 0,35 |
| Nastro per giunti | m | 0,9 | 0,9 |
| Isolante in lana minerale | m2 | 1,05 | 1,05 |

Lastre e viti per scheda (stesso valore nelle due colonne):

| Scheda | Lastre (m²/m²) | Viti (cad./m²) |
|---|---|---|
| 41 SX | pregyplac BA13 1,05 | SNT 25 mm 10 |
| 41 DX | pregyplac BA13 2,1 | SNT 25 mm 5; SNT 35 mm 10 |
| 42 SX | ladura plus BA13 1,05 | ladura 25 mm 10 |
| 42 DX | ladura plus BA13 1,05; pregyplac BA13 1,05 | SNT 25 mm 5; ladura 35 mm 10 |
| 43 SX | ladura plus BA13 2,1 | ladura 25 mm 5; ladura 35 mm 10 |
| 43 DX | solidtex indoor 1,05 | S-tex 32 mm 10 |
| 44 SX | solidtex indoor 1,05; pregyplac BA13 1,05 | SNT 25 mm 5; S-tex 42 mm 10 |
| 44 DX | solidtex indoor 2,1 | S-tex 32 mm 5; S-tex 42 mm 10 |
| 45 SX | ladura 1,05; aquaboard 1,05 | ladura 25 mm 5; aquaboard 42 mm 10 |

p45 SX (aquaboard) ha solo la colonna M: lastre ladura 1,05 + aquaboard 1,05; guide e montanti **pregymetalaquaboard** 0,7 / 1,8; squadra a "L" o barra dentata (int. 1 m) 1,8; viti ladura 25 mm 5 + viti aquaboard 42 mm 10; banda in polietilene 0,7; **stucco in pasta aquaboard 0,50 kg**; **banda in rete aquaboard 0,9 m**; isolante 1,05. Nessuna incidenza per la variante CW40/S6027.

### 8.3 Setti autoportanti (montanti `][`)

| Voce | Unità | 2 PF15 i=60 / 40 / 30 | 3 PF15 i=60 / 40 / 30 |
|---|---|---|---|
| Lastre pregyflam BA15 | m2 | 2,1 / 2,1 / 2,1 | 3,15 / 3,15 / 3,15 |
| Guide pregymetal | m | 0,7 / 0,7 / 0,7 | 0,7 / 0,7 / 0,7 |
| Montanti pregymetal | m | 3,5 / 5,3 / 7,0 | 3,5 / 5,3 / 7,0 |
| Viti SNT 25 mm | cad. | 10 / 10 / 15 | 10 / 10 / 15 |
| Viti SNT 45 mm | cad. | 15 / 20 / 25 | 10 / 10 / 15 |
| Banda in polietilene | m | 0,7 / 0,7 / 0,7 | 0,7 / 0,7 / 0,7 |
| Stucco per giunti Siniat | kg | 0,35 / 0,35 / 0,35 | 0,35 / 0,35 / 0,35 |
| Nastro per giunti | m | 0,9 / 0,9 / 0,9 | 0,9 / 0,9 / 0,9 |
| Viti SNT 55 mm | cad. | — | 15 / 20 / 25 |

Nessuna riga "isolante" nei setti, anche se la lana è prevista come eventuale e gli Rw "con lana" sono dichiarati.

### 8.4 Regole ricavate (osservazioni verificate sui numeri, non dichiarate da Siniat)

- **Lastre** = 1,05 m² × numero di strati (sfrido 5%): 5 strati 5,25; 3 strati 3,15; 2 strati 2,10; 1 strato 1,05.
- **Guide** = 0,7 m/m² per orditura (2 guide ÷ 3 m × 1,05): doppia orditura 1,4; controparete e setto 0,7. La **banda in polietilene** segue le guide (1,4 / 0,7).
- **Montanti:** controparete 1,8 m/m² (1/0,6 × 1,05 = 1,75). Setto `][` 3,5 / 5,3 / 7,0 (2 montanti ÷ interasse × 1,05). Doppia orditura `]` 3,6 / 5,2 / 7,0 e `][` 7,0 / 10,6 / 14,0: cioè 2 o 4 montanti ÷ interasse × 1,05, con arrotondamenti (3,5→3,6; 10,5→10,6).
- **Stucco e nastro** per faccia a vista: 0,35 kg + 0,9 m (contropareti, setti), il doppio per le pareti a doppia orditura (0,7 kg + 1,8 m). La lastra intermedia non si stucca.
- **Isolante:** 1,05 m² per strato di lana (1 per orditura): 2,1 nella doppia orditura, 1,05 nelle contropareti, assente nei setti.
- **Viti:** il primo strato su ogni orditura prende la vite corta (25 mm per pregyplac/ladura, 32 mm per solidtex indoor), il secondo quella lunga (35 mm SNT/ladura, 42 mm S-tex/aquaboard). Nelle contropareti: 1 strato 10 viti/m²; 2 strati 5 corte + 10 lunghe. Nei setti PF15: 25 → 45 → 55 mm per 1°, 2° e 3° strato. Le viti crescono con i montanti accoppiati e con l'interasse più fitto.
- **Squadre/staffe e ganci delle contropareti:** 1,8 cad/m² con la dicitura "int. 1 m" (≈ 1 vincolo per metro di montante), **indipendentemente** dall'interasse vincoli in tabella (80/100/150 cm). Se il motore vuole seguire la tabella: vincoli/m² ≈ montanti (m/m²) ÷ interasse vincoli (m) → circa 2,25 (S4915), 1,8 (S4927), 1,2 (montanti C). **Da concordare con Siniat.** Ganci/distanziatori solo con profili S; con montanti C "-".

## 9. Prescrizioni di posa e limiti indicati nelle schede

**Dimensionamento**
- Pareti a doppia orditura e setti: Hmax calcolate per sovraccarico orizzontale lineare Hk = 1 kN/m (DM 17/01/2018) e pressione uniforme ±20 daN/m² (nota 2). Contropareti: stesso carico, riferito all'interasse montanti di 600 mm (nota 3).
- Contropareti: interasse dei vincoli al supporto 80 cm (S4915, S6027), 100 cm (S4927), 150 cm (C50…C150).

**Fuoco**
- Verificare sempre la configurazione sulla versione aggiornata della "Guida pratica alle soluzioni antincendio" e sui Rapporti di Classificazione / Fascicoli Tecnici: **le schede non riportano i numeri dei rapporti**.
- Lana richiesta dove c'è l'asterisco: EI 30 (p37 SX) → **lana di vetro min. 13,5 kg/m³**; EI 60 ed EI 120 (p37 DX–p39 DX) → **lana di roccia min. 40 kg/m³** (p39 DX: asterisco solo sulla colonna EI 120).
- Limiti di altezza per il fuoco: EI 30 fino a **5,0 m**; EI 60 fino a **5,2 m**; EI 120 fino a **4,0 m** (doppia orditura). Setti: fuoco dal lato lastre fino alla Hmax della tabella (max 10,0 m); **fuoco bidirezionale fino a 4,0 m**.
- Riqualifica al fuoco: supporti con spessore minimo 80 mm; intonaco da 10 mm sul lato non esposto o su entrambi i lati dove indicato; Hmax oltre 4 m (8,00 m*) solo secondo i rapporti, in funzione dello spessore del supporto.
- Classe A1 di reazione al fuoco: usare le versioni A1 (pregyplac A1 BA13, ladura A1 BA13, pregyflam A1 BA15).

**Antieffrazione (nota 4, sez. 02)**
- RC2 (RC3 con 5 solidtex indoor) solo per le varianti S223/S273 (S198/S248), mai per S173/S148.
- Condizione di posa: montanti a interasse 40 cm **sfalsati tra le due orditure** (p38 SX specifica: interasse 400 mm, sfalsamento 200 mm).

**Acustica e isolante**
- Doppia orditura: lana minerale in entrambe le orditure, spessori 40/60/80 mm.
- Contropareti: Rw dichiarati solo **con lana** e riferiti al sistema con il supporto di riferimento (44 o 46 dB); per S4915 nessun valore.

**Ambienti e lastre**
- Ambienti umidi: pregydro H2 BA13 al posto della pregyplac (p37 SX, p41 SX/DX). Contropareti verso ambienti freddi: pregyvapor BA13 (p41, p42 DX, p44 SX).
- Aquaboard: profili e accessori scelti in base all'aggressività dell'ambiente (C3 per interni a elevata umidità, C5 per piscine e SPA).
- Carichi sospesi: sulle contropareti in sola pregyplac servono rinforzi.

**Validità e posa generale**
- Prestazioni valide solo con sistema completo Siniat (lastre, profili, stucchi, accessori).
- Dal capitolato del Memento (PDF p60, p. 119), in sintesi: guide fissate a pavimento e soffitto con tasselli a interasse 50 cm; nastro di polietilene espanso a celle chiuse su tutto il perimetro contro i ponti acustici; nelle contropareti montanti vincolati al supporto con staffe a "L"; misurazione vuoto per pieno fino a 2,5 m² a compenso dei telai.

## 10. Anomalie e punti DA VERIFICARE

| Dove | Problema |
|---|---|
| p37 SX | Rw in intestazione 62–63 dB, ma in tabella 61/62 dB (anche la panoramica di PDF p23 dà 61–62). Usare i valori di tabella. |
| p38 DX | Codice stampato "S(173/223/273)" ma varianti S148/S198/S248 e spessore 148–248 mm: refuso del codice. |
| p38 DX | Incidenze: "Lastre pregyplac BA13 3,15 m²" in un sistema di sole solidtex indoor: da intendere solidtex indoor. |
| p39 SX | S173/2M50 `][`: EI 120 "✔*" senza limite, ma Hmax 3,9/4,2 m (i=40/30) supera il limite di 4,0 m che compare in tutte le altre righe EI 120 (p37 DX e p38 SX, stessa riga → "Hmax=4,0 m"). |
| p39 DX | S173/2M50 `][`: EI 120 "✔*" con Hmax 4,2/4,5 m: stesso dubbio. |
| p37–39 | Il montante singolo delle varianti S223/S273 (S198/S248) è stampato "[": interpretato come "]". |
| p37–39 | L'intercapedine tra le orditure non è quotata: ≈10,5 mm ricavati dal bilancio degli spessori. Anche lo spessore di solidtex indoor (12,5 mm) è ricavato dal bilancio. |
| p41–45 | Squadre/staffe e ganci calcolati "int. 1 m" (1,8 cad/m²) mentre la tabella dà un interasse vincoli di 80/100/150 cm. |
| p41 vs p42–45 | Supporto di riferimento Rw 44 dB (p41, pregyplac) contro 46 dB (tutte le altre): gli Rw assoluti non sono direttamente confrontabili; i ΔRw sì. |
| p41–44 | Per le varianti S4915 manca anche Rw "con lana", eppure le incidenze della colonna S4915/27 comprendono 1,05 m² di isolante. |
| p45 SX | CW40/S6027: spessore 40 mm poco coerente con profilo S6027 (ala 27) + 2 lastre e con la quota "40-52" del disegno: ci si aspetterebbe 52 mm. |
| p45 SX | Manca la colonna incidenze per la variante S6027; "Lastre ladura" (senza "plus"). |
| p46 | Nessuna incidenza di isolante anche se Rw "con lana" è dichiarato. "C150/50x1": probabilmente lamiera 10/10. |
| p46 DX | Peso CW195/M150 ≈45,0 uguale a CW145/M100 (nelle altre righe +1 kg/m² per passo): possibile refuso, bassa priorità. |
| p45 DX | Unità di Hmax non stampata (m). Altezze 8,00 m* condizionate agli spessori del supporto: servono i rapporti. |
| tutte | Nessun numero di rapporto di classificazione nelle schede: i riferimenti ai certificati vanno presi dal manuale antincendio. |

## 11. Punti chiave per selettore e distinta

- **Acustica:** la doppia orditura arriva a Rw 61–74 dB (5 solidtex indoor = 72–74 dB, il massimo di queste sezioni); con lastre ad alta densità si guadagnano circa 3–12 dB rispetto alla versione in pregyplac a parità di struttura.
- **Il fuoco limita l'altezza:** una doppia orditura EI 120 non supera 4,0 m anche se la Hmax meccanica arriva a 7–8 m. Il selettore deve applicare il minimo tra la Hmax meccanica (per interasse e montante) e la Hmax del fuoco della cella.
- **Antieffrazione** solo con montanti da 75 o 100 mm e posa a 40 cm sfalsata: la distinta deve forzare l'interasse 40 cm (colonne i=40) quando si richiede RC2/RC3.
- **Contropareti:** nessuna classe di fuoco; l'Rw è riferito alla parete esistente di riferimento, quindi il selettore dovrebbe ragionare in ΔRw. Le varianti S4915 (ingombro minimo) non hanno prestazione acustica dichiarata.
- **Setti:** unica soluzione autoportante del Memento; EI 60/120 fino a 10 m con fuoco dal lato lastre, ma solo 4 m se il fuoco può arrivare da entrambi i lati.
- **Distinta:** tutte le incidenze sono tarate su h = 3 m (l'incidenza delle guide, per esempio, scala con 1/h) e comprendono già lo sfrido del 5%. Mancano le incidenze di tasselli e fissaggi a pavimento, soffitto e supporto (non presenti nelle tabelle).

