import React, { useState, FormEvent, ChangeEvent } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress
} from '@mui/material';
import { guardarUsuario, guardarRespuesta } from './firebaseFunctions';
import { Usuario, Respuesta } from './firebaseInterfaces';

const QuizComponent: React.FC = () => {
    const [nombreUsuario, setNombreUsuario] = useState<string>('');
    const [respuesta, setRespuesta] = useState<string>('');
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleUsuarioSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const usuarioData = await guardarUsuario(nombreUsuario);
            setUsuario(usuarioData);
            console.log(`Usuario guardado/encontrado:`, usuarioData);
        } catch (error) {
            console.error("Error al guardar/encontrar usuario:", error);
            setError("Error al procesar el usuario. Por favor, intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleRespuestaSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!usuario) {
            setError("Primero debes registrar o encontrar un usuario");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const respuestaData: Respuesta = {
                idUsuario: usuario.id,
                tipoPregunta: 'A', // Ejemplo
                idPregunta: 'preg1', // Ejemplo
                sRespuestas: [respuesta],
            };
            await guardarRespuesta(respuestaData);
            console.log("Respuesta guardada exitosamente");
            setRespuesta(''); // Limpiar el campo de respuesta
        } catch (error) {
            console.error("Error al guardar la respuesta:", error);
            setError("Error al guardar la respuesta. Por favor, intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            {!usuario ? (
                <form onSubmit={handleUsuarioSubmit}>
                    <TextField
                        fullWidth
                        value={nombreUsuario}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNombreUsuario(e.target.value)}
                        placeholder="Nombre de usuario"
                        margin="normal"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading || !nombreUsuario.trim()}
                    >
                        {loading ? <CircularProgress size={24} /> : "Registrar/Encontrar Usuario"}
                    </Button>
                </form>
            ) : (
                <Box>
                    <Typography variant="h6">Bienvenido, {usuario.nombreUsuario}</Typography>
                    <Typography variant="body2">ID: {usuario.id}</Typography>
                    <Typography variant="body2">Fecha de alta: {usuario.fechaAlta.toDate().toLocaleString()}</Typography>
                    <Typography variant="body2">Última entrada: {usuario.fechaUltimaEntrada.toDate().toLocaleString()}</Typography>

                    <form onSubmit={handleRespuestaSubmit}>
                        <TextField
                            fullWidth
                            value={respuesta}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setRespuesta(e.target.value)}
                            placeholder="Tu respuesta"
                            margin="normal"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="secondary"
                            fullWidth
                            disabled={loading || !respuesta.trim()}
                        >
                            {loading ? <CircularProgress size={24} /> : "Enviar respuesta"}
                        </Button>
                    </form>
                </Box>
            )}

            {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default QuizComponent;