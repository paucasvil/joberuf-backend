// back/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Verifica que el encabezado 'Authorization' esté presente
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  // Extrae el token de 'Bearer token'
  const token = authHeader.split(' ')[1];

  console.log("Token recibido en el middleware:", token); // Confirma el token recibido

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verifica el token usando el secreto
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token no válido' });
  }
};

module.exports = authMiddleware;
