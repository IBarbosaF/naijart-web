require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Pool de conexiones a MySQL — mejor que una sola conexión suelta,
// gestiona varias peticiones a la vez sin problemas.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const authRoutes = require('./routes/auth')(pool);
app.use('/auth', authRoutes);
const artworksRoutes = require('./routes/artworks')(pool);
app.use('/artworks', artworksRoutes);
const eventsRoutes = require('./routes/events')(pool);
app.use('/events', eventsRoutes);
const messagesRoutes = require('./routes/messages')(pool);
app.use('/messages', messagesRoutes);
const blogRoutes = require('./routes/blog')(pool);
app.use('/blog', blogRoutes);

// Ruta de prueba: solo para confirmar que el servidor responde
app.get('/', (req, res) => {
  res.send('Naijart API funcionando 🎨');
});

// Ruta de prueba de conexión a la base de datos:
// cuenta cuántos usuarios hay (debería devolver 0, la tabla está vacía)
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM users');
    res.json({ ok: true, usuarios: rows[0].total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Naijart API escuchando en http://localhost:${PORT}`);
});