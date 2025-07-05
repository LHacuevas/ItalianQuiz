import './App.css';
import React, { useState, useEffect } from 'react';
import PlacementTest from './PlacementTest';
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
  Box,
  CircularProgress // Ensured CircularProgress is imported
} from '@mui/material';
//import { quoteCSV } from './questionMotiva.js';
import ResponsiveCard from './components/ResponsiveCard';
//import QuizComponent from './firebaseReact';
import { fetchQuotes, guardarUsuario, actualizarNivelGlobalUsuario } from './firebase/firebaseFunctions'; // Import actualizarNivelGlobalUsuario
import { Usuario } from './firebase/firebaseInterfaces';

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, UserCredential, signOut, updateProfile } from 'firebase/auth'; // Added updateProfile
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Added serverTimestamp
import EstadisticasRespuestas from './components/estadisticas-respuestas-component';
import HangmanGame from './impiccato';
import DataLoadButton from './components/uploadCSVToFirestone';
import { RegQuote } from './MyTypes';
import ItalianErrorDetectionGame from './corrigeClaude';
import ItalianTypingTutor from './ItalianTypingTutor';
// Asumimos que tienes una forma de obtener la versión del Git
// Por ejemplo, podrías tenerla en una variable de entorno
const VERSION = process.env.REACT_APP_GIT_VERSION || 'v2.2';
const usaUserFirebase = process.env.REACT_APP_USE_USUARIO_FIREBASE === 'true';
const App: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUsuario, setAppUsuario] = useState<Usuario | null>(null);
  const [nomeSignUp, setNomeSignUp] = useState<string>(''); // Specific state for signup name input

  const [showPlacementTest, setShowPlacementTest] = useState<boolean>(false);
  const [userGlobalLevel, setUserGlobalLevel] = useState<string | null>(null);
  const [checkingLevel, setCheckingLevel] = useState<boolean>(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentAuthUser) => {
      setCheckingLevel(true);
      if (currentAuthUser) {
        setFirebaseUser(currentAuthUser);
        
        let userDisplayName = currentAuthUser.displayName || '';
        // If displayName is empty and nomeSignUp was just set (from a signup), use nomeSignUp
        if (!userDisplayName && nomeSignUp) {
            userDisplayName = nomeSignUp;
            // Optionally update Firebase Auth profile displayName here if desired
            // await updateProfile(currentAuthUser, { displayName: nomeSignUp });
        }
        const userEmail = currentAuthUser.email || '';
        
        if (process.env.REACT_APP_USE_DATABASE === 'true') {
          const fetchedUsuario = await guardarUsuario(userDisplayName || userEmail, userEmail, currentAuthUser.uid);
          setAppUsuario(fetchedUsuario);
          
          if (fetchedUsuario.livelloGlobal) {
            setUserGlobalLevel(fetchedUsuario.livelloGlobal);
            setShowPlacementTest(false);
          } else {
            const localLevel = localStorage.getItem('userGlobalLevel');
            if (localLevel) {
              setUserGlobalLevel(localLevel);
              setShowPlacementTest(false);
              // One-time migration: if local level exists and no Firestore level, update Firestore
              await actualizarNivelGlobalUsuario(currentAuthUser.uid, localLevel);
              // Refresh user data to include this migrated level
              const updatedUsuario = await guardarUsuario(userDisplayName || userEmail, userEmail, currentAuthUser.uid);
              setAppUsuario(updatedUsuario);
            } else {
              setShowPlacementTest(true);
            }
          }
        } else { // Not using database
          const localLevel = localStorage.getItem('userGlobalLevel');
          if (localLevel) {
            setUserGlobalLevel(localLevel);
            setShowPlacementTest(false);
          } else {
            setShowPlacementTest(true);
          }
          setAppUsuario({ 
            id: currentAuthUser.uid, 
            nombreUsuario: userDisplayName || userEmail, 
            email: userEmail, 
            livelloGlobal: localLevel,
            fechaAlta: null,
            fechaUltimaEntrada: null,
            puntiTotali: 0,
            storicoLivelli: [],
            dataUltimoTestDiLivellamento: null
          } as Usuario);
        }
        setNomeSignUp(''); // Clear signup name after use
      } else { // User is logged out
        setFirebaseUser(null);
        setAppUsuario(null);
        setShowPlacementTest(false);
        setUserGlobalLevel(null);
        setEmail(''); // Clear email and password fields on logout
        setPassword('');
        setNomeSignUp('');
      }
      setCheckingLevel(false);
    });
    return () => unsubscribe();
  }, [auth]); // Removed nomeSignUp from dependency array as it's cleared

  const handlePlacementTestComplete = async (level: string) => {
    setUserGlobalLevel(level);
    localStorage.setItem('userGlobalLevel', level); // Keep for client-side cache/offline
    setShowPlacementTest(false);

    if (process.env.REACT_APP_USE_DATABASE === 'true' && firebaseUser) {
      await actualizarNivelGlobalUsuario(firebaseUser.uid, level);
      const updatedUsuario = await guardarUsuario(appUsuario?.nombreUsuario || firebaseUser.displayName || firebaseUser.email || '', firebaseUser.email || undefined, firebaseUser.uid);
      setAppUsuario(updatedUsuario);
    }
  };

  const handleRetakePlacementTest = async () => {
    setUserGlobalLevel(null);
    localStorage.removeItem('userGlobalLevel');
    setShowPlacementTest(true);
    if (appUsuario && process.env.REACT_APP_USE_DATABASE === 'true') {
      // Update Firestore to reflect that the user is retaking the test
      const userRef = doc(db, "usuarios", appUsuario.id); // Use "usuarios"
      await setDoc(userRef, { 
        livelloGlobal: null, 
        dataUltimoTestDiLivellamento: serverTimestamp(),
        // Optionally, add a new entry to storicoLivelli indicating a test retake initiation
        // storicoLivelli: arrayUnion({ livello: 'RetakeInitiated', data: serverTimestamp() }) 
      }, { merge: true });
       // Refresh appUsuario state
      const updatedUsuario = await guardarUsuario(appUsuario.nombreUsuario, appUsuario.email ?? undefined, appUsuario.id);
      setAppUsuario(updatedUsuario);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            if (nomeSignUp) { // Use nomeSignUp from state for displayName
                await updateProfile(userCredential.user, { displayName: nomeSignUp });
            }
            // Firestore document creation is handled by onAuthStateChanged via guardarUsuario
            // It will use the (potentially updated) displayName.
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // No explicit setDoc here for 'users'; guardarUsuario in onAuthStateChanged handles 'usuarios'
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

/* const handlePhoneAuth = async () => {
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
*/
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
          {isSignUp && (
            <Input
              type="text"
              placeholder="Nome (opzionale)"
              value={nomeSignUp}
              onChange={(e) => setNomeSignUp(e.target.value)}
              fullWidth
              className="mb-4"
            />
          )}
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
      {checkingLevel ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
          <Typography sx={{ marginLeft: 2 }}>Caricamento utente e livello...</Typography>
        </Box>
      ) : firebaseUser || !usaUserFirebase ? (
        showPlacementTest ? (
          <PlacementTest 
            onTestComplete={handlePlacementTestComplete} 
            usuario={appUsuario} 
          />
        ) : (
          <ResponsiveCard className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100 text-sm sm:text-base">
            <CardHeader
              title={
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" component="div">
                    Quiz di Italiano {VERSION}
                  </Typography>
                  {usaUserFirebase && firebaseUser && <Button onClick={handleLogout} variant="contained" color="warning" size="small">Logout</Button>}
                </Box>
              }
              className="text-xl sm:text-2xl font-bold text-center text-blue-800 p-4"
            />
            <CardContent sx={{ padding: 0 }}>
              <AppIniziale 
                email={appUsuario?.email ?? firebaseUser?.email ?? ''} 
                userGlobalLevel={userGlobalLevel}
                onRetakePlacementTest={handleRetakePlacementTest}
                currentAppUsuario={appUsuario}
                firebaseUser={firebaseUser}
              />
            </CardContent>
          </ResponsiveCard>
        )
      ) : (
        renderAuthForm()
      )}
    </div>
  );
};

