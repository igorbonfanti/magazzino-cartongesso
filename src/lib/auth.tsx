/**
 * Accesso: email e password, come le altre app del magazzino (vedi
 * magazzino-scorte/src/lib/auth.tsx). La distinta si usa anche senza; listino,
 * prezzi, mappatura e preventivi chiedono un utente autorizzato.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import { autorizzato } from './ruoli';

interface StatoAccesso {
  utente: User | null;
  /** nell'elenco degli autorizzati: può vedere prezzi e mappatura */
  autorizzato: boolean;
  caricamento: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<StatoAccesso | null>(null);

export function ProviderAccesso({ children }: { children: ReactNode }) {
  const [utente, setUtente] = useState<User | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    // la sessione resta anche chiudendo il browser: al banco si entra una volta ogni tanto
    void setPersistence(auth, browserLocalPersistence);
    return onAuthStateChanged(auth, (u) => {
      setUtente(u);
      setCaricamento(false);
    });
  }, []);

  const valore = useMemo<StatoAccesso>(
    () => ({
      utente,
      autorizzato: autorizzato(utente?.uid),
      caricamento,
      login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      logout: async () => {
        await signOut(auth);
      },
    }),
    [utente, caricamento],
  );

  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>;
}

export function useAccesso(): StatoAccesso {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAccesso va usato dentro <ProviderAccesso>');
  return ctx;
}

/** Traduce i codici di errore di Firebase Auth in messaggi leggibili (come in scorte). */
export function messaggioErroreAuth(err: unknown): string {
  const codice = (err as { code?: string })?.code ?? '';
  switch (codice) {
    case 'auth/invalid-email':
      return 'Indirizzo email non valido.';
    case 'auth/user-disabled':
      return 'Utente disabilitato.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email o password errati.';
    case 'auth/too-many-requests':
      return 'Troppi tentativi falliti. Riprova fra qualche minuto.';
    case 'auth/network-request-failed':
      return 'Connessione assente: impossibile raggiungere Firebase.';
    default:
      return 'Accesso non riuscito. Riprova.';
  }
}
