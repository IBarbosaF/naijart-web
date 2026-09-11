const multer = require('multer');
const path = require('path');

// Dónde y cómo se guardan los archivos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // carpeta relativa a la raíz del proyecto
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp + nombre original, para no pisar archivos
    // con el mismo nombre si dos artistas suben "obra1.jpg"
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

// Solo aceptar imágenes, y limitar el tamaño a 5MB
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP.'));
    }
  }
});

module.exports = upload;