/*
 * event.js
 * Schema Mongoose per il modello Evento.
 * Definisce la struttura dei dati salvati nella collezione "Events" di MongoDB.
 * Gli eventi sono creati direttamente dagli utenti dell'app.
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    image: { type: String },                            // URL dell'immagine dell'evento (opzionale)
    nameEvent: { type: String, required: true },        // Nome dell'evento (obbligatorio)
    location: { type: String, required: true },         // Città o luogo dell'evento (obbligatorio)
    data: { type: Date, required: true },               // Data dell'evento (obbligatorio)
    description: { type: String, required: true },      // Descrizione breve (obbligatorio)

    // Campi opzionali per maggiori dettagli sull'evento
    orario: { type: String },                           // Orario dell'evento (es. "15:30")
    descrizioneDettagliata: { type: String },           // Descrizione estesa
    organizzatore: { type: String },                    // Nome dell'organizzatore

    // Posizione geografica: utile per il filtro di ricerca per regione
    geoRegion: { type: String },                        // Regione italiana (es. "Lombardia")
    geoProvince: { type: String }                       // Provincia (es. "Milano")
});

const Event = mongoose.model('Event', eventSchema, 'Events');
module.exports = Event;
