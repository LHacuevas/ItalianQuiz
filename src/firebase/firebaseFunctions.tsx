// firebaseFunctions.ts
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp, setDoc, DocumentData, WhereFilterOp, Query } from 'firebase/firestore';
import { db } from './firebase';
import { Usuario, Respuesta, RegCorrige } from './firebaseInterfaces';
import Papa from 'papaparse'; // Necesitarás instalar papaparse: npm install papaparse
import { Paragraph, ParagraphQuestion, Question, RegImpiccato, RegQuote, RegTyping } from '../MyTypes';
import { questionsCSV } from '../questionGPT4o';
import { quoteCSV } from '../questionMotiva';
import { paragraphsCSV } from '../questionParrafo';
import { paragraphsQuestionsCSV } from '../questionParrafo';
import { impiccatoCSV } from '../question.Impiccato';
import { corrigeCSV } from '../questionCorrige';
import { typingCSV } from '../questionTyping';

const colImpiccato = ["questionImpiccato",impiccatoCSV]
const colMultiRespuesta = ["questionMultiRespuesta",questionsCSV]
const colParrafo = ["questionParagraphs", paragraphsCSV]
const colParrafoSub = ["questionParagraphsSub", paragraphsQuestionsCSV]
const colQuotes = ["quotes", quoteCSV]
const colCorrige = ["questionCorrige", corrigeCSV]
const colTyping = ["questionTyping", typingCSV]
const colUsuarios = "usuarios"

type ValidationFunction<T> = (data: any) => data is T;

interface FetchOptions<T> {
    collectionName: string[];
    validator?: ValidationFunction<T>;
    defaultValues?: Partial<T>;
    queryConstraints?: [string, WhereFilterOp, any][];
}

export default async function fetchFromFirestore<T>({
    collectionName,
    validator,
    defaultValues = {},
    queryConstraints = []
}: FetchOptions<T>): Promise<T[]> {
    if (process.env.REACT_APP_USE_DATABASE === 'true') {
        const collectionRef = collection(db, collectionName[0]);
        let q: Query = query(collectionRef);

        // Apply query constraints if any
        queryConstraints.forEach(([field, op, value]) => {
            q = query(q, where(field, op as WhereFilterOp, value));
        });

        const querySnapshot = await getDocs(q);

        const results = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const item = { id: doc.id, ...defaultValues, ...data } as T;
            return item;
        });
        if (validator) {
            const validResults = results.filter(validator);
            console.log(`Fetched ${results.length} items, ${validResults.length} are valid.`);
            return validResults;
        } else return results;
    } else {
        const csvResults = parseCadenaCSV<T>(collectionName[1]);
        return csvResults;
     }

}
const isValidRegImpiccato: ValidationFunction<RegImpiccato> = (data: any): data is RegImpiccato => {
    return (
        typeof data.category === 'string' &&
        ['A2', 'B1', 'B2'].includes(data.level) &&
        typeof data.tip === 'string' &&
        typeof data.word === 'string' &&
        typeof data.question === 'string'
    );
};

// Example of how to use the generic function
export const fetchImpiccato = () => fetchFromFirestore<RegImpiccato>({
    collectionName: colImpiccato,
    validator: isValidRegImpiccato,
    defaultValues: { level: 'A2' }
});


// Example of how to use the generic function
export const fetchQuotes = () => fetchFromFirestore<RegQuote>({
    collectionName: colQuotes
});
// Example of how to use the generic function
export const fetchMultiRespuesta = () => fetchFromFirestore<Question>({
    collectionName: colMultiRespuesta
});
// Example of how to use the generic function
export const fetchParrafo = () => fetchFromFirestore<Paragraph>({
    collectionName: colParrafo
});
// Example of how to use the generic function
export const fetchParrafoSub = () => fetchFromFirestore<ParagraphQuestion>({
    collectionName: colParrafoSub
});

// Example of how to use the generic function
export const fetchCorrige = () => fetchFromFirestore<RegCorrige>({
    collectionName: colCorrige
});
export const fetchTyping = () => fetchFromFirestore<RegTyping>({
    collectionName: colTyping
});

export const guardarUsuario = async (nombreUsuario: string, email?: string, uid?: string): Promise<Usuario> => {
    if (process.env.REACT_APP_USE_DATABASE === 'true') {
        try {
            // Try to find user by UID first if provided, as it's the primary key
            if (uid) {
                const userRefByUid = doc(db, colUsuarios, uid);
                const userSnapByUid = await getDocs(query(collection(db, colUsuarios), where("__name__", "==", uid))); // Firestore getDoc doesn't work like this, need query
                
                if (!userSnapByUid.empty) {
                    const usuarioExistente = userSnapByUid.docs[0];
                    await updateDoc(userRefByUid, {
                        fechaUltimaEntrada: serverTimestamp(),
                        email: email || usuarioExistente.data().email, // Update email if provided
                        nombreUsuario: nombreUsuario || usuarioExistente.data().nombreUsuario // Update nombreUsuario if provided
                    });
                    console.log("Usuario encontrado por UID y actualizado: ", uid);
                    return {
                        id: uid,
                        ...usuarioExistente.data(),
                        // Ensure new fields are included, defaulting if not present
                        livelloGlobal: usuarioExistente.data().livelloGlobal || null,
                        puntiTotali: usuarioExistente.data().puntiTotali || 0,
                        storicoLivelli: usuarioExistente.data().storicoLivelli || [],
                        dataUltimoTestDiLivellamento: usuarioExistente.data().dataUltimoTestDiLivellamento || null,
                    } as Usuario;
                }
            }

            // Fallback or primary search by nombreUsuario (e.g., email or displayName)
            const q = query(collection(db, colUsuarios), where("nombreUsuario", "==", nombreUsuario));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const usuarioExistente = querySnapshot.docs[0];
                const usuarioRef = doc(db, colUsuarios, usuarioExistente.id);
                await updateDoc(usuarioRef, {
                    fechaUltimaEntrada: serverTimestamp(),
                    ...(email && { email: email }), // Update email if different or not set
                });
                console.log("Usuario encontrado por nombreUsuario y actualizado con ID: ", usuarioExistente.id);
                return {
                    id: usuarioExistente.id,
                    ...usuarioExistente.data(),
                    livelloGlobal: usuarioExistente.data().livelloGlobal || null,
                    puntiTotali: usuarioExistente.data().puntiTotali || 0,
                    storicoLivelli: usuarioExistente.data().storicoLivelli || [],
                    dataUltimoTestDiLivellamento: usuarioExistente.data().dataUltimoTestDiLivellamento || null,
                } as Usuario;
            } else {
                // Create new user
                const nuevoUsuarioData: Partial<Usuario> = { // Use Partial for initial object
                    nombreUsuario: nombreUsuario,
                    email: email || '', // Ensure email is stored
                    fechaAlta: serverTimestamp(),
                    fechaUltimaEntrada: serverTimestamp(),
                    livelloGlobal: null, // Initialize new fields
                    puntiTotali: 0,
                    storicoLivelli: [],
                    dataUltimoTestDiLivellamento: null,
                };
                
                let docRefId = uid; // Use UID for doc ID if creating new user from Firebase Auth
                if (docRefId) {
                    await setDoc(doc(db, colUsuarios, docRefId), nuevoUsuarioData);
                    console.log("Nuevo usuario creado con UID especificado: ", docRefId);
                } else {
                    const docRef = await addDoc(collection(db, colUsuarios), nuevoUsuarioData);
                    docRefId = docRef.id;
                    console.log("Nuevo usuario creado con ID generado: ", docRefId);
                }
                
                return {
                    id: docRefId,
                    ...nuevoUsuarioData
                } as Usuario;
            }
        } catch (e) {
            console.error("Error al buscar/crear usuario: ", e);
            return {
                id: uid || 'error_no_uid',
                nombreUsuario: nombreUsuario || 'error_user',
                email: email || '',
                livelloGlobal: null,
                puntiTotali: 0,
                storicoLivelli: [],
                dataUltimoTestDiLivellamento: null,
            } as Usuario;
        }
    } else {
        // Local/non-DB mode
        return {
            id: 'local_user',
            nombreUsuario: nombreUsuario,
            email: email || '',
            livelloGlobal: localStorage.getItem('userGlobalLevel') || null, // Try to get from localStorage
            puntiTotali: 0,
            storicoLivelli: [],
            dataUltimoTestDiLivellamento: null,
        } as Usuario;
    }
};

export const actualizarNivelGlobalUsuario = async (userId: string, nivel: string): Promise<void> => {
    if (process.env.REACT_APP_USE_DATABASE === 'true') {
        try {
            const userRef = doc(db, colUsuarios, userId);
            const nuevoHistoricoEntry = { livello: nivel, data: serverTimestamp() };
            
            await updateDoc(userRef, {
                livelloGlobal: nivel,
                dataUltimoTestDiLivellamento: serverTimestamp(),
                storicoLivelli: arrayUnion(nuevoHistoricoEntry) // Atomically adds to array
            });
            console.log(`Nivel global actualizado para usuario ${userId} a ${nivel}`);
        } catch (e) {
            console.error(`Error al actualizar nivel global para usuario ${userId}: `, e);
            // Consider re-throwing or specific error handling if needed by UI
        }
    } else {
        console.log("Modo offline: Nivel global no actualizado en Firestore.");
        // Optionally, could update localStorage here if desired, but App.tsx already does for 'userGlobalLevel'
    }
};


