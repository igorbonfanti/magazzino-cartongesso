import { MAPPING_SEED } from '../../data/mapping_seed';
import type { Avviso, RigaDistinta } from '../../engine';
import { formattaDecimale, formattaIntero } from '../../money';

/** Quello che serve alla tabella: vale per la distinta classica e per quella Siniat. */
export interface DistintaDaMostrare {
  righe: RigaDistinta[];
  avvisi: Avviso[];
  hint: string[];
  dicitura?: string;
}

const SINGOLARE: Record<string, string> = { lastre: 'lastra', barre: 'barra', sacchi: 'sacco', pannelli: 'pannello' };

/** "1 sacco", "3 sacchi" */
function confezioni(pezzi: number, umConf: string): string {
  return pezzi === 1 ? SINGOLARE[umConf] ?? umConf : umConf;
}

/** 0,67 · 1,7 · 204,6 · 95: fino a 3 decimali, senza zeri inutili. */
function numero(x: number): string {
  if (Number.isInteger(x)) return formattaIntero(x);
  return formattaDecimale(x, 3).replace(/0+$/, '');
}

export default function TabellaDistinta({ distinta }: { distinta: DistintaDaMostrare }) {
  const { righe, avvisi, hint, dicitura } = distinta;
  const nonMappate = righe.filter((r) => !MAPPING_SEED[r.chiave]).length;

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
                  <th className="r">Quantità</th>
                  <th className="r nascondi-telefono">Confezione</th>
                  <th className="r">Da ordinare</th>
                </tr>
              </thead>
              <tbody>
                {righe.map((r, i) => {
                  const mag = MAPPING_SEED[r.chiave];
                  return (
                    <tr key={`${r.chiave}-${i}`} className={mag ? '' : 'da-mappare'}>
                      <td>
                        <div className="articolo-nome">{r.descrizione}</div>
                        <div className="articolo-meta">
                          <span className="ag-mono">{r.chiave}</span>
                          {/* su telefono la colonna Magazzino sparisce: il codice scende qui */}
                          <span className="solo-telefono">
                            {mag ? (
                              <span className="ag-mono">→ {mag.codice}</span>
                            ) : (
                              <span className="ag-pastiglia pastiglia-arancio">da mappare</span>
                            )}
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
                        {r.nota && <div className="articolo-meta">{r.nota}</div>}
                        {r.daVerificare && <div className="articolo-meta">{r.daVerificare}</div>}
                      </td>
                      <td className="nascondi-telefono">
                        {mag ? (
                          <span className="ag-mono">{mag.codice}</span>
                        ) : (
                          <span className="ag-pastiglia pastiglia-arancio">da mappare</span>
                        )}
                      </td>
                      <td className="r nascondi-telefono">{numero(r.incidenza)}</td>
                      <td className="r">
                        {numero(r.quantita)} {r.um}
                        {r.sfridoPct > 0 && <div className="articolo-meta">sfrido {r.sfridoPct}%</div>}
                      </td>
                      <td className="r nascondi-telefono">
                        {numero(r.contenuto)} {r.um}
                      </td>
                      <td className="r da-ordinare">
                        {formattaIntero(r.pezzi)} <span className="um-conf">{confezioni(r.pezzi, r.umConf)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {nonMappate > 0 && (
            <p className="nota">
              {nonMappate === 1 ? '1 articolo' : `${nonMappate} articoli`} ancora senza codice di magazzino: si
              associano dalla mappatura del listino (Fase 3). I prezzi arrivano col preventivo.
            </p>
          )}
        </>
      )}
    </div>
  );
}
