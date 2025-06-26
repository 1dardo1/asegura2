const express = require('express');
const Evento = require('../models/evento.models'); 
const router = express.Router();

router.get('/eventos', async (req, res) => {
  try {
    const eventos = await Evento.find();
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

module.exports = router;
