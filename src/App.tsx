import './App.css';
import React, { useState, useEffect } from 'react';
import QuizItaliano from './QuizItalianoGPT';
import ItalianLearningApp from './parrafoClaude2';
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
  CardHeader,
  Typography,
  Box
} from '@mui/material';
import { quoteCSV } from './questionMotiva.js';
import ResponsiveCard from './ResponsiveCard';
//import QuizComponent from './firebaseReact';
import { guardarUsuario } from './firebaseFunctions';
import { Usuario } from './firebaseInterfaces';

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier, User, UserCredential, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Asumimos que tienes una forma de obtener la versión del Git
// Por ejemplo, podrías tenerla en una variable de entorno
const VERSION = process.env.REACT_APP_GIT_VERSION || 'v2.1';

const App: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [nome, setNome] = useState<string>('');

  const auth = getAuth();
  const db = getFirestore();
 
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setNome(user.displayName || '');
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // El estado del usuario se actualizará automáticamente a través del listener onAuthStateChanged
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let userCredential: UserCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        nome: nome
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePhoneAuth = async () => {
    if (!auth) {
      console.error('Auth instance not available');
      return;
    }

    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {});
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log('SMS enviado', confirmationResult);
    } catch (error) {
      console.error('Error during phone authentication:', error);
    }
  };

  const renderAuthForm = () => (
    <ResponsiveCard className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100 text-sm sm:text-base">
      <CardHeader title="Autenticazione" className="text-xl sm:text-2xl font-bold text-center text-blue-800 p-4" />
      <CardContent>
        <form onSubmit={handleAuth}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            className="mb-4"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth className="mb-2">
            {isSignUp ? "Registrati" : "Accedi"}
          </Button>
          <Button onClick={() => setIsSignUp(!isSignUp)} variant="outlined" fullWidth>
            {isSignUp ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
          </Button>
        </form>
        {/* <div className="mt-4">
          <Input
            type="tel"
            placeholder="Número de teléfono"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            fullWidth
            className="mb-2"
          />
          <Button onClick={handlePhoneAuth} variant="contained" color="secondary" fullWidth>
            Autenticar con teléfono
          </Button>
        </div> */}
        <div id="recaptcha-container" className="mt-4"></div>
      </CardContent>
    </ResponsiveCard>
  );

  return (
    <div>
      {user ? (
        <ResponsiveCard className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100 text-sm sm:text-base">
          <CardHeader
            title={
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" component="div">
                  Quiz di Italiano {VERSION}
                </Typography>
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  color="secondary"
                  size="small"
                >
                  Logout
                </Button>
              </Box>
            }
            className="text-xl sm:text-2xl font-bold text-center text-blue-800 p-4"
          />
          <CardContent sx={{ padding: 0 }}>            
            <AppIniziale email={user?.email??''} />
          </CardContent>
        </ResponsiveCard>
      ) : (
        renderAuthForm()
      )}
    </div>
  );
};
// Modificamos AppIniziale para recibir email como prop
interface AppInizialeProps {
  email: string;  
}

const AppIniziale: React.FC<AppInizialeProps> = ({ email }) => {
  const [nome, setNome] = useState<string>(() => {
    return email;
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
    return localStorage.getItem('livello') || 'B1';
  });

  const [usuario, setUsuario] = useState<Usuario | null>(null);

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
    localStorage.setItem('livello', livello);
  }, [livello]);

  const [componenteSelezionato, setComponenteSelezionato] = useState<string | null>(null);

  const getRandomQuote = () => {
    const rows = quoteCSV.trim().split('\n').slice(1);
    const randomIndex = Math.floor(Math.random() * rows.length);
    const row = rows[randomIndex];

    // Usamos una expresión regular para dividir la fila correctamente
    const match = row.match(/^(\d+),(".*?"|[^,]*),(.*)$/);

    if (match) {
      const [, id, text, author] = match;
      // Eliminamos las comillas dobles del texto si existen
      const cleanText = text.replace(/^"|"$/g, '');
      return { text: cleanText, author };
    } else {
      // En caso de que la fila no coincida con el formato esperado
      return { text: 'Error al cargar la cita', author: 'Desconocido' };
    }
  };

  const [quote, setQuote] = useState<{ text: string; author: string }>(() => getRandomQuote());

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  const handleStart = async (componente: string) => {
    //Guardamos el usuario
    try {
      const usuarioData = await guardarUsuario(nome);
      setUsuario(usuarioData);
      console.log(`Usuario guardado/encontrado:`, usuarioData);
    
    if (!usuarioData) {
      console.error('Primero debes registrar o encontrar un usuario');
      return;
    }
    } catch (error) {
      console.error('Error al guardar/encontrar usuario:', error);
    }
    setComponenteSelezionato(componente);
  };

  if (componenteSelezionato === 'quiz') {
    return <QuizItaliano numQuestions={ numDomande } name = { nome } onlyOptionQuestions = { soloOpzioni } difficulty = { livello } usuario = { usuario } />;
  }

  if (componenteSelezionato === 'learning') {
    return <ItalianLearningApp numQuestions={ numDomande } name = { nome } onlyOptionQuestions = { soloOpzioni } difficulty = { livello } usuario = { usuario } />;
  }

  return (
    <Card className= "w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100" >
    <CardContent>
    <img src={ `${process.env.PUBLIC_URL}/logo.jpg` } alt = "Logo" className = "mb-4 w-32 h-32 mx-auto" />
      <div className="text-center text-gray-600 mb-4" >
        <p className="italic mb-2 text-base" > "{quote.text}" </p>
          < p className = "font-bold text-base text-gray-500" > { quote.author } </p>
            </div>
            < Input
  type = "text"
  placeholder = "Inserisci il tuo nome"
  value = { nome }
  onChange = {(e) => setNome(e.target.value)}
          className="mb-4 w-full"
          disabled = { email != "" }
  />
  <FormControl className="mb-4 w-full" >
    <InputLabel>Seleziona il livello </InputLabel>
      < Select value = { livello } onChange = {(e) => setLivello(e.target.value)}>
        <MenuItem value="A2" > A2 </MenuItem>
          < MenuItem value = "B1" > B1 </MenuItem>
            < MenuItem value = "B2" > B2 </MenuItem>
              </Select>
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
className = "mb-4"
  />
  <Button onClick={ () => handleStart('quiz') } className = "w-full bg-blue-500 hover:bg-blue-700 text-white mb-2" >
    Quiz a Scelta Multipla
      </Button>
      < Button onClick = {() => handleStart('learning')} className = "w-full bg-green-500 hover:bg-green-700 text-white" >
        Completamento del Testo
          </Button>
          </CardContent>
          </Card>
  );
};

export default App;
