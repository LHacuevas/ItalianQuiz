import React from 'react';
import ItalianTypingTutor from '../ItalianTypingTutor';
import useStore from '../store';
import { useNavigate } from 'react-router-dom';

interface TypingTutorPageProps {
    saveResults: boolean;
}

const TypingTutorPage: React.FC<TypingTutorPageProps> = (props) => {
    const { appUsuario } = useStore();
    const navigate = useNavigate();
    return <ItalianTypingTutor {...props} usuario={appUsuario} onExit={() => navigate('/app')} />;
};

export default TypingTutorPage;
