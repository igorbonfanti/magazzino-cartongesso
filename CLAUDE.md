# magazzino-cartongesso — istruzioni per chi lavora su questo repository

Modulo *Cartongesso* della famiglia Il Magazzino Edile. Stesso standard di
`magazzino-scorte` (React + Vite + TS, motore puro, test contro valori
congelati, deploy con i test prima del build) e di `magazzino-gestionale`
(listino, catena dei prezzi, formato PREV).

---

## Le tre cose da non fare senza chiedere

**1. Non toccare le incidenze né le formule del motore** (`src/data/sistemi.ts`,
`src/engine.ts`) per far tornare un test. I valori attesi stanno in
`tests/distinte_attese.json` e non si riallineano all'output del motore: se
diventa rosso, il problema è nel motore o nelle incidenze.

**2. Non arrotondare mai il prezzo unitario netto.** Si arrotonda una volta
sola, il totale di riga (`totaleRigaCent` in `src/money.ts`). È la regola del
gestionale dal 18/09/2026: 100 pezzi da 0,95 al −10% fanno 85,50, non 86,00.

**3. Non scrivere nelle collection delle altre app.** Solo `cgp_*`. Il listino
(`listino.xlsx` su Storage) si legge e basta. Le regole Firestore stanno per
intero in `magazzino-scorte/firestore.rules`, unica copia versionata: il blocco
`cgp_*` va aggiunto lì, non sostituito.

---

## Com'è fatto

| | |
|---|---|
| `src/types.ts` | tipi di dominio (scelte del wizard, sistemi, voci) |
| `src/data/sistemi.ts` | incidenze, classica + manuale Fassa, con la fonte |
| `src/engine.ts` | motore puro: scelte + misure → distinta (calcolo classico, Excel/Fassa) |
| `src/selettore.ts` | selettore puro: requisiti → soluzioni Siniat compatibili, orditure possibili |
| `src/engine-siniat.ts` | motore puro: soluzione Siniat + misure → distinta (tabelle Memento o regole) |
| `src/data/siniat/catalogo.json` | GENERATO da `docs/studio-siniat/script/catalogo_app.py`: non si tocca a mano |
| `src/data/siniat/articoli.ts` | voci Siniat → chiavi degli articoli per `cgp_mapping`, confezioni |
| `src/lib/bozza.ts` | la bozza del wizard e la migrazione di quelle salvate |
| `src/lib/listino.ts` | lettura di `listino.xlsx` (pura, come il gestionale); `listinoRemoto.ts` lo scarica e lo tiene in IndexedDB |
| `src/lib/mappatura.ts` | voce della distinta → codice di listino; `mappaturaRemota.ts` legge e scrive `cgp_mapping` |
| `src/prezzi.ts` | prezzi delle righe: listino × (1 − sconto base) × quantità venduta |
| `src/preventivo.ts` | preventivo puro: righe dalla distinta, sconti, totali con arrotondamento, numero PCG, lettura e duplicazione |
| `src/schedaTecnica.ts` | la scheda tecnica del preventivo (stratigrafia, classi, rapporti, Rw, dicitura), fotografata alla creazione |
| `src/lib/preventiviRemoti.ts` | `cgp_preventivi`, `cgp_contatori/{anno}`, `cgp_impostazioni/preventivo` |
| `src/lib/clienti.ts`, `clientiRemoti.ts` | anagrafica clienti del gestionale, in sola lettura |
| `src/data/chiavi.ts` | tutte le voci che una distinta può contenere, per la pagina Mappatura |
| `src/lib/auth.tsx`, `ruoli.ts` | accesso email/password; autorizzati = gli UID di `autorizzato()` nelle regole |
| `src/money.ts` | centesimi interi; prime funzioni identiche a scorte, poi la catena dei prezzi |
| `src/lib/firebase.ts` | progetto condiviso `magazzino-edile-pos`, `COLL` con i nomi `cgp_*` |
| `tema.css`, `base.css` | condivisi, identici agli altri repository: non si modificano qui |
| `tests/` | `distinte_attese.json` congelato + test di motore e importi; catalogo, selettore e motore Siniat; listino, prezzi, voci della mappatura |

