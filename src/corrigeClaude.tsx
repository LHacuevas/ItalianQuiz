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
    isNaturallyCorrect?: boolean;
}

interface ItalianErrorDetectionGameProps {
    level: string;
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
                    .map(q => {
                        const isSentenceNaturallyCorrect = !q.idsPalabrasErroneas || q.idsPalabrasErroneas.trim() === "";
                        return {
                            id: q.id,
                            level: q.nivel,
                            text: q.fraseCompleta,
                            theme: q.tema,
                            isNaturallyCorrect: isSentenceNaturallyCorrect,
                            words: q.fraseCompleta.split(' ').map((word, index) => {
                                const isError = !isSentenceNaturallyCorrect && q.idsPalabrasErroneas.split('|').map(Number).includes(index + 1);
                                const errorIndex = !isSentenceNaturallyCorrect ? q.idsPalabrasErroneas.split('|').map(Number).indexOf(index + 1) : -1;
                                return {
                                    id: index + 1,
                                    text: word,
                                    isCorrect: isSentenceNaturallyCorrect ? true : !isError,
                                    correction: isError && q.correcciones ? q.correcciones.split('|')[errorIndex] : null,
                                    explanation: isError && q.explicacion ? q.explicacion.split('|')[errorIndex] : null
                                };
                            })
                        };
                    });
            } catch (error) {
                console.error('Errore nel caricamento delle frasi:', error);
                return [];
            }
        };

        const fetchSentences = async () => {
            let loadedSentences = await loadSentencesFromCSV(level);
            // ORDINA LE FRASI PER ID NUMERICO CRESCENTE
            loadedSentences.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            setSentences(loadedSentences);
            console.log("Frasi caricate e ordinate per ID:", loadedSentences.length);
        };

        fetchSentences();
    }, [level]);

    const currentSentence = sentences[currentSentenceIndex];

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeLeft > 0 && !isGameOver && currentSentence && !showResult && !currentSentence.isNaturallyCorrect) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && !isGameOver && !showResult && !currentSentence.isNaturallyCorrect) {
            checkAnswer(); // Only call checkAnswer if it's not a naturally correct sentence
        }
        return () => clearTimeout(timer);
    }, [timeLeft, isGameOver, currentSentence, showResult]); // isCurrentSentenceNaturallyCorrect is implicitly handled by currentSentence check

    // New useEffect to handle naturally correct sentences immediately
