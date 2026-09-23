import { useEffect, useMemo, useState } from 'react';
import { PRESTAZIONI, PROFILI_PER_AMBITO, SISTEMI, SISTEMI_PER_AMBITO } from '../data/sistemi';
import { calcolaDistinta } from '../engine';
import { bozzaValida, bozzaVuota, conAmbito, sceltePerMotore } from '../lib/bozza';
import type { Bozza } from '../lib/bozza';
import type { Ambito, Interasse, Modalita, Prestazione, Profilo } from '../types';
import Misure from './distinta/Misure';
import TabellaDistinta from './distinta/TabellaDistinta';

const CHIAVE_BOZZA = 'cartongesso.bozza';

const AMBITI: { id: Ambito; nome: string; nota: string }[] = [
  { id: 'parete', nome: 'Parete', nota: 'divisoria, lastre sui due lati' },
  { id: 'controparete', nome: 'Controparete', nota: 'contro un muro esistente' },
  { id: 'controsoffitto', nome: 'Controsoffitto', nota: 'sospeso, Porta F, in aderenza' },
];

const PRESTAZIONI_ORDINE: Prestazione[] = ['standard', 'antincendio', 'idro', 'acustica'];

/** Rilegge la bozza lasciata a meta': al banco capita di essere interrotti. */
function bozzaIniziale(): Bozza {
  try {
    const salvata = JSON.parse(localStorage.getItem(CHIAVE_BOZZA) ?? 'null');
    if (bozzaValida(salvata)) return salvata;
  } catch {
    /* bozza illeggibile: si riparte da capo */
  }
  return bozzaVuota();
}

export default function Distinta() {
  const [bozza, setBozza] = useState<Bozza>(bozzaIniziale);

  useEffect(() => {
    try {
      localStorage.setItem(CHIAVE_BOZZA, JSON.stringify(bozza));
    } catch {
      /* si continua senza ricordarsela */
    }
  }, [bozza]);

  const scelte = useMemo(() => sceltePerMotore(bozza), [bozza]);
  const distinta = useMemo(() => (scelte ? calcolaDistinta(scelte) : null), [scelte]);

  const aggiorna = (modifiche: Partial<Bozza>) => setBozza((b) => ({ ...b, ...modifiche }));
  const acustica = PRESTAZIONI[bozza.prestazione].lanaObbligatoria;

  function ricomincia() {
    if (window.confirm('Cancellare le scelte e le misure e ripartire da capo?')) setBozza(bozzaVuota());
  }

  return (
    <div className="wizard">
      <div className="wizard-testa">
        <h2>Nuova distinta</h2>
        <button className="btn btn-sm btn-ghost" onClick={ricomincia}>
          Ricomincia
        </button>
      </div>

      <Passo n={1} titolo="Cosa preventiviamo">
        <div className="scelte scelte-3">
          {AMBITI.map((a) => (
            <button
              key={a.id}
              className={`scelta ${bozza.ambito === a.id ? 'scelta-attiva' : ''}`}
              aria-pressed={bozza.ambito === a.id}
              onClick={() => setBozza((b) => conAmbito(b, a.id))}
            >
              <strong>{a.nome}</strong>
              <span>{a.nota}</span>
            </button>
          ))}
        </div>
      </Passo>

      {bozza.ambito && (
        <Passo n={2} titolo="Sottotipo">
          <div className="scelte scelte-3">
            {SISTEMI_PER_AMBITO[bozza.ambito].map((id) => (
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
        </Passo>
      )}

      {bozza.sistemaId && bozza.ambito && (
        <>
          <Passo n={3} titolo="Prestazione richiesta">
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
          </Passo>

          <Passo n={4} titolo="Opzioni tecniche">
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
                voci={PROFILI_PER_AMBITO[bozza.ambito].map((p) => [p, String(p)] as [Profilo, string])}
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

              <label className="opzione">
                <span className="ag-etichetta">Sfrido lastre %</span>
                <input
                  className="ag-campo ag-dati campo-corto"
                  inputMode="numeric"
                  value={bozza.sfridoLastre}
                  onChange={(e) => aggiorna({ sfridoLastre: e.target.value })}
                />
              </label>
              <label className="opzione">
                <span className="ag-etichetta">Sfrido isolante %</span>
                <input
                  className="ag-campo ag-dati campo-corto"
                  inputMode="numeric"
                  value={bozza.sfridoIsolante}
                  onChange={(e) => aggiorna({ sfridoIsolante: e.target.value })}
                />
              </label>
            </div>
          </Passo>

          <Passo n={5} titolo="Misure">
            <Misure campiture={bozza.campiture} cambia={(campiture) => aggiorna({ campiture })} distinta={distinta} />
          </Passo>

          <Passo n={6} titolo="Distinta materiali">
            {distinta && <TabellaDistinta distinta={distinta} />}
          </Passo>
        </>
      )}
    </div>
  );
}

function Passo({ n, titolo, children }: { n: number; titolo: string; children: React.ReactNode }) {
  return (
    <section className="ag-card passo">
      <h3 className="passo-titolo">
        <span className="passo-numero">{n}</span>
        {titolo}
      </h3>
      {children}
    </section>
  );
}

/** Scelta fra poche voci, a bottoni affiancati. */
function Interruttore<T extends string | number>({
  etichetta,
  valore,
  voci,
  cambia,
}: {
  etichetta: string;
  valore: T;
  voci: [T, string][];
  cambia: (v: T) => void;
}) {
  return (
    <div className="opzione">
      <span className="ag-etichetta">{etichetta}</span>
      <div className="interruttore" role="group" aria-label={etichetta}>
        {voci.map(([v, nome]) => (
          <button
            key={String(v)}
            className={`btn btn-sm ${valore === v ? 'attivo' : ''}`}
            aria-pressed={valore === v}
            onClick={() => cambia(v)}
          >
            {nome}
          </button>
        ))}
      </div>
    </div>
  );
}
