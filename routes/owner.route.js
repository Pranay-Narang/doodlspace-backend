const router = require('express').Router()

const controller = require('../controllers/owner.controller')

const auth = require('../middleware/auth.middleware')

router.post('/owners', auth({ hasRole: ['superadmin'] }), controller.add)
router.get('/owners', auth({ hasRole: ['owner', 'superadmin'] }), controller.read)
router.patch('/owners/:id', auth({ hasRole: ['superadmin'] }), controller.update)
router.delete('/owners/:id', auth({ hasRole: ['superadmin'] }), controller.remove)

module.exports = router