/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
//import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
//import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle'; // Cambié AlertDescription a AlertTitle
import LinearProgress from '@mui/material/LinearProgress';
import { Clock } from 'lucide-react';
//import Select, { SelectChangeEvent } from '@mui/material/Select';
//import MenuItem from '@mui/material/MenuItem'; // Cambié SelectContent, SelectItem, SelectTrigger y SelectValue
//import FormControl from '@mui/material/FormControl';
//import InputLabel from '@mui/material/InputLabel';
import { CardActions } from '@mui/material';
//import { questionsCSV } from './questionGPT4o.js'
import { Question, QuizParams } from './MyTypes.js'
import QuizQuestion from './components/Question'
//import FormControlLabel from '@mui/material/FormControlLabel';
//import Checkbox from '@mui/material/Checkbox';
import { Respuesta, GameSessionResult } from './firebase/firebaseInterfaces'; // Aggiunto GameSessionResult
import { guardarRespuesta, fetchRespuestas, fetchMultiRespuesta, saveGameSessionResult } from './firebase/firebaseFunctions'; // Aggiunto saveGameSessionResult
//import logo from './logo.jpg'; // Ajusta la ruta según la ubicación de tu imagen
import { fetchAnsweredQuestionIdsGroupedByType } from './firebase/firebaseFunctions'; // Importa la nuova funzione

let allQuestionsFromFile: Question[] = []; // Rinomina per chiarezza, queste sono tutte le domande dal file/DB grezzo