## Decisioni prese (23/09/2026)

- **Numerazione: serie separata `PCG-YYYY-NNNN`**, contatore in
  `cgp_contatori/{anno}` con transaction. Non `PREV-`: quella serie è del
  gestionale (`metadata/quoteCounter`, documenti in `quotes`) e due contatori
  sullo stesso prefisso darebbero numeri doppi. In stampa e nel nome file
  (`PCG-2026-0001.pdf`) vale lo stesso.
- **Sconti come nel gestionale:** sconto 1 = sconto base del listino
  (colonna sconto di `listino.xlsx`), sconto 2 = sconto extra del venditore,
  a cascata. Il netto unitario non si arrotonda.
- Wizard in pagina unica a sezioni numerate, distinta ricalcolata dal vivo.
- **Lastre a magazzino** (`src/data/magazzino.ts`): normali 6, 10 e 13 mm
  (pregyflex BA6, pregyplac BA10 e BA13), fuoco 15 mm (pregyflam BA15), idro
  13 mm (pregydro H2 BA13), rinforzate solidtex (indoor). Le altre su
  ordinazione da ATS Isolanti in 3–4 giorni. Il selettore mette prima le
  soluzioni tutte a magazzino. Per le configurazioni certificate usa le
  sostituzioni che la guida elenca per quella configurazione, con lastre dello
  stesso spessore; per le schede Memento nessuna sostituzione oltre alle note
  della scheda. Nel passo 3 l'interruttore *A magazzino / Su ordinazione /
  Tutte* (si parte da A magazzino, la scelta resta nella bozza). Con la Fase 3
  la disponibilità passerà al listino.
- **Pregyflam BA15 al posto delle BA13** (deciso il 24/09/2026): è la proposta
  di partenza per le certificate provate con la UNI EN 1364-1 (pareti, setti,
  contropareti); le solidtex della guida restano un'opzione nella scheda della
  soluzione. Base: l'aumento dello spessore delle lastre è nel campo di
  applicazione diretta (art. 13) che ogni rapporto di classificazione riporta.
  Limiti: fino a 4 m (oltre, le altezze della guida vengono dagli EXAP), non
  per controsoffitti e solai, non in ambiente umido (le pregyflam non sono
  lastre H): lì valgono le solidtex o le lastre da ordinare. Le classi si
  mostrano fino a 4 m, la dicitura del preventivo lo dice con il rapporto da
  verificare. `sostituzioniMagazzino(c, 'spessore' | 'guida')`, fonte
  `spessore`.
- **Sfrido di partenza 10% su lastre e isolante** (confermato il 23/09/2026). Il
  caso reale della specifica (285 pannelli) resta calcolato senza sfrido sulla
  lana, come nella specifica: il test lo tiene così.

## Fase 3 — listino, mappatura, prezzi (23/09/2026)

- **Accesso** email e password come scorte, persistente. La distinta resta
  aperta a tutti; listino, prezzi, mappatura (e poi i preventivi) solo agli UID
  di `autorizzato()`, copiati in `src/lib/ruoli.ts`: vanno tenuti allineati.
- **Listino**: `listino.xlsx` su Storage, letto con le regole del gestionale
  (intestazione nelle prime 10 righe; sconto, fornitore e categoria nelle
  colonne F, I, K). Si riscarica se cambia la data del file; la copia vale 24
  ore e sta in **IndexedDB**, non in localStorage, perché l'origine
  `igorbonfanti.github.io` è condivisa e il gestionale ne occupa già la quota.
- **Prezzi in decimillesimi di euro** (0,0125 € = 125): il listino può avere
  più di due decimali. Il totale di riga si arrotonda una volta sola, al
  centesimo (`totaleRigaDaListino`), come `totaleRigaCent`.
