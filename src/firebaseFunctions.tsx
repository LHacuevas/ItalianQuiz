// firebaseFunctions.ts
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Usuario, Respuesta } from './firebaseInterfaces';

export const guardarUsuario = async (nombreUsuario: string): Promise<Usuario> => {
    try {
        const q = query(collection(db, "usuarios"), where("nombreUsuario", "==", nombreUsuario));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const usuarioExistente = querySnapshot.docs[0];
            const usuarioRef = doc(db, "usuarios", usuarioExistente.id);
            await updateDoc(usuarioRef, {
                fechaUltimaEntrada: serverTimestamp()
            });
            console.log("Usuario encontrado y actualizado con ID: ", usuarioExistente.id);
            return {
                id: usuarioExistente.id,
                ...usuarioExistente.data()
            } as Usuario;
        } else {
            const nuevoUsuario = {
                nombreUsuario: nombreUsuario,
                fechaAlta: serverTimestamp(),
                fechaUltimaEntrada: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "usuarios"), nuevoUsuario);
            console.log("Nuevo usuario creado con ID: ", docRef.id);
            return {
                id: docRef.id,
                ...nuevoUsuario
            } as Usuario;
        }
    } catch (e) {
        console.error("Error al buscar/crear usuario: ", e);
        //throw e;
        return {
            id: 'sense',
            nombreUsuario: 'sense'
         } as Usuario;
    }
};

export const guardarRespuesta = async (respuesta: Respuesta): Promise<void> => {
    try
    {
        // Crea el objeto de respuesta con el campo `fecha` incluido
        const respuestaConFecha = {
            ...respuesta,
            fecha: serverTimestamp() // Añade el campo `fecha` con el timestamp del servidor
        };
        await addDoc(collection(db, "respuestas"), respuestaConFecha);
        console.log("Respuesta guardada:" + respuestaConFecha);
    } catch (e) {
        console.error("Error al guardar la respuesta: ", e);
        //throw e;
    }
};


const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toLocaleString();
    }
    return 'Fecha no disponible';
};

export const fetchRespuestas = async (idUsuario: string): Promise<Respuesta[]> => {
    const respuestasRef = collection(db, 'respuestas');
    const q = query(respuestasRef, where('idUsuario', '==', idUsuario));
    const querySnapshot = await getDocs(q);
    const respuestasData = querySnapshot.docs.map(doc => doc.data() as Respuesta);
    console.log("respuestas leidas: " + respuestasData.length);
    return respuestasData;
};
