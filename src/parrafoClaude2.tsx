import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import LinearProgress from '@mui/material/LinearProgress';
import { Clock } from 'lucide-react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { CardActions } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Paragraph, ParagraphQuestion, QuizParams } from './MyTypes.js';
import { paragraphsCSV, paragraphsQuestionsCSV } from './questionParrafo.js';
import ResponsiveCard from './ResponsiveCard';
import { Usuario, Respuesta } from "./firebaseInterfaces";
import { guardarRespuesta } from './firebaseFunctions';
const paragraphParseCSV = (csv: string): Paragraph[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));

    return lines.slice(1).map(line => {
        const values = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g) || [];

        const obj: Paragraph = {
            id: 0,
            text: '',
            generated: '',
        };

        headers.forEach((header, index) => {
            let value = values[index] ? values[index].replace(/^,?"?|"?$/g, '').trim() : '';

            if (header === 'id') {
                obj[header] = Number(value);
            } else {
                obj[header] = value;
            }
        });

        return obj;
    });
};

const questionParseCSV = (csv: string): ParagraphQuestion[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));

    return lines.slice(1).map(line => {
        const values = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g) || [];

        const obj: ParagraphQuestion = {
            id: 0,
            paragraphId: 0,
            correct: '',
            options: [],
            hint: '',
            explanation: '',
            difficulty: '',
        };

        headers.forEach((header, index) => {
            let value = values[index] ? values[index].replace(/^,?"?|"?$/g, '').trim() : '';

            if (header === 'id' || header === 'paragraphId') {
                obj[header] = Number(value);
            } else if (header === 'options') {
                obj[header] = value.split('|');
            } else {
                obj[header] = value;
            }
        });

        return obj;
    });
};


const PARAGRAPHS_DATA: Paragraph[] = paragraphParseCSV(paragraphsCSV);
const QUESTIONS_DATA: ParagraphQuestion[] = questionParseCSV(paragraphsQuestionsCSV);

