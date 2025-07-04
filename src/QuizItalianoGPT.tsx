import React, { useState, useEffect, useCallback } from 'react';
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
import { Respuesta } from './firebase/firebaseInterfaces';
import { guardarRespuesta, fetchRespuestas, fetchMultiRespuesta } from './firebase/firebaseFunctions';
//import logo from './logo.jpg'; // Ajusta la ruta según la ubicación de tu imagen

let allQuestions: Question[] = [];// parseCSV(questionsCSV);


const QuizItaliano: React.FC<QuizParams> = ({
    numQuestions = 3,
    name = 'anonymous',
    onlyOptionQuestions = false,
    difficulty = 'B1',
    usuario = null
}) => {        
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    // const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
    const [quizFinished, setQuizFinished] = useState(false);   
    const [timer, setTimer] = useState(30);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [userAnswers, setUserAnswers] = useState<(string | number | null)[]>([]);
    const [reviewMode, setReviewMode] = useState(false);
    const [startTime, setStartTime] = useState<number | undefined>(undefined);
    const [endTime, setEndTime] = useState<number | undefined>(undefined);     
    const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
    const [preguntasQuedan, setPreguntasQuedan] = useState(0);
    // const [loading, setLoading] = useState(false); // Unused: setLoading is used but loading is not
    // const [error, setError] = useState<string | null>(null); // Unused: setError is used but error is not
    useEffect(() => {
        const loadWords = async () => {
            // let localLoading = true; // Temporary state within the effect - unused
            let localError = null;   // Temporary state within the effect
            try {
                // setLoading(true); // Original line if loading state was used elsewhere
                const fetchedWords = await fetchMultiRespuesta();
                allQuestions = fetchedWords;
                // setError(null); // Original line if error state was used elsewhere
                localError = null;
            } catch (err) {
                // setError('Error al cargar las palabras. Por favor, intenta de nuevo.'); // Original line
                localError = 'Error al cargar las palabras. Por favor, intenta de nuevo.';
                console.error('Error fetching words:', err);
            } finally {
                // setLoading(false); // Original line
                // localLoading = false; // Unused
                if (localError) console.error(localError); // Or handle error display differently
            }
        };

        loadWords();
    }, []);
    useEffect(() => {
        const loadRespuestas = async () => {
            try {
                const respuestasData = await fetchRespuestas(usuario?.id ?? 'sense');
                setRespuestas(respuestasData);
            } catch (error) {
                console.error("Error al cargar respuestas:", error);
            }
        };
        loadRespuestas();
    }, [usuario]);

    useEffect(() => {
        let respuestasIds = [""];
        if (respuestas.length > 0) {
            // Filtrar las preguntas que ya han sido respondidas
            respuestasIds = respuestas.map(r => r.idPregunta);            
        }
        
        const filteredQuestions = allQuestions.filter(q => {
            const difficultyMatch = q.difficulty === difficulty;
            // Si onlyOptionQuestions es true, excluir preguntas con Correct === -1
            const typeMatch = !onlyOptionQuestions || Number(q.correct) !== -1;
            // Verificar si hay opciones repetidas cuando Correct no es -1
            //const hasRepeatedOptions = (q.correct !== -1) &&
            //    (q.option1 === q.option2 || q.option1 === q.option3 || q.option2 === q.option3);
            //para las escritas
            //return q.correct === -1;
            const jaContestada = respuestasIds.includes(q.id.toString())
            return difficultyMatch && typeMatch && !jaContestada;  //&& !hasRepeatedOptions;
        }).sort(() => 0.5 - Math.random());
        console.log('Preguntas filtradas:', filteredQuestions.length, 'Preguntas respondidas:', respuestasIds.length)
        setPreguntasQuedan(filteredQuestions.length)
        setQuestions(filteredQuestions.slice(0, numQuestions ?? 3));
        setStartTime(Date.now());
        setUserAnswers(new Array(filteredQuestions.length).fill(null));
    }, [numQuestions, difficulty, respuestas, onlyOptionQuestions]);

    const getTextOption = useCallback((respNum: Number): string => {
        if (!questions[currentQuestion]) return "Error: No question data";
        if (respNum === 0) {
            return questions[currentQuestion].option1;
        } else if (respNum === 1) {
            return questions[currentQuestion].option2;
        } else if (respNum === 2) {
            return questions[currentQuestion].option3;
        } else {
            return "Invalid response number";
        }
    }, [questions, currentQuestion]);

    const handleAnswer = useCallback((resposta: string | number | null) => {
        if (!questions[currentQuestion]) return; // Guard clause

        let boAcierto = false;
        let textoRespondido = '';
        if (Number(questions[currentQuestion].correct) === -1) {
            if (typeof resposta === 'string') {
                boAcierto = (resposta?.toLowerCase() === questions[currentQuestion].option1.toLowerCase());
                textoRespondido = resposta;
            }
        } else {
            boAcierto = (Number(resposta) === Number(questions[currentQuestion].correct));
            textoRespondido = getTextOption(Number(resposta));
        }
        const respuestaData: Respuesta = {
            idUsuario: usuario?.id ?? 'sense',
            tipoPregunta: 'MC',
            idPregunta: questions[currentQuestion].id,
            respuesta: textoRespondido,
            correcta: boAcierto
        };
        guardarRespuesta(respuestaData);
        // Avoid directly mutating state like `respuestas.push(respuestaData);`
        // If `respuestas` state needs to be updated, use `setRespuestas`.
        // For now, assuming `guardarRespuesta` handles persistence and local state is for filtering.

        setShowExplanation(true);
        setTimer(30); // Reset timer
        const newUserAnswers = [...userAnswers];
        newUserAnswers[currentQuestion] = resposta;
        setUserAnswers(newUserAnswers);
        if (boAcierto) {
            setScore(prevScore => prevScore + 1); // Use functional update for score
        }
    }, [questions, currentQuestion, usuario, getTextOption, setShowExplanation, setTimer, userAnswers, setUserAnswers, setScore]); // Removed score and respuestas from deps

    useEffect(() => {
        if (!showExplanation && !quizFinished && !reviewMode && questions.length > 0 && questions[currentQuestion]) { // Added checks for questions
            const countdown = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 1) {
                        clearInterval(countdown);
                        if (questions[currentQuestion]) { // Ensure question still exists
                           handleAnswer(null); // Auto-submit null answer on time up
                        }
                        return 30; // Reset timer duration
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [showExplanation, quizFinished, reviewMode, currentQuestion, questions, handleAnswer]);


    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowExplanation(false);
            // setSelectedAnswer(null); // Unused state
        } else {
            setQuizFinished(true);
            setEndTime(Date.now());
            saveResult();
        }
    };

    const saveResult = () => {
        const result = {
            name,
            score,
            totalQuestions: questions.length,
            difficulty,
            date: new Date().toLocaleString()
        };
        console.log('Risultato salvato:', result);
    };

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
        if (currentQuestion < questions.length - 1) {
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
                        Punteggio: {score} su {questions.length}
                    </p>
                    <LinearProgress value={(score / questions.length) * 100} className="mt-4" />
                    <div className="flex items-center justify-center mt-4 text-blue-800">
                        <Clock className="mr-2" />
                        <p>Tempo totale: {formatTime(totalTime)}</p>
                    </div>
                    <Button onClick={startReview} className="w-full bg-blue-500 hover:bg-blue-700 mt-4">
                        Rivedi le risposte
                    </Button>
                </CardContent>
                <CardActions>
                    <Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700">
                        Riprova con Nuove Domande
                    </Button>
                </CardActions>
            </Card>
        );
    }

    if (questions.length === 0) {
        return (
            <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
                <CardContent>
                    <p className="text-center text-blue-800">Non che domanda [{difficulty}]</p>
                    <Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700">
                        Riprova con Nuove Domande
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const currentQuestionData = questions[currentQuestion];

    return (
        <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">                        
            <CardActions className="text-lg sm:text-xl font-bold text-center text-blue-800">
                {reviewMode ? "Revisione" : `Domanda ${currentQuestion + 1} di ${questions.length} [${preguntasQuedan}]`}
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
                <LinearProgress variant="determinate" value={(score / questions.length) * 100} className="mt-4" />
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
                        {currentQuestion === questions.length - 1 ? "Termina revisione" : "Prossima domanda"}
                    </Button>
                ) : (
                    showExplanation && (
                        <Button onClick={nextQuestion} className="bg-green-500 hover:bg-green-700">
                            {currentQuestion === questions.length - 1 ? "Termina il quiz" : "Prossima domanda"}
                            </Button>
                            
                    )
                )}
            </CardActions>    
        </Card>
    );
};

export default QuizItaliano;
