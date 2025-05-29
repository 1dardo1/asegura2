const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../frontend/dist/asegurados/browser')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/asegurados/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

