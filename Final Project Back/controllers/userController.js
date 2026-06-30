/*
 * userController.js
 * Gestisce tutta la logica relativa agli utenti:
 * registrazione, login, verifica del token JWT e gestione degli eventi preferiti.
 */

const Utente = require('../models/user.js');
const Evento = require('../models/event.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// REGISTRAZIONE: crea un nuovo utente nel database con la password criptata
exports.createUtente = async function(req, res) {
  try {
    // bcrypt.hash cripta la password con 10 "salt rounds".
    // Il numero indica quante volte l'algoritmo viene applicato: più è alto,
    // più la crittografia è sicura ma lenta. 10 è lo standard consigliato.
    req.body.pwdUser = await bcrypt.hash(req.body.pwdUser, 10);

    const utente = new Utente(req.body);
    await utente.save();

    res.status(201).json(utente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// LOGIN: verifica le credenziali e restituisce un token JWT se sono corrette
exports.loginUtente = async function(req, res) {
  try {
    const emailUser = req.body.emailUser;

    // Cerca l'utente nel database tramite email
    const utente = await Utente.findOne({ emailUser });
    if (!utente) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // bcrypt.compare confronta la password inserita con quella criptata salvata nel database.
    // Non è possibile decifrare la password: bcrypt la ricripta e confronta il risultato.
    const isPasswordValid = await bcrypt.compare(req.body.pwdUser, utente.pwdUser);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password errata' });
    }

    // jwt.sign crea un token che contiene l'ID dell'utente (payload).
    // Il token è firmato con JWT_SECRET (chiave segreta) e scade dopo 1 ora.
    // Il frontend deve includere questo token in ogni richiesta protetta.
    const token = jwt.sign({ userId: utente._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login riuscito!', token: token, nameUser: utente.nameUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MIDDLEWARE - VERIFICA TOKEN: controlla che la richiesta contenga un token JWT valido.
// Viene eseguito prima di ogni endpoint che richiede autenticazione.
// Se il token è valido, aggiunge req.userId e chiama next() per passare al controller successivo.
exports.verificaToken = function(req, res, next) {
  // Il token arriva nell'header Authorization nel formato: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Prende solo la parte dopo "Bearer "

  if (!token) {
    return res.status(401).json({ message: 'Token mancante' });
  }

  // jwt.verify decodifica il token e verifica che sia stato firmato con la chiave segreta corretta
  jwt.verify(token, process.env.JWT_SECRET, function(err, payload) {
    if (err) {
      return res.status(403).json({ message: 'Token non valido' });
    }

    // Salva l'ID utente nella richiesta così i controller successivi possono usarlo
    req.userId = payload.userId;
    next();
  });
};

// AGGIUNGI PREFERITO: aggiunge un evento alla lista dei preferiti dell'utente
exports.putEventoPreferito = async function(req, res) {
  try {
    // Cerca l'evento nel database tramite l'ID passato nell'URL
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }

    // Cerca l'utente tramite l'ID estratto dal token JWT
    const utente = await Utente.findById(req.userId);
    if (!utente) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Controlla se l'evento è già nei preferiti per evitare duplicati
    const alreadyExists = utente.eventFavorite.some(function(ev) {
      return ev._id.toString() === evento._id.toString();
    });
    if (alreadyExists) {
      return res.status(400).json({ message: 'Evento già nei preferiti' });
    }

    // Salviamo una copia completa dell'evento invece del solo ID,
    // così possiamo mostrare i preferiti senza dover fare un'altra richiesta al database.
    utente.eventFavorite.push(evento.toJSON());
    await utente.save();

    res.status(200).json(utente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LEGGI PREFERITI: restituisce la lista degli eventi preferiti dell'utente autenticato
exports.getEventiPreferiti = async function(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Autenticazione richiesta: ID utente non trovato.' });
    }

    const utente = await Utente.findById(userId);
    if (!utente) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }

    res.status(200).json(utente.eventFavorite);
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server.', error: err.message });
  }
};

// RIMUOVI PREFERITO: rimuove un evento dalla lista dei preferiti dell'utente
exports.deleteEventoPreferito = async function(req, res) {
  try {
    // $pull è un operatore MongoDB che rimuove dall'array tutti gli elementi
    // che corrispondono alla condizione specificata.
    // { new: true } fa restituire il documento aggiornato invece di quello precedente.
    const utente = await Utente.findByIdAndUpdate(
      req.userId,
      { $pull: { eventFavorite: { _id: req.params.id } } },
      { new: true }
    );

    if (!utente) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.status(200).json(utente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
