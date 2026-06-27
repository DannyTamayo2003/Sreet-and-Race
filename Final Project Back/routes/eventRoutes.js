/*
 * eventRoutes.js
 * Definisce le route per le operazioni sugli eventi.
 * La creazione di un evento richiede un token JWT valido (verificaToken).
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary.js');
const eventoController = require('../controllers/eventController.js');
const userController = require('../controllers/userController.js');
const { creazioneEventoRules } = require('../validators/eventValidators.js');

// multer usa lo storage Cloudinary: il file viene caricato direttamente nel cloud
const upload = multer({ storage });

// POST /api/eventi/ — Crea un nuovo evento (richiede token)
// Ordine: token → multer (processa FormData) → validazione → controller
router.post('/', userController.verificaToken, upload.single('image'), creazioneEventoRules, eventoController.createEvento);

// GET /api/eventi/ — Restituisce tutti gli eventi (pubblica, nessun token richiesto)
router.get('/', eventoController.getEventi);

// GET /api/eventi/:id — Restituisce un singolo evento per ID (pubblica)
router.get('/:id', eventoController.getEventoById);

// PUT /api/eventi/:id — Modifica un evento (richiede token, solo il creatore)
router.put('/:id', userController.verificaToken, upload.single('image'), creazioneEventoRules, eventoController.updateEvento);

// DELETE /api/eventi/:id — Elimina un evento (richiede token, solo il creatore)
router.delete('/:id', userController.verificaToken, eventoController.deleteEvento);

module.exports = router;
