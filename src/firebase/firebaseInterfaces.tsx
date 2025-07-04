// interfaces.ts
import { Timestamp } from 'firebase/firestore';

export interface Usuario {
    id: string;
    nombreUsuario: string;
    email: string; // Added email
    fechaAlta?: Timestamp; // Made optional as it might not be present for local_user
    fechaUltimaEntrada?: Timestamp; // Made optional
    livelloGlobal: string | null;
    puntiTotali?: number; // Optional as it's initialized to 0
    storicoLivelli?: Array<{ livello: string; data: Timestamp }>; // Optional
    dataUltimoTestDiLivellamento?: Timestamp | null; // Optional
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
export default Usuario;