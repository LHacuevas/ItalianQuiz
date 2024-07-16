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
