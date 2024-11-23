const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users'); 
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Habilidad = require('../models/Habilidad'); 
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const questionsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/questions.json'), 'utf-8'));



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

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
  //console.log('Cuerpo recibido:', req.body);

  try {
    const { correo, contra } = req.body;
    //console.log('Buscando usuario con correo:', correo);

    const user = await User.findOne({ correo });
    if (!user) {
      //console.log('Usuario no encontrado.');
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    //console.log('Usuario encontrado:', user);

    const isMatch = await bcrypt.compare(contra, user.contra);
    //console.log('¿Contraseña coincide?:', isMatch);

    if (!isMatch) {
      //console.log('Contraseña incorrecta.');
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    //console.log('Token generado:', token);

    res.status(200).json({ message: 'Inicio de sesión exitoso.', token });
  } catch (error) {
    //console.error('Error en el proceso de inicio de sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
};


// Controlador para actualizar datos de perfil en Edit.tsx


exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // Obtener el ID desde `req.user`
    //console.log('ID del usuario desde req.user:', req.user?.id);

    if (!userId) {
      console.error('Error: No se proporcionó userId en la solicitud.');
      return res.status(400).json({ message: 'No se proporcionó el ID del usuario.' });
    }

    const user = await User.findById(userId)
      .populate('habilidadesTecnicas', 'nombre')
      .populate('habilidadesBlandas', 'nombre');

    if (!user) {
      console.error('Error: Usuario no encontrado para el ID:', userId);
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    //console.log('Perfil de usuario obtenido correctamente:', user);
    res.status(200).json({
      user: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
        sector: user.sector,
        habilidadesTecnicas: user.habilidadesTecnicas,
        habilidadesBlandas: user.habilidadesBlandas,
      },
    });
  } catch (error) {
    console.error('Error al obtener el perfil:', error.message);
    res.status(500).json({ message: 'Error al obtener el perfil del usuario.' });
  }
};





async function findOrCreateHabilidades(habilidades, categoria) {
  const habilidadesIds = [];
  for (const nombre of habilidades) {
    let habilidad = await Habilidad.findOne({ nombre, categoria });
    if (!habilidad) {
      habilidad = await Habilidad.create({ nombre, categoria });
    }
    habilidadesIds.push(habilidad._id);
  }
  return habilidadesIds;
}

exports.updateProfile = async (req, res) => {
  try {
    const { nombre, apellidos, correo, telefono, sector, fecha, habilidadesTecnicas, habilidadesBlandas } = req.body;
    const userId = req.user.id;

    // Encuentra o crea habilidades técnicas y blandas
    const habilidadesTecnicasIds = await findOrCreateHabilidades(habilidadesTecnicas, 'técnica');
    const habilidadesBlandasIds = await findOrCreateHabilidades(habilidadesBlandas, 'blanda');

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        nombre,
        apellidos,
        correo,
        telefono,
        sector,
        fecha,
        habilidadesTecnicas: habilidadesTecnicasIds,
        habilidadesBlandas: habilidadesBlandasIds,
      },
      { new: true }
    );

    res.status(200).json({ message: 'Perfil actualizado con éxito.', user: updatedUser });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ message: 'Error al actualizar el perfil.' });
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
// authController.js
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario no proporcionado en el token.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ningún archivo.' });
    }
    const user = await User.findByIdAndUpdate(userId, { fotoPerfil: req.file.path }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.status(200).json({ message: 'Foto de perfil actualizada con éxito.', fotoPerfil: user.fotoPerfil });
  } catch (error) {
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



function getRandomQuestions(sector) {
  console.log(`Sector recibido en getRandomQuestions: ${sector}`);
  const sectorData = questionsData[sector] || questionsData.General;
  
  const generalQuestions = sectorData.General || [];
  const selectedGeneralQuestions = generalQuestions.slice(0, 3); 

  const otherTopics = Object.entries(sectorData).filter(([topic]) => topic !== 'General');
  const randomQuestions = [];

  while (randomQuestions.length < 7 && otherTopics.length > 0) {
    const [topic, questions] = otherTopics[Math.floor(Math.random() * otherTopics.length)];
    const question = questions[Math.floor(Math.random() * questions.length)];
    randomQuestions.push({ topic, question });
  }

  const combinedQuestions = [
    ...selectedGeneralQuestions.map(question => ({ topic: 'General', question })),
    ...randomQuestions,
  ];

  console.log('Preguntas generadas:', combinedQuestions);
  return combinedQuestions.slice(0, 10); 
}




let activeSessions = {};
exports.startInterview = (req, res) => {
  console.log('Solicitud recibida en startInterview:', req.body);

  const { userSector, userId } = req.body;

  if (!userSector || !userId) {
    console.error('Datos incompletos en startInterview:', { userSector, userId });
    return res.status(400).json({ message: 'Datos incompletos en la solicitud.' });
  }

  try {
    console.log(userSector);
    const questions = getRandomQuestions(userSector);
    console.log('Preguntas generadas:', questions);

    activeSessions[userId] = {
      questions,
      responses: [],
    };

    console.log(`Sesión iniciada para el usuario ${userId} en el sector ${userSector}`);
    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error en startInterview:', error.message);
    res.status(500).json({ message: 'Error al iniciar la entrevista.' });
  }
};



exports.nextQuestion = (req, res) => {
  const { userId, userResponse, currentQuestionIndex } = req.body;

  if (!userId || !userResponse || currentQuestionIndex === undefined) {
    return res.status(400).json({ message: 'Datos incompletos en la solicitud.' });
  }

  const session = activeSessions[userId];
  if (!session) {
    return res.status(404).json({ message: 'Sesión no encontrada para el usuario.' });
  }

  session.responses.push({
    question: session.questions[currentQuestionIndex],
    answer: userResponse,
  });

  const nextQuestion = session.questions[currentQuestionIndex + 1];
  if (!nextQuestion) {
    return res.status(200).json({ nextQuestion: null });
  }

  res.status(200).json({ nextQuestion });
};



let finalScore = 0; // Variable para almacenar el puntaje final

exports.finishInterview = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Datos incompletos en la solicitud.' });
  }

  const session = activeSessions[userId];
  if (!session) {
    return res.status(404).json({ message: 'Sesión no encontrada para el usuario.' });
  }

  const messages = [
    {
      role: 'system',
      content: 'Eres un entrevistador profesional. Proporciona una retroalimentación detallada y una puntuación de 0 a 100 basada únicamente en las respuestas proporcionadas por el usuario. Usa las preguntas para dar contexto, pero evalúa solo las respuestas.',
    },
    ...session.responses.map(({ question, answer }) => ({
      role: 'user',
      content: `Pregunta: ${question}\nRespuesta: ${answer}`,
    })),
  ];

  try {
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const feedback = openaiResponse.choices[0].message?.content?.trim() || 'Sin retroalimentación.';
    finalScore = Math.floor(Math.random() * 101); // Generar puntuación final aleatoria (puedes ajustar la lógica si es necesario)

    // Eliminar sesión activa
    delete activeSessions[userId];

    res.status(200).json({
      feedback,
      score: finalScore, // Devolver el puntaje final
    });
  } catch (error) {
    console.error('Error al finalizar la entrevista:', error);
    res.status(500).json({ message: 'Error al finalizar la entrevista.' });
  }
};
