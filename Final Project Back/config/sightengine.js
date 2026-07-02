/*
 * sightengine.js
 * Configura le credenziali per la moderazione immagini via Sightengine.
 * Attivo solo se IMAGE_MODERATION_ENABLED=true; in quel caso le credenziali
 * sono obbligatorie (fail fast) per non far partire il server in uno stato
 * a metà configurato.
 */

const moderationEnabled = process.env.IMAGE_MODERATION_ENABLED === 'true';

if (moderationEnabled) {
  const requiredVars = ['SIGHTENGINE_API_USER', 'SIGHTENGINE_API_SECRET'];
  requiredVars.forEach(function(key) {
    if (!process.env[key]) throw new Error(`Variabile d'ambiente mancante: ${key}`);
  });
}

const SIGHTENGINE_CHECK_URL = 'https://api.sightengine.com/1.0/check.json';

module.exports = {
  moderationEnabled,
  apiUser: process.env.SIGHTENGINE_API_USER,
  apiSecret: process.env.SIGHTENGINE_API_SECRET,
  checkUrl: SIGHTENGINE_CHECK_URL
};
