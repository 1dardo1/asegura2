const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos de Angular
app.use(express.static(path.join(__dirname, '../frontend/dist/asegurados/browser')));

// Middleware catch-all (¡debe ir al final!)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/asegurados/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

