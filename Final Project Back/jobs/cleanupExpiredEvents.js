/*
 * cleanupExpiredEvents.js
 * Job schedulato che elimina automaticamente gli eventi scaduti.
 * Viene eseguito ogni giorno alle 02:00 tramite node-cron (registrato in index.js).
 * Un evento è "scaduto" quando la sua data è precedente alla mezzanotte di oggi.
 */

const Evento = require('../models/event.js');
const Utente = require('../models/user.js');
const { cloudinary } = require('../config/cloudinary.js');
const { extractPublicId } = require('../utils/cloudinaryUtils.js');

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
        await cloudinary.uploader.destroy(extractPublicId(evento.image));
      }
    }

    // Elimina esattamente gli stessi eventi di cui abbiamo già rimosso le immagini
    const ids = eventiScaduti.map(function(ev) { return ev._id });
    await Evento.deleteMany({ _id: { $in: ids } });

    // Rimuove gli eventi scaduti dai preferiti di tutti gli utenti che li avevano salvati
    await Utente.updateMany(
      {},
      { $pull: { eventFavorite: { _id: { $in: ids } } } }
    );

    console.log(`[cleanup] Eliminati ${eventiScaduti.length} eventi scaduti.`);
  } catch (err) {
    console.error('[cleanup] Errore durante la pulizia degli eventi scaduti:', err.message);
  }
}

module.exports = cleanupExpiredEvents;
