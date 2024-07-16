//import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import QuizItaliano from './QuizItalianoGPT.tsx';
import ItalianLearningApp from './parrafoClaude.tsx';
import { Card, CardContent, Input, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox, Button } from '@mui/material';
function App() {
  return (    
   <AppIniziale/>     
  );
}

const AppIniziale = () => {
  const [nome, setNome] = useState(() => {
    return localStorage.getItem('nome') || 'EOI alumne';
  });

  const [soloOpzioni, setSoloOpzioni] = useState(() => {
    return JSON.parse(localStorage.getItem('soloOpzioni')) || false;
  });

  const [numDomande, setNumDomande] = useState(() => {
    return localStorage.getItem('numDomande') || 3;
  });

  const [livello, setLivello] = useState(() => {
    return localStorage.getItem('livello') || 'B1';
  });

  useEffect(() => {
    localStorage.setItem('nome', nome);
  }, [nome]);

  useEffect(() => {
    localStorage.setItem('soloOpzioni', JSON.stringify(soloOpzioni));
  }, [soloOpzioni]);

  useEffect(() => {
    localStorage.setItem('numDomande', numDomande);
  }, [numDomande]);

  useEffect(() => {
    localStorage.setItem('livello', livello);
  }, [livello]);

  const [componenteSelezionato, setComponenteSelezionato] = useState(null);

  //const [name, setName] = useState<string>(() => {
  // Inicializa el estado con el valor almacenado en localStorage, si existe
  //    return localStorage.getItem('name') || initialName;
  //});
  //const [localdifficulty, setDifficulty] = useState<string>(() => {
  // Inicializa el estado con el valor almacenado en localStorage, si existe
  //return localStorage.getItem('difficulty') || difficulty;
  //});
  const handleStart = (componente) => {
    setComponenteSelezionato(componente);
  };

  if (componenteSelezionato === 'quiz') {
    return <QuizItaliano numQuestions={numDomande} name={nome} onlyOptionQuestions={soloOpzioni} difficulty={livello} />;
  }

  if (componenteSelezionato === 'learning') {
    return <ItalianLearningApp numQuestions={numDomande} name={nome} onlyOptionQuestions={soloOpzioni} difficulty={livello} />;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100">
        <div className="text-2xl font-bold text-center text-blue-800 p-4">Quiz di Italiano v.1.0</div>
        <CardContent>
          <img src={`${process.env.PUBLIC_URL}/logo.jpg`} alt="Logo" className="mb-4 w-32 h-32 mx-auto" />
          <Input
            type="text"
            placeholder="Inserisci il tuo nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mb-4 w-full"
          />
          <FormControl className="mb-4 w-full">
            <InputLabel>Seleziona il livello</InputLabel>
            <Select value={livello} onChange={(e) => setLivello(e.target.value)}>
              <MenuItem value="A2">A2</MenuItem>
              <MenuItem value="B1">B1</MenuItem>
              <MenuItem value="B2">B2</MenuItem>
            </Select>
          </FormControl>
          <FormControl className="mb-4 w-full">
            <InputLabel>Numero di domande</InputLabel>
            <Select value={numDomande} onChange={(e) => setNumDomande(e.target.value)}>
              {[3, 5, 10, 15, 20].map(num => (
                <MenuItem key={num} value={num}>{num}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={soloOpzioni}
                onChange={(e) => setSoloOpzioni(e.target.checked)}
                name="soloOpzioni"
                color="primary"
              />
            }
            label={
              <div className="flex items-center">
                Solo domande con opzioni
                <span className="ml-2 cursor-pointer" title="Non mostra domande di completamento">ℹ️</span>
              </div>
            }
            className="mb-4"
          />
          <Button onClick={() => handleStart('quiz')} className="w-full bg-blue-500 hover:bg-blue-700 text-white mb-2">
            Inizia il Quiz
          </Button>
          <Button onClick={() => handleStart('learning')} className="w-full bg-green-500 hover:bg-green-700 text-white">
            Apri App di Apprendimento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
