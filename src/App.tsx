import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Box, CircularProgress, Typography } from '@mui/material';

import { guardarUsuario, actualizarNivelGlobalUsuario } from './firebase/firebaseFunctions';

import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import PlacementTestPage from './pages/PlacementTestPage';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import LearningPage from './pages/LearningPage';
import HangmanPage from './pages/HangmanPage';
import ErrorDetectionPage from './pages/ErrorDetectionPage';
import TypingTutorPage from './pages/TypingTutorPage';
import EstadisticasRespuestas from './components/estadisticas-respuestas-component';

import useStore from './store';

const usaUserFirebase = process.env.REACT_APP_USE_USUARIO_FIREBASE === 'true';

const App: React.FC = () => {
  const {
    firebaseUser,
    appUsuario,
    userGlobalLevel,
    checkingLevel,
    setFirebaseUser,
    setAppUsuario,
    setUserGlobalLevel,
    setCheckingLevel,
  } = useStore();

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    document.title = `Quiz di Italiano ${process.env.REACT_APP_GIT_VERSION}`;
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentAuthUser) => {
      setCheckingLevel(true);
      if (currentAuthUser) {
        setFirebaseUser(currentAuthUser);
        const userEmail = currentAuthUser.email || '';

        if (process.env.REACT_APP_USE_DATABASE === 'true') {
          const fetchedUsuario = await guardarUsuario(currentAuthUser.displayName || userEmail, userEmail, currentAuthUser.uid);
          setAppUsuario(fetchedUsuario);

          if (fetchedUsuario.livelloGlobal) {
            setUserGlobalLevel(fetchedUsuario.livelloGlobal);
          } else {
            const localLevel = localStorage.getItem('userGlobalLevel');
            if (localLevel) {
              setUserGlobalLevel(localLevel);
              await actualizarNivelGlobalUsuario(currentAuthUser.uid, localLevel);
              const updatedUsuario = await guardarUsuario(currentAuthUser.displayName || userEmail, userEmail, currentAuthUser.uid);
              setAppUsuario(updatedUsuario);
            }
          }
        } else {
          const localLevel = localStorage.getItem('userGlobalLevel');
          if (localLevel) {
            setUserGlobalLevel(localLevel);
          }
          setAppUsuario({
            id: currentAuthUser.uid,
            nombreUsuario: currentAuthUser.displayName || userEmail,
            email: userEmail,
            livelloGlobal: localLevel,
            fechaAlta: null,
            fechaUltimaEntrada: null,
            puntiTotali: 0,
            storicoLivelli: [],
            dataUltimoTestDiLivellamento: null
          });
        }
      } else {
        setFirebaseUser(null);
        setAppUsuario(null);
        setUserGlobalLevel(null);
      }
      setCheckingLevel(false);
    });
    return () => unsubscribe();
  }, [auth, setAppUsuario, setCheckingLevel, setFirebaseUser, setUserGlobalLevel]);

  const handlePlacementTestComplete = async (level: string) => {
    setUserGlobalLevel(level);
    localStorage.setItem('userGlobalLevel', level);

    if (process.env.REACT_APP_USE_DATABASE === 'true' && firebaseUser) {
      await actualizarNivelGlobalUsuario(firebaseUser.uid, level);
      const updatedUsuario = await guardarUsuario(appUsuario?.nombreUsuario || firebaseUser.displayName || firebaseUser.email || '', firebaseUser.email || undefined, firebaseUser.uid);
      setAppUsuario(updatedUsuario);
    }
  };

  const handleRetakePlacementTest = async () => {
    setUserGlobalLevel(null);
    localStorage.removeItem('userGlobalLevel');
    if (appUsuario && process.env.REACT_APP_USE_DATABASE === 'true') {
      const userRef = doc(db, "usuarios", appUsuario.id);
      await setDoc(userRef, {
        livelloGlobal: null,
        dataUltimoTestDiLivellamento: serverTimestamp(),
      }, { merge: true });
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

  if (checkingLevel) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ marginLeft: 2 }}>Caricamento utente e livello...</Typography>
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={
            !usaUserFirebase || firebaseUser ? (
              userGlobalLevel ? (
                <Navigate to="/app" />
              ) : (
                <Navigate to="/placement-test" />
              )
            ) : (
              <Navigate to="/login" />
            )
          } />
          <Route path="login" element={<LoginPage />} />
          <Route path="placement-test" element={
            <PlacementTestPage
              onTestComplete={handlePlacementTestComplete}
              usuario={appUsuario}
            />
          } />
          <Route path="app">
            <Route index element={
              <HomePage
                email={appUsuario?.email ?? firebaseUser?.email ?? ''}
                userGlobalLevel={userGlobalLevel}
                onRetakePlacementTest={handleRetakePlacementTest}
                currentAppUsuario={appUsuario}
                firebaseUser={firebaseUser}
                handleLogout={handleLogout}
              />
            } />
            <Route path="quiz" element={<QuizPage
              numQuestions={3}
              name={appUsuario?.nombreUsuario || ''}
              onlyOptionQuestions={false}
              difficulty={'B1'}
              usuario={appUsuario}
              onExit={() => {}}
              saveResults={true}
              includePreviouslyAnswered={false}
            />} />
            <Route path="learning" element={<LearningPage
              numQuestions={3}
              name={appUsuario?.nombreUsuario || ''}
              onlyOptionQuestions={false}
              difficulty={'B1'}
              usuario={appUsuario}
              onExit={() => {}}
              saveResults={true}
              includePreviouslyAnswered={false}
            />} />
            <Route path="hangman" element={<HangmanPage
              usuario={appUsuario}
              onExit={() => {}}
              saveResults={true}
              includePreviouslyAnswered={false}
              difficulty={'B1'}
            />} />
            <Route path="error-detection" element={<ErrorDetectionPage
              level={'B1'}
              usuario={appUsuario}
              onExit={() => {}}
              saveResults={true}
              includePreviouslyAnswered={false}
            />} />
            <Route path="typing-tutor" element={<TypingTutorPage
              usuario={appUsuario}
              onExit={() => {}}
              saveResults={true}
            />} />
            <Route path="stats" element={<EstadisticasRespuestas idUsuario={appUsuario?.id ?? 'sense'} />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
