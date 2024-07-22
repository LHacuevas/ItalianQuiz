import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';

interface GlobalKeyCaptureTextFieldProps {
  label: string;
  onInputChange: (letter: string) => void;
  disabled: boolean;
}

const GlobalKeyCaptureTextField: React.FC<GlobalKeyCaptureTextFieldProps> = ({
  label,
  onInputChange,
  disabled
}) => {
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (disabled) return;

      // Verificar si la tecla es una letra
      if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
        const letter = event.key.toLowerCase();
        setInput(letter);
        onInputChange(letter);
      }
    };

    // Agregar el evento de escucha a nivel de documento
    document.addEventListener('keydown', handleKeyPress);

    // Limpiar el evento de escucha cuando el componente se desmonte
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [disabled, onInputChange]);

  // Limpiar el input después de un breve momento
  useEffect(() => {
    if (input) {
      const timer = setTimeout(() => setInput(''), 300);
      return () => clearTimeout(timer);
    }
  }, [input]);

  return (
    <TextField
      label={label}
      value={input}
      InputProps={{
        readOnly: true,
      }}
      disabled={disabled}
      fullWidth
      margin="normal"
    />
  );
};

export default GlobalKeyCaptureTextField;
