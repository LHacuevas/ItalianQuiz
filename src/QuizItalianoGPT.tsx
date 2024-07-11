import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle'; // Cambié AlertDescription a AlertTitle
import LinearProgress from '@mui/material/LinearProgress';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem'; // Cambié SelectContent, SelectItem, SelectTrigger y SelectValue
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { CardActions } from '@mui/material';
import { questionsCSV } from './questionGPT4o.js'

interface Question {
    id: number;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    correct: number;
    explanation: string;
    difficulty: string;
    generated: string;
}

const parseCSV = (csv: string): Question[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        return headers.reduce((obj, header, index) => {            
            // Limpiamos las comillas y los espacios en blanco alrededor de los valores
            const value = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
            obj[header] = value;
            return obj;
        }, {} as Question);
    });
};

const allQuestions: Question[] = parseCSV(questionsCSV);

const QuizItaliano = () => {
    const [name, setName] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const [difficulty, setDifficulty] = useState('A2');
    const [timer, setTimer] = useState(30);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
    const [reviewMode, setReviewMode] = useState(false);
    const [startTime, setStartTime] = useState<number | undefined>(undefined);
    const [endTime, setEndTime] = useState<number | undefined>(undefined); 

    useEffect(() => {
        const filteredQuestions = allQuestions.filter(q => q.difficulty === difficulty).sort(() => 0.5 - Math.random());
        setQuestions(filteredQuestions.slice(0,3));
        setStartTime(Date.now());
        setUserAnswers(new Array(filteredQuestions.length).fill(null));
    }, [difficulty]);

    useEffect(() => {
        if (quizStarted && !showExplanation && !quizFinished && !reviewMode) {
            const countdown = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 1) {
                        clearInterval(countdown);
                        handleAnswer(null);
                        return 30;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [quizStarted, showExplanation, quizFinished, reviewMode, currentQuestion]);

    const handleStart = () => {
        if (name.trim()) {
            setQuizStarted(true);
        }
    };

    const handleAnswer = (index: number | null) => {
        setSelectedAnswer(index);
        setShowExplanation(true);
        setTimer(30);
        const newUserAnswers = [...userAnswers];
        newUserAnswers[currentQuestion] = index;
        setUserAnswers(newUserAnswers);
        if (index === Number(questions[currentQuestion].correct)) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowExplanation(false);
            setSelectedAnswer(null);
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

    const formatTime = (milliseconds) => {
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

    if (!quizStarted) {
        return (
            <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
                <CardHeader className="text-2xl font-bold text-center text-blue-800">Quiz di Italiano</CardHeader>
                <CardContent>
                    <Input
                        type="text"
                        placeholder="Inserisci il tuo nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mb-4"
                    />
                    <FormControl className="mb-4" fullWidth>
                        <InputLabel>Seleziona il livello</InputLabel>
                        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                            <MenuItem value="A2">A2</MenuItem>
                            <MenuItem value="B1">B1</MenuItem>
                            <MenuItem value="B2">B2</MenuItem>
                        </Select>
                    </FormControl>
                    <Button onClick={handleStart} className="w-full bg-blue-500 hover:bg-blue-700">
                        Inizia il Quiz
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (quizFinished && !reviewMode) {
        const totalTime = 0 // endTime - startTime;
        return (
            <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
                <CardHeader className="text-2xl font-bold text-center text-blue-800">Quiz Completato</CardHeader>
                <CardContent>
                    <p className="text-center text-xl font-semibold">Grazie, {name}!</p>
                    <p className="text-center text-lg">Hai completato il quiz.</p>
                    <p className="text-center text-lg">
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
                    <p className="text-center text-blue-800">Non che domanda</p>
                </CardContent>
            </Card>
        );
    }

    const currentQuestionData = questions[currentQuestion];

    return (
        <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">            
            <CardHeader className="text-xl font-bold text-center text-blue-800">
                {reviewMode ? "Revisione" : `Domanda ${currentQuestion + 1} di ${questions.length}`}
            </CardHeader>
            <CardContent>
                {!reviewMode && (
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-blue-800">Livello: {difficulty}</span>
                        <span className="font-semibold text-blue-800 flex items-center">
                            <Clock className="mr-1" /> {timer}s
                        </span>
                    </div>
                )}
                <p className="mb-4 text-lg font-semibold">{currentQuestionData.question}</p>
                {['option1', 'option2', 'option3'].map((option, index) => (
                    <Button
                        key={index}
                        onClick={() => !reviewMode && handleAnswer(index)}
                        className="w-full mb-2 text-left justify-start"
                        variant={
                            reviewMode || showExplanation
                                ? index === Number(currentQuestionData.correct)
                                    ? "contained"
                                    : userAnswers[currentQuestion] === index
                                        ? "outlined"
                                        : "text"
                                : selectedAnswer === index
                                    ? "contained"
                                    : "text"
                        }
                        disabled={reviewMode || showExplanation}
                    >
                        {(reviewMode || showExplanation) && index === Number(currentQuestionData.correct) && <CheckCircle className="mr-2 h-4 w-4" />}
                        {(reviewMode || showExplanation) && userAnswers[currentQuestion] === index && index !== currentQuestionData.correct && <XCircle className="mr-2 h-4 w-4" />}
                        {currentQuestionData[option]}
                    </Button>
                ))}
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
