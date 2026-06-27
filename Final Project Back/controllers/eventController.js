/*
 * eventController.js
 * Gestisce la logica relativa agli eventi creati dagli utenti:
 * creazione, lettura di tutti gli eventi e lettura di un singolo evento per ID.
 */

const Evento = require('../models/event.js');
const { cloudinary } = require('../config/cloudinary.js');
const { validationResult } = require('express-validator');

// CREA EVENTO: salva un nuovo evento nel database
exports.createEvento = async function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se multer aveva già caricato un'immagine su Cloudinary, la elimina per evitare file orfani
    if (req.file) {
      const urlParts = req.file.path.split('/');
      const filenameWithExt = urlParts[urlParts.length - 1];
      const filename = filenameWithExt.split('.')[0];
      await cloudinary.uploader.destroy(`street-and-race/${filename}`);
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const datiEvento = { ...req.body };

    // Se multer ha ricevuto un file immagine, usa l'URL pubblico restituito da Cloudinary
    if (req.file) {
      datiEvento.image = req.file.path;
    }

    // Salva l'ID dell'utente loggato come creatore dell'evento
    datiEvento.creatorId = req.userId;

    const evento = new Evento(datiEvento);
    await evento.save();
    res.status(201).json(evento);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// MODIFICA EVENTO: aggiorna i campi di un evento esistente (solo il creatore)
exports.updateEvento = async function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se multer aveva già caricato una nuova immagine su Cloudinary, la elimina
    if (req.file) {
      const urlParts = req.file.path.split('/');
      const filenameWithExt = urlParts[urlParts.length - 1];
      const filename = filenameWithExt.split('.')[0];
      await cloudinary.uploader.destroy(`street-and-race/${filename}`);
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }

    // Blocca la modifica se l'utente loggato non è il creatore
    if (evento.creatorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Non autorizzato: non sei il creatore di questo evento' });
    }

    const aggiornamenti = { ...req.body };

    // Se è stata caricata una nuova immagine, usa l'URL pubblico restituito da Cloudinary
    if (req.file) {
      aggiornamenti.image = req.file.path;
    }

    const eventoAggiornato = await Evento.findByIdAndUpdate(req.params.id, aggiornamenti, { new: true });
    res.json(eventoAggiornato);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ELIMINA EVENTO: rimuove un evento dal database (solo il creatore)
exports.deleteEvento = async function(req, res) {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }

    // Blocca l'eliminazione se l'utente loggato non è il creatore
    if (evento.creatorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Non autorizzato: non sei il creatore di questo evento' });
    }

    // Se l'evento ha un'immagine su Cloudinary, la elimina prima di rimuovere il documento
    if (evento.image) {
      // L'URL Cloudinary è tipo: https://res.cloudinary.com/cloud/image/upload/v123/street-and-race/nomefile.jpg
      // Il public_id è tutto ciò che viene dopo l'ultimo '/' senza estensione, con il prefisso della cartella
      const urlParts = evento.image.split('/');
      const filenameWithExt = urlParts[urlParts.length - 1];
      const filename = filenameWithExt.split('.')[0];
      const publicId = `street-and-race/${filename}`;
      await cloudinary.uploader.destroy(publicId);
    }

    await Evento.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evento eliminato con successo' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LEGGI TUTTI GLI EVENTI: restituisce la lista completa degli eventi nel database
exports.getEventi = async function(req, res) {
  try {
    const eventi = await Evento.find();
    res.json(eventi);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LEGGI EVENTO PER ID: restituisce un singolo evento tramite il suo ID
exports.getEventoById = async function(req, res) {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }
    res.json(evento);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
