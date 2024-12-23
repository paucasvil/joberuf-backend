//Declaracion de importaciones necesarias
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
//Uso de OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const questionsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/questions.json'), 'utf-8'));


//Funcion para manejar el almacenamiento 
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
    
    //const fotoPerfil = setFoto(nombre);

    // Crear un nuevo usuario    
    const user = new User({
      nombre,
      apellidos,
      contra: hashedPassword,
      telefono,
      correo,
      sector,
      fecha: new Date(fecha),
      fechaRegistro: new Date(),
      perfilCompleto: false,
      fotoPerfil : setFoto(nombre),
    });
    // Guardar el usuario en la base de datos
    await user.save();
    res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (error) {
    console.error("Error en el proceso de registro:", error);
    res.status(500).json({ message: 'Error al registrar el usuario.' });
  }
};

// Función para asignar la foto de perfil basada en la primera letra del nombre
function setFoto(nombre) {
  if (!nombre || nombre.length === 0) {
    return '../assets/images/imago.png'; // Imagen predeterminada 
  }

  // Obtener la primera letra del nombre y convertirla a mayúscula
  const primeraLetra = nombre.charAt(0).toUpperCase();

  // Seleccionar una carpeta aleatoria de las disponibles
  const carpetas = ['images', 'images2', 'images3', 'images4', 'images5'];
  const carpetaAleatoria = carpetas[Math.floor(Math.random() * carpetas.length)];

  // Construir la ruta de la imagen
  const rutaImagen = `../assets/images/${carpetaAleatoria}/${primeraLetra}.png`;

  // Verificar si el archivo existe
  if (fs.existsSync(path.resolve(__dirname, `../${rutaImagen}`))) {
    return rutaImagen; 
  } else {
    return 'assets/images/imago.png'; // Imagen predeterminada
  }
}

// Controlador para el inicio de sesión de usuarios
exports.login = async (req, res) => {
  try {
    const { correo, contra } = req.body;

    const user = await User.findOne({ correo });
    if (!user) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const isMatch = await bcrypt.compare(contra, user.contra);

    if (!isMatch) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Inicio de sesión exitoso.', token });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
};


// Controlador para actualizar datos de perfil en Edit.tsx
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id; 

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
    let fotoPerfil = user.fotoPerfil;
    if (!fotoPerfil) {
      // Asignar imagen basada en la primera letra del nombre
      fotoPerfil = setFoto(user.nombre);
    }
    console.log (`foto1: ${fotoPerfil}`);
    res.status(200).json({
      user: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
        sector: user.sector,
        photo :fotoPerfil,
        habilidadesTecnicas: user.habilidadesTecnicas,
        habilidadesBlandas: user.habilidadesBlandas,
      },
    });
  } catch (error) {
    console.error('Error al obtener el perfil:', error.message);
    res.status(500).json({ message: 'Error al obtener el perfil del usuario.' });
  }
};




//Determinar si existe o no las habilidades en la base de datos
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

//Controlador para actualizar los datos del usuario en la base de datos
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

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

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


//Función para llamar aleatoreamente preguntas del json
function getRandomQuestions(sector) {
  console.log("Sector recibido en getRandomQuestions:", sector);

  const sectorData = questionsData[sector];
  if (!sectorData) {
      console.error("Error: Sector no encontrado en el archivo JSON:", sector);
      return [];
  }
  //Separar en 2 arreglos los tipos de preguntas
  const generalQuestions = sectorData.General || [];
  const otherTopics = Object.entries(sectorData).filter(([topic]) => topic !== "General");

  try {
      // Selección aleatoria de 3 preguntas generales
      const selectedGeneralQuestions = generalQuestions
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map((q) => ({ topic: "General", question: q }));

      // Selección aleatoria de 7 preguntas de otros temas
      const selectedOtherQuestions = otherTopics
          .flatMap(([topic, questions]) => questions.map((q) => ({ topic, question: q })))
          .sort(() => 0.5 - Math.random())
          .slice(0, 7);

      const finalQuestions = [...selectedGeneralQuestions, ...selectedOtherQuestions];

      console.log("Preguntas generadas:", finalQuestions);
      return finalQuestions;
  } catch (error) {
      console.error("Error generando preguntas aleatorias:", error);
      return [];
  }
}



// Controlador para manejar la simulación de entrevistas y puntuaciones de usuarios

// Objeto para mantener sesiones activas en memoria
let activeSessions = {};

