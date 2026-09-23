import { leggiNumero } from '../../lib/bozza';
import type { RequisitiBozza } from '../../lib/bozza';
import { operaInfo } from '../../selettore';
import type { Ambiente, Opera } from '../../types';
import { Interruttore } from './comuni';

const FUOCO = [0, 30, 45, 60, 90, 120, 180, 240];

const RW: [number, string][] = [
  [0, 'Nessuno'],
  [45, '≥ 45'],
  [50, '≥ 50'],
  [56, '≥ 56 · tra due unità'],
  [60, '≥ 60'],
  [65, '≥ 65'],
];

const AMBIENTI: [Ambiente, string][] = [
  ['normale', 'Normale'],
  ['umido', 'Umido · bagni, cucine'],
  ['bagnato', 'Umidità altissima · piscine, SPA'],
  ['esterno', 'Esterno'],
];

/** Cosa deve garantire l'opera: da qui il selettore sceglie le soluzioni. */
export default function Requisiti({
  opera,
  requisiti,
  cambia,
}: {
  opera: Opera;
  requisiti: RequisitiBozza;
  cambia: (r: Partial<RequisitiBozza>) => void;
}) {
  const op = operaInfo(opera);
  const sigla = opera === 'solaio' ? 'REI' : 'EI';
  const altezzaSbagliata = requisiti.altezza.trim() !== '' && leggiNumero(requisiti.altezza) === null;

  return (
    <div className="requisiti">
      <Interruttore<number>
        etichetta="Resistenza al fuoco"
        valore={requisiti.fuoco}
        voci={FUOCO.map((m) => [m, m ? `${sigla} ${m}` : 'Nessuna'] as [number, string])}
        cambia={(fuoco) => cambia({ fuoco })}
      />

      <div>
        <Interruttore<number> etichetta="Isolamento acustico Rw (dB)" valore={requisiti.rw} voci={RW} cambia={(rw) => cambia({ rw })} />
        <p className="nota">
          Rw è il valore di laboratorio: in opera si perdono 6–8 dB. Fra due unità immobiliari la legge chiede R'w ≥ 50 dB
          in opera (DPCM 5/12/1997; ospedali 55), quindi si parte da Rw ≥ 56.
        </p>
      </div>

      {op.altezza && (
        <label className="opzione">
          <span className="ag-etichetta">Altezza massima (m)</span>
          <input
            className={`ag-campo ag-dati campo-corto ${altezzaSbagliata ? 'campo-sbagliato' : ''}`}
            inputMode="decimal"
            placeholder="es. 3,20"
            value={requisiti.altezza}
            onChange={(e) => cambia({ altezza: e.target.value })}
          />
          <span className="nota">La campitura più alta: decide montanti e interasse.</span>
        </label>
      )}

      <Interruttore<Ambiente> etichetta="Ambiente" valore={requisiti.ambiente} voci={AMBIENTI} cambia={(ambiente) => cambia({ ambiente })} />

      {(opera === 'parete' || opera === 'controparete') && (
        <div className="opzioni">
          <label className="opzione opzione-spunta">
            <input type="checkbox" checked={requisiti.urti} onChange={(e) => cambia({ urti: e.target.checked })} />
            <span>Resistente agli urti</span>
          </label>
          <label className="opzione opzione-spunta">
            <input type="checkbox" checked={requisiti.carichi} onChange={(e) => cambia({ carichi: e.target.checked })} />
            <span>Carichi sospesi (pensili, sanitari)</span>
          </label>
          <label className="opzione opzione-spunta">
            <input type="checkbox" checked={requisiti.antieffrazione} onChange={(e) => cambia({ antieffrazione: e.target.checked })} />
            <span>Antieffrazione</span>
          </label>
        </div>
      )}
    </div>
  );
}
