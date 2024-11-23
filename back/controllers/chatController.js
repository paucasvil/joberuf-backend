/*const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const questionsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/questions.json'), 'utf-8'));

function getRandomQuestions(sector) {
  const generalQuestions = questionsData[sector]["General"];
  const otherTopics = Object.entries(questionsData[sector]).filter(([topic]) => topic !== "General");
  
  const randomQuestions = otherTopics.map(([topic, questions]) => {
    const index = Math.floor(Math.random() * questions.length);
    return { topic, question: questions[index] };
  });

  return [
    ...generalQuestions.slice(0, 3).map(question => ({ topic: "General", question })),
    ...randomQuestions.slice(0, 7)
  ];
}

let activeSessions = {};

const nextQuestion = (req, res) => {
  const { userId, currentQuestionIndex, userSector } = req.body;

  if (!userId || !userSector) {
    return res.status(400).json({ message: 'Datos incompletos en la solicitud.' });
  }

  if (!activeSessions[userId]) {
    activeSessions[userId] = {
      questions: getRandomQuestions(userSector),
      responses: [],
    };
  }

  const session = activeSessions[userId];
  const question = session.questions[currentQuestionIndex];

  if (!question) {
    return res.status(200).json({ nextQuestion: null });
  }

  res.status(200).json({ nextQuestion: question.question });
};

const finishInterview = async (req, res) => {
  const { userId } = req.body;

  const session = activeSessions[userId];
  if (!session) return res.status(400).json({ message: "Sesión no encontrada." });

  const messages = [
    { role: "system", content: "Eres un entrevistador experto. Proporciona retroalimentación y puntuación." },
    ...session.responses.map(({ question, answer }) => ({
      role: "user",
      content: `Pregunta: ${question}\nRespuesta: ${answer}`
    }))
  ];

  try {
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 500,
      temperature: 0.7
    });

    const feedback = openaiResponse.choices[0].message?.content?.trim() || "Sin retroalimentación.";
    const score = Math.floor(Math.random() * 101);

    delete activeSessions[userId];
    res.status(200).json({ feedback, score });
  } catch (error) {
    console.error("Error al finalizar la entrevista:", error);
    res.status(500).json({ message: "Error al finalizar la entrevista." });
  }
};

module.exports = { nextQuestion, finishInterview };
*/