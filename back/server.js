// back/server.js
const express = require('express');
const connectToDatabase = require('./database');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const authMiddleware = require('./middlewares/authMiddleware');


dotenv.config(); // Cargar variables de entorno desde el archivo .env

// Conectar a la base de datos
connectToDatabase();

// Inicializar la aplicación de Express
const app = express();

// Configuración de multer para almacenar imágenes en la carpeta "uploads"
const upload = multer({ dest: 'uploads/' });

// Middleware para manejar archivos estáticos en la carpeta "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para habilitar CORS
app.use(cors());

// Middleware para analizar JSON en las solicitudes
app.use(express.json());

// Ruta para subir la foto de perfil
app.post('/api/auth/uploadProfilePhoto', authMiddleware, upload.single('fotoPerfil'), (req, res) => {
  console.log("Archivo recibido:", req.file); // Confirmación de recepción del archivo
  res.status(200).json({ message: 'Foto de perfil actualizada con éxito' });
});
// Importa y usa las rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
