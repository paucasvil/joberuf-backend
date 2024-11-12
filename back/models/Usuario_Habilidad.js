const usuarioHabilidadSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    habilidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Habilidad' },
    nivelDominio: Number,
});

module.exports = mongoose.model('Usuario_Habilidad', usuarioHabilidadSchema);
