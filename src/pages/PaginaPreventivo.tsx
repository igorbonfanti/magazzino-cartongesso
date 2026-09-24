import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAccesso } from '../lib/auth';
import { nuovoId } from '../lib/bozza';
import { leggiBozzaLocale, scriviBozzaLocale } from '../lib/bozzaPreventivo';
import { useDati } from '../lib/dati';
import { bozzaDaSalvato } from '../preventivo';
import type { PreventivoSalvato } from '../preventivo';
import Documento from './preventivo/Documento';

const remoto = () => import('../lib/preventiviRemoti');

/** Un preventivo salvato: come si stampa, con Stampa/PDF e Duplica. Non si modifica. */
export default function PaginaPreventivo() {
  const { numero = '' } = useParams();
  const { utente, autorizzato } = useAccesso();
  const dati = useDati();
  const naviga = useNavigate();
  const [p, setP] = useState<PreventivoSalvato | null>();
  const [errore, setErrore] = useState('');

  useEffect(() => {
    if (!autorizzato) return undefined;
    let vivo = true;
    void remoto().then((r) =>
      r.leggiPreventivo(numero).then(
        (x) => {
          if (vivo) setP(x);
        },
        (e: unknown) => {
          if (vivo) setErrore(r.messaggioErrore(e));
        },
      ),
    );
    return () => {
      vivo = false;
    };
  }, [numero, autorizzato]);

  if (!utente || !autorizzato) {
    return (
      <div className="testo">
        <h2>{numero}</h2>
        <p className="avviso avviso-info">
          {utente ? 'Questo utente non è abilitato ai preventivi.' : <>Serve l'accesso: <Link to="/accesso">accedi</Link>.</>}
        </p>
      </div>
    );
  }

  /** Il browser propone il titolo della pagina come nome del PDF: PCG-2026-0001.pdf */
  function stampa() {
    const titolo = document.title;
    document.title = numero;
    window.print();
    document.title = titolo;
  }

  function duplica() {
    if (!p) return;
    const inCorso = leggiBozzaLocale();
    if (inCorso?.righe.length && !window.confirm('C’è un preventivo in lavorazione non salvato: sostituirlo con la copia?')) return;
    const { bozza, aggiornati, spariti } = bozzaDaSalvato(p, dati.indice, dati.listino?.aggiornato ?? null, nuovoId);
    scriviBozzaLocale(bozza);
    const parti = [
      `Copia di ${p.numero} con i prezzi del listino di oggi`,
      aggiornati ? `${aggiornati} ${aggiornati === 1 ? 'prezzo cambiato' : 'prezzi cambiati'}` : 'prezzi invariati',
      spariti ? `${spariti} ${spariti === 1 ? 'articolo non è più' : 'articoli non sono più'} a listino (in giallo, con il prezzo di allora)` : '',
    ];
    naviga('/preventivo', { state: { avviso: `${parti.filter(Boolean).join(': ')}.` } });
  }

  return (
    <div className="preventivo">
      <div className="wizard-testa no-stampa">
        <h2>{numero}</h2>
        <Link className="btn btn-sm btn-ghost" to="/preventivi">
          Archivio
        </Link>
      </div>
      {errore && <p className="avviso avviso-attenzione no-stampa">{errore}</p>}
      {p === undefined && !errore && <p className="nota no-stampa">Carico il preventivo…</p>}
      {p === null && <p className="avviso avviso-attenzione no-stampa">{numero} non c’è nell’archivio.</p>}
      {p && (
        <>
          <div className="azioni-scheda no-stampa">
            <button className="btn btn-primary" onClick={stampa}>
              Stampa / PDF
            </button>
            <button className="btn" disabled={!dati.listino} onClick={duplica} title={dati.listino ? '' : 'Serve il listino caricato'}>
              Duplica
            </button>
          </div>
          <p className="nota no-stampa">
            Salvato da {p.creatoDa || '—'}
            {p.creatoIl ? ` il ${new Date(p.creatoIl).toLocaleString('it-IT')}` : ''}
            {p.daNumero ? ` · copia di ${p.daNumero}` : ''}. Per il PDF: Stampa, poi «Salva come PDF».
          </p>
          <Documento p={p} />
        </>
      )}
    </div>
  );
}
