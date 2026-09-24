/** Pezzi del wizard usati da più passi. */

export function Passo({ n, titolo, children }: { n: number; titolo: string; children: React.ReactNode }) {
  return (
    <section className="ag-card passo">
      <h3 className="passo-titolo">
        <span className="passo-numero">{n}</span>
        {titolo}
      </h3>
      {children}
    </section>
  );
}

/** Scelta fra poche voci, a bottoni affiancati. */
export function Interruttore<T extends string | number>({
  etichetta,
  valore,
  voci,
  cambia,
}: {
  etichetta: string;
  valore: T;
  voci: [T, string][];
  cambia: (v: T) => void;
}) {
  return (
    <div className="opzione">
      <span className="ag-etichetta">{etichetta}</span>
      <div className="interruttore" role="group" aria-label={etichetta}>
        {voci.map(([v, nome]) => (
          <button
            key={String(v)}
            className={`btn btn-sm ${valore === v ? 'attivo' : ''}`}
            aria-pressed={valore === v}
            onClick={() => cambia(v)}
          >
            {nome}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Sfrido di lastre e isolante, come testo digitato. */
export function CampiSfrido({
  lastre,
  isolante,
  cambia,
}: {
  lastre: string;
  isolante: string;
  cambia: (m: { sfridoLastre?: string; sfridoIsolante?: string }) => void;
}) {
  return (
    <>
      <label className="opzione">
        <span className="ag-etichetta">Sfrido lastre %</span>
        <input
          className="ag-campo ag-dati campo-corto"
          inputMode="numeric"
          value={lastre}
          onChange={(e) => cambia({ sfridoLastre: e.target.value })}
        />
      </label>
      <label className="opzione">
        <span className="ag-etichetta">Sfrido isolante %</span>
        <input
          className="ag-campo ag-dati campo-corto"
          inputMode="numeric"
          value={isolante}
          onChange={(e) => cambia({ sfridoIsolante: e.target.value })}
        />
      </label>
    </>
  );
}

const SINGOLARE: Record<string, string> = {
  lastre: 'lastra', barre: 'barra', rotoli: 'rotolo', sacchi: 'sacco', secchi: 'secchio', scatole: 'scatola', pannelli: 'pannello', pacchi: 'pacco',
};

/** "rotoli" → "rotolo": il nome di una confezione sola */
export function singolare(umConf: string): string {
  return SINGOLARE[umConf] ?? umConf;
}

/** 5 → "5", 4.2 → "4,2" */
export function metriTesto(x: number): string {
  return String(x).replace('.', ',');
}
