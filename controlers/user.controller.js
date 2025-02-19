const jwt = require('jsonwebtoken')
const { DB } = require('../config/db')
const { sendWaMsg } = require('../services/whatsappService')
const user = DB.user

// Génère un token JWT
const generateToken = (userInfo) => {
    return jwt.sign({ id: userInfo.id, role: userInfo.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
// Génère un reset token JWT
const generateResetToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_RESET_SECRET, { expiresIn: '1h' });
};

const register = async (req, res) => {
    try {
        const { name, number, role } = req.body
        const isExist = await user.findOne({ where: { number } })

        if (!req.user || req.user.role !== 'admin')
            return res.status(403).json({ message: 'Seuls les admins peuvent créer des comptes.' })
        if (isExist)
            return res.status(409).json({ message: 'ce compte existe deja' })

        const password = Math.random().toString(36).slice(-8); // Génération d'un mot de passe aléatoire
        const newUser = await user.create({ name, number, password: password, role })
        await sendWaMsg(number, `Votre compte a été créé. Votre mot de passe : *${password}*`)
        res.status(201).json({ message: 'Utilisateur créé avec succès !', user: newUser })
    } catch (error) {
        res.status(500).json({ message: "Une erreur s'est produite" })
        console.log(error)
    }

}

const login = async (req, res) => {
    try {
        const { number, password } = req.body
        const isExist = await user.findOne({ where: { number: number } })
        if (!isExist)
            return res.status(404).json({ message: 'Utilisateur introuvable.' })
        if (!isExist.authenticate(password))
            return res.status(401).json({ message: 'mot de passe incorrecte.' })

        const token = generateToken(isExist);
        res.json({ message: 'Connexion réussie !', token, isExist });
    } catch (error) {
        res.status(500).json({ message: 'Utilisateur incorrecte.' })
        console.log(error)
    }
}

const requestPasswordReset = async (req, res) => {
    try {
        const { number } = req.body
        const isExist = await user.findOne({ where: { number } })
        if (!isExist)
            res.status(404).json({ message: 'Utilisateur introuvable.' })
        const resetToken = generateResetToken(isExist)
        isExist.passwordResetToken = resetToken
        isExist.passwordResetExpires = new Date(Date.now() + 3600000) // Expire après 15 minutes
        await isExist.save()

        const resetLink = `http://localhost:5000/user/reset-password/${resetToken}`
        await sendWaMsg(number, `🔑 Réinitialisation du mot de passe :\nClique sur ce lien pour réinitialiser ton mot de passe : ${resetLink}\n⚠️ Le lien expire dans 15 minutes.`)
        res.status(201).json({ message: "Lien de réinitialisation envoyé sur WhatsApp !", resetLink })
    } catch (error) {
        res.status(500).json({ message: 'Utilisateur incorrecte.' })
        console.log(error)
    }

}

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmNewPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
        const isExist = await user.findByPk(decoded.id);

        if (!isExist) return res.status(404).json({ message: "Utilisateur introuvable." });

        if (newPassword !== confirmNewPassword) return res.status(401).json({ message: "Les passwords de correspondent pas !!" })

        isExist.password = newPassword
        isExist.passwordResetToken = null;
        user.passwordResetExpires = null;
        await isExist.save();
        console.log(token);


        res.json({ message: 'Mot de passe réinitialisé avec succès !' });
    } catch (error) {
        res.status(400).json({ message: 'Lien invalide ou expiré.', error });
    }
}
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        const isExist = await user.findByPk(req.user.id);

        if (!isExist) return res.status(404).json({ message: "Utilisateur introuvable." });

        // Vérifier l'ancien mot de passe avec `authenticate`
        const isMatch = await isExist.authenticate(oldPassword);
        if (!isMatch) return res.status(401).json({ message: "Ancien mot de passe incorrect." });
        if (newPassword !== confirmNewPassword) return res.status(401).json({ message: "Les passwords de correspondent pas !!" })
        // Mettre à jour le mot de passe 
        isExist.password = newPassword;
        await isExist.save();

        res.json({ message: "Mot de passe modifié avec succès !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const logout = async (req, res) => {

}

module.exports = { resetPassword, requestPasswordReset, register, login, logout, changePassword }