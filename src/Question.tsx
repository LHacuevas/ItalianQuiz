import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { CheckCircle, XCircle } from 'lucide-react';
import { Question } from './MyTypes.js'

interface QuizQuestionProps {
    currentQuestionData: Question;
    reviewMode: boolean;
    showExplanation: boolean;
    handleAnswer: (index: number) => void;
    userAnswers: (number | null)[]; // Actualizado para permitir null
    currentQuestion: number;
}

interface Option {
    text: string;
    originalIndex: number;
}
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
    currentQuestion
}) => {
    const [randomizedOptions, setRandomizedOptions] = useState<Option[]>([]);

    useEffect(() => {
        const options: Option[] = [
            { text: currentQuestionData.option1, originalIndex: 0 },
            { text: currentQuestionData.option2, originalIndex: 1 },
            { text: currentQuestionData.option3, originalIndex: 2 },
        ];

        const shuffled = [...options].sort(() => Math.random() - 0.5);

        setRandomizedOptions(shuffled);
    }, [currentQuestionData]);

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
                        userAnswers[currentQuestion],
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
