import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Distinta from './pages/Distinta';
import ComeSiCalcola from './pages/ComeSiCalcola';
import Accesso from './pages/Accesso';
import Mappatura from './pages/Mappatura';
import Recinto from './pages/Recinto';
import { useTema } from './lib/tema';
import { ProviderAccesso, useAccesso } from './lib/auth';
import { ProviderDati } from './lib/dati';

// Fase 3: distinta a video per tutti; listino, prezzi e mappatura per gli
// utenti autorizzati. Preventivo e archivio arrivano in Fase 4.
export default function App() {
  return (
    <ProviderAccesso>
      <ProviderDati>
        <Guscio />
      </ProviderDati>
    </ProviderAccesso>
  );
}

function Guscio() {
  const [tema, cambiaTema] = useTema();
  const { utente, autorizzato, logout } = useAccesso();
  const posizione = useLocation();

  return (
    <div className="app">
      <header className="ag-header">
        <div className="ag-logo">ME</div>
        <div className="ag-titolo">
          <h1>Il Magazzino Edile</h1>
          <span className="ag-modulo">Cartongesso</span>
          {utente && (
            <p className="ag-sottotitolo">
              {utente.email}
              {!autorizzato && ' · non abilitato a prezzi e mappatura'}
            </p>
          )}
        </div>
        <div className="ag-azioni">
          {utente ? (
            <button className="btn btn-sm" onClick={() => void logout()}>
              Esci
            </button>
          ) : (
            <Link className="btn btn-sm" to="/accesso">
              Accedi
            </Link>
          )}
          <button className="btn btn-icona" onClick={cambiaTema} title="Cambia tema">
            {tema === 'scuro' ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <nav className="ag-nav">
        <NavLink to="/distinta">Distinta</NavLink>
        {autorizzato && <NavLink to="/mappatura">Mappatura</NavLink>}
        <NavLink to="/come-si-calcola">Come si calcola</NavLink>
      </nav>

      <main>
        {/* cambiando pagina il recinto si azzera: un errore non blocca le altre pagine */}
        <Recinto key={posizione.pathname}>
          <Routes>
            <Route path="/" element={<Navigate to="/distinta" replace />} />
            <Route path="/distinta" element={<Distinta />} />
            <Route path="/accesso" element={utente ? <Navigate to="/distinta" replace /> : <Accesso />} />
            <Route path="/mappatura" element={<Mappatura />} />
            <Route path="/come-si-calcola" element={<ComeSiCalcola />} />
            <Route path="*" element={<Navigate to="/distinta" replace />} />
          </Routes>
        </Recinto>
      </main>
    </div>
  );
}
