import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Button, Card, CardContent, CardHeader, Select, MenuItem, FormControl, InputLabel, CardActions } from '@mui/material';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.js'; // Asegúrate de tener configurado Firebase correctamente
import { Respuesta } from '@/firebase/firebaseInterfaces.jsx';

interface EstadisticasRespuestasProps {
  idUsuario: string;
}

const EstadisticasRespuestas: React.FC<EstadisticasRespuestasProps> = ({ idUsuario }) => {
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [periodo, setPeriodo] = useState('giorno');
  const [tipoPregunta, setTipoPregunta] = useState('tutte');
  const [totalRegistros, setTotalRegistros] = useState(0);
  
  useEffect(() => {
    const fetchRespuestas = async () => {
      const respuestasRef = collection(db, 'respuestas');
      const q = query(respuestasRef, where('idUsuario', '==', idUsuario));
      const querySnapshot = await getDocs(q);
      const respuestasData = querySnapshot.docs.map(doc => doc.data() as Respuesta);
      setRespuestas(respuestasData);
      console.log("respuestas leidas: " + respuestasData.length);
    };

    fetchRespuestas();
  }, [idUsuario]);

  const agruparRespuestas = () => {
    const datosAgrupados: { [key: string]: { corrette: number, errate: number } } = {};

    respuestas.forEach(r => {
      if (tipoPregunta !== 'tutte' && r.tipoPregunta !== tipoPregunta) return;
      if (!r.fecha) return;
      const fechaRespuesta = new Date(r.fecha.toDate());
      let clave: string;
      clave = "";
      switch (periodo) {
        case 'giorno':
          clave = fechaRespuesta.toISOString().split('T')[0];
          break;
        case 'settimana':
          const inicioSemana = new Date(fechaRespuesta);
          inicioSemana.setDate(fechaRespuesta.getDate() - fechaRespuesta.getDay());
          clave = inicioSemana.toISOString().split('T')[0];
          break;
        case 'mese':
          clave = `${fechaRespuesta.getFullYear()}-${String(fechaRespuesta.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!datosAgrupados[clave]) {
        datosAgrupados[clave] = { corrette: 0, errate: 0 };
      }

      if (r.correcta) {
        datosAgrupados[clave].corrette++;
      } else {
        datosAgrupados[clave].errate++;
      }
    });

    return Object.entries(datosAgrupados).map(([data, dati]) => ({
      data,
      corrette: dati.corrette,
      errate: dati.errate
    }));
  };

  const datosGrafico = agruparRespuestas();  
  const tiposPregunta: string[] = ['tutte', ...new Set(respuestas.map(r => r.tipoPregunta))];
  //const tiposPregunta = ['tutte', 'PR', 'MR'];
  //const tiposPregunta = ['tutte', ...new Set(respuestas.map(r => r.tipoPregunta))];
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader
        title="Statistiche delle Risposte"
        action={<div>
          {/* Select per il periodo */}
          <FormControl sx={{ m: 1, minWidth: 140 }}>
            <InputLabel id="periodo-label">Periodo</InputLabel>
            <Select
              labelId="periodo-label"
              id="periodo-select"
              value={periodo}
              label="Periodo"
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <MenuItem value="giorno">Per giorno</MenuItem>
              <MenuItem value="settimana">Per settimana</MenuItem>
              <MenuItem value="mese">Per mese</MenuItem>
            </Select>
          </FormControl>

          {/* Select per il tipo di domanda */}
          <FormControl sx={{ m: 1, minWidth: 140 }}>
            <InputLabel id="tipo-domanda-label">Tipo di domanda</InputLabel>
            <Select
              labelId="tipo-domanda-label"
              id="tipo-domanda-select"
              value={tipoPregunta}
              label="Tipo di domanda"
              onChange={(e) => setTipoPregunta(e.target.value)}
            >
              {tiposPregunta.map(tipo => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>} />
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={datosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="corrette" fill="#4CAF50" name="Corrette">
              <LabelList dataKey="corrette" position="top" />
            </Bar>
            <Bar dataKey="errate" fill="#F44336" name="Errate">
              <LabelList dataKey="errate" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardActions>
        <Button onClick={() => window.location.reload()} className="w-full bg-blue-500 hover:bg-blue-700">
          Riprova con Nuove Domande
        </Button>
      </CardActions>
    </Card>
  );
};

export default EstadisticasRespuestas;


