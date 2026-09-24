import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { terminiRicerca, vociNote } from '../data/chiavi';
import type { VoceNota } from '../data/chiavi';
import { useAccesso } from '../lib/auth';
import { leggiNumero } from '../lib/bozza';
import { useDati } from '../lib/dati';
import { cercaArticoli, confezioneDaDescrizione } from '../lib/listino';
import type { ArticoloListino } from '../lib/listino';
import { confezioneDaRivedere, mappaturaPer } from '../lib/mappatura';
import type { Mappatura as MappaturaSalvata } from '../lib/mappatura';
import { formattaIntero, formattaPercento, formattaPrezzoListino, percentoABp } from '../money';
import { prezzoUnitaSospetto } from '../prezzi';
import { Interruttore, singolare } from './distinta/comuni';

/**
 * Mappatura degli articoli: ogni voce della distinta (LASTRA_BA13_STD,
 * VITI_S_TEX_32_MM…) collegata a un codice del listino. Si salva in
 * cgp_mapping e vale per tutti; le voci di partenza vengono dai preventivi
 * già fatti. Il codice non si inventa: si sceglie dal listino.
 */
export default function Mappatura() {
  const { utente, autorizzato } = useAccesso();
  const dati = useDati();
  const [parametri, setParametri] = useSearchParams();
  const [filtro, setFiltro] = useState('');
  const [soloDaMappare, setSoloDaMappare] = useState(false);
  const [soloDaRivedere, setSoloDaRivedere] = useState(false);
  const voci = useMemo(() => vociNote(), []);
  const scelta = parametri.get('chiave');

  if (!utente || !autorizzato) {
    return (
      <div className="testo">
        <h2>Mappatura degli articoli</h2>
        <p className="avviso avviso-info">
          {utente ? 'Questo utente non è abilitato a listino e mappatura.' : <>Serve l'accesso: <Link to="/accesso">accedi</Link>.</>}
        </p>
      </div>
    );
  }

  const conMappatura = voci.map((v) => {
    const m = mappaturaPer(v.chiave, dati.mappature);
    const art = m ? dati.indice.get(m.codice) : undefined;
    // la confezione salvata che la descrizione dell'articolo smentisce (montanti "a rotoli"…)
    const rivedere = m && art ? confezioneDaRivedere(v, m, art.descrizione) : null;
    // il prezzo del pezzo preso per quello della confezione (0,12 € la scatola da 100 tasselli)
    const prezzo = m && art ? prezzoUnitaSospetto(v, m.prezzoPer, m.contenuto ?? v.contenuto, art.prezzo) : null;
    return { v, m, art, rivedere, prezzo };
  });
  const daMappare = conMappatura.filter((x) => !x.m).length;
  const daRivedere = conMappatura.filter((x) => x.rivedere || x.prezzo !== null).length;
  const parole = filtro.toLowerCase().split(/\s+/).filter(Boolean);
  const visibili = conMappatura.filter(
    (x) =>
      (!soloDaMappare || !x.m) &&
      (!soloDaRivedere || x.rivedere || x.prezzo !== null) &&
      parole.every((p) => `${x.v.chiave} ${x.v.descrizione} ${x.m?.codice ?? ''}`.toLowerCase().includes(p)),
  );
  const apri = (chiave: string | null) => setParametri(chiave ? { chiave } : {}, { replace: true });
  // la prossima voce da mappare dopo quella aperta, nell'ordine dell'elenco (poi si ricomincia da capo)
  const qui = visibili.findIndex((x) => x.v.chiave === scelta);
  const prossima = scelta
    ? [...visibili.slice(qui + 1), ...visibili.slice(0, Math.max(qui, 0))].find((x) => !x.m && x.v.chiave !== scelta)?.v.chiave
    : undefined;

  return (
    <div className="mappatura">
      <div className="wizard-testa">
        <h2>Mappatura degli articoli</h2>
        <span className="nota">
          {formattaIntero(voci.length - daMappare)} di {formattaIntero(voci.length)} voci collegate al listino
        </span>
      </div>
      <p className="nota">
        Ogni voce della distinta va collegata a un codice del listino. Quelle «di partenza» vengono dai preventivi già fatti;
        quelle salvate stanno in cgp_mapping e valgono per tutti gli utenti.
      </p>

      <StatoListino />
      {dati.avvisoMappature && <p className="avviso avviso-attenzione">{dati.avvisoMappature}</p>}

      <div className="opzioni">
        <label className="opzione">
          <span className="ag-etichetta">Cerca una voce</span>
          <input className="ag-campo" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="lastra, viti 25, GUIDA_75…" />
        </label>
        <label className="opzione opzione-spunta">
          <input type="checkbox" checked={soloDaMappare} onChange={(e) => setSoloDaMappare(e.target.checked)} />
          <span>Solo da mappare ({daMappare})</span>
        </label>
        {(daRivedere > 0 || soloDaRivedere) && (
          <label className="opzione opzione-spunta">
            <input type="checkbox" checked={soloDaRivedere} onChange={(e) => setSoloDaRivedere(e.target.checked)} />
            <span>Da rivedere ({daRivedere})</span>
          </label>
        )}
      </div>

      {scelta && (
        <Scheda
          // aperta prima che arrivino le mappature salvate (pagina ricaricata su ?chiave=…), la
          // scheda partirebbe da quella di partenza: quando arriva la salvata, si riapre con quella
          key={`${scelta}|${mappaturaPer(scelta, dati.mappature)?.origine ?? ''}`}
          voce={voci.find((v) => v.chiave === scelta) ?? voceSconosciuta(scelta)}
          chiudi={() => apri(null)}
          {...(prossima ? { avanti: () => apri(prossima) } : {})}
        />
      )}

      <div className="ag-tabella-wrap">
        <table className="ag-tabella tabella-mappatura">
          <thead>
            <tr>
              <th>Voce della distinta</th>
              <th>Codice</th>
              <th className="nascondi-telefono">Articolo di listino</th>
            </tr>
          </thead>
          <tbody>
            {visibili.map(({ v, m, art, rivedere, prezzo }) => {
              return (
                <tr key={v.chiave} className={`cliccabile ${m ? '' : 'da-mappare'} ${scelta === v.chiave ? 'riga-scelta' : ''}`} onClick={() => apri(v.chiave)}>
                  <td>
                    <div className="articolo-nome">{v.descrizione}</div>
                    <div className="articolo-meta">
                      <span className="ag-mono">{v.chiave}</span>
                      <span>{v.fonti.join(' · ')}</span>
                    </div>
                  </td>
                  <td>
                    {m ? (
                      <>
                        <span className="ag-mono">{m.codice}</span>
                        <div className="articolo-meta">
                          {m.origine === 'partenza' ? 'di partenza' : 'salvata'}
                          {m.contenuto && (m.contenuto !== v.contenuto || (m.confezione ?? v.umConf) !== v.umConf)
                            ? ` · ${singolare(m.confezione ?? v.umConf)} da ${decimale(m.contenuto)} ${v.um}`
                            : ''}
                          {m.prezzoPer === 'um' ? ` · prezzo al ${v.um}` : ''}
                        </div>
                        {rivedere && (
                          <div className="articolo-meta">
                            <span className="ag-pastiglia pastiglia-ambra">confezione da rivedere</span> la descrizione dice{' '}
                            {singolare(rivedere.confezione)} da {decimale(rivedere.contenuto)} {v.um}
                          </div>
                        )}
                        {prezzo !== null && (
                          <div className="articolo-meta">
                            <span className="ag-pastiglia pastiglia-ambra">prezzo da rivedere</span> a confezione sono{' '}
                            {formattaPrezzoListino(Math.max(1, Math.round(prezzo)))} € al {v.um}: sembra il prezzo del {v.um}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="ag-pastiglia pastiglia-arancio">da mappare</span>
                    )}
                  </td>
                  <td className="nascondi-telefono">
                    {m && !art && dati.listino && <span className="ag-pastiglia pastiglia-rossa">non nel listino</span>}
                    {art && (
                      <>
                        <div>{art.descrizione}</div>
                        <div className="articolo-meta">
                          {formattaPrezzoListino(art.prezzo)} €{art.scontoBp ? ` · sconto ${formattaPercento(art.scontoBp)}%` : ''}
                          {art.um ? ` · ${art.um}` : ''}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function voceSconosciuta(chiave: string): VoceNota {
  return { chiave, descrizione: chiave, categoria: '', um: 'pz', contenuto: 1, umConf: 'pz', fonti: [] };
}

/** Riga di stato del listino, con l'aggiornamento a mano. */
export function StatoListino() {
  const { listino, caricamento, avvisoListino, aggiornaListino } = useDati();
  return (
    <div className="stato-listino">
      <span>
        {caricamento
          ? 'Carico il listino…'
          : listino
            ? `Listino del ${new Date(listino.aggiornato).toLocaleDateString('it-IT')} · ${formattaIntero(listino.articoli.length)} articoli`
            : 'Listino non caricato'}
      </span>
      <button className="btn btn-sm btn-ghost" disabled={caricamento} onClick={() => void aggiornaListino()}>
        Aggiorna
      </button>
      {avvisoListino && <span className="avviso avviso-attenzione">{avvisoListino}</span>}
    </div>
  );
}

/** La scheda di una voce: cerca nel listino, scegli, salva. */
function Scheda({ voce, chiudi, avanti }: { voce: VoceNota; chiudi: () => void; avanti?: () => void }) {
  const dati = useDati();
  const attuale = mappaturaPer(voce.chiave, dati.mappature);
  const salvata: MappaturaSalvata | undefined = dati.mappature.get(voce.chiave);
  // si parte dal codice che c'è già, altrimenti da parole adatte alla voce
  const [cerca, setCerca] = useState(attuale?.codice ?? terminiRicerca(voce));
  const [codice, setCodice] = useState(attuale?.codice ?? '');
  const [prezzoPer, setPrezzoPer] = useState<'confezione' | 'um'>(attuale?.prezzoPer ?? 'confezione');
  const [sconto, setSconto] = useState(attuale?.scontoExtraBp ? formattaPercento(attuale.scontoExtraBp) : '');
  // quanto contiene un articolo: quello salvato, altrimenti quello della voce
  const [contenuto, setContenuto] = useState(decimale(attuale?.contenuto ?? voce.contenuto));
  const [confezione, setConfezione] = useState(attuale?.confezione ?? voce.umConf);
  const [errore, setErrore] = useState('');
  const [inCorso, setInCorso] = useState(false);
  const scheda = useRef<HTMLElement>(null);

  // la scheda sta sopra l'elenco: se si è cliccata una voce in fondo, la si porta in vista.
  // Con le graffe: Chrome recente fa restituire una Promise a scrollIntoView, e un effetto
  // che restituisce qualcosa che non è una funzione manda in errore React quando la
  // scheda si chiude (era la pagina vuota dopo "Salva").
  useEffect(() => {
    scheda.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const risultati = useMemo(() => (dati.listino ? cercaArticoli(dati.listino.articoli, cerca) : []), [dati.listino, cerca]);
  const articolo: ArticoloListino | undefined = codice ? dati.indice.get(codice) : undefined;
  const scontoBp = percentoABp(sconto);
  const contenutoNum = leggiNumero(contenuto);
  // quello che la descrizione dell'articolo scelto dice della confezione, e se il modulo lo rispetta
  const proposta = articolo ? confezioneDaDescrizione(articolo.descrizione, voce.um, voce.umConf) : null;
  const comeProposta =
    !!proposta && contenutoNum !== null && Math.abs(proposta.contenuto - contenutoNum) < 1e-9 && proposta.confezione === confezione.trim();
  // pagato a confezione, il prezzo per unità che ne verrebbe: troppo basso = è il prezzo dell'unità
  const prezzoSospetto = articolo && contenutoNum ? prezzoUnitaSospetto(voce, 'confezione', contenutoNum, articolo.prezzo) : null;

  /**
   * Scegliendo un articolo, la confezione scritta nella sua descrizione diventa la
   * proposta; se la descrizione non la dice, quella salvata per lo stesso articolo o
   * quella della voce: mai quella dell'articolo cliccato prima.
   */
  function scegli(a: ArticoloListino) {
    setCodice(a.codice);
    const c = confezioneDaDescrizione(a.descrizione, voce.um, voce.umConf);
    const stesso = attuale?.codice === a.codice ? attuale : undefined;
    const quanto = c?.contenuto ?? stesso?.contenuto ?? voce.contenuto;
    setContenuto(decimale(quanto));
    setConfezione(c?.confezione ?? stesso?.confezione ?? voce.umConf);
    // 0,12 € per la scatola da 100 tasselli non può essere: si propone il prezzo al pz
    setPrezzoPer(prezzoUnitaSospetto(voce, 'confezione', quanto, a.prezzo) !== null ? 'um' : stesso?.prezzoPer ?? 'confezione');
  }

  async function salva(poi: () => void) {
    setErrore('');
    if (!articolo) return setErrore('Scegli un articolo del listino.');
    if (scontoBp === null) return setErrore('Sconto extra non valido.');
    if (!contenutoNum || contenutoNum <= 0) return setErrore(`Indica quanti ${voce.um} contiene un articolo.`);
    setInCorso(true);
    try {
      await dati.salvaMappatura({
        chiave: voce.chiave,
        codice: articolo.codice,
        prezzoPer,
        scontoExtraBp: scontoBp || undefined,
        // la confezione è dell'articolo del listino: confermata qui, vale anche se un domani cambia la voce
        contenuto: contenutoNum,
        confezione: confezione.trim() || voce.umConf,
      });
      poi();
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'Salvataggio non riuscito.');
      setInCorso(false);
    }
  }

  async function togli() {
    setErrore('');
    setInCorso(true);
    try {
      await dati.togliMappatura(voce.chiave);
      chiudi();
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'Operazione non riuscita.');
      setInCorso(false);
    }
  }

  return (
    <section className="ag-card scheda-mappatura" ref={scheda}>
      <div className="scheda-testa">
        <strong>{voce.descrizione}</strong>
        <span className="nota">
          <span className="ag-mono">{voce.chiave}</span> · in distinta{' '}
          {/* "a ml" per le voci sfuse (nastro, banda), "a lastre da 2,4 mq" per le confezioni */}
          {voce.contenuto === 1 && singolare(voce.umConf) === voce.umConf ? `a ${voce.um}` : `a ${voce.umConf} da ${decimale(voce.contenuto)} ${voce.um}`}
        </span>
      </div>
      <p className="nota">
        {attuale
          ? `Ora: ${attuale.codice} (${attuale.origine === 'partenza' ? 'di partenza' : `salvata${salvata?.aggiornatoDa ? ` da ${salvata.aggiornatoDa}` : ''}`}).`
          : 'Ora: da mappare.'}
      </p>

      {!dati.listino ? (
        <p className="avviso avviso-attenzione">Senza listino non si può scegliere il codice: aggiornalo e riprova.</p>
      ) : (
        <>
          <label className="opzione">
            <span className="ag-etichetta">Cerca nel listino</span>
            <input className="ag-campo" value={cerca} onChange={(e) => setCerca(e.target.value)} placeholder="codice, descrizione o fornitore" autoFocus />
          </label>
          {risultati.length > 0 && (
            <ul className="risultati-listino">
              {risultati.map((a) => (
                <li key={a.codice}>
                  <button className={`scelta ${codice === a.codice ? 'scelta-attiva' : ''}`} onClick={() => scegli(a)}>
                    <strong>
                      <span className="ag-mono">{a.codice}</span> {a.descrizione}
                    </strong>
                    <span>
                      {formattaPrezzoListino(a.prezzo)} €{a.scontoBp ? ` · sconto ${formattaPercento(a.scontoBp)}%` : ''}
                      {a.um ? ` · ${a.um}` : ''}
                      {a.fornitore ? ` · ${a.fornitore}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {cerca.trim() && risultati.length === 0 && <p className="nota">Nessun articolo del listino con queste parole.</p>}
        </>
      )}

      {articolo && (
        <div className="opzioni">
          <label className="opzione">
            <span className="ag-etichetta">Un articolo contiene</span>
            <span className="campo-con-unita">
              <input
                className={`ag-campo ag-dati campo-corto ${contenutoNum ? '' : 'campo-sbagliato'}`}
                inputMode="decimal"
                value={contenuto}
                onChange={(e) => setContenuto(e.target.value)}
              />
              <span>{voce.um}</span>
            </span>
          </label>
          <label className="opzione">
            <span className="ag-etichetta">Si vende a</span>
            {/* un menu e non un campo con suggerimenti: quelli mostravano solo il nome già scritto */}
            <select className="ag-campo campo-medio" value={confezione} onChange={(e) => setConfezione(e.target.value)}>
              {nomiConfezione(voce.umConf, confezione).map((n) => (
                <option key={n} value={n}>
                  {NOME_A_MENU[n] ?? n}
                </option>
              ))}
            </select>
          </label>
          <Interruttore<'confezione' | 'um'>
            etichetta="Il prezzo di listino è per"
            valore={prezzoPer}
            voci={[
              ['confezione', `1 ${singolare(confezione || voce.umConf)}`],
              ['um', `1 ${voce.um}`],
            ]}
            cambia={setPrezzoPer}
          />
          <label className="opzione">
            <span className="ag-etichetta">Sconto extra di partenza %</span>
            <input className="ag-campo ag-dati campo-corto" inputMode="decimal" value={sconto} onChange={(e) => setSconto(e.target.value)} placeholder="0" />
          </label>
          {proposta && comeProposta && (
            <p className="nota">
              Dalla descrizione: {singolare(proposta.confezione)} da {decimale(proposta.contenuto)} {voce.um}. Controlla e correggi se serve.
            </p>
          )}
          {proposta && !comeProposta && (
            <p className="avviso avviso-attenzione">
              La descrizione dice {singolare(proposta.confezione)} da {decimale(proposta.contenuto)} {voce.um}.{' '}
              <button
                className="btn btn-sm"
                onClick={() => {
                  setContenuto(decimale(proposta.contenuto));
                  setConfezione(proposta.confezione);
                }}
              >
                Usa questa
              </button>
            </p>
          )}
          {!proposta && (
            <p className="nota">La descrizione non dice la confezione: controlla quanto contiene un articolo e come si vende.</p>
          )}
          {prezzoSospetto !== null && contenutoNum && (
            <p className={prezzoPer === 'confezione' ? 'avviso avviso-attenzione' : 'nota'}>
              {formattaPrezzoListino(articolo.prezzo)} € per {singolare(confezione || voce.umConf)} da {decimale(contenutoNum)} {voce.um} sarebbero{' '}
              {formattaPrezzoListino(Math.max(1, Math.round(prezzoSospetto)))} € al {voce.um}: il prezzo del listino è quello del {voce.um}.
              {prezzoPer === 'confezione' && (
                <>
                  {' '}
                  <button className="btn btn-sm" onClick={() => setPrezzoPer('um')}>
                    Prezzo per 1 {voce.um}
                  </button>
                </>
              )}
            </p>
          )}
          {contenutoNum ? (
            <p className="nota">
              Esempio: per 100 {voce.um} servono {Math.ceil(Math.round((100 / contenutoNum) * 1e6) / 1e6)} {confezione || voce.umConf} {articolo.codice}, pagati{' '}
              {prezzoPer === 'um'
                ? `a ${voce.um} (${decimale(Math.ceil(Math.round((100 / contenutoNum) * 1e6) / 1e6) * contenutoNum)} ${voce.um})`
                : `a ${singolare(confezione || voce.umConf)}`}{' '}
              a {formattaPrezzoListino(articolo.prezzo)} €
              {/* il prezzo per unità fa saltare all'occhio il prezzo del pezzo preso per quello della confezione (0,0012 € al pz) */}
              {prezzoPer === 'confezione' && contenutoNum > 1
                ? `, cioè ${formattaPrezzoListino(Math.round(articolo.prezzo / contenutoNum))} € al ${voce.um}`
                : ''}
              {articolo.scontoBp ? `, meno lo sconto base del ${formattaPercento(articolo.scontoBp)}%` : ''}.
            </p>
          ) : null}
        </div>
      )}

      {errore && <p className="avviso avviso-attenzione">{errore}</p>}

      <div className="azioni-scheda">
        {avanti && (
          <button className="btn btn-primary" disabled={!articolo || inCorso} onClick={() => void salva(avanti)}>
            Salva e vai alla prossima
          </button>
        )}
        <button className={`btn ${avanti ? '' : 'btn-primary'}`} disabled={!articolo || inCorso} onClick={() => void salva(chiudi)}>
          Salva
        </button>
        {salvata && (
          <button className="btn btn-danger" disabled={inCorso} onClick={() => void togli()}>
            Togli la mappatura salvata
          </button>
        )}
        <button className="btn btn-ghost" onClick={chiudi}>
          Chiudi
        </button>
      </div>
    </section>
  );
}

/** I nomi delle confezioni, al plurale come nella distinta: il menu «Si vende a». */
const NOMI_CONFEZIONE = ['barre', 'lastre', 'pannelli', 'rotoli', 'sacchi', 'secchi', 'pacchi', 'scatole', 'conf.', 'pz'];

/** Come si leggono nel menu i nomi che non si capiscono da soli: le voci sfuse e le sigle. */
const NOME_A_MENU: Record<string, string> = {
  'conf.': 'confezioni', pz: 'pezzi', m: 'metri, sfuso', ml: 'metri, sfuso', mq: 'm², sfuso', 'm²': 'm², sfuso', kg: 'kg, sfuso',
};

/** Il menu: i nomi di sempre, più quello della voce e quello salvato se sono altri (banda "a m"). */
function nomiConfezione(nomeVoce: string, attuale: string): string[] {
  return [...new Set([...NOMI_CONFEZIONE, nomeVoce, attuale.trim()].filter(Boolean))];
}

/** 23 → "23"; 2.4 → "2,4" */
function decimale(x: number): string {
  return String(Math.round(x * 1000) / 1000).replace('.', ',');
}
