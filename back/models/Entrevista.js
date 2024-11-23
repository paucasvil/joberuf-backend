const mongoose = require('mongoose');

const entrevistaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  respuestas: [
    {
      pregunta: { type: String, required: true },
      respuesta: { type: String, required: true },
    },
  ],
  resultado: {
    puntuación: { type: Number },
    sugerencias: { type: String },
  },
});

module.exports = mongoose.model('Entrevista', entrevistaSchema);
