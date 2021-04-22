const router = require("express").Router();

const controller = require("../controllers/users.controller");

const auth = require("../middleware/auth.middleware");

router.get('/users', auth({ hasRole: ['owner'] }), controller.read)

module.exports = router