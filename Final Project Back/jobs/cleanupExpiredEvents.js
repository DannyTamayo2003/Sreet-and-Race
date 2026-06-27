/*
 * cleanupExpiredEvents.js
 * Job schedulato che elimina automaticamente gli eventi scaduti.
 * Viene eseguito ogni giorno alle 02:00 tramite node-cron (registrato in index.js).
 * Un evento è "scaduto" quando la sua data è precedente alla mezzanotte di oggi.
 */

const Evento = require('../models/event.js');
const { cloudinary } = require('../config/cloudinary.js');

async function cleanupExpiredEvents() {
  try {
    // Mezzanotte di oggi: tutti gli eventi con data prima di questo momento sono scaduti
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const eventiScaduti = await Evento.find({ data: { $lt: oggi } });

    if (eventiScaduti.length === 0) {
      console.log('[cleanup] Nessun evento scaduto da eliminare.');
      return;
    }

    // Elimina le immagini da Cloudinary per ogni evento scaduto
    for (const evento of eventiScaduti) {
      if (evento.image) {
        const urlParts = evento.image.split('/');
        const filenameWithExt = urlParts[urlParts.length - 1];
        const filename = filenameWithExt.split('.')[0];
        await cloudinary.uploader.destroy(`street-and-race/${filename}`);
      }
    }

    // Elimina tutti gli eventi scaduti dal DB in una sola operazione
    await Evento.deleteMany({ data: { $lt: oggi } });

    console.log(`[cleanup] Eliminati ${eventiScaduti.length} eventi scaduti.`);
  } catch (err) {
    console.error('[cleanup] Errore durante la pulizia degli eventi scaduti:', err.message);
  }
}

module.exports = cleanupExpiredEvents;
