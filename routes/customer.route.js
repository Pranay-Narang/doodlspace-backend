const router = require('express').Router()

const controller = require('../controllers/customer.controller')

const auth = require('../middleware/auth.middleware')

router.post('/customers', auth(), controller.add)
router.get('/customers', auth({ hasRole: ['customer', 'owner'] }), controller.read)
router.patch('/customers', auth({ hasRole: ['customer'] }), controller.update)
router.delete('/customers', auth({ hasRole: ['customer', 'owner'] }), controller.remove)

module.exports = router