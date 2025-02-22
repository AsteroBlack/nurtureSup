const { DB } = require('../config/db')
const getWeekNumber = require('../middleware/weekFunction')
const Parameters = DB.parameters
const Users = DB.user
const Menu = DB.menu
const Order = DB.order


const setOrder = async (req, res) => {
    try {
        const { jour, plat, entreeDessert } = req.body
        const userId = req.user.id

        const today = new Date()
        const currentWeek = getWeekNumber(today)
        console.log(currentWeek);
        
        const week = `Semaine-${currentWeek + 1}-${new Date().getFullYear()}`
        
        const menu = await Menu.findOne({ where: { week: week } })
        const order = await Order.findOne({where:{menuId: menu.id, jour}}) 

        if (!menu) return res.status(400).json({ message: 'Aucun menu disponible pour cette semaine' })
        if (order) return res.status(400).json({message: 'Vous avez deja commander ce jour'})
        const parametres = await Parameters.findOne({ where: { key: 'max_plats_jour' } })
        const maxPlats = parametres ? parametres.valeur : 3

        const commandesDuJour = await Order.count({ where: { jour } })
        if (commandesDuJour >= maxPlats) return res.status(400).json({ message: 'Nombre maximal de plats atteint pour ce jour' })

        await Order.create({ userId, menuId: menu.id, jour, plat, entreeDessert })
        res.status(201).json({ message: 'Commande enregistrée avec succès' })
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

const getOrderByUser = async (req, res) => {
    try {
        const order = await Order.findAll({ where: { userId: req.user.id } })
        res.json(order)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

const getAllOrder = async (req, res) => {
    try {
        const allOrders = await Order.findAll({ include: [{ model: DB.user, attributes: ['name', 'number'] }] })
        res.json(allOrders)
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error })
    }
}

const modifParam = async (req, res) => {
    try {
        const { key, value } = req.body;
        await Parameters.upsert({ key, value });
        res.json({ message: 'Paramètre mis à jour avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
}
module.exports = { setOrder, getOrderByUser, getAllOrder, modifParam }