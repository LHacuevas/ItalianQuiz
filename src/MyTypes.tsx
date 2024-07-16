export interface Question {
    id: number;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    correct: number;
    explanation: string;
    difficulty: string;
    generated: string;
    //Lo añado para poder rellenar por texto
    [key: string]: any;
}

// Define las interfaces para los datos de párrafos y preguntas
export interface Paragraph {
    id: number;
    text: string; //Parrafo con [] para las palabras a completar ejemplo: "Ieri [1] una giornata [2]. [3] presto e [4] al parco. Lì, [5] molti amici e [6] insieme tutto il pomeriggio.
    generated: string; //Const always = Claude
    //Lo añado para poder rellenar por texto
    [key: string]: any;
}

export interface ParagraphQuestion {
    id: number; //Id de la question dentro de su parrafo
    paragraphId: number;
    correct: string; //texto con las respuestas
    options: string[]; //3 o 4 possible options
    hint: string; //In case of questions about verbs, it's the infinitive form. For other types, it's the word type such as noun, adjective...
    explanation: string; //Pequeña explicacion en italiano de xq es la solucion correcta
    difficulty: string;  //Level A1,A2,B1,B2
    //Lo añado para poder rellenar por texto
    [key: string]: any;
}

export interface QuizParams {
    numQuestions?: number;
    name?: string;
    onlyOptionQuestions?: boolean;
    difficulty?: string;
}