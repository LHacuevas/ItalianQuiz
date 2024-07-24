import React, { useState, useEffect } from 'react';
import {
    Alert,
    AlertTitle,
    Button,
    LinearProgress,
    Typography,
    Box,
    Chip,
    Container,
    Paper
} from '@mui/material';
import { fetchCorrige } from './firebase/firebaseFunctions';
import { RegCorrige } from './firebase/firebaseInterfaces';
import { keyframes } from '@emotion/react';

const flipAnimation = keyframes`
  0%, 100% { transform: rotateX(0deg); }
  50% { transform: rotateX(180deg); }
`;

interface Word {
    id: number;
    text: string;
    isCorrect: boolean;
    correction: string | null;
    explanation: string | null;
}

interface Sentence {
    id: string;
    level: string;
    text: string;
    words: Word[];
    theme: string;
}

interface ItalianErrorDetectionGameProps {
    level: 'A2' | 'B1' | 'B2';
}

const ItalianErrorDetectionGame: React.FC<ItalianErrorDetectionGameProps> = ({ level }) => {
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [selectedWords, setSelectedWords] = useState<number[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isGameOver, setIsGameOver] = useState(false);
    const [usedSentenceIds, setUsedSentenceIds] = useState<Set<string>>(new Set());
    const [flipWords, setFlipWords] = useState<number[]>([]);

    useEffect(() => {
        const loadSentencesFromCSV = async (level: string): Promise<Sentence[]> => {
            try {
                const corrige = await fetchCorrige();
                return corrige
                    .filter((q: RegCorrige) => q.nivel === level)
                    .map(q => ({
                        id: q.id,
                        level: q.nivel,
                        text: q.fraseCompleta,
                        theme: q.tema,
                        words: q.fraseCompleta.split(' ').map((word, index) => {
                            const isError = q.idsPalabrasErroneas.split('|').map(Number).includes(index + 1);
                            const errorIndex = q.idsPalabrasErroneas.split('|').map(Number).indexOf(index + 1);
                            return {
                                id: index + 1,
                                text: word,
                                isCorrect: !isError,
                                correction: isError ? q.correcciones.split('|')[errorIndex] : null,
                                explanation: isError ? q.explicacion.split('|')[errorIndex] : null
                            };
                        })
                    }));
            } catch (error) {
                console.error('Errore nel caricamento delle frasi:', error);
                return [];
            }
        };

        const fetchSentences = async () => {
            const loadedSentences = await loadSentencesFromCSV(level);
            setSentences(loadedSentences);
            console.log("Frasi caricate:", loadedSentences.length);
        };

        fetchSentences();
    }, [level]);

    const currentSentence = sentences[currentSentenceIndex];

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeLeft > 0 && !isGameOver && currentSentence && !showResult) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && !isGameOver && !showResult) {
            checkAnswer();
        }
        return () => clearTimeout(timer);
    }, [timeLeft, isGameOver, currentSentence, showResult]);

    useEffect(() => {
        if (showResult && currentSentence) {
            const errorWords = currentSentence.words.filter(word => !word.isCorrect).map(word => word.id);
            setFlipWords(errorWords);
            const flipInterval = setInterval(() => {
                setFlipWords(prev => prev.length > 0 ? [] : errorWords);
            }, 2000);
            return () => clearInterval(flipInterval);
        }
    }, [showResult, currentSentence]);

    const handleWordClick = (wordId: number) => {
        setSelectedWords(prev =>
            prev.includes(wordId)
                ? prev.filter(id => id !== wordId)
                : [...prev, wordId]
        );
    };

    const checkAnswer = () => {
        if (!currentSentence) return;

        let newScore = score;
        let allErrorsFound = true;
        let noFalsePositives = true;

        currentSentence.words.forEach(word => {
            if (!word.isCorrect && selectedWords.includes(word.id)) {
                newScore += 2;
            } else if (word.isCorrect && selectedWords.includes(word.id)) {
                newScore -= 1;
                noFalsePositives = false;
            } else if (!word.isCorrect && !selectedWords.includes(word.id)) {
                newScore -= 1;
                allErrorsFound = false;
            }
        });

        setScore(newScore);
        setShowResult(true);
        console.log(`ID frase: ${currentSentence.id}, Risposta completamente corretta: ${allErrorsFound && noFalsePositives ? 'Sì' : 'No'}`);
    };

    const nextSentence = () => {
        if (currentSentence) {
            setUsedSentenceIds(prev => new Set(prev).add(currentSentence.id));
        }
        const availableSentences = sentences.filter(s => !usedSentenceIds.has(s.id));
        if (availableSentences.length > 0) {
            const nextIndex = Math.floor(Math.random() * availableSentences.length);
            setCurrentSentenceIndex(sentences.findIndex(s => s.id === availableSentences[nextIndex].id));
            setSelectedWords([]);
            setShowResult(false);
            setTimeLeft(30);
            setFlipWords([]);
        } else {
            setIsGameOver(true);
        }
    };

    const restartGame = () => {
        setCurrentSentenceIndex(0);
        setSelectedWords([]);
        setShowResult(false);
        setScore(0);
        setTimeLeft(30);
        setIsGameOver(false);
        setUsedSentenceIds(new Set());
        setFlipWords([]);
    };

    if (isGameOver) {
        return (
            <Container maxWidth="sm">
                <Box textAlign="center" mt={4}>
                    <Typography variant="h4" gutterBottom>Gioco terminato!</Typography>
                    <Typography variant="h6" gutterBottom>Punteggio finale: {score}</Typography>
                    <Button variant="contained" color="primary" onClick={restartGame}>
                        Gioca di nuovo
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!currentSentence) {
        return <Typography>Caricamento...</Typography>;
    }

    const isAnswerCorrect = currentSentence.words.every(word =>
        (word.isCorrect && !selectedWords.includes(word.id)) ||
        (!word.isCorrect && selectedWords.includes(word.id))
    );

    return (
        <Container maxWidth="md">
            <Box my={4}>
                <Typography variant="h4" gutterBottom>Gioco di Rilevamento Errori in Italiano</Typography>
                <Typography variant="h6" gutterBottom>Livello: {level}</Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography gutterBottom>Id: {currentSentence?.id}</Typography>
                    <Typography gutterBottom>Tema: {currentSentence?.theme}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography>Punteggio: {score}</Typography>
                    <Typography>Tempo: {timeLeft}s</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(timeLeft / 30) * 100} />
                <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                    <Box mb={2}>
                        {currentSentence?.words.map(word => (
                            <Chip
                                key={word.id}
                                label={flipWords.includes(word.id) ? word.correction : word.text}
                                onClick={() => !showResult && handleWordClick(word.id)}
                                color={selectedWords.includes(word.id) ? "primary" : "default"}
                                style={{
                                    margin: '4px',
                                    backgroundColor: showResult
                                        ? word.isCorrect
                                            ? selectedWords.includes(word.id)
                                                ? '#ff6b6b' // rosso più intenso per le parole corrette erroneamente selezionate
                                                : undefined
                                            : selectedWords.includes(word.id)
                                                ? '#66bb6a' // verde per gli errori correttamente identificati
                                                : '#ffcccb' // rosso chiaro per gli errori non identificati
                                        : undefined,                                    
                                    animation: flipWords.includes(word.id) ? `${flipAnimation} 2s infinite` : 'none'
                                }}
                            />
                        ))}
                    </Box>
                </Paper>
                {!showResult && (
                    <Button variant="contained" color="primary" onClick={checkAnswer} style={{ marginTop: '20px' }}>
                        Verifica risposta
                    </Button>
                )}
                {showResult && (
                    <Box mt={2}>
                        <Alert severity={isAnswerCorrect ? "success" : "error"}>
                            <AlertTitle>
                                {isAnswerCorrect
                                    ? "Ottimo lavoro! Hai identificato correttamente tutti gli errori."
                                    : "Attenzione! Non hai identificato correttamente tutti gli errori."}
                            </AlertTitle>
                        </Alert>
                        {currentSentence?.words.filter(word => !word.isCorrect).map(word => (
                            <Alert key={word.id} severity={selectedWords.includes(word.id) ? "success":"error" } style={{ marginTop: '10px' }}>
                                <AlertTitle>Spiegazione per "{word.text}"</AlertTitle>
                                {word.explanation}
                            </Alert>
                        ))}
                        <Button variant="contained" color="primary" onClick={nextSentence} style={{ marginTop: '20px' }}>
                            Prossima frase
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default ItalianErrorDetectionGame;