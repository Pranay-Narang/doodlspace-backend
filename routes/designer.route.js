const router = require('express').Router()

const controller = require('../controllers/designer.controller')

const auth = require('../middleware/auth.middleware')

router.post('/designers', auth({ hasRole: ['owner'] }), controller.add)
router.get('/designers', auth({ hasRole: ['owner', 'designer', 'supervisor'] }), controller.read)
router.patch('/designers/:id', auth({ hasRole: ['owner'] }), controller.update)
router.delete('/designers/:id', auth({ hasRole: ['owner'] }), controller.remove)

router.get('/designers/:id/designrequests', auth({ hasRole: ['owner', 'supervisor'] }), controller.readDesignRequests)
router.get('/designers/:id/scheduled/designrequests', auth({ hasRole: ['owner', 'supervisor'] }), controller.readScheduledDesignRequests)

module.exports = router