- **Mappatura** in `cgp_mapping/{chiave}`: codice di listino, prezzo riferito
  alla confezione o all'unità di misura (lastre al m²), sconto extra di
  partenza per la Fase 4. Dove non c'è vale `mapping_seed.ts`. Il codice si
  sceglie dal listino, non si scrive.
- **Confezione dell'articolo** (24/09/2026): la mappatura dice anche quanto
  contiene un articolo del listino e come si chiama (MICRO = rotolo da 23 ml,
  BIACAR5 = rotolo da 20 ml, lastra 3,6 m²). L'articolo non si divide: "Da
  ordinare" diventa il numero di articoli (`conConfezione` in `prezzi.ts`, con
  lo sfrido contato come il motore). È una proprietà dell'articolo: si salva
  sempre, anche se uguale a quella della voce, e toglie dalla riga le verifiche
  su formato e lunghezze. La proposta viene dalla descrizione
  (`confezioneDaDescrizione`), si conferma a mano. Le mappature senza
  confezione (di partenza, o salvate prima) usano quella della voce. Montanti
  contati per posizione con barre più lunghe di 3 m: pezzi invariati e nota.
- **Voci che dipendono dalla struttura**: banda `BANDA_50/75/100/150` per
  larghezza del montante (BIACAR5 per il 50…), `BANDA_PERIMETRALE` per i
  controsoffitti, `BANDA_POLIETILENE` solo per le pareti perimetrali esterne
  a doppia orditura; lana Siniat `LANA_<tipo>_SP<mm>[_D<kg/m³>]` con lo
  spessore della scheda o dell'abbinamento al montante (`spessoreIsolante`).
  `LANA_ROCCIA` del motore classico resta com'è.
- **Regole `cgp_*`**: in `magazzino-scorte/firestore.rules` dal commit
  `3ea5d5a` (testo e motivi in `docs/regole-firestore-cgp.md`); valgono solo
  dopo la pubblicazione in console. Finché non ci sono, la mappatura salvata
  non funziona e l'app lo dice.
- Firestore, Storage e SheetJS si caricano solo dopo l'accesso.

## Fase 4 — preventivo (24/09/2026)

- **Il preventivo si fa qui, non nel gestionale**: il PREV del gestionale non
  ha spazio per la dicitura e la scheda tecnica, e il gestionale non accetta
  righe da fuori (carrello solo in memoria). Serie `PCG-YYYY-NNNN`.
- **Flusso**: distinta, passo 6, «Crea il preventivo» (o «Aggiungi al
  preventivo in corso»: le stesse voci si sommano, le schede si accodano) →
  `/preventivo`, bozza in localStorage `cartongesso.preventivo` → «Salva e
  numera»: contatore `cgp_contatori/{anno}` e documento `cgp_preventivi/{numero}`
  nella stessa transazione, così un salvataggio fallito non consuma numeri →
  `/preventivi/{numero}`: non si modifica, si duplica (con i prezzi del
  listino di oggi; gli articoli spariti dal listino restano gialli con il
  netto di allora) → Stampa/PDF dal browser, il titolo della pagina diventa
  il nome del file.
- **Righe**: quelle del listino hanno prezzo e sconto base fissi e lo sconto
  extra di partenza della mappatura; quelle senza articolo del listino sono
  gialle, prezzo da scrivere, codice mai inventato; righe fuori listino a
  mano. Sconto arrotondamento sul totale IVA inclusa, imponibile scorporato
  (`scorporaIva`), come il gestionale.
- **Cliente**: facoltativo; dall'anagrafica del gestionale in sola lettura
  (`clienti.xlsx` in copia locale e la collection `clienti` cercata per inizio
  di ragione sociale: ha decine di migliaia di documenti, non si legge tutta),
  oppure scritto a mano. Un cliente nuovo resta sul preventivo: in anagrafica
  lo aggiunge il gestionale. Qui non si scrive in `clienti`.
