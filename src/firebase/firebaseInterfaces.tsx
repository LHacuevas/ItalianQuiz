// interfaces.ts
import { Timestamp } from 'firebase/firestore';

export interface Usuario {
    id: string;
    nombreUsuario: string;
    fechaAlta: Timestamp;
    fechaUltimaEntrada: Timestamp;
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