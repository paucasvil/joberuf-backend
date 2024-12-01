// back/server.js
const express = require('express');
const connectToDatabase = require('./database');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { authMiddleware } = require('./middlewares/authMiddleware');
const pdfParse = require('pdf-parse'); // Importación pdf-parse para analizar archivos PDF
const authController = require('./controllers/authController');
const bodyParser = require('body-parser');

dotenv.config(); // Cargar variables de entorno desde el archivo .env
// Conectar a la base de datos
connectToDatabase();

// Inicializar la aplicación de Express
const app = express();
app.use(bodyParser.json());
app.use(express.json());
//Imagenes de foto de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}.jpg`); 
  }
});

const upload = multer({ storage });

// Middleware para manejar archivos estáticos en la carpeta "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para habilitar CORS
app.use(cors());

// Middleware para analizar JSON en las solicitudes
app.use(express.json());

// Ruta para subir la foto de perfil
app.post('/api/auth/uploadProfilePhoto', authMiddleware, upload.single('fotoPerfil'), authController.uploadProfilePhoto);


// Nueva ruta para convertir PDF a texto
app.post('/api/uploadCv', upload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo PDF' });
  }
  try {
    const pdfBuffer = req.file.path; // Ruta del archivo PDF
    const dataBuffer = require('fs').readFileSync(pdfBuffer); // Leer el archivo PDF como buffer

    // Extraer texto del PDF
    const pdfData = await pdfParse(dataBuffer);
    
    // Eliminar el archivo PDF del servidor después de procesarlo (opcional)
    require('fs').unlinkSync(pdfBuffer);

    // Enviar el texto extraído al cliente
    res.status(200).json({ text: pdfData.text });
  } catch (error) {
    console.error('Error al procesar el archivo PDF:', error);
    res.status(500).json({ error: 'Error al procesar el archivo PDF' });
  }
});


// Importa y usa las rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Ocurrió un error interno en el servidor.' });
});