const QuizItaliano: React.FC<QuizParams> = ({
    numQuestions = 3,
    name = 'anonymous',
    onlyOptionQuestions = false,
    difficulty = 'B1',
    usuario = null,
    onExit,
    saveResults = true,
    includePreviouslyAnswered = false
}) => {        
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
    const [quizFinished, setQuizFinished] = useState(false);   
    const [timer, setTimer] = useState(30);
    const [questionsForSession, setQuestionsForSession] = useState<Question[]>([]); // Domande per la sessione corrente
    const [userAnswers, setUserAnswers] = useState<(string | number | null)[]>([]);
    const [reviewMode, setReviewMode] = useState(false);
    const [startTime, setStartTime] = useState<number | undefined>(undefined);
    const [endTime, setEndTime] = useState<number | undefined>(undefined);     
    // const [respuestas, setRespuestas] = useState<Respuesta[]>([]); // Non più necessario, useremo answeredQuestionIdsByType

    const [loading, setLoading] = useState(true); // Unico stato di loading
    const [error, setError] = useState<string | null>(null);

    // Conteggi per l'UI
    const [totalQuestionsInFile, setTotalQuestionsInFile] = useState(0);
    const [possibleQuestionsForCriteria, setPossibleQuestionsForCriteria] = useState(0);
    const [answeredQuestionsForCriteriaCount, setAnsweredQuestionsForCriteriaCount] = useState(0);
    const [questionsAvailableToPlay, setQuestionsAvailableToPlay] = useState(0);


    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Carica tutte le domande dal file/DB
                if (allQuestionsFromFile.length === 0) { // Carica solo se non già presenti
                    const fetchedQuestions = await fetchMultiRespuesta();
                    allQuestionsFromFile = fetchedQuestions;
                    setTotalQuestionsInFile(fetchedQuestions.length);
                }

                // 2. Recupera ID delle domande già risposte dall'utente
                let answeredIdsSet = new Set<string>();
                if (usuario?.id && process.env.REACT_APP_USE_DATABASE === 'true') {
                    const answeredMap = await fetchAnsweredQuestionIdsGroupedByType(usuario.id);
                    answeredIdsSet = answeredMap['MC'] || new Set<string>(); // 'MC' per Multiple Choice
                }

                // 3. Filtra le domande per difficoltà e tipo (onlyOptionQuestions)
                const questionsMatchingCriteria = allQuestionsFromFile.filter(q => {
                    const difficultyMatch = q.difficulty === difficulty;
                    const typeMatch = !onlyOptionQuestions || Number(q.correct) !== -1;
                    return difficultyMatch && typeMatch;
                });
                setPossibleQuestionsForCriteria(questionsMatchingCriteria.length);

                // 4. Calcola quante di queste sono già state risposte
                const answeredAmongCriteria = questionsMatchingCriteria.filter(q => answeredIdsSet.has(q.id.toString()));
                setAnsweredQuestionsForCriteriaCount(answeredAmongCriteria.length);

                // 5. Determina il pool di domande da cui scegliere per la sessione
                let poolForSession: Question[];
                if (includePreviouslyAnswered) {
                    poolForSession = [...questionsMatchingCriteria];
                } else {
                    poolForSession = questionsMatchingCriteria.filter(q => !answeredIdsSet.has(q.id.toString()));
                }
                setQuestionsAvailableToPlay(poolForSession.length);

                // 6. Seleziona le domande per la sessione corrente
                const shuffledPool = poolForSession.sort(() => 0.5 - Math.random());
                const sessionQuestions = shuffledPool.slice(0, numQuestions ?? 3);
                setQuestionsForSession(sessionQuestions);

                if (sessionQuestions.length === 0 && poolForSession.length > 0 && numQuestions > 0) {
                    // Questo caso non dovrebbe succedere se numQuestions è ragionevole
                    console.warn("Non sono state selezionate domande per la sessione nonostante ci fossero domande disponibili nel pool.");
                }


                setStartTime(Date.now());
                setUserAnswers(new Array(sessionQuestions.length).fill(null));
                setCurrentQuestion(0); // Resetta la domanda corrente
                setScore(0); // Resetta lo score
                setShowExplanation(false);
                setSelectedAnswer(null);
                setQuizFinished(false);

            } catch (err) {
                console.error('Errore durante il caricamento dei dati per QuizItalianoGPT:', err);
                setError('Errore nel caricamento delle domande. Riprova.');
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numQuestions, difficulty, onlyOptionQuestions, includePreviouslyAnswered, usuario?.id]); // Ricarica se questi parametri cambiano

    const getTextOption = (respNum: Number) => {
        if (!questionsForSession[currentQuestion]) return "Opzione non disponibile";
        if (respNum === 0) return questionsForSession[currentQuestion].option1;
        if (respNum === 1) return questionsForSession[currentQuestion].option2;
        if (respNum === 2) return questionsForSession[currentQuestion].option3;
        return "Numero risposta non valido";
    };

    const handleAnswer = (resposta: string | number | null) => {
        if (!questionsForSession[currentQuestion]) return;

        let boAcierto = false;
        let textoRespondido = '';
        const currentQ = questionsForSession[currentQuestion];

        if (Number(currentQ.correct) === -1) { // Domanda a risposta aperta
            if (typeof resposta === 'string') {
                boAcierto = (resposta.toLowerCase() === currentQ.option1.toLowerCase());
                textoRespondido = resposta;
            }
        } else { // Domanda a scelta multipla
            boAcierto = (Number(resposta) === Number(currentQ.correct));
            textoRespondido = getTextOption(Number(resposta));
        }

        if (saveResults && usuario?.id) { // Salva la risposta solo se l'utente ha scelto di salvare
            const respuestaObj: Respuesta = {
                idUsuario: usuario.id,
                tipoPregunta: 'MC', // Multiple Choice o Misto se include aperte
                idPregunta: currentQ.id,
                respuesta: textoRespondido,
                correcta: boAcierto
            };
            guardarRespuesta(respuestaObj);
        }

        setSelectedAnswer(resposta);
        setShowExplanation(true);
        setTimer(30); // Resetta il timer per la prossima domanda o per la revisione

        const newUserAnswers = [...userAnswers];
        newUserAnswers[currentQuestion] = resposta;
        setUserAnswers(newUserAnswers);

        if (boAcierto) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < questionsForSession.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowExplanation(false);
            setSelectedAnswer(null);
            setTimer(30); // Resetta il timer per la nuova domanda
        } else {
            setQuizFinished(true);
            setEndTime(Date.now());
            // saveResult() sarà chiamato dall'useEffect che dipende da quizFinished
        }
    };

    // useEffect per chiamare saveResult quando quizFinished diventa true
    useEffect(() => {
        if (quizFinished && saveResults) { // Salva solo se l'utente ha scelto di salvare
             const saveSession = () => {
                if (!usuario || !usuario.id) {
                    console.warn("Salvataggio risultato sessione: ID utente non disponibile.");
                    const localResult = { name, score, totalQuestions: questionsForSession.length, difficulty, date: new Date().toLocaleString(), timeTakenSeconds: startTime && endTime ? (endTime - startTime) / 1000 : undefined };
                    console.log('Risultato sessione (locale, utente non definito):', localResult);
                    return;
                }

                const gameSession: GameSessionResult = {
                    userId: usuario.id,
                    gameType: 'QuizItalianoGPT',
                    timestamp: new Date(),
                    difficulty: difficulty,
                    score: score,
                    totalPossibleScore: questionsForSession.length,
                    itemsPlayed: questionsForSession.length,
                    timeTakenSeconds: startTime && endTime ? Math.round((endTime - startTime) / 1000) : undefined,
                    gameSpecificDetails: { onlyOptionQuestions: onlyOptionQuestions, includePreviouslyAnswered: includePreviouslyAnswered }
                };
                saveGameSessionResult(gameSession);
                console.log('Risultato sessione inviato a Firebase:', gameSession);
            };
            saveSession();
        } else if (quizFinished && !saveResults) {
            console.log("Quiz terminato, risultati non salvati per scelta dell'utente.");
        }
    }, [quizFinished, saveResults, difficulty, name, onlyOptionQuestions, includePreviouslyAnswered, score, questionsForSession, usuario, startTime, endTime]);


    const formatTime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const startReview = () => {
        setReviewMode(true);
        setCurrentQuestion(0);
    };

    const nextReviewQuestion = () => {
        if (currentQuestion < questionsForSession.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setReviewMode(false);
            setQuizFinished(true);
        }
    };
       
    if (quizFinished && !reviewMode) {
        const totalTime = endTime! - startTime!;
        return (
            <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
                <CardActions className="text-xl sm:text-2xl font-bold text-center text-blue-800">Quiz Completato</CardActions>
                <CardContent>
                    <p className="text-center text-lg sm:text-xl font-semibold">Grazie, {name}!</p>
                    <p className="text-center text-base sm:text-lg">Hai completato il quiz.</p>
                    <p className="text-center text-base sm:text-lg">
                        Punteggio: {score} su {questionsForSession.length}
                    </p>
                    <LinearProgress value={(score / questionsForSession.length) * 100} className="mt-4" />
                    <div className="flex items-center justify-center mt-4 text-blue-800">
                        <Clock className="mr-2" />
                        <p>Tempo totale: {formatTime(totalTime)}</p>
                    </div>
                    <Button onClick={startReview} className="w-full bg-blue-500 hover:bg-blue-700 mt-4">
                        Rivedi le risposte
                    </Button>
                    {onExit && (
                        <Button onClick={onExit} className="w-full bg-gray-500 hover:bg-gray-700 text-white mt-2">
                            Torna al Menu Principale
                        </Button>
                    )}
                </CardContent>
                <CardActions>
                    <Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700">
                        Riprova con Nuove Domande
                    </Button>
                </CardActions>
            </Card>
        );
    }

    if (questionsForSession.length === 0) {
        return (
            <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
                <CardContent>
                    <p className="text-center text-blue-800">Non che domanda [{difficulty}]</p>
                    <Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700 mb-2">
                        Riprova con Nuove Domande
                    </Button>
                    {onExit && (
                        <Button onClick={onExit} className="w-full bg-gray-500 hover:bg-gray-700 text-white">
                            Torna al Menu Principale
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    const currentQuestionData = questionsForSession[currentQuestion];

    return (
        <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100" style={{ position: 'relative' }}>
            {onExit && (
                <Button
                    onClick={onExit}
                    style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        minWidth: 'auto',
                        padding: '5px',
                        color: 'black',
                        zIndex: 1000,
                    }}
                >
                    X
                </Button>
            )}
            <CardActions className="text-lg sm:text-xl font-bold text-center text-blue-800">
                {reviewMode ? "Revisione" : `Domanda ${currentQuestion + 1} di ${questionsForSession.length} [${questionsAvailableToPlay}]`}
            </CardActions>
            <CardContent>
                {!reviewMode && (
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-blue-800 text-xs">Id: {currentQuestionData.id}</span>
                        <span className="font-semibold text-blue-800 text-xs">Gen: {currentQuestionData.generated}</span>
                        <span className="font-semibold text-blue-800">Livello: {difficulty}</span>
                        <span className="font-semibold text-blue-800 flex items-center">
                            <Clock className="mr-1" /> {timer}s
                        </span>
                    </div>
                )}
                <LinearProgress variant="determinate" value={(score / questionsForSession.length) * 100} className="mt-4" />
                <QuizQuestion
                    currentQuestionData={currentQuestionData}
                    reviewMode={reviewMode}
                    showExplanation={showExplanation}
                    handleAnswer={handleAnswer}
                    userAnswers={userAnswers}
                    currentQuestion={currentQuestion}
                    onlyOptionQuestions={onlyOptionQuestions}
                />
                {(showExplanation || reviewMode) && (
                    <Alert className="mt-4 bg-blue-50 border-blue-200">
                        <AlertTitle className="text-blue-800">
                            {currentQuestionData.explanation}
                        </AlertTitle>
                    </Alert>
                )}
            </CardContent>
            <CardActions className="justify-between">
                <p className="font-semibold text-blue-800">Punteggio: {score}/{currentQuestion + 1}</p>
                {reviewMode ? (
                    <Button onClick={nextReviewQuestion} className="bg-green-500 hover:bg-green-700">
                        {currentQuestion === questionsForSession.length - 1 ? "Termina revisione" : "Prossima domanda"}
                    </Button>
                ) : (
                    showExplanation && (
                        <Button onClick={nextQuestion} className="bg-green-500 hover:bg-green-700">
                            {currentQuestion === questionsForSession.length - 1 ? "Termina il quiz" : "Prossima domanda"}
                        </Button>
                    )
                )}
            </CardActions>
        </Card>
    );
};

export default QuizItaliano;
