const curriculumSchema = new mongoose.Schema({
    ultimaActualizacion: Date,
    archivo: Boolean,
    feedback: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
});

module.exports = mongoose.model('Curriculum', curriculumSchema);
