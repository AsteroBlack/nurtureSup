const route = require('express').Router()
const {authMiddleware, authenticateAdmin} = require('../middleware/jwt.middleware')
const { getAllOrder, getOrderByUser, modifParam, setOrder } = require('../controlers/order.controller')

route.get('/getorderbyuser',authMiddleware, getOrderByUser)
route.post('/', authMiddleware, setOrder)
route.post('/modifparam',authenticateAdmin, modifParam)
route.get('/',authenticateAdmin, getAllOrder)

module.exports =  route