const ItalianLearningApp: React.FC<QuizParams> = ({
    numQuestions = 3,
    name = 'anonymous',
    onlyOptionQuestions = false,
    difficulty = 'B1',
    usuario = null
}) => {
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

    useEffect(() => {
        const filteredParagraphs = PARAGRAPHS_DATA
            .sort(() => 0.5 - Math.random())
            .slice(0, numQuestions);
        setParagraphs(filteredParagraphs);

        const selectedParagraphIds = filteredParagraphs.map(p => p.id);
        const filteredQuestions = QUESTIONS_DATA.filter(q => selectedParagraphIds.includes(q.paragraphId));
        setQuestions(filteredQuestions);
        setUserAnswers({}); // Inicializa userAnswers aquí
        setStartTime(Date.now());
    }, []);

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
    }, [showResults, quizFinished, currentParagraphIndex]);

    const currentParagraph = paragraphs[currentParagraphIndex];
    const currentQuestions = questions.filter(q => q.paragraphId === currentParagraph?.id);

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
        let correctAnswers = 0;                
        const respuesta: Respuesta = {
            idUsuario: usuario?.id??'sense',
            tipoPregunta: 'PR',
            idPregunta: Number(currentParagraph.id),
            idSubPregunta: 0,
            respuesta: "",
            correcta: false
        };                
        currentQuestions.forEach(question => {            
            let resposta = userAnswers[currentParagraph.id]?.[question.id]
            respuesta.respuesta = resposta;
            respuesta.idSubPregunta = question.id
            if (resposta === question.correct) {
                correctAnswers++;
                respuesta.correcta = true;
            } else respuesta.correcta = false;                
            guardarRespuesta(respuesta);
        });        
        
        setScore(prevScore => prevScore + correctAnswers);
        setTotalAnsweredQuestions(prev => prev + currentQuestions.length);
        setShowResults(true);
    };

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
            const userAnswer = userAnswers[paragraph.id]?.[question.id] || '';
            const isCorrect = userAnswer === question.correct;
            const replacement = isCorrect
                ? `<span class="font-bold text-green-600">${userAnswer}</span>`
                : `<span class="font-bold text-red-600">${userAnswer}</span><span class="font-bold text-yellow-600"> (${question.correct})</span>`;
            text = text.replace(`[${question.id}]`, replacement);
        });
        return <p dangerouslySetInnerHTML={{ __html: text }} />;
    };
    
    const renderQuestion = (question: ParagraphQuestion) => {
        if (!question) return null;

        const isCorrect = showResults && userAnswers[currentParagraph.id]?.[question.id] === question.correct;
        const isIncorrect = showResults && userAnswers[currentParagraph.id]?.[question.id] && userAnswers[currentParagraph.id]?.[question.id] !== question.correct;

        return (
            <div className={`inline-block mx-1 p-1 border-2 ${isCorrect ? 'border-green-500 bg-green-200' : isIncorrect ? 'border-red-500 bg-red-200' : 'border-gray-300'}`}>
                {useDropdown ? (
                    <FormControl size="small" className="min-w-0">
                        <Select
                            value={userAnswers[currentParagraph.id]?.[question.id] || ''}
                            onChange={(e) => handleInputChange(currentParagraph.id, question.id, e.target.value as string)}
                            displayEmpty
                            renderValue={(selected) => (
                                <span className={`text-sm ${selected ? 'font-bold' : ''}`}>
                                    {selected || question.hint}
                                </span>
                            )}
                        >
                            <MenuItem value="" disabled className="text-sm">{question.hint}</MenuItem>
                            {question.options.map((option, index) => (
                                <MenuItem key={index} value={option} className="text-sm">{option}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <Input
                        type="text"
                        value={userAnswers[currentParagraph.id]?.[question.id] || ''}
                        onChange={(e) => handleInputChange(currentParagraph.id, question.id, e.target.value)}
                        placeholder={question.hint}
                        className={`w-24 sm:w-32 text-sm ${isCorrect ? 'border-green-500' : isIncorrect ? 'border-red-500' : ''}`}
                    />
                )}
            </div>
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
                                    const userAnswer = userAnswers[paragraph.id]?.[question.id];
                                    const isIncorrect = userAnswer !== question.correct;
                                    return isIncorrect ? (
                                        <div key={question.id} className="mt-2 ml-4 text-sm">
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
                    <span className="font-semibold text-blue-800">Paragrafo {currentParagraphIndex + 1} di {numQuestions}</span>
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
                    label={<span className="italic">Usa menu a tendina</span>}
                /><span className="text-blue-800 ml-auto">Punteggio attuale: {score}/{totalAnsweredQuestions}</span>
                </div>
                <p className="text-base">{currentParagraph.id} - {currentParagraph.generated}</p>
                <p className="text-base">
                    {currentParagraph.text.split(/(\[\d+\])/).map((part, index) => {
                        if (part.match(/\[\d+\]/)) {
                            const questionId = parseInt(part.match(/\d+/)?.[0] || '0');
                            const question = currentQuestions.find(q => q.id === questionId);
                            return question ? renderQuestion(question) : part;
                        }
                        return part;
                    })}
                </p>
                {!showResults && (
                    <Button onClick={handleVerify} className="mb-4 bg-blue-500 hover:bg-blue-700">Verifica risposte</Button>
                )}
                {showResults && (
                    <div className="mt-4">
                        <h2 className="text-lg sm:text-xl font-bold mb-2">Risultati:</h2>
                        {currentQuestions.map(question => (
                            <div key={question.id} className="mb-2">
                                <p className={`text-sm sm:text-base ${userAnswers[currentParagraph.id]?.[question.id] === question.correct ? 'text-green-600' : 'text-red-600'}`}>
                                    {question.id}[{question.difficulty}]: {userAnswers[currentParagraph.id]?.[question.id] || 'Nessuna risposta'}
                                    {userAnswers[currentParagraph.id]?.[question.id] !== question.correct && ` (Corretto: ${question.correct})`}
                                </p>
                                {userAnswers[currentParagraph.id]?.[question.id] !== question.correct && (
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