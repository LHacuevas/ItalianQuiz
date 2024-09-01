import React, { useState, useEffect, useCallback } from 'react';
import { Select, MenuItem, Card, CardContent, Typography, Alert, Chip, SelectChangeEvent, Box, Button } from '@mui/material';
import { QuizParams, RegImpiccato} from './MyTypes';
import { fetchImpiccato, fetchRespuestas, guardarRespuesta } from './firebase/firebaseFunctions';
import GlobalKeyCaptureTextField from './components/global-key-capture-text-field';
import { Respuesta } from './firebase/firebaseInterfaces';
//import { impiccatoCSV } from './question.Impiccato';
type Difficulty = 'facile' | 'medio' | 'difficile';

const Imppicato: React.FC<QuizParams> = ({
    usuario = null
}) => {
    const [words, setWords] = useState<RegImpiccato[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentWord, setCurrentWord] = useState<RegImpiccato | null>(null);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [remainingAttempts, setRemainingAttempts] = useState<number>(0);
    //const [input, setInput] = useState<string>('');
    const [difficulty, setDifficulty] = useState<Difficulty>('medio');
    const [level, setLevel] = useState<RegImpiccato['level']>('A2');
    const [message, setMessage] = useState<string>('');
    const [timer, setTimer] = useState<number>(30);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [showTip, setShowTip] = useState<boolean>(false);
    //const [consecutiveFailures, setConsecutiveFailures] = useState<number>(0);
    const [category, setCategory] = useState<string>('Tutte');
    const [showCategory, setShowCategory] = useState<boolean>(false);
    const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
    useEffect(() => {
        const loadRespuestas = async () => {
            try {
                const respuestasData = await fetchRespuestas(usuario?.id ?? 'sense');
                setRespuestas(respuestasData);
            } catch (error) {
                console.error('Errore nel recupero delle parole:', error);
            }
        };
        loadRespuestas();
    }, [usuario]);

    useEffect(() => {
        const loadWords = async () => {
            
            try {
                setLoading(true);
                const fetchedWords = await fetchImpiccato();
                setWords(fetchedWords);
                setError(null);
            } catch (err) {                
                setError('Words desde file');
                console.error('Error fetching words:', err);
            } finally {
                setLoading(false);
            }
        };

        loadWords();
    }, []);
    //cambio al pasar a FireStone lectura asyncrona
    const selectNewWord = useCallback(() => {
        const filteredWords = words.filter(word => {
            const levelMatch = word.level === level;
            const categoryMatch = category === 'Tutte' || word.category === category;
            //console.log('Palabra:', word.word, 'Nivel:', word.level, 'Categoría:', word.category, 'Match:', levelMatch && categoryMatch); // Depuración
            return levelMatch && categoryMatch;
        });
        if (filteredWords.length === 0) {
            setError('Non ci sono parole disponibili per la combinazione di livello e categoria selezionata.');
            return;
        };
        let availableWords;
        if (respuestas.length > 0) {
            // Filtra i paragrafi non ancora risposti
            const respuestasWords = respuestas.map(r => r.idPregunta);
            availableWords = filteredWords.filter(p => !respuestasWords.includes(p.word));
            if (availableWords.length === 0) {
                setError('Non ci sono parole disponibili per la combinazione di livello e categoria selezionata. Non utilizati');
                return;
            };
        } else availableWords=[...filteredWords];
        if (availableWords.length === 0) {
            setError('Non ci sono parole disponibili per la combinazione di livello e categoria selezionata.');
            return;
        };
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        //console.log('Palabra seleccionada:', randomWord.word);
        //Lo paso a minusculas por si aca
        setCurrentWord({
            ...randomWord,
            word: randomWord.word.toLowerCase()
        });
        setRemainingAttempts(6);
        setMessage(`Ci sono ${availableWords.length} di questo tipo ancora `);
        setTimer(30);
        setGameOver(false);
        setShowTip(false);
        setShowCategory(false);        
        setGuessedLetters([]);
        let initialLetters: string[] = [];
        if (difficulty !== 'difficile') {
            const initialLettersCount = {
                facile: Math.floor(randomWord.word.length / 3),
                medio: Math.floor(randomWord.word.length / 4),
            }[difficulty];

            const uniqueLetters = [...new Set(randomWord.word.split(''))];
            const shuffled = uniqueLetters.sort(() => 0.5 - Math.random());
            initialLetters = shuffled.slice(0, initialLettersCount);
        }

        const allInitialLetters = randomWord.word.split('').filter(letter => initialLetters.includes(letter));
        setGuessedLetters(allInitialLetters);
    }, [words, level, category, difficulty, respuestas]);

    useEffect(() => {
        if (!loading && words.length > 0) {
            selectNewWord();
        }
    }, [loading, words, difficulty, level, category, selectNewWord]);

    const handleTimeUp =  useCallback((): void => {
        if (currentWord) {
            setMessage(`Tempo scaduto! La parola era "${currentWord.word}".`);
            endGame('Tempo scaduto');
        }
    }, [currentWord]);

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
            const isCorrect = 'Parola indovinata' === reason;  //currentWord.word === guessedLetters.join('');
            console.log(`Parola originale: ${currentWord.word} Indovinata: ${isCorrect ? 'Sì' : 'No'}
        Livello: ${currentWord.level} Difficoltà: ${difficulty} Motivo fine gioco: ${reason}`);
            const respuesta: Respuesta = {
                idUsuario: usuario?.id ?? 'sense',
                tipoPregunta: 'AH',
                idPregunta: currentWord.word,
                idSubPregunta: "0",
                respuesta: reason,
                correcta: isCorrect
            };
            guardarRespuesta(respuesta)
            respuestas.push(respuesta);
        }
    }

    const endGame = (reason: string): void => {
        setGameOver(true);
        logGameResult(reason);
        setTimeout(selectNewWord, 2000);
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
            setRemainingAttempts(prev => {
                const penaltyAmount = isVowel(letter) ? 3 : 1;
                const newAttempts = prev - penaltyAmount;
                if (newAttempts <= 0) {
                    setMessage(`Gioco finito. La parola era "${currentWord.word}".`);
                    endGame('Tentativi esauriti');
                }
                return newAttempts;
            });
            
            setMessage('Lettera non presente nella parola.');
        } else {            
            setMessage('Lettera corretta!');
        }
        checkGameStatus(newGuessedLetters);
    };

    const handleInputChange = (letter: string): void => {
        //const letter = e.target.value.toLowerCase();
        if (letter && !gameOver) {
            handleGuess(letter);            
        }
    };

    const checkGameStatus = (guessedLetters: string[]): void => {
        if (currentWord && currentWord.word === displayWord(guessedLetters).replace(/\s+/g, '')) {
            setMessage('Congratulazioni! Hai indovinato la parola.');
            endGame('Parola indovinata');
            // setTimeout(() => {
            //     selectNewWord();
            // }, 1500);
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
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    marginBottom: 2
                }}>
                    <Select
                        value={difficulty}
                        onChange={(e: SelectChangeEvent<Difficulty>) => setDifficulty(e.target.value as Difficulty)}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="facile">Facile</MenuItem>
                        <MenuItem value="medio">Medio</MenuItem>
                        <MenuItem value="difficile">Difficile</MenuItem>
                    </Select>
                    <Select
                        value={level}
                        onChange={(e: SelectChangeEvent<RegImpiccato['level']>) => setLevel(e.target.value as RegImpiccato['level'])}
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="A2">A2</MenuItem>
                        <MenuItem value="B1">B1</MenuItem>
                        <MenuItem value="B2">B2</MenuItem>
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
                        {Array.from(new Set(words.filter(w => w.level === level).map(w => w.category))).map((cat) => (
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

                        {message && (
                            <Alert severity={message.includes('Congratulazioni') ? 'success' : 'info'} sx={{ marginTop: 2 }}>
                                {message}
                            </Alert>
                        )}
                    </div>
                )}
                {currentWord && (
                    <div><Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700">
                        Fine del giocco
                    </Button></div>
                )}
            </CardContent>
        </Card>
    );
};

export default Imppicato;