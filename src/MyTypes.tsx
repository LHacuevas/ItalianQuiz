import { Usuario } from "./firebase/firebaseInterfaces";

export interface RegQuote {
    id: string;
    text: string;
    author: string;
    [key: string]: string;
}
export interface Question {
    id: string;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    correct: string;
    explanation: string;
    difficulty: string;
    generated: string;
    //Lo añado para poder rellenar por texto
    [key: string]: string;
}

// Define las interfaces para los datos de párrafos y preguntas
export interface Paragraph {
    id: string;
    text: string; //Parrafo con [] para las palabras a completar ejemplo: "Ieri [1] una giornata [2]. [3] presto e [4] al parco. Lì, [5] molti amici e [6] insieme tutto il pomeriggio.
    generated: string; //Const always = Claude
    //Lo añado para poder rellenar por texto
    [key: string]: string;
}

export interface ParagraphQuestion {
    id: string; //Id Unico
    paragraphSubId: string;  //Id de la question dentro de su parrafo
    paragraphId: string;
    correct: string; //texto con las respuestas
    options: string; //3 o 4 possible options
    hint: string; //In case of questions about verbs, it's the infinitive form. For other types, it's the word type such as noun, adjective...
    explanation: string; //Pequeña explicacion en italiano de xq es la solucion correcta
    difficulty: string;  //Level A1,A2,B1,B2
    //Lo añado para poder rellenar por texto
    [key: string]: string;
}

export interface QuizParams {
    numQuestions?: number;
    name?: string;
    onlyOptionQuestions?: boolean;
    difficulty?: string;
    usuario: Usuario | null;
    
}

export interface RegImpiccato {
    id: string; //Añadido por el Firestone
    question: string; //descripcion de la palabra a adivinar
    word: string; //palabra a adivinar
    level: 'A2' | 'B1' | 'B2'; //nivel de dificutad segun el conocimiento de la lengua
    tip: string; //Pequeña ayuda que nos tendria que ayudar a solucionar la palabra
    category: string; //Categoria en la que se puede emarcar la palabra, no ha de ser muy especifica tipo viajes, musica, cuerpo humano...
    [key: string]: string ;
}

