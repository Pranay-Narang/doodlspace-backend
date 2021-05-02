const router = require('express').Router()

const controller = require('../controllers/customer.controller')

const auth = require('../middleware/auth.middleware')

router.post('/customers', auth(), controller.add)
router.get('/customers', auth({ hasRole: ['owner', 'customer'] }), controller.read)
router.patch('/customers/:id', auth({ hasRole: ['owner', 'customer'] }), controller.update)
router.delete('/customers/:id', auth({ hasRole: ['owner'] }), controller.remove)

router.get('/customers/:id/brands', auth({hasRole: ['owner', 'customer', 'designer']}), controller.readBrands)
module.exports = router