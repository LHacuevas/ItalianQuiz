// interfaces.ts
import { Timestamp, FieldValue } from 'firebase/firestore';

export interface Usuario {
    id: string;
    nombreUsuario: string;
    fechaAlta: Timestamp | null | FieldValue;
    fechaUltimaEntrada: Timestamp | null | FieldValue;
    livelloGlobal?: string | null;
    email?: string | null;
    puntiTotali?: number;
    storicoLivelli?: Array<{ livello: string; data: Timestamp | FieldValue }>;
    dataUltimoTestDiLivellamento?: Timestamp | null | FieldValue;
}

export interface Respuesta {
    idUsuario: string;
    tipoPregunta: string;
    idPregunta: string;
    idSubPregunta?: string;
    respuesta: string;
    correcta: boolean;
    fecha?: Timestamp;
}

export interface RegCorrige {
    id: string;
    nivel: string;
    fraseCompleta: string;
    idsPalabrasErroneas: string; //Array separadas por |
    palabrasErroneas: string; //Array separadas por |
    correcciones: string; //Array separadas por |
    explicacion: string;//Array separadas por |
    tema: string;
} 

export interface GameSessionResult {
  userId: string; // ID dell'utente da Firebase Auth o l'ID dell'oggetto Usuario
  gameType: string; // Es. 'QuizItalianoGPT', 'Impiccato', 'TypingTutor', 'ErrorDetection', 'ParagraphCompletion'
  timestamp: any; // Per Firestore serverTimestamp()
  difficulty?: string; // Livello di difficoltà se applicabile (A1, B2, ecc.)
  score?: number; // Punteggio ottenuto
  totalPossibleScore?: number; // Punteggio massimo possibile o numero totale di item
  timeTakenSeconds?: number; // Tempo impiegato in secondi
  itemsPlayed?: number; // Numero di domande, parole, frasi giocate
  gameSpecificDetails?: { // Oggetto per dettagli specifici del gioco
    [key: string]: any; // Permette qualsiasi altro dato specifico
    wpm?: number; // Velocità media parole al minuto (per TypingTutor)
    accuracy?: number; // Precisione media (per TypingTutor)
    realAccuracy?: number; // Precisione reale media (per TypingTutor)
    theme?: string; // Tema o categoria (per TypingTutor, ErrorDetection)
    errorsCorrected?: number; // Numero di errori corretti (per ErrorDetection)
    errorsMissed?: number; // Numero di errori non identificati (per ErrorDetection)
    falsePositives?: number; // Numero di parole corrette selezionate erroneamente (per ErrorDetection)
    // Aggiungere altri campi specifici se necessario per altri giochi
  };
}

export default Usuario;