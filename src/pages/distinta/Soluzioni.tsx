import { useState } from 'react';
import { configurazione, sistema } from '../../data/siniat/catalogo';
import { FORNITORE_ORDINI, testoOrdine } from '../../data/magazzino';
import { nomeOrditura } from '../../selettore';
import type { Candidato } from '../../selettore';
import type { SoluzioneBozza } from '../../lib/bozza';
import { metriTesto } from './comuni';

const PRIME = 6;

/** Le soluzioni compatibili con i requisiti, da scegliere con un tocco. */
export default function Soluzioni({
  certificate,
  sistemi,
  fuoco,
  scelta,
  classico,
  scegli,
}: {
  certificate: Candidato[];
  sistemi: Candidato[];
  /** con la resistenza al fuoco richiesta le certificate vengono prima */
  fuoco: boolean;
  scelta: SoluzioneBozza | null;
  /** il calcolo classico è disponibile per questa opera */
  classico: boolean;
  scegli: (s: SoluzioneBozza) => void;
}) {
  const elencoCertificate = (
    <Elenco
      key="c"
      titolo="Configurazioni certificate al fuoco"
      fonte="Guida antincendio Siniat, luglio 2026: classe, altezza e rapporto di classificazione"
      candidati={certificate}
      scelta={scelta}
      scegli={scegli}
    />
  );
  const elencoSistemi = (
    <Elenco
      key="s"
      titolo="Sistemi del Memento Siniat"
      fonte="Memento 2024: statica, acustica e quantità medie per m²"
      candidati={sistemi}
      scelta={scelta}
      scegli={scegli}
    />
  );

  return (
    <div className="soluzioni">
      <p className="nota">
        Prima le soluzioni con le lastre a magazzino; le altre arrivano su ordinazione da {FORNITORE_ORDINI.nome} in{' '}
        {FORNITORE_ORDINI.giorni} giorni.
      </p>
      {certificate.length === 0 && sistemi.length === 0 && (
        <div className="ag-vuoto">
          <div className="ag-vuoto-icona">∅</div>
          <div className="ag-vuoto-testo">
            Nessuna soluzione Siniat con questi requisiti: prova con un'altezza minore, una classe o un Rw più bassi.
          </div>
        </div>
      )}
      {fuoco ? [elencoCertificate, elencoSistemi] : [elencoSistemi, elencoCertificate]}

      {classico && (
        <div className="elenco-soluzioni">
          <h4>Senza sistema Siniat</h4>
          <button
            className={`scelta soluzione ${scelta?.tipo === 'classico' ? 'scelta-attiva' : ''}`}
            aria-pressed={scelta?.tipo === 'classico'}
            onClick={() => scegli({ tipo: 'classico' })}
          >
            <strong>Calcolo classico</strong>
            <span>Le nove distinte storiche del magazzino (Excel) o le incidenze del manuale Fassa. Nessuna certificazione.</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Elenco({
  titolo,
  fonte,
  candidati,
  scelta,
  scegli,
}: {
  titolo: string;
  fonte: string;
  candidati: Candidato[];
  scelta: SoluzioneBozza | null;
  scegli: (s: SoluzioneBozza) => void;
}) {
  const [tutte, setTutte] = useState(false);
  if (candidati.length === 0) return null;
  const sceltaQui = candidati.findIndex((c) => scelta?.tipo === c.tipo && 'id' in scelta && scelta.id === c.id);
  // la soluzione scelta resta visibile anche se è oltre le prime
  const visibili = tutte ? candidati : candidati.filter((_, i) => i < PRIME || i === sceltaQui);

  return (
    <div className="elenco-soluzioni">
      <h4>
        {titolo} <span className="ag-pastiglia">{candidati.length}</span>
      </h4>
      <p className="nota">{fonte}</p>
      <div className="schede-soluzione">
        {visibili.map((c) => (
          <SchedaCandidato
            key={`${c.tipo}-${c.id}`}
            c={c}
            attiva={scelta?.tipo === c.tipo && 'id' in scelta && scelta.id === c.id}
            scegli={() => scegli({ tipo: c.tipo, id: c.id })}
          />
        ))}
      </div>
      {candidati.length > PRIME && (
        <button className="btn btn-sm btn-ghost" onClick={() => setTutte(!tutte)}>
          {tutte ? 'Mostra le prime' : `Mostra tutte (${candidati.length})`}
        </button>
      )}
    </div>
  );
}

function SchedaCandidato({ c, attiva, scegli }: { c: Candidato; attiva: boolean; scegli: () => void }) {
  const conf = c.tipo === 'certificata' ? configurazione(c.id) : undefined;
  const sis = c.tipo === 'sistema' ? sistema(c.id) : undefined;
  const k = c.classificazione;
  const f = c.fuocoVariante;

  return (
    <button className={`scelta soluzione ${attiva ? 'scelta-attiva' : ''}`} aria-pressed={attiva} onClick={scegli}>
      <strong>{c.titolo}</strong>
      <span className="soluzione-sotto">
        {conf ? `${conf.id} · ${conf.gruppo}` : `${sis?.codice ?? ''} · Memento p. ${sis?.pagina ?? '?'}`}
      </span>
      <span className="soluzione-dati">
        {k && (
          <span className="ag-pastiglia pastiglia-rossa">
            {k.tipo} {k.minuti}
            {k.hmax != null && ` · ${k.hmaxOltre ? 'oltre' : 'fino a'} ${metriTesto(k.hmax)} m`}
          </span>
        )}
        {f && (
          <span className="ag-pastiglia pastiglia-ambra" title="Classe dichiarata nel Memento: vale la configurazione certificata">
            {f.tipo} {f.minuti} Memento
          </span>
        )}
        {c.aMagazzino === true && <span className="ag-pastiglia pastiglia-verde">a magazzino</span>}
        {c.aMagazzino === false && (
          <span className="ag-pastiglia pastiglia-arancio" title={testoOrdine()}>
            da ordinare: {c.daOrdinare.join(', ')}
          </span>
        )}
        {c.rw != null && <span className="ag-pastiglia pastiglia-blu">Rw {c.rw} dB</span>}
        {c.variante?.montante && (
          <span className="ag-pastiglia">
            {nomeOrditura(c.variante)}
            {c.variante.hmaxStatica != null && ` · statica ${metriTesto(c.variante.hmaxStatica)} m`}
          </span>
        )}
        {c.hmaxUtile != null && <span className="ag-pastiglia">altezza utile {metriTesto(c.hmaxUtile)} m</span>}
        {sis?.valutazioni.prezzo && (
          <span className="ag-pastiglia" title="Fascia di prezzo del Memento (pallini pieni)">
            prezzo {metriTesto(sis.valutazioni.prezzo[0])}/{sis.valutazioni.prezzo[1]}
          </span>
        )}
        {conf?.promat && <span className="ag-pastiglia pastiglia-arancio">Promat</span>}
        {c.distinta ? (
          <span className="ag-pastiglia pastiglia-verde">distinta automatica</span>
        ) : (
          <span className="ag-pastiglia pastiglia-arancio">distinta dal rapporto</span>
        )}
      </span>
      {/* dentro un bottone solo testo in linea: niente liste */}
      {c.avvisi.map((a) => (
        <span key={a} className="soluzione-avviso">
          {a}
        </span>
      ))}
    </button>
  );
}