interface AppInizialeProps {
  email: string;
  userGlobalLevel: string | null;
  onRetakePlacementTest: () => void;
  currentAppUsuario: Usuario | null; 
  firebaseUser: User | null;
}

const AppIniziale: React.FC<AppInizialeProps> = ({ email, userGlobalLevel, onRetakePlacementTest, currentAppUsuario, firebaseUser }) => {
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

  const [usuarioActividad, setUsuarioActividad] = useState<Usuario | null>(null);

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

  const [componenteSelezionato, setComponenteSelezionato] = useState<string | null>(null);


  const [quote, setQuote] = useState<RegQuote | null>(null);
  const [loading, setLoading] = useState(true);

/* 
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
  }, []); */
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
  
  const handleStart = async (componente: string) => {
    let userForActivity: Usuario | null = currentAppUsuario;

    if (!userForActivity && process.env.REACT_APP_USE_DATABASE === 'true') {
      console.warn("Tentativo di avviare attività senza currentAppUsuario. Provo a recuperare/creare basandomi su 'nome'.");
      userForActivity = await guardarUsuario(nome, nome.includes('@') ? nome : firebaseUser?.email || undefined, firebaseUser?.uid);
    } else if (!userForActivity && process.env.REACT_APP_USE_DATABASE !== 'true') {
      userForActivity = {
        id: 'local_user_' + Date.now(),
        nombreUsuario: nome,
        email: (nome.includes('@') ? nome : ''),
        livelloGlobal: livello,
        fechaAlta: null,
        fechaUltimaEntrada: null,
        puntiTotali: 0,
        storicoLivelli: [],
        dataUltimoTestDiLivellamento: null
      } as Usuario;
    }
    
    if (!userForActivity && process.env.REACT_APP_USE_DATABASE === 'true') {
      console.error('Impossibile avviare l\'attività: utente non definito.');
      return;
    }
    setUsuarioActividad(userForActivity);
    setComponenteSelezionato(componente);
  };

  if (componenteSelezionato === 'quiz') {
    return <QuizItaliano numQuestions={ numDomande } name = { nome } onlyOptionQuestions = { soloOpzioni } difficulty = { livello } usuario = { usuarioActividad } />;
  }

  if (componenteSelezionato === 'learning') {
    return <ItalianLearningApp numQuestions={ numDomande } name = { nome } onlyOptionQuestions = { soloOpzioni } difficulty = { livello } usuario = { usuarioActividad } />;
  }
  if (componenteSelezionato === 'estad') {
    return <EstadisticasRespuestas idUsuario={usuarioActividad?.id??'sense'} />;
  }
  if (componenteSelezionato === 'impiccato') {
     return <HangmanGame usuario={usuarioActividad} />; 
  }
  if (componenteSelezionato === 'error') {
    return <ItalianErrorDetectionGame level={livello} />;
  }
  if (componenteSelezionato === 'typing') {
    return <ItalianTypingTutor />
  }
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
          // Disable if using Firebase and nombreUsuario is already set from there
          disabled = { !!(usaUserFirebase && currentAppUsuario?.nombreUsuario) } 
  />
  <FormControl className="mb-4 w-full" >
    <InputLabel>Livello per attività</InputLabel>
      < Select 
        value = { livello } 
        onChange = {(e) => setLivello(e.target.value)}
        disabled={!!userGlobalLevel} // Disable if global level is set
      >
        <MenuItem value="A2" > A2 </MenuItem>
          < MenuItem value = "B1" > B1 </MenuItem>
            < MenuItem value = "B2" > B2 </MenuItem>
            {/* Show global level as an option if it's different from standard ones, or if it's the one selected */}
            {userGlobalLevel && !["A2","B1","B2"].includes(userGlobalLevel) && 
              <MenuItem value={userGlobalLevel} >{userGlobalLevel} (Globale)</MenuItem>}
             {/* Ensure the current global level is always an option if set, even if it's A2,B1,B2 */}
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
className = "mb-4"
  />
  <Button onClick={ () => handleStart('quiz') } className = "w-full bg-blue-500 hover:bg-blue-700 text-white mb-2" >
    Quiz a Scelta Multipla
      </Button>
      < Button onClick = {() => handleStart('learning')} className = "w-full bg-green-500 hover:bg-green-700 text-white" >
        Completamento del Testo
        </Button>
        < Button onClick={() => handleStart('impiccato')} className="w-full bg-green-500 hover:bg-green-700 text-white" >
          Gioco dell'Impiccato
        </Button>
        < Button onClick={() => handleStart('error')} className="w-full bg-green-500 hover:bg-green-700 text-white" >
          Error detection
        </Button>
        < Button onClick={() => handleStart('typing')} className="w-full bg-green-500 hover:bg-green-700 text-white" >
          Dattilografia
        </Button>
        < Button onClick={() => handleStart('estad')} className="w-full bg-purple-500 hover:bg-purple-700 text-white mb-2" >
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

export default App;
