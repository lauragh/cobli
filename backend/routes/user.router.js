const express = require("express");
const router = express.Router();
const user_controller = require('../controllers/user.controller')


router.post('/', user_controller.create_user);
router.get('/:userId', user_controller.get_user);
router.get('/', user_controller.get_user);
router.put('/:userId', user_controller.update_user);
router.delete('/:userId', user_controller.delete_user);

module.exports = router;
