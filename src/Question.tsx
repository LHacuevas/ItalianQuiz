import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { CheckCircle, XCircle } from 'lucide-react';
import { Question } from './MyTypes.js'

interface QuizQuestionProps {
    currentQuestionData: Question;
    reviewMode: boolean;
    showExplanation: boolean;
    handleAnswer: (resposta: string | number) => void;
    userAnswers: (string | number | null)[]; // Actualizado para permitir null
    currentQuestion: number;
    onlyOptionQuestions: boolean;
}

interface Option {
    text: string;
    originalIndex: number;
}


const getButtonTextClass = (    
    isReviewMode: boolean,
    isShowExplanation: boolean,
    correctAnswer: boolean
) => {
    const baseClass = `
    w-full mb-3 text-left justify-start px-5 py-4 rounded-xl
    transition-all duration-300 ease-in-out
    font-medium text-lg
    shadow-sm hover:shadow-md
    focus:outline-none focus:ring-2 focus:ring-opacity-50
  `;

    if (isReviewMode || isShowExplanation) {
        if (correctAnswer) {
            return `${baseClass} 
        bg-green-500 text-white 
        hover:bg-green-600 
        focus:ring-green-400
      `;
        } else  {
            return `${baseClass} 
        bg-red-500 text-white 
        hover:bg-red-600 
        focus:ring-red-400
      `;
        }
    } else {
        if (correctAnswer) {
            return `${baseClass} 
        bg-blue-100 text-blue-800 
        hover:bg-blue-200 
        focus:ring-blue-500
      `;
        } else {
            return `${baseClass} 
        bg-white text-gray-800 
        hover:bg-gray-100 
        focus:ring-gray-400
        border border-gray-200
      `;
        }
    }
};

const getButtonClass = (
    option: Option,
    isReviewMode: boolean,
    isShowExplanation: boolean,
    userAnswer: number | null,
    correctAnswer: number
) => {
    const baseClass = `
    w-full mb-3 text-left justify-start px-5 py-4 rounded-xl
    transition-all duration-300 ease-in-out
    font-medium text-lg
    shadow-sm hover:shadow-md
    focus:outline-none focus:ring-2 focus:ring-opacity-50
  `;

    if (isReviewMode || isShowExplanation) {
        if (option.originalIndex === correctAnswer) {
            return `${baseClass} 
        bg-green-500 text-white 
        hover:bg-green-600 
        focus:ring-green-400
      `;
        } else if (userAnswer === option.originalIndex) {
            return `${baseClass} 
        bg-red-500 text-white 
        hover:bg-red-600 
        focus:ring-red-400
      `;
        } else {
            return `${baseClass} 
        bg-gray-100 text-gray-800 
        hover:bg-gray-200 
        focus:ring-gray-400
      `;
        }
    } else {
        if (userAnswer === option.originalIndex) {
            return `${baseClass} 
        bg-blue-100 text-blue-800 
        hover:bg-blue-200 
        focus:ring-blue-500
      `;
        } else {
            return `${baseClass} 
        bg-white text-gray-800 
        hover:bg-gray-100 
        focus:ring-gray-400
        border border-gray-200
      `;
        }
    }
};


const QuizQuestion: React.FC<QuizQuestionProps> = ({
    currentQuestionData,
    reviewMode,
    showExplanation,
    handleAnswer,
    userAnswers,
    currentQuestion,
    onlyOptionQuestions
}) => {
    const [randomizedOptions, setRandomizedOptions] = useState<Option[]>([]);
    const [textQuestion, setTextQuestion] = useState(false);
    const [answerCorrect, setAnswerCorrect] = useState('');
    const [userInput, setUserInput] = useState('');
    useEffect(() => {
        setUserInput('');
        const options: Option[] = [
            { text: currentQuestionData.option1, originalIndex: 0 },
            { text: currentQuestionData.option2, originalIndex: 1 },
            { text: currentQuestionData.option3, originalIndex: 2 },
        ];
        const shuffled = [...options].sort(() => Math.random() - 0.5);        
        const posibleTextQuestion =  (currentQuestionData.correct == -1)
        setTextQuestion(posibleTextQuestion && !onlyOptionQuestions);
        if (currentQuestionData.correct == -1) {
            setAnswerCorrect(currentQuestionData.option1)
        } else if (currentQuestionData.correct == 0) {
            setAnswerCorrect(currentQuestionData.option1);
        } else if (currentQuestionData.correct == 1) {
            setAnswerCorrect(currentQuestionData.option2);
        } else {
            setAnswerCorrect(currentQuestionData.option3);
        }
        if (!posibleTextQuestion || onlyOptionQuestions ) {
            const shuffled = [...options].sort(() => Math.random() - 0.5);
            setRandomizedOptions(shuffled);
        }

    }, [currentQuestionData]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(event.target.value);
    };

    const handleSubmit = () => {
        //handleAnswer(userInput);
        //Busco el texto que ha entrado userinput en las tres respuestas posibles currenQuestonData.option si no es ninguna de ellas seguro que es incorrecto
        //if (userInput === answerCorrect) { handleAnswer(currentQuestionData.correct != -1?currentQuestionData.correct: 1) }
        //else handleAnswer(-1);
        handleAnswer(userInput);
    };

    if (textQuestion) {
        return (
            <>
                <p className="mb-4 text-lg font-semibold">{currentQuestionData.question} </p>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={(reviewMode || showExplanation) ? userAnswers[currentQuestion] : userInput}
                    onChange={handleInputChange}
                    disabled={reviewMode || showExplanation}
                    placeholder="Escribe tu respuesta aquí"
                />
                <Button
                    onClick={handleSubmit}
                    disabled={reviewMode || showExplanation}
                    variant="contained"
                    className={getButtonTextClass(reviewMode, showExplanation, answerCorrect === userInput)}
                >
                    Invia risposta
                </Button>
                {(reviewMode || showExplanation) && (
                    <div className="mt-3">
                        <p>Risposta corretta: {answerCorrect}</p>                        
                    </div>
                )}
            </>
        );
    }


    return (
        <>
            <p className="mb-4 text-lg font-semibold">{currentQuestionData.question}</p>
            {randomizedOptions.map((option, index) => (
                <Button
                    key={index}
                    onClick={() => !reviewMode && handleAnswer(option.originalIndex)}
                    className={getButtonClass(
                        option,
                        reviewMode,
                        showExplanation,
                        Number(userAnswers[currentQuestion]),
                        currentQuestionData.correct
                    )}
                    variant={
                        reviewMode || showExplanation
                            ? option.originalIndex === Number(currentQuestionData.correct)
                                ? "contained"
                                : userAnswers[currentQuestion] === option.originalIndex
                                    ? "outlined"
                                    : "text"
                            : userAnswers[currentQuestion] === option.originalIndex
                                ? "contained"
                                : "text"
                    }
                    disabled={reviewMode || showExplanation}
                >
                    {(reviewMode || showExplanation) && option.originalIndex === Number(currentQuestionData.correct) && <CheckCircle className="mr-2 h-4 w-4" />}
                    {(reviewMode || showExplanation) && userAnswers[currentQuestion] === option.originalIndex && option.originalIndex !== Number(currentQuestionData.correct) && <XCircle className="mr-2 h-4 w-4" />}
                    {option.text}
                </Button>
            ))}
        </>
    );
};

export default QuizQuestion;

