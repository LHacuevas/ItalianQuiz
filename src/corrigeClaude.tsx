import React, { useState, useEffect, useCallback } from 'react';
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
import { fetchCorrige, saveGameSessionResult, fetchAnsweredQuestionIdsGroupedByType } from './firebase/firebaseFunctions'; // Aggiunto fetchAnsweredQuestionIdsGroupedByType
import { Usuario, GameSessionResult } from './firebase/firebaseInterfaces'; // Rimosso RegCorrige, Aggiunto Usuario, GameSessionResult
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
    onExit?: () => void;
    usuario?: Usuario | null;
    saveResults?: boolean;
    includePreviouslyAnswered?: boolean; // Anche se meno diretta, la logica di quali frasi mostrare potrebbe esserne influenzata
}

const ItalianErrorDetectionGame: React.FC<ItalianErrorDetectionGameProps> = ({ level, onExit, usuario, saveResults, includePreviouslyAnswered }) => {
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [selectedWords, setSelectedWords] = useState<number[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isGameOver, setIsGameOver] = useState(false);
    const [usedSentenceIds, setUsedSentenceIds] = useState<Set<string>>(new Set());
    const [flipWords, setFlipWords] = useState<number[]>([]);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [itemsPlayedInSession, setItemsPlayedInSession] = useState(0);
    const [gameEndedByExit, setGameEndedByExit] = useState(false); 
    // const [initialSentenceLoaded, setInitialSentenceLoaded] = useState(false); // Non più necessario con la nuova logica di caricamento

    // Tutte le frasi dal DB/CSV
    const [allSentencesFromDB, setAllSentencesFromDB] = useState<Sentence[]>([]);
    // ID delle frasi già risposte dall'utente
    const [answeredSentenceIds, setAnsweredSentenceIds] = useState<Set<string>>(new Set());

    // Conteggi per UI
    // const [totalSentencesInDB, setTotalSentencesInDB] = useState(0); // allSentencesFromDB.length
    const [possibleSentencesForCriteria, setPossibleSentencesForCriteria] = useState(0);
    const [answeredForCriteriaCount, setAnsweredForCriteriaCount] = useState(0);
    const [sentencesAvailableToPlay, setSentencesAvailableToPlay] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const loadDataAndSelectFirstSentence = async () => {
            setLoading(true);
            setError(null);
            setSessionStartTime(Date.now());
            setItemsPlayedInSession(0);
            setGameEndedByExit(false);
            setScore(0);
            setTimeLeft(30);
            setIsGameOver(false);
            setFlipWords([]);
            setSelectedWords([]);
            setShowResult(false);
            
            try {
                // 1. Carica tutte le frasi se non già fatto
                let currentAllSentences = allSentencesFromDB;
                if (currentAllSentences.length === 0) {
                    const corrigeItems = await fetchCorrige(); // Questa è RegCorrige[]
                    currentAllSentences = corrigeItems.map(q => ({ // Trasforma in Sentence[]
                        id: q.id,
                        level: q.nivel,
                        text: q.fraseCompleta,
                        theme: q.tema,
                        isNaturallyCorrect: !q.idsPalabrasErroneas || q.idsPalabrasErroneas.trim() === "",
                        words: q.fraseCompleta.split(' ').map((word, index) => {
                            const isError = !(!q.idsPalabrasErroneas || q.idsPalabrasErroneas.trim() === "") && q.idsPalabrasErroneas.split('|').map(Number).includes(index + 1);
                            const errorIndex = !(!q.idsPalabrasErroneas || q.idsPalabrasErroneas.trim() === "") ? q.idsPalabrasErroneas.split('|').map(Number).indexOf(index + 1) : -1;
                            return {
                                id: index + 1,
                                text: word,
                                isCorrect: !isError,
                                correction: isError && q.correcciones ? q.correcciones.split('|')[errorIndex] : null,
                                explanation: isError && q.explicacion ? q.explicacion.split('|')[errorIndex] : null
                            };
                        })
                    }));
                    setAllSentencesFromDB(currentAllSentences);
                }

                // 2. Recupera ID delle frasi già risposte
                let currentAnsweredIds = answeredSentenceIds;
                if (usuario?.id && process.env.REACT_APP_USE_DATABASE === 'true') {
                     // Controlla se ricaricare gli ID risposti o usare quelli in stato se disponibili e validi
                     // Per semplicità, li ricarichiamo se l'utente cambia o la prop includePreviouslyAnswered cambia
                    const answeredMap = await fetchAnsweredQuestionIdsGroupedByType(usuario.id);
                    currentAnsweredIds = answeredMap['CO'] || new Set<string>(); // 'CO' per Corrige
                    setAnsweredSentenceIds(currentAnsweredIds);
                }
                
                // 3. Filtra per livello
                const sentencesForLevel = currentAllSentences.filter(s => s.level === level);
                setPossibleSentencesForCriteria(sentencesForLevel.length);

                // 4. Calcola quante di queste sono già state risposte
                const answeredInLevel = sentencesForLevel.filter(s => currentAnsweredIds.has(s.id));
                setAnsweredForCriteriaCount(answeredInLevel.length);

                // 5. Determina il pool di frasi
                let poolForSelection: Sentence[];
                if (includePreviouslyAnswered) {
                    poolForSelection = [...sentencesForLevel];
                } else {
                    poolForSelection = sentencesForLevel.filter(s => !currentAnsweredIds.has(s.id));
                }
                setSentencesAvailableToPlay(poolForSelection.length);
                
                setUsedSentenceIds(new Set()); // Resetta le frasi usate per la nuova sessione

                if (poolForSelection.length > 0) {
                    const initialIdx = Math.floor(Math.random() * poolForSelection.length);
                    setSentences(poolForSelection); // Imposta le frasi disponibili per la sessione (da cui pescare)
                    setCurrentSentenceIndex(initialIdx); // Imposta l'indice per la prima frase
                    setUsedSentenceIds(prev => new Set(prev).add(poolForSelection[initialIdx].id)); // Segna la prima come usata
                } else {
                    setSentences([]); // Nessuna frase disponibile
                    setCurrentSentenceIndex(0); // o -1 per indicare nessuna frase
                }

            } catch (e) {
                console.error('Errore nel caricamento dati per CorrigeClaude:', e);
                setError('Errore caricamento frasi.');
            } finally {
                setLoading(false);
            }
        };
        loadDataAndSelectFirstSentence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [level, includePreviouslyAnswered, usuario?.id]); // Ricarica se livello o opzione di inclusione cambiano

    const currentSentence = sentences[currentSentenceIndex]; // Questa ora si basa sulle frasi filtrate per la sessione
    const checkAnswer = useCallback(() => {
        if (!currentSentence || showResult) return; // Non fare nulla se la frase non c'è o il risultato è già mostrato

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
    }, [currentSentence, showResult, score, selectedWords]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeLeft > 0 && !isGameOver && currentSentence && !showResult && !currentSentence.isNaturallyCorrect) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && !isGameOver && !showResult && currentSentence && !currentSentence.isNaturallyCorrect) { // Aggiunto check currentSentence
            checkAnswer(); 
        }
        return () => clearTimeout(timer);
    }, [timeLeft, isGameOver, currentSentence, showResult, checkAnswer]); 

    // New useEffect to handle naturally correct sentences immediately
    useEffect(() => {
        if (currentSentence && currentSentence.isNaturallyCorrect && !showResult) { // Esegui solo se showResult è false
            setShowResult(true);
            // Considera di incrementare itemsPlayedInSession anche per frasi naturalmente corrette
            // se vuoi che contino nel totale delle frasi "viste" o "giocate".
            // Per ora, itemsPlayedInSession viene incrementato in nextSentence.
        }
    }, [currentSentence, showResult]);

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


    const nextSentence = () => {
        if (currentSentence) { // Conta la frase corrente come giocata
            setItemsPlayedInSession(prev => prev + 1);
        }

        const availableSentences = sentences.filter(s => !usedSentenceIds.has(s.id));
        
        if (availableSentences.length > 0) {
            const nextIndexInAvailable = Math.floor(Math.random() * availableSentences.length);
            const nextSentenceId = availableSentences[nextIndexInAvailable].id;
            const newCurrentSentenceIndex = sentences.findIndex(s => s.id === nextSentenceId);

            if (newCurrentSentenceIndex !== -1) {
                 setCurrentSentenceIndex(newCurrentSentenceIndex);
                 setUsedSentenceIds(prev => new Set(prev).add(nextSentenceId));
            } else {
                 // Questo non dovrebbe accadere se availableSentences.length > 0
                 console.error("Logica errore in nextSentence: frase non trovata");
                 setIsGameOver(true); // Termina se c'è un errore imprevisto
                 return;
            }
            setSelectedWords([]);
            setShowResult(false);
            setTimeLeft(30);
            setFlipWords([]);
        } else {
            setIsGameOver(true); 
        }
    };
   /*  const nextSentence = () => {
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
 */
    const saveErrorDetectionSession = () => {
        if (gameEndedByExit) return; // Non salvare se il gioco è già terminato con un salvataggio precedente all'uscita

        if (!usuario || !usuario.id) {
            console.warn("Salvataggio sessione Rilevamento Errori: ID utente non disponibile.");
            return;
        }
        if (itemsPlayedInSession === 0 && !(currentSentence && currentSentence.isNaturallyCorrect && itemsPlayedInSession === 0) ) {
             // Salva anche se itemsPlayedInSession è 0 ma la prima frase era naturalmente corretta
            console.log("Salvataggio sessione Rilevamento Errori: Nessuna frase effettivamente giocata (oltre la prima se naturalmente corretta).");
            return;
        }

        const timeTakenSeconds = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : undefined;
        // Se l'ultima frase era naturalmente corretta e non è stata contata in itemsPlayedInSession tramite nextSentence
        // potremmo volerla contare qui se `checkAnswer` non è stata chiamata per essa.
        // Per ora, itemsPlayedInSession è incrementato solo in nextSentence.
        const finalItemsPlayed = itemsPlayedInSession === 0 && currentSentence?.isNaturallyCorrect ? 1 : itemsPlayedInSession;


        const gameSession: GameSessionResult = {
            userId: usuario.id,
            gameType: 'ErrorDetection',
            timestamp: new Date(), 
            difficulty: level,
            score: score, // Punteggio finale
            itemsPlayed: finalItemsPlayed,
            timeTakenSeconds: timeTakenSeconds,
            gameSpecificDetails: {
                theme: sentences.find(s => usedSentenceIds.has(s.id))?.theme || currentSentence?.theme || "Misto"
            }
        };
        saveGameSessionResult(gameSession);
        console.log("Risultato sessione Rilevamento Errori inviato a Firebase:", gameSession);
    };
    
    const handleGameOver = () => {
        if (!isGameOver) { // Evita doppie chiamate
            saveErrorDetectionSession();
            setIsGameOver(true);
        }
    };

    const handleExitRequest = () => {
        if (!isGameOver && !gameEndedByExit) { // Solo se il gioco non è già terminato per altre ragioni
            setGameEndedByExit(true); // Imposta il flag
            saveErrorDetectionSession(); // Salva lo stato attuale
        }
        if (onExit) {
            onExit();
        }
    };

    // useEffect per chiamare handleGameOver quando `isGameOver` diventa true da altre parti (es. nextSentence)
    useEffect(() => {
        if (isGameOver && !gameEndedByExit) { // Assicurati che non sia già stato gestito da un'uscita
            handleGameOver();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isGameOver, gameEndedByExit]); // Rimosso saveErrorDetectionSession dalle dipendenze per evitare loop


    
    const restartGame = () => {
        // L'useEffect principale [level, includePreviouslyAnswered, usuario?.id] 
        // si occuperà di resettare la maggior parte degli stati e ricaricare i dati.
        // Qui possiamo forzare un cambio di stato che triggera l'useEffect se necessario,
        // o semplicemente resettare gli stati che non sono coperti.
        // Per forzare il re-fetch completo e la riselezione, potremmo resettare allSentencesFromDB se volessimo
        // ma è meglio affidarsi al cambio delle props o a un pulsante esplicito "cambia livello"
        setLoading(true); // Mostra caricamento mentre l'useEffect fa il suo lavoro
        // Cambiare una dipendenza dell'useEffect principale forzerà il suo rieseguimento.
        // Ad esempio, potremmo avere uno stato `gameIteration` da incrementare.
        // Per ora, l'useEffect si basa su level, includePreviouslyAnswered, usuario?.id.
        // Se questi non cambiano, il reset completo non avviene.
        // Per un vero "restart" che ricarica tutto come se fosse la prima volta:
        setAllSentencesFromDB([]); // Forza il ricaricamento delle frasi da DB
        setAnsweredSentenceIds(new Set()); // Forza il ricaricamento delle risposte
        // L'useEffect [level, includePreviouslyAnswered, usuario?.id] verrà rieseguito.
    };


    if (loading) {
        return <Container maxWidth="sm"><Box textAlign="center" mt={4}><Typography>Caricamento frasi...</Typography></Box></Container>;
    }
    if (error) {
        return <Container maxWidth="sm"><Box textAlign="center" mt={4}><Typography color="error">{error}</Typography></Box></Container>;
    }
    
    if (isGameOver) { 
        return (
            <Container maxWidth="sm">
                <Box textAlign="center" mt={4}>
                    <Typography variant="h4" gutterBottom>Gioco terminato!</Typography>
                    <Typography variant="h6" gutterBottom>Punteggio finale: {score}</Typography>
                    <Typography variant="body2" gutterBottom>Frasi giocate in questa sessione: {itemsPlayedInSession}</Typography>
                    <Button variant="contained" color="primary" onClick={restartGame} sx={{ mr: 1, mt:1 }}>
                        Gioca di nuovo (Stesso Livello)
                    </Button>
                    {onExit && ( // handleExitRequest si occuperà del salvataggio se necessario
                        <Button variant="contained" color="secondary" onClick={handleExitRequest} sx={{mt:1}}>
                            Torna al Menu Principale
                        </Button>
                    )}
                </Box>
            </Container>
        );
    }

    // Se non ci sono frasi disponibili DOPO il caricamento e i filtri
    if (!currentSentence && !loading) {
         return (
            <Container maxWidth="md">
                <Box my={4} textAlign="center">
                    <Typography variant="h5" gutterBottom>Gioco di Rilevamento Errori</Typography>
                    <Typography variant="h6" gutterBottom>Livello: {level}</Typography>
                     <Box sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 2 }}>
                        <Typography variant="body2">Frasi totali per livello {level}: {possibleSentencesForCriteria}</Typography>
                        <Typography variant="body2">Già risposte: {answeredForCriteriaCount}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Disponibili per giocare ora: {sentencesAvailableToPlay}</Typography>
                    </Box>
                    <Typography color="error" gutterBottom>
                        {possibleSentencesForCriteria > 0 && sentencesAvailableToPlay === 0 && !includePreviouslyAnswered
                            ? "Hai corretto tutte le frasi disponibili per questo livello!"
                            : "Nessuna frase trovata per i criteri selezionati."
                        }
                    </Typography>
                    <Typography>
                        Prova a cambiare livello o includi le frasi già corrette tramite le opzioni nel menu principale.
                    </Typography>
                    {onExit && (
                        <Button variant="contained" color="primary" onClick={handleExitRequest} style={{ marginTop: '20px' }}>
                            Torna al Menu Principale
                        </Button>
                    )}
                </Box>
            </Container>
        );
    }
    
    // Se currentSentence è ancora undefined ma non stiamo più caricando (dovrebbe essere coperto sopra)
    if (!currentSentence) {
        return <Typography>Errore imprevisto: nessuna frase corrente.</Typography>;
    }


    const isAnswerCorrect = currentSentence.words.every(word =>
        (word.isCorrect && !selectedWords.includes(word.id)) ||
        (!word.isCorrect && selectedWords.includes(word.id))
    );

    const isCurrentSentenceNaturallyCorrect = currentSentence.isNaturallyCorrect === true;

    return (
        <Container maxWidth="md">
            <Box my={4}>
                <Typography variant="h4" gutterBottom>Gioco di Rilevamento Errori</Typography>
                 <Box sx={{ textAlign: 'center', fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>
                    <Typography variant="caption" display="block">
                        Livello: {level} | Tema: {currentSentence?.theme} | ID Frase: {currentSentence?.id}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Frasi possibili ({level}): {possibleSentencesForCriteria} | Già risposte: {answeredForCriteriaCount} | Disponibili: {sentencesAvailableToPlay}
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography>Punteggio: {score}</Typography>
                    <Typography>Tempo: {timeLeft}s</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(timeLeft / 30) * 100} />
                <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                    <Box mb={2}>
                        {currentSentence.words.map(word => (
                            <Chip
                                key={word.id}
                                label={flipWords.includes(word.id) && !isCurrentSentenceNaturallyCorrect ? word.correction : word.text}
                                onClick={() => !showResult && !isCurrentSentenceNaturallyCorrect && handleWordClick(word.id)}
                                clickable={!isCurrentSentenceNaturallyCorrect && !showResult}
                                color={selectedWords.includes(word.id) && !isCurrentSentenceNaturallyCorrect ? "primary" : "default"}
                                style={{
                                    margin: '4px',
                                    backgroundColor: showResult && !isCurrentSentenceNaturallyCorrect
                                        ? word.isCorrect
                                            ? selectedWords.includes(word.id)
                                                ? '#ff6b6b' 
                                                : undefined
                                            : selectedWords.includes(word.id)
                                                ? '#66bb6a' 
                                                : '#ffcccb' 
                                        : undefined,                                    
                                    animation: flipWords.includes(word.id) && !isCurrentSentenceNaturallyCorrect ? `${flipAnimation} 2s infinite` : 'none'
                                }}
                            />
                        ))}
                    </Box>
                </Paper>
                {isCurrentSentenceNaturallyCorrect && !showResult && (
                    <Alert severity="info" style={{ marginTop: '20px' }}>Questa frase è già corretta! Premi "Prossima frase" per continuare.</Alert>
                )}
                {!showResult && !isCurrentSentenceNaturallyCorrect && (
                    <Button variant="contained" color="primary" onClick={checkAnswer} style={{ marginTop: '20px' }}>
                        Verifica risposta
                    </Button>
                )}
                 {(showResult || isCurrentSentenceNaturallyCorrect) && ( // Mostra sempre i pulsanti dopo che il risultato è mostrato o se la frase è naturalmente corretta
                    <Box mt={2}>
                        {!isCurrentSentenceNaturallyCorrect && showResult && ( // Mostra solo se non naturalmente corretta E il risultato è mostrato
                            <Alert severity={isAnswerCorrect ? "success" : "error"}>
                                <AlertTitle>
                                    {isAnswerCorrect
                                        ? "Ottimo lavoro! Hai identificato correttamente tutti gli errori."
                                        : "Attenzione! Non hai identificato correttamente tutti gli errori."}
                                </AlertTitle>
                            </Alert>
                        )}
                        {!isCurrentSentenceNaturallyCorrect && showResult && currentSentence.words.filter(word => !word.isCorrect).map(word => (
                            <Alert key={word.id} severity={selectedWords.includes(word.id) ? "success":"error" } style={{ marginTop: '10px' }}>
                                <AlertTitle>Spiegazione per "{word.text}"</AlertTitle>
                                {word.explanation}
                            </Alert>
                        ))}
                        <Button variant="contained" color="primary" onClick={nextSentence} style={{ marginTop: '20px', marginRight: '10px' }}>
                            Prossima frase
                        </Button>
                        {onExit && ( // Modificato per usare handleExitRequest
                            <Button variant="contained" color="secondary" onClick={handleExitRequest} style={{ marginTop: '20px' }}>
                                Torna al Menu Principale
                            </Button>
                        )}
                    </Box>
                )}
                 {!showResult && onExit && ( 
                    <Button variant="outlined" color="secondary" onClick={handleExitRequest} style={{ marginTop: '20px', display: 'block' }}>
                        Esci dal Gioco
                    </Button>
                )}
            </Box>
        </Container>
    );
};

export default ItalianErrorDetectionGame;