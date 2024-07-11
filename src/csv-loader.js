import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const useQuestions = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/res/questions.csv');
        const csvText = await response.text();
        const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        setQuestions(result.data);
      } catch (error) {
        console.error('Errore nel caricamento delle domande:', error);
      }
    };

    loadQuestions();
  }, []);

  return questions;
};

// Nel tuo componente principale:
const QuizItaliano = () => {
  const allQuestions = useQuestions();
  // ... resto del codice ...
}
