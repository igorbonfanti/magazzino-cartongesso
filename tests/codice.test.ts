import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function sorgenti(cartella: string): string[] {
  return readdirSync(cartella).flatMap((nome) => {
    const p = join(cartella, nome);
    return statSync(p).isDirectory() ? sorgenti(p) : /\.tsx?$/.test(nome) ? [p] : [];
  });
}

describe('regole del codice', () => {
  // Un effetto scritto "() => espressione" restituisce il valore dell'espressione, e React
  // lo chiama come pulizia quando il componente si chiude. Con scrollIntoView, che in
  // Chrome recente restituisce una Promise, era la pagina vuota dopo "Salva" in mappatura.
  it('gli effetti React si scrivono con le graffe', () => {
    const sbagliati = sorgenti('src').flatMap((f) =>
      readFileSync(f, 'utf-8')
        .split('\n')
        .map((riga, i) => ({ riga, i }))
        .filter(({ riga }) => /use(Layout)?Effect\(\s*(async\s*)?\(\)\s*=>\s*[^{\s]/.test(riga))
        .map(({ i }) => `${f}:${i + 1}`),
    );
    expect(sbagliati).toEqual([]);
  });
});
