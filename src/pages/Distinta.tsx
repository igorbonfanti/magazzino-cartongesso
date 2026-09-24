import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { calcolaDistinta } from '../engine';
import { calcolaDistintaSiniat } from '../engine-siniat';
import {
  ambitoClassico,
  bozzaVuota,
  campiturePerMotore,
  conOpera,
  leggiBozza,
  requisitiPerSelettore,
  sceltePerMotore,
  sfridoPerMotore,
} from '../lib/bozza';
import type { Bozza, RequisitiBozza, SoluzioneBozza } from '../lib/bozza';
import { conOrditura, OPERE, operaInfo, orditurePossibili, selezionaSoluzioni } from '../selettore';
import type { Candidato } from '../selettore';
import type { SoluzioneScelta } from '../types';
import type { RigaDistinta } from '../engine';
import { useAccesso } from '../lib/auth';
import { useDati } from '../lib/dati';
import { adattaRighe, prezzaRiga } from '../prezzi';
import type { RigaVenduta } from '../prezzi';
import { StatoListino } from './Mappatura';
import Classico from './distinta/Classico';
import { CampiSfrido, Passo } from './distinta/comuni';
import Misure from './distinta/Misure';
import Requisiti from './distinta/Requisiti';
import SchedaSoluzione from './distinta/SchedaSoluzione';
import Soluzioni from './distinta/Soluzioni';
import TabellaDistinta from './distinta/TabellaDistinta';

const CHIAVE_BOZZA = 'cartongesso.bozza';

/** Rilegge la bozza lasciata a meta': al banco capita di essere interrotti. */
function bozzaIniziale(): Bozza {
  try {
    const salvata = leggiBozza(JSON.parse(localStorage.getItem(CHIAVE_BOZZA) ?? 'null'));
    if (salvata) return salvata;
  } catch {
    /* bozza illeggibile: si riparte da capo */
  }
  return bozzaVuota();
}

