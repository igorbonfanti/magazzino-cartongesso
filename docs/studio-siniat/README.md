# Studio dei manuali Siniat

Dati estratti a settembre 2026 dai tre manuali Siniat che il magazzino usa di più,
per costruire il **selettore di soluzioni** e il **catalogo sistemi** dell'app.
Pagina di consultazione (privata): https://claude.ai/artifact/Qy58hVgTkgyFvzd2p1jCEf

| Fonte | Versione | Cosa ci abbiamo preso |
|---|---|---|
| Guida pratica alle soluzioni antincendio | luglio 2026 | tutte le configurazioni certificate, con rapporti e link ai PDF |
| Memento 2024, guida completa | giugno 2025 | schede sistema: varianti, Hmax per interasse, Rw, incidenze al m², selettore Siniat |
| Manuale del posatore | luglio 2025 | regole di posa e quantitativi medi (contenuti in parte datati) |

**Per il fuoco fa fede la guida 2026**, e sopra di lei il rapporto di classificazione.
Il Memento e il posatore servono per statica, acustica, incidenze e regole di posa.

---

## File

`estrazioni/`
- `antincendio.json` — **96 configurazioni** consolidate da 114 righe del manuale. Ogni configurazione:
  stratigrafia, Rw, esposizione, elenco di classificazioni (classe, Hmax, luce, rapporti con URL),
  lastre sostituibili secondo le note del manuale, note e pagine. Più la tabella spessori per l'acciaio.
- `antincendio_certificati_url.json` — i 92 link dei QR code del PDF (rapporti su siniat.it, schede lastre).
- `acciaio_massivita.json` — 324 profili (IPE, HE, HD, HL, HP, UC, UPE, UPN), massività su 3 e 4 lati.
- `memento_*.json` / `.md` — le schede del Memento, una per sistema (53 in tutto), con varianti e incidenze.
- `posatore_1/2.json` / `.md` — best practice, regole di scelta, tavole prestazionali, quantitativi medi.
- `catalogo.json` — **il catalogo unico** che l'app userà: fuoco + sistemi Memento normalizzati + acciaio.

`script/`
- `antincendio_build.py` — la trascrizione della guida antincendio, una riga `R(...)` per riga del manuale.
  Si corregge **qui**, con la pagina, mai a mano nel JSON.
- `catalogo_build.py` — unisce le estrazioni in `catalogo.json`.

```
cd docs/studio-siniat/script
python antincendio_build.py
python catalogo_build.py
```

I JSON del Memento e del posatore sono stati estratti una volta sola con controlli automatici
(ogni numero confrontato con il testo del PDF) e verifica a vista delle pagine; gli script degli
agenti non sono stati conservati. Se Siniat pubblica nuove edizioni, si rifà l'estrazione.

---

## Regole da rispettare quando i dati entrano nell'app

1. **Hmax al fuoco ≠ Hmax statica.** Vale la minore: la guida lo dice in ogni tabella (#).
2. **Una classe più alta copre le più basse**, ma con la sua Hmax: EI 120 fino a 5 m non vuol dire EI 60 fino a 12 m.
3. **Sostituzioni solo quelle elencate** nella configurazione, con spessore almeno pari al provato. In più,
   per le prove EN 1364-1 (pareti, setti, contropareti), la stessa lastra più spessa: l'aumento dello
   spessore delle lastre è nel campo di applicazione diretta (art. 13) riportato nei rapporti di
   classificazione. Nell'app: pregyflam BA15 al posto delle BA13, fino a 4 m (decisione del 24/09/2026).
4. **Contropareti** vincolate: nessuna classe al fuoco propria; il loro Rw è con un muro di riferimento (44–46 dB).
5. **Acustica**: Rw di laboratorio; in opera si perdono 6–8 dB (tra unità diverse servono ≥ 50 dB in opera).
6. Il preventivo **cita** il rapporto, non certifica: la scelta del sistema la firma il tecnico antincendio,
   la posa la dichiara il posatore.

## Da verificare (con l'Ufficio Tecnico Siniat o sui rapporti)

- 3+3 pregyflam BA15: EI 180 fino a 5 m nel Memento, assente nella guida 2026 (il PDF del rapporto 344892-3869FR è intitolato EI 180).
- 2+2 pregyflam BA15: EI 120 fino a 6,9 m nel Memento, nella guida solo con C100 fino a 8 m.
- D135/M75: codice stampato "2 PF 15" con stratigrafia 2+2 (refuso); certificati intitolati con classi più alte di quelle in tabella (D147 BA18, D135 4 PF15 LM).
- D150/M75 6 PF13 "LM" senza isolante elencato; D125/M75 4 PF13 LM con lana 45 mm a p.7 e 40 mm a p.12.
- Tabella acciaio, Tcr 350 °C, R30, 360 m⁻¹: "2 Flam13" dopo "2 Flam15".
- aquaboard A2-s1,d0 (Memento) contro "aquaboard pro in classe A1" (guida 2026).
- Le incidenze Siniat (sfrido 5% incluso, h = 3 m) differiscono dall'Excel storico: montanti 1,8 contro 2,0 m/m², viti 20 contro 25.
- Le note "DA VERIFICARE" dentro i singoli JSON (una trentina, soprattutto refusi del Memento).
