require('dotenv').config(); // Cargar variables de entorno desde .env
const express = require('express');
const connectDB = require('./db');
const { Denominacion, Movimiento } = require('./models');
const app = express();
const port = 3000;

// Conectar a MongoDB
connectDB();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Función para calcular el balance total
const calcularBalanceTotal = async () => {
  const denominaciones = await Denominacion.find({});
  let balanceTotal = 0;
  for (const denom of denominaciones) {
    balanceTotal += denom.balance * denom.venta;
  }
  return balanceTotal;
};

// Ruta principal
app.get('/', async (req, res) => {
  try {
    const denominaciones = await Denominacion.find({});
    const movimientos = await Movimiento.find({}).sort({ fecha: -1 }); // Ordenar por fecha descendente
    const balanceTotal = await calcularBalanceTotal();

    res.render('index', { denominaciones, movimientos, balanceTotal, error: null });
  } catch (error) {
    console.error('Error obteniendo datos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para agregar un movimiento
app.post('/agregar-movimiento', async (req, res) => {
  const { tipo, monto, descripcion, moneda } = req.body;

  try {
    // Crear el movimiento
    const movimiento = new Movimiento({
      tipo,
      monto: parseFloat(monto),
      descripcion,
      moneda,
    });
    await movimiento.save();

    // Actualizar el balance de la denominación
    const denominacion = await Denominacion.findOne({ nombre: moneda });
    if (tipo === 'entrada') {
      denominacion.balance += movimiento.monto;
    } else {
      denominacion.balance -= movimiento.monto;
    }
    await denominacion.save();

    res.redirect('/');
  } catch (error) {
    console.error('Error agregando movimiento:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para actualizar los tipos de cambio
app.post('/actualizar-tipos-cambio', async (req, res) => {
  const { moneda, compra, venta } = req.body;

  try {
    const denominacion = await Denominacion.findOne({ nombre: moneda });

    // Verificar si la denominación existe
    if (!denominacion) {
      console.error('Denominación no encontrada:', moneda);
      return res.render('index', {
        denominaciones: await Denominacion.find({}),
        movimientos: await Movimiento.find({}).sort({ fecha: -1 }),
        balanceTotal: await calcularBalanceTotal(),
        error: 'Denominación no encontrada',
      });
    }

    // Actualizar los tipos de cambio
    denominacion.compra = parseFloat(compra);
    denominacion.venta = parseFloat(venta);
    await denominacion.save();

    res.redirect('/');
  } catch (error) {
    console.error('Error actualizando tipos de cambio:', error);
    res.status(500).send('Error interno del servidor');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});