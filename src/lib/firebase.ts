import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Progetto Firebase condiviso con le altre app del magazzino.
// Tutte le collection di questa app usano il prefisso cgp_ (vedi COLL sotto)
// e le regole Firestore isolano cgp_* dal resto del progetto.
const firebaseConfig = {
  apiKey: 'AIzaSyCLdOfp4z3FUJX2xt-xBZciyjxJZWeoh7A',
  authDomain: 'magazzino-edile-pos.firebaseapp.com',
  projectId: 'magazzino-edile-pos',
  storageBucket: 'magazzino-edile-pos.firebasestorage.app',
  messagingSenderId: '696561179056',
  appId: '1:696561179056:web:fc6b1db62ed256fd3fde75',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
/** Il listino arriva da qui: listino.xlsx, lo stesso file del gestionale. Solo lettura. */
export const storage = getStorage(app);

/** Nomi delle collection Firestore. Unico punto di verita': non scrivere stringhe letterali altrove. */
export const COLL = {
  preventivi: 'cgp_preventivi',
  mapping: 'cgp_mapping',
  contatori: 'cgp_contatori',
  impostazioni: 'cgp_impostazioni',
} as const;

/** Il file del listino su Storage, condiviso con magazzino-gestionale. */
export const FILE_LISTINO = 'listino.xlsx';

/**
 * ID di documento a partire dal codice articolo: Firestore non accetta "/"
 * negli ID. Il codice originale resta sempre in un campo a parte.
 */
export function idCodice(codice: string): string {
  return encodeURIComponent(codice);
}
