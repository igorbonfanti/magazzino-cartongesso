# Regole Firestore per le collection `cgp_*` — proposta

Le regole del progetto `magazzino-edile-pos` stanno per intero in
`magazzino-scorte/firestore.rules`, l'unica copia versionata, e si pubblicano
incollando **tutto** il file nella console Firebase. Il blocco qui sotto va
**aggiunto** a quel file, senza toccare le regole delle altre app.

Finché non è pubblicato, l'app cartongesso funziona lo stesso: la distinta e i
prezzi del listino sì, ma la mappatura salvata no. Firestore risponde
«permission-denied», l'app lo dice e usa la mappatura di partenza.

## 1. Nell'intestazione, dopo il paragrafo "SETTEMBRE 2026 — APP SCORTE"

```
// ---------------------------------------------------------------------------
// SETTEMBRE 2026 — APP CARTONGESSO
//
// Entra l'app cartongesso (distinte e preventivi di pareti e controsoffitti,
// numerati PCG-YYYY-NNNN), con le collection cgp_*. Nessun utente nuovo: le
// usa chi e' in autorizzato(); i magazzinieri non vi accedono.
// ---------------------------------------------------------------------------
```

## 2. Prima del blocco finale "Tutto il resto: nega"

```
    // =======================================================================
    // APP CARTONGESSO (distinte e preventivi PCG-YYYY-NNNN)
    // =======================================================================
    // Tutte le collection cgp_*: cgp_mapping (voce della distinta -> codice
    // di listino), cgp_preventivi, cgp_contatori, cgp_impostazioni.
    // Una regola sola per il prefisso, come chiede la specifica dell'app: il
    // nome della collection deve cominciare per cgp_, quindi nient'altro del
    // progetto passa di qui. Solo agli autorizzati, come preventivi e clienti
    // del gestionale. Si cancella solo una mappatura sbagliata: preventivi e
    // contatori no.
    match /{collezione}/{documento} {
      allow read, create, update: if collezione.matches('cgp_.*') && autorizzato();
      allow delete: if collezione == 'cgp_mapping' && autorizzato();
    }
```

## Come si pubblica

1. Si aggiungono i due pezzi a `magazzino-scorte/firestore.rules` (posso farlo
   io, con un commit in quel repository, quando mi dai l'ok).
2. Nella console Firebase, Firestore Database → Regole, si incolla il file
   intero e si pubblica.
3. Si controlla subito che scorte, gestionale, ordini e solleciti funzionino:
   il blocco nuovo concede e basta, non toglie niente agli altri.

## Il listino

`listino.xlsx` si legge da Firebase Storage con lo stesso utente del
gestionale: le regole di Storage non cambiano.
