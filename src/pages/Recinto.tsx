import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

/**
 * Se una pagina va in errore, un messaggio leggibile al posto della pagina
 * vuota: si vede cosa è successo, lo si può riferire, e l'intestazione resta.
 */
export default class Recinto extends Component<{ children: ReactNode }, { errore: Error | null }> {
  state: { errore: Error | null } = { errore: null };

  static getDerivedStateFromError(errore: Error) {
    return { errore };
  }

  componentDidCatch(errore: Error, info: ErrorInfo) {
    console.error('Errore nella pagina', errore, info.componentStack);
  }

  render() {
    if (!this.state.errore) return this.props.children;
    return (
      <div className="testo">
        <h2>Qualcosa non ha funzionato</h2>
        <p className="avviso avviso-attenzione">{this.state.errore.message || String(this.state.errore)}</p>
        <p className="nota">
          Quello che era già salvato non si è perso. Ricarica la pagina; se si ripete, manda questo messaggio a Igor.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Ricarica
        </button>
      </div>
    );
  }
}
