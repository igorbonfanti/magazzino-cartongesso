import { ibanLeggibile } from '../../lib/impostazioni';
import { formattaCent, formattaDecimale, formattaEuro, formattaNettoDaListino, formattaPercento, formattaPrezzoListino } from '../../money';
import { dataItaliana, testoQuantita } from '../../preventivo';
import type { PreventivoSalvato, TotaliBozza } from '../../preventivo';
import type { SchedaTecnica } from '../../schedaTecnica';
import { metriTesto } from '../distinta/comuni';

/**
 * Il preventivo come si stampa: a video è uguale. Prima pagina come i PREV
 * del gestionale (intestazione, numero in verde, righe, totali, IBAN), poi la
 * scheda tecnica della soluzione. La data è quella del preventivo, anche
 * ristampandolo.
 */
export default function Documento({ p }: { p: PreventivoSalvato }) {
  const diciture = [...new Set(p.schede.map((s) => s.dicitura).filter((d): d is string => !!d))];
  return (
    <article className="documento">
      <section className="documento-pagina">
        <header className="documento-testa">
          <div className="documento-ditta">
            <h1>Il Magazzino Edile S.r.l.</h1>
            <p>Preventivo del {dataItaliana(p.data)}</p>
            <p className="documento-numero">N° {p.numero}</p>
          </div>
          {p.cliente && (
            <div className="documento-cliente">
              <p>Spett.le</p>
              <p>
                <strong>{p.cliente.ragione}</strong>
              </p>
              {p.cliente.indirizzo && <p>{p.cliente.indirizzo}</p>}
              {p.cliente.citta && <p>{p.cliente.citta}</p>}
              {p.cliente.piva && <p>P.IVA: {p.cliente.piva}</p>}
              {(p.cliente.cantiere || p.cliente.tel) && (
                <div className="documento-cantiere">
                  {p.cliente.cantiere && <p>Destinazione cantiere: {p.cliente.cantiere}</p>}
                  {p.cliente.tel && <p>Tel. riferimento: {p.cliente.tel}</p>}
                </div>
              )}
            </div>
          )}
        </header>

        <table className="documento-righe">
          <thead>
            <tr>
              <th>Codice</th>
              <th>Descrizione</th>
              <th className="r">Listino €</th>
              <th className="r">Sc.%</th>
              <th className="r">Netto €</th>
              <th className="r">Qtà</th>
              <th className="r">Totale €</th>
            </tr>
          </thead>
          <tbody>
            {p.righe.map((r, i) => (
              <tr key={i}>
                <td className="ag-mono">{r.codice}</td>
                <td>{r.descrizione}</td>
                <td className="r">{formattaPrezzoListino(r.prezzoDm)}</td>
                <td className="r">
                  {r.sconto1Bp > 0 && <div>-{formattaPercento(r.sconto1Bp)}%</div>}
                  {r.sconto2Bp > 0 && <div>-{formattaPercento(r.sconto2Bp)}%</div>}
                </td>
                <td className="r">{formattaNettoDaListino(r.prezzoDm, [r.sconto1Bp, r.sconto2Bp].filter((s) => s > 0))}</td>
                <td className="r">
                  {testoQuantita(r.quantitaMilli)} {r.um}
                </td>
                <td className="r">{formattaCent(r.totaleCent)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <PiedeTotali t={p.totali} ivaBp={p.ivaBp} />

        {p.note && <p className="documento-note">{p.note}</p>}
        {diciture.map((d) => (
          <p key={d} className="documento-dicitura">
            {d}
          </p>
        ))}
        {p.schede.length > 0 && <p className="documento-rinvio">Scheda tecnica della soluzione nella pagina seguente.</p>}
        {p.iban && <p className="documento-iban">Coordinate bancarie (IBAN): {ibanLeggibile(p.iban)}</p>}
      </section>

      {p.schede.length > 0 && (
        <section className="documento-pagina documento-scheda">
          <h2>
            Scheda tecnica <span className="documento-numero">{p.numero}</span>
          </h2>
          {p.schede.map((s, i) => (
            <SchedaStampa key={i} s={s} />
          ))}
          <p className="documento-avvertenza">
            Prestazioni dichiarate dal produttore, con il riferimento ai rapporti di classificazione: il preventivo le riporta, non le
            certifica. La scelta del sistema spetta al tecnico antincendio; la posa si dichiara secondo il rapporto di classificazione.
          </p>
        </section>
      )}
    </article>
  );
}

/** Il piede dei totali, come nel gestionale; con lo sconto arrotondamento anche il totale di prima. */
export function PiedeTotali({ t, ivaBp }: { t: TotaliBozza; ivaBp: number }) {
  return (
    <div className="documento-totali">
      {t.arrotondamentoCent > 0 && (
        <>
          <div>
            <span>Totale prima dello sconto</span>
            <span>{formattaEuro(t.totaleCent)}</span>
          </div>
          <div>
            <span>Sconto arrotondamento (IVA inclusa)</span>
            <span>−{formattaEuro(t.arrotondamentoCent)}</span>
          </div>
        </>
      )}
      <div>
        <span>Totale netto</span>
        <span>{formattaEuro(t.nettoFinaleCent)}</span>
      </div>
      <div>
        <span>IVA {formattaPercento(ivaBp)}%</span>
        <span>{formattaEuro(t.ivaFinaleCent)}</span>
      </div>
      <div className="documento-totale">
        <span>Totale IVA incl.</span>
        <span>{formattaEuro(t.finaleCent)}</span>
      </div>
    </div>
  );
}

function SchedaStampa({ s }: { s: SchedaTecnica }) {
  const dati = [
    s.orditura && `orditura ${s.orditura}`,
    s.altezzaUtile != null && `altezza utile ${metriTesto(s.altezzaUtile)} m`,
    `superficie ${formattaDecimale(s.mq, 2)} m²`,
  ].filter(Boolean);
  return (
    <div className="scheda-stampa">
      <h3>{s.titolo}</h3>
      <p className="documento-rif">{s.riferimento}</p>
      {s.strati.length > 0 && (
        <ol>
          {s.strati.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
      )}
      {s.inOpera.length > 0 && (
        <p>
          <strong>In opera:</strong> {s.inOpera.join('; ')}.
        </p>
      )}
      <p className="documento-rif">{dati.join(' · ')}</p>
      {s.classi.length > 0 && (
        <table className="documento-classi">
          <thead>
            <tr>
              <th>Classe</th>
              <th>Limite</th>
              <th>Rapporti di classificazione</th>
            </tr>
          </thead>
          <tbody>
            {s.classi.map((k, i) => (
              <tr key={i} className={k.richiesta ? 'classe-richiesta' : ''}>
                <td>
                  <strong>{k.classe}</strong>
                </td>
                <td>
                  {k.limite}
                  {k.nota && <div className="documento-rif">{k.nota}</div>}
                </td>
                <td>
                  {k.rapporti.map((r, j) => (
                    <div key={j}>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer">
                          {r.testo}
                        </a>
                      ) : (
                        r.testo
                      )}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {s.rw != null && (
        <p>
          <strong>Isolamento acustico:</strong> Rw {s.rw} dB{s.rwNota ? ` (${s.rwNota})` : ''}.
        </p>
      )}
      {s.avvisi.length > 0 && (
        <ul className="documento-avvisi">
          {s.avvisi.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      )}
      {s.dicitura && <p className="documento-dicitura">{s.dicitura}</p>}
    </div>
  );
}
