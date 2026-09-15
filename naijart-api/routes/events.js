const express = require('express');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

module.exports = (pool) => {

  // ===== VER MIS PROPIAS SOLICITUDES (artista logueado) =====
  // GET /events/mine/requests
  // IMPORTANTE: esta ruta va ANTES que '/:id' y '/:id/requests' —
  // si no, Express interpretaría "mine" como si fuera un :id y nunca llegaríamos aquí.
  router.get('/mine/requests', verifyToken, requireRole('artist'), async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT er.id, er.status, er.requested_at, e.title, e.event_date, e.location
         FROM event_requests er
         JOIN events e ON e.id = er.event_id
         WHERE er.artist_id = ?
         ORDER BY e.event_date ASC`,
        [req.user.id]
      );
      res.json({ ok: true, requests: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener tus solicitudes.' });
    }
  });

  // ===== LISTAR EVENTOS (público) =====
  // GET /events
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
      res.json({ ok: true, events: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener los eventos.' });
    }
  });

  // ===== VER UN EVENTO CONCRETO (público) =====
  // GET /events/:id
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Evento no encontrado.' });
      }
      res.json({ ok: true, event: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener el evento.' });
    }
  });

  // ===== CREAR UN EVENTO (solo admin) =====
  // POST /events
  // form-data: title, description, event_date, start_time, end_time, location + archivo "image"
  router.post('/', verifyToken, requireRole('admin'), upload.single('image'), async (req, res) => {
    const { title, description, event_date, start_time, end_time, location } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ ok: false, error: 'Título y fecha son obligatorios.' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      await pool.query(
        `INSERT INTO events (id, title, description, event_date, start_time, end_time, location, image_url, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description || null, event_date, start_time || null, end_time || null, location || null, imageUrl, req.user.id]
      );
      res.status(201).json({ ok: true, message: 'Evento creado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al crear el evento.' });
    }
  });

  // ===== EDITAR UN EVENTO (solo admin) =====
  // PUT /events/:id
  // form-data: los mismos campos, + archivo "image" opcional (si no se manda, se conserva la imagen actual)
  router.put('/:id', verifyToken, requireRole('admin'), upload.single('image'), async (req, res) => {
    const { title, description, event_date, start_time, end_time, location } = req.body;

    try {
      const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Evento no encontrado.' });
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : rows[0].image_url;

      await pool.query(
        `UPDATE events SET title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, image_url = ? WHERE id = ?`,
        [
          title ?? rows[0].title,
          description ?? rows[0].description,
          event_date ?? rows[0].event_date,
          start_time ?? rows[0].start_time,
          end_time ?? rows[0].end_time,
          location ?? rows[0].location,
          imageUrl,
          req.params.id
        ]
      );
      res.json({ ok: true, message: 'Evento actualizado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al actualizar el evento.' });
    }
  });

  // ===== BORRAR UN EVENTO (solo admin) =====
  // DELETE /events/:id
  router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Evento no encontrado.' });
      }
      await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
      res.json({ ok: true, message: 'Evento eliminado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al eliminar el evento.' });
    }
  });

  // ===== SOLICITAR APUNTARSE A UN EVENTO (solo artistas) =====
  // POST /events/:id/requests
  router.post('/:id/requests', verifyToken, requireRole('artist'), async (req, res) => {
    try {
      const [eventRows] = await pool.query('SELECT id FROM events WHERE id = ?', [req.params.id]);
      if (eventRows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Evento no encontrado.' });
      }

      const [existing] = await pool.query(
        'SELECT id FROM event_requests WHERE event_id = ? AND artist_id = ?',
        [req.params.id, req.user.id]
      );
      if (existing.length > 0) {
        return res.status(409).json({ ok: false, error: 'Ya has solicitado apuntarte a este evento.' });
      }

      await pool.query(
        `INSERT INTO event_requests (id, event_id, artist_id, status) VALUES (UUID(), ?, ?, 'pending')`,
        [req.params.id, req.user.id]
      );
      res.status(201).json({ ok: true, message: 'Solicitud enviada correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al enviar la solicitud.' });
    }
  });

  // ===== VER LAS SOLICITUDES DE UN EVENTO (solo admin) =====
  // GET /events/:id/requests
  router.get('/:id/requests', verifyToken, requireRole('admin'), async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT er.id, er.status, er.requested_at, ap.user_id AS artist_id, ap.name, ap.surname
         FROM event_requests er
         JOIN artist_profiles ap ON ap.user_id = er.artist_id
         WHERE er.event_id = ?
         ORDER BY er.requested_at ASC`,
        [req.params.id]
      );
      res.json({ ok: true, requests: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener las solicitudes.' });
    }
  });

  // ===== APROBAR / RECHAZAR UNA SOLICITUD (solo admin) =====
  // PUT /events/:id/requests/:requestId
  // body: { status: 'approved' | 'rejected' }
  router.put('/:id/requests/:requestId', verifyToken, requireRole('admin'), async (req, res) => {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ ok: false, error: "El estado debe ser 'approved' o 'rejected'." });
    }

    try {
      const [rows] = await pool.query(
        'SELECT id FROM event_requests WHERE id = ? AND event_id = ?',
        [req.params.requestId, req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Solicitud no encontrada.' });
      }

      await pool.query('UPDATE event_requests SET status = ? WHERE id = ?', [status, req.params.requestId]);
      res.json({ ok: true, message: `Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al actualizar la solicitud.' });
    }
  });

  return router;
};