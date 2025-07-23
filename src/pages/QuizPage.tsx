import React from 'react';
import QuizItaliano from '../QuizItalianoGPT';
import useStore from '../store';
import { useNavigate } from 'react-router-dom';

interface QuizPageProps {
    numQuestions: number;
    onlyOptionQuestions: boolean;
    difficulty: string;
    saveResults: boolean;
    includePreviouslyAnswered: boolean;
}

const QuizPage: React.FC<QuizPageProps> = (props) => {
    const { appUsuario } = useStore();
    const navigate = useNavigate();
    return <QuizItaliano {...props} usuario={appUsuario} name={appUsuario?.nombreUsuario || ''} onExit={() => navigate('/app')} />;
};

export default QuizPage;
