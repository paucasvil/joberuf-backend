const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Asegúrate de que esta ruta sea correcta y que `userModel.js` exista en la carpeta `models`
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Controlador para el registro de usuarios
exports.signup = async (req, res) => {
  try {
    const { nombre, apellidos, correo, contra, telefono, sector, fecha } = req.body;
    // Verificar que todos los campos estén completos
    if (!nombre || !apellidos || !correo || !contra || !telefono || !sector || !fecha) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ correo });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya está registrado.' });
    }
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contra, 10);
    // Crear un nuevo usuario
    const user = new User({
      nombre,
      apellidos,
      contra: hashedPassword,
      telefono,
      correo,
      sector,
      fecha: new Date(fecha), // Agrega la fecha de nacimiento
      fechaRegistro: new Date(),
      perfilCompleto: false,
    });
    // Guardar el usuario en la base de datos
    await user.save();
    res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (error) {
    console.error("Error en el proceso de registro:", error);
    res.status(500).json({ message: 'Error al registrar el usuario.' });
  }
};
// Controlador para el inicio de sesión de usuarios
exports.login = async (req, res) => {
  try {
    const { correo, contra } = req.body;
    // Verificar si el usuario existe
    const user = await User.findOne({ correo });
    if (!user) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }
    // Comparar la contraseña ingresada con la almacenada
    const isMatch = await bcrypt.compare(contra, user.contra);
    if (!isMatch) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    // Crear y enviar el token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    // authController.js (dentro de la función login)
    console.log("JWT_SECRET al generar el token:", process.env.JWT_SECRET);

    res.status(200).json({ message: 'Inicio de sesión exitoso.', token, user });
  } catch (error) {
    console.error("Error en el proceso de inicio de sesión:", error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
};

// Controlador para actualizar datos de perfil en Edit.tsx
exports.updateProfile = async (req, res) => {
  try {
    const { nombre, apellidos, correo, telefono, sector, fecha } = req.body;
    const userId = req.user.id; // Asegúrate de que el ID del usuario esté disponible en req.user

    // Actualizar los campos en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nombre, apellidos, correo, telefono, sector, fecha },
      { new: true } // Devuelve el documento actualizado
    );

    res.status(200).json({ message: 'Perfil actualizado con éxito.', user: updatedUser });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ message: 'Error al actualizar el perfil.' });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-contra'); 
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ user }); // Verifica que fotoPerfil esté incluido en la respuesta
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({ message: 'Error al obtener el perfil.' });
  }
};
// Controlador para cambiar la contraseña en ChangePassword.tsx
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    // Verificar la contraseña actual
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.contra);
    if (!isMatch) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
    }
    // Encriptar y actualizar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.contra = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    res.status(500).json({ message: 'Error al cambiar la contraseña.' });
  }
};
// Controlador para subir la foto de perfil
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id; // ID del usuario desde el token
    const photoPath = req.file.path; // Ruta de la imagen subida

    // Actualizar la foto de perfil en la base de datos del usuario
    const user = await User.findByIdAndUpdate(
      userId,
      { fotoPerfil: photoPath },
      { new: true }
    );
    
    res.status(200).json({ message: 'Foto de perfil actualizada con éxito', fotoPerfil: user.fotoPerfil });
  } catch (error) {
    console.error("Error al subir la foto de perfil:", error);
    res.status(500).json({ message: 'Error al subir la foto de perfil.' });
  }
};


// En authController.js (o el archivo donde manejes la autenticación)

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // El ID del usuario debería venir del token de autenticación

    // Busca el usuario en la base de datos
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verifica si la contraseña actual coincide
    const isMatch = await bcrypt.compare(oldPassword, user.contra);
    if (!isMatch) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
    }

    // Hashea la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.contra = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar la contraseña.' });
  }
};



exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Busca el usuario por el correo
    const user = await User.findOne({ correo: email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Genera una nueva contraseña temporal
    const tempPassword = crypto.randomBytes(4).toString('hex');

    // Encripta la contraseña temporal antes de guardarla
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    user.contra = hashedTempPassword;
    await user.save();

    // Configura nodemailer para enviar el correo
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Cambia según tu proveedor de correo
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configura el contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restablecimiento de Contraseña',
      text: `Hola, hemos restablecido tu contraseña temporalmente. Por favor, utiliza la siguiente contraseña temporal para iniciar sesión: ${tempPassword}. Te recomendamos cambiarla tan pronto como accedas.`,
    };

    // Envía el correo
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Correo de restablecimiento enviado exitosamente.' });
  } catch (error) {
    console.error("Error al enviar el correo de restablecimiento:", error);
    res.status(500).json({ message: 'Error al enviar el correo de restablecimiento.' });
  }
};