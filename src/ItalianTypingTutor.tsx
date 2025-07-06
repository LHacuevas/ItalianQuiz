import React, { useState, useEffect, useRef } from 'react';
import { Input, Button } from "@mui/material"
import { Card, CardContent, CardHeader, Typography  } from "@mui/material"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"
import { RegTyping } from './MyTypes';
import { fetchTyping, saveGameSessionResult } from './firebase/firebaseFunctions'; // Importato saveGameSessionResult
import { Usuario, GameSessionResult } from './firebase/firebaseInterfaces'; // Importato Usuario e GameSessionResult
//import italianPhrases from '@/italian_phrases.json'

type Lesson = {
  theme: string;
  level: string;
  text: string;
};

type Result = {
  theme: string;
  level: string;
  wpm: number;
  accuracy: number;
  realAccuracy: number;
};

interface ItalianTypingTutorProps {
  onExit?: () => void;
  usuario?: Usuario | null;
  saveResults?: boolean;
  includePreviouslyAnswered?: boolean; // Generalmente non applicabile al typing tutor in termini di "testi già digitati"
}

export default function ItalianTypingTutor({ onExit, usuario, saveResults, includePreviouslyAnswered }: ItalianTypingTutorProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [realAccuracy, setRealAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [keystrokes, setKeystrokes] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [phrases, setPhrases] = useState<RegTyping[]>([]);
  useEffect(() => {
    const loadWords = async () => {
        
        try {
            
            const fetchedPhrases = await fetchTyping();  
            setPhrases(fetchedPhrases);          
        } catch (err) {                            
            console.error('Error fetching typing:', err);
        } finally {
            
        }
    };

    loadWords();
}, []);
  useEffect(() => {
    // Cargar y mezclar las lecciones al inicio
    const shuffledLessons = [...phrases].sort(() => Math.random() - 0.5);
    setLessons(shuffledLessons);
  }, [phrases]);

  useEffect(() => {
    if (input.length === 1) {
      setStartTime(Date.now());
    }
    if (input.length > 0) {
      const words = input.trim().split(' ').length;
      const minutes = (Date.now() - (startTime || Date.now())) / 60000;
      setWpm(Math.round(words / minutes));

      const errors = input.split('').reduce((acc, char, i) => 
        lessons[currentLessonIndex]?.text[i] !== char ? acc + 1 : acc, 0);
      setAccuracy(Math.round(((input.length - errors) / input.length) * 100));
      setRealAccuracy(Math.round(((input.length - errors) / keystrokes) * 100));

      if (input === lessons[currentLessonIndex]?.text) {
        setIsCompleted(true);
        setResults(prev => [...prev, {
          theme: lessons[currentLessonIndex].theme,
          level: lessons[currentLessonIndex].level,
          wpm,
          accuracy,
          realAccuracy
        }]);
      }
    }
  }, [input, startTime, currentLessonIndex, keystrokes, lessons]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setKeystrokes(prev => prev + 1);
  };

  const getCharClass = (index: number) => {
    if (index >= input.length) return "text-gray-400";
    return input[index] === lessons[currentLessonIndex]?.text[index] ? "text-green-500" : "text-red-500";
  };

  const nextLesson = () => {
    setCurrentLessonIndex((prev) => (prev + 1) % lessons.length);
    resetLesson();
  };

  const repeatLesson = () => {
    resetLesson();
  };

  const resetLesson = () => {
    setInput('');
    setIsCompleted(false);
    setWpm(0);
    setAccuracy(100);
    setRealAccuracy(100);
    setStartTime(null);
    setKeystrokes(0);
  };

  const finishExercise = () => {
    if (results.length > 0) {
      saveTypingSessionResults(); // Salva prima di mostrare i risultati
    }
    setShowResults(true);
  };

  const restartExercise = () => {
    const shuffledLessons = [...lessons].sort(() => Math.random() - 0.5);
    setLessons(shuffledLessons);
    setCurrentLessonIndex(0);
    setResults([]);
    setShowResults(false);
    resetLesson();
  };

  const saveTypingSessionResults = () => {
    if (!saveResults) {
        console.log("Salvataggio sessione Dattilografia saltato per scelta dell'utente.");
        return;
    }
    if (!usuario || !usuario.id || results.length === 0) {
      console.log("Salvataggio sessione Dattilografia: Utente non loggato o nessun risultato da salvare.");
      return;
    }

    const averageWpm = results.reduce((acc, r) => acc + r.wpm, 0) / results.length;
    const averageAccuracy = results.reduce((acc, r) => acc + r.accuracy, 0) / results.length;
    const averageRealAccuracy = results.reduce((acc, r) => acc + r.realAccuracy, 0) / results.length;
    // Il livello e il tema potrebbero variare se le lezioni sono miste.
    // Per semplicità, prendiamo il tema e il livello della prima lezione completata o dell'ultima.
    // Oppure si potrebbe decidere di non salvare un tema/livello specifico per la sessione aggregata.
    const representativeTheme = results[0]?.theme || 'Misto';
    const representativeLevel = results[0]?.level || 'Misto';


    const gameSession: GameSessionResult = {
      userId: usuario.id,
      gameType: 'TypingTutor',
      timestamp: new Date(), // Sarà sovrascritto dal serverTimestamp
      difficulty: representativeLevel, // O un modo per determinare il livello generale
      itemsPlayed: results.length, // Numero di frasi completate
      gameSpecificDetails: {
        wpm: Math.round(averageWpm),
        accuracy: Math.round(averageAccuracy),
        realAccuracy: Math.round(averageRealAccuracy),
        theme: representativeTheme,
        // Potremmo anche salvare tutti i risultati individuali se necessario
        // individualResults: results
      }
    };
    saveGameSessionResult(gameSession);
    console.log("Risultati sessione Dattilografia inviati a Firebase:", gameSession);
  };

  const handleExitRequest = () => {
    // Salva solo se ci sono risultati E non sono ancora stati mostrati/salvati tramite finishExercise
    if (results.length > 0 && !showResults) {
      saveTypingSessionResults();
    }
    if (onExit) {
      onExit();
    }
  };

  if (showResults) {
    // I risultati sono già stati salvati da finishExercise, quindi non serve salvarli di nuovo qui.
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader title="Risultati dell'Esercizio" />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tema</TableCell>
                <TableCell>Livello</TableCell>
                <TableCell>Velocità (ppm)</TableCell>
                <TableCell>Precisione (%)</TableCell>
                <TableCell>Precisione Reale (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.theme}</TableCell>
                  <TableCell>{result.level}</TableCell>
                  <TableCell>{result.wpm}</TableCell>
                  <TableCell>{result.accuracy}</TableCell>
                  <TableCell>{result.realAccuracy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={restartExercise} className="mt-4" sx={{ mr: 1 }}>Ricomincia Esercizio</Button>
          {onExit && (
            <Button onClick={handleExitRequest} className="mt-4" variant="contained" color="secondary">
              Torna al Menu Principale
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader
        title={
          <Typography variant="h6">
            Dattilografia Italiano - {lessons[currentLessonIndex]?.theme} (Nivel {lessons[currentLessonIndex]?.level})
          </Typography>
        }
        action={
          onExit && !isCompleted && (
            <Button onClick={handleExitRequest} variant="outlined" size="small">
              Esci
            </Button>
          )
        }
      />      
      <CardContent>
        <div className="mb-4 text-lg leading-relaxed whitespace-pre-wrap">
          {lessons[currentLessonIndex]?.text.split('').map((char, index) => (
            <span key={index} className={getCharClass(index)}>{char}</span>
          ))}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
          disabled={isCompleted}
          autoFocus
        />
        <div className="flex justify-between text-sm mb-4">
          <span>Velocità: {wpm} ppm</span>
          <span>Precisione: {accuracy}%</span>
          <span>Precisione Reale: {realAccuracy}%</span>
        </div>
        {isCompleted && (
          <div className="text-center space-y-2">
            <p className="mb-2 text-green-500 font-bold">Frase completata!</p>
            <div className="space-x-2">
              <Button onClick={repeatLesson}>Ripeti frase</Button>
              <Button onClick={nextLesson}>Lezione successiva</Button>
              <Button onClick={finishExercise} sx={{ mr: 1 }}>Termina esercizio e Vedi Risultati</Button>
              {onExit && (
                <Button onClick={onExit} variant="contained" color="secondary" size="small">
                  Torna al Menu
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

