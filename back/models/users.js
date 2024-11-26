const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    apellidos: {
        type: String,
        required: true,
        trim: true,
    },
    contra: {
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        required: false,
        trim: true,
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /.+\@.+\..+/
    },
    sector: {
        type: String,
        required: false,
    },
    fecha: {
        type: Date,
        required: false,
    },
    rol: {
        type: String,
        default: 'usuario',
        enum: ['usuario', 'admin'],
    },
    fotoPerfil: { 
        type: String, 
        default: '' 
    },
    fechaRegistro: {
        type: Date,
        default: Date.now,
    },
    ultimoAcceso: {
        type: Date,
        default: null,
    },
    perfilCompleto: {
        type: Boolean,
        default: false,
    },
    habilidadesTecnicas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habilidad',
    }],
    habilidadesBlandas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habilidad',
    }],
    habilidadesPersonalizadas: [{
        type: String,
        trim: true,
    }],
    scores: { type: [Number], default: [] },
});

module.exports = mongoose.model('users', usuarioSchema);
