import { ARTICOLI, SISTEMI, SISTEMI_PER_AMBITO } from '../data/sistemi';
import { formattaDecimale, formattaIntero } from '../money';
import type { Ambito, Incidenza, Voce } from '../types';

const NOMI_AMBITI: Record<Ambito, string> = {
  parete: 'Pareti',
  controparete: 'Contropareti',
  controsoffitto: 'Controsoffitti',
};

function numero(x: number): string {
  return Number.isInteger(x) ? formattaIntero(x) : formattaDecimale(x, 3).replace(/0+$/, '');
}

function cella(inc: Incidenza | null, interasse: 'i60' | 'i40'): string {
  if (inc === null) return '—';
  return numero(typeof inc === 'number' ? inc : inc[interasse]);
}

/** In modalità manuale la voce vale come la classica, se non è indicata a parte. */
function manuale(v: Voce): Incidenza | null {
  return v.manuale === undefined ? v.classica : v.manuale;
}

/** Le incidenze esattamente come le usa il motore: la tabella si legge da sistemi.ts. */
export default function ComeSiCalcola() {
  return (
    <div className="testo">
      <h2>Come si calcola</h2>
      <pre className="formule ag-mono">
        {`quantità = incidenza × mq netti       (× 1 + sfrido, solo lastre e isolante)
pezzi    = arrotonda su (quantità / confezione)
sfrido   = arrotonda su (pezzi netti × (1 + sfrido))

guide    = 2 × L × file di orditura, in barre da 3 m     (misure L×H)
montanti = (L / interasse, per difetto) + 1 per campitura:
           una barra se h ≤ 3 m, altrimenti n × h in barre — vince il maggiore con l'incidenza`}
      </pre>
      <p className="nota">
        Incidenze per mq di superficie. <strong>Excel storico</strong> è la tabella del magazzino (interasse 60);{' '}
        <strong>Manuale Fassa</strong> è il manuale Gypsotech, dove differisce. I valori a i40 della colonna Excel
        dei montanti sono estrapolati (60/40) e vanno confermati.
      </p>

      <h3>Soluzioni Siniat</h3>
      <pre className="formule ag-mono">
        {`lastre, isolante = incidenza Memento / 1,05 × mq netti     (il 5% di sfrido Siniat è già dentro)
                   poi il vostro sfrido, pezzi come sopra
altre voci       = incidenza Memento × mq netti            (il 5% resta)
guide, montanti  = come sopra, con le misure L×H
tasselli guide   = uno ogni 50 cm di guida                 (manuale del posatore)
controsoffitti   = guide perimetrali e banda sul perimetro delle campiture`}
      </pre>
      <p className="nota">
        Le incidenze sono quelle della scheda Memento per l'orditura scelta: la più economica che regge l'altezza,
        oppure quella scelta nella scheda della soluzione. Per le configurazioni certificate senza una scheda con le
        stesse lastre valgono le regole con cui il Memento costruisce le tabelle (lastre 1,05 m² per strato, guide
        0,7 m per fila, montanti per interasse, viti per strato, stucco 0,35 kg e nastro 0,9 m per faccia): in distinta
        sono marcate «stimata».
      </p>
      <p className="nota">
        Classi al fuoco e Rw sono quelli dichiarati da Siniat nei rapporti di classificazione e nel Memento: l'app li
        riporta con il riferimento, non li certifica. Per il fuoco vale la configurazione della guida antincendio 2026;
        sul preventivo va la dicitura di rinvio al certificato del produttore.
      </p>

      {(Object.keys(SISTEMI_PER_AMBITO) as Ambito[]).map((ambito) => (
        <section key={ambito}>
          <h3>{NOMI_AMBITI[ambito]}</h3>
          {SISTEMI_PER_AMBITO[ambito].map((id) => {
            const s = SISTEMI[id];
            return (
              <div key={id} className="ag-card incidenze">
                <h4>{s.nome}</h4>
                <div className="ag-tabella-wrap">
                  <table className="ag-tabella">
                    <thead>
                      <tr>
                        <th>Articolo</th>
                        <th className="r">Excel i60</th>
                        <th className="r">Excel i40</th>
                        <th className="r">Fassa i60</th>
                        <th className="r">Fassa i40</th>
                        <th className="r">Confezione</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.voci.map((v) => {
                        const art = ARTICOLI[v.ruolo];
                        return (
                          <tr key={v.ruolo}>
                            <td>
                              {art.descrizione} <span className="articolo-meta">{art.um}/mq</span>
                            </td>
                            <td className="r">{cella(v.classica, 'i60')}</td>
                            <td className="r">{cella(v.classica, 'i40')}</td>
                            <td className="r">{cella(manuale(v), 'i60')}</td>
                            <td className="r">{cella(manuale(v), 'i40')}</td>
                            <td className="r">
                              {numero(art.contenuto)} {art.um}
                              {art.daVerificare && <span className="ag-pastiglia pastiglia-arancio">da verificare</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
