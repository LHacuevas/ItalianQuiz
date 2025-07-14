import React, { useState } from 'react';
import { Button, Box } from '@mui/material';

interface TastieraProps {
    onKeyPress: (letter: string) => void;
    guessedLetters: string[];
}

const Tastiera: React.FC<TastieraProps> = ({ onKeyPress, guessedLetters }) => {
    const [isVisible, setIsVisible] = useState(true);
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    return (
        <>
            <Button onClick={() => setIsVisible(!isVisible)} sx={{ mt: 2 }}>
                {isVisible ? 'Nascondi tastiera' : 'Mostra tastiera'}
            </Button>
            {isVisible && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2 }}>
                    {alphabet.map((letter) => (
                        <Button
                            key={letter}
                            variant="contained"
                            onClick={() => onKeyPress(letter)}
                            disabled={guessedLetters.includes(letter)}
                            sx={{
                                minWidth: { xs: '30px', sm: '40px' },
                                minHeight: { xs: '30px', sm: '40px' },
                                fontSize: { xs: '0.8rem', sm: '1.2rem' },
                                padding: { xs: '5px', sm: '10px' },
                            }}
                        >
                            {letter}
                        </Button>
                    ))}
                </Box>
            )}
        </>
    );
};

export default Tastiera;
