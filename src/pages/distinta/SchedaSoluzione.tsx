import { CATALOGO, configurazione, sistema } from '../../data/siniat/catalogo';
import { testoOrdine } from '../../data/magazzino';
import { nomeOrditura } from '../../selettore';
import type { Candidato, Orditura } from '../../selettore';
import type { Classificazione, InterasseSiniat } from '../../types';
import { metriTesto } from './comuni';

/**
 * La scheda tecnica della soluzione scelta: com'è fatta, che classi ha e con
 * quali rapporti, quale orditura regge l'altezza. Le prestazioni sono quelle
 * dichiarate da Siniat: l'app le riporta con il riferimento, non le certifica.
 */
export default function SchedaSoluzione({
  candidato,
  verticale,
  orditure,
  orditura,
  cambiaOrditura,
}: {
  candidato: Candidato;
  /** pareti, contropareti, cavedi: l'altezza e la statica contano */
  verticale: boolean;
  /** orditure possibili per l'altezza, dalla più economica */
  orditure: Orditura[];
  /** quella in uso */
  orditura: { varianteId: string; interasse: InterasseSiniat | null } | null;
  cambiaOrditura: (o: { varianteId: string; interasse: InterasseSiniat }) => void;
}) {
  const conf = candidato.tipo === 'certificata' ? configurazione(candidato.id) : undefined;
  const sis = candidato.tipo === 'sistema' ? sistema(candidato.id) : undefined;
  const scheda = conf?.sistemaMemento ? sistema(conf.sistemaMemento) : sis;
  const sostituzioni = candidato.sostituzioni ?? [];
  const alternative = conf?.stratigrafia
    ? [...conf.stratigrafia.lato1, ...conf.stratigrafia.intermedia, ...conf.stratigrafia.lato2].filter((s) => s.alternative)
    : [];

  return (
    <div className="scheda-soluzione">
      <div className="scheda-testa">
        <strong>{candidato.titolo}</strong>
        <span className="nota">
          {conf
            ? `${conf.id} · ${conf.sezioneNome} · prova ${conf.normaProva} · guida antincendio p. ${conf.pagine.join(', ')}`
            : `${sis?.codice ?? ''} · Memento p. ${sis?.pagina ?? '?'}`}
        </span>
      </div>

      <div className="scheda-griglia">
        <div>
          <span className="ag-etichetta">Com'è fatta</span>
          <ol className="strati">
            {(conf?.strati ?? sis?.configurazione ?? []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {alternative.map((s) => (
            <p key={s.lastra} className="nota">
              Lastra a scelta fra {s.alternative!.join(', ')}: in distinta la prima.
            </p>
          ))}
          {sostituzioni.length > 0 && (
            <p className="scheda-valore">
              In opera: {sostituzioni.map((x) => `${x.a} al posto delle ${x.da}`).join('; ')}
            </p>
          )}
          {sostituzioni.some((x) => x.fonte === 'guida') && (
            <p className="nota">Sostituzione ammessa dalla guida antincendio per questa configurazione, per usare le lastre a magazzino.</p>
          )}
          {candidato.aMagazzino === true && <p className="nota">Lastre tutte a magazzino.</p>}
          {candidato.aMagazzino === false && (
            <p className="avviso avviso-attenzione">
              Da ordinare ({testoOrdine()}): {candidato.daOrdinare.join(', ')}.
            </p>
          )}
        </div>

        <div>
          <span className="ag-etichetta">Orditura</span>
          {orditure.length > 1 && orditura ? (
            <select
              className="ag-campo"
              value={`${orditura.varianteId}|${orditura.interasse}`}
              onChange={(e) => {
                const [varianteId, interasse] = e.target.value.split('|') as [string, InterasseSiniat];
                cambiaOrditura({ varianteId, interasse });
              }}
            >
              {orditure.map((o) => (
                <option key={`${o.v.id}|${o.interasse}`} value={`${o.v.id}|${o.interasse}`}>
                  {nomeOrditura({ montante: o.v.montante ?? null, montanti: o.v.montanti ?? null, interasse: o.interasse })} · fino a{' '}
                  {metriTesto(o.hmax)} m{o.v.nome ? ` · ${o.v.nome}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <p className="scheda-valore">
              {candidato.variante?.montante ? nomeOrditura(candidato.variante) : conf?.stratigrafia?.montante ?? 'secondo il rapporto'}
              {candidato.variante?.nome ? ` · ${candidato.variante.nome}` : ''}
            </p>
          )}
          {candidato.variante?.hmaxStatica != null ? (
            <p className="nota">
              Statica dalla scheda Memento{scheda ? ` p. ${scheda.pagina}` : ''}: con questa orditura fino a{' '}
              {metriTesto(candidato.variante.hmaxStatica)} m.
            </p>
          ) : (
            verticale && !candidato.staticaVerificata && <p className="nota">Statica da verificare (NTC 2018).</p>
          )}
          {candidato.hmaxUtile != null && (
            <p className="scheda-valore">Altezza utile {metriTesto(candidato.hmaxUtile)} m</p>
          )}
        </div>

        {candidato.rw != null && (
          <div>
            <span className="ag-etichetta">Isolamento acustico</span>
            <p className="scheda-valore">Rw {candidato.rw} dB</p>
            <p className="nota">Valore di laboratorio del produttore; in opera si perdono 6–8 dB.</p>
          </div>
        )}
      </div>

      {conf && <Classi classi={conf.classificazioni} richiesta={candidato.classificazione} />}

      {sis && (
        <div>
          <span className="ag-etichetta">Resistenza al fuoco</span>
          <p className="scheda-valore">{sis.fuocoTesto ?? 'nessuna classe dichiarata'}</p>
          {candidato.certificate && candidato.certificate.length > 0 && (
            <p className="nota">
              Configurazioni certificate con le stesse lastre:{' '}
              {candidato.certificate.map((id) => `${id} (${configurazione(id)?.codice ?? ''})`).join(', ')}.
            </p>
          )}
        </div>
      )}

      {conf && Object.keys(conf.sostituibilita).length > 0 && (
        <div>
          <span className="ag-etichetta">Lastre sostituibili (guida antincendio)</span>
          <ul className="scheda-elenco">
            {Object.entries(conf.sostituibilita).map(([lastra, altre]) => (
              <li key={lastra}>
                {lastra} → {altre.join(', ')}
              </li>
            ))}
          </ul>
          <p className="nota">Anche in parte, con spessore almeno pari a quello provato.</p>
        </div>
      )}

      {(conf?.note.length || sis?.noteConfigurazione.length) ? (
        <ul className="avvisi">
          {(conf?.note ?? []).map((n) => (
            <li key={n} className="avviso avviso-attenzione">
              {n}
            </li>
          ))}
          {(sis?.noteConfigurazione ?? []).map((n) => (
            <li key={n} className="avviso avviso-info">
              {n}
            </li>
          ))}
        </ul>
      ) : null}

      {conf && (
        <details className="scheda-avvertenze">
          <summary>Avvertenze della guida antincendio</summary>
          <ul>
            {CATALOGO.avvertenze.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Classi({ classi, richiesta }: { classi: Classificazione[]; richiesta?: Classificazione }) {
  return (
    <div className="ag-tabella-wrap">
      <table className="ag-tabella tabella-classi">
        <thead>
          <tr>
            <th>Classe</th>
            <th>Limite al fuoco</th>
            <th>Rapporti di classificazione</th>
          </tr>
        </thead>
        <tbody>
          {classi.map((k, i) => (
            <tr key={i} className={k === richiesta ? 'classe-richiesta' : ''}>
              <td className="ag-mono">
                {k.tipo} {k.minuti}
                {k.direzione ? ` ${k.direzione}` : ''}
              </td>
              <td>
                {k.hmax != null
                  ? `altezza ${k.hmaxOltre ? 'oltre' : 'fino a'} ${metriTesto(k.hmax)} m`
                  : k.luce != null
                    ? `luce fino a ${metriTesto(k.luce)} m`
                    : '—'}
                {k.hmaxNota && <div className="nota">{k.hmaxNota}</div>}
              </td>
              <td>
                {k.riferimenti.map((r, j) => (
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
                <div className="nota">guida p. {k.pagina}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
