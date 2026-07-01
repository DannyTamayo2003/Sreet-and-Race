/*
 * eventValidators.js
 * Regole di validazione per gli endpoint degli eventi.
 * Devono stare DOPO multer nella catena middleware, perché multer
 * deve processare il FormData prima che i campi siano leggibili in req.body.
 */

const { body } = require('express-validator');

const creazioneEventoRules = [
  body('nameEvent')
    .trim()
    .notEmpty().withMessage('Il nome evento è obbligatorio')
    .isLength({ max: 50 }).withMessage('Il nome evento non può superare 50 caratteri'),

  body('description')
    .trim()
    .notEmpty().withMessage('La descrizione è obbligatoria')
    .isLength({ max: 150 }).withMessage('La descrizione non può superare 150 caratteri'),

  body('location')
    .trim()
    .notEmpty().withMessage('La città è obbligatoria'),

  body('geoRegion')
    .trim()
    .notEmpty().withMessage('La regione è obbligatoria'),

  body('orario')
    .trim()
    .notEmpty().withMessage("L'orario è obbligatorio"),

  body('data')
    .notEmpty().withMessage('La data è obbligatoria')
    .isISO8601().withMessage('Formato data non valido')
    .custom(function(value) {
      if (new Date(value) <= new Date()) {
        throw new Error("La data dell'evento deve essere nel futuro");
      }
      return true;
    })
];

module.exports = { creazioneEventoRules };
