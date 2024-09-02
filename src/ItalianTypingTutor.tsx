import React, { useState, useEffect, useRef } from 'react';
import { Input, Button } from "@mui/material"
import { Card, CardContent, CardHeader, Typography  } from "@mui/material"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"
import { RegTyping } from './MyTypes';
import { fetchTyping } from './firebase/firebaseFunctions';
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

export default function ItalianTypingTutor() {
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

  if (showResults) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader title="Risultati dell'Esercizio">
        </CardHeader>
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
          <Button onClick={restartExercise} className="mt-4">Ricomincia Esercizio</Button>
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
              <Button onClick={finishExercise}>Termina esercizio</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

