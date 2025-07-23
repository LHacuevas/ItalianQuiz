import React from 'react';
import AppIniziale from '../components/AppIniziale';
import { Card, CardContent, CardHeader, Typography, Box, Button } from '@mui/material';
import ResponsiveCard from '../components/ResponsiveCard';
import useStore from '../store';

const VERSION = process.env.REACT_APP_GIT_VERSION || 'v2.2';
const usaUserFirebase = process.env.REACT_APP_USE_USUARIO_FIREBASE === 'true';


interface HomePageProps {
  onRetakePlacementTest: () => void;
  handleLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = (props) => {
  const { firebaseUser, appUsuario, userGlobalLevel } = useStore();
  return (
    <ResponsiveCard className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-100 to-green-100 text-sm sm:text-base">
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="div">
              Quiz di Italiano {VERSION}
            </Typography>
            {usaUserFirebase && firebaseUser && <Button onClick={props.handleLogout} variant="contained" color="warning" size="small">Logout</Button>}
          </Box>
        }
        className="text-xl sm:text-2xl font-bold text-center text-blue-800 p-4"
      />
      <CardContent sx={{ padding: 0 }}>
        <AppIniziale
          email={appUsuario?.email ?? firebaseUser?.email ?? ''}
          userGlobalLevel={userGlobalLevel}
          onRetakePlacementTest={props.onRetakePlacementTest}
          currentAppUsuario={appUsuario}
          firebaseUser={firebaseUser}
        />
      </CardContent>
    </ResponsiveCard>
  );
};

export default HomePage;
