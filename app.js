const express = require('express');
const app = express();
const port = 3000;

// Configura EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware para servir archivos estáticos
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // Para parsear el cuerpo de las solicitudes POST

// Datos iniciales (puedes usar una base de datos más adelante)
let balance = 0;
let movimientos = [];

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', { balance, movimientos });
});

// Ruta para agregar un movimiento
app.post('/agregar-movimiento', (req, res) => {
  const { tipo, monto, descripcion } = req.body;
  const movimiento = {
    tipo,
    monto: parseFloat(monto),
    descripcion,
    fecha: new Date().toLocaleDateString()
  };
  movimientos.push(movimiento);
  if (tipo === 'entrada') {
    balance += movimiento.monto;
  } else {
    balance -= movimiento.monto;
  }
  res.redirect('/');
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});