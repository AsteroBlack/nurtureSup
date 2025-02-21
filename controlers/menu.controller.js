const {DB} = require('../config/db')
const getWeekNumber = require('../middleware/weekFunction')
const Menu = DB.menu

const getMenu  = async (req,  res) => {
    try {
        const day = new Date
        const currentWeek = getWeekNumber(day) 
        const menu = await Menu.findOne({ where: { week: `Semaine-${currentWeek + 1}-${new Date().getFullYear()}` } });
        if (!menu) return res.status(404).json({ message: 'Aucun menu disponible cette semaine' });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
}

module.exports = {getMenu}