import React, { useState, useEffect, useCallback } from 'react';
import { fetchMultiRespuesta } from './firebase/firebaseFunctions';
import { Question } from './MyTypes'; 
import { Usuario } from './firebase/firebaseInterfaces';


import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

// Define the props for the component
interface PlacementTestProps {
  onTestComplete: (level: string) => void;
  usuario: Usuario | null; // Assuming Usuario type is imported
}

const TOTAL_QUESTIONS_PER_LEVEL = 7;
const PASS_THRESHOLD = 4; // Need to answer at least 4 questions correctly

const PlacementTest: React.FC<PlacementTestProps> = ({ onTestComplete, usuario }) => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionsForCurrentLevel, setQuestionsForCurrentLevel] = useState<Question[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string>("A2"); // A2, B1, B2
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]); // Stores answers for the current level's 7 questions
  // const [scoresByLevel, setScoresByLevel] = useState<Record<string, number>>({}); // This state is assigned but its value is never read.
  const [determinedLevel, setDeterminedLevel] = useState<string>("");
  const [testStage, setTestStage] = useState<string>("loading"); // loading, testing_A2, testing_B1, testing_B2, calculating, finished
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Helper function to shuffle an array (Fisher-Yates shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const selectQuestionsForLevel = useCallback((level: string, count: number): Question[] => {
    const filteredQuestions = allQuestions.filter(
      q => q.difficulty === level && q.correct !== '-1' // Ensure it's multiple choice
    );
    return shuffleArray(filteredQuestions).slice(0, count);
  }, [allQuestions]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setTestStage("loading");
        const fetchedQuestions = await fetchMultiRespuesta();
        if (fetchedQuestions.length === 0) {
          setLoadingError("Nessuna domanda caricata. Per favore, riprova più tardi.");
          setTestStage("error");
          return;
        }
        setAllQuestions(fetchedQuestions);
        setTestStage("testing_A2"); // Start with A2
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoadingError("Errore nel caricamento delle domande. Per favore, riprova più tardi.");
        setTestStage("error");
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    if (testStage.startsWith("testing_") && allQuestions.length > 0) {
      const level = testStage.split("_")[1]; // e.g., "A2" from "testing_A2"
      setCurrentLevel(level);
      const newQuestions = selectQuestionsForLevel(level, TOTAL_QUESTIONS_PER_LEVEL);
      if (newQuestions.length < TOTAL_QUESTIONS_PER_LEVEL) {
        // Not enough questions for this level, this is an issue with the data pool
        setLoadingError(`Non ci sono abbastanza domande per il livello ${level}. Contatta l'amministratore.`);
        setTestStage("error");
        return;
      }
      setQuestionsForCurrentLevel(newQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
    }
  }, [testStage, allQuestions, selectQuestionsForLevel]);


  const handleAnswer = (selectedOptionIndex: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedOptionIndex;
    setUserAnswers(newAnswers);
  };

  const calculateScore = (): number => {
    let score = 0;
    questionsForCurrentLevel.forEach((question, index) => {
      if (userAnswers[index] === question.correct) {
        score++;
      }
    });
    return score;
  };

  const determineNextStage = () => {
    const score = calculateScore();
    // setScoresByLevel(prevScores => ({ ...prevScores, [currentLevel]: score })); // This state is assigned but its value is never read.

    if (currentLevel === "A2") {
      if (score >= PASS_THRESHOLD) {
        setTestStage("testing_B1");
      } else {
        setDeterminedLevel("A2");
        setTestStage("calculating");
      }
    } else if (currentLevel === "B1") {
      if (score >= PASS_THRESHOLD) {
        setTestStage("testing_B2");
      } else {
        // Failed B1, so level is A2 (since they must have passed A2 to get here)
        setDeterminedLevel("A2");
        setTestStage("calculating");
      }
    } else if (currentLevel === "B2") {
      if (score >= PASS_THRESHOLD) {
        setDeterminedLevel("B2");
      } else {
        // Failed B2, so level is B1 (since they must have passed B1 to get here)
        setDeterminedLevel("B1");
      }
      setTestStage("calculating");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < TOTAL_QUESTIONS_PER_LEVEL - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Last question of the current level, determine next stage
      determineNextStage();
    }
  };
  
  useEffect(() => {
    if (testStage === "calculating") {
      // Simulate calculation time then move to finished
      setTimeout(() => {
        setTestStage("finished");
      }, 1500);
    }
  }, [testStage]);

  if (testStage === "loading") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography sx={{ marginLeft: 2 }}>Caricamento domande...</Typography>
      </Box>
    );
  }

  if (testStage === "error") {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">Errore</Typography>
          <Typography>{loadingError || "Si è verificato un errore sconosciuto."}</Typography>
          <Button onClick={() => onTestComplete("error")} variant="contained" color="primary" sx={{marginTop: 2}}>
            Torna alla Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (testStage === "finished") {
    return (
      <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom textAlign="center">Test Completato!</Typography>
          <Typography variant="h6" textAlign="center">
            Il tuo livello di partenza è: <strong>{determinedLevel || "Non determinato"}</strong>
          </Typography>
          <Box textAlign="center" mt={3}>
            <Button onClick={() => onTestComplete(determinedLevel || "A2")} variant="contained" color="primary">
              Continua
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  if (testStage === "calculating") {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography sx={{ marginLeft: 2 }}>Calcolo del livello...</Typography>
        </Box>
    );
  }

  const currentQuestionData = questionsForCurrentLevel[currentQuestionIndex];

  if (!currentQuestionData && testStage.startsWith("testing_")) {
    // This can happen briefly if questionsForCurrentLevel is not yet populated
    // or if there was an issue with question selection logic
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography sx={{ marginLeft: 2 }}>Preparazione domanda {currentLevel}...</Typography>
      </Box>
    );
  }
  
  // Ensure currentQuestionData is available before rendering the question
  if (!currentQuestionData) {
      // This case should ideally be handled by the loading/error states or the specific
      // "Preparazione domanda" state above if questions are still being set.
      // If it reaches here, it implies a state inconsistency.
      console.warn("currentQuestionData is undefined in render stage for testStage:", testStage);
      return (
          <Card>
              <CardContent>
                  <Typography>Si è verificato un problema nel caricare la domanda. Per favore, attendi o ricarica.</Typography>
              </CardContent>
          </Card>
      );
  }


  return (
    <Card sx={{ maxWidth: 700, margin: 'auto', mt: 4, p: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom textAlign="center">
          Test di Piazzamento
        </Typography>
        <Typography variant="subtitle1" textAlign="center" gutterBottom>
          Domanda {currentQuestionIndex + 1} di {TOTAL_QUESTIONS_PER_LEVEL} (Livello {currentLevel})
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" component="p" sx={{ mb: 2, textAlign: 'center' }}>
            {currentQuestionData.question}
          </Typography>
          <Stack spacing={1.5} alignItems="center">
            {[currentQuestionData.option1, currentQuestionData.option2, currentQuestionData.option3].map((option, index) => (
              option && ( // Ensure option is not empty or null
                <Button
                  key={index}
                  variant={userAnswers[currentQuestionIndex] === index.toString() ? "outlined" : "contained"}
                  onClick={() => handleAnswer(index.toString())}
                  sx={{ 
                    minWidth: '250px', 
                    maxWidth: '80%',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    padding: '10px 15px',
                    textAlign: 'left',
                    '&:hover': {
                        backgroundColor: userAnswers[currentQuestionIndex] === index.toString() ? 'primary.light' : 'primary.dark',
                    }
                  }}
                  fullWidth
                >
                  {option}
                </Button>
              )
            ))}
          </Stack>
        </Box>

        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextQuestion}
            disabled={userAnswers[currentQuestionIndex] === undefined}
          >
            {currentQuestionIndex < TOTAL_QUESTIONS_PER_LEVEL - 1 ? "Prossima Domanda" : "Fine Livello"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlacementTest;
