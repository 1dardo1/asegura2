const mongoose = require('mongoose');


const eventoSchema = new mongoose.Schema({
  _id: Number,
  tipo: {
    type: String,
    enum: [
      "SALUD",
      "VIDA",
      "COCHE",
      "VIAJE",
      "HOGAR",
      "RESPONSABILIDAD_CIVIL",
      "CAJA_AHORROS",
      "EVENTO"
    ],
    required: true
  },
  texto: { type: String, required: true },
  cantidad: { type: Number, required: true },
  variable: {
    type: String,
    enum: ['money', 'salary', 'rent'],
    required: true
  },
  descuento: { type: Number, enum: [0.5, 1], required: false }
});
module.exports = mongoose.model('Evento', eventoSchema);