export default function Distinta() {
  const [bozza, setBozza] = useState<Bozza>(bozzaIniziale);
  const { utente, autorizzato } = useAccesso();
  const dati = useDati();
  /** le righe con le confezioni degli articoli mappati (rotoli da 23 ml…), per chi vede la mappatura */
  const vendute = (righe: RigaDistinta[]): RigaVenduta[] => (autorizzato ? adattaRighe(righe, dati.mappature) : righe);
  /** i prezzi riga per riga, se c'è il listino */
  const prezza = (righe: RigaDistinta[]) =>
    autorizzato && dati.listino ? righe.map((r) => prezzaRiga(r, dati.mappature, dati.indice)) : null;
  const statoPrezzi = !utente ? (
    <p className="nota">
      <Link to="/accesso">Accedi</Link> per vedere i prezzi del listino.
    </p>
  ) : autorizzato ? (
    <StatoListino />
  ) : null;

  useEffect(() => {
    try {
      localStorage.setItem(CHIAVE_BOZZA, JSON.stringify(bozza));
    } catch {
      /* si continua senza ricordarsela */
    }
  }, [bozza]);

  const aggiorna = (modifiche: Partial<Bozza>) => setBozza((b) => ({ ...b, ...modifiche }));
  const aggiornaRequisiti = (r: Partial<RequisitiBozza>) => setBozza((b) => ({ ...b, requisiti: { ...b.requisiti, ...r } }));

  // il selettore gira solo quando cambiano opera o requisiti, non a ogni misura digitata
  const req = requisitiPerSelettore(bozza);
  const chiaveReq = JSON.stringify(req);
  const soluzioni = useMemo(() => (req ? selezionaSoluzioni(req) : null), [chiaveReq]);

  const sol = bozza.soluzione;
  const candidato: Candidato | null =
    sol && sol.tipo !== 'classico' && soluzioni
      ? [...soluzioni.certificate, ...soluzioni.sistemi].find((c) => c.tipo === sol.tipo && c.id === sol.id) ?? null
      : null;
  const orditure = useMemo(
    () => (candidato && req ? orditurePossibili(candidato.tipo, candidato.id, req) : []),
    [candidato?.tipo, candidato?.id, chiaveReq],
  );
  // l'orditura scelta a mano vale finché è fra quelle che reggono i requisiti
  const manuale =
    sol && sol.tipo !== 'classico' && sol.varianteId
      ? orditure.find((o) => o.v.id === sol.varianteId && o.interasse === sol.interasse)
      : undefined;
  const effettivo = candidato && manuale ? conOrditura(candidato, manuale) : candidato;

  const campiture = campiturePerMotore(bozza);
  const scelta: SoluzioneScelta | null = effettivo
    ? {
        tipo: effettivo.tipo,
        id: effettivo.id,
        varianteId: effettivo.variante?.varianteId ?? null,
        interasse: effettivo.variante?.interasse ?? null,
        ...(effettivo.sostituzioni ? { sostituzioni: effettivo.sostituzioni } : {}),
      }
    : null;
  const distintaSiniat =
    scelta && effettivo?.distinta
      ? calcolaDistintaSiniat(scelta, campiture, { sfrido: sfridoPerMotore(bozza), hmaxUtile: effettivo.hmaxUtile })
      : null;
  const siniatOk = distintaSiniat && !('errore' in distintaSiniat) ? distintaSiniat : null;

  const scelte = sol?.tipo === 'classico' ? sceltePerMotore(bozza) : null;
  const distintaClassica = scelte ? calcolaDistinta(scelte) : null;

  const op = bozza.opera ? operaInfo(bozza.opera) : null;
  const ambito = ambitoClassico(bozza.opera);
  const sceltaSparita = sol && sol.tipo !== 'classico' && soluzioni && !candidato;

  function scegli(s: SoluzioneBozza) {
    aggiorna({ soluzione: s });
  }

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

      <Passo n={1} titolo="Cosa realizzi">
        <div className="scelte scelte-3">
          {OPERE.map((o) => (
            <button
              key={o.id}
              className={`scelta ${bozza.opera === o.id ? 'scelta-attiva' : ''}`}
              aria-pressed={bozza.opera === o.id}
              onClick={() => setBozza((b) => conOpera(b, o.id))}
            >
              <strong>{o.nome}</strong>
              <span>{o.nota}</span>
            </button>
          ))}
        </div>
      </Passo>

      {bozza.opera && op && soluzioni && (
        <>
          <Passo n={2} titolo="Requisiti">
            <Requisiti opera={bozza.opera} requisiti={bozza.requisiti} cambia={aggiornaRequisiti} />
          </Passo>

          <Passo n={3} titolo="Soluzione">
            {op.altezza && !req?.altezza && (
              <p className="avviso avviso-info">
                Senza l'altezza le soluzioni non sono filtrate per statica: inseriscila nei requisiti.
              </p>
            )}
            {sceltaSparita && (
              <p className="avviso avviso-attenzione">
                La soluzione scelta prima non soddisfa più i requisiti: scegline un'altra.
              </p>
            )}
            <Soluzioni
              certificate={soluzioni.certificate}
              sistemi={soluzioni.sistemi}
              fuoco={bozza.requisiti.fuoco > 0}
              disponibilita={bozza.disponibilita}
              cambiaDisponibilita={(disponibilita) => aggiorna({ disponibilita })}
              scelta={sol}
              classico={!!ambito}
              scegli={scegli}
            />
          </Passo>
        </>
      )}

      {sol?.tipo === 'classico' && ambito && (
        <>
          <Passo n={4} titolo="Calcolo classico">
            <Classico ambito={ambito} bozza={bozza} aggiorna={aggiorna} />
          </Passo>
          {bozza.sistemaId && (
            <>
              <Passo n={5} titolo="Misure">
                <Misure campiture={bozza.campiture} cambia={(c) => aggiorna({ campiture: c })} distinta={distintaClassica} />
              </Passo>
              <Passo n={6} titolo="Distinta materiali">
                {statoPrezzi}
                {distintaClassica && (
                  <TabellaDistinta
                    distinta={{ ...distintaClassica, righe: vendute(distintaClassica.righe) }}
                    prezzi={prezza(vendute(distintaClassica.righe))}
                    mappatura={autorizzato}
                  />
                )}
              </Passo>
            </>
          )}
        </>
      )}

      {effettivo && (
        <>
          <Passo n={4} titolo="Scheda della soluzione">
            <SchedaSoluzione
              candidato={effettivo}
              verticale={!!op?.altezza}
              orditure={orditure}
              orditura={effettivo.variante ? { varianteId: effettivo.variante.varianteId, interasse: effettivo.variante.interasse } : null}
              cambiaOrditura={(o) => scegli({ tipo: effettivo.tipo, id: effettivo.id, varianteId: o.varianteId, interasse: o.interasse })}
            />
          </Passo>

          {effettivo.distinta ? (
            <>
              <Passo n={5} titolo="Misure">
                <Misure campiture={bozza.campiture} cambia={(c) => aggiorna({ campiture: c })} distinta={siniatOk} />
              </Passo>
              <Passo n={6} titolo="Distinta materiali">
                <div className="opzioni distinta-opzioni">
                  <CampiSfrido lastre={bozza.sfridoLastre} isolante={bozza.sfridoIsolante} cambia={aggiorna} />
                  <p className="nota">
                    Le incidenze Siniat comprendono uno sfrido del 5% su lastre e isolante: qui si sostituisce con il vostro.
                  </p>
                </div>
                {statoPrezzi}
                {distintaSiniat && 'errore' in distintaSiniat && <p className="avviso avviso-attenzione">{distintaSiniat.errore}</p>}
                {siniatOk && (
                  <TabellaDistinta
                    distinta={{ ...siniatOk, righe: vendute(siniatOk.righe) }}
                    prezzi={prezza(vendute(siniatOk.righe))}
                    mappatura={autorizzato}
                  />
                )}
              </Passo>
            </>
          ) : (
            <Passo n={5} titolo="Distinta materiali">
              <div className="ag-vuoto">
                <div className="ag-vuoto-icona">▭</div>
                <div className="ag-vuoto-testo">
                  Per questa soluzione la distinta automatica non c'è: i materiali si ricavano dal rapporto di
                  classificazione e dalla documentazione del produttore.
                </div>
              </div>
            </Passo>
          )}
        </>
      )}
    </div>
  );
}
