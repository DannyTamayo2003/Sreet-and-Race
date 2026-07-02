/*
 * moderationUtils.js
 * Controlla il contenuto di un'immagine appena caricata su Cloudinary
 * tramite Sightengine, prima che l'evento venga salvato/aggiornato.
 * Non lancia mai eccezioni: risolve sempre { approved, reason, detail }
 * così i controller possono gestire l'esito senza try/catch aggiuntivi.
 */

const { cloudinary } = require('../config/cloudinary.js');
const { extractPublicId } = require('./cloudinaryUtils.js');
const sightengine = require('../config/sightengine.js');

// Sopra questa soglia (0-1) il contenuto viene considerato non idoneo
const REJECTION_THRESHOLD = 0.5;

// Distrugge l'asset su Cloudinary senza far fallire il chiamante se la destroy stessa va in errore
async function destroyBestEffort(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[moderation] impossibile eliminare asset dopo rifiuto:', publicId, err.message);
  }
}

async function moderateUploadedImage(file) {
  if (!sightengine.moderationEnabled) {
    return { approved: true, reason: 'skipped', detail: 'Moderazione disattivata (IMAGE_MODERATION_ENABLED non attivo).' };
  }

  const publicId = extractPublicId(file.path);

  try {
    const params = new URLSearchParams({
      url: file.path,
      models: 'nudity-2.1,offensive,gore',
      api_user: sightengine.apiUser,
      api_secret: sightengine.apiSecret
    });

    const response = await fetch(`${sightengine.checkUrl}?${params.toString()}`);
    const result = await response.json();

    if (result.status !== 'success') {
      console.error('[moderation] Sightengine API error:', result.error || result);
      await destroyBestEffort(publicId);
      return { approved: false, reason: 'error', detail: 'Risposta inattesa da Sightengine.' };
    }

    const scores = [
      result.nudity?.sexual_activity,
      result.nudity?.sexual_display,
      result.nudity?.erotica,
      result.offensive?.prob,
      result.gore?.prob
    ].filter(function(score) { return typeof score === 'number'; });

    const isFlagged = scores.some(function(score) { return score >= REJECTION_THRESHOLD; });

    if (isFlagged) {
      console.error('[moderation] content rejected:', publicId, { scores });
      await destroyBestEffort(publicId);
      return { approved: false, reason: 'rejected', detail: 'Contenuto non idoneo rilevato da Sightengine.' };
    }

    return { approved: true, reason: 'approved', detail: 'Immagine approvata.' };
  } catch (err) {
    console.error('[moderation] Sightengine API error:', err.message);
    await destroyBestEffort(publicId);
    return { approved: false, reason: 'error', detail: 'Impossibile verificare l\'immagine in questo momento.' };
  }
}

module.exports = { moderateUploadedImage };
