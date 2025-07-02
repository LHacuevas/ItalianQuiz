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
export default Usuario;