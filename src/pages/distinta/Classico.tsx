import { PRESTAZIONI, PROFILI_PER_AMBITO, SISTEMI, SISTEMI_PER_AMBITO } from '../../data/sistemi';
import type { Bozza } from '../../lib/bozza';
import type { Ambito, Interasse, Modalita, Prestazione, Profilo } from '../../types';
import { CampiSfrido, Interruttore } from './comuni';

const PRESTAZIONI_ORDINE: Prestazione[] = ['standard', 'antincendio', 'idro', 'acustica'];

/** Il calcolo classico: le nove distinte storiche del magazzino, con le loro opzioni. */
export default function Classico({
  ambito,
  bozza,
  aggiorna,
}: {
  ambito: Ambito;
  bozza: Bozza;
  aggiorna: (m: Partial<Bozza>) => void;
}) {
  const acustica = PRESTAZIONI[bozza.prestazione].lanaObbligatoria;

  return (
    <div className="classico">
      <div>
        <span className="ag-etichetta">Sottotipo</span>
        <div className="scelte scelte-3">
          {SISTEMI_PER_AMBITO[ambito].map((id) => (
            <button
              key={id}
              className={`scelta ${bozza.sistemaId === id ? 'scelta-attiva' : ''}`}
              aria-pressed={bozza.sistemaId === id}
              onClick={() => aggiorna({ sistemaId: id })}
            >
              <strong>{SISTEMI[id].nome}</strong>
            </button>
          ))}
        </div>
      </div>

      {bozza.sistemaId && (
        <>
          <div>
            <span className="ag-etichetta">Prestazione richiesta</span>
            <div className="scelte scelte-4">
              {PRESTAZIONI_ORDINE.map((p) => (
                <button
                  key={p}
                  className={`scelta ${bozza.prestazione === p ? 'scelta-attiva' : ''}`}
                  aria-pressed={bozza.prestazione === p}
                  onClick={() => aggiorna({ prestazione: p })}
                >
                  <strong>{PRESTAZIONI[p].nome}</strong>
                </button>
              ))}
            </div>
            <p className="nota">La prestazione cambia solo la lastra cercata a magazzino, non le quantità.</p>
          </div>

          <div className="opzioni">
            <Interruttore<Interasse>
              etichetta="Interasse montanti"
              valore={bozza.interasse}
              voci={[
                [60, '60 cm'],
                [40, '40 cm'],
              ]}
              cambia={(v) => aggiorna({ interasse: v })}
            />
            <Interruttore<Profilo>
              etichetta="Profilo"
              valore={bozza.profilo}
              voci={PROFILI_PER_AMBITO[ambito].map((p) => [p, String(p)] as [Profilo, string])}
              cambia={(v) => aggiorna({ profilo: v })}
            />
            <Interruttore<Modalita>
              etichetta="Incidenze"
              valore={bozza.modalita}
              voci={[
                ['classica', 'Excel storico'],
                ['manuale', 'Manuale Fassa'],
              ]}
              cambia={(v) => aggiorna({ modalita: v })}
            />

            <label className="opzione opzione-spunta">
              <input
                type="checkbox"
                checked={bozza.isolante || acustica}
                disabled={acustica}
                onChange={(e) => aggiorna({ isolante: e.target.checked })}
              />
              <span>
                Lana di roccia
                {acustica && <em> — obbligatoria con prestazione acustica</em>}
              </span>
            </label>

            <CampiSfrido lastre={bozza.sfridoLastre} isolante={bozza.sfridoIsolante} cambia={aggiorna} />
          </div>
        </>
      )}
    </div>
  );
}
