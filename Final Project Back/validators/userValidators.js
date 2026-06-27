/*
 * userValidators.js
 * Regole di validazione per gli endpoint utente (registrazione, login).
 * Vengono usate come middleware nelle route, prima che la richiesta arrivi al controller.
 */

const { body } = require('express-validator');

// Regole per la registrazione di un nuovo utente
const registrazioneRules = [
  body('nameUser')
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio')
    .isLength({ min: 2 }).withMessage('Il nome deve avere almeno 2 caratteri'),

  body('emailUser')
    .trim()
    .notEmpty().withMessage("L'email è obbligatoria")
    .isEmail().withMessage('Inserisci un indirizzo email valido'),

  body('pwdUser')
    .notEmpty().withMessage('La password è obbligatoria')
    .isLength({ min: 8 }).withMessage('La password deve avere almeno 8 caratteri'),

  body('dateOfBirth')
    .notEmpty().withMessage('La data di nascita è obbligatoria')
    .isISO8601().withMessage('Formato data non valido')
    // la data non può essere nel futuro
    .custom(function(value) {
      if (new Date(value) >= new Date()) {
        throw new Error('La data di nascita non può essere nel futuro');
      }
      return true;
    })
];

module.exports = { registrazioneRules };
