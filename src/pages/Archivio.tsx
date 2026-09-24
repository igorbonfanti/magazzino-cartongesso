import { useEffect, useState } from 'react';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { useAccesso } from '../lib/auth';
import { leggiBozzaLocale, scriviBozzaLocale } from '../lib/bozzaPreventivo';
import { ibanLeggibile, ibanValido } from '../lib/impostazioni';
import type { ImpostazioniPreventivo } from '../lib/impostazioni';
import { formattaEuro, formattaPercento, percentoABp } from '../money';
import { bozzaPreventivoVuota, dataItaliana } from '../preventivo';
import type { PreventivoSalvato } from '../preventivo';

const remoto = () => import('../lib/preventiviRemoti');

/** L'archivio dei preventivi PCG, dal più recente, con la ricerca e le impostazioni di stampa. */
export default function Archivio() {
  const { utente, autorizzato } = useAccesso();
  const naviga = useNavigate();
  const [elenco, setElenco] = useState<PreventivoSalvato[]>([]);
  const [cursore, setCursore] = useState<QueryDocumentSnapshot | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState('');
  const [filtro, setFiltro] = useState('');

  async function carica(dopo: QueryDocumentSnapshot | null) {
    setCaricamento(true);
    setErrore('');
    const r = await remoto();
    try {
      const pagina = await r.elencoPreventivi(dopo);
      setElenco((x) => (dopo ? [...x, ...pagina.preventivi] : pagina.preventivi));
      setCursore(pagina.cursore);
      if (pagina.scartati) setErrore(`${pagina.scartati} documenti non leggibili sono stati saltati.`);
    } catch (e) {
      setErrore(r.messaggioErrore(e));
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    if (autorizzato) void carica(null);
  }, [autorizzato]);

  if (!utente || !autorizzato) {
    return (
      <div className="testo">
        <h2>Archivio preventivi</h2>
        <p className="avviso avviso-info">
          {utente ? 'Questo utente non è abilitato ai preventivi.' : <>Serve l'accesso: <Link to="/accesso">accedi</Link>.</>}
        </p>
      </div>
    );
  }

  async function nuovo() {
    if (!leggiBozzaLocale()) {
      const imp = await (await remoto()).leggiImpostazioni();
      scriviBozzaLocale(bozzaPreventivoVuota(imp.ivaBp));
    }
    naviga('/preventivo');
  }

  const parole = filtro.toLowerCase().split(/\s+/).filter(Boolean);
  const visibili = elenco.filter((p) => parole.every((w) => `${p.numero.toLowerCase()} ${p.cerca}`.includes(w)));

  return (
    <div className="mappatura">
      <div className="wizard-testa">
        <h2>Archivio preventivi</h2>
        <button className="btn btn-sm btn-primary" onClick={() => void nuovo()}>
          {leggiBozzaLocale() ? 'Preventivo in corso' : 'Nuovo preventivo'}
        </button>
      </div>

      <div className="opzioni">
        <label className="opzione opzione-larga">
          <span className="ag-etichetta">Cerca</span>
          <input className="ag-campo" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="numero, cliente, P.IVA, cantiere" />
        </label>
      </div>
      {errore && <p className="avviso avviso-attenzione">{errore}</p>}
      {filtro && cursore && <p className="nota">La ricerca guarda i preventivi caricati: se manca, carica gli altri.</p>}

      {visibili.length > 0 ? (
        <div className="ag-tabella-wrap">
          <table className="ag-tabella tabella-mappatura">
            <thead>
              <tr>
                <th>Numero</th>
                <th>Data</th>
                <th>Cliente</th>
                <th className="r">Totale</th>
              </tr>
            </thead>
            <tbody>
              {visibili.map((p) => (
                <tr key={p.numero} className="cliccabile" onClick={() => naviga(`/preventivi/${p.numero}`)}>
                  <td className="ag-mono">{p.numero}</td>
                  <td>{dataItaliana(p.data)}</td>
                  <td>
                    <div className="articolo-nome">{p.cliente?.ragione ?? '—'}</div>
                    <div className="articolo-meta">
                      {[p.cliente?.cantiere, p.schede.map((s) => s.titolo).join(' + ')].filter(Boolean).join(' · ')}
                    </div>
                  </td>
                  <td className="r">{formattaEuro(p.totali.finaleCent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !caricamento && <p className="nota">{elenco.length ? 'Nessun preventivo con queste parole.' : 'Nessun preventivo salvato.'}</p>
      )}
      {caricamento && <p className="nota">Carico…</p>}
      {cursore && !caricamento && (
        <button className="btn btn-sm" onClick={() => void carica(cursore)}>
          Carica altri
        </button>
      )}

      <Impostazioni />
    </div>
  );
}

/** IBAN e IVA di partenza: valgono per i preventivi che si salvano da qui in avanti. */
function Impostazioni() {
  const [imp, setImp] = useState<ImpostazioniPreventivo | null>(null);
  const [iban, setIban] = useState('');
  const [iva, setIva] = useState('');
  const [esito, setEsito] = useState('');

  useEffect(() => {
    let vivo = true;
    void remoto()
      .then((r) => r.leggiImpostazioni())
      .then((x) => {
        if (!vivo) return;
        setImp(x);
        setIban(ibanLeggibile(x.iban));
        setIva(formattaPercento(x.ivaBp));
      });
    return () => {
      vivo = false;
    };
  }, []);

  async function salva() {
    const i = ibanValido(iban);
    const ivaBp = percentoABp(iva);
    if (!i) return setEsito('IBAN non valido.');
    if (ivaBp === null || iva.trim() === '') return setEsito('Aliquota IVA non valida.');
    const r = await remoto();
    try {
      await r.salvaImpostazioni({ iban: i, ivaBp });
      setImp({ iban: i, ivaBp });
      setEsito('Salvate.');
    } catch (e) {
      setEsito(r.messaggioErrore(e));
    }
  }

  return (
    <details className="ag-card impostazioni-preventivo">
      <summary>Impostazioni del preventivo</summary>
      {!imp ? (
        <p className="nota">Carico…</p>
      ) : (
        <>
          <div className="opzioni">
            <label className="opzione opzione-larga">
              <span className="ag-etichetta">Coordinate bancarie (IBAN)</span>
              <input className="ag-campo ag-dati" value={iban} onChange={(e) => setIban(e.target.value)} />
            </label>
            <label className="opzione">
              <span className="ag-etichetta">IVA di partenza %</span>
              <input className="ag-campo ag-dati campo-corto" inputMode="decimal" value={iva} onChange={(e) => setIva(e.target.value)} />
            </label>
          </div>
          <div className="azioni-scheda">
            <button className="btn btn-sm" onClick={() => void salva()}>
              Salva
            </button>
            {esito && <span className="nota">{esito}</span>}
          </div>
          <p className="nota">Valgono per i preventivi salvati da qui in avanti: quelli in archivio restano con l'IBAN che avevano.</p>
        </>
      )}
    </details>
  );
}
