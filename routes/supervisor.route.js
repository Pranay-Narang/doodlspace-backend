const router = require("express").Router();

const controller = require("../controllers/supervisor.controller");

const auth = require("../middleware/auth.middleware");

router.post("/supervisors", auth({ hasRole: ["owner"] }), controller.add);
router.get("/supervisors", auth({ hasRole: ["owner", "supervisor"] }), controller.read);
router.patch("/supervisors/:id", auth({ hasRole: ["owner"] }), controller.update);
router.delete("/supervisors/:id", auth({ hasRole: ["owner"] }), controller.remove);

module.exports = router;
