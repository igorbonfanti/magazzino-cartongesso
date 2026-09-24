import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAccesso } from '../lib/auth';
import { leggiBozzaLocale, scriviBozzaLocale } from '../lib/bozzaPreventivo';
import { bozzaPreventivoVuota, datiDaBozza, oggi, righeAZero, totaliBozza } from '../preventivo';
import type { BozzaPreventivo } from '../preventivo';
import { Passo } from './distinta/comuni';
import { StatoListino } from './Mappatura';
import Cliente from './preventivo/Cliente';
import { PiedeTotali } from './preventivo/Documento';
import Righe from './preventivo/Righe';
import { percentoABp } from '../money';

// Firestore arriva con il salvataggio
const remoto = () => import('../lib/preventiviRemoti');

/**
 * Il preventivo in lavorazione: nasce dalla distinta (passo 6, «Crea il
 * preventivo») o vuoto, resta nel browser finché non si salva. Salvando
 * prende il numero PCG e non cambia più: per rifarlo si duplica.
 */
export default function Preventivo() {
  const { utente, autorizzato } = useAccesso();
  const naviga = useNavigate();
  const avvisoArrivo = (useLocation().state as { avviso?: string } | null)?.avviso;
  const [bozza, setBozza] = useState<BozzaPreventivo | null>(leggiBozzaLocale);
  const [errori, setErrori] = useState<string[]>([]);
  const [inCorso, setInCorso] = useState(false);

  useEffect(() => {
    scriviBozzaLocale(bozza);
  }, [bozza]);

  if (!utente || !autorizzato) {
    return (
      <div className="testo">
        <h2>Preventivo</h2>
        <p className="avviso avviso-info">
          {utente ? 'Questo utente non è abilitato ai preventivi.' : <>Serve l'accesso: <Link to="/accesso">accedi</Link>.</>}
        </p>
      </div>
    );
  }

  async function nuovo() {
    const imp = await (await remoto()).leggiImpostazioni();
    setBozza(bozzaPreventivoVuota(imp.ivaBp));
  }

  if (!bozza) {
    return (
      <div className="preventivo">
        <div className="wizard-testa">
          <h2>Preventivo</h2>
        </div>
        <div className="ag-vuoto">
          <div className="ag-vuoto-icona">▭</div>
          <div className="ag-vuoto-testo">
            Nessun preventivo in corso. Si crea dalla <Link to="/distinta">distinta</Link> (passo 6, «Crea il preventivo») con i
            materiali e la scheda tecnica, oppure vuoto.
          </div>
        </div>
        <div className="azioni-scheda">
          <button className="btn btn-primary" onClick={() => void nuovo()}>
            Preventivo vuoto
          </button>
          <Link className="btn" to="/preventivi">
            Archivio
          </Link>
        </div>
      </div>
    );
  }

  const b = bozza;
  const aggiorna = (m: Partial<BozzaPreventivo>) => setBozza((x) => (x ? { ...x, ...m } : x));
  const t = totaliBozza(b);
  const ivaBp = percentoABp(b.iva) ?? 2200;

  async function salva() {
    setErrori([]);
    const r = await remoto();
    const imp = await r.leggiImpostazioni();
    const d = datiDaBozza(b, { data: oggi(), iban: imp.iban, creatoDa: utente?.email ?? '' });
    if ('errori' in d) {
      setErrori(d.errori);
      return;
    }
    const zero = righeAZero(b);
    if (zero && !window.confirm(`${zero === 1 ? 'Una riga resta' : `${zero} righe restano`} a 0,00 €. Salvare lo stesso?`)) return;
    setInCorso(true);
    try {
      const numero = await r.salvaPreventivo(d);
      scriviBozzaLocale(null);
      naviga(`/preventivi/${numero}`);
    } catch (e) {
      setErrori([r.messaggioErrore(e)]);
      setInCorso(false);
    }
  }

  function svuota() {
    if (window.confirm('Cancellare il preventivo in corso? Non è salvato.')) setBozza(null);
  }

  return (
    <div className="preventivo">
      <div className="wizard-testa">
        <h2>Preventivo</h2>
        <span className="nota">{b.daNumero ? `copia di ${b.daNumero}` : 'in lavorazione, non ancora numerato'}</span>
      </div>
      {avvisoArrivo && <p className="avviso avviso-info">{avvisoArrivo}</p>}
      <StatoListino />

      <Passo n={1} titolo="Cliente">
        <Cliente cliente={b.cliente} cambia={(cliente) => aggiorna({ cliente })} />
      </Passo>

      <Passo n={2} titolo="Righe">
        <Righe righe={b.righe} cambia={(righe) => aggiorna({ righe })} />
      </Passo>

      <Passo n={3} titolo="Totali e note">
        <div className="opzioni">
          <label className="opzione">
            <span className="ag-etichetta">IVA %</span>
            <input className="ag-campo ag-dati campo-corto" inputMode="decimal" value={b.iva} onChange={(e) => aggiorna({ iva: e.target.value })} />
          </label>
          <label className="opzione">
            <span className="ag-etichetta">Sconto arrotondamento €</span>
            <input
              className="ag-campo ag-dati campo-corto"
              inputMode="decimal"
              value={b.arrotondamento}
              placeholder="0,00"
              onChange={(e) => aggiorna({ arrotondamento: e.target.value })}
            />
          </label>
        </div>
        <p className="nota">Lo sconto arrotondamento si toglie dal totale IVA inclusa, come nel gestionale.</p>
        <label className="opzione">
          <span className="ag-etichetta">Note sul preventivo</span>
          <textarea className="ag-campo" rows={3} value={b.note} onChange={(e) => aggiorna({ note: e.target.value })} placeholder="validità, consegna, condizioni…" />
        </label>
        <PiedeTotali t={t} ivaBp={ivaBp} />
      </Passo>

      <Passo n={4} titolo="Scheda tecnica">
        {b.schede.length === 0 ? (
          <p className="nota">Nessuna soluzione: il preventivo si stampa senza la scheda tecnica.</p>
        ) : (
          <ul className="schede-preventivo">
            {b.schede.map((s, i) => (
              <li key={i}>
                <div>
                  <strong>{s.titolo}</strong>
                  <div className="articolo-meta">{s.riferimento}</div>
                  {s.dicitura && <div className="articolo-meta">In preventivo: «{s.dicitura}»</div>}
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => aggiorna({ schede: b.schede.filter((_, j) => j !== i) })}>
                  Togli
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="nota">Va in seconda pagina, con stratigrafia, classi, rapporti di classificazione e dicitura.</p>
      </Passo>

      {errori.length > 0 && (
        <ul className="avvisi">
          {errori.map((e) => (
            <li key={e} className="avviso avviso-attenzione">
              {e}
            </li>
          ))}
        </ul>
      )}
      <div className="azioni-scheda">
        <button className="btn btn-primary" disabled={inCorso} onClick={() => void salva()}>
          {inCorso ? 'Salvo…' : 'Salva e numera'}
        </button>
        <button className="btn btn-danger" disabled={inCorso} onClick={svuota}>
          Svuota
        </button>
      </div>
      <p className="nota">Salvando prende il prossimo numero PCG dell'anno e non si modifica più: per rifarlo si duplica dall'archivio.</p>
    </div>
  );
}
