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
// fileFilter accetta solo immagini; limits.fileSize blocca file superiori a 5MB
const upload = multer({
  storage,
  fileFilter: function(req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato file non supportato. Carica un\'immagine (jpg, png, webp).'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB massimo
});

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

// Gestisce gli errori di multer (file non supportato, troppo grande) restituendo JSON pulito
router.use(function(err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Il file è troppo grande. Massimo 5MB.' });
  }
  if (err.message && err.message.includes('Formato file non supportato')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = router;
