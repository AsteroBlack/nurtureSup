const route = require('express').Router()
const {authMiddleware} = require('../middleware/jwt.middleware')
const {getMenu} = require('../controlers/menu.controller')

route.get('/', authMiddleware, getMenu)

module.exports= route