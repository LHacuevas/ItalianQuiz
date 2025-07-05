# Progetto Quiz di Italiano / Italian Quiz Project

## Descrizione / Description

Questo progetto è un'applicazione web interattiva progettata per aiutare gli utenti a imparare e praticare la lingua italiana attraverso una varietà di quiz ed esercizi. L'applicazione include test di piazzamento, quiz a scelta multipla, esercizi di completamento di frasi, giochi come l'impiccato, rilevamento di errori grammaticali e un tutor di dattilografia italiana.
L'applicazione utilizza Firebase per l'autenticazione degli utenti e per salvare i progressi e le statistiche delle risposte (se abilitato).

This project is an interactive web application designed to help users learn and practice the Italian language through a variety of quizzes and exercises. The application includes placement tests, multiple-choice quizzes, sentence completion exercises, games like Hangman, grammar error detection, and an Italian typing tutor.
The application uses Firebase for user authentication and to save user progress and answer statistics (if enabled).

## Funzionalità / Features

* **Autenticazione Utente / User Authentication:** Registrazione e login (opzionale, configurabile).
* **Test di Piazzamento / Placement Test:** Per valutare il livello di conoscenza dell'italiano dell'utente.
* **Quiz a Scelta Multipla (QuizItalianoGPT):** Domande di grammatica e vocabolario generate o curate.
* **Completamento di Frasi (ItalianLearningApp/parrafoClaude2):** Esercizi per riempire gli spazi vuoti nei paragrafi.
* **Gioco dell'Impiccato (Impiccato):** Classico gioco dell'impiccato con parole italiane.
* **Rilevamento Errori (ItalianErrorDetectionGame/corrigeClaude):** Identificare e correggere errori in frasi italiane.
* **Tutor di Dattilografia (ItalianTypingTutor):** Per praticare la velocità e precisione nella scrittura in italiano.
* **Statistiche Risposte / Answer Statistics:** Tracciamento delle risposte degli utenti (se Firebase è attivo).
* **Gestione Livello Utente / User Level Management:** Assegnazione di un livello globale e livelli specifici per attività.
* **Caricamento Dati CSV / CSV Data Loading:** Possibilità per amministratori (locali) di caricare dati per i quiz da file CSV.

## Stack Tecnologico / Tech Stack

* **Frontend:** React, TypeScript, Material-UI (MUI), Tailwind CSS (parzialmente)
* **Build Tool:** Create React App (CRA) con Craco per la personalizzazione della configurazione.
* **Backend (se abilitato):** Firebase (Autenticazione, Firestore Database)
* **Lingua / Language:** TypeScript, JavaScript (per alcuni dati dei quiz)

## Setup / Installazione Locale

1. **Clonare il repository / Clone the repository:**

    ```bash
    git clone <repository-url>
    cd mi-proyecto-quiz
    ```

2. **Installare le dipendenze / Install dependencies:**

    ```bash
    npm install
    ```

3. **Configurare Firebase (Opzionale) / Configure Firebase (Optional):**
    * Se si desidera utilizzare le funzionalità di Firebase (autenticazione, database), creare un progetto Firebase su [console.firebase.google.com](https://console.firebase.google.com/).
    * Ottenere la configurazione del progetto Firebase (apiKey, authDomain, projectId, ecc.).
    * Creare un file `.env` nella directory principale del progetto copiando da `env.example`.
    * Popolare il file `.env` con le proprie chiavi Firebase:

        ```env
        REACT_APP_FIREBASE_API_KEY=your_api_key
        REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
        REACT_APP_FIREBASE_PROJECT_ID=your_project_id
        REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
        REACT_APP_FIREBASE_APP_ID=your_app_id
        REACT_APP_MEASUREMENT_ID=your_measurement_id

        REACT_APP_USE_DATABASE=true # Impostare a 'true' per usare Firebase, 'false' per la modalità locale
        REACT_APP_USE_USUARIO_FIREBASE=true # Impostare a 'true' per l'autenticazione Firebase, 'false' per utente locale
        ```

    * Assicurarsi di configurare le regole di sicurezza di Firestore in modo appropriato per l'applicazione.

4. **Avviare l'applicazione / Start the application:**

    ```bash
    npm start
    ```

    L'applicazione dovrebbe essere disponibile su `http://localhost:3000`.

## Utilizzo / Usage

Una volta avviata l'applicazione:

* Se l'autenticazione Firebase è abilitata (`REACT_APP_USE_USUARIO_FIREBASE=true`), verrà presentata una schermata di login/registrazione.
* Se l'autenticazione è disabilitata, o dopo il login, l'utente potrebbe dover completare un test di piazzamento.
* Successivamente, l'utente accederà alla schermata principale dove potrà scegliere tra diverse attività di apprendimento e giochi.
* Le impostazioni come il nome utente (in modalità locale), il livello di difficoltà per le attività e il numero di domande possono essere configurate dall'interfaccia.

## Struttura delle Cartelle / File Structure Overview

```
mi-proyecto-quiz/
├── public/             # Asset statici e index.html
├── src/
│   ├── App.tsx         # Componente principale dell'applicazione
│   ├── MyTypes.tsx     # Definizioni TypeScript globali
│   ├── PlacementTest.tsx # Componente per il test di piazzamento
│   ├── QuizItalianoGPT.tsx # Componente per quiz a scelta multipla
│   ├── parrafoClaude2.tsx  # Componente per esercizi di completamento (ItalianLearningApp)
│   ├── corrigeClaude.tsx   # Componente per gioco di rilevamento errori (ItalianErrorDetectionGame)
│   ├── impiccato.tsx     # Componente per gioco dell'Impiccato
│   ├── ItalianTypingTutor.tsx # Componente per tutor di dattilografia
│   ├── components/       # Componenti React riutilizzabili (UI, Auth, etc.)
│   ├── firebase/
│   │   ├── firebase.js             # Configurazione iniziale di Firebase
│   │   ├── firebaseFunctions.tsx   # Funzioni per interagire con Firestore
│   │   └── firebaseInterfaces.tsx  # Interfacce TypeScript per dati Firebase
│   ├── question.*.js   # File contenenti i dati per i vari quiz e giochi (formato CSV-like)
│   ├── index.js        # Punto di ingresso dell'applicazione React
│   └── ...             # Altri file di configurazione e componenti
├── .env                # Variabili d'ambiente (da creare da .env.example)
├── env.example         # Esempio di file per variabili d'ambiente
├── package.json        # Dipendenze e script del progetto
└── README.md           # Questo file
```

## Possibili Miglioramenti Futuri / Future Enhancements

* Espandere il numero di domande e testi per tutti i giochi.
* Aggiungere più livelli di difficoltà.
* Migliorare l'interfaccia utente e l'esperienza utente (UI/UX).
* Implementare un sistema di feedback più dettagliato per le risposte.
* Aggiungere la possibilità per gli utenti di creare e condividere i propri quiz.
* Internazionalizzazione dell'interfaccia (i18n).