export const guardarRespuesta = async (respuesta: Respuesta): Promise<void> => {
    if (process.env.REACT_APP_USE_DATABASE === 'false') return;
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

export const fetchRespuestas = async (idUsuario: string): Promise<Respuesta[]> => {    
    if (process.env.REACT_APP_USE_DATABASE === 'false') return [];
    const respuestasRef = collection(db, 'respuestas');
    const q = query(respuestasRef, where('idUsuario', '==', idUsuario));
    const querySnapshot = await getDocs(q);
    const respuestasData = querySnapshot.docs.map(doc => doc.data() as Respuesta);
    console.log("respuestas leidas: " + respuestasData.length);
    return respuestasData;
};
// Función para limpiar las claves del objeto
function cleanObjectKeys(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj).reduce((acc, key) => {
        const cleanKey = key.trim(); // Elimina espacios al inicio y al final
        acc[cleanKey] = obj[key];
        return acc;
    }, {} as Record<string, any>);
}

// Función para eliminar campos vacíos y limpiar claves
function removeEmptyFieldsAndCleanKeys(obj: Record<string, any>): Record<string, any> {
    const cleanedObj = cleanObjectKeys(obj);
    return Object.keys(cleanedObj).reduce((acc, key) => {
        if (cleanedObj[key] !== null && cleanedObj[key] !== undefined && cleanedObj[key] !== '') {
            acc[key] = cleanedObj[key];
        }
        return acc;
    }, {} as Record<string, any>);
}

function parseCSV(csvString: string): Record<string, string>[] {
    const result = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
    });

    return result.data.map((row: any) => {
        const processedRow: Record<string, string> = {};
        for (const [key, value] of Object.entries(row)) {
            if (Array.isArray(value) && value.length === 2) {
                // Combinar los elementos del array en una sola cadena
                processedRow[key] = `${value[0]} - ${value[1]}`;
            } else {
                processedRow[key] = String(value);
            }
        }
        return processedRow;
    });
}
// Función para procesar CSV y subir a Firestore con manejo flexible de IDs y campos vacíos
export async function uploadCSVToFirestore(
    csvString: string,
    collectionName: string,
    idField: string | null = null
): Promise<void> {
    const data = parseCSV(csvString);

    const collectionRef = collection(db, collectionName);
    let previousRow: DocumentData | null = null;
    for (const row of data) {
        
        let docData: DocumentData = removeEmptyFieldsAndCleanKeys({ ...row });

        // Si después de eliminar campos vacíos no quedan datos, salta esta fila
        if (Object.keys(docData).length === 0) {
            console.warn('Fila sin datos válidos, saltando...');
            continue;
        }
        // Comparar con la fila anterior
        if (previousRow && areRowsEqual(previousRow, docData)) {
            console.warn('Fila duplicada consecutiva encontrada, saltando...');
            continue;
        }

        try {
            //console.log('Documento a subir:', docData);
            if (idField && idField in row && row[idField] !== null && String(row[idField]).trim() !== '') {
                const id = String(row[idField]).trim();
                 // Create a new object for docData to avoid modifying the original row object directly
                const docDataForFirestore = { ...docData };
                delete docDataForFirestore[idField]; // Eliminar el campo ID de los datos
                
                if (Object.keys(docDataForFirestore).length > 0) {
                    await setDoc(doc(db, collectionName, id), docDataForFirestore);
                    //console.log(`Documento con ID ${id} añadido a ${collectionName}`);
                } else {
                    console.warn(`Documento con ID ${id} no añadido porque no contiene datos válidos`);
                }
            } else {
                const docRef = await addDoc(collectionRef, docData);
                //console.log(`Documento añadido a ${collectionName} con ID generado: ${docRef.id}`);
            }
            // Actualizar la fila anterior
            previousRow = docData;
        } catch (error) {
            console.error(`Error al añadir documento a ${collectionName}:`, error);
        }
    }
}

// Función para comparar si dos filas son iguales
function areRowsEqual(row1: DocumentData, row2: DocumentData): boolean {
    const keys1 = Object.keys(row1);
    const keys2 = Object.keys(row2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (row1[key] !== row2[key]) {
            return false;
        }
    }

    return true;
}


export function parseCadenaCSV<T>(csv: string): T[] {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));

    return lines.slice(1).map(line => {
        const values = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g) || [];

        return headers.reduce((obj, header, index) => {
            let value = values[index] ? values[index].replace(/^,?"?|"?$/g, '').trim() : '';
            // Intenta convertir a número si es posible
            //const numValue = Number(value);
            //(obj as any)[header] = isNaN(numValue) ? value : numValue;
            //Todo ha de ser string para mantener compatibilidad con firestone
            (obj as any)[header] = value 
            return obj;
        }, {} as T);
    });
}