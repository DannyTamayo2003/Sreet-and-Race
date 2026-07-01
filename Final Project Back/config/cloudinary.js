/*
 * cloudinary.js
 * Configura la connessione a Cloudinary usando le credenziali nel file .env.
 * Esporta l'istanza cloudinary e lo storage da usare con multer.
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Fail fast: se mancano le credenziali Cloudinary il server non parte invece di crashare al primo upload
const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
requiredVars.forEach(function(key) {
  if (!process.env[key]) throw new Error(`Variabile d'ambiente mancante: ${key}`);
});

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
