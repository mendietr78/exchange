const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Denominacion, Movimiento } = require('./models'); // Importar los modelos

dotenv.config(); // Cargar variables de entorno desde .env

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Variable global para almacenar la conexión a la base de datos
let dbConnection = null;

// Ruta para mostrar la vista home.ejs
app.get('/', (req, res) => {
  res.render('home');
});

// Ruta para procesar la clave y conectar a la base de datos
app.post('/db/submit', (req, res) => {
  const bd1 = req.body.db1; // Obtener la clave del formulario
  const URI = 'mongodb+srv://' + bd1 + ':HHnOQn2B4iVtEdOU@cluster0.pgfsbij.mongodb.net/exchange?retryWrites=true&w=majority';

  console.log(bd1);

  // Conectar a la base de datos
  mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log("Conexión exitosa a la base de datos");
      dbConnection = mongoose.connection; // Almacenar la conexión
      res.redirect("/app"); // Redirigir a la aplicación
    })
    .catch(error => {
      console.log("Error al conectar a la base de datos:", error);
      res.status(500).send("Error al conectar a la base de datos");
    });
});

// Ruta para iniciar la aplicación
app.get('/app', async (req, res) => {
  if (dbConnection) {
    try {
      // Obtener las denominaciones y los movimientos desde la base de datos
      const denominaciones = await Denominacion.find({});
      const movimientos = await Movimiento.find({}).sort({ fecha: -1 }); // Ordenar por fecha descendente

      // Calcular el balance total en pesos (MXN)
      let balanceTotal = 0;
      for (const denom of denominaciones) {
        balanceTotal += denom.balance * denom.venta;
      }

      // Renderizar la vista index.ejs con los datos
      res.render('index0', { denominaciones, movimientos, balanceTotal });
    } catch (error) {
      console.error('Error obteniendo datos:', error);
      res.status(500).send('Error interno del servidor');
    }
  } else {
    // Si no hay conexión, redirigir al inicio
    res.redirect('/');
  }
});

// Ruta para mostrar el formulario de ingreso de datos
app.get('/app/ingresar', (req, res) => {
  if (dbConnection) {
    res.render('ingresar'); // Renderizar la vista del formulario
  } else {
    res.redirect('/');
  }
});


// Ruta para procesar el formulario de ingreso de datos
app.post('/app/ingresar', async (req, res) => {
  if (dbConnection) {
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

      res.redirect('/app'); // Redirigir a la aplicación principal
    } catch (error) {
      console.error('Error agregando movimiento:', error);
      res.status(500).send('Error interno del servidor');
    }
  } else {
    res.redirect('/');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});