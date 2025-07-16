export const corrigeCSV = `
id,nivel,fraseCompleta,idsPalabrasErroneas,palabrasErroneas,correcciones,explicacion,tema
1,A2,"Io ho mangiato una mela ieri mattina.", , , ,"La frase è corretta. Con l'ausiliare 'avere', il participio passato di solito non concorda con un oggetto diretto che segue, ma può farlo opzionalmente.",Verbi
4,B1,"Tu hai detto che loro arriverebbero presto ma essi non sono ancora qui.",6|9,arriverebbero|essi,sarebbero arrivati|loro,"'Arriverebbero' dovrebbe essere 'sarebbero arrivati' (futuro nel passato).|'Essi' è formale e meno comune, 'loro' è sufficiente.",Verbi|Pronomi
6,B1,"Se avessi studiato di più, avresti passato l'esame.", , , ,"La frase è corretta. Il verbo 'passare un esame' usa l'ausiliare 'avere'.",Verbi
9,A2,"Lei è andato al cinema con i miei amici sabato scorso.",3,andato,andata,"Se il soggetto 'Io' è femminile, la parola 'andato' (parola 3) è errata e deve concordare: 'andata'. Se il soggetto è maschile, la frase è corretta.",Verbi
10,B1,"Dopo che avrò finito i compiti, ti chiamerò.", , , ,"La frase è corretta. 'Avrò finito i compiti' è una forma naturale e completa.",Verbi
12,A2,"Loro vanno a scuola con il bus ogni giorno.",5|6,con|il,in|,"In italiano, si usa 'in bus' invece di 'con il bus' (parole 5 e 6).",Preposizioni
15,A2,"Il gatto dorme sul il divano.",5,il,,"'sul il' (parole 4 e 5) è ridondante. 'Sul' è già la contrazione di 'su' + 'il'.",Preposizioni
19,B1,"Se l'avessi saputo prima, ti avrei avvertito.", , , ,"La frase è corretta. 'Avvertire' può significare 'informare' o 'mettere al corrente', simile ad 'avvisare'.",Vocabolario
21,A2,"Io ho fame e voglio mangio una pizza.",6,mangio,mangiare,"Dopo 'voglio' si usa l'infinito, quindi 'mangio' (parola 6) dovrebbe essere 'mangiare'.",Verbi
22,B1,"Se avrei tempo, andrei al cinema stasera.",2,avrei,avessi,"Nel periodo ipotetico della possibilità, la parola 'avrei' (parola 2) nella protasi è errata. Si usa il congiuntivo imperfetto: 'avessi'.",Verbi
23,B2,"Nonostante che piove, usciremo per fare una passeggiata.",2|3,che|piove,piova,"Con 'nonostante' si usa il congiuntivo. L'espressione 'che piove' (parole 2 e 3) è errata. Dovrebbe essere 'piova' (senza 'che').",Congiunzioni|Verbi
25,B1,"Ho visto Maria ieri e gli ho dato il tuo messaggio.",6,gli,le,"'gli' (parola 5) è un pronome maschile. Riferendosi a Maria (femminile), la forma corretta è 'le'.",Pronomi
26,B2,"Benchè sia arrivato in ritardo, il professore le ha permesso di fare l'esame.",1,Benchè,Benché,"La parola 'Benchè' (parola 1) è scritta in modo errato. L'ortografia corretta è 'Benché' (con accento acuto).",Ortografia
28,B1,"Se l'avrei saputo prima, non sarei venuto alla festa.",2,l'avrei,l'avessi,"Nel periodo ipotetico dell'irrealtà al passato, la parola 'l'avrei' (parola 2) nella protasi è errata. Si usa il congiuntivo trapassato: 'l'avessi'.",Verbi
29,B2,"Mi sono accorto che avevo dimenticato il portafoglio solo dopo che sono uscito di casa.",12,sono,ero,"Per indicare un'azione anteriore ad un'altra nel passato ('mi sono accorto'), si usa il trapassato prossimo. 'sono uscito' (parole 12 e 13) è errato, dovrebbe essere 'ero uscito'.",Verbi
30,A2,"Ieri ho andato al supermercato per comprare del latte.",2,ho,sono,"Il verbo 'andare' richiede l'ausiliare 'essere'. 'ho andato' (parole 2 e 3) è errato. La forma corretta è 'sono andato'.",Verbi
31,B1,"Non ricordo dove ho messo le chiavi, le ho cercato dappertutto.",10,cercato,cercate,"Il participio passato 'cercato' (parola 10) deve concordare con il pronome oggetto diretto 'le' (riferito a 'chiavi', femminile plurale). Quindi, 'cercate'.",Verbi
32,B2,"Se non fosse per il traffico, sarò già arrivato a casa.",7,sarò,sarei,"In un periodo ipotetico dell'irrealtà presente/futura, l'apodosi (frase principale) richiede il condizionale. 'sarò' (parola 7) è errato, dovrebbe essere 'sarei'.",Verbi
33,A2,"Mia madre prepara il pranzo tutti giorni.",6,tutti,tutti i,"Manca l'articolo 'i' prima di 'giorni'. La parola 'tutti' (parola 6) da sola è errata in questo contesto. Deve essere 'tutti i'.",Articoli
35,B2,"Qualora avrebbe bisogno di aiuto, non esiti a contattarmi.",2,avrebbe,avesse,"Con 'qualora' (che introduce una frase condizionale eventuale), si usa il congiuntivo. 'avrebbe' (parola 2) è errato, dovrebbe essere 'avesse'.",Verbi
37,B1,"Mi piacerebbe di andare in vacanza in Grecia quest'estate.",3,di,∅,"Dopo il verbo 'piacerebbe' seguito da un altro verbo all'infinito, non si usa la preposizione 'di' (parola 3).",Preposizioni
41,A2,"Io va al supermercato ogni settimana per comprare il cibo.",2,va,vado,"Il soggetto è 'Io' (prima persona singolare). Il verbo 'va' (parola 2) è terza persona singolare. La forma corretta è 'vado'.",Verbi
42,B1,"Lei ha detto che non poteva venire alla festa perché era troppo occupato.",13,occupato,occupata,"L'aggettivo 'occupato' (parola 13) si riferisce a 'Lei' (soggetto femminile). Deve concordare in genere: 'occupata'.",Accordo di genere
43,B2,"Se avrei saputo prima, avrei potuto aiutarti meglio.",2,avrei,avessi,"Nella protasi di un periodo ipotetico dell'irrealtà al passato, si usa il congiuntivo trapassato. 'avrei' (parola 2) è errato, dovrebbe essere 'avessi'.",Periodo ipotetico
45,B1,"Ho visto un film interessante ieri sera, quale mi ha fatto riflettere molto.",8,quale,che,"'quale' (parola 8) come pronome relativo semplice è meno comune o inadatto qui. Si usa 'che'.",Pronomi relativi
46,B2,"Nonostante avevo studiato molto, non ho superato l'esame.",2,avevo,avessi,"Dopo 'nonostante' (concessiva), si usa il congiuntivo. 'avevo' (parola 2) è errato, dovrebbe essere 'avessi'.",Congiuntivo
47,A2,"Mia sorella è più grande di me, ma io sono più alto che lei.",13,che,di,"Nei comparativi di maggioranza/minoranza che confrontano due termini rispetto a una qualità, si usa 'di'. La parola 'che' (parola 13) è errata. 'Più alto di lei'.",Comparativi
48,B1,"Gli ho detto di non preoccuparsi, ma lui continua a essere ansioso.", , , ,"La frase è corretta. 'Gli ho detto' è una forma standard e concisa.",Pronomi
49,B2,"Mi domando se sarebbe meglio partire domani invece che oggi.",4,sarebbe,sia,"Nelle interrogative indirette che esprimono dubbio, si preferisce il congiuntivo. 'sarebbe' (parola 4) è meno appropriato di 'sia'.",Congiuntivo
51,B1,"Se avrei più tempo, studierei di più l'italiano.",2,avrei,avessi,"Nella protasi di un periodo ipotetico della possibilità, si usa il congiuntivo imperfetto. 'avrei' (parola 2) è errato, dovrebbe essere 'avessi'.",Periodo ipotetico
52,B2,"L'ho visto mentre stavo andando al lavoro, ma non ho avuto il tempo di fermarmi.",13,di,per,"Con l'espressione 'avere tempo' seguita da un verbo all'infinito con valore finale, si usa 'per'. 'di fermarmi' (parole 13 e 14) è errato, dovrebbe essere 'per fermarmi'.",Preposizioni
53,A2,"Ieri ho comprato un nuovo telefono, ma non funziona bene.", , , ,"La frase è corretta. 'Non funziona bene' è una espressione standard.",Avverbi
54,B1,"Benchè fa freddo, voglio uscire per una passeggiata.",2,fa,faccia,"Dopo 'benché' (concessiva), si usa il congiuntivo. 'fa' (parola 2) è errato, dovrebbe essere 'faccia'.",Congiuntivo
55,B2,"Mi ha chiesto di aiutarlo con il suo progetto, al quale sono molto interessato.",10|11,al|quale,a cui,"'a cui' è generalmente preferito e più comune in italiano moderno rispetto a 'al quale' (parole 9 e 10) in questo contesto.",Pronomi relativi
56,A2,"Loro vanno spesso al cinema, ma io preferisco guardare film a casa.",10,film,i film,"Quando si parla di 'film' in senso generale come categoria, si usa l'articolo determinativo. 'film' (parola 10) da solo è errato qui. Dovrebbe essere 'i film'.",Articoli
57,B1,"Se avessi studiato di più, avresti passato l'esame facilmente.", , , ,"La frase è corretta. Il verbo 'passare un esame' usa l'ausiliare 'avere'.",Verbi
58,B2,"Non ostante le difficoltà, siamo riusciti a completare il progetto in tempo.",1|2,Non|ostante,Nonostante,"'Non ostante' (parole 1 e 2) è un errore di ortografia. La forma corretta è 'Nonostante', tutto attaccato.",Ortografia
59,A2,"Lei è andato al mercato per comprare le verdure fresche.",3,andato,andata,"Se il soggetto 'Io' è femminile, la parola 'andato' (parola 3) è errata e deve concordare: 'andata'. Se il soggetto è maschile, la frase è corretta.",Accordo di genere
60,B1,"Mi piacerebbe sapere cosa pensi di questo libro che ti ho prestato.", , , ,"La frase è corretta. 'Cosa' è comunemente usato al posto di 'che cosa' nelle domande indirette.",Pronomi interrogativi
"61","A2","Io ho andato alla scuola ieri mattina.","2|4","ho|alla","sono|a","'Andare' al passato prossimo usa l'ausiliare 'essere'.|La preposizione corretta è 'a' davanti a luoghi generici.","Verbi|Preposizioni"
"62","A2","A lei piace molto i gelati al cioccolato.","3","piace","piacciono","Con soggetto plurale 'i gelati' il verbo 'piacere' deve essere al plurale.","Verbi"
"63","A2","Noi vederemo domani alle nove in punto.","2","vederemo","vedremo","Il futuro semplice di 'vedere' è 'vedremo', non '*vederemo*'.","Verbi"
"64","A2","Il mio sorella abita a Roma da due anni.","1|2","Il|mio","La|mia","'Sorella' richiede l'articolo femminile 'la'.|L'aggettivo possessivo deve concordare in genere: 'mia'.","Articoli|Aggettivi"
"65","A2","Loro non hanno mai visto queste film prima.","6","queste","questi","'Film' è maschile plurale: l'aggettivo dimostrativo deve essere 'questi'.","Aggettivi"
"66","B1","Non vedo l'ora di incontrarti e raccontarti su quello che ho fatto.","8","su","di","Dopo 'raccontare' si usa la preposizione 'di', non 'su'.","Preposizioni"
"67","B1","Malgrado lui era stanco, ha finito il lavoro.","3","era","fosse","Dopo 'malgrado' si richiede il congiuntivo imperfetto: 'fosse'.","Congiunzioni|Verbi"
"68","B1","Preferisco che tu viene domani invece di oggi.","4","viene","venga","Dopo espressione di preferenza 'preferisco che' serve il congiuntivo presente.","Verbi"
"69","B1","Il documento è stato compilata da Elena ieri.","5","compilata","compilato","Il participio passato deve concordare con 'documento', che è maschile: 'compilato'.","Concordanza"
"70","B1","Se avrei più tempo, imparerei a suonare il pianoforte.","2","avrei","avessi","Nel periodo ipotetico di II tipo si usa il congiuntivo imperfetto nella proposizione 'se': 'avessi'.","Periodo ipotetico|Verbi"
"71","B1","Credo che lui arriverà in ritardo.","4","arriverà","arrivi","Dopo 'credo che' si usa il congiuntivo presente: 'arrivi'.","Verbi|Congiunzioni"
"72","B2","Benché pioveva, siamo comunque usciti per fare una passeggiata.","2","pioveva","piovesse","Dopo 'benché' richiede il congiuntivo imperfetto: 'piovesse'.","Congiunzioni|Verbi"
"73","B2","È importante che tu avresti finito il progetto entro venerdì.","5","avresti","abbia","Dopo 'è importante che' si usa il congiuntivo passato: 'abbia finito'.","Verbi"
"74","B2","Qualunque sia le tue ragioni, devi parlarne apertamente.","2","sia","siano","Il verbo 'essere' deve concordare col soggetto plurale 'ragioni': 'siano'.","Verbi|Concordanza"
"75","B2","Nonostante avendo studiato molto, non superò l'esame.","2","avendo","avesse","Dopo 'nonostante' occorre il congiuntivo imperfetto: 'avesse studiato'.","Congiunzioni|Verbi"
"76","B2","Temo di che loro non riescano a finire in tempo.","2","di","Ø","Dopo 'temo' si usa semplicemente 'che' senza la preposizione 'di'.","Preposizioni|Congiunzioni"
"77","B2","Sebbene li ho invitati, nessuno è venuto.","3","ho","abbia","Dopo 'sebbene' si usa il congiuntivo composto: 'li abbia invitati'.","Congiunzioni|Verbi"
"78","B2","L'insegnante disse agli studenti di che studiare più intensamente.","5","di","Ø","La sequenza 'di che' è errata: basta 'che studiare' oppure 'di studiare'.","Preposizioni|Congiunzioni"
"79","B2","Qualsiasi informazioni tu abbia, condividila con il team.","5","condividila","condividile","'Informazioni' è plurale, quindi il pronome complemento deve essere plurale: 'le' → 'condividile'.","Pronomi|Concordanza"
"80","B2","Ho finito il report, quantunque c'era molte difficoltà.","6","c'era","ci fossero","Dopo 'quantunque' si usa il congiuntivo imperfetto e il verbo deve concordare con il plurale 'difficoltà': 'ci fossero'.","Congiunzioni|Verbi|Concordanza"
81,A2,"Io vado a scuola con la metro ogni giorni.",6|8,metro|giorni,metropolitana|giorno,"'Metro' è troppo informale, si usa 'metropolitana'.|'Giorni' deve essere singolare dopo 'ogni'.",Articoli|Sostantivi
82,A2,"Maria ha comprato tre libro rosso per sua figlia.",4|5,libro|rosso,libri|rossi,"'Libro' deve essere plurale dopo 'tre'.|'Rosso' deve accordarsi con 'libri' (plurale maschile).",Accordi|Aggettivi
83,A2,"I bambini giocano nel parco e loro sono molto felici.",8,loro,essi,"'Loro' dopo 'e' è ridondante, si usa 'essi' o si omette.",Pronomi
84,B1,"Se io avrò tempo domani, andrò al cinema.",3,avrò,avessi,"Con 'se' ipotetico si usa il congiuntivo 'avessi' non il futuro.",Congiuntivo|Verbi
85,B1,"Penso che Marco è molto intelligente e simpatico.",4,è,sia,"Dopo 'penso che' si usa il congiuntivo 'sia' non l'indicativo.",Congiuntivo
86,B1,"Ieri sono andato dal dottore perché mi faceva male la testa.",8,faceva,faceva,"'Faceva' è corretto ma meglio 'doleva' per il mal di testa.",Verbi
87,B1,"Nonostante la pioggia, siamo usciti lo stesso casa.",8,casa,di casa,"Manca la preposizione 'di' prima di 'casa'.",Preposizioni
88,B1,"Gli ho detto di non fare questo, ma lui non mi ha ascoltato.",11,ascoltato,sentito,"'Ascoltare' implica prestare attenzione, 'sentire' è percepire.",Verbi
89,B2,"Benché lui abbia studiato molto, non è riuscito a superare l'esame.",3,abbia,avesse,"Con 'benché' al passato si usa 'avesse studiato' (congiuntivo trapassato).",Congiuntivo|Verbi
90,B2,"Vorrei che tu mi aiutassi con questo problema difficile.",5,aiutassi,aiutassi,"'Aiutassi' è corretto, ma in italiano moderno si preferisce 'aiutassi'.",Congiuntivo
91,B2,"Non credo che sia possibile di finire tutto oggi.",7,di,∅,"Dopo 'possibile' non serve la preposizione 'di'.",Preposizioni
92,A2,"La mia sorella più piccola ha sette anni e va a scuola.",2,più,più,"'Più piccola' è corretto, ma 'minore' è più formale.",Aggettivi
93,A2,"Abbiamo visitato il museo e poi siamo andati a casa.",10,a,∅,"'Andare casa' senza preposizione, o 'tornare a casa'.",Preposizioni
94,B1,"Dopo che avrò finito di studiare, uscirò con gli amici.",4,avrò,avrò,"'Avrò finito' è corretto per il futuro anteriore.",Verbi
95,B1,"È importante che tutti studenti fanno i compiti.",6,fanno,facciano,"Dopo 'è importante che' si usa il congiuntivo 'facciano'.",Congiuntivo
96,B2,"Qualora dovessi avere problemi, non esitare a chiamarmi.",2,dovessi,dovessi,"'Dovessi' è corretto con 'qualora' (congiuntivo imperfetto).",Congiuntivo
97,B2,"Malgrado il fatto che pioveva, siamo andati al parco.",6,pioveva,piovesse,"Con 'malgrado' si usa il congiuntivo 'piovesse'.",Congiuntivo
98,A2,"Ho bisogno di comprare del pane e un po' latte.",9,latte,di latte,"Dopo 'un po'' serve la preposizione 'di'.",Preposizioni
99,B1,"Spero che il treno non sarà in ritardo oggi.",6,sarà,sia,"Con 'spero che' si usa il congiuntivo presente 'sia'.",Congiuntivo
100,B2,"Sebbene fossero stanchi, continuarono a camminare senza fermarsi.",2,fossero,fossero,"'Fossero' è corretto con 'sebbene' (congiuntivo imperfetto).",Congiuntivo
101,A2,"Domani andrò al supermercato per comprare qualche cose.",9,cose,cosa,"'Qualche' vuole sempre il singolare: 'qualche cosa'.",Sostantivi
102,A2,"Le ragazze sono andate a casa delle loro nonne.",8,delle,dalle,"'Andare da qualcuno' richiede la preposizione 'da', non 'di'.",Preposizioni
103,B1,"Credo che ieri Marco aveva ragione su questo argomento.",5,aveva,avesse,"Con 'credo che' al passato si usa il congiuntivo 'avesse'.",Congiuntivo
104,B1,"Mentre che studiavo, è suonato il telefono.",1|2,Mentre|che,Mentre,∅,"'Mentre' non richiede 'che', si usa da solo.",Congiunzioni
105,B1,"Ho paura che non riesco a finire in tempo.",5,riesco,riesca,"Dopo 'ho paura che' si usa il congiuntivo 'riesca'.",Congiuntivo
106,B1,"Appena che arriverai, chiamami subito per favore.",1|2,Appena|che,Appena,∅,"'Appena' non richiede 'che', si usa da solo.",Congiunzioni
107,B2,"Purché tu studi con impegno, supererai l'esame senza problemi.",3,studi,studi,"'Studi' è corretto con 'purché' (congiuntivo presente).",Congiuntivo
108,B2,"Chiunque sia interessato può partecipare al corso gratuitamente.",2,sia,sia,"'Sia' è corretto con 'chiunque' (congiuntivo presente).",Congiuntivo
109,A2,"Ho visto tre films molto interessanti questo weekend.",3,films,film,"'Film' è invariabile in italiano, non prende la 's'.",Sostantivi
110,A2,"La professoressa ha spiegato buonamente la lezione di oggi.",4,buonamente,bene,"'Buonamente' significa 'con buona volontà', qui serve 'bene'.",Avverbi
111,B1,"Dubito che lui dice sempre la verità ai suoi genitori.",4,dice,dica,"Dopo 'dubito che' si usa il congiuntivo 'dica'.",Congiuntivo
112,B1,"Prima di uscire, controlla che hai chiuso tutte le finestre.",7,hai,abbia,"Dopo 'controlla che' si usa il congiuntivo 'abbia'.",Congiuntivo
113,B1,"Non sapevo che Maria è già partita per le vacanze.",5,è,fosse,"Con 'non sapevo che' si usa il congiuntivo 'fosse'.",Congiuntivo
114,B2,"Ovunque tu vada, ricordati di portare con te i documenti.",3,vada,vada,"'Vada' è corretto con 'ovunque' (congiuntivo presente).",Congiuntivo
115,B2,"Comunque vada la situazione, noi ti sosterremo sempre.",2,vada,vada,"'Vada' è corretto con 'comunque' (congiuntivo presente).",Congiuntivo
116,A2,"Mia madre cucina sempre molto buono per tutta la famiglia.",5,buono,bene,"'Cucinare bene' non 'buono', serve l'avverbio.",Avverbi
117,A2,"Ho incontrato una ragazza molto simpatica al bar ieri sera.",11,sera,sera,"'Sera' è corretto, ma 'ieri sera' è una locuzione fissa.",Avverbi
118,B1,"Immagino che tu sei stanco dopo questo lungo viaggio.",4,sei,sia,"Dopo 'immagino che' si usa il congiuntivo 'sia'.",Congiuntivo
119,B2,"Affinché il progetto riesca, dobbiamo lavorare tutti insieme.",3,riesca,riesca,"'Riesca' è corretto con 'affinché' (congiuntivo presente).",Congiuntivo
120,A2,"Mio fratello ha comprato una macchina nuova di colore blu.",9,blu,blu,"'Blu' è invariabile, ma meglio dire 'di colore blu' o 'azzurra'.",Aggettivi
"121","A2","Io me chiamo Marco e vengo da Napoli.","2","me","mi","'Me' è forma tonica; come pronome riflessivo serve 'mi'.","Pronomi|Verbi"
"122","A2","Tu li mangi la pizza stasera?","2","li","la","Per oggetto femminile singolare 'pizza' si usa il pronome diretto 'la'.","Pronomi|Verbi"
"123","A2","Loro gli regalano un libro a Maria.","2","gli","le","Per il femminile singolare (Maria) il pronome indiretto corretto è 'le'.","Pronomi|Verbi"
"124","A2","Noi vado al cinema con voi.","2","vado","andiamo","Il verbo deve concordare con il soggetto 'noi': 'andiamo'.","Verbi|Pronomi"
"125","B1","Gli studenti si aiuta l'uno l'altro perché loro sa che è importante.","4|9","aiuta|sa","aiutano|sanno","'Aiuta' deve accordarsi con 'studenti'.|'Sa' deve accordarsi con 'loro'.","Verbi|Concordanza|Pronomi"
"126","B1","Penso che lui ha ragione.","4","ha","abbia","Dopo 'penso che' si usa il congiuntivo presente 'abbia'.","Verbi|Congiunzioni|Pronomi"
"127","B1","Se mi avrebbe detto, io sarei stato più attento.","3","avrebbe","avesse","Nel periodo ipotetico di III tipo, nella proposizione con 'se' si usa il congiuntivo trapassato: 'avesse'.","Verbi|Periodo ipotetico|Pronomi"
"128","B1","Ho telefonato lui ieri ma non ha risposto.","3","lui","gli","'Telefonare' regge il pronome indiretto 'gli'.","Pronomi|Verbi"
"129","B1","Disse che se avrebbe potuto, sarebbe venuto.","4","avrebbe","avesse","Nella proposizione con 'se' si usa il congiuntivo trapassato: 'avesse potuto'.","Verbi|Periodo ipotetico"
"130","B1","Raccontalo la storia che ti ho detto ieri.","1","Raccontalo","Raccontagli","'Raccontare qualcosa a qualcuno' richiede il pronome indiretto 'gli'.","Pronomi|Verbi"
"131","B2","Chi vuole che tu fai questo lavoro?","5","fai","faccia","Dopo 'che' con verbo volitivo ('vuole') serve il congiuntivo presente: 'faccia'.","Verbi|Congiunzioni"
"132","B2","Spero di che tu sia felice.","2","di","Ø","Si elimina la preposizione 'di' perché dopo 'spero' si usa direttamente 'che'.","Preposizioni|Congiunzioni|Verbi"
"133","B2","Temo che loro non riescono a finirlo.","5","riescono","riescano","Dopo 'temo che' si usa il congiuntivo presente: 'riescano'.","Verbi|Congiunzioni|Pronomi"
"134","B2","Mi chiedo perché egli non ha risposto al messaggio.","4","egli","lui","'Egli' è forma letteraria; nel parlato si preferisce 'lui'.","Pronomi"
"135","B2","Vorrei che tu avrei più tempo per me.","4","avrei","avessi","Dopo 'vorrei che' si usa il congiuntivo imperfetto: 'avessi'.","Verbi|Congiunzioni|Pronomi"
"136","B2","Qualunque cosa tu fai, fallo con passione.","4","fai","faccia","Dopo 'qualunque cosa' si usa il congiuntivo: 'faccia'.","Verbi|Congiunzioni"
"137","B2","Se lei sarebbe venuta, ci avremmo divertiti di più.","3","sarebbe","fosse","Nel periodo ipotetico di III tipo, la proposizione con 'se' richiede il congiuntivo trapassato: 'fosse venuta'.","Verbi|Periodo ipotetico|Pronomi"
"138","B2","Qualsiasi cosa lo dici, lui non ti ascolta.","3","lo","gli","'Dire qualcosa a qualcuno' richiede il pronome indiretto 'gli'.","Pronomi|Verbi"
"139","B2","Chiunque tu incontri, salutale con cortesia.","4","salutale","salutalo","'Chiunque' è singolare; pronome oggetto deve essere singolare: 'salutalo'.","Pronomi|Verbi"
"140","B2","Non c'è nessuno che lo sappia rispondere.","5","lo","gli","'Rispondere a qualcuno' richiede il pronome indiretto 'gli'.","Pronomi|Verbi"
`