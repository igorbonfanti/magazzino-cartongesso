/**
 * Listino e mappatura per tutta l'app: si caricano quando entra un utente
 * autorizzato, si svuotano quando esce.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAccesso } from './auth';
import type { ArticoloListino, Listino } from './listino';
import type { Mappatura } from './mappatura';
import { indiceListino } from '../prezzi';

interface StatoDati {
  listino: Listino | null;
  /** articoli per codice */
  indice: ReadonlyMap<string, ArticoloListino>;
  mappature: ReadonlyMap<string, Mappatura>;
  caricamento: boolean;
  /** errore o avviso sul listino (es. si lavora con la copia locale) */
  avvisoListino?: string;
  avvisoMappature?: string;
  aggiornaListino: () => Promise<void>;
  salvaMappatura: (m: Pick<Mappatura, 'chiave' | 'codice' | 'prezzoPer' | 'scontoExtraBp'>) => Promise<void>;
  togliMappatura: (chiave: string) => Promise<void>;
}

const Ctx = createContext<StatoDati | null>(null);
const VUOTO = new Map();

// Firestore, Storage e SheetJS arrivano solo con l'accesso: chi usa soltanto
// la distinta non li scarica.
const remotoListino = () => import('./listinoRemoto');
const remotoMappature = () => import('./mappaturaRemota');

export function ProviderDati({ children }: { children: ReactNode }) {
  const { autorizzato } = useAccesso();
  const [listino, setListino] = useState<Listino | null>(null);
  const [mappature, setMappature] = useState<Map<string, Mappatura>>(VUOTO);
  const [caricamento, setCaricamento] = useState(false);
  const [avvisoListino, setAvvisoListino] = useState<string>();
  const [avvisoMappature, setAvvisoMappature] = useState<string>();

  const carica = useCallback(async (forza: boolean) => {
    setCaricamento(true);
    try {
      const [{ caricaListino }, { leggiMappature }] = await Promise.all([remotoListino(), remotoMappature()]);
      await Promise.all([
        caricaListino({ forza }).then(
          (esito) => {
            setListino(esito.listino);
            setAvvisoListino(esito.errore ? `${esito.errore} Si usa la copia locale.` : undefined);
          },
          (e: unknown) => setAvvisoListino(e instanceof Error ? e.message : 'Listino non caricato.'),
        ),
        leggiMappature().then((esito) => {
          setMappature(esito.mappature);
          setAvvisoMappature(esito.errore);
        }),
      ]);
    } finally {
      setCaricamento(false);
    }
  }, []);

  useEffect(() => {
    if (autorizzato) {
      void carica(false);
    } else {
      setListino(null);
      setMappature(VUOTO);
      setAvvisoListino(undefined);
      setAvvisoMappature(undefined);
    }
  }, [autorizzato, carica]);

  const indice = useMemo(() => (listino ? indiceListino(listino.articoli) : VUOTO), [listino]);

  const valore = useMemo<StatoDati>(
    () => ({
      listino,
      indice,
      mappature,
      caricamento,
      avvisoListino,
      avvisoMappature,
      aggiornaListino: () => carica(true),
      salvaMappatura: async (m) => {
        const r = await remotoMappature();
        try {
          await r.salvaMappatura(m);
        } catch (e) {
          throw new Error(r.messaggioErroreFirestore(e));
        }
        const esito = await r.leggiMappature();
        setMappature(esito.mappature);
        setAvvisoMappature(esito.errore);
      },
      togliMappatura: async (chiave) => {
        const r = await remotoMappature();
        try {
          await r.togliMappatura(chiave);
        } catch (e) {
          throw new Error(r.messaggioErroreFirestore(e));
        }
        const esito = await r.leggiMappature();
        setMappature(esito.mappature);
        setAvvisoMappature(esito.errore);
      },
    }),
    [listino, indice, mappature, caricamento, avvisoListino, avvisoMappature, carica],
  );

  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>;
}

export function useDati(): StatoDati {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDati va usato dentro <ProviderDati>');
  return ctx;
}
