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


//routes
require('./controllers/user.controller')(app);
require('./controllers/image.controller')(app);
require('./controllers/color.controller')(app);