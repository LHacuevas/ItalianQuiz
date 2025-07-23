# Roadmap per il Miglioramento del Progetto

Questo documento delinea una roadmap per migliorare la codebase del progetto "Quiz di Italiano". Le proposte sono pensate per aumentare la manutenibilità, la scalabilità e le performance dell'applicazione.

## 1. Riorganizzazione del Codice e Refactoring

### Problema Attuale
Il componente `src/App.tsx` è un "God Component" che gestisce troppe responsabilità: autenticazione, routing, state management e la logica di quasi tutta l'applicazione. Questo rende il codice difficile da capire, manutenere e testare.

### Soluzione Proposta
- **Introduzione di un Router:** Introdurre `react-router-dom` per gestire la navigazione tra le diverse sezioni dell'app (Login, Placement Test, Home, Quiz, etc.).
  - Creare rotte specifiche come `/login`, `/test-di-piazzamento`, `/app`, `/app/quiz`, `/app/impiccato`, etc.
- **Creazione di un Layout Principale:** Estrarre la logica comune (es. header, footer, menu di navigazione) in un componente di layout che wrappa le pagine dell'applicazione.
- **Separazione delle Responsabilità:**
  - Creare un componente `AuthManager` o un "Higher-Order Component" (HOC) per gestire la logica di autenticazione e proteggere le rotte.
  - Spostare la logica specifica di ogni gioco/attività (`QuizItaliano`, `Impiccato`, etc.) interamente all'interno del proprio componente, facendogli gestire il proprio stato interno per quanto possibile.
  - Creare un componente `Settings` per gestire le impostazioni globali dell'utente (livello, numero di domande, etc.).

## 2. Gestione dello Stato (State Management)

### Problema Attuale
Lo stato è gestito tramite un mix di `useState`, `useEffect` e `localStorage`. Questo porta a "prop drilling" (passare props attraverso molti livelli di componenti) e a una gestione dello stato difficile da tracciare.

### Soluzione Proposta
- **Adottare uno State Manager Centralizzato:**
  - **Zustand:** Leggero e semplice da implementare, ottimo per iniziare a centralizzare lo stato senza una grande curva di apprendimento.
  - **Redux Toolkit:** Più robusto, offre strumenti di debugging eccellenti ed è uno standard industriale.
- **Cosa Mettere nello Store Globale:**
  - Stato dell'utente e informazioni del profilo.
  - Livello globale dell'utente.
  - Impostazioni globali dell'applicazione.
  - Stato di caricamento globale (loading).

## 3. Consolidamento dello Styling

### Problema Attuale
Il progetto utilizza sia **Material-UI (MUI)** che **Tailwind CSS**. Questo può portare a conflitti di stile, un aumento della dimensione del bundle e inconsistenza nell'interfaccia utente.

### Soluzione Proposta
- **Scegliere un Sistema di Stile Primario:**
  - **Opzione 1 (Consigliata):** Privilegiare **Tailwind CSS** per la maggior parte dei componenti per la sua flessibilità e utilità, e usare componenti "headless" (senza stile) da librerie come Radix UI. Usare MUI solo per componenti complessi che sono difficili da costruire da zero (es. Date Picker).
  - **Opzione 2:** Rimuovere Tailwind e usare solo MUI per garantire un'esperienza visiva coerente, sfruttando appieno il sistema di theming di MUI.
- **Creare un "Design System" Semplice:** Definire una palette di colori, una scala tipografica e delle spaziature consistenti in un file di configurazione (es. `tailwind.config.js` o il tema di MUI).

## 4. Miglioramento del Build System

### Problema Attuale
Il progetto è basato su **Create React App (CRA)**, che è meno performante e flessibile rispetto a tool più moderni. La configurazione è nascosta e personalizzata tramite `@craco/craco`.

### Soluzione Proposta
- **Migrare a Vite:**
  - **Vantaggi:** Avvio del server di sviluppo quasi istantaneo, Hot Module Replacement (HMR) più veloce, build di produzione ottimizzate con Rollup.
  - **Passi:**
    1. Creare un nuovo progetto Vite.
    2. Spostare i file sorgente (`src`, `public`).
    3. Adattare le configurazioni (es. gestione delle variabili d'ambiente da `REACT_APP_` a `VITE_`).
    4. Installare e configurare i plugin di Vite necessari (es. per SVG, etc.).

## 5. Strategia di Testing

### Problema Attuale
La copertura dei test sembra essere limitata. La mancanza di test rende il refactoring rischioso e può portare a regressioni.

### Soluzione Proposta
- **Unit Test:** Utilizzare **Vitest** (se si migra a Vite) o continuare con Jest per scrivere test unitari per:
  - Componenti UI isolati (es. `Button`, `Card`).
  - Funzioni di utility (es. `firebaseFunctions`).
  - Logica di business nei componenti (es. calcolo del punteggio in un quiz).
- **Integration Test:** Con React Testing Library, testare il flusso di interazione tra più componenti (es. completare un quiz e vedere il risultato).
- **End-to-End (E2E) Test:** Introdurre **Cypress** o **Playwright** per simulare flussi utente completi:
  - Login -> Completamento Test di Piazzamento -> Avvio di un gioco -> Logout.

## 6. Gestione del Data Fetching

### Problema Attuale
Il fetching dei dati da Firebase è gestito manualmente con `useEffect` e funzioni asincrone. Manca una strategia di caching, re-fetching e gestione degli stati di errore/caricamento.

### Soluzione Proposta
- **Adottare una Libreria di Data Fetching:**
  - **React Query (TanStack Query):** Libreria potente che semplifica il fetching, il caching, la sincronizzazione e l'aggiornamento dei dati server. Gestisce automaticamente stati di loading, error, e re-fetching in background.
  - **SWR:** Un'alternativa più leggera a React Query sviluppata da Vercel.
- **Come Usarla:**
  - Rimpiazzare le chiamate `fetch` in `useEffect` con i custom hook forniti da queste librerie (es. `useQuery`).
  - Gestire le mutazioni (creazione/aggiornamento di dati) con `useMutation` per avere un feedback istantaneo nell'UI.

---

Questa roadmap è un suggerimento. Ogni punto può essere discusso e adattato in base alle priorità del progetto. Si consiglia di iniziare con il **Refactoring del Codice** e l'**Introduzione di un Router**, poiché questo sbloccherà la possibilità di lavorare su altre aree in modo più pulito e isolato.
