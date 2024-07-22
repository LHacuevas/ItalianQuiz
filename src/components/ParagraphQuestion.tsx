// QuestionComponent.tsx
import React, { useMemo } from 'react';
import { FormControl, Select, MenuItem, Input } from '@mui/material';
import { ParagraphQuestion } from '../MyTypes';

interface QuestionComponentProps {
    question: ParagraphQuestion;
    currentParagraphId: number;
    userAnswers: Record<number, Record<number, string>>;
    handleInputChange: (paragraphId: number, questionId: number, value: string) => void;
    showResults: boolean;
    useDropdown: boolean;
}

const QuestionComponent: React.FC<QuestionComponentProps> = ({
    question,
    currentParagraphId,
    userAnswers,
    handleInputChange,
    showResults,
    useDropdown
}) => {
    const randomizedOptions = useMemo(() => {
        return question.options.split('|').sort(() => Math.random() - 0.5);
    }, [question.options]);

    if (!question) return null;

    const isCorrect = showResults && userAnswers[currentParagraphId]?.[Number(question.paragraphSubId)] === question.correct;
    const isIncorrect = showResults && userAnswers[currentParagraphId]?.[Number(question.paragraphSubId)] && userAnswers[currentParagraphId]?.[Number(question.paragraphSubId)] !== question.correct;

   
    return (
        <div className={`inline-block mx-1 p-1 border-2 ${isCorrect ? 'border-green-500 bg-green-200' : isIncorrect ? 'border-red-500 bg-red-200' : 'border-gray-300'}`}>
            {useDropdown ? (
                <FormControl size="small" className="min-w-0">
                    <Select
                        value={userAnswers[currentParagraphId]?.[Number(question.paragraphSubId)] || ''}
                        onChange={(e) => handleInputChange(currentParagraphId, Number(question.paragraphSubId), e.target.value as string)}
                        displayEmpty
                        renderValue={(selected) => (
                            <span className={`text-xs ${selected ? 'font-bold' : ''}`}>
                                {selected || question.hint}
                            </span>
                        )}
                    >
                        <MenuItem value="" disabled className="text-xs">{question.hint}</MenuItem>
                        {randomizedOptions.map((option, index) => (
                            <MenuItem key={index} value={option} className="text-xs">{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <Input
                    type="text"
                    value={userAnswers[currentParagraphId]?.[Number(question.paragraphSubId)] || ''}
                    onChange={(e) => handleInputChange(currentParagraphId, Number(question.paragraphSubId), e.target.value)}
                    placeholder={question.hint}
                    className={`w-24 sm:w-32 text-xs ${isCorrect ? 'border-green-500' : isIncorrect ? 'border-red-500' : ''}`}
                />
            )}
        </div>
    );
};

export default QuestionComponent;