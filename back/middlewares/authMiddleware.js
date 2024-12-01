// Importa la biblioteca jsonwebtoken para manejar tokens JWT
const jwt = require('jsonwebtoken');

//Middleware de autenticación para validar y decodificar el token JWT.
exports.authMiddleware = (req, res, next) => {
  // Obtiene el token del encabezado 'Authorization' y elimina el prefijo 'Bearer '
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Token recibido:', token);

  // Verifica si el token está presente
  if (!token) {
    console.error('Error: No se recibió un token.');
    return res.status(401).json({ message: 'Acceso no autorizado. Token requerido.' });
  }

  try {
    // Verifica y decodifica el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    // Asigna los datos decodificados al objeto `req.user` para usarlo en las siguientes funciones
    req.user = decoded;

    // Continúa con la ejecución del siguiente middleware o controlador
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error.message);

    // Responde con un error 401 si el token es inválido o expirado
    res.status(401).json({ message: 'Token inválido.' });
  }
};
