/**
 * L'anagrafica clienti del gestionale, letta e basta: clienti.xlsx da Storage
 * con la copia in IndexedDB (come il listino: si riscarica se cambia la data
 * del file, la copia vale 24 ore), più una ricerca per inizio di ragione
 * sociale nei clienti aggiunti a mano nella collection "clienti". Quella
 * collection ha decine di migliaia di documenti: non si legge tutta.
 */
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { getDownloadURL, getMetadata, ref } from 'firebase/storage';
import { FILE_CLIENTI, SOLO_LETTURA } from './firebase';
import { db, storage } from './firebaseDati';
import { leggiArchivio, scriviArchivio } from './archivio';
import { clienteDaDocumento, leggiRigheClienti } from './clienti';
import type { ClienteAnagrafica } from './clienti';

const CHIAVE = 'clienti';
const VALIDITA_MS = 24 * 60 * 60 * 1000;

interface CopiaClienti {
  aggiornato: string;
  verificato: string;
  clienti: ClienteAnagrafica[];
}

export interface EsitoClienti {
  clienti: ClienteAnagrafica[];
  errore?: string;
}

export async function caricaClienti(): Promise<EsitoClienti> {
  const copia = await leggiArchivio<CopiaClienti>(CHIAVE);
  if (copia && Date.now() - Date.parse(copia.verificato) < VALIDITA_MS) return { clienti: copia.clienti };
  try {
    const rif = ref(storage, FILE_CLIENTI);
    const meta = await getMetadata(rif);
    const adesso = new Date().toISOString();
    if (copia && copia.aggiornato === meta.updated) {
      await scriviArchivio(CHIAVE, { ...copia, verificato: adesso });
      return { clienti: copia.clienti };
    }
    const risposta = await fetch(await getDownloadURL(rif));
    if (!risposta.ok) throw new Error(`scaricamento non riuscito (${risposta.status})`);
    const XLSX = await import('xlsx');
    const libro = XLSX.read(await risposta.arrayBuffer(), { type: 'array' });
    const righe = XLSX.utils.sheet_to_json<unknown[]>(libro.Sheets[libro.SheetNames[0]!]!, { header: 1 });
    const clienti = leggiRigheClienti(righe);
    await scriviArchivio(CHIAVE, { aggiornato: meta.updated, verificato: adesso, clienti } satisfies CopiaClienti);
    return { clienti };
  } catch (e) {
    const errore = (e as { code?: string })?.code === 'storage/object-not-found'
      ? 'clienti.xlsx non c’è su Firebase Storage.'
      : 'Anagrafica clienti non raggiungibile.';
    return { clienti: copia?.clienti ?? [], errore: copia ? `${errore} Si usa la copia locale.` : errore };
  }
}

/**
 * I clienti aggiunti a mano nel gestionale che cominciano con il testo, come
 * scritto, in maiuscolo o con l'iniziale maiuscola (Firestore distingue).
 * Un errore non ferma la ricerca: restano i clienti di clienti.xlsx.
 */
export async function cercaClientiManuali(cerca: string): Promise<ClienteAnagrafica[]> {
  const t = cerca.trim();
  if (t.length < 2) return [];
  const varianti = [...new Set([t, t.toUpperCase(), t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()])];
  const out: ClienteAnagrafica[] = [];
  await Promise.all(
    varianti.map(async (v) => {
      try {
        const q = query(collection(db, SOLO_LETTURA.clienti), where('ragione', '>=', v), where('ragione', '<=', `${v}`), orderBy('ragione'), limit(8));
        (await getDocs(q)).forEach((d) => {
          const c = clienteDaDocumento(d.data());
          if (c) out.push(c);
        });
      } catch {
        /* senza la collection si cerca solo nel file */
      }
    }),
  );
  return out;
}
