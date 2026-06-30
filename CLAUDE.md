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
│   ├── config/        cloudinary.js
│   ├── controllers/   eventController.js, userController.js
│   ├── jobs/          cleanupExpiredEvents.js (cron 02:00, elimina eventi scaduti)
│   ├── models/        event.js, user.js
│   ├── routes/        eventRoutes.js, userRoutes.js
│   ├── validators/    eventValidators.js, userValidators.js (express-validator)
│   └── index.js
└── Final Project Front/my-Final-Project-app/
    └── src/
        ├── components/   EventListComponent, EventCardComponent, DetailButtonComponent,
        │                 FavoriteButtonComponent, NavBarComponent, CreateEvent,
        │                 LoginUserComponent, RegistrationComponent, LogOutComponent,
        │                 FeaturedCardComponent, FiltersComponent, EventDetailComponent
        ├── router-dom-page/  HomePage (landing page), EventPage, EventDetailPage,
        │                     FavoriteEventPage, LoginUserPage, RegistrationPage,
        │                     CreateEventPage, EditEventPage, AccountPage, ContactsPage,
        │                     AdminPanelPage
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

- `danny` — branch principale di sviluppo (lavoro dal PC di Danny)
- `claude/session-context-5u9bhj` — **unico branch remoto Claude** (non crearne altri); le sessioni Claude lavorano qui e pushano su `danny`
- `main` — produzione

**Branch remoti esistenti:** `main`, `danny`, `claude/session-context-5u9bhj`  
**NON creare nuovi branch Claude** — usare sempre `claude/session-context-5u9bhj` per le sessioni remote.

**Flusso git Claude:**
1. Lavorare localmente sul branch della sessione corrente (es. `claude/project-aesthetics-review-9u7nkf`)
2. Pushare su `claude/session-context-5u9bhj`: `git push origin HEAD:claude/session-context-5u9bhj`
3. Pushare su `danny`: `git push origin HEAD:danny`
4. Commit con `user.name=Claude`, `user.email=noreply@anthropic.com`  
**IMPORTANTE:** mai fare `git checkout danny` per committare direttamente.

## Design System (giugno 2026)

- **Background:** `#0d0d0d` | **Card:** `#141414` | **Border:** `#1e1e1e`
- **Accent:** `#7B2FFF` (viola) | **Accent hover:** `#9b5fff`
- **Testo primario:** `#ffffff` | **Testo secondario:** `#aaaaaa` | **Testo muted:** `#888888`
- **Font titoli:** Orbitron, Arial Black (uppercase, letter-spacing) | **Font corpo:** Arial
- **Navigazione:** sidebar fissa 220px su desktop, hamburger su mobile (≤991px)
- **Icone:** ionicons (`ion-icon`)

## Stato attuale (giugno 2026)

### Completato
- Auth: registrazione, login JWT, logout; login restituisce `nameUser` salvato in localStorage
- CRUD eventi completo: crea, leggi tutti, leggi per ID, modifica (solo creatore), elimina (solo creatore)
- Upload immagini eventi via Cloudinary (multer + cloudinary storage, max 5MB, solo immagini)
- Preferiti: aggiungi/rimuovi/leggi dal DB (bug `.remove()` → `$pull` fixato)
- Validazione backend con express-validator (registrazione + creazione evento)
- Rate limiting login: max 10 tentativi per IP ogni 15 minuti
- Paginazione lista eventi (EventListComponent)
- Filtri per nome/città su EventPage (FiltersComponent)
- Cron job pulizia: `jobs/cleanupExpiredEvents.js` elimina eventi scaduti ogni notte alle 02:00
- Rimossa integrazione Eventbrite; rimossi: MockEvents.js, MockEventsComponent.jsx, codice commentato
- **Restyle UI completo** (dark theme + accenti viola):
  - NavBar → sidebar verticale desktop (220px) + hamburger mobile
  - HomePage: hero con immagine AI + sezione "Come funziona" (4 card)
    - Card 01 "Esplora": sfondo `gear-bg.png` (garage neon), icona `search-outline`
    - Card 02 "Salva": sfondo `map-italy-bg.png` (mappa Italia neon), icona `heart-outline`
    - Card 03 "Crea": **senza sfondo** (`bg: null`) — immagine `race-bg.png` da aggiungere quando disponibile
    - Card 04: dinamica — "Registrati" se guest, "Bentornato + nome" con bordo verde se loggato
    - Icone neon: colore `#ff00e6`, glow `drop-shadow(0 0 8px #ff00e6) drop-shadow(0 0 18px #3c00ff)`
    - Card 04 loggato: icona verde `#00ff88`, bordo `#00ff88`
  - EventCardComponent: card dark, badge data viola, aspect-ratio 4:5
  - EventDetailPage: hero full-width + layout 2 colonne (testo | info card)
  - AccountPage: dark design system — header profilo (avatar ion-icon, nome, email), info card (nome/email/data nascita), lista eventi con miniatura + bottoni Modifica/Elimina, bottone Logout
  - EditEventPage: form di modifica evento (pre-compilato con dati esistenti)
  - Login/Registration/Contacts/Favorites/EventPage: uniformati al design system
  - MockEventsStyle.css: card dark `#181818`, titoli `#fff200`, bordo `#3c00ff`
  - EventPageStyle.css: search input dark `#1a1a1a`, focus border `#7B2FFF`

### Endpoint API backend

| Metodo | Path | Auth | Descrizione |
|--------|------|------|-------------|
| POST | /api/eventi/ | ✓ | Crea evento (multipart/form-data, upload Cloudinary) |
| GET | /api/eventi/ | — | Lista tutti gli eventi (paginata) |
| GET | /api/eventi/:id | — | Evento per ID |
| PUT | /api/eventi/:id | ✓ | Modifica evento (solo creatore) |
| DELETE | /api/eventi/:id | ✓ | Elimina evento (solo creatore) |
| POST | /api/user/register | — | Registrazione (con validazione) |
| POST | /api/user/login | — | Login → JWT + nameUser (rate limited) |
| GET | /api/user/profile | ✓ | Dati profilo utente loggato |
| GET | /api/user/myEvents | ✓ | Eventi creati dall'utente loggato |
| PUT | /api/user/eventi/:id/preferiti | ✓ | Aggiungi preferito |
| GET | /api/user/eventsFavourites | ✓ | Lista preferiti |
| DELETE | /api/user/eventi/:id/preferiti | ✓ | Rimuovi preferito |

### TODO (prossimi step)
- [ ] Aggiungere `race-bg.png` in `src/assets/` + import in `HomePage.jsx` per Card 03 "Crea" (`bg: null` → `bg: raceImg`)
- [ ] Validazione form frontend (lato client, prima dell'invio)
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
