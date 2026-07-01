// Estrae il public_id Cloudinary da un URL completo (gestisce nomi con più punti)
function extractPublicId(cloudinaryUrl) {
  const parts = cloudinaryUrl.split('/');
  const basename = parts[parts.length - 1];
  const nameParts = basename.split('.');
  const nameWithoutExt = nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : basename;
  return `street-and-race/${nameWithoutExt}`;
}

module.exports = { extractPublicId };
