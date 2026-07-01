/*
 * user.js
 * Schema Mongoose per il modello Utente.
 * Definisce la struttura dei dati salvati nella collezione "Users" di MongoDB.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    imageUser: { type: String },                        // URL dell'immagine profilo (opzionale)
    nameUser: { type: String, required: true },         // Nome e cognome dell'utente
    dateOfBirth: { type: Date, required: true },        // Data di nascita
    emailUser: { type: String, required: true, unique: true }, // Email (usata per il login, deve essere unica)
    pwdUser: { type: String, required: true },          // Password criptata con bcrypt

    // Lista degli eventi preferiti dell'utente.
    // Salviamo una copia dei dati principali dell'evento invece del solo ID,
    // così possiamo mostrare i preferiti senza fare richieste aggiuntive al database.
    eventFavorite: [
        {
            image: { type: String },                    // Immagine dell'evento
            nameEvent: { type: String },                // Nome dell'evento
            data: { type: Date },                       // Data dell'evento
            location: { type: String },                 // Città/luogo dell'evento
            description: { type: String }              // Descrizione breve
        }
    ]
});

const User = mongoose.model('User', userSchema, 'Users');
module.exports = User;
