/*
 * cleanupOrphanFavorites.js — Script one-shot
 * Rimuove dai preferiti di tutti gli utenti gli eventi che non esistono più nel database.
 * Da lanciare una volta sola dalla cartella "Final Project Back":
 *   node scripts/cleanupOrphanFavorites.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Utente = require('../models/user.js');
const Evento = require('../models/event.js');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connesso.');

  // Prendi solo gli utenti che hanno almeno un preferito
  const utenti = await Utente.find({ 'eventFavorite.0': { $exists: true } });
  console.log(`Utenti con preferiti: ${utenti.length}`);

  let totaleRimossi = 0;

  for (const utente of utenti) {
    const idsPreferiti = utente.eventFavorite.map(function(ev) { return ev._id });

    // Quali di questi eventi esistono ancora in Events?
    const esistenti = await Evento.find({ _id: { $in: idsPreferiti } }).select('_id');
    const idsEsistenti = new Set(esistenti.map(function(ev) { return ev._id.toString() }));

    const idsDaRimuovere = idsPreferiti.filter(function(id) {
      return !idsEsistenti.has(id.toString());
    });

    if (idsDaRimuovere.length > 0) {
      await Utente.findByIdAndUpdate(
        utente._id,
        { $pull: { eventFavorite: { _id: { $in: idsDaRimuovere } } } }
      );
      console.log(`${utente.nameUser}: rimossi ${idsDaRimuovere.length} preferiti orfani`);
      totaleRimossi += idsDaRimuovere.length;
    }
  }

  console.log(`\nPulizia completata. Totale preferiti orfani rimossi: ${totaleRimossi}`);
  await mongoose.disconnect();
}

run().catch(function(err) {
  console.error('Errore:', err.message);
  process.exit(1);
});
