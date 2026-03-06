// index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors()); // Permite solicitudes desde cualquier origen
app.use(express.json()); // Para parsear JSON

// Abre la base de datos
const db = new sqlite3.Database('C:/ProgramData/MySQL/MySQL Server 8.0/Data/registros_usuarios/rk_doors.db');

// API para login
app.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  db.get("SELECT * FROM usuarios WHERE usuario = ?", [usuario], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.json({ error: 'Usuario no encontrado' });
    }

    // Aquí deberías verificar la contraseña con bcrypt, pero para simplificar:
    if (contrasena === row.contrasena) {
      return res.json({ nivel: row.nivel });
    } else {
      return res.json({ error: 'Contraseña incorrecta' });
    }
  });
});

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});