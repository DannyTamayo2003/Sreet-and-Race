/*
 * cloudinary.js
 * Configura la connessione a Cloudinary usando le credenziali nel file .env.
 * Esporta l'istanza cloudinary e lo storage da usare con multer.
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Definisce dove e come salvare i file su Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'street-and-race',   // cartella su Cloudinary dove finiscono le immagini
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

module.exports = { cloudinary, storage };
