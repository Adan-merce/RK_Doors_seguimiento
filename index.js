// Ejemplo en Node.js
const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'tu_usuario',
  password: 'tu_contraseña',
  database: 'tu_base_de_datos'
});

app.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;
  const query = 'SELECT nivel FROM usuarios WHERE usuario = ? AND contrasena = ?';
  connection.query(query, [usuario, contrasena], (err, results) => {
    if (err) {
      return res.json({ error: 'Error en la base de datos' });
    }
    if (results.length > 0) {
      // Usuario encontrado
      res.json({ nivel: results[0].nivel });
    } else {
      res.json({ error: 'Usuario o contraseña incorrectos' });
    }
  });
});

app.listen(3000, () => console.log('Servidor en puerto 3000'));
