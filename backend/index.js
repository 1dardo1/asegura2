const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/asegurados', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

mongoose.connection.on('connected', () => {
  console.log('✅ Conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión a MongoDB:', err);
});

// Modelo de jugador
const Player = mongoose.model('Player', {
  id: Number,
  name: String,
  money: Number,
  salary: Number,
  rent: Number,
  position: Number,
  insured: [String],
  skipNextTurn: Boolean
});

// Modelo de evento (solo para lectura, ya que introduces datos por Compass)
const Evento = mongoose.model('Evento', {
  tipo: String,
  texto: String,
  cantidad: Number,
  variable: String,
  descuento: Number
});

app.use(express.json());

// ==================== RUTAS DE JUGADORES ====================

// Obtener todos los jugadores
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find({}).sort({ id: 1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear/Inicializar jugadores (elimina existentes y crea nuevos)
app.post('/api/players', async (req, res) => {
  try {
    // Eliminar jugadores existentes
    await Player.deleteMany({});
    
    // Crear nuevos jugadores
    const players = req.body;
    if (!Array.isArray(players)) {
      return res.status(400).json({ error: 'Se esperaba un array de jugadores' });
    }
    
    const savedPlayers = await Player.insertMany(players);
    res.json({ success: true, players: savedPlayers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un jugador completo
app.put('/api/players/:id', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const updatedPlayer = { ...req.body };
    // Elimina el campo _id si viene en el body
    if (updatedPlayer._id) delete updatedPlayer._id;

    const result = await Player.findOneAndUpdate(
      { id: playerId },
      updatedPlayer,
      { new: true, runValidators: true }
    );
    if (!result) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Actualizar solo la posición de un jugador (optimizado para movimientos frecuentes)
app.patch('/api/players/:id/position', async (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    const { position } = req.body;
    
    if (typeof position !== 'number') {
      return res.status(400).json({ error: 'La posición debe ser un número' });
    }
    
    const result = await Player.findOneAndUpdate(
      { id: playerId },
      { position: position },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar todos los jugadores (reset del juego)
app.delete('/api/players', async (req, res) => {
  try {
    await Player.deleteMany({});
    res.json({ success: true, message: 'Todos los jugadores eliminados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RUTAS DE EVENTOS (SOLO LECTURA) ====================

// Obtener todos los eventos
app.get('/api/eventos', async (req, res) => {
  try {
    const eventos = await Evento.find({});
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener evento aleatorio
app.get('/api/eventos/random', async (req, res) => {
  try {
    const count = await Evento.countDocuments();
    if (count === 0) {
      return res.status(404).json({ error: 'No hay eventos disponibles' });
    }
    
    const randomIndex = Math.floor(Math.random() * count);
    const eventos = await Evento.find({}).skip(randomIndex).limit(1);
    
    res.json(eventos[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ARCHIVOS ESTÁTICOS ====================

// Servir archivos estáticos de Angular
app.use(express.static(path.join(__dirname, '../frontend/dist/asegurados/browser')));

// Catch-all handler para Angular routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/asegurados/browser/index.html'));
});

// ==================== INICIO DEL SERVIDOR ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../frontend/dist/asegurados/browser')}`);
});
