/*
 * eventController.js
 * Gestisce la logica relativa agli eventi creati dagli utenti:
 * creazione, lettura di tutti gli eventi e lettura di un singolo evento per ID.
 */

const Evento = require('../models/event.js');

// CREA EVENTO: salva un nuovo evento nel database
exports.createEvento = async function(req, res) {
  try {
    const evento = new Evento(req.body);
    await evento.save();
    res.status(201).json(evento);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
