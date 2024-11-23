const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Token recibido:', token);
  if (!token) {
    console.error('Error: No se recibió un token.');
    return res.status(401).json({ message: 'Acceso no autorizado. Token requerido.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);
    req.user = decoded; // Asigna el token decodificado al objeto `req.user`
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error.message);
    res.status(401).json({ message: 'Token inválido.' });
  }
};


