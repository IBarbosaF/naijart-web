const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// El pool de conexión se pasa desde index.js para no crear uno nuevo aquí
module.exports = (pool) => {

  // ===== REGISTRO =====
  // POST /auth/register
  // body esperado: { email, password, role, name, surname }
  router.post('/register', async (req, res) => {
    const { email, password, role, name, surname } = req.body;

    // Validación mínima — si falta algo esencial, no seguimos
    if (!email || !password || !role) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios (email, password, role).' });
    }

    if (!['artist', 'collector'].includes(role)) {
      // El rol 'admin' NO se puede crear por registro público — eso se hace a mano en la BD
      return res.status(400).json({ ok: false, error: 'Rol no válido para registro público.' });
    }

    try {
      // Comprobar que el email no existe ya
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ ok: false, error: 'Ya existe una cuenta con ese email.' });
      }

      // Encriptar la contraseña — nunca se guarda en texto plano
      const passwordHash = await bcrypt.hash(password, 10);

      // Crear el usuario
      const [result] = await pool.query(
        'INSERT INTO users (id, email, password_hash, role) VALUES (UUID(), ?, ?, ?)',
        [email, passwordHash, role]
      );

      // Recuperar el UUID recién creado (MySQL no lo devuelve directo con UUID())
      const [[newUser]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      const userId = newUser.id;

      // Crear el perfil correspondiente según el rol
      if (role === 'artist') {
        await pool.query(
          'INSERT INTO artist_profiles (user_id, name, surname) VALUES (?, ?, ?)',
          [userId, name || '', surname || '']
        );
      } else if (role === 'collector') {
        await pool.query(
          'INSERT INTO collector_profiles (user_id, shipping_address) VALUES (?, ?)',
          [userId, '']
        );
      }

      res.status(201).json({ ok: true, message: 'Usuario creado correctamente.' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error del servidor al registrar el usuario.' });
    }
  });

  // ===== LOGIN =====
  // POST /auth/login
  // body esperado: { email, password }
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Faltan email o password.' });
    }

    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      const user = rows[0];

      // Mensaje genérico a propósito: no decimos si falla el email o la contraseña,
      // por seguridad (para no dar pistas a quien intenta adivinar cuentas)
      if (!user || !user.password_hash) {
        return res.status(401).json({ ok: false, error: 'Email o contraseña incorrectos.' });
      }

      const passwordMatches = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatches) {
        return res.status(401).json({ ok: false, error: 'Email o contraseña incorrectos.' });
      }

      // Generar el token con la info mínima necesaria (id y rol)
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        ok: true,
        token,
        user: { id: user.id, email: user.email, role: user.role }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error del servidor al iniciar sesión.' });
    }
  });

    // ===== RUTA PROTEGIDA DE PRUEBA =====
    // GET /auth/me — requiere token válido, devuelve quién eres
    const { verifyToken } = require('../middleware/authMiddleware');

    router.get('/me', verifyToken, (req, res) => {
        res.json({ ok: true, user: req.user });
    });

  return router;
};