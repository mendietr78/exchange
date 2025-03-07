const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Middleware para verificar la conexión a la base de datos
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState === 1) { // 1 = conectado
    next();
  } else {
    res.redirect('/');
  }
};

// Ruta protegida que requiere conexión a la base de datos
router.get('/protected', checkDBConnection, (req, res) => {
  res.send('Esta es una ruta protegida');
});

module.exports = router;