// back/controllers/chatController.js
const axios = require('axios');  // Importa Axios
require('dotenv').config();

let conversationHistory = [
  {
    role: 'system',
    content: `Simula que este chat es una entrevista para un recién egresado en el campo de Ing en sistemas. 
    Solo debes hacer una pregunta por vez. Espera siempre la respuesta del usuario antes de continuar. 
    No generes respuestas múltiples ni adelantes preguntas futuras. Si ya hiciste una pregunta, espera una respuesta antes de hacer la siguiente.`
  }
];

exports.simularEntrevista = async (req, res) => {
  const { pregunta } = req.body;

  try {
    conversationHistory.push({ role: 'user', content: pregunta });
    const limitedHistory = conversationHistory.slice(-3);

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: limitedHistory,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 50000,
      }
    );

    const respuesta = openaiResponse.data.choices[0].message.content;
    conversationHistory.push({ role: 'assistant', content: respuesta });

    res.status(200).json({ respuesta });

  } catch (error) {
    console.error('Error en OpenAI:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error en la solicitud a OpenAI' });
  }
};
