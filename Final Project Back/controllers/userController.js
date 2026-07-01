/*
 * userController.js
 * Gestisce tutta la logica relativa agli utenti:
 * registrazione, login, verifica del token JWT e gestione degli eventi preferiti.
 */

const Utente = require('../models/user.js');
const Evento = require('../models/event.js');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// REGISTRAZIONE: crea un nuovo utente nel database con la password criptata
exports.createUtente = async function(req, res) {
  // Controlla se la validazione ha trovato errori (definita in userValidators.js)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Controlla se esiste già un utente con questa email
    const esistente = await Utente.findOne({ emailUser: req.body.emailUser });
    if (esistente) {
      return res.status(400).json({ message: 'Esiste già un account con questa email' });
    }

    const pwdHash = await bcrypt.hash(req.body.pwdUser, 10);

    const utente = new Utente({
      nameUser: req.body.nameUser,
      emailUser: req.body.emailUser,
      pwdUser: pwdHash,
      dateOfBirth: req.body.dateOfBirth
    });
    await utente.save();

    // Risposta senza password: non esporre mai il hash bcrypt al client
    res.status(201).json({ _id: utente._id, nameUser: utente.nameUser, emailUser: utente.emailUser });
  } catch (err) {
    // Codice 11000 = email duplicata (violazione constraint unique)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Esiste già un account con questa email' });
    }
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// LOGIN: verifica le credenziali e restituisce un token JWT se sono corrette
exports.loginUtente = async function(req, res) {
  const { emailUser, pwdUser } = req.body;

  // Controlla che email e password siano presenti nel body
  if (!emailUser || !pwdUser) {
    return res.status(400).json({ message: 'Email e password sono obbligatorie' });
  }

  try {
    // Cerca l'utente nel database tramite email
    const utente = await Utente.findOne({ emailUser });
    if (!utente) {
      // Messaggio generico: non rivela se l'email esiste o no nel sistema
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // bcrypt.compare confronta la password inserita con quella criptata salvata nel database.
    // Non è possibile decifrare la password: bcrypt la ricripta e confronta il risultato.
    const isPasswordValid = await bcrypt.compare(pwdUser, utente.pwdUser);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    // jwt.sign crea un token che contiene l'ID dell'utente (payload).
    // Il token è firmato con JWT_SECRET (chiave segreta) e scade dopo 1 ora.
    // Il frontend deve includere questo token in ogni richiesta protetta.
    const token = jwt.sign({ userId: utente._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login riuscito!', token: token, nameUser: utente.nameUser });
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
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

    // $addToSet aggiunge l'elemento solo se non è già presente nell'array (operazione atomica)
    await Utente.findByIdAndUpdate(
      req.userId,
      { $addToSet: { eventFavorite: evento.toJSON() } }
    );

    res.status(200).json({ message: 'Evento aggiunto ai preferiti' });
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
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
    res.status(500).json({ message: 'Errore interno del server.' });
  }
};

// PROFILO UTENTE: restituisce i dati dell'utente loggato (senza password)
exports.getProfile = async function(req, res) {
  try {
    // select('-pwdUser') esclude il campo password dalla risposta per sicurezza
    const utente = await Utente.findById(req.userId).select('-pwdUser');
    if (!utente) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.json(utente);
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// EVENTI DELL'UTENTE: restituisce tutti gli eventi creati dall'utente loggato
exports.getMyEvents = async function(req, res) {
  try {
    const eventi = await Evento.find({ creatorId: req.userId });
    res.json(eventi);
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
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
      { $pull: { eventFavorite: { _id: new mongoose.Types.ObjectId(req.params.id) } } },
      { new: true }
    );

    if (!utente) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.status(200).json(utente);
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
  }
};
