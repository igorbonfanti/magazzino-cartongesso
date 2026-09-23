import { aperturaVuota, campituraVuota, leggiNumero } from '../../lib/bozza';
import type { AperturaBozza, CampituraBozza } from '../../lib/bozza';
import { formattaDecimale } from '../../money';

/** Campiture sommabili: mq diretti oppure L×H, con le aperture da detrarre. */
export default function Misure({
  campiture,
  cambia,
  distinta,
}: {
  campiture: CampituraBozza[];
  cambia: (c: CampituraBozza[]) => void;
  /** i totali della distinta calcolata, se c'è */
  distinta: { mqLordi: number; mqAperture: number; mqNetti: number } | null;
}) {
  const aggiornaCampitura = (id: string, modifiche: Partial<CampituraBozza>) =>
    cambia(campiture.map((c) => (c.id === id ? { ...c, ...modifiche } : c)));

  const aggiornaApertura = (c: CampituraBozza, id: string, modifiche: Partial<AperturaBozza>) =>
    aggiornaCampitura(c.id, { aperture: c.aperture.map((a) => (a.id === id ? { ...a, ...modifiche } : a)) });

  return (
    <div className="misure">
      {campiture.map((c, i) => (
        <div key={c.id} className="campitura">
          <div className="campitura-testa">
            <strong>Campitura {i + 1}</strong>
            <div className="interruttore" role="group" aria-label="Come si misura">
              <button
                className={`btn btn-sm ${c.modo === 'LxH' ? 'attivo' : ''}`}
                aria-pressed={c.modo === 'LxH'}
                onClick={() => aggiornaCampitura(c.id, { modo: 'LxH' })}
              >
                L × H
              </button>
              <button
                className={`btn btn-sm ${c.modo === 'mq' ? 'attivo' : ''}`}
                aria-pressed={c.modo === 'mq'}
                onClick={() => aggiornaCampitura(c.id, { modo: 'mq' })}
              >
                mq
              </button>
            </div>
            {campiture.length > 1 && (
              <button
                className="btn btn-sm btn-ghost campitura-togli"
                onClick={() => cambia(campiture.filter((x) => x.id !== c.id))}
                title="Togli la campitura"
              >
                Togli
              </button>
            )}
          </div>

          <div className="campitura-misure">
            {c.modo === 'LxH' ? (
              <>
                <CampoNumero etichetta="Lunghezza m" valore={c.l} cambia={(l) => aggiornaCampitura(c.id, { l })} />
                <span className="per">×</span>
                <CampoNumero etichetta="Altezza m" valore={c.h} cambia={(h) => aggiornaCampitura(c.id, { h })} />
              </>
            ) : (
              <CampoNumero etichetta="Superficie mq" valore={c.mq} cambia={(mq) => aggiornaCampitura(c.id, { mq })} />
            )}
            <span className="campitura-mq ag-dati">{mqCampitura(c)}</span>
          </div>

          {c.aperture.map((a) => (
            <div key={a.id} className="apertura">
              <span className="apertura-segno">−</span>
              <CampoNumero etichetta="Apertura L m" valore={a.l} cambia={(l) => aggiornaApertura(c, a.id, { l })} />
              <span className="per">×</span>
              <CampoNumero etichetta="H m" valore={a.h} cambia={(h) => aggiornaApertura(c, a.id, { h })} />
              <CampoNumero etichetta="Quante" valore={a.n} cambia={(n) => aggiornaApertura(c, a.id, { n })} corto />
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => aggiornaCampitura(c.id, { aperture: c.aperture.filter((x) => x.id !== a.id) })}
                title="Togli l'apertura"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            className="btn btn-sm btn-ghost"
            onClick={() => aggiornaCampitura(c.id, { aperture: [...c.aperture, aperturaVuota()] })}
          >
            + Porta o finestra da detrarre
          </button>
        </div>
      ))}

      <div className="misure-piede">
        <button className="btn" onClick={() => cambia([...campiture, campituraVuota()])}>
          + Aggiungi campitura
        </button>
        {distinta && (
          <dl className="totali-mq">
            {distinta.mqAperture > 0 && (
              <>
                <div>
                  <dt>Lordi</dt>
                  <dd className="ag-dati">{formattaDecimale(distinta.mqLordi, 2)} mq</dd>
                </div>
                <div>
                  <dt>Aperture</dt>
                  <dd className="ag-dati">−{formattaDecimale(distinta.mqAperture, 2)} mq</dd>
                </div>
              </>
            )}
            <div className="totali-mq-netti">
              <dt>Netti</dt>
              <dd className="ag-dati">{formattaDecimale(distinta.mqNetti, 2)} mq</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}

function mqCampitura(c: CampituraBozza): string {
  if (c.modo === 'mq') {
    const mq = leggiNumero(c.mq);
    return mq ? `${formattaDecimale(mq, 2)} mq` : '';
  }
  const l = leggiNumero(c.l);
  const h = leggiNumero(c.h);
  return l && h ? `= ${formattaDecimale(l * h, 2)} mq` : '';
}

function CampoNumero({
  etichetta,
  valore,
  cambia,
  corto,
}: {
  etichetta: string;
  valore: string;
  cambia: (v: string) => void;
  corto?: boolean;
}) {
  // "4," e' un numero a meta', non un errore: si segnala solo quando non puo' diventare un numero
  const sbagliato = valore.trim() !== '' && leggiNumero(valore.trim().replace(/[.,]$/, '')) === null;
  return (
    <label className="campo-numero">
      <span className="ag-etichetta">{etichetta}</span>
      <input
        className={`ag-campo ag-dati ${corto ? 'campo-corto' : ''} ${sbagliato ? 'campo-sbagliato' : ''}`}
        inputMode="decimal"
        value={valore}
        onChange={(e) => cambia(e.target.value)}
        aria-invalid={sbagliato}
      />
    </label>
  );
}
