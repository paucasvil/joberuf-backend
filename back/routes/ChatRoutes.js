// back/routes/chatRoutes.js
const express = require('express');
const { simularEntrevista } = require('../controllers/chatController'); // Asegúrate de que el controlador esté exportado correctamente
const router = express.Router();

router.post('/simular', simularEntrevista);  // Asegúrate de que `simularEntrevista` esté definido y exportado en chatController.js

module.exports = router;
