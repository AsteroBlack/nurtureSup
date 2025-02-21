require('dotenv').config();
const express = require('express');
const db = require('./config/db')
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user.routes')
const orderRoutes = require('./routes/order.routes')
const menuRoutes = require('./routes/menu.routes')
const {wwjs} = require('./services/whatsappService')

wwjs.initialize()

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Middleware
app.use('/user', userRoutes)
app.use('/order', orderRoutes)
app.use('/menu', menuRoutes)

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Bienvenue sur la plateforme de commande de nourriture !');
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
