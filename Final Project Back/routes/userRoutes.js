/*
 * userRoutes.js
 * Definisce le route per le operazioni sugli utenti.
 * Le route protette richiedono un token JWT valido (verificaToken).
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const userController = require('../controllers/userController.js');
const { registrazioneRules } = require('../validators/userValidators.js');

// Max 10 tentativi di login ogni 15 minuti per IP — protezione brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Troppi tentativi di login. Riprova tra 15 minuti.' }
});

// POST /api/user/register — Registra un nuovo utente (nessuna autenticazione richiesta)
router.post('/register', registrazioneRules, userController.createUtente);

// POST /api/user/login — Login con email e password, restituisce un token JWT
router.post('/login', loginLimiter, userController.loginUtente);

// GET /api/user/profile — Restituisce i dati del profilo dell'utente loggato (richiede token)
router.get('/profile', userController.verificaToken, userController.getProfile);

// GET /api/user/myEvents — Restituisce gli eventi creati dall'utente loggato (richiede token)
router.get('/myEvents', userController.verificaToken, userController.getMyEvents);

// PUT /api/user/eventi/:id/preferiti — Aggiunge un evento ai preferiti (richiede token)
router.put('/eventi/:id/preferiti', userController.verificaToken, userController.putEventoPreferito);

// GET /api/user/eventsFavourites — Restituisce la lista dei preferiti dell'utente (richiede token)
router.get('/eventsFavourites', userController.verificaToken, userController.getEventiPreferiti);

// DELETE /api/user/eventi/:id/preferiti — Rimuove un evento dai preferiti (richiede token)
router.delete('/eventi/:id/preferiti', userController.verificaToken, userController.deleteEventoPreferito);

module.exports = router;
