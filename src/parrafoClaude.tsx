import React, { useState, useEffect } from 'react';
//import Select from '@mui/material/Select';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';

// Define las interfaces para los datos de párrafos y preguntas
interface Paragraph {
  id: number;
  text: string;
}

interface Question {
  id: number;
  paragraphId: number;
  correct: string;
  options: string[];
  explanation: string;
}
// Datos de párrafos
const PARAGRAPHS_DATA: Paragraph[] = [
  { id: 1, text: "Ieri [1] al parco e [2] molti amici. [3] insieme e poi [4] un gelato. È stata una giornata [5]." },
  { id: 2, text: "Quando [1] in Italia, [2] subito la lingua. [3] molti corsi e [4] con i locals. Ora [5] l'italiano abbastanza bene." }
];

// Datos de preguntas
const QUESTIONS_DATA: Question[] = [
  { id: 1, paragraphId: 1, correct: "sono andato", options: ["sono andato", "ho andato", "andavo"], explanation: "Se usa 'sono andato' porque 'andare' es un verbo de movimiento que requiere el auxiliar 'essere' en el passato prossimo." },
  { id: 2, paragraphId: 1, correct: "ho incontrato", options: ["ho incontrato", "sono incontrato", "incontravo"], explanation: "'Incontrare' es un verbo transitivo que usa 'avere' como auxiliar en el passato prossimo." },
  { id: 3, paragraphId: 1, correct: "Abbiamo giocato", options: ["Abbiamo giocato", "Siamo giocati", "Giocavamo"], explanation: "'Giocare' es un verbo que usa 'avere' como auxiliar en el passato prossimo." },
  { id: 4, paragraphId: 1, correct: "abbiamo mangiato", options: ["abbiamo mangiato", "siamo mangiati", "mangiavamo"], explanation: "'Mangiare' es un verbo transitivo que usa 'avere' como auxiliar en el passato prossimo." },
  { id: 5, paragraphId: 1, correct: "meravigliosa", options: ["meravigliosa", "meraviglioso", "meravigliose"], explanation: "'Giornata' es un sustantivo femenino singular, por lo que el adjetivo debe concordar en género y número." },
  { id: 6, paragraphId: 2, correct: "sono arrivato", options: ["sono arrivato", "ho arrivato", "arrivavo"], explanation: "'Arrivare' es un verbo de movimiento que requiere el auxiliar 'essere' en el passato prossimo." },
  { id: 7, paragraphId: 2, correct: "ho iniziato a studiare", options: ["ho iniziato a studiare", "sono iniziato a studiare", "iniziavo a studiare"], explanation: "'Iniziare' es un verbo que usa 'avere' como auxiliar en el passato prossimo." },
  { id: 8, paragraphId: 2, correct: "Ho seguito", options: ["Ho seguito", "Sono seguito", "Seguivo"], explanation: "'Seguire' es un verbo transitivo que usa 'avere' como auxiliar en el passato prossimo." },
  { id: 9, paragraphId: 2, correct: "ho parlato", options: ["ho parlato", "sono parlato", "parlavo"], explanation: "'Parlare' es un verbo que usa 'avere' como auxiliar en el passato prossimo." },
  { id: 10, paragraphId: 2, correct: "parlo", options: ["parlo", "ho parlato", "parlavo"], explanation: "Se usa el presente 'parlo' para indicar una habilidad actual." }
];

const ItalianLearningApp = () => {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [useDropdown, setUseDropdown] = useState(true);

  useEffect(() => {
    setParagraphs(PARAGRAPHS_DATA);
    setQuestions(QUESTIONS_DATA);
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
    setCurrentParagraphIndex(prev => (prev + 1) % paragraphs.length);
    setUserAnswers({});
    setShowResults(false);
  };

  const renderQuestion = (question: Question) => {
    if (!question) return null;

    const isCorrect = showResults && userAnswers[question.id] === question.correct;
    const isIncorrect = showResults && userAnswers[question.id] && userAnswers[question.id] !== question.correct;
    
    return (
      <div className={`inline-block mx-1 ${isCorrect ? 'bg-green-200' : ''} ${isIncorrect ? 'bg-red-200' : ''}`}>
        {useDropdown ? (
          <Select 
            value={userAnswers[question.id] || ''}
            onValueChange={(e) => handleInputChange(question.id, e)}
            disabled={showResults}
          >
            <SelectTrigger className="w-[180px] bg-gray-200">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent className="mt-1 rounded-md bg-white shadow-lg z-50">
              <SelectGroup>
                {question.options.map((option, index) => (
                  <SelectItem key={index} value={option} className="px-4 py-2 hover:bg-gray-100 bg-gray-200">{option} </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            value={userAnswers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Escribe tu respuesta"
            disabled={showResults}
            className={`w-32 ${isCorrect ? 'border-green-500' : ''} ${isIncorrect ? 'border-red-500' : ''}`}
          />
        )}
      </div>
    );
  };

  if (!currentParagraph) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Aprende Italiano</h1>
      <div className="mb-4">
        <label className="mr-2">
          <input
            type="checkbox"
            checked={useDropdown}
            onChange={() => setUseDropdown(!useDropdown)}
          />
          Usar menú desplegable
        </label>
      </div>
      <p className="mb-4">
        {currentParagraph.text.split(/(\[\d+\])/).map((part, index) => {
          if (part.match(/\[\d+\]/)) {
            const match = part.match(/\d+/);
            const questionId = match ? parseInt(match[0]) : 0;
            //const questionId = parseInt(part.match(/\d+/)[0]);
            const question = currentQuestions.find(q => q.id === questionId);
            return question ? renderQuestion(question) : part;
          }
          return part;
        })}
      </p>
      {!showResults && (
        <Button onClick={handleVerify} className="mb-4">Verificar respuestas</Button>
      )}
      {showResults && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Resultados:</h2>
          {currentQuestions.map(question => (
            <div key={question.id} className="mb-2">
              <p className={userAnswers[question.id] === question.correct ? "text-green-600" : "text-red-600"}>
                {question.id}: {userAnswers[question.id] || 'Sin respuesta'} 
                {userAnswers[question.id] !== question.correct && ` (Correcto: ${question.correct})`}
              </p>
              {userAnswers[question.id] !== question.correct && (
                <p className="text-sm text-gray-600">{question.explanation}</p>
              )}
            </div>
          ))}
          <Button onClick={handleNextParagraph} className="mt-4">Siguiente párrafo</Button>
        </div>
      )}
    </div>
  );
};

export default ItalianLearningApp;
