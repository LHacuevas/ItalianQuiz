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
    sRespuestas: string[];
}