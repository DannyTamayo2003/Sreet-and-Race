/*
 * index.js — Entry point del server
 * Configura Express, connette MongoDB e registra le route dell'applicazione.
 * Il server gira sulla porta 3000 (o quella definita in .env).
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config(); // Carica le variabili d'ambiente da .env

const eventoRoutes = require('./routes/eventRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const cron = require('node-cron');
const cleanupExpiredEvents = require('./jobs/cleanupExpiredEvents.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Necessario su Render (e qualsiasi reverse proxy): senza questa riga express-rate-limit
// vede sempre l'IP del proxy invece di quello reale dell'utente, rendendo il rate limiting inutile.
app.set('trust proxy', 1);

// Header di sicurezza HTTP (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, ecc.)
app.use(helmet());

// CORS: in sviluppo usa localhost, in produzione legge il dominio da .env (CORS_ORIGIN=https://tuo-sito.com)
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin }));

// Limite 10kb: evita che payload enormi saturino la memoria del server
app.use(express.json({ limit: '10kb' }));

// Registra le route: ogni percorso viene gestito dal rispettivo router
app.use('/api/eventi', eventoRoutes);
app.use('/api/user', userRoutes);

// Global error handler: cattura errori lanciati dai controller e risponde sempre con JSON
app.use(function(err, req, res, next) {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || 'Errore interno del server' });
});

// Il server parte solo dopo che MongoDB è connesso.
// Se la connessione fallisce, il processo termina: è inutile accettare richieste senza DB.
mongoose.connect(process.env.MONGODB_URI)
  .then(function() {
    console.log('MongoDB connesso');
    cron.schedule('0 2 * * *', cleanupExpiredEvents);
    console.log('[cleanup] Job schedulato: ogni giorno alle 02:00');
    app.listen(PORT, function() {
      console.log('Server in ascolto sulla porta ' + PORT);
    });
  })
  .catch(function(err) {
    console.error('Errore connessione MongoDB:', err);
    process.exit(1);
  });
