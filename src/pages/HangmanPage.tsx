import React from 'react';
import HangmanGame from '../impiccato';
import useStore from '../store';
import { useNavigate } from 'react-router-dom';

interface HangmanPageProps {
    saveResults: boolean;
    includePreviouslyAnswered: boolean;
    difficulty: string;
}

const HangmanPage: React.FC<HangmanPageProps> = (props) => {
    const { appUsuario } = useStore();
    const navigate = useNavigate();
    return <HangmanGame {...props} usuario={appUsuario} onExit={() => navigate('/app')} />;
};

export default HangmanPage;
