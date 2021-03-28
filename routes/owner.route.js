const router = require('express').Router()

const controller = require('../controllers/owner.controller')

const auth = require('../middleware/auth.middleware')

router.post('/owners', auth({ hasRole: ['owner'] }), controller.add)
router.get('/owners', auth({ hasRole: ['owner'] }), controller.read)
router.patch('/owners/:id', auth({ hasRole: ['owner'] }), controller.update)
router.delete('/owners/:id', auth({ hasRole: ['owner'] }), controller.remove)

module.exports = router