/*
 * eventController.js
 * Gestisce la logica relativa agli eventi creati dagli utenti:
 * creazione, lettura di tutti gli eventi e lettura di un singolo evento per ID.
 */

const Evento = require('../models/event.js');
const Utente = require('../models/user.js');
const { cloudinary } = require('../config/cloudinary.js');
const { validationResult } = require('express-validator');
const { extractPublicId } = require('../utils/cloudinaryUtils.js');
const { moderateUploadedImage } = require('../utils/moderationUtils.js');

// CREA EVENTO: salva un nuovo evento nel database
exports.createEvento = async function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se multer aveva già caricato un'immagine su Cloudinary, la elimina per evitare file orfani
    if (req.file) {
      await cloudinary.uploader.destroy(extractPublicId(req.file.path));
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Controlla il contenuto dell'immagine prima di salvare l'evento: se non idonea,
    // moderateUploadedImage ha già eliminato l'asset da Cloudinary
    if (req.file) {
      const moderazione = await moderateUploadedImage(req.file);
      if (!moderazione.approved) {
        const message = moderazione.reason === 'error'
          ? 'Impossibile verificare l\'immagine in questo momento. Riprova più tardi.'
          : 'Immagine non consentita: contenuto non idoneo rilevato. Carica un\'altra immagine.';
        return res.status(422).json({ message });
      }
    }

    const datiEvento = { ...req.body };

    // Se multer ha ricevuto un file immagine, usa l'URL pubblico restituito da Cloudinary
    if (req.file) {
      datiEvento.image = req.file.path;
    }

    // Salva l'ID dell'utente loggato come creatore dell'evento
    datiEvento.creatorId = req.userId;

    const evento = new Evento(datiEvento);
    await evento.save();
    res.status(201).json(evento);
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// MODIFICA EVENTO: aggiorna i campi di un evento esistente (solo il creatore)
exports.updateEvento = async function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se multer aveva già caricato una nuova immagine su Cloudinary, la elimina
    if (req.file) {
      await cloudinary.uploader.destroy(extractPublicId(req.file.path));
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }

    // Blocca la modifica se l'utente loggato non è il creatore
    if (evento.creatorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Non autorizzato: non sei il creatore di questo evento' });
    }

    // Whitelist dei campi modificabili: impedisce che campi come creatorId vengano sovrascritti
    const campiConsentiti = ['nameEvent', 'description', 'data', 'location', 'geoRegion', 'geoProvince', 'orario', 'descrizioneDettagliata', 'organizzatore', 'via'];
    const aggiornamenti = {};
    campiConsentiti.forEach(function(campo) {
      if (req.body[campo] !== undefined) aggiornamenti[campo] = req.body[campo];
    });

    if (req.file) {
      // Controlla il contenuto della nuova immagine PRIMA di toccare quella vecchia:
      // se viene rifiutata, l'evento e l'immagine precedente restano intatti
      // (l'asset appena rifiutato è già stato eliminato da moderateUploadedImage)
      const moderazione = await moderateUploadedImage(req.file);
      if (!moderazione.approved) {
        const message = moderazione.reason === 'error'
          ? 'Impossibile verificare l\'immagine in questo momento. Riprova più tardi.'
          : 'Immagine non consentita: contenuto non idoneo rilevato. Carica un\'altra immagine.';
        return res.status(422).json({ message });
      }

      // Se l'evento aveva già un'immagine su Cloudinary, la elimina prima di salvare la nuova
      if (evento.image) {
        await cloudinary.uploader.destroy(extractPublicId(evento.image));
      }
      aggiornamenti.image = req.file.path;
    }

    const eventoAggiornato = await Evento.findByIdAndUpdate(req.params.id, aggiornamenti, { new: true });
    res.json(eventoAggiornato);
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// ELIMINA EVENTO: rimuove un evento dal database (solo il creatore)
exports.deleteEvento = async function(req, res) {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }

    // Blocca l'eliminazione se l'utente loggato non è il creatore
    if (evento.creatorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Non autorizzato: non sei il creatore di questo evento' });
    }

    // Se l'evento ha un'immagine su Cloudinary, la elimina prima di rimuovere il documento
    if (evento.image) {
      await cloudinary.uploader.destroy(extractPublicId(evento.image));
    }

    await Evento.findByIdAndDelete(req.params.id);

    // Rimuove l'evento dai preferiti di tutti gli utenti che lo avevano salvato
    await Utente.updateMany(
      {},
      { $pull: { eventFavorite: { _id: evento._id } } }
    );

    res.json({ message: 'Evento eliminato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// LEGGI TUTTI GLI EVENTI: supporta paginazione, ricerca e ordinamento via query params
// ?page=1&limit=20&search=testo&region=Lombardia&sort=date-desc|date-asc|name-asc
exports.getEventi = async function(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const search = (req.query.search || '').trim();
    const region = (req.query.region || '').trim();
    const sort = req.query.sort || 'date-desc';

    const filtro = {};
    if (search) {
      filtro.$or = [
        { nameEvent: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    if (region) {
      filtro.geoRegion = region;
    }

    let ordinamento = { data: -1 };
    if (sort === 'date-asc') ordinamento = { data: 1 };
    else if (sort === 'name-asc') ordinamento = { nameEvent: 1 };

    const total = await Evento.countDocuments(filtro);
    const eventi = await Evento.find(filtro)
      .sort(ordinamento)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ eventi, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
  }
};

// LEGGI EVENTO PER ID: restituisce un singolo evento tramite il suo ID
exports.getEventoById = async function(req, res) {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }
    res.json(evento);
  } catch (err) {
    res.status(500).json({ message: 'Errore interno del server' });
  }
};
