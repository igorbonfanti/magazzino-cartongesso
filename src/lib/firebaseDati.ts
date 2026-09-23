import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { app } from './firebase';

/**
 * Firestore e Storage, separati da firebase.ts perche' pesano: questo modulo
 * si importa solo dai moduli remoti, che l'app carica dopo l'accesso.
 */
export const db = getFirestore(app);
/** Il listino arriva da qui: listino.xlsx, lo stesso file del gestionale. Solo lettura. */
export const storage = getStorage(app);
