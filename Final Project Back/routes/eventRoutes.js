/*
 * eventRoutes.js
 * Definisce le route per le operazioni sugli eventi.
 * La creazione di un evento richiede un token JWT valido (verificaToken).
 */

const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventController.js');
const userController = require('../controllers/userController.js');

// POST /api/eventi/ — Crea un nuovo evento (richiede token)
router.post('/', userController.verificaToken, eventoController.createEvento);

// GET /api/eventi/ — Restituisce tutti gli eventi (pubblica, nessun token richiesto)
router.get('/', eventoController.getEventi);

// GET /api/eventi/:id — Restituisce un singolo evento per ID (pubblica)
router.get('/:id', eventoController.getEventoById);

module.exports = router;
