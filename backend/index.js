/*
Importación de módulos
*/
const express = require('express');
const cors = require('cors');
const fileupload = require("express-fileupload");
require('dotenv').config();

// Crear una aplicación de express
const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(fileupload());

// Abrir la aplicacíon en el puerto 3000
app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ' + process.env.PORT);
});

//routes
app.use('/api', require('./routes/auth.router'));
app.use('/api/users', require('./routes/user.router'));
app.use('/api/users', require('./routes/image.router'));
app.use('/api/users', require('./routes/color.router'));
