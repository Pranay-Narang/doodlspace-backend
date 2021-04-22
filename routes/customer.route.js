const router = require('express').Router()

const controller = require('../controllers/customer.controller')

const auth = require('../middleware/auth.middleware')

router.post('/customers', auth(), controller.add)
router.get('/customers', auth({ hasRole: ['owner'] }), controller.read)
router.patch('/customers/:id', auth({ hasRole: ['owner'] }), controller.update)
router.delete('/customers/:id', auth({ hasRole: ['owner'] }), controller.remove)

module.exports = router