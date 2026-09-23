import { useState } from 'react';
import { messaggioErroreAuth, useAccesso } from '../lib/auth';

/** Accesso con email e password, come le altre app del magazzino. */
export default function Accesso() {
  const { login } = useAccesso();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [inCorso, setInCorso] = useState(false);

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    setErrore('');
    setInCorso(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrore(messaggioErroreAuth(err));
      setInCorso(false);
    }
  }

  return (
    <div className="accesso">
      <form className="ag-card accesso-riquadro" onSubmit={invia}>
        <h2>Accedi</h2>
        <p className="nota">Per listino, prezzi e mappatura degli articoli. La distinta si usa anche senza.</p>

        <label className="opzione">
          <span className="ag-etichetta">Email</span>
          <input
            className="ag-campo"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="opzione">
          <span className="ag-etichetta">Password</span>
          <input
            className="ag-campo"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {errore && <p className="avviso avviso-attenzione">{errore}</p>}

        <button className="btn btn-primary" type="submit" disabled={inCorso}>
          {inCorso ? 'Attendi…' : 'Entra'}
        </button>

        <p className="nota">Le credenziali sono le stesse del gestionale. Se non riesci a entrare, chiedi a Igor.</p>
      </form>
    </div>
  );
}
