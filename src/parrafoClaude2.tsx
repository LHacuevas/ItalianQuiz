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
import { Respuesta, GameSessionResult } from "./firebase/firebaseInterfaces";
import { guardarRespuesta, fetchParrafo, fetchParrafoSub, saveGameSessionResult, fetchAnsweredQuestionIdsGroupedByType } from './firebase/firebaseFunctions';
import QuestionComponent from './components/ParagraphQuestion';
import { Typography, Box } from '@mui/material'; // Aggiunto per UI conteggi

const ItalianLearningApp: React.FC<QuizParams> = ({
    numQuestions = 3,
    name = 'anonymous',
    onlyOptionQuestions = false,
    difficulty = 'B1',
    usuario = null,
    onExit,
    saveResults = true, // Valore di default
    includePreviouslyAnswered = false // Valore di default
}) => {
    
    // const [respuestas, setRespuestas] = useState<Respuesta[]>([]); // Non più usato direttamente per il fetch iniziale
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
    // const [preguntasQuedan, setPreguntasQuedan] = useState(0); // Sostituito da paragraphsAvailableToPlay
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stati per i conteggi dei paragrafi
    const [totalParagraphsInDB, setTotalParagraphsInDB] = useState(0);
    const [possibleParagraphsForCriteria, setPossibleParagraphsForCriteria] = useState(0); // Paragrafi che matchano difficoltà (se applicabile)
    const [answeredParagraphsForCriteriaCount, setAnsweredParagraphsForCriteriaCount] = useState(0);
    const [paragraphsAvailableToPlay, setParagraphsAvailableToPlay] = useState(0);

    useEffect(() => {
        const loadAndFilterData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Carica tutti i paragrafi e le loro domande (una sola volta se non già caricati)
                let currentTodosParagraphs = todosParagraphs;
                let currentTodosQuestions = todosQuestions;

                if (currentTodosParagraphs.length === 0) {
                    currentTodosParagraphs = await fetchParrafo();
                    setTodosParagraphs(currentTodosParagraphs);
                    setTotalParagraphsInDB(currentTodosParagraphs.length);
                }
                if (currentTodosQuestions.length === 0) {
                    currentTodosQuestions = await fetchParrafoSub();
                    setTodosQuestions(currentTodosQuestions);
                }

                // 2. Recupera ID dei paragrafi già risposti dall'utente
                let answeredParagraphIds = new Set<string>();
                if (usuario?.id && process.env.REACT_APP_USE_DATABASE === 'true') {
                    const answeredMap = await fetchAnsweredQuestionIdsGroupedByType(usuario.id);
                    answeredParagraphIds = answeredMap['PR'] || new Set<string>(); // 'PR' per Paragrafo
                }

                // 3. Filtra paragrafi per difficoltà (se applicabile - attualmente i paragrafi non hanno difficoltà)
                // Per ora, tutti i paragrafi caricati sono considerati "possibili"
                const paragraphsMatchingCriteria = [...currentTodosParagraphs]; // Copia per evitare modifiche all'originale
                setPossibleParagraphsForCriteria(paragraphsMatchingCriteria.length);

                // 4. Calcola quanti di questi sono già stati risposti
                const answeredAmongCriteria = paragraphsMatchingCriteria.filter(p => answeredParagraphIds.has(p.id.toString()));
                setAnsweredParagraphsForCriteriaCount(answeredAmongCriteria.length);

                // 5. Determina il pool di paragrafi da cui scegliere
                let poolOfParagraphs: Paragraph[];
                if (includePreviouslyAnswered) {
                    poolOfParagraphs = [...paragraphsMatchingCriteria];
                } else {
                    poolOfParagraphs = paragraphsMatchingCriteria.filter(p => !answeredParagraphIds.has(p.id.toString()));
                }
                setParagraphsAvailableToPlay(poolOfParagraphs.length);

                // 6. Seleziona i paragrafi per la sessione corrente
                const shuffledPool = poolOfParagraphs.sort(() => 0.5 - Math.random());
                const sessionParagraphs = shuffledPool.slice(0, Math.min(numQuestions ?? 1, poolOfParagraphs.length)); // Assicura di non chiedere più del disponibile
                setParagraphs(sessionParagraphs);

                // Filtra le domande (sub-questions) corrispondenti ai paragrafi selezionati per la sessione
                const selectedParagraphIds = sessionParagraphs.map(p => p.id);
                const sessionSubQuestions = currentTodosQuestions.filter(q => selectedParagraphIds.includes(q.paragraphId));
                setQuestions(sessionSubQuestions);

                // Resetta stati per la nuova sessione
                setUserAnswers({});
                setStartTime(Date.now());
                setCurrentParagraphIndex(0);
                setScore(0);
                setShowResults(false);
                setQuizFinished(false);
                setTimer(60);

            } catch (err) {
                console.error('Errore nel caricamento o filtraggio dei dati per Parrafo:', err);
                setError('Errore nel caricamento dei paragrafi. Riprova.');
            } finally {
                setLoading(false);
            }
        };

        loadAndFilterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numQuestions, difficulty, includePreviouslyAnswered, usuario?.id]); // Nota: difficulty non è usata per filtrare i paragrafi attualmente


    const currentParagraph = paragraphs[currentParagraphIndex];
    const currentQuestions = questions.filter(q => q.paragraphId === currentParagraph?.id);

    useEffect(() => {
        if (!showResults && !quizFinished && currentParagraph) { // Aggiunto currentParagraph per evitare errori se non ancora caricato
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
            if (saveResults && usuario?.id) { // Condiziona il salvataggio della singola risposta
                guardarRespuesta(respuesta);
            }
        });

        setScore(prevScore => prevScore + correctAnswers);
        setTotalAnsweredQuestions(prev => prev + currentQuestions.length); // Questo conta i blank, non i paragrafi
        setShowResults(true);
    }

    const handleNextParagraph = () => {
        if (reviewMode) return;
        if (!showResults && currentParagraph) { // Assicurati che ci sia un currentParagraph prima di verificare
            handleVerify();
        }
        setCurrentParagraphIndex(prev => {
            const nextIndex = prev + 1;
            if (nextIndex >= paragraphs.length) { // Usa paragraphs.length (paragrafi della sessione)
                setQuizFinished(true);
                setEndTime(Date.now());
                // saveResult sarà chiamato da useEffect dipendente da quizFinished
                return prev;
            } else {
                setShowResults(false);
                setTimer(60);
                return nextIndex;
            }
        });
    };

    // useEffect per chiamare saveResult quando quizFinished e saveResults sono true
    useEffect(() => {
        if (quizFinished && saveResults) {
            if (!usuario || !usuario.id) {
                console.warn("Salvataggio risultato sessione (Parrafo): ID utente non disponibile.");
                const localResult = { name, score, totalAnsweredQuestions, difficulty, date: new Date().toLocaleString(), timeTakenSeconds: startTime && endTime ? (endTime - startTime) / 1000 : undefined, };
                console.log('Risultato sessione Parrafo (locale, utente non definito):', localResult);
                localStorage.setItem('paragraphReviewData', JSON.stringify({ userAnswers, paragraphs, questions }));
                return;
            }

            const gameSession: GameSessionResult = {
                userId: usuario.id,
                gameType: 'ParagraphCompletion',
                timestamp: new Date(),
                difficulty: difficulty, // difficulty della sessione generale
                score: score, // Punteggio basato sui blank corretti
                totalPossibleScore: totalAnsweredQuestions, // Totale blanks presentati
                itemsPlayed: paragraphs.length, // Numero di paragrafi effettivamente giocati
                timeTakenSeconds: startTime && endTime ? Math.round((endTime - startTime) / 1000) : undefined,
                gameSpecificDetails: {
                    useDropdown: useDropdown,
                    includePreviouslyAnswered: includePreviouslyAnswered,
                    // paragraphIds: paragraphs.map(p => p.id), // Opzionale: ID dei paragrafi giocati
                }
            };
            saveGameSessionResult(gameSession);
            console.log('Risultato sessione Parrafo inviato a Firebase:', gameSession);

            const reviewData = { userAnswers, paragraphs, questions };
            localStorage.setItem('paragraphReviewData', JSON.stringify(reviewData));

        } else if (quizFinished && !saveResults) {
            console.log("Completamento Paragrafo terminato, risultati non salvati per scelta dell'utente.");
            // Salva comunque i dati per la review locale se necessario
            const reviewData = { userAnswers, paragraphs, questions };
            localStorage.setItem('paragraphReviewData', JSON.stringify(reviewData));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizFinished, saveResults]);


    const startReview = () => {
        // Prova a caricare da 'paragraphReviewData'. Se non c'è, prova col vecchio 'quizResult' per retrocompatibilità.
        const reviewDataString = localStorage.getItem('paragraphReviewData') || localStorage.getItem('quizResult');
        const savedResult = JSON.parse(reviewDataString || '{}');
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
                    <Button onClick={startReview} className="w-full bg-blue-500 hover:bg-blue-700 mt-2">
                        Rivedi le risposte
                    </Button>
                    {onExit && (
                        <Button onClick={onExit} className="w-full bg-gray-500 hover:bg-gray-700 text-white mt-2">
                            Torna al Menu Principale
                        </Button>
                    )}
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
                    <Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700 mt-4 mb-2">
                        Pagina Iniziale (Ricarica)
                    </Button>
                    {onExit && (
                        <Button onClick={onExit} className="w-full bg-gray-500 hover:bg-gray-700 text-white">
                            Torna al Menu Principale
                        </Button>
                    )}
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
                    <span className="font-semibold text-blue-800">Paragrafo {currentParagraphIndex + 1} di {numQuestions} [{paragraphsAvailableToPlay}]</span>
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
                {onExit && !showResults && !quizFinished && (
                    <div className="flex justify-center mt-4">
                        <Button onClick={onExit} variant="outlined" size="small">
                            Torna al Menu Principale
                        </Button>
                    </div>
                )}
            </CardContent>
        </ResponsiveCard>
    );
};

export default ItalianLearningApp;