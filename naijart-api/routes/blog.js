const express = require('express');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

module.exports = (pool) => {

  // ===== LISTAR ENTRADAS DEL BLOG (público) =====
  // GET /blog
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT bp.id, bp.title, bp.body, bp.created_at, u.email AS author_email
         FROM blog_posts bp
         JOIN users u ON u.id = bp.author_id
         ORDER BY bp.created_at DESC`
      );
      res.json({ ok: true, posts: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener las entradas del blog.' });
    }
  });

  // ===== VER UNA ENTRADA CONCRETA (público) =====
  // GET /blog/:id
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT bp.id, bp.title, bp.body, bp.created_at, u.email AS author_email
         FROM blog_posts bp
         JOIN users u ON u.id = bp.author_id
         WHERE bp.id = ?`,
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Entrada no encontrada.' });
      }
      res.json({ ok: true, post: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener la entrada.' });
    }
  });

  // ===== CREAR UNA ENTRADA (solo admin) =====
  // POST /blog
  // body: { title, body }  — "body" es el texto/HTML completo del post,
  // que puede incluir <img> (con URLs subidas antes vía /blog/upload-image)
  // e iframes de YouTube/Instagram pegados directamente por el admin.
  router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ ok: false, error: 'Título y contenido son obligatorios.' });
    }

    try {
      await pool.query(
        'INSERT INTO blog_posts (id, author_id, title, body) VALUES (UUID(), ?, ?, ?)',
        [req.user.id, title, body]
      );
      res.status(201).json({ ok: true, message: 'Entrada creada correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al crear la entrada.' });
    }
  });

  // ===== EDITAR UNA ENTRADA (solo admin) =====
  // PUT /blog/:id
  router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
    const { title, body } = req.body;

    try {
      const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Entrada no encontrada.' });
      }

      await pool.query(
        'UPDATE blog_posts SET title = ?, body = ? WHERE id = ?',
        [title ?? rows[0].title, body ?? rows[0].body, req.params.id]
      );
      res.json({ ok: true, message: 'Entrada actualizada correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al actualizar la entrada.' });
    }
  });

  // ===== BORRAR UNA ENTRADA (solo admin) =====
  // DELETE /blog/:id
  router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Entrada no encontrada.' });
      }
      await pool.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
      res.json({ ok: true, message: 'Entrada eliminada correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al eliminar la entrada.' });
    }
  });

  // ===== SUBIR UNA IMAGEN SUELTA PARA INSERTAR EN EL TEXTO (solo admin) =====
  // POST /blog/upload-image
  // form-data: archivo "image"
  // Devuelve la URL para que el editor de Angular la inserte donde quiera dentro del body.
  router.post('/upload-image', verifyToken, requireRole('admin'), upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'No se ha recibido ninguna imagen.' });
    }
    res.status(201).json({ ok: true, image_url: `/uploads/${req.file.filename}` });
  });

  return router;
};