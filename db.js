const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conexión a MongoDB establecida');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1); // Detener la aplicación si no se puede conectar
  }
};

module.exports = connectDB;
