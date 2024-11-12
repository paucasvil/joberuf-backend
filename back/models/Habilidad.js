const habilidadSchema = new mongoose.Schema({
    nombre: String,
    categoria: String,
    descripcion: String,
});

module.exports = mongoose.model('Habilidad', habilidadSchema);
