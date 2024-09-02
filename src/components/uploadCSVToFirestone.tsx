import React, { useState } from 'react';
//import { Usuario } from '../firebase/firebaseInterfaces';
import { uploadCSVToFirestore } from '../firebase/firebaseFunctions'; // Importa la función de migración


// Asume que tienes estos CSVs definidos en algún lugar
//import { impiccatoCSV } from '../question.Impiccato.js';
//import { questionsCSV } from '../questionGPT4o.js'
//import { quoteCSV } from '../questionMotiva.js';
//import { paragraphsCSV, paragraphsQuestionsCSV } from '../questionParrafo';
import { typingCSV } from '../questionTyping';

interface DataLoadButtonProps {
    usuario: string | null;
}

const DataLoadButton: React.FC<DataLoadButtonProps> = ({ usuario }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLoadData = async () => {
        setIsLoading(true);
        try {
           // await uploadCSVToFirestore(paragraphsCSV, 'questionParagraphs', 'id');
            //await uploadCSVToFirestore(paragraphsQuestionsCSV, 'questionParagraphsSub');
            //await uploadCSVToFirestore(impiccatoCSV, 'questionImpiccato');
            //await uploadCSVToFirestore(questionsCSV, 'questionMultiRespuesta', 'id');
            //await uploadCSVToFirestore(quoteCSV, 'quotes', 'id');
            await uploadCSVToFirestore(typingCSV, 'questionTyping');
            alert('Datos cargados exitosamente');
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    };

    if (usuario !== "cuevasmi@gmail.com" ) {
        return null; // No renderiza nada si el usuario no es "alex"
    }

    return (
        <button
            onClick={handleLoadData}
            disabled={isLoading}
        >
            {isLoading ? 'Cargando...' : 'Cargar Datos'}
        </button>
    );
};

export default DataLoadButton;