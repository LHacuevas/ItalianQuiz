import React, { useState, useEffect } from 'react';
//import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
//import Input from '@mui/material/Input';
//import Alert from '@mui/material/Alert';
//import AlertTitle from '@mui/material/AlertTitle';
import LinearProgress from '@mui/material/LinearProgress';
import { Clock } from 'lucide-react';
//import Select from '@mui/material/Select';
//import MenuItem from '@mui/material/MenuItem';
//import FormControl from '@mui/material/FormControl';
//import InputLabel from '@mui/material/InputLabel';
import { CardActions } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Paragraph, ParagraphQuestion, QuizParams } from './MyTypes.js';
//import { paragraphsCSV, paragraphsQuestionsCSV } from './questionParrafo.js';
import ResponsiveCard from './components/ResponsiveCard';
import { Respuesta } from "./firebase/firebaseInterfaces";
import { guardarRespuesta, fetchRespuestas, fetchParrafo, fetchParrafoSub } from './firebase/firebaseFunctions';
import QuestionComponent from './components/ParagraphQuestion';

const ItalianLearningApp: React.FC<QuizParams> = ({
    numQuestions = 3,
    name = 'anonymous',
    onlyOptionQuestions = false,
    difficulty = 'B1',
    usuario = null
}) => {
    
    const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
    const [todosParagraphs, setTodosParagraphs] = useState<Paragraph[]>([]);
    const [todosQuestions, setTodosQuestions] = useState<ParagraphQuestion[]>([]);

    const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
    const [questions, setQuestions] = useState<ParagraphQuestion[]>([]);
    const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
    //const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [userAnswers, setUserAnswers] = useState<{ [paragraphId: number]: { [key: number]: string } }>({});
    // ... (resto del código)
    const [showResults, setShowResults] = useState(false);
    const [useDropdown, setUseDropdown] = useState(onlyOptionQuestions);
    const [score, setScore] = useState(0);
    const [totalAnsweredQuestions, setTotalAnsweredQuestions] = useState(0);
    const [startTime, setStartTime] = useState<number | undefined>(undefined);
    const [endTime, setEndTime] = useState<number | undefined>(undefined);
    const [timer, setTimer] = useState(60);
    const [quizFinished, setQuizFinished] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [preguntasQuedan, setPreguntasQuedan] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {      
        const loadRespuestas = async () => {
            try {
                const respuestasData = await fetchRespuestas(usuario?.id??'sense');
                setRespuestas(respuestasData);
            } catch (error) {
                console.error('Errore nel recupero delle parole:', error);
            }
        };
        loadRespuestas();
    }, [usuario]);

    // Carica paragrafi e domande
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [fetchedParagraphs, fetchedQuestions] = await Promise.all([
                    fetchParrafo(),
                    fetchParrafoSub()
                ]);
                setTodosParagraphs(fetchedParagraphs);
                setTodosQuestions(fetchedQuestions);
                setError(null);
            } catch (err) {
                setError('Errore nel caricamento dei dati. Per favore, riprova.');
                console.error('Errore nel recupero dei dati:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    // Filtra e seleziona paragrafi e domande
    useEffect(() => {
        if (todosParagraphs.length > 0) {
            let availableParagraphs = [...todosParagraphs];
            if (respuestas.length > 0) {
                // Filtra i paragrafi non ancora risposti
                const respuestasIds = respuestas.map(r => r.idPregunta);
                availableParagraphs = availableParagraphs.filter(p => !respuestasIds.includes(p.id));
            }
            setPreguntasQuedan(availableParagraphs.length);
            console.log("Quedan preguntas: ", availableParagraphs.length);
            // Seleziona casualmente i paragrafi non risposti
            const filteredParagraphs = availableParagraphs
                .sort(() => 0.5 - Math.random())
                .slice(0, numQuestions);
            setParagraphs(filteredParagraphs);

            // Filtra le domande corrispondenti ai paragrafi selezionati
            const selectedParagraphIds = filteredParagraphs.map(p => p.id);
            const filteredQuestions = todosQuestions.filter(q => selectedParagraphIds.includes(q.paragraphId));
            setQuestions(filteredQuestions);

            setUserAnswers({});
            setStartTime(Date.now());
            setCurrentParagraphIndex(0);
        }
    }, [todosParagraphs, todosQuestions, respuestas]);

    const currentParagraph = paragraphs[currentParagraphIndex];
    const currentQuestions = questions.filter(q => q.paragraphId === currentParagraph?.id);

    useEffect(() => {
        if (!showResults && !quizFinished) {
            const countdown = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 1) {
                        clearInterval(countdown);
                        handleVerify();                        
                        return 60;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [showResults, quizFinished, currentParagraphIndex, currentParagraph, userAnswers]);

    
    const handleInputChange = (paragraphId: number, questionId: number, value: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [paragraphId]: {
                ...(prev[paragraphId] || {}),
                [questionId]: value
            }
        }));
    };
    
    const handleVerify = () => {
        if (!currentParagraph) {
           console.error('currentParagraph è indefinito');
           return;
        }          
        let correctAnswers = 0;                
        const respuesta: Respuesta = {
            idUsuario: usuario?.id??'sense',
            tipoPregunta: 'PR',
            idPregunta: currentParagraph.id,
            idSubPregunta: "0",
            respuesta: "",
            correcta: false
        };                
        currentQuestions.forEach(question => {            
            let resposta = userAnswers[Number(currentParagraph.id)]?.[Number(question.paragraphSubId)]
            if (!resposta) {
                console.log('resposta è indefinito', Number(question.paragraphSubId));
                return;   
            } 
            respuesta.respuesta = resposta;
            respuesta.idSubPregunta = question.paragraphSubId
            if (resposta === question.correct) {
                correctAnswers++;
                respuesta.correcta = true;
            } else respuesta.correcta = false;                
            guardarRespuesta(respuesta);
        });        
        
        setScore(prevScore => prevScore + correctAnswers);
        setTotalAnsweredQuestions(prev => prev + currentQuestions.length);
        setShowResults(true);
    }

    const handleNextParagraph = () => {
        if (reviewMode) return;
        if (!showResults) {
            handleVerify();
        }
        setCurrentParagraphIndex(prev => {
            const nextIndex = prev + 1;
            if (nextIndex >= numQuestions) {
                setQuizFinished(true);
                setEndTime(Date.now());
                saveResult();
                return prev;
            } else {
                setShowResults(false);
                //setUserAnswers({});
                setTimer(60);
                return nextIndex;
            }
        });
    };

    const saveResult = () => {
        const result = {
            name,
            score,
            totalQuestions: totalAnsweredQuestions,
            difficulty,
            date: new Date().toLocaleString(),
            userAnswers: userAnswers,
            paragraphs: paragraphs,
            questions: questions
        };
        localStorage.setItem('quizResult', JSON.stringify(result));
        console.log('Risultato salvato:', result);
    };
    const startReview = () => {
        const savedResult = JSON.parse(localStorage.getItem('quizResult') || '{}');
        setParagraphs(savedResult.paragraphs || []);
        setQuestions(savedResult.questions || []);
        setUserAnswers(savedResult.userAnswers || {});
        setReviewMode(true);
        setCurrentParagraphIndex(0);
        setShowResults(true);
    };
    const formatTime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const renderReviewParagraph = (paragraph: Paragraph, paragraphQuestions: ParagraphQuestion[]) => {
        let text = paragraph.text;
        paragraphQuestions.forEach(question => {
            const userAnswer = userAnswers[Number(paragraph.id)]?.[Number(question.paragraphSubId)] || '';
            const isCorrect = userAnswer === question.correct;
            const replacement = isCorrect
                ? `<span class="font-bold text-green-600">${userAnswer}</span>`
                : `<span class="font-bold text-red-600">${userAnswer}</span><span class="font-bold text-yellow-600"> (${question.correct})</span>`;
            text = text.replace(`[${question.paragraphSubId}]`, replacement);
        });
        return <p dangerouslySetInnerHTML={{ __html: text }} />;
    };
    
    const renderQuestion = (question: ParagraphQuestion) => {
        return (
            <QuestionComponent
                key={question.paragraphSubId}
                question={question}
                currentParagraphId={Number(currentParagraph.id)}
                userAnswers={userAnswers}
                handleInputChange={handleInputChange}
                showResults={showResults}
                useDropdown={useDropdown}
            />
        );
    };


    if (quizFinished && !reviewMode) {
        const totalTime = endTime! - startTime!;
        return (
            <ResponsiveCard className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
                <CardHeader title="Quiz Completato" className="text-xl sm:text-2xl font-bold text-center text-blue-800" />
                <CardContent className="p-2 sm:p-4">
                    <p className="text-center text-lg sm:text-xl font-semibold">Grazie, {name}!</p>
                    <p className="text-center text-base sm:text-lg">Hai completato il quiz.</p>
                    <p className="text-center text-base sm:text-lg">
                        Punteggio: {score} su {totalAnsweredQuestions}
                    </p>
                    <LinearProgress variant="determinate" value={(score / totalAnsweredQuestions) * 100} className="mt-4" />
                    <div className="flex items-center justify-center mt-4 text-blue-800">
                        <Clock className="mr-2" />
                        <p>Tempo totale: {formatTime(totalTime)}</p>
                    </div>
                </CardContent>
                <CardActions>
                    <Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700">
                        Riprova con Nuove Domande
                    </Button>
                    <Button onClick={startReview} className="w-full bg-blue-500 hover:bg-blue-700 mt-4">
                        Rivedi le risposte
                    </Button>
                </CardActions>
            </ResponsiveCard>
        );
    }
    if (quizFinished && reviewMode) {
        return (
            <ResponsiveCard className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
                <CardHeader title="Revisione delle Risposte" className="text-xl sm:text-2xl font-bold text-center text-blue-800" />
                <CardContent className="p-2 sm:p-4">
                    {paragraphs.map((paragraph, index) => {
                        const paragraphQuestions = questions.filter(q => q.paragraphId === paragraph.id);
                        return (
                            <div key={paragraph.id} className="mb-8">
                                <div className="flex flex-wrap items-baseline mb-2">
                                    <h3 className="font-bold text-base sm:text-lg mr-2">
                                        Paragrafo {index + 1}
                                    </h3>
                                    <span className="text-gray-600 text-xs sm:text-sm">
                                        ({paragraph.id}) {paragraph.generated}
                                    </span>
                                </div>
                                {renderReviewParagraph(paragraph, paragraphQuestions)}
                                {paragraphQuestions.map(question => {
                                    const userAnswer = userAnswers[Number(paragraph.id)]?.[Number(question.paragraphSubId)];
                                    const isIncorrect = userAnswer !== question.correct;
                                    return isIncorrect ? (
                                        <div key={Number(question.paragraphSubId)} className="mt-2 ml-4 text-sm">
                                            <p><span className="font-semibold">Suggerimento:</span> {question.hint}</p>
                                            <p className="text-gray-600">{question.explanation}</p>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        );
                    })}
                    <Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700 mt-4">
                        Torna alla Pagina Iniziale
                    </Button>
                </CardContent>
            </ResponsiveCard>
        );
    }  
    if (!currentParagraph) {
        return (
            <ResponsiveCard className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
                <CardContent>
                    <p className="text-center text-blue-800">Caricamento...</p>
                </CardContent>
            </ResponsiveCard>
        );
    }

    return (
        <ResponsiveCard className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">            
            <CardContent className="p-2 sm:p-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-blue-800">Paragrafo {currentParagraphIndex + 1} di {numQuestions} [{preguntasQuedan}]</span>
                    <span className="font-semibold text-blue-800 flex items-center">
                        <Clock className="mr-1" /> {timer}s
                    </span>
                </div>
                <LinearProgress variant="determinate" value={(score / totalAnsweredQuestions) * 100} className="mt-4 mb-4" />
                <div className="flex items-center justify-between">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useDropdown}
                            onChange={() => setUseDropdown(!useDropdown)}
                            color="primary"
                        />
                    }
                    label={<span className="italic text-xs">Usa menu a tendina</span>}
                /><span className="text-blue-800 ml-auto text-xs">Punteggio attuale: {score}/{totalAnsweredQuestions}</span>
                </div>
                <p className="text-sm italic">{currentParagraph.id} - {currentParagraph.generated}</p>
                <p className="text-sm">
                    {currentParagraph.text.split(/(\[\d+\])/).map((part, index) => {
                        if (part.match(/\[\d+\]/)) {
                            const questionId = parseInt(part.match(/\d+/)?.[0] || '0');
                            const question = currentQuestions.find(q => Number(q.paragraphSubId) === questionId);
                            return question ? renderQuestion(question) : part;
                        }
                        return part;
                    })}
                </p>
                {!showResults && (
                    <div className="flex justify-center mb-4">                        
                          <Button onClick={handleVerify} className="mb-4 bg-blue-500 hover:bg-blue-700" color="primary">Verifica risposte</Button>
                    </div>
                )}
                {showResults && (
                    <div className="mt-4">
                        <h2 className="text-lg sm:text-xl font-bold mb-2">Risultati:</h2>
                        {[...currentQuestions] // Crea una copia dell'array per non modificare l'originale
                            .sort((a, b) => Number(a.paragraphSubId) - Number(b.paragraphSubId)) // Ordina per paragraphSubId
                            .map(question => (
                            <div key={Number(question.paragraphSubId)} className="mb-2">
                                <p className={`text-sm sm:text-base ${userAnswers[Number(currentParagraph.id)]?.[Number(question.paragraphSubId)] === question.correct ? 'text-green-600' : 'text-red-600'}`}>
                                    {Number(question.paragraphSubId)}[{question.difficulty}]: {userAnswers[Number(currentParagraph.id)]?.[Number(question.paragraphSubId)] || 'Nessuna risposta'}
                                    {userAnswers[Number(currentParagraph.id)]?.[Number(question.paragraphSubId)] !== question.correct && ` (Corretto: ${question.correct})`}
                                </p>
                                {userAnswers[Number(currentParagraph.id)]?.[Number(question.paragraphSubId)] !== question.correct && (
                                    <p className="text-xs sm:text-sm text-gray-600">{question.explanation}</p>
                                )}
                            </div>
                        ))}
                        <Button onClick={handleNextParagraph} className="mt-4 bg-green-500 hover:bg-green-700">
                            {currentParagraphIndex === numQuestions - 1 ? "Termina il quiz" : "Prossimo paragrafo"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </ResponsiveCard>
    );
};

export default ItalianLearningApp;