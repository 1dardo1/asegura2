const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/asegurados')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB', err));

// Importa el modelo corregido (sin .ts y nombre singular)
const Evento = require('./models/evento.models.ts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas de API
app.get('/api/eventos', async (req, res) => {
  try {
    const eventos = await Evento.find();
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo eventos' });
  }
});

// Servir archivos estáticos de Angular
app.use(express.static(path.join(__dirname, '../frontend/dist/asegurados/browser')));

// Catch-all con regex para evitar conflictos
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/asegurados/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
