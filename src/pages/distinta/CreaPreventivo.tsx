import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nuovoId } from '../../lib/bozza';
import { leggiBozzaLocale, scriviBozzaLocale } from '../../lib/bozzaPreventivo';
import { useDati } from '../../lib/dati';
import { aggiungiRighe, bozzaPreventivoVuota, righeDaDistinta } from '../../preventivo';
import type { BozzaPreventivo } from '../../preventivo';
import type { PrezzoRiga, RigaVenduta } from '../../prezzi';
import type { SchedaTecnica } from '../../schedaTecnica';

/**
 * Dal passo 6 al preventivo: le righe con codici e prezzi del listino e la
 * scheda tecnica della soluzione. Se c'è già un preventivo in lavorazione si
 * può aggiungere questa distinta (pareti e controsoffitti nello stesso
 * preventivo) o cominciarne uno nuovo.
 */
export default function CreaPreventivo({ righe, prezzi, scheda }: { righe: RigaVenduta[]; prezzi: PrezzoRiga[] | null; scheda: SchedaTecnica }) {
  const dati = useDati();
  const naviga = useNavigate();
  const [inCorso, setInCorso] = useState(false);
  const esistente = leggiBozzaLocale();

  if (!righe.length) return null;
  if (!dati.listino) return <p className="nota">Il preventivo si crea con il listino caricato.</p>;

  async function crea(modo: 'nuovo' | 'aggiungi') {
    const nuove = righeDaDistinta(righe, prezzi, nuovoId);
    const prima = leggiBozzaLocale();
    let b: BozzaPreventivo;
    if (modo === 'aggiungi' && prima) {
      b = { ...prima, righe: aggiungiRighe(prima.righe, nuove), schede: [...prima.schede, scheda], listinoDel: dati.listino?.aggiornato ?? prima.listinoDel };
    } else {
      if (prima?.righe.length && !window.confirm('Il preventivo in lavorazione non è salvato: sostituirlo con questo?')) return;
      setInCorso(true);
      const { leggiImpostazioni } = await import('../../lib/preventiviRemoti');
      const imp = await leggiImpostazioni();
      b = { ...bozzaPreventivoVuota(imp.ivaBp), righe: nuove, schede: [scheda], listinoDel: dati.listino?.aggiornato ?? null };
    }
    scriviBozzaLocale(b);
    naviga('/preventivo');
  }

  return (
    <div className="azioni-scheda crea-preventivo">
      {esistente?.righe.length ? (
        <>
          <button className="btn btn-primary" disabled={inCorso} onClick={() => void crea('aggiungi')}>
            Aggiungi al preventivo in corso
          </button>
          <button className="btn" disabled={inCorso} onClick={() => void crea('nuovo')}>
            Nuovo preventivo
          </button>
          <span className="nota">
            In corso: {esistente.righe.length} {esistente.righe.length === 1 ? 'riga' : 'righe'}
            {esistente.cliente?.ragione ? `, ${esistente.cliente.ragione}` : ''}.
          </span>
        </>
      ) : (
        <button className="btn btn-primary" disabled={inCorso} onClick={() => void crea('nuovo')}>
          Crea il preventivo
        </button>
      )}
    </div>
  );
}
