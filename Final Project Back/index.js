/*
 * index.js — Entry point del server
 * Configura Express, connette MongoDB e registra le route dell'applicazione.
 * Il server gira sulla porta 3000 (o quella definita in .env).
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Carica le variabili d'ambiente da .env

const eventoRoutes = require('./routes/eventRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Permette al frontend (porta 5173) di fare richieste al backend (porta 3000)
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Interpreta il body delle richieste come JSON
app.use(express.json());

// Connessione a MongoDB tramite la stringa URI definita in .env
mongoose.connect(process.env.MONGODB_URI)
  .then(function() {
    console.log('MongoDB connesso');
  })
  .catch(function(err) {
    console.error('Errore connessione MongoDB:', err);
  });

// Registra le route: ogni percorso viene gestito dal rispettivo router
app.use('/api/eventi', eventoRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, function() {
  console.log('Server in ascolto sulla porta ' + PORT);
});
