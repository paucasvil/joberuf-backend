/*const express = require('express');
const { nextQuestion, finishInterview } = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

console.log({ nextQuestion, finishInterview });


const router = express.Router();

// Middleware para validar datos de la solicitud
const validateNextQuestionRequest = (req, res, next) => {
  const { currentQuestionIndex, userSector } = req.body;
  if (currentQuestionIndex === undefined || !userSector) {
    return res.status(400).json({ message: 'Datos incompletos en la solicitud.' });
  }
  next();
};

const validateFinishRequest = (req, res, next) => {
  const { responses, sector, userId } = req.body;
  if (!responses || !sector || !userId) {
    return res.status(400).json({ message: 'Datos incompletos en la solicitud.' });
  }
  next();
};

router.post('/nextQuestion', authMiddleware, validateNextQuestionRequest, nextQuestion);
router.post('/finish', authMiddleware, validateFinishRequest, finishInterview);

module.exports = router;
*/