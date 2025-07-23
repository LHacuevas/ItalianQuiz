import React from 'react';
import ItalianErrorDetectionGame from '../corrigeClaude';
import useStore from '../store';
import { useNavigate } from 'react-router-dom';

interface ErrorDetectionPageProps {
    level: string;
    saveResults: boolean;
    includePreviouslyAnswered: boolean;
}

const ErrorDetectionPage: React.FC<ErrorDetectionPageProps> = (props) => {
    const { appUsuario } = useStore();
    const navigate = useNavigate();
    return <ItalianErrorDetectionGame {...props} usuario={appUsuario} onExit={() => navigate('/app')} />;
};

export default ErrorDetectionPage;
