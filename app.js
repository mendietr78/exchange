const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Datos iniciales
let denominaciones = {
  ETH: { balance: 0, compra: 30000, venta: 32000 }, // 1 ETH = 30,000 MXN (compra), 32,000 MXN (venta)
  BTC: { balance: 0, compra: 800000, venta: 820000 }, // 1 BTC = 800,000 MXN (compra), 820,000 MXN (venta)
  USD: { balance: 0, compra: 18, venta: 20 }, // 1 USD = 18 MXN (compra), 20 MXN (venta)
};

let movimientos = [];

// Ruta principal
app.get('/', (req, res) => {
  // Calcular el balance total en pesos (MXN)
  let balanceTotal = 0;
  for (const moneda in denominaciones) {
    // Usamos el tipo de cambio de VENTA para convertir a MXN
    balanceTotal += denominaciones[moneda].balance * denominaciones[moneda].venta;
  }

  res.render('index', { denominaciones, movimientos, balanceTotal });
});

// Ruta para agregar un movimiento
app.post('/agregar-movimiento', (req, res) => {
  const { tipo, monto, descripcion, moneda } = req.body;

  const movimiento = {
    tipo,
    monto: parseFloat(monto),
    descripcion,
    moneda,
    fecha: new Date().toLocaleDateString(),
  };

  movimientos.push(movimiento);

  // Actualizar el balance de la denominación correspondiente
  if (tipo === 'entrada') {
    denominaciones[moneda].balance += movimiento.monto;
  } else {
    denominaciones[moneda].balance -= movimiento.monto;
  }

  res.redirect('/');
});

// Ruta para actualizar los tipos de cambio
app.post('/actualizar-tipos-cambio', (req, res) => {
  const { moneda, compra, venta } = req.body;
  denominaciones[moneda].compra = parseFloat(compra);
  denominaciones[moneda].venta = parseFloat(venta);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});