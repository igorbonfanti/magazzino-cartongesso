/**
 * Codici di magazzino già usati nei preventivi, dalle istruzioni del progetto.
 * E' il punto di partenza di cgp_mapping (Fase 3): da li' in poi vince quello
 * che c'e' su Firestore. Le chiavi assenti sono "da mappare": NON inventarle.
 */
export const MAPPING_SEED: Record<string, { codice: string; descrizione: string; prezzoPer?: 'confezione' | 'um' }> = {
  LASTRA_BA13_STD: { codice: 'CAR13', descrizione: 'CARTONGESSO BA13 LASTRA CM.200x120' },
  GUIDA_75: { codice: 'GUI7', descrizione: 'Guida 75' },
  MONTANTE_75: { codice: 'MON7', descrizione: 'Montante 75' },
  // 0,12 € a listino è il prezzo del tassello, non della confezione da 100
  TASSELLI: { codice: 'AKF202M', descrizione: 'TASSELLI A VITE 6X30', prezzoPer: 'um' },
  VITI_25: { codice: 'CARTOVIT2', descrizione: 'Viti 25 (conf. 1000)' },
  VITI_35: { codice: 'CARTOVIT3', descrizione: 'Viti 35 (conf. 1000)' },
  VELOVETRO: { codice: 'VELO90', descrizione: 'VELOVETRO ML.90 AKIFIX' },
  STUCCO: { codice: 'STUGES', descrizione: 'STUCCO KG.10 SINIAT' },
};
