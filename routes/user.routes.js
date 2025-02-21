const route = require('express').Router()
const { logout, login, register, resetPassword, requestPasswordReset, changePassword} = require('../controlers/user.controller')
const {authMiddleware,authenticateAdmin} = require('../middleware/jwt.middleware')

route.post('/register', authMiddleware, register)
route.post('/login', login)
route.delete('/logout', logout)
route.post('/request-reset-password', requestPasswordReset)
route.post('/reset-password/:token', resetPassword)
route.post('/change-password', authMiddleware, changePassword);



module.exports = route