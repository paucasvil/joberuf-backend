const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,  // Elimina espacios en blanco al inicio y final
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
        unique: true,  // Asegura que el correo sea único
        trim: true,
        match: /.+\@.+\..+/  // Valida el formato de correo
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
        default: 'usuario',  // Valor por defecto, puede ser 'admin' o 'usuario'
        enum: ['usuario', 'admin'], // Limita los valores posibles
    },
    fotoPerfil: { 
        type: String, 
        default: '' 
    },
    fechaRegistro: {
        type: Date,
        default: Date.now,  // Establece la fecha de registro al momento actual
    },
    ultimoAcceso: {
        type: Date,
        default: null,
    },
    perfilCompleto: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('users', usuarioSchema);