- **Stampa**: prima pagina come i PREV (intestazione, numero verde, righe,
  totali, dicitura, IBAN), seconda la scheda tecnica. La data è quella del
  preventivo anche ristampando. IBAN e IVA di partenza in
  `cgp_impostazioni/preventivo` (si cambiano dall'archivio; di partenza l'IBAN
  che il gestionale stampa), l'IBAN si fotografa su ogni preventivo.
- Da fare: invio per email e WhatsApp.

## Studio dei manuali Siniat (23/09/2026)

In `docs/studio-siniat/`: catalogo estratto dai manuali Siniat (guida antincendio
luglio 2026, Memento 2024, manuale del posatore), con 96 configurazioni
certificate al fuoco (rapporti e link), 53 schede sistema con varianti e
incidenze, tabelle acciaio. Deciso il **flusso integrato**: il selettore è
l'inizio del wizard, non un'app separata. Per il fuoco fa fede la guida 2026; i
dati si correggono negli script (refusi del Memento in `CORREZIONI_VOCI`), non
nei JSON, e si rigenera con `python catalogo_app.py`.

Il wizard: 1 cosa realizzi → 2 requisiti (fuoco, Rw, altezza, ambiente, urti,
carichi, antieffrazione) → 3 soluzione (configurazioni certificate della guida,
schede Memento, oppure il calcolo classico per parete/controparete/controsoffitto)
→ 4 scheda della soluzione (stratigrafia, classi con i link ai rapporti, orditura
scelta fra quelle che reggono l'altezza) → 5 misure → 6 distinta.

Regole del selettore da non perdere:
- altezza utile = minore fra Hmax al fuoco e Hmax statica; "Hmax > 4 m" (hmaxOltre)
  non limita;
- la configurazione certificata è la **minima**: montanti più grandi, accoppiati o
  interassi più fitti sono ammessi e si dicono all'operatore;
- le classi al fuoco del Memento rimandano sempre alla configurazione della guida;
- ambiente umido = lastre di tipo H a vista (pregydro, ladura, solidtex, aquaboard);
  nelle schede con lastre standard vale la nota della scheda (pregydro H2 al posto
  delle pregyplac BA13), con avviso e sostituzione in distinta;
- l'app riporta classi e Rw dichiarati da Siniat con il riferimento, non li certifica.

Distinta Siniat: incidenze Memento per m² (sfrido Siniat 5% già dentro; su lastre
e isolante si toglie e si mette il nostro), guide e montanti corretti con la
geometria come nel classico, tasselli uno ogni 50 cm di guida (posatore). Per le
certificate senza scheda con le stesse lastre: `incidenzeDaRegola`, verificata
contro tutte le tabelle di pareti e setti (eccezioni documentate nel test).

Le chiavi di `localStorage` vanno prefissate `cartongesso.`: tutte le app
stanno su `igorbonfanti.github.io` e condividono la stessa origine. Unica
eccezione voluta: `magazzino.tema`, che è comune a tutte.

---

# Specifica originale

Webapp della serie Il Magazzino Edile: dato cosa preventivare (parete / controparete / controsoffitto in cartongesso + prestazione: standard, antincendio, idro, acustica) genera
1. la distinta materiali con gli articoli reali del magazzino (listino su Firebase);
2. un preventivo cliente numerato (PREV-YYYY-NNNN), sconti per riga, IVA, totale, stampabile e archiviato.

Formato output = preventivi attuali: CODICE | DESCRIZIONE | LISTINO € | SC.% | NETTO € | QTÀ | TOTALE €, poi Totale Netto, IVA 22%, Totale IVA incl., coordinate bancarie.

## Stack e convenzioni (obbligatorie)
- React 18 + Vite + TypeScript, mobile-friendly (banco + tablet). **Niente Tailwind**: tema.css + base.css condivisi (DESIGN_SYSTEM.md), per decisione del 23/09/2026 di allinearsi a magazzino-scorte
- Listino: NON è una collection Firestore ma `listino.xlsx` su Firebase Storage, lo stesso del gestionale (codice, descrizione, prezzo, sconto base, fornitore, categoria)
- HashRouter, `base` in `vite.config.ts` = nome repo → GitHub Pages
- Firebase project CONDIVISO: collection nuove tutte prefissate `cgp_` (`cgp_preventivi`, `cgp_sistemi`, `cgp_mapping`, `cgp_contatori`, `cgp_impostazioni`). Rules: solo blocco `cgp_*` da aggiungere in merge, MAI sostituire il file rules
- Soldi SEMPRE in centesimi interi via `src/money.ts`; formattazione it-IT solo in output. Nessun float sui prezzi
- Commenti di dominio in italiano; fasi con stop di verifica

## Flusso
1. Cosa: Parete | Controparete | Controsoffitto
2. Sottotipo — Parete: singola lastra/lato · doppia lastra/lato · doppia orditura (dorso/dorso). Controparete: singola · doppia · singola con cavaliere. Controsoffitto: sospeso (orditura doppia) · Porta F · aderenza
3. Prestazione (cambia SOLO l'articolo lastra + hint, non le incidenze): Standard → BA13 (BA10 controsoffitti); Antincendio → lastra ignifuga, hint doppia lastra + i40, dicitura "sistema da verificare su certificato produttore" (mai certificare); Idro → H2; Acustica → lastra acustica + lana obbligatoria + hint doppia lastra
4. Opzioni: interasse 60 (default)/40; profilo parete 75/50, controparete 75/50/30, controsoffitto 30 fisso; lana sì/no (default sì, obbligatoria se acustica); sfrido % default 10 su lastre e isolante; modalità incidenze "classica" (Excel storico, default) / "manuale Fassa"
5. Misure: più campiture (mq diretti o L×H), detrazione aperture L×H cad., mq totali
6. Distinta: articolo generico, incidenza/mq, quantità (sfrido dove previsto), contenuto confezione, pezzi (ROUNDUP), articolo magazzino associato
7. Preventivo: listino da Firebase, fino a 2 sconti a cascata per riga, netto, qtà, totale; sconti default in `cgp_mapping`; righe manuali; IVA configurabile; numerazione con transaction su `cgp_contatori/{anno}`; IBAN in `cgp_impostazioni`; Stampa/PDF, Salva, Duplica, Nuovo; archivio con ricerca; cliente facoltativo (ragione sociale + P.IVA solo cifre)

## Motore (§4)
```
quantità = incidenza_mq × mq  [× (1+sfrido) solo lastre e isolante]
pezzi    = CEIL(quantità / contenuto_confezione)
```
Distinte in `src/data/sistemi.ts` (classica + manuale, fonte commentata), motore puro in `src/engine/calcolo.ts`.

### Incidenze "classica" (Excel storico, i60)
- PARETE singola: lastra 2,0 (conf 2,4 mq) · guida 0,67 ml (barra 3) · montante 2,0 ml (barra 3) · lana 1,0 mq (pannello 0,72) · tasselli 1,7 (conf 100) · viti 25 25 (conf 1000) · velovetro 3,0 ml (rotolo 90) · stucco 0,7 kg (sacco 10)
- PARETE doppia: lastra 4,0 · viti 25 45 · stucco 1,0 (resto come singola)
- PARETE dorso/dorso: come doppia, montante 4,0
- CONTROPARETE singola: lastra 1,0 · guida 0,67 · montante 2,0 · lana 1,0 · tasselli 1,7 · viti 25 13 · velovetro 1,5 · stucco 0,5
- CONTROPARETE doppia: lastra 2,0 · viti 25 20
- CONTROPARETE cavaliere: singola + cavaliere 4 pz/mq
- CONTROSOFFITTO sospeso: lastra BA10 1,0 · guida 30 0,4 · montante 30 3,0 · lana 1,0 · tasselli farfalla 0,84 · pendini 0,84 (conf 2) · viti 25 15 · velovetro 1,2 · stucco 0,4 · gancio ortogonale (Excel 7 = refuso, usare valore Fassa ~1,4–2) · gancio molla 0,84
- CONTROSOFFITTO Porta F: come sospeso, montante 2,1 + Porta F 0,9 ml (barra 3), senza gancio ortogonale
- CONTROSOFFITTO aderenza: lastra 1,0 · guida 0,4 · montante 2,0 · lana 1,0 · tasselli 2,0 · viti 15 · velovetro 1,2 · stucco 0,4 · cavaliere 2,0; senza pendini/ganci

### Correzioni geometriche (sempre, pareti/contropareti)
- Guide: con L×H calcolo geometrico 2×L in barre da 3 m
- Montanti: n = FLOOR(L/interasse)+1 per campitura; h ≤ 3 → 1 barra/montante; h > 3 → ml = n×h arrotondato a barre
- Avvisi: h > 4 m con profilo 75 a i60 → suggerire i40 / dorso-dorso / cavalieri; pareti > 15 m → giunto di dilatazione ogni 10 m (UNI 11424)

### Modalità "manuale Fassa"
- i40: montante 2,6 ml/mq (5,2 dorso/dorso); cavaliere 2,6 pz/mq (1,8 a i60)
- Doppia lastra: viti 25 solo 1ª lastra (5–8 parete, 3–4 controparete) + viti 35 2ª lastra (15–21 parete, 8–11 controparete)
- Orditura doppia parete: guida 1,4 ml/mq

### Test obbligatori (`src/engine/calcolo.test.ts`)
9 sistemi a 100 mq, sfrido 0, classica = Excel storico. Caso reale: controparete singola 75, campiture 30×2,50 + 30×4,32, i60, sfrido 10% → 95 lastre, 137 montanti, 40 guide (geometrico), 285 pannelli lana, 4 conf tasselli, 3 conf viti 25, 4 rotoli velovetro, 11 sacchi stucco.

## Listino / mapping
- Collection listino esistente (nome e schema da chiedere/esplorare); `cgp_mapping`: articolo generico → codice magazzino (+ sconti default)
- Seed: LASTRA_BA13_STD→CAR13 · GUIDA_75→GUI7 · MONTANTE_75→MON7 · TASSELLI→AKF202M · VITI_25→CARTOVIT2 · VITI_35→CARTOVIT3 · VELOVETRO→VELO90 · STUCCO→STUGES
- Da mappare: lastra ignifuga, idrolastra, acustica, BA10, guida/montante 50 e 30, lana di roccia, pendini, ganci, tasselli farfalla, Porta F, cavaliere
- Articolo non mappato → riga gialla, prezzo 0 editabile. MAI inventare prezzi o codici
- Cache listino localStorage TTL 24h + refresh manuale, usabile offline

## Stampa
Layout identico ai PREV: intestazione "Il Magazzino Edile S.r.l.", data, numero PREV verde, tabella, Totale Netto / IVA / Totale IVA incl. evidenziato, coordinate bancarie. `@media print` dedicato. Nome file suggerito `PREV-2026-0231.pdf`.

## Non fare
Non toccare collections/rules di altre app · niente float sui soldi · non certificare REI/acustica · non inventare prezzi/codici

## Fasi (stop di verifica a fine di ognuna)
1. Scaffold + money.ts + sistemi.ts + motore + test verdi
2. Wizard completo con distinta a video (prezzi 0)
3. Firebase: esplorazione listino → mapping → prezzi reali; regole `cgp_*` in merge
4. Preventivo: sconti, numerazione, salvataggio, archivio, stampa
5. Deploy GitHub Pages + collaudo con il caso reale

## Note di implementazione (decisioni prese in Fase 1 — da confermare)
Vedi commenti `DA CONFERMARE` in `src/data/sistemi.ts` e `src/engine/calcolo.ts`.
