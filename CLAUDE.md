# Street & Race — Contesto di Progetto

App web per la scoperta e gestione di eventi automobilistici (car meeting, raduni, motorsport). Gli utenti creano i propri eventi direttamente nell'app. Non ci sono API esterne di terze parti.

## Stack tecnico

**Backend:** Node.js + Express 5, MongoDB + Mongoose 8, JWT (jsonwebtoken), bcrypt  
**Frontend:** React 19, Vite 6, React Router 7, React Bootstrap 2, Bootstrap 5  
**Porta backend:** 3000 | **Porta frontend:** 5173

## Struttura cartelle

```
Final-Project/
├── Final Project Back/
│   ├── controllers/   eventController.js, userController.js
│   ├── models/        event.js, user.js
│   ├── routes/        eventRoutes.js, userRoutes.js
│   └── index.js
└── Final Project Front/my-Final-Project-app/
    └── src/
        ├── components/   EventListComponent, EventCardComponent, DetailButtonComponent,
        │                 FavoriteButtonComponent, NavBarComponent, CreateEvent,
        │                 LoginUserComponent, RegistrationComponent, LogOutComponent,
        │                 FeaturedCardComponent
        ├── router-dom-page/  HomePage (landing page), EventPage, EventDetailPage,
        │                     FavoriteEventPage, LoginUserPage, RegistrationPage,
        │                     CreateEventPage, AccountPage, ContactsPage
        └── App.jsx
```

## Variabili d'ambiente richieste

File `.env` in `Final Project Back/`:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=chiave_segreta_min_32_chars
PORT=3000
```

## Auth — token JWT in localStorage

Il token JWT viene salvato con la chiave `"token"` (non `"userId"`):
- Salvato al login: `localStorage.setItem('token', data.token)`
- Nome utente: `localStorage.setItem('nameUser', data.nameUser)` (il backend lo restituisce nel login)
- Letto nelle richieste protette: `localStorage.getItem('token')`
- Rimosso al logout: `localStorage.removeItem('token')` + `localStorage.removeItem('nameUser')`

## Branch di sviluppo

- `danny` — branch principale di sviluppo (lavoro dal PC)
- `claude/session-context-5u9bhj` — sessione remota Claude (web)
- `main` — produzione

**Flusso:** lavorare su `danny` (o branch remoto) → PR → `main`

## Design System (giugno 2026)

- **Background:** `#0d0d0d` | **Card:** `#141414` | **Border:** `#1e1e1e`
- **Accent:** `#7B2FFF` (viola) | **Accent hover:** `#9b5fff`
- **Testo primario:** `#ffffff` | **Testo secondario:** `#aaaaaa` | **Testo muted:** `#888888`
- **Font titoli:** Orbitron, Arial Black (uppercase, letter-spacing) | **Font corpo:** Arial
- **Navigazione:** sidebar fissa 220px su desktop, hamburger su mobile (≤991px)
- **Icone:** ionicons (`ion-icon`)

## Stato attuale (giugno 2026)

### Completato (fasi 1–6 del roadmap + pulizia + restyle UI)
- Auth: registrazione, login JWT, logout
- CRUD eventi: crea, leggi tutti, leggi per ID
- Preferiti: aggiungi/rimuovi/leggi dal DB (bug `.remove()` → `$pull` fixato)
- Frontend: tutte le pagine principali funzionanti, filtro per nome/città su EventPage
- Rimossa integrazione Eventbrite (non esistono API affidabili per eventi auto in Italia)
- Rimossi: MockEvents.js, MockEventsComponent.jsx, codice commentato, console.log di debug
- **Restyle UI completo** (branch danny, commit f6881b3):
  - Dark theme globale + accenti viola su tutti i componenti
  - NavBar → sidebar verticale desktop + hamburger mobile
  - HomePage: hero con immagine AI + sezione "Come funziona" (4 card statiche)
  - Card 04 "Come funziona": mostra "Registrati" se guest, "Bentornato + nome" se loggato
  - EventCardComponent: card dark, badge data viola, aspect-ratio 4:5
  - EventDetailPage: hero full-width + layout 2 colonne (testo | info card)
  - Login/Registration/Contacts/Favorites/EventPage: uniformati al design system

### Endpoint API backend

| Metodo | Path | Auth | Descrizione |
|--------|------|------|-------------|
| POST | /api/eventi/ | ✓ | Crea evento |
| GET | /api/eventi/ | — | Lista tutti gli eventi |
| GET | /api/eventi/:id | — | Evento per ID |
| POST | /api/user/register | — | Registrazione |
| POST | /api/user/login | — | Login → JWT |
| PUT | /api/user/eventi/:id/preferiti | ✓ | Aggiungi preferito |
| GET | /api/user/eventsFavourites | ✓ | Lista preferiti |
| DELETE | /api/user/eventi/:id/preferiti | ✓ | Rimuovi preferito |

### TODO (prossimi step)
- [ ] AccountPage: mostrare nameUser, data di nascita e dati profilo
- [ ] cleanupExpiredEvents.js: committare sul branch danny (cron job alle 02:00 che elimina eventi scaduti)
- [ ] Edit/Delete eventi da parte del creatore (endpoint PUT/DELETE + UI)
- [ ] Validazione form più robusta (Express Validator backend + validazione frontend)
- [ ] Paginazione lista eventi
- [ ] Google Auth (opzionale, da decidere)

## Come avviare il progetto

```bash
# Backend
cd "Final Project Back"
npm install
npm run dev   # nodemon index.js su porta 3000

# Frontend
cd "Final Project Front/my-Final-Project-app"
npm install
npm run dev   # Vite su porta 5173
```
