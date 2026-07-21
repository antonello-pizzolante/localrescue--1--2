# LocalRescue

Applicazione web per la gestione operativa di soccorso e logistica, pensata per semplificare il lavoro di squadre e operatori.

## Funzionalità principali

- gestione autisti e mezzi
- form per sanitari e carrozzeria
- dashboard con riepilogo dati
- esportazione documenti e report
- integrazione con Firebase, Drive e Gmail

## Avvio locale

Prerequisiti:
- Node.js
- npm

Passaggi:
1. Installa le dipendenze:
   `npm install`
2. Avvia l’applicazione:
   `npm run dev`
3. Apri l’indirizzo mostrato nel terminale

## Pubblicazione online

Il progetto è configurato per essere pubblicato tramite GitHub Pages.
Ogni push sulla branch `main` attiva il deploy automatico.

## Struttura principale

- `src/` contiene l’applicazione React
- `server.ts` gestisce il backend locale
- `.github/workflows/deploy-pages.yml` configura il deploy automatico
