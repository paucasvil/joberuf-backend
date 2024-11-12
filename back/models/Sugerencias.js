const sugerenciasSchema = new mongoose.Schema({
    feedback: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
});

module.exports = mongoose.model('Sugerencias', sugerenciasSchema);
