import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Assicurati che il percorso sia corretto
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Risposta } from '../firebase/firebaseInterfaces';
import useStore from '../store';

const EstadisticasRespuestas: React.FC = () => {
    const [statistiche, setStatistiche] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { appUsuario } = useStore();
    const idUsuario = appUsuario?.id;


    useEffect(() => {
        const fetchStatistiche = async () => {
            if (!idUsuario) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const risposteRef = collection(db, 'risposte');
                const q = query(risposteRef, where('idUsuario', '==', idUsuario));
                const querySnapshot = await getDocs(q);
                const risposte = querySnapshot.docs.map(doc => doc.data() as Risposta);

                // Processa i dati per creare le statistiche
                const stats = processaRisposte(risposte);
                setStatistiche(stats);

            } catch (error) {
                console.error("Errore nel recupero delle statistiche: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistiche();
    }, [idUsuario]);

    const processaRisposte = (risposte: Risposta[]) => {
        const stats: { [key: string]: { corrette: number, totali: number } } = {};

        risposte.forEach(r => {
            const key = r.livello; // Aggrega per livello
            if (!stats[key]) {
                stats[key] = { corrette: 0, totali: 0 };
            }
            stats[key].totali++;
            if (r.corretta) {
                stats[key].corrette++;
            }
        });

        return Object.keys(stats).map(key => ({
            name: key,
            Corrette: stats[key].corrette,
            Totali: stats[key].totali,
            Percentuale: (stats[key].corrette / stats[key].totali) * 100,
        }));
    };

    const dataForChart = useMemo(() => {
        return statistiche.map(s => ({
            name: s.name,
            'Risposte Corrette': s.Corrette,
            'Risposte Totali': s.Totali,
        }));
    }, [statistiche]);

    if (loading) {
        return <div>Caricamento statistiche...</div>;
    }

    if (!idUsuario) {
        return <div>Per vedere le statistiche, devi essere loggato.</div>;
    }

    if (statistiche.length === 0) {
        return <div>Nessuna statistica disponibile.</div>;
    }

    return (
        <div style={{ width: '100%', height: 400 }}>
            <h2>Statistiche delle Risposte per Livello</h2>
            <ResponsiveContainer>
                <BarChart
                    data={dataForChart}
                    margin={{
                        top: 20, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Risposte Corrette" stackId="a" fill="#8884d8" />
                    <Bar dataKey="Risposte Totali" stackId="b" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EstadisticasRespuestas;
