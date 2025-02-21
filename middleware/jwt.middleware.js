const jwt = require('jsonwebtoken')
require('dotenv').config()
const { DB } = require('../config/db')
const Users = DB.user

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Accès refusé, token manquant.' });

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        next()
    } catch (err) {
        res.status(400).json({ message: 'Token invalide.' })
    }
};

const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Accès refusé, token manquant.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findByPk(decoded.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé, administrateur requis.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
};
module.exports = {authMiddleware, authenticateAdmin};
