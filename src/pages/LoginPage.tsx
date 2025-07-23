import React, { useState } from 'react';
import { Button, CardContent, CardHeader, Input } from '@mui/material';
import ResponsiveCard from '../components/ResponsiveCard';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [nomeSignUp, setNomeSignUp] = useState<string>('');
  const auth = getAuth();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            if (nomeSignUp) {
                await updateProfile(userCredential.user, { displayName: nomeSignUp });
            }
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  return (
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
        <div id="recaptcha-container" className="mt-4"></div>
      </CardContent>
    </ResponsiveCard>
  );
};

export default LoginPage;
