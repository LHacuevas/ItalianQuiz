import React, { useState, useEffect } from 'react';
import Card  from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import CardFooter from '@mui/material/Card';
import Input  from '@mui/material/Input';
import Alert from '@mui/material/Alert';
import AlertDescription  from '@mui/material/Alert';
import Progress from '@mui/material/LinearProgress';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Select from '@mui/material/Select';
import SelectContent from '@mui/material/Select';
import SelectItem from '@mui/material/Select';
import SelectTrigger from '@mui/material/Select';
import SelectValue  from '@mui/material/Select';

// Simuliamo la lettura da un file CSV più complesso
const questionsCSV = `
id,question,option1,option2,option3,correct,explanation,difficulty
1,"Quale forma è corretta?","Mi piace di più","Mi piace più","Mi piace molto più",0,"La forma corretta è 'Mi piace di più'. In italiano, con il verbo 'piacere' si usa 'di più' per fare comparazioni.",A2
2,"Come si dice correttamente?","Sono interessato in storia","Sono interessato a storia","Sono interessato della storia",1,"Si dice 'Sono interessato a storia'. Il verbo 'interessarsi' richiede la preposizione 'a'.",B1
3,"Quale frase è corretta?","Benché è difficile","Benché sia difficile","Benché era difficile",1,"La forma corretta è 'Benché sia difficile'. Dopo 'benché' si usa il congiuntivo.",B2
4,"Come si esprime correttamente il tempo?","Sono le otto della mattina","Sono le otto di mattina","Sono le otto a mattina",1,"Si dice 'Sono le otto di mattina'. In italiano, per esprimere l'ora si usa 'di' con 'mattina' e 'sera'.",A2
5,"Quale è la forma corretta del passato prossimo?","Mi ho laureato","Mi sono laureato","Ho laureato",1,"La forma corretta è 'Mi sono laureato'. Con i verbi riflessivi, si usa l'ausiliare 'essere' nel passato prossimo.",B1
6,"Come si esprime correttamente 'vestirse de'?","Vestirsi di","Vestirsi da","Vestirsi con",1,"Si dice 'Vestirsi da'. In italiano, per indicare un travestimento o un ruolo, si usa 'da'.",B1
7,"Quale preposizione si usa con 'diverso'?","Diverso di","Diverso a","Diverso da",2,"Si usa 'Diverso da'. In italiano, l'aggettivo 'diverso' richiede la preposizione 'da'.",A2
8,"Come si traduce correctamente 'Para mañana'?","Per domani","Entro domani","Dentro domani",1,"Si dice 'Entro domani'. 'Entro' si usa per indicare un limite di tempo.",B1
9,"Quale forma è corretta con 'qualsiasi'?","Qualsiasi cosa accade","Qualsiasi cosa accada","Qualsiasi cosa accadrebbe",1,"La forma corretta è 'Qualsiasi cosa accada'. Con 'qualsiasi' seguito da 'che' o 'cosa', si usa il congiuntivo.",B2
10,"Come si dice correttamente 'De pequeño'?","Di piccolo","Da piccolo","Come piccolo",1,"Si dice 'Da piccolo'. In italiano, per indicare un periodo passato della vita si usa 'da'.",A2
`;

const parseCSV = (csv) => {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.replace(/"/g, '')] = values[index].replace(/"/g, '');
      return obj;
    }, {});
  });
};

const allQuestions = parseCSV(questionsCSV);

const QuizItaliano = () => {
  const [name, setName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [difficulty, setDifficulty] = useState('A2');
  const [timer, setTimer] = useState(30);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    const filteredQuestions = allQuestions.filter(q => q.difficulty === difficulty);
    setQuestions(filteredQuestions);
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

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
    setTimer(30);
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = index;
    setUserAnswers(newUserAnswers);
    if (index === parseInt(questions[currentQuestion].correct)) {
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
          <Select onValueChange={setDifficulty} defaultValue={difficulty}>
            <SelectTrigger className="mb-4">
              <SelectValue placeholder="Seleziona il livello" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A2">A2</SelectItem>
              <SelectItem value="B1">B1</SelectItem>
              <SelectItem value="B2">B2</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleStart} className="w-full bg-blue-500 hover:bg-blue-700">
            Inizia il Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (quizFinished && !reviewMode) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
        <CardHeader className="text-2xl font-bold text-center text-blue-800">Quiz Completato!</CardHeader>
        <CardContent>
          <p className="text-lg text-center mb-4">
            Congratulazioni, {name}! Hai completato il quiz di livello {difficulty}.
          </p>
          <p className="text-xl font-bold text-center text-green-700">
            Punteggio: {score}/{questions.length}
          </p>
          <Progress value={(score / questions.length) * 100} className="mt-4" />
          <Button onClick={startReview} className="w-full mt-4 bg-blue-500 hover:bg-blue-700">
            Rivedi le risposte
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
        <CardContent>
          <p className="text-center text-blue-800">Caricamento delle domande...</p>
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
                ? index === parseInt(currentQuestionData.correct)
                  ? "success"
                  : userAnswers[currentQuestion] === index
                  ? "destructive"
                  : "outline"
                : selectedAnswer === index
                ? "default"
                : "outline"
            }
            disabled={reviewMode || showExplanation}
          >
            {(reviewMode || showExplanation) && index === parseInt(currentQuestionData.correct) && <CheckCircle className="mr-2 h-4 w-4" />}
            {(reviewMode || showExplanation) && userAnswers[currentQuestion] === index && index !== parseInt(currentQuestionData.correct) && <XCircle className="mr-2 h-4 w-4" />}
            {currentQuestionData[option]}
          </Button>
        ))}
        {(showExplanation || reviewMode) && (
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              {currentQuestionData.explanation}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="justify-between">
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
      </CardFooter>
    </Card>
  );
};

export default QuizItaliano;
