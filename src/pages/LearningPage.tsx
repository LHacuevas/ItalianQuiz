import React from 'react';
import ItalianLearningApp from '../parrafoClaude2';
import useStore from '../store';
import { useNavigate } from 'react-router-dom';

interface LearningPageProps {
    numQuestions: number;
    onlyOptionQuestions: boolean;
    difficulty: string;
    saveResults: boolean;
    includePreviouslyAnswered: boolean;
}

const LearningPage: React.FC<LearningPageProps> = (props) => {
    const { appUsuario } = useStore();
    const navigate = useNavigate();
    return <ItalianLearningApp {...props} usuario={appUsuario} name={appUsuario?.nombreUsuario || ''} onExit={() => navigate('/app')} />;
};

export default LearningPage;