// useEffect(() => {
//     if (currentSentence && currentSentence.isNaturallyCorrect) {
//         setShowResult(true);
//     }
// }, [currentSentence]);

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

    useEffect(() => {
        // Quando l'indice della frase cambia (e non siamo al primo render con sentences vuoto), 
        // resetta lo stato per la nuova domanda.
        // Verifica che sentences esista e abbia elementi per evitare reset al montaggio iniziale prima del caricamento.
        if (sentences.length > 0) {
            setShowResult(false);
            setSelectedWords([]);
            setFlipWords([]);
            setTimeLeft(30);
        }
    }, [currentSentenceIndex, sentences]); // Aggiunto sentences alle dipendenze per il controllo iniziale

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
        const currentIdNumeric = currentSentence ? parseInt(currentSentence.id) : -1;
        
        // Aggiungi l'ID della frase corrente (se esiste) a quelle usate PRIMA di cercare la prossima
        if (currentSentence) {
            // È importante che questo aggiornamento di stato sia processato prima che la prossima frase sia effettivamente renderizzata
            // per evitare di selezionare la stessa frase se l'utente clicca molto velocemente.
            // React gestisce questo in batch, ma per essere sicuri, potremmo passare usedSentenceIds aggiornato
            // direttamente a una funzione di ricerca se necessario, o fare affidamento sull'aggiornamento di stato.
            // Per ora, presumiamo che l'aggiornamento di stato sia sufficientemente veloce.
            setUsedSentenceIds(prev => new Set(prev).add(currentSentence.id));
        }

        let nextSentenceToShow: Sentence | undefined = undefined;

        // Trova la frase con l'ID più piccolo, maggiore dell'ID corrente, e non ancora usata.
        // L'array 'sentences' è ordinato per ID numerico.
        // Usiamo l'insieme `usedSentenceIds` *dello stato attuale* per la ricerca,
        // l'aggiornamento con l'ID corrente sarà disponibile al prossimo render/chiamata.
        const updatedUsedIds = currentSentence ? new Set(usedSentenceIds).add(currentSentence.id) : usedSentenceIds;

        for (let i = 0; i < sentences.length; i++) {
            const potentialNextSentence = sentences[i];
            if (parseInt(potentialNextSentence.id) > currentIdNumeric && !updatedUsedIds.has(potentialNextSentence.id)) {
                nextSentenceToShow = potentialNextSentence; 
                break; 
            }
        }
        
        if (nextSentenceToShow) {
            setCurrentSentenceIndex(sentences.findIndex(s => s.id === nextSentenceToShow!.id));
        } else {
            // Se non c'è una prossima frase sequenziale, verifica se ce ne sono altre non usate (magari precedenti nella sequenza o ID non contigui)
            const anyOtherUnused = sentences.find(s => !updatedUsedIds.has(s.id));
            if (anyOtherUnused) {
                setCurrentSentenceIndex(sentences.findIndex(s => s.id === anyOtherUnused.id));
            } else {
                setIsGameOver(true);
            }
        }
        // I reset di setSelectedWords, setShowResult, setTimeLeft, setFlipWords
        // sono ora gestiti dall'useEffect che dipende da currentSentenceIndex.
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

    const handleAllCorrectAssertion = () => {
        if (!currentSentence) return;

        if (currentSentence.isNaturallyCorrect) {
            // L'utente ha ragione, la frase è corretta.
            setScore(score + 1); // O un punteggio appropriato
            console.log(`ID frase: ${currentSentence.id}, Utente ha detto 'Tutto Corretto'. Corretto!`);
            setSelectedWords([]); // Assicurarsi che sia vuoto per il rendering del messaggio
            setShowResult(true); 
        } else {
            // L'utente pensa sia tutto corretto, ma ci sono errori.
            // Lasciamo che checkAnswer calcoli il punteggio basato su zero errori trovati.
            setSelectedWords([]); // Assicura che nessuna parola sia selezionata per checkAnswer
            checkAnswer(); // checkAnswer imposterà setShowResult(true)
            console.log(`ID frase: ${currentSentence.id}, Utente ha detto 'Tutto Corretto'. Errato! Verranno mostrati gli errori.`);
        }
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

    const isCurrentSentenceNaturallyCorrect = currentSentence?.isNaturallyCorrect === true;

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
                                label={flipWords.includes(word.id) && word.correction ? word.correction : word.text}
                                onClick={() => !showResult && handleWordClick(word.id)}
                                clickable={!showResult}
                                color={selectedWords.includes(word.id) ? "primary" : "default"}
                                style={{
                                    margin: '4px',
                                    backgroundColor: showResult
                                        ? word.isCorrect
                                            ? selectedWords.includes(word.id)
                                                ? '#ff6b6b' // Falso positivo: parola corretta selezionata -> rosso
                                                : undefined // Parola corretta non selezionata -> default
                                            : selectedWords.includes(word.id)
                                                ? '#66bb6a' // Vero positivo: parola errata selezionata -> verde
                                                : '#ffcccb' // Falso negativo: parola errata non selezionata -> rosso chiaro
                                        : undefined, // Non in showResult -> default                                  
                                    animation: flipWords.includes(word.id) && !word.isCorrect ? `${flipAnimation} 2s infinite` : 'none'
                                }}
                            />
                        ))}
                    </Box>
                </Paper>
                {/* {isCurrentSentenceNaturallyCorrect && !showResult && (
                    <Alert severity="info" style={{ marginTop: '20px' }}>Questa frase è già corretta!</Alert>
                )} */}
                {!showResult && (
                    <>
                    <Button variant="contained" color="primary" onClick={checkAnswer} style={{ marginTop: '20px', marginRight: '10px' }}>
                        Verifica risposta
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleAllCorrectAssertion} style={{ marginTop: '20px' }}>
                        Tutto Corretto
                    </Button>
                </>
                )}
                 {(showResult /* || isCurrentSentenceNaturallyCorrect */) && ( // isCurrentSentenceNaturallyCorrect non è più necessario qui
                    <Box mt={2}>
                        {/* Feedback per quando l'utente ha premuto "Tutto Corretto" */}
                        {showResult && selectedWords.length === 0 && (
                            <Alert 
                                severity={currentSentence.isNaturallyCorrect ? "success" : "error"} 
                                style={{ marginBottom: '10px' }}
                            >
                                <AlertTitle>
                                    {currentSentence.isNaturallyCorrect
                                        ? "Hai detto 'Tutto Corretto' e avevi ragione! Questa frase non conteneva errori."
                                        : `Hai detto 'Tutto Corretto', ma la frase conteneva ${currentSentence.words.filter(w => !w.isCorrect).length} errore(i).`}
                                </AlertTitle>
                            </Alert>
                        )}

                        {/* Feedback per quando l'utente ha selezionato manualmente parole */}
                        {showResult && selectedWords.length > 0 && (
                            <Alert 
                                severity={isAnswerCorrect && currentSentence.words.filter(w => !w.isCorrect).length === selectedWords.filter(sw => currentSentence.words.find(w => w.id === sw && !w.isCorrect)).length && !selectedWords.some(sw => currentSentence.words.find(w => w.id === sw && w.isCorrect)) ? "success" : "error"} 
                                style={{ marginBottom: '10px' }}
                            >
                                <AlertTitle>
                                    {isAnswerCorrect && currentSentence.words.filter(w => !w.isCorrect).length === selectedWords.filter(sw => currentSentence.words.find(w => w.id === sw && !w.isCorrect)).length && !selectedWords.some(sw => currentSentence.words.find(w => w.id === sw && w.isCorrect))
                                        ? "Ottimo lavoro! Hai identificato correttamente tutti gli errori."
                                        : `Attenzione! Controlla le tue selezioni. Ricorda: le parole verdi sono errori ben identificati, quelle rosse sono selezioni errate (parole corrette marcate come errore), e quelle rosso chiaro sono errori che non hai trovato.`}
                                </AlertTitle>
                            </Alert>
                        )}
                        
                        {/* Spiegazioni per le parole effettivamente errate (se ce ne sono e non è una frase naturalmente corretta) */}
                        {showResult && !currentSentence.isNaturallyCorrect && currentSentence?.words.filter(word => !word.isCorrect).map(word => (
                            <Alert 
                                key={word.id} 
                                severity={selectedWords.includes(word.id) ? "success" : "error"} 
                                style={{ marginTop: '10px' }}
                            >
                                <AlertTitle>Spiegazione per "{word.text}" (Correzione: {word.correction || 'N/A'})</AlertTitle>
                                {word.explanation}
                            </Alert>
                        ))}

                        {/* Messaggio specifico se la frase era naturalmente corretta e l'utente NON ha premuto "Tutto Corretto" ma ha interagito (o per il caso di "Tutto Corretto" andato a buon fine) */}
                        {showResult && currentSentence.isNaturallyCorrect && selectedWords.length === 0 && (
                             <Alert severity="success" style={{ marginBottom: '10px' }}>
                                <AlertTitle>
                                    Corretto! Questa frase non conteneva errori.
                                </AlertTitle>
                            </Alert>
                        )}
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