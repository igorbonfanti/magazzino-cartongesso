import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Distinta from './pages/Distinta';
import ComeSiCalcola from './pages/ComeSiCalcola';
import { useTema } from './lib/tema';

// Fase 2: wizard e distinta a video, senza prezzi.
// Accesso, listino e mappatura arrivano in Fase 3; preventivo e archivio in Fase 4.
export default function App() {
  const [tema, cambiaTema] = useTema();

  return (
    <div className="app">
      <header className="ag-header">
        <div className="ag-logo">ME</div>
        <div className="ag-titolo">
          <h1>Il Magazzino Edile</h1>
          <span className="ag-modulo">Cartongesso</span>
        </div>
        <div className="ag-azioni">
          <button className="btn btn-icona" onClick={cambiaTema} title="Cambia tema">
            {tema === 'scuro' ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <nav className="ag-nav">
        <NavLink to="/distinta">Distinta</NavLink>
        <NavLink to="/come-si-calcola">Come si calcola</NavLink>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/distinta" replace />} />
          <Route path="/distinta" element={<Distinta />} />
          <Route path="/come-si-calcola" element={<ComeSiCalcola />} />
          <Route path="*" element={<Navigate to="/distinta" replace />} />
        </Routes>
      </main>
    </div>
  );
}
