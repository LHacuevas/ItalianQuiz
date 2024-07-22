// firebaseFunctions.ts
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp, setDoc, DocumentData, WhereFilterOp, Query } from 'firebase/firestore';
import { db } from './firebase';
import { Usuario, Respuesta } from './firebaseInterfaces';
import Papa from 'papaparse'; // Necesitarás instalar papaparse: npm install papaparse
import { Paragraph, ParagraphQuestion, Question, RegImpiccato, RegQuote } from '../MyTypes';
import { questionsCSV } from '../questionGPT4o';
import { quoteCSV } from '../questionMotiva';
import { paragraphsCSV } from '../questionParrafo';
import { paragraphsQuestionsCSV } from '../questionParrafo';
import { impiccatoCSV } from '../question.Impiccato';

const colImpiccato = ["questionImpiccato",impiccatoCSV]
const colMultiRespuesta = ["questionMultiRespuesta",questionsCSV]
const colParrafo = ["questionParagraphs", paragraphsCSV]
const colParrafoSub = ["questionParagraphsSub", paragraphsQuestionsCSV]
const colQuotes = ["quotes", quoteCSV]
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
export const guardarUsuario = async (nombreUsuario: string): Promise<Usuario> => {
    if (process.env.REACT_APP_USE_DATABASE === 'true') {
        try {
            const q = query(collection(db, colUsuarios), where("nombreUsuario", "==", nombreUsuario));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const usuarioExistente = querySnapshot.docs[0];
                const usuarioRef = doc(db, colUsuarios, usuarioExistente.id);
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

                const docRef = await addDoc(collection(db, colUsuarios), nuevoUsuario);
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
    }else{
        return {
            id: 'senseBD',
            nombreUsuario: 'senseBD'
        } as Usuario;}
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


const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toLocaleString();
    }
    return 'Fecha no disponible';
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

type CSVRow = Record<string, string | number | boolean>;
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
            if (idField && idField in row) {
                const id = String(row[idField]);
                delete docData[idField]; // Eliminar el campo ID de los datos
                if (Object.keys(docData).length > 0) {
                    await setDoc(doc(db, collectionName, id), docData);
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