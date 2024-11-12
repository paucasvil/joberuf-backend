const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); 
const { changePassword } = require('../controllers/authController');
const multer = require('multer');
const User = require('../models/users');
const { forgotPassword } = require('../controllers/authController');

// Ruta para el registro
router.post('/signup', authController.signup);

// Ruta para el inicio de sesión
router.post('/login', authController.login);

// Ruta para actualizar el perfil
router.put('/updateProfile', authMiddleware, authController.updateProfile);

// Ruta para cambiar la contraseña
router.put('/changePassword', authMiddleware, authController.changePassword);

router.post('/forgotPassword', authController.forgotPassword);

router.get('/getProfile', authMiddleware, authController.getProfile);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage: storage });

  // Ruta para subir la foto de perfil
  router.post('/uploadProfilePhoto', authMiddleware, upload.single('fotoPerfil'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se recibió ningún archivo.' });
      }
  
      // Obtener el usuario a través del token
      const userId = req.user.id;
  
      // Guardar la ruta de la imagen en la base de datos del usuario
      const user = await User.findById(userId);
      user.fotoPerfil = req.file.path; // Guarda la ruta de la imagen
      await user.save();
  
      console.log("Ruta de la imagen guardada en la base de datos:", user.fotoPerfil); // Confirma que la imagen se guarda
      res.status(200).json({ message: 'Foto de perfil actualizada con éxito', imagePath: req.file.path });
    } catch (error) {
      console.error("Error al subir la foto de perfil:", error);
      res.status(500).json({ message: 'Error al subir la foto de perfil' });
    }
  });
  
module.exports = router;
