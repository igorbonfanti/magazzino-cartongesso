# Verifica dei rapporti di classificazione — 24/09/2026

Richiesta: controllare uno per uno che i rapporti linkati nelle schede tecniche
dei preventivi corrispondano al sistema proposto (anche con le sostituzioni) e a
quanto scritto nella guida antincendio Siniat (luglio 2026).

## Come

1. **Trascrizione contro guida**: le 114 righe di `script/antincendio_build.py`
   (pagine 6–31) confrontate a vista con le pagine della guida: classe, codice,
   stratigrafia, Rw, rapporti, fascicolo tecnico, Hmax/luce.
2. **Link contro guida**: per ogni rapporto con link, il link della guida sulla
   stessa riga (annotazioni del PDF).
3. **Link contro rapporto**: i 54 PDF scaricati e letti (testo, o a vista per le
   12 scansioni): numero del rapporto, classe, elemento provato.

## Esito

- **Trascrizione**: 114 righe su 114 uguali alla guida. Nessun refuso.
- **Link**: 87 riferimenti su 87 uguali al link della guida sulla stessa riga
  (gli altri 2 sono uguali, ma il testo accanto al link è spezzato su due righe).
- **Un link della guida non funziona più**: Ist. Giordano 351103-3915FR (p. 11 e
  14, AF-031) punta a `etexassets.azureedge.net`, dominio che non si risolve.
  Il file è su www.siniat.it ed è il rapporto giusto ("D125/M75 - 2 S-tex + 2 PS
  Plus BA13 - LR"): corretto in `HOST_DISMESSI` dello script e rigenerato.
- **Contenuto**: ogni PDF porta il numero di rapporto indicato. L'elemento
  provato è quello della riga, salvo i casi sotto, dove la guida abbina il
  rapporto di una configurazione affine insieme al fascicolo tecnico o
  all'EXAP. Non sono refusi di trascrizione: così è scritto nella guida.

| Configurazione (classe) | Rapporto linkato | Elemento provato nel rapporto |
|---|---|---|
| AF-012 D150/M75 6 PSplus (EI 60) | IG 338285-3822FR | D125/75 2+2 pregyplac plus BA13 |
| AF-013 D125/M50 6 PS LM (EI 60) | Efectis R001815 | D100/M50 2+2 pregyplac con lana; il rapporto ammette l'aumento dello spessore |
| AF-017 D130/M75 2 PF15 + 2 PF13 (EI 60) | IG 381598-4113FR | D105/M75 1+1 pregyflam BA15 |
| AF-018 D100/M50 4 PF13 LR (EI 60) | IG 351340-3917FR | D75/M50 2 solidtex LR (per EI 90 e 120 il rapporto è quello esatto, WFRG 19056B) |
| AF-022 D75/M50 2 LD LR (EI 60) | IG 351340-3917FR | D75/M50 2 solidtex LR |
| AF-024 D100/M50 4 LD LR (EI 60 / EI 120) | IG 351340-3917FR / WFRG 19056B | 2 solidtex LR / D100 2+2 pregyflam LR |
| AF-025 D100/M50 4 S-tex LR (EI 60) | IG 351340-3917FR | D75/M50 1+1 solidtex LR |
| AF-027 D125/M50 6 PF13 LR (EI 90) | WFRG 19056B | D100/M50 2+2 pregyflam LR |
| AF-033 D150/M75 6 PF13 (EI 120) | IG 381597-4112FR | D125/M75 2+2 pregyflam BA13 (per EI 180 il rapporto è quello esatto) |
| AF-034 D150/M75 6 PF13 LM (EI 120) | IG 381599-4114FR | D125/M75 2+2 pregyflam BA13 LV |
| AF-038 D175/M75 8 PF13 (EI 120) | IG 344892-3869FR | D160/M75 3+3 pregyflam BA15 |
| AF-043 D125/M75 4 LD LM (EI 120) | IG 381599-4114FR | D125/M75 2+2 pregyflam BA13 LV |
| AF-044 D125/M75 4 S-tex LM (EI 120) | IG 381599-4114FR | D125/M75 2+2 pregyflam BA13 LV |
| AF-045 D190/M75 6 PF15 + 2 PF13 (EI 180) | IG 383047-4129FR | D150/M75 3+3 pregyflam BA13 |
| AF-047 S140/2M50 3 S-tex LR (EI 60) | IG 351340-3917FR | D75/M50 1+1 solidtex LR |
| AF-055 parete esterna aquaboard (EI 120) | IG 386318-4160FR | Solidtex Wall System 240 |
| AF-066/067 CW95/M50 3 PF15 (EI 120) | CSTB RS12-076 + Est. 13/2 | controparete 3 pregyplac BA18; l'estensione ammette pregyflam BA15 |

Nell'app questi rapporti portano una nota sotto il link, nella scheda della
soluzione e nella scheda tecnica stampata: «prova su D125/M75 2+2 pregyflam
BA13, estesa dal fascicolo tecnico SI-017/06/2022». La parete provata sta in
`PROVATA` di `script/antincendio_build.py` (campo `provata` dei riferimenti);
lo script si ferma se una voce non trova più il suo rapporto.

Nomi diversi tra guida e rapporto, stessa configurazione: AF-037 (D165 / D160),
AF-049 (S150 / S155), AF-053 (S163 / S168), AF-072 (CW 40 / "CW43 - 2").

Refuso della guida confermato dal rapporto: AF-028 "D150/M75 - 6 PF13 - LM" è
provata senza isolante (IG 407264-4339FR, "3+3 PREGYFLAM BA13"); la distinta
dell'app già non mette la lana.

**Sostituzioni** (pregyflam BA15 al posto delle BA13, solidtex della guida): il
link resta quello della configurazione provata, come deve; la scheda dice "in
opera" la lastra usata e la dicitura del preventivo rimanda al rapporto.
