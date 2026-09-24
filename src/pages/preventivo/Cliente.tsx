import { useEffect, useMemo, useState } from 'react';
import { cercaClienti, clienteDaAnagrafica, unisciClienti } from '../../lib/clienti';
import type { ClienteAnagrafica } from '../../lib/clienti';
import { clienteVuoto } from '../../preventivo';
import type { ClientePreventivo } from '../../preventivo';

// Storage e Firestore arrivano con il primo testo cercato.
const remoto = () => import('../../lib/clientiRemoti');

/**
 * Il cliente, facoltativo: dall'anagrafica del gestionale (sola lettura) o
 * scritto a mano. Un cliente nuovo resta su questo preventivo: in anagrafica
 * lo aggiunge il gestionale.
 */
export default function Cliente({ cliente, cambia }: { cliente: ClientePreventivo | null; cambia: (c: ClientePreventivo | null) => void }) {
  if (cliente) return <SchedaCliente cliente={cliente} cambia={cambia} />;
  return <CercaCliente scegli={cambia} />;
}

function CercaCliente({ scegli }: { scegli: (c: ClientePreventivo) => void }) {
  const [cerca, setCerca] = useState('');
  const [anagrafica, setAnagrafica] = useState<ClienteAnagrafica[] | null>(null);
  const [aMano, setAMano] = useState<ClienteAnagrafica[]>([]);
  const [avviso, setAvviso] = useState<string>();
  const attiva = cerca.trim().length >= 2;

  // clienti.xlsx si carica la prima volta che si cerca, poi resta in copia locale
  useEffect(() => {
    if (!attiva || anagrafica) return undefined;
    let vivo = true;
    void remoto()
      .then((r) => r.caricaClienti())
      .then((e) => {
        if (!vivo) return;
        setAnagrafica(e.clienti);
        setAvviso(e.errore);
      });
    return () => {
      vivo = false;
    };
  }, [attiva, anagrafica]);

  // i clienti aggiunti a mano nel gestionale: una ricerca dopo una breve pausa nella digitazione
  useEffect(() => {
    const q = cerca.trim();
    if (q.length < 2) {
      setAMano([]);
      return undefined;
    }
    let vivo = true;
    const t = window.setTimeout(() => {
      void remoto()
        .then((r) => r.cercaClientiManuali(q))
        .then((x) => {
          if (vivo) setAMano(x);
        });
    }, 350);
    return () => {
      vivo = false;
      window.clearTimeout(t);
    };
  }, [cerca]);

  const risultati = useMemo(
    () => unisciClienti(cercaClienti(anagrafica ?? [], cerca), cercaClienti(aMano, cerca)).slice(0, 20),
    [anagrafica, aMano, cerca],
  );

  return (
    <div className="cliente-cerca">
      <div className="opzioni">
        <label className="opzione opzione-larga">
          <span className="ag-etichetta">Cerca nell'anagrafica</span>
          <input className="ag-campo" value={cerca} onChange={(e) => setCerca(e.target.value)} placeholder="ragione sociale o P.IVA" />
        </label>
        <button className="btn" onClick={() => scegli(clienteVuoto())}>
          Scrivi a mano
        </button>
      </div>
      {avviso && <p className="avviso avviso-attenzione">{avviso}</p>}
      {attiva && !anagrafica && <p className="nota">Carico l'anagrafica…</p>}
      {risultati.length > 0 && (
        <ul className="risultati-listino">
          {risultati.map((c) => (
            <li key={`${c.ragione}|${c.piva}`}>
              <button className="scelta" onClick={() => scegli(clienteDaAnagrafica(c))}>
                <strong>{c.ragione}</strong>
                <span>
                  {[c.citta, c.piva && `P.IVA ${c.piva}`].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {attiva && anagrafica && risultati.length === 0 && <p className="nota">Nessun cliente con queste lettere.</p>}
      <p className="nota">Il cliente è facoltativo. Uno nuovo scritto qui resta sul preventivo: in anagrafica lo aggiunge il gestionale.</p>
    </div>
  );
}

function SchedaCliente({ cliente, cambia }: { cliente: ClientePreventivo; cambia: (c: ClientePreventivo | null) => void }) {
  const campo = (etichetta: string, chiave: keyof Omit<ClientePreventivo, 'daAnagrafica'>, extra: { segnaposto?: string; numerico?: boolean } = {}) => (
    <label className={`opzione ${chiave === 'ragione' || chiave === 'cantiere' ? 'opzione-larga' : ''}`}>
      <span className="ag-etichetta">{etichetta}</span>
      <input
        className="ag-campo"
        value={cliente[chiave]}
        inputMode={extra.numerico ? 'numeric' : undefined}
        placeholder={extra.segnaposto}
        onChange={(e) => {
          // la P.IVA scritta a mano solo cifre, come chiede la specifica; quella dell'anagrafica resta com'è
          const v = chiave === 'piva' && !cliente.daAnagrafica ? e.target.value.replace(/\D/g, '') : e.target.value;
          cambia({ ...cliente, [chiave]: v });
        }}
      />
    </label>
  );
  return (
    <div className="cliente-scheda">
      <div className="opzioni">
        {campo('Ragione sociale', 'ragione')}
        {campo('P.IVA', 'piva', { numerico: !cliente.daAnagrafica, segnaposto: 'solo cifre' })}
        {campo('Indirizzo', 'indirizzo')}
        {campo('Città', 'citta')}
        {campo('Email', 'email')}
        {campo('Telefono', 'tel')}
        {campo('Destinazione cantiere / note di consegna', 'cantiere')}
      </div>
      <p className="nota">
        {cliente.daAnagrafica
          ? "Dall'anagrafica del gestionale: le modifiche valgono solo per questo preventivo."
          : 'Scritto a mano: resta su questo preventivo, in anagrafica lo aggiunge il gestionale.'}
      </p>
      <div className="azioni-scheda">
        <button className="btn btn-sm" onClick={() => cambia(null)}>
          Cambia cliente
        </button>
      </div>
    </div>
  );
}
