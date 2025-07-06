import React, { useState, useEffect, useCallback } from 'react';
import { Select, MenuItem, Card, CardContent, Typography, Alert, Chip, SelectChangeEvent, Box, Button } from '@mui/material';
import { QuizParams, RegImpiccato} from './MyTypes';
import { fetchImpiccato, guardarRespuesta, fetchAnsweredQuestionIdsGroupedByType } from './firebase/firebaseFunctions'; // fetchRespuestas rimosso
import GlobalKeyCaptureTextField from './components/global-key-capture-text-field';
import { Respuesta } from './firebase/firebaseInterfaces'; // Non più usata per caricare tutte le risposte qui
//import { impiccatoCSV } from './question.Impiccato';

type DifficultyInternal = 'facile' | 'medio' | 'difficile'; // Rinomina per evitare collisioni se Difficulty è globale
type WordLevel = 'A2' | 'B1' | 'B2'; // Tipo per il livello delle parole

const Imppicato: React.FC<QuizParams> = ({
    usuario = null,
    onExit,
    difficulty: initialDifficulty = 'B1', // Default a B1 se non fornito, o usa quello da AppIniziale
    saveResults = true,
    includePreviouslyAnswered = false
}) => {
    const [allWordsFromDB, setAllWordsFromDB] = useState<RegImpiccato[]>([]); // Tutte le parole caricate
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentWord, setCurrentWord] = useState<RegImpiccato | null>(null);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [remainingAttempts, setRemainingAttempts] = useState<number>(0);

    const [gameDifficulty, setGameDifficulty] = useState<DifficultyInternal>('medio'); // Stato per la difficoltà del gioco attuale
    const [wordLevel, setWordLevel] = useState<WordLevel>(initialDifficulty as WordLevel); // Livello delle parole (A2,B1,B2) basato sulla prop difficulty

    const [message, setMessage] = useState<string>('');
    const [gameOverMessage, setGameOverMessage] = useState<string | null>(null); // Messaggio specifico per fine gioco
    const [timer, setTimer] = useState<number>(30);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [showTip, setShowTip] = useState<boolean>(false);
    const [category, setCategory] = useState<string>('Tutte');
    const [showCategory, setShowCategory] = useState<boolean>(false);
    // const [respuestas, setRespuestas] = useState<Respuesta[]>([]); // Sostituito da answeredWordIds

    // Stati per i conteggi
    const [totalWordsInDB, setTotalWordsInDB] = useState(0);
    const [possibleWordsForCriteria, setPossibleWordsForCriteria] = useState(0);
    const [answeredWordsForCriteriaCount, setAnsweredWordsForCriteriaCount] = useState(0);
    const [wordsAvailableToPlay, setWordsAvailableToPlay] = useState(0);
    const [answeredWordIds, setAnsweredWordIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Carica tutte le parole se non già fatto
                if (allWordsFromDB.length === 0) {
                    const fetchedWords = await fetchImpiccato();
                    setAllWordsFromDB(fetchedWords);
                    setTotalWordsInDB(fetchedWords.length);
                }

                // Carica ID delle parole già risposte
                if (usuario?.id && process.env.REACT_APP_USE_DATABASE === 'true') {
                    console.log(`[Impiccato] Loading answered IDs for user: ${usuario.id}, USE_DATABASE: ${process.env.REACT_APP_USE_DATABASE}`);
                    const answeredMap = await fetchAnsweredQuestionIdsGroupedByType(usuario.id);
                    console.log("[Impiccato] Answered Map from DB:", answeredMap);
                    const hangmanAnsweredIds = answeredMap['AH'] || new Set<string>();
                    setAnsweredWordIds(hangmanAnsweredIds); 
                    console.log("[Impiccato] Set answeredWordIds for 'AH':", hangmanAnsweredIds);
                } else {
                    console.log(`[Impiccato] Skipping fetch of answered IDs. User ID: ${usuario?.id}, USE_DATABASE: ${process.env.REACT_APP_USE_DATABASE}`);
                }
            } catch (err) {
                setError('Errore nel caricamento dati iniziali. Riprova.');
                console.error('Error fetching initial data for Hangman:', err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [usuario?.id, allWordsFromDB.length]); // Dipende da utente e se allWordsFromDB è già popolato

    const selectNewWord = useCallback(() => {
        if (allWordsFromDB.length === 0) {
            setError('Nessuna parola caricata dalla base dati.');
            return;
        }

        // 1. Filtra per livello (wordLevel) e categoria
        const wordsMatchingCriteria = allWordsFromDB.filter(word => {
            const levelMatch = word.level === wordLevel;
            const categoryMatch = category === 'Tutte' || word.category === category;
            return levelMatch && categoryMatch;
        });
        setPossibleWordsForCriteria(wordsMatchingCriteria.length);
        // console.log('[Impiccato] Words matching criteria (level, category):', wordsMatchingCriteria.length, wordsMatchingCriteria.map(w => w.word));

        // 2. Calcola quante di queste sono già state risposte
        const answeredInCriteria = wordsMatchingCriteria.filter(p => answeredWordIds.has(p.word.toLowerCase()));
        setAnsweredWordsForCriteriaCount(answeredInCriteria.length);
        // console.log('[Impiccato] Answered words in criteria:', answeredInCriteria.length, answeredInCriteria.map(w => w.word));
        // console.log('[Impiccato] All answeredWordIds:', Array.from(answeredWordIds));

        // 3. Determina il pool di parole da cui scegliere
        let poolForWordSelection: RegImpiccato[];
        if (includePreviouslyAnswered) {
            poolForWordSelection = [...wordsMatchingCriteria];
            // console.log('[Impiccato] Including previously answered. Pool size:', poolForWordSelection.length);
        } else {
            poolForWordSelection = wordsMatchingCriteria.filter(p => !answeredWordIds.has(p.word.toLowerCase()));
            // console.log('[Impiccato] EXCLUDING previously answered. Pool size:', poolForWordSelection.length);
        }
        setWordsAvailableToPlay(poolForWordSelection.length);
        // console.log('[Impiccato] Final pool for selection:', poolForWordSelection.map(w => w.word));

        if (poolForWordSelection.length === 0) {
            setError('Nessuna parola disponibile per i criteri selezionati. Prova a cambiare livello, categoria o includi parole già giocate.');
            setCurrentWord(null); // Assicura che non ci sia una parola corrente
            return;
        }
        setError(null); // Pulisce errori precedenti se ora ci sono parole
        setGameOverMessage(null); // Pulisce il messaggio di fine gioco precedente

        const randomWord = poolForWordSelection[Math.floor(Math.random() * poolForWordSelection.length)];
        setCurrentWord({ ...randomWord, word: randomWord.word.toLowerCase() });
        setRemainingAttempts(6);
        setMessage(`Parole disponibili per questi filtri: ${poolForWordSelection.length}`);
        setTimer(30);
        setGameOver(false);
        setShowTip(false);
        setShowCategory(false);
        setGuessedLetters([]);

        let initialLetters: string[] = [];
        if (gameDifficulty !== 'difficile') {
            const initialCountFactor = gameDifficulty === 'facile' ? 3 : 4;
            const initialLettersCount = Math.floor(randomWord.word.length / initialCountFactor);
            const uniqueLetters = [...new Set(randomWord.word.split(''))];
            initialLetters = uniqueLetters.sort(() => 0.5 - Math.random()).slice(0, initialLettersCount);
        }
        setGuessedLetters(randomWord.word.split('').filter(letter => initialLetters.includes(letter)));

    }, [allWordsFromDB, wordLevel, category, includePreviouslyAnswered, answeredWordIds, gameDifficulty]);

    // Effetto per selezionare una nuova parola quando cambiano i filtri o allWordsFromDB/answeredWordIds
    useEffect(() => {
        // NON selezionare una nuova parola se il gioco è appena terminato e stiamo mostrando il messaggio finale.
        // L'utente userà il pulsante "Prossima Parola".
        // Questo useEffect serve principalmente per il caricamento iniziale e per quando i filtri (livello, categoria, etc.) cambiano
        // o quando si includono/escludono parole già giocate.
        if (!gameOver && !loading && allWordsFromDB.length > 0) { 
            selectNewWord();
        }
    }, [loading, allWordsFromDB, selectNewWord, gameOver]); // Aggiunto gameOver. Le altre dipendenze di selectNewWord (wordLevel, category, etc.)
                                                            // sono già coperte dal fatto che selectNewWord stessa cambia e triggera questo effetto.

    const handleTimeUp = useCallback((): void => {
        if (currentWord && !gameOver) { // Aggiunto !gameOver per evitare doppie chiamate se endGame è già stato triggerato
            // Non impostare più setMessage qui, sarà gestito da endGame
            endGame('Tempo scaduto');
        }
    }, [currentWord, gameOver]); // Aggiunto gameOver alle dipendenze

    useEffect(() => {
        if (currentWord && !gameOver) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 1) {
                        clearInterval(interval);
                        handleTimeUp();
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [currentWord, gameOver, handleTimeUp]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
    const logGameResult = (reason: string): void => {
        if (currentWord) {
            const isCorrect = 'Parola indovinata' === reason;
            console.log(`Parola originale: ${currentWord.word} Indovinata: ${isCorrect ? 'Sì' : 'No'} Livello: ${currentWord.level} Difficoltà interna: ${gameDifficulty} Motivo fine gioco: ${reason}`);

            if (saveResults && usuario?.id) { // Condiziona il salvataggio
                const respuesta: Respuesta = {
                    idUsuario: usuario.id,
                    tipoPregunta: 'AH', // Ahorcado (Impiccato)
                    idPregunta: currentWord.word, // La parola stessa è l'ID
                    idSubPregunta: "0", // Non applicabile o standard a 0
                    respuesta: reason, // Es. 'Parola indovinata', 'Tentativi esauriti', 'Tempo scaduto'
                    correcta: isCorrect
                };
                guardarRespuesta(respuesta);
                // Aggiorna localmente il set di ID risposti per riflettere immediatamente la parola giocata
                // senza dover fare un altro fetch, se l'utente continua a giocare nella stessa sessione.
                setAnsweredWordIds(prev => new Set(prev).add(currentWord.word.toLowerCase()));
            } else {
                console.log("Salvataggio risposta saltato per scelta dell'utente o utente non loggato.");
            }
        }
    }

    const endGame = (reason: string): void => {
        if (gameOver) return; // Evita di eseguire endGame più volte se già terminato

        setGameOver(true);
        logGameResult(reason);

        if (currentWord) {
            if (reason === 'Parola indovinata') {
                setGameOverMessage(`Congratulazioni! Hai indovinato: "${currentWord.word}".`);
            } else if (reason === 'Tempo scaduto') {
                setGameOverMessage(`Tempo scaduto! La parola era: "${currentWord.word}".`);
            } else if (reason === 'Tentativi esauriti') {
                setGameOverMessage(`Tentativi esauriti! La parola era: "${currentWord.word}".`);
            } else {
                setGameOverMessage(`Gioco terminato. La parola era: "${currentWord.word}".`);
            }
        }
        // Rimosso setTimeout(selectNewWord, 2000);
    }

    // Función para verificar si una letra es vocal
    const isVowel = (letter: string): boolean => {
        return ['a', 'e', 'i', 'o', 'u'].includes(letter.toLowerCase());
    };

    const handleGuess = (letter: string): void => {
        if (guessedLetters.includes(letter) || !currentWord) {
            setMessage('Hai già provato questa lettera.');
            return;
        }

        const newGuessedLetters = [...guessedLetters, letter];
        setGuessedLetters(newGuessedLetters);

        if (!currentWord.word.includes(letter)) {
            setMessage('Lettera non presente nella parola.'); // Messaggio immediato
            setRemainingAttempts(prev => {
                const penaltyAmount = isVowel(letter) ? 3 : 1;
                const newAttempts = prev - penaltyAmount;
                if (newAttempts <= 0) {
                    // Non impostare più setMessage qui per la parola finale, sarà gestito da endGame
                    endGame('Tentativi esauriti');
                    return 0; // Assicura che non vada sotto zero e triggeri l'effetto
                }
                return newAttempts;
            });
        } else {
            setMessage('Lettera corretta!');
        }
        // checkGameStatus è chiamato solo se il gioco non è già finito per tentativi
        if (remainingAttempts > (isVowel(letter) && !currentWord.word.includes(letter) ? 3 : 1) || currentWord.word.includes(letter)) {
            checkGameStatus(newGuessedLetters);
        }
    };

    const handleInputChange = (letter: string): void => {
        //const letter = e.target.value.toLowerCase();
        if (letter && !gameOver) {
            handleGuess(letter);            
        }
    };

    const checkGameStatus = (guessedLetters: string[]): void => {
        if (currentWord && !gameOver && currentWord.word === displayWord(guessedLetters).replace(/\s+/g, '')) {
            // Non impostare più setMessage qui, sarà gestito da endGame
            endGame('Parola indovinata');
        }
    };

   
    const displayWord = (guessedLetters: string[]): string => {
        return currentWord ? currentWord.word.split('').map(letter =>
            guessedLetters.includes(letter) ? letter : '_'
        ).join(' ') : '';
    };

    return (
        <Card sx={{ maxWidth: 400, margin: 'auto', marginTop: 4 }}>
            <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                    Gioco dell'Impiccato
                </Typography>
                <Box sx={{ textAlign: 'center', fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>
                    <Typography variant="caption" display="block">
                        Livello Parole: {wordLevel} | Categoria: {category}
                    </Typography>
                    <Typography variant="caption" display="block">
                        Parole possibili: {possibleWordsForCriteria} | Già risposte: {answeredWordsForCriteriaCount} | Disponibili: {wordsAvailableToPlay}
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    marginBottom: 2
                }}>
                    <Select
                        value={gameDifficulty} // Usa lo stato interno per la difficoltà del gioco
                        onChange={(e: SelectChangeEvent<DifficultyInternal>) => setGameDifficulty(e.target.value as DifficultyInternal)}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="facile">Facile (Gioco)</MenuItem>
                        <MenuItem value="medio">Medio (Gioco)</MenuItem>
                        <MenuItem value="difficile">Difficile (Gioco)</MenuItem>
                    </Select>
                    <Select
                        value={wordLevel} // Usa lo stato per il livello delle parole
                        onChange={(e: SelectChangeEvent<WordLevel>) => setWordLevel(e.target.value as WordLevel)}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="A2">Parole A2</MenuItem>
                        <MenuItem value="B1">Parole B1</MenuItem>
                        <MenuItem value="B2">Parole B2</MenuItem>
                    </Select>
                    <Typography
                        variant="h6"
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            minWidth: '80px',
                            textAlign: 'center'
                        }}
                    >
                        {timer}
                    </Typography>
                </Box><div style={{ marginBottom: 16 }}>
                    <Select
                        value={category}
                        onChange={(e: SelectChangeEvent<string>) => setCategory(e.target.value)}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    >
                        <MenuItem value="Tutte">Tutte le categorie</MenuItem>
                        {Array.from(new Set(allWordsFromDB.filter(w => w.level === wordLevel).map(w => w.category))).map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </Select>

                </div>

                {currentWord && (
                    <div>
                        <Typography variant="body1" gutterBottom>{currentWord.question}</Typography>
                        <Typography variant="h4" gutterBottom>{displayWord(guessedLetters)}</Typography>
                        <Typography variant="body2" gutterBottom>Tentativi rimasti: {remainingAttempts}</Typography>
                        {showCategory && <Typography variant="body2" gutterBottom>Categoria: {currentWord.category}</Typography>}
                        {showTip && <Typography variant="body2" gutterBottom>Suggerimento: {currentWord.tip}</Typography>}
                        <GlobalKeyCaptureTextField
                            label="Inserisci una lettera"
                            onInputChange={handleInputChange}
                            disabled={gameOver}
                        />

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                            {guessedLetters.map((letter, index) => (
                                <Chip
                                    key={index}
                                    label={letter}
                                    color={currentWord.word.includes(letter) ? "primary" : "default"}
                                />
                            ))}
                        </div>

                        {/* Messaggio di gioco normale */}
                        {message && !gameOver && (
                            <Alert severity={message.includes('Lettera corretta') ? 'success' : 'info'} sx={{ marginTop: 2 }}>
                                {message}
                            </Alert>
                        )}

                        {/* Messaggio di fine gioco e pulsante Prossima Parola */}
                        {gameOver && gameOverMessage && (
                            <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                                <Alert 
                                    severity={gameOverMessage.includes('Congratulazioni') ? 'success' : 
                                              gameOverMessage.includes('Tempo scaduto') || gameOverMessage.includes('Tentativi esauriti') ? 'error' : 'info'}
                                >
                                    {gameOverMessage}
                                </Alert>
                                <Button 
                                    onClick={selectNewWord} 
                                    variant="contained" 
                                    color="primary" 
                                    sx={{ marginTop: 2 }}
                                >
                                    Prossima Parola
                                </Button>
                            </Box>
                        )}
                    </div>
                )}
                {/* Pulsante Esci/Torna al Menu */}
                <Box sx={{ marginTop: '16px' }}>
                    {onExit ? (
                        <Button onClick={onExit} variant="contained" color="secondary" fullWidth>
                            Torna al Menu Principale
                        </Button>
                    ) : (
                        <Button onClick={() => window.location.reload()} variant="contained" color="error" fullWidth>
                            Esci (Ricarica)
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default Imppicato;