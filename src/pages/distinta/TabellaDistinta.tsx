import { Link } from 'react-router-dom';
import type { Avviso, RigaDistinta } from '../../engine';
import { mappaturaPer } from '../../lib/mappatura';
import { formattaDecimale, formattaEuro, formattaIntero, formattaPercento, formattaPrezzoListino } from '../../money';
import { totaleDistinta } from '../../prezzi';
import type { PrezzoRiga, RigaVenduta } from '../../prezzi';
import { singolare } from './comuni';

/** Quello che serve alla tabella: vale per la distinta classica e per quella Siniat. */
export interface DistintaDaMostrare {
  righe: (RigaDistinta | RigaVenduta)[];
  avvisi: Avviso[];
  hint: string[];
  dicitura?: string;
}

/** "1 sacco", "3 sacchi" */
function confezioni(pezzi: number, umConf: string): string {
  return pezzi === 1 ? singolare(umConf) : umConf;
}

/** 0,67 · 1,7 · 204,6 · 95: fino a 3 decimali, senza zeri inutili. */
function numero(x: number): string {
  if (Number.isInteger(x)) return formattaIntero(x);
  return formattaDecimale(x, 3).replace(/0+$/, '');
}

const NESSUNA = new Map();

export default function TabellaDistinta({
  distinta,
  prezzi,
  mappatura,
}: {
  distinta: DistintaDaMostrare;
  /** i prezzi riga per riga, quando il listino è caricato */
  prezzi?: PrezzoRiga[] | null;
  /** l'utente può mappare: le righe da mappare portano alla pagina di mappatura */
  mappatura?: boolean;
}) {
  const { righe, avvisi, hint, dicitura } = distinta;
  // senza listino il codice viene dalla mappatura di partenza, come prima della Fase 3
  const codici = righe.map((r, i) => prezzi?.[i]?.mappatura ?? mappaturaPer(r.chiave, NESSUNA));
  const nonMappate = codici.filter((m) => !m).length;
  const totale = prezzi ? totaleDistinta(prezzi) : null;

  return (
    <div className="distinta">
      {(avvisi.length > 0 || hint.length > 0 || dicitura) && (
        <ul className="avvisi">
          {avvisi.map((a, i) => (
            <li key={`a${i}`} className={a.livello === 'attenzione' ? 'avviso avviso-attenzione' : 'avviso avviso-info'}>
              {a.testo}
            </li>
          ))}
          {hint.map((h, i) => (
            <li key={`h${i}`} className="avviso avviso-info">
              {h}
            </li>
          ))}
          {dicitura && <li className="avviso avviso-dicitura">In preventivo: «{dicitura}»</li>}
        </ul>
      )}

      {righe.length === 0 ? (
        <div className="ag-vuoto">
          <div className="ag-vuoto-icona">▭</div>
          <div className="ag-vuoto-testo">Inserisci le misure per vedere i materiali.</div>
        </div>
      ) : (
        <>
          <div className="ag-tabella-wrap">
            <table className="ag-tabella tabella-distinta">
              <thead>
                <tr>
                  <th>Articolo</th>
                  <th className="nascondi-telefono">Magazzino</th>
                  <th className="r nascondi-telefono">Inc./mq</th>
                  <th className={`r ${prezzi ? 'nascondi-telefono' : ''}`}>Quantità</th>
                  <th className="r nascondi-telefono">Confezione</th>
                  <th className="r">Da ordinare</th>
                  {prezzi && <th className="r nascondi-telefono">Prezzo</th>}
                  {prezzi && <th className="r">Totale</th>}
                </tr>
              </thead>
              <tbody>
                {righe.map((r, i) => {
                  const m = codici[i];
                  const p = prezzi?.[i];
                  const daMappare = !m;
                  return (
                    <tr key={`${r.chiave}-${i}`} className={daMappare ? 'da-mappare' : ''}>
                      <td>
                        <div className="articolo-nome">{r.descrizione}</div>
                        <div className="articolo-meta">
                          <span className="ag-mono">{r.chiave}</span>
                          {/* su telefono la colonna Magazzino sparisce: il codice scende qui */}
                          <span className="solo-telefono">
                            {m ? <span className="ag-mono">→ {m.codice}</span> : <Etichetta chiave={r.chiave} mappatura={mappatura} />}
                          </span>
                          {r.metodo === 'geometrico' && (
                            <span className="ag-pastiglia pastiglia-blu" title="Calcolato dalle misure L×H">
                              geometrico
                            </span>
                          )}
                          {r.fonte === 'regola' && (
                            <span className="ag-pastiglia pastiglia-ambra" title="Incidenza ricavata con le regole delle tabelle Memento">
                              stimata
                            </span>
                          )}
                          {r.daVerificare && (
                            <span className="ag-pastiglia pastiglia-arancio" title={r.daVerificare}>
                              da verificare
                            </span>
                          )}
                        </div>
                        {p?.articolo && <div className="articolo-meta">{p.articolo.descrizione}</div>}
                        {p?.stato === 'fuori_listino' && (
                          <div className="articolo-meta">
                            <span className="ag-pastiglia pastiglia-rossa">{p.mappatura?.codice} non è nel listino</span>
                          </div>
                        )}
                        {p?.prezzoSospetto !== undefined && p.articolo && (
                          // 0,12 € per una scatola da 100 tasselli: il prezzo del listino è quello del tassello
                          <div className="articolo-meta">
                            <span className="ag-pastiglia pastiglia-rossa">prezzo da rivedere</span> {formattaPrezzoListino(p.articolo.prezzo)} € per{' '}
                            {singolare(r.umConf)} da {numero(r.contenuto)} {r.um} sono {formattaPrezzoListino(Math.max(1, Math.round(p.prezzoSospetto)))} € al{' '}
                            {r.um}: sembra il prezzo del {r.um}
                            {mappatura && (
                              <>
                                {' · '}
                                <Link to={`/mappatura?chiave=${encodeURIComponent(r.chiave)}`}>correggi</Link>
                              </>
                            )}
                          </div>
                        )}
                        {r.nota && <div className="articolo-meta">{r.nota}</div>}
                        {r.daVerificare && <div className="articolo-meta">{r.daVerificare}</div>}
                      </td>
                      <td className="nascondi-telefono">
                        {m ? <span className="ag-mono">{m.codice}</span> : <Etichetta chiave={r.chiave} mappatura={mappatura} />}
                      </td>
                      <td className="r nascondi-telefono">{numero(r.incidenza)}</td>
                      <td className={`r ${prezzi ? 'nascondi-telefono' : ''}`}>
                        {numero(r.quantita)} {r.um}
                        {r.sfridoPct > 0 && <div className="articolo-meta">sfrido {r.sfridoPct}%</div>}
                      </td>
                      <td className="r nascondi-telefono">
                        {numero(r.contenuto)} {r.um}
                        {'confezioneListino' in r && r.confezioneListino && (
                          <div className="articolo-meta">
                            {singolare(r.umConf)} {r.confezioneListino}
                          </div>
                        )}
                      </td>
                      <td className="r da-ordinare">
                        {formattaIntero(r.pezzi)} <span className="um-conf">{confezioni(r.pezzi, r.umConf)}</span>
                      </td>
                      {prezzi && (
                        <td className="r nascondi-telefono">
                          {p?.articolo && (
                            <>
                              {formattaPrezzoListino(p.articolo.prezzo)} €/{p.mappatura?.prezzoPer === 'um' ? r.um : singolare(r.umConf)}
                              {p.articolo.scontoBp > 0 && <div className="articolo-meta">sconto {formattaPercento(p.articolo.scontoBp)}%</div>}
                            </>
                          )}
                        </td>
                      )}
                      {prezzi && (
                        <td className="r da-ordinare">
                          {p?.stato === 'prezzata' ? formattaEuro(p.totaleCent) : '—'}
                          {p?.stato === 'prezzata' && p.mappatura?.prezzoPer === 'um' && (
                            <div className="articolo-meta">
                              {numero(p.quantitaMilli / 1000)} {p.unita}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              {totale && (
                <tfoot>
                  {/* una cella per colonna, con le stesse classi dell'intestazione: su telefono spariscono le stesse */}
                  <tr className="riga-totale">
                    <td>Totale a listino</td>
                    <td className="nascondi-telefono" />
                    <td className="nascondi-telefono" />
                    <td className="nascondi-telefono" />
                    <td className="nascondi-telefono" />
                    <td />
                    <td className="nascondi-telefono" />
                    <td className="r da-ordinare">{formattaEuro(totale.totaleCent)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {totale && (
            <p className="nota">
              Prezzi di listino con lo sconto base, IVA esclusa.
              {totale.daMappare + totale.fuoriListino > 0 &&
                ` Totale parziale: ${totale.daMappare + totale.fuoriListino} ${totale.daMappare + totale.fuoriListino === 1 ? 'voce' : 'voci'} senza prezzo.`}
            </p>
          )}
          {nonMappate > 0 && (
            <p className="nota">
              {nonMappate === 1 ? '1 voce' : `${nonMappate} voci`} ancora senza codice di magazzino
              {mappatura ? (
                <>
                  : si collegano dalla pagina <Link to="/mappatura">Mappatura</Link>.
                </>
              ) : (
                <>
                  : si collegano dalla mappatura, con l&apos;accesso.
                </>
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** "da mappare", con il collegamento alla pagina di mappatura se l'utente può mappare. */
function Etichetta({ chiave, mappatura }: { chiave: string; mappatura?: boolean }) {
  return mappatura ? (
    <Link className="ag-pastiglia pastiglia-arancio" to={`/mappatura?chiave=${encodeURIComponent(chiave)}`}>
      mappa
    </Link>
  ) : (
    <span className="ag-pastiglia pastiglia-arancio">da mappare</span>
  );
}
