const jwt = require('jsonwebtoken');

// Verifica que la petición trae un token válido en la cabecera Authorization.
// Se usa así en una ruta: router.get('/algo', verifyToken, (req, res) => {...})
// Tras pasar, req.user tiene { id, role, email } disponible en la ruta.
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization; // formato esperado: "Bearer eyJhbGci..."

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'No se ha enviado token de autenticación.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next(); // token válido, deja pasar a la ruta real
  } catch (error) {
    return res.status(401).json({ ok: false, error: 'Token inválido o caducado.' });
  }
}

// Comprueba que el usuario (ya verificado por verifyToken) tiene uno de los roles permitidos.
// Uso: router.post('/blog', verifyToken, requireRole('admin'), (req, res) => {...})
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'No tienes permiso para esta acción.' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };