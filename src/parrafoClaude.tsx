import React, { useState, useEffect } from 'react';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { Paragraph, ParagraphQuestion, QuizParams } from './MyTypes.js'
import { paragraphsCSV, paragraphsQuestionsCSV } from './questionParrafo.js'

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
  difficulty = 'B1'
}) => {      
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [questions, setQuestions] = useState<ParagraphQuestion[]>([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [useDropdown, setUseDropdown] = useState(onlyOptionQuestions);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const [endTime, setEndTime] = useState<number | undefined>(undefined);     

  
  useEffect(() => {
    // Seleccionar aleatoriamente los párrafos y quedarse con los numQuestions primeros
    const filteredParagraphs = PARAGRAPHS_DATA
      .sort(() => 0.5 - Math.random())
      .slice(0, numQuestions);
    setParagraphs(filteredParagraphs);
    // Obtener los IDs de los párrafos seleccionados
    const selectedParagraphIds = filteredParagraphs.map(p => p.id);

    // Filtrar las preguntas para quedarse solo con las que tienen un paragraphId de los seleccionados
    const filteredQuestions = QUESTIONS_DATA.filter(q => {
      return selectedParagraphIds.includes(q.paragraphId);
    });
    setQuestions(filteredQuestions);
  }, []);

  const currentParagraph = paragraphs[currentParagraphIndex];
  const currentQuestions = questions.filter(q => q.paragraphId === currentParagraph?.id);

  const handleInputChange = (id: number, value: string) => {
    setUserAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleVerify = () => {
    setShowResults(true);
  };

  const handleNextParagraph = () => {
    setCurrentParagraphIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= numQuestions) {
        setShowResults(true);
        return prev;  // Mantén el índice en su estado actual
      } else {
        setShowResults(false);
        setUserAnswers({});
        return nextIndex;
      }
    });    
  };

  const renderQuestion = (question: ParagraphQuestion) => {
    if (!question) return null;

    const isCorrect = showResults && userAnswers[question.id] === question.correct;
    const isIncorrect = showResults && userAnswers[question.id] && userAnswers[question.id] !== question.correct;

    return (
      <div className={`inline-block mx-1 p-1 border-2 ${isCorrect ? 'border-green-500 bg-green-200' : isIncorrect ? 'border-red-500 bg-red-200' : 'border-gray-300'}`}>
        {useDropdown ? (
          <Select
            value={userAnswers[question.id] || ''}
            onValueChange={(value) => handleInputChange(question.id, value)}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder={question.hint}>
                {userAnswers[question.id] || question.hint}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="mt-1 rounded-md bg-white shadow-lg z-50">
              <SelectGroup>
                {question.options.map((option, index) => (
                  <SelectItem key={index} value={option} className="px-4 py-2 hover:bg-gray-100">{option}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            value={userAnswers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.hint}
            className={`w-32 ${isCorrect ? 'border-green-500' : isIncorrect ? 'border-red-500' : ''}`}
          />
        )}
      </div>
    );
  };

  if (!currentParagraph) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Impara l'italiano</h1>
      <div className="mb-4">
        <label className="mr-2">
          <input
            type="checkbox"
            checked={useDropdown}
            onChange={() => setUseDropdown(!useDropdown)}
          />
          Usa menu a tendina
        </label>
      </div>
      <p className="mb-2">{currentParagraph.id} - {currentParagraph.generated}</p>
      <p className="mb-4">
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
        <Button onClick={handleVerify} className="mb-4">Verifica risposte</Button>
      )}
      {showResults && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Risultati:</h2>          
          {currentQuestions.map(question => (
            <div key={question.id} className="mb-2">
              <p className={userAnswers[question.id] === question.correct ? "text-green-600" : "text-red-600"}>
                {question.id}[{question.difficulty}]: {userAnswers[question.id] || 'Nessuna risposta'}
                {userAnswers[question.id] !== question.correct && ` (Corretto: ${question.correct})`}
              </p>
              {userAnswers[question.id] !== question.correct && (
                <p className="text-sm text-gray-600">{question.explanation}</p>
              )}
            </div>
          ))}
          <Button onClick={handleNextParagraph} className="mt-4">Prossimo paragrafo</Button>
          <Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700">
            Riprova con Nuove Domande
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItalianLearningApp;