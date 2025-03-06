require('dotenv').config(); // Cargar variables de entorno desde .env
const connectDB = require('./db');
const { Denominacion } = require('./models');

const init = async () => {
  await connectDB();

  // Insertar denominaciones iniciales
  const denominacionesIniciales = [
    { nombre: 'ETH', balance: 0, compra: 30000, venta: 32000 },
    { nombre: 'BTC', balance: 0, compra: 800000, venta: 820000 },
    { nombre: 'USD', balance: 0, compra: 18, venta: 20 },
  ];

  await Denominacion.insertMany(denominacionesIniciales);
  console.log('Datos iniciales insertados');
  process.exit(0);
};

init();