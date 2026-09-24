import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './tema.css';
import './base.css';
import './styles.css';

// Dopo una pubblicazione i file con i nomi vecchi spariscono: una pagina aperta
// da prima che ne chieda uno (listino, mappatura) si ricarica, al massimo una
// volta al minuto, invece di fermarsi.
window.addEventListener('vite:preloadError', (evento) => {
  try {
    const ultima = Number(sessionStorage.getItem('cartongesso.ricarica') ?? 0);
    if (Date.now() - ultima < 60_000) return;
    sessionStorage.setItem('cartongesso.ricarica', String(Date.now()));
  } catch {
    /* senza sessionStorage si ricarica lo stesso */
  }
  evento.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
