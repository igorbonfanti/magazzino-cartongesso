import { useMemo, useState } from 'react';
import { nuovoId } from '../../lib/bozza';
import { useDati } from '../../lib/dati';
import { cercaArticoli } from '../../lib/listino';
import type { ArticoloListino } from '../../lib/listino';
import { formattaCent, formattaPercento, formattaPrezzoListino } from '../../money';
import { calcolaRiga, nettoUnitario } from '../../preventivo';
import type { RigaBozzaPreventivo } from '../../preventivo';

/**
 * Le righe del preventivo: quelle del listino hanno prezzo e sconto base
 * fissi (si cambiano sconto extra e quantità), quelle fuori listino si
 * scrivono tutte. Le gialle vengono da voci della distinta senza un articolo
 * del listino: il prezzo va scritto, il codice non si inventa.
 */
export default function Righe({ righe, cambia }: { righe: RigaBozzaPreventivo[]; cambia: (r: RigaBozzaPreventivo[]) => void }) {
  const dati = useDati();
  const [cerca, setCerca] = useState('');
  const risultati = useMemo(
    () => (dati.listino && cerca.trim().length >= 2 ? cercaArticoli(dati.listino.articoli, cerca, 10) : []),
    [dati.listino, cerca],
  );

  const modifica = (id: string, m: Partial<RigaBozzaPreventivo>) => cambia(righe.map((r) => (r.id === id ? { ...r, ...m } : r)));
  const togli = (id: string) => cambia(righe.filter((r) => r.id !== id));

  function dalListino(a: ArticoloListino) {
    cambia([
      ...righe,
      { id: nuovoId(), tipo: 'listino', codice: a.codice, descrizione: a.descrizione, um: a.um || 'pz', prezzoDm: a.prezzo, sconto1Bp: a.scontoBp, prezzo: '', sconto2: '', qta: '1' },
    ]);
    setCerca('');
  }

  function fuoriListino() {
    cambia([...righe, { id: nuovoId(), tipo: 'manuale', codice: '', descrizione: '', um: 'pz', prezzoDm: 0, sconto1Bp: 0, prezzo: '', sconto2: '', qta: '1' }]);
  }

  return (
    <div className="righe-preventivo">
      {righe.length > 0 && (
        <div className="ag-tabella-wrap">
          <table className="ag-tabella tabella-preventivo">
            <thead>
              <tr>
                <th>Codice</th>
                <th>Descrizione</th>
                <th className="r">Listino €</th>
                <th className="r">Sc. base</th>
                <th className="r">Sc. extra %</th>
                <th className="r">Netto €</th>
                <th className="r">Qtà</th>
                <th className="r">Totale €</th>
                <th aria-label="Togli" />
              </tr>
            </thead>
            <tbody>
              {righe.map((r) => {
                const c = calcolaRiga(r);
                const manuale = r.tipo === 'manuale';
                return (
                  <tr key={r.id} className={r.daMappare ? 'da-mappare' : ''}>
                    <td>
                      {manuale ? (
                        <input className="ag-campo ag-dati campo-codice" value={r.codice} placeholder="—" onChange={(e) => modifica(r.id, { codice: e.target.value })} />
                      ) : (
                        <span className="ag-mono">{r.codice}</span>
                      )}
                    </td>
                    <td>
                      {manuale ? (
                        <input className="ag-campo campo-descrizione" value={r.descrizione} placeholder="descrizione" onChange={(e) => modifica(r.id, { descrizione: e.target.value })} />
                      ) : (
                        r.descrizione
                      )}
                      {r.daMappare && !r.prezzo.trim() && (
                        <div className="articolo-meta">voce della distinta senza articolo del listino: prezzo da scrivere</div>
                      )}
                    </td>
                    <td className="r">
                      {manuale ? (
                        <input className="ag-campo ag-dati campo-corto" inputMode="decimal" value={r.prezzo} placeholder="0,00" onChange={(e) => modifica(r.id, { prezzo: e.target.value })} />
                      ) : (
                        formattaPrezzoListino(r.prezzoDm)
                      )}
                    </td>
                    <td className="r">{!manuale && r.sconto1Bp > 0 ? `-${formattaPercento(r.sconto1Bp)}%` : '—'}</td>
                    <td className="r">
                      <input className="ag-campo ag-dati campo-corto" inputMode="decimal" value={r.sconto2} placeholder="0" onChange={(e) => modifica(r.id, { sconto2: e.target.value })} />
                    </td>
                    <td className="r">{'errore' in c ? '—' : nettoUnitario(c)}</td>
                    <td className="r">
                      <span className="campo-con-unita">
                        <input className="ag-campo ag-dati campo-corto" inputMode="decimal" value={r.qta} onChange={(e) => modifica(r.id, { qta: e.target.value })} />
                        {manuale ? (
                          <input className="ag-campo campo-um" value={r.um} onChange={(e) => modifica(r.id, { um: e.target.value })} />
                        ) : (
                          <span>{r.um}</span>
                        )}
                      </span>
                    </td>
                    <td className="r da-ordinare">{'errore' in c ? <span className="errore-riga">{c.errore}</span> : formattaCent(c.totaleCent)}</td>
                    <td>
                      <button className="btn btn-sm btn-ghost" title="Togli la riga" onClick={() => togli(r.id)}>
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="opzioni righe-aggiungi">
        <label className="opzione opzione-larga">
          <span className="ag-etichetta">Aggiungi dal listino</span>
          <input
            className="ag-campo"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder={dati.listino ? 'codice o descrizione' : 'listino non caricato'}
            disabled={!dati.listino}
          />
        </label>
        <button className="btn" onClick={fuoriListino}>
          Riga fuori listino
        </button>
      </div>
      {risultati.length > 0 && (
        <ul className="risultati-listino">
          {risultati.map((a) => (
            <li key={a.codice}>
              <button className="scelta" onClick={() => dalListino(a)}>
                <strong>
                  <span className="ag-mono">{a.codice}</span> {a.descrizione}
                </strong>
                <span>
                  {formattaPrezzoListino(a.prezzo)} €{a.scontoBp ? ` · sconto ${formattaPercento(a.scontoBp)}%` : ''}
                  {a.um ? ` · ${a.um}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
