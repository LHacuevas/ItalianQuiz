export const corrigeCSV = `
id,nivel,fraseCompleta,idsPalabrasErroneas,palabrasErroneas,correcciones,explicacion,tema
1,A2,"Io ho mangiato una mela ieri mattina.",2|3,ho mangiato,ho mangiata,"El participio pasado debe concordar con el objeto directo femenino 'mela'.",Verbi
4,B1,"Tu hai detto che loro arriverebbero presto ma essi non sono ancora qui.",6|9,arriverebbero|essi,sarebbero arrivati|loro,"'Arriverebbero' dovrebbe essere 'sarebbero arrivati' (futuro nel passato).|'Essi' è formale e meno comune, 'loro' è sufficiente.",Verbi|Pronomi
6,B1,"Se avessi studiato di più, avresti passato l'esame.",8,avresti,saresti,"Con il periodo ipotetico, si usa 'saresti' invece di 'avresti' con 'passato'.",Verbi
9,A2,"Io sono andato al cinema con i miei amici sabato scorso.",2,sono andato,sono andata,"Se il soggetto è femminile, il participio passato deve concordare: 'andata'.",Verbi
10,B1,"Dopo che avrò finito i compiti, ti chiamerò.",4,avrò finito,avrò finito di fare,"Con 'finire', è più naturale usare 'avrò finito di fare' per indicare il completamento.",Verbi
11,B2,"Se non fosse stato per il tuo aiuto, non ce l'avrei mai fatta.",11,l'avrei,l'avrei fatta,"L'espressione corretta è 'ce l'avrei fatta', non si può omettere 'fatta'.",Espressioni idiomatiche
12,A2,"Loro vanno a scuola con il bus ogni giorno.",5,con il,in,"In italiano, si usa 'in bus' invece di 'con il bus'.",Preposizioni
15,A2,"Il gatto dorme sul il divano.",3|4,sul il,sul,"'Sul' è già la contrazione di 'su' + 'il', quindi non serve ripetere 'il'.",Preposizioni
19,B1,"Se l'avessi saputo prima, ti avrei avvertito.",7,avvertito,avvisato,"'Avvertire' significa più 'warn' in inglese. 'Avvisare' è più appropriato per 'let know'.",Vocabolario
21,A2,"Io ho fame e voglio mangio una pizza.",6,mangio,mangiare,"Dopo 'voglio' si usa l'infinito, non il presente indicativo.",Verbi
22,B1,"Se avrei tempo, andrei al cinema stasera.",2,avrei,avessi,"Nel periodo ipotetico della possibilità, si usa il congiuntivo imperfetto, non il condizionale.",Verbi
23,B2,"Nonostante che piove, usciremo per fare una passeggiata.",2|3,che piove,piova,"Con 'nonostante' si usa il congiuntivo senza 'che'.",Congiunzioni|Verbi
25,B1,"Ho visto Maria ieri e gli ho dato il tuo messaggio.",5,gli,le,"'Gli' è maschile, ma Maria è femminile, quindi si usa 'le'.",Pronomi
26,B2,"Benchè sia arrivato in ritardo, il professore le ha permesso di fare l'esame.",1,Benchè,Benché,"'Benché' si scrive con l'accento sulla 'e'.",Ortografia
28,B1,"Se l'avrei saputo prima, non sarei venuto alla festa.",2,l'avrei,l'avessi,"Nel periodo ipotetico dell'irrealtà al passato, si usa il congiuntivo trapassato.",Verbi
29,B2,"Mi sono accorto che avevo dimenticato il portafoglio solo dopo che sono uscito di casa.",14,sono uscito,ero uscito,"In questo contesto, si usa il trapassato prossimo per indicare un'azione anteriore.",Verbi
30,A2,"Ieri ho andato al supermercato per comprare del latte.",2,andato,sono andato,"'Andare' usa l'ausiliare 'essere', non 'avere'.",Verbi
31,B1,"Non ricordo dove ho messo le chiavi, le ho cercato dappertutto.",10,cercato,cercate,"Il participio passato deve concordare con l'oggetto diretto femminile plurale 'le' (chiavi).",Verbi
32,B2,"Se non fosse per il traffico, sarò già arrivato a casa.",8,sarò,sarei,"In un periodo ipotetico, la principale richiede il condizionale, non il futuro.",Verbi
33,A2,"Mia madre prepara il pranzo tutti giorni.",5,tutti,tutti i,"Manca l'articolo 'i' prima di 'giorni'.",Articoli
35,B2,"Qualora avrebbe bisogno di aiuto, non esiti a contattarmi.",2,avrebbe,avesse,"Con 'qualora' si usa il congiuntivo, non il condizionale.",Verbi
37,B1,"Mi piacerebbe di andare in vacanza in Grecia quest'estate.",3,di,∅,"Dopo 'piacerebbe' non si usa 'di' prima dell'infinito.",Preposizioni
41,A2,"Io va al supermercato ogni settimana per comprare il cibo.",2,va,vado,"'Va' è la terza persona singolare, ma il soggetto è 'Io' (prima persona singolare).",Verbi
42,B1,"Lei ha detto che non poteva venire alla festa perché era troppo occupato.",11,occupato,occupata,"'Occupato' dovrebbe essere 'occupata' perché si riferisce a 'Lei' (femminile).",Accordo di genere
43,B2,"Se avrei saputo prima, avrei potuto aiutarti meglio.",2,avrei,avessi,"In una frase ipotetica, si usa il congiuntivo trapassato 'avessi' invece del condizionale passato 'avrei'.",Periodo ipotetico
44,A2,"Loro mangiano la pasta tutti i giorni, ma io non piace.",9|10,non piace,non mi piace,"Manca il pronome 'mi'. La forma corretta è 'non mi piace' per esprimere un gusto personale.",Verbi|Pronomi
45,B1,"Ho visto un film interessante ieri sera, quale mi ha fatto riflettere molto.",7,quale,che,"'Quale' è usato per fare una scelta, mentre 'che' è il pronome relativo corretto in questo contesto.",Pronomi relativi
46,B2,"Nonostante avevo studiato molto, non ho superato l'esame.",2,avevo,avessi,"Dopo 'nonostante' si usa il congiuntivo, quindi 'avessi' è la forma corretta.",Congiuntivo
47,A2,"Mia sorella è più grande di me, ma io sono più alto che lei.",12,che,di,"Con i comparativi di maggioranza o minoranza, si usa 'di' invece di 'che'.",Comparativi
48,B1,"Gli ho detto di non preoccuparsi, ma lui continua a essere ansioso.",3|4,ho detto,ho detto a lui,"'Gli' è già un pronome indiretto, quindi 'a lui' è ridondante. Si può dire 'Gli ho detto' o 'Ho detto a lui'.",Pronomi
49,B2,"Mi domando se sarebbe meglio partire domani invece che oggi.",5,sarebbe,sia,"In una frase dubitativa indiretta, si preferisce il congiuntivo 'sia' al condizionale 'sarebbe'.",Congiuntivo
50,A2,"Io e mia moglie andiamo in vacanza ogni estate, ma quest'anno non possiamo andare.",1|2,Io e,Mia moglie e io,"In italiano, per cortesia, si mette l'altra persona prima di se stessi.",Ordine delle parole
51,B1,"Se avrei più tempo, studierei di più l'italiano.",2,avrei,avessi,"Nel periodo ipotetico della possibilità, si usa il congiuntivo imperfetto 'avessi' e non il condizionale 'avrei'.",Periodo ipotetico
52,B2,"L'ho visto mentre stavo andando al lavoro, ma non ho avuto il tempo di fermarmi.",14,di fermarmi,per fermarmi,"Con il verbo 'avere' seguito da un sostantivo e un infinito, si usa 'per' invece di 'di'.",Preposizioni
53,A2,"Ieri ho comprato un nuovo telefono, ma non funziona bene.",9,non funziona,non funziona ancora,"Aggiungere 'ancora' rende la frase più naturale in italiano, enfatizzando che è un problema attuale.",Avverbi
54,B1,"Benchè fa freddo, voglio uscire per una passeggiata.",2,fa,faccia,"Dopo 'benché' si usa il congiuntivo, quindi 'faccia' è la forma corretta.",Congiuntivo
55,B2,"Mi ha chiesto di aiutarlo con il suo progetto, al quale sono molto interessato.",11|12,al quale,a cui,"'A cui' è più comune e naturale in italiano moderno rispetto a 'al quale' in questo contesto.",Pronomi relativi
56,A2,"Loro vanno spesso al cinema, ma io preferisco guardare film a casa.",11,film,i film,"In italiano, quando si parla in generale, si usa l'articolo determinativo prima di 'film'.",Articoli
57,B1,"Se avessi studiato di più, avresti passato l'esame facilmente.",8,avresti passato,saresti passato,"Con il verbo 'passare' nel senso di 'superare un esame', si usa l'ausiliare 'essere'.",Verbi
58,B2,"Non ostante le difficoltà, siamo riusciti a completare il progetto in tempo.",1|2,Non ostante,Nonostante,"'Nonostante' è una parola unica in italiano, non va separata.",Ortografia
59,A2,"Io sono andato al mercato per comprare le verdure fresche.",2,sono andato,sono andata,"Se il soggetto 'Io' si riferisce a una donna, il participio passato deve concordare: 'andata'.",Accordo di genere
60,B1,"Mi piacerebbe sapere cosa pensi di questo libro che ti ho prestato.",6,cosa,che cosa,"In italiano standard, 'che cosa' è preferibile a 'cosa' in domande indirette.",Pronomi interrogativi
`