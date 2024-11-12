const mongoose = require('mongoose');

const entrevistaSchema = new mongoose.Schema({
  fechaSimulacion: { type: Date, default: Date.now },
  feedback: { type: String },
  pregunta: { type: String, required: true },
  resultado: { type: String },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
});

const Entrevista = mongoose.model('Entrevista', entrevistaSchema);
module.exports = Entrevista;
