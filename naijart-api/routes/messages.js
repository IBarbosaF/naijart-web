const express = require('express');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

module.exports = (pool) => {

  // ===== ARTISTA: ENVIAR MENSAJE A NAIJART =====
  // POST /messages
  // body: { body }
  // El destinatario se resuelve automáticamente: el primer admin que exista.
  router.post('/', verifyToken, requireRole('artist'), async (req, res) => {
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ ok: false, error: 'El mensaje no puede estar vacío.' });
    }

    try {
      const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      if (admins.length === 0) {
        return res.status(500).json({ ok: false, error: 'No hay ningún administrador disponible todavía.' });
      }
      const adminId = admins[0].id;

      await pool.query(
        'INSERT INTO messages (id, sender_id, recipient_id, body) VALUES (UUID(), ?, ?, ?)',
        [req.user.id, adminId, body.trim()]
      );
      res.status(201).json({ ok: true, message: 'Mensaje enviado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al enviar el mensaje.' });
    }
  });

  // ===== ADMIN: RESPONDER A UN ARTISTA CONCRETO =====
  // POST /messages/:artistId
  // body: { body }
  router.post('/:artistId', verifyToken, requireRole('admin'), async (req, res) => {
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ ok: false, error: 'El mensaje no puede estar vacío.' });
    }

    try {
      const [artistRows] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND role = 'artist'",
        [req.params.artistId]
      );
      if (artistRows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Artista no encontrado.' });
      }

      await pool.query(
        'INSERT INTO messages (id, sender_id, recipient_id, body) VALUES (UUID(), ?, ?, ?)',
        [req.user.id, req.params.artistId, body.trim()]
      );
      res.status(201).json({ ok: true, message: 'Respuesta enviada correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al enviar la respuesta.' });
    }
  });

  // ===== ARTISTA: VER SU PROPIA CONVERSACIÓN =====
  // GET /messages/mine
  router.get('/mine', verifyToken, requireRole('artist'), async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, sender_id, recipient_id, body, created_at
         FROM messages
         WHERE sender_id = ? OR recipient_id = ?
         ORDER BY created_at ASC`,
        [req.user.id, req.user.id]
      );
      res.json({ ok: true, messages: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener tus mensajes.' });
    }
  });

  // ===== ADMIN: VER LA CONVERSACIÓN CON UN ARTISTA CONCRETO =====
  // GET /messages/conversation/:artistId
  router.get('/conversation/:artistId', verifyToken, requireRole('admin'), async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, sender_id, recipient_id, body, created_at
         FROM messages
         WHERE sender_id = ? OR recipient_id = ?
         ORDER BY created_at ASC`,
        [req.params.artistId, req.params.artistId]
      );
      res.json({ ok: true, messages: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener la conversación.' });
    }
  });

  // ===== ADMIN: VER LISTADO DE CONVERSACIONES ACTIVAS (un artista por fila) =====
  // GET /messages/conversations
  router.get('/list/conversations', verifyToken, requireRole('admin'), async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT DISTINCT
           ap.user_id AS artist_id, ap.name, ap.surname,
           (SELECT body FROM messages m2
            WHERE m2.sender_id = ap.user_id OR m2.recipient_id = ap.user_id
            ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
           (SELECT created_at FROM messages m3
            WHERE m3.sender_id = ap.user_id OR m3.recipient_id = ap.user_id
            ORDER BY m3.created_at DESC LIMIT 1) AS last_message_at
         FROM artist_profiles ap
         JOIN messages m ON m.sender_id = ap.user_id OR m.recipient_id = ap.user_id
         ORDER BY last_message_at DESC`
      );
      res.json({ ok: true, conversations: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener las conversaciones.' });
    }
  });

  return router;
};