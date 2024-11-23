// Habilidad.js
const mongoose = require('mongoose');

const habilidadSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  categoria: { type: String, required: true },
});

module.exports = mongoose.model('Habilidad', habilidadSchema);