//Inicia una nueva simulación de entrevista para un usuario.
exports.startInterview = (req, res) => {
  console.log("Solicitud recibida en startInterview:", req.body);

  const { userSector, userId } = req.body;

  // Validar datos obligatorios
  if (!userSector || !userId) {
    console.error("Error: Datos incompletos en la solicitud:", req.body);
    return res.status(400).json({ message: "Datos incompletos en la solicitud." });
  }

  try {
    // Obtener preguntas aleatorias para el sector proporcionado
    const questions = getRandomQuestions(userSector);
    if (!questions || questions.length === 0) {
      console.error("Error: No se encontraron preguntas para el sector:", userSector);
      return res.status(404).json({ message: "No se encontraron preguntas para el sector." });
    }

    // Crear una nueva sesión activa para el usuario
    activeSessions[userId] = { questions, responses: [] };

    console.log(`Sesión iniciada para el usuario ${userId} en el sector ${userSector}`);
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error interno en startInterview:", error.stack);
    res.status(500).json({ message: "Ocurrió un error interno en el servidor." });
  }
};

// Procesa la respuesta del usuario a la pregunta actual y devuelve la siguiente pregunta.
exports.nextQuestion = (req, res) => {
  const { userId, userResponse, currentQuestionIndex } = req.body;

  // Validar datos obligatorios
  if (!userId || !userResponse || currentQuestionIndex === undefined) {
    return res.status(400).json({ message: 'Datos incompletos en la solicitud.' });
  }

  const session = activeSessions[userId];
  if (!session) {
    return res.status(404).json({ message: 'Sesión no encontrada para el usuario.' });
  }

  // Guardar la respuesta del usuario
  session.responses.push({
    question: session.questions[currentQuestionIndex],
    answer: userResponse,
  });

  // Obtener la siguiente pregunta
  const nextQuestion = session.questions[currentQuestionIndex + 1];
  if (!nextQuestion) {
    return res.status(200).json({ nextQuestion: null }); // No hay más preguntas
  }

  res.status(200).json({ nextQuestion });
};

//Finaliza la entrevista y genera retroalimentación y puntuación utilizando OpenAI.

exports.finishInterview = async (req, res) => {
  const { userId } = req.body;

  // Validar datos obligatorios
  if (!userId) {
    return res.status(400).json({ message: 'Datos incompletos en la solicitud.' });
  }

  const session = activeSessions[userId];
  if (!session) {
    return res.status(404).json({ message: 'Sesión no encontrada para el usuario.' });
  }

  try {
    // Crear mensajes para OpenAI con preguntas y respuestas
    const messages = session.responses.map(({ question, answer }, index) => ({
      role: 'user',
      content: `Pregunta ${index + 1}: ${question.question}\nRespuesta: ${answer}`,
    }));

    // Enviar a OpenAI para obtener retroalimentación
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres un entrevistador profesional. Proporciona retroalimentación detallada y puntuaciones.',
        },
        ...messages,
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    // Procesar la respuesta de OpenAI
    const feedback = response.choices[0].message?.content?.trim() || 'Sin feedback.';
    const individualScores = [];
    let totalScore = 0;

    // Extraer puntuaciones del feedback
    const feedbackLines = feedback.split('\n');
    feedbackLines.forEach((line) => {
      const match = line.match(/Puntuación:\s*(\d+)/i);
      if (match) {
        const score = parseInt(match[1], 10);
        individualScores.push(score);
        totalScore += score;
      }
    });

    const finalScore = individualScores.length > 0 ? Math.round(totalScore / individualScores.length) : 0;

    // Eliminar sesión activa
    delete activeSessions[userId];

    res.status(200).json({
      feedback,
      score: finalScore,
      individualScores,
    });
  } catch (error) {
    console.error('Error al finalizar la entrevista:', error);
    res.status(500).json({ message: 'Error al finalizar la entrevista.' });
  }
};

//Guarda la puntuación de la entrevista en la base de datos del usuario.
exports.saveScore = async (req, res) => {
  const { userId, score } = req.body;

  if (!userId || score == null) {
    return res.status(400).json({ message: 'Datos incompletos.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Guardar puntuación y mantener las últimas 3
    user.scores.push(score);
    if (user.scores.length > 3) user.scores.shift();
    await user.save();

    const averageScore = user.scores.reduce((a, b) => a + b, 0) / user.scores.length;

    res.status(200).json({
      lastScore: score,
      averageScore,
      message: 'Puntuación guardada correctamente.',
    });
  } catch (error) {
    console.error('Error al guardar puntuación:', error);
    res.status(500).json({ message: 'Error al guardar la puntuación.' });
  }
};

//Recupera las puntuaciones del usuario desde la base de datos.
exports.getScores = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'Falta el userId en la solicitud.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const scores = user.scores;

    if (scores.length === 0) {
      return res.status(200).json({
        lastScore: 0,
        averageScore: 0,
      });
    }

    const lastScore = scores[scores.length - 1];
    const averageScore = scores.reduce((acc, item) => acc + item, 0) / scores.length;

    res.status(200).json({
      lastScore,
      averageScore,
    });
  } catch (error) {
    console.error('Error al obtener los puntajes:', error);
    res.status(500).json({ message: 'Error al obtener los puntajes.' });
  }
};
