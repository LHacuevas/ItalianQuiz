import React from 'react';
import PlacementTest from '../PlacementTest';
import useStore from '../store';

interface PlacementTestPageProps {
  onTestComplete: (level: string) => void;
}

const PlacementTestPage: React.FC<PlacementTestPageProps> = ({ onTestComplete }) => {
  const { appUsuario } = useStore();
  return (
    <PlacementTest
      onTestComplete={onTestComplete}
      usuario={appUsuario}
    />
  );
};

export default PlacementTestPage;
