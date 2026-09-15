const express = require('express');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

module.exports = (pool) => {

  // ===== LISTAR TODAS LAS OBRAS (público) =====
  // GET /artworks
  router.get('/', async (req, res) => {
    try {
      const showAll = req.query.status === 'all';
      const query = showAll
        ? `SELECT a.*, ap.name AS artist_name, ap.surname AS artist_surname
           FROM artworks a JOIN artist_profiles ap ON ap.user_id = a.artist_id
           ORDER BY a.created_at DESC`
        : `SELECT a.*, ap.name AS artist_name, ap.surname AS artist_surname
           FROM artworks a JOIN artist_profiles ap ON ap.user_id = a.artist_id
           WHERE a.status != 'sold' ORDER BY a.created_at DESC`;

      const [rows] = await pool.query(query);
      res.json({ ok: true, artworks: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener las obras.' });
    }
  });

  // ===== VER UNA OBRA CONCRETA (público) =====
  // GET /artworks/:id
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT a.*, ap.name AS artist_name, ap.surname AS artist_surname
         FROM artworks a JOIN artist_profiles ap ON ap.user_id = a.artist_id
         WHERE a.id = ?`,
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Obra no encontrada.' });
      }
      res.json({ ok: true, artwork: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al obtener la obra.' });
    }
  });

  // ===== CREAR UNA OBRA (solo artistas logueados) =====
  // POST /artworks
  // form-data esperado: title, description, style, artwork_date, price + archivo "image"
  router.post('/', verifyToken, requireRole('artist'), upload.single('image'), async (req, res) => {
    const { title, description, style, artwork_date, price } = req.body;

    if (!title) {
      return res.status(400).json({ ok: false, error: 'El título es obligatorio.' });
    }

    // Si se subió un archivo, multer lo deja en req.file con su nombre final en disco
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      await pool.query(
        `INSERT INTO artworks (id, artist_id, title, description, style, artwork_date, price, image_url)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, title, description || null, style || null, artwork_date || null, price || null, imageUrl]
      );
      res.status(201).json({ ok: true, message: 'Obra creada correctamente.', image_url: imageUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al crear la obra.' });
    }
  });

  // ===== EDITAR UNA OBRA (solo el artista dueño) =====
  // PUT /artworks/:id
  // form-data esperado: los mismos campos, + archivo "image" opcional (si no se manda, se conserva la imagen actual)
  router.put('/:id', verifyToken, requireRole('artist'), upload.single('image'), async (req, res) => {
    const { title, description, style, artwork_date, price, status } = req.body;

    try {
      const [rows] = await pool.query('SELECT * FROM artworks WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Obra no encontrada.' });
      }
      if (rows[0].artist_id !== req.user.id) {
        return res.status(403).json({ ok: false, error: 'No puedes editar una obra que no es tuya.' });
      }

      // Si llega un archivo nuevo, se usa esa ruta; si no, se conserva la que ya tenía
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : rows[0].image_url;

      await pool.query(
        `UPDATE artworks SET
          title = ?, description = ?, style = ?, artwork_date = ?, price = ?, image_url = ?, status = ?
         WHERE id = ?`,
        [
          title ?? rows[0].title,
          description ?? rows[0].description,
          style ?? rows[0].style,
          artwork_date ?? rows[0].artwork_date,
          price ?? rows[0].price,
          imageUrl,
          status ?? rows[0].status,
          req.params.id
        ]
      );
      res.json({ ok: true, message: 'Obra actualizada correctamente.', image_url: imageUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al actualizar la obra.' });
    }
  });

  // ===== BORRAR UNA OBRA (solo el artista dueño) =====
  // DELETE /artworks/:id
  router.delete('/:id', verifyToken, requireRole('artist'), async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM artworks WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ ok: false, error: 'Obra no encontrada.' });
      }
      if (rows[0].artist_id !== req.user.id) {
        return res.status(403).json({ ok: false, error: 'No puedes borrar una obra que no es tuya.' });
      }

      await pool.query('DELETE FROM artworks WHERE id = ?', [req.params.id]);
      res.json({ ok: true, message: 'Obra eliminada correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error al eliminar la obra.' });
    }
  });

  return router;
};