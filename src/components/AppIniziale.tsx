import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Input,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from '@mui/material';
import { User } from 'firebase/auth';
import { Usuario } from '../firebase/firebaseInterfaces';
import { fetchQuotes, guardarUsuario } from '../firebase/firebaseFunctions';
import { RegQuote } from '../MyTypes';
import DataLoadButton from './uploadCSVToFirestone';

const usaUserFirebase = process.env.REACT_APP_USE_USUARIO_FIREBASE === 'true';

interface AppInizialeProps {
  email: string;
  userGlobalLevel: string | null;
  onRetakePlacementTest: () => void;
  currentAppUsuario: Usuario | null;
  firebaseUser: User | null;
}

const AppIniziale: React.FC<AppInizialeProps> = ({ email, userGlobalLevel, onRetakePlacementTest, currentAppUsuario, firebaseUser }) => {
  const navigate = useNavigate();
  const [nome, setNome] = useState<string>(() => {
    return currentAppUsuario?.nombreUsuario || currentAppUsuario?.email || email || '';
  });

  const [soloOpzioni, setSoloOpzioni] = useState<boolean>(() => {
    const item = localStorage.getItem('soloOpzioni');
    return item ? JSON.parse(item) : false;
  });

  const [numDomande, setNumDomande] = useState<number>(() => {
    const item = localStorage.getItem('numDomande');
    return item ? parseInt(item, 10) : 3;
  });

  const [livello, setLivello] = useState<string>(() => {
    return userGlobalLevel || localStorage.getItem('livello') || 'B1';
  });

  // Nuovi stati per le opzioni globali
  const [saveResultsGlobally, setSaveResultsGlobally] = useState<boolean>(() => {
    const item = localStorage.getItem('saveResultsGlobally');
    return item ? JSON.parse(item) : true; // Default a true
  });

  const [includeAnsweredQuestions, setIncludeAnsweredQuestions] = useState<boolean>(() => {
    const item = localStorage.getItem('includeAnsweredQuestions');
    return item ? JSON.parse(item) : false; // Default a false
  });

  useEffect(() => {
    if (userGlobalLevel) {
      setLivello(userGlobalLevel);
    }
  }, [userGlobalLevel]);

  useEffect(() => {
    if (currentAppUsuario) {
      setNome(currentAppUsuario.nombreUsuario || currentAppUsuario.email || '');
    } else {
      // Fallback if currentAppUsuario is null (e.g. offline mode or initial load before appUsuario is set)
      const storedName = localStorage.getItem('nome');
      if (storedName) setNome(storedName);
      else setNome(email); // email from props as last resort
    }
  }, [currentAppUsuario, email]);

  useEffect(() => {
    localStorage.setItem('nome', nome);
  }, [nome]);

  useEffect(() => {
    localStorage.setItem('soloOpzioni', JSON.stringify(soloOpzioni));
  }, [soloOpzioni]);

  useEffect(() => {
    localStorage.setItem('numDomande', numDomande.toString());
  }, [numDomande]);

  useEffect(() => {
    // Save current 'livello' selection to localStorage
    localStorage.setItem('livello', livello);
  }, [livello]);

  // useEffect per salvare i nuovi stati in localStorage
  useEffect(() => {
    localStorage.setItem('saveResultsGlobally', JSON.stringify(saveResultsGlobally));
  }, [saveResultsGlobally]);

  useEffect(() => {
    localStorage.setItem('includeAnsweredQuestions', JSON.stringify(includeAnsweredQuestions));
  }, [includeAnsweredQuestions]);

  const [quote, setQuote] = useState<RegQuote | null>(null);
  const [loading, setLoading] = useState(true);

  const getRandomQuote = async () => {
    setLoading(true);
    try {
      const quotes = await fetchQuotes();
      if (quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setQuote(quotes[randomIndex]);
      } else {
        setQuote({ id: '0', text: 'No hay citas disponibles', author: 'Sistema' });
      }
    } catch (error) {
      console.error('Error al obtener la cita:', error);
      setQuote({ id:'0', text: 'Error al cargar la cita', author: 'Desconocido' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRandomQuote();
  }, []);

  const handleStart = (path: string) => {
    navigate(path);
  };

  return (
    <Card className= "w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100" >
    <CardContent>
    <img src={ `${process.env.PUBLIC_URL}/logo.jpg` } alt = "Logo" className = "mb-4 w-32 h-32 mx-auto" />
      <div className="text-center text-gray-600 mb-4" >
        <p className="italic mb-2 text-base" > "{quote?.text}" </p>
          < p className = "font-bold text-base text-gray-500" > { quote?.author } </p>
            </div>
            < Input
  type = "text"
  placeholder = "Il tuo nome"
  value = { nome }
  onChange = {(e) => setNome(e.target.value)}
          className="mb-4 w-full"
          disabled = { !!(usaUserFirebase && currentAppUsuario?.nombreUsuario) }
  />
  <FormControl className="mb-4 w-full" >
    <InputLabel>Livello per attività</InputLabel>
      < Select
        value = { livello }
        onChange = {(e) => setLivello(e.target.value)}
        disabled={!!userGlobalLevel}
      >
        <MenuItem value="A2" > A2 </MenuItem>
          < MenuItem value = "B1" > B1 </MenuItem>
            < MenuItem value = "B2" > B2 </MenuItem>
            {userGlobalLevel && !["A2","B1","B2"].includes(userGlobalLevel) &&
              <MenuItem value={userGlobalLevel} >{userGlobalLevel} (Globale)</MenuItem>}
            {userGlobalLevel && ["A2","B1","B2"].includes(userGlobalLevel) && !(<MenuItem value={userGlobalLevel}>{userGlobalLevel}</MenuItem>).props.children &&
              <MenuItem value={userGlobalLevel} >{userGlobalLevel} (Globale)</MenuItem>
            }
      </Select>
      {userGlobalLevel && (
        <Typography variant="caption" display="block" sx={{ marginTop: '4px', marginLeft: '14px', color: 'text.secondary' }}>
          Livello globale attivo: {userGlobalLevel}. Ripeti il test di piazzamento per cambiarlo.
        </Typography>
      )}
    </FormControl>
    < FormControl className = "mb-4 w-full" >
                <InputLabel>Numero di domande </InputLabel>
                  < Select value = { numDomande } onChange = {(e) => setNumDomande(Number(e.target.value))}>
                  {
                    [3, 5, 10, 15, 20].map((num) => (
                      <MenuItem key= { num } value = { num } >
                      { num }
                      </MenuItem>
                    ))
                  }
                    </Select>
                    </FormControl>
                    < FormControlLabel
control = {
            < Checkbox checked = { soloOpzioni } onChange = {(e) => setSoloOpzioni(e.target.checked)} name = "soloOpzioni" color = "primary" />
          }
label = {
            < div className = "flex items-center" >
  Usa solo menu a tendina
    < span className = "ml-2 cursor-pointer" title = "Non mostra domande di completamento, a la scelta multipla" >
      ℹ️
      </span>
      </div>
          }
className = "mb-2"
  />
   <FormControlLabel
            control={
              <Checkbox
                checked={saveResultsGlobally}
                onChange={(e) => setSaveResultsGlobally(e.target.checked)}
                name="saveResultsGlobally"
                color="primary"
              />
            }
            label={
              <div className="flex items-center">
                Salva risultati sessione
                <span className="ml-2 cursor-pointer" title="Se deselezionato, i risultati di questa sessione non verranno salvati su Firebase.">
                  ℹ️
                </span>
              </div>
            }
            className="mb-2"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeAnsweredQuestions}
                onChange={(e) => setIncludeAnsweredQuestions(e.target.checked)}
                name="includeAnsweredQuestions"
                color="primary"
              />
            }
            label={
              <div className="flex items-center">
                Includi domande già risposte
                <span className="ml-2 cursor-pointer" title="Se selezionato, le domande a cui hai già risposto in passato potrebbero riapparire.">
                  ℹ️
                </span>
              </div>
            }
            className="mb-4"
          />
  <Button onClick={ () => handleStart('/app/quiz') } className = "w-full bg-blue-500 hover:bg-blue-700 text-white mb-2" >
    Quiz a Scelta Multipla
      </Button>
      < Button onClick = {() => handleStart('/app/learning')} className = "w-full bg-green-500 hover:bg-green-700 text-white" >
        Completamento del Testo
        </Button>
        < Button onClick={() => handleStart('/app/hangman')} className="w-full bg-green-500 hover:bg-green-700 text-white" >
          Gioco dell'Impiccato
        </Button>
        < Button onClick={() => handleStart('/app/error-detection')} className="w-full bg-green-500 hover:bg-green-700 text-white" >
          Error detection
        </Button>
        < Button onClick={() => handleStart('/app/typing-tutor')} className="w-full bg-green-500 hover:bg-green-700 text-white" >
          Dattilografia
        </Button>
        < Button onClick={() => handleStart('/app/stats')} className="w-full bg-purple-500 hover:bg-purple-700 text-white mb-2" >
          Statistiche
        </Button>
        <Button onClick={onRetakePlacementTest} className="w-full bg-orange-500 hover:bg-orange-700 text-white mb-2">
          Ripeti Test di Piazzamento
        </Button>

        <DataLoadButton usuario={currentAppUsuario?.id || 'local_user_dataload'} />
          </CardContent>
          </Card>
  );
};

export default AppIniziale;
