Genera un CSV con 20 frasi in italiano per un gioco di rilevamento errori grammaticali. 
Ogni frase deve seguire questo formato:

id,nivel,fraseCompleta,idsPalabrasErroneas,palabrasErroneas, correcciones, explicacion,tema
Dove:
- ID: Un identificatore unico per la frase
- nivel: A2, B1, B2
- Frase completa: La frase in italiano con errori
- IDs di parole errate: Numeri separati da | indicando la posizione delle parole errate (iniziando da 1)
- Parole errate: Le parole incorrette separate da |
- Correzioni: Le versioni corrette delle parole errate, separate da |
- Spiegazioni: Brevi spiegazioni per ciascun errore, separate da |
- Tema: I temi grammaticale principale della frase (es. Verbi, Preposizioni, Pronomi, ecc.), separate da |

Esempio:
1,B1,"Tu hai detto che loro arriverebbero presto ma essi non sono ancora qui.",6|9,arriverebbero|essi,sarebbero arrivati|loro,"'Arriverebbero' dovrebbe essere 'sarebbero arrivati' (futuro nel passato).|'Essi' è formale e meno comune, 'loro' è sufficiente.",Verbi| Pronomi

Assicurati che le frasi e gli errori siano appropriati per ciascun livello di difficoltà e che ci sia una varietà di temi grammaticali."