/*
Importación de módulos
*/
const express = require('express');
const cors = require('cors');
require('dotenv').config();


// Crear una aplicación de express
const app = express();

app.use(cors());
app.use(express.json());

// Abrir la aplicacíon en el puerto 3000
app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ' + process.env.PORT);
});
const user_controller = require('./controllers/user.controller')

const image_controller = require('./controllers/image.controller');

//routes

app.use('/api/users', require('./routes/user.router'));
app.use('/api/users', require('./routes/image.router'));
app.use('/api/users', require('./routes/color.router'));
