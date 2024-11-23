const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const chatRoutes = require('./routes/ChatRoutes');  // Importa las rutas
dotenv.config();
const app = express();
const path = require('path');

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware para parsear JSON
app.use(express.json());
// Habilitar CORS
app.use(cors());
// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
  });
// Usar las rutas de chat
app.use('/api/chat', chatRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
app.use(express.urlencoded({ extended: true }));