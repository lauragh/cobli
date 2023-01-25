const express = require("express");
const router = express.Router();
const user_controller = require('../controllers/user.controller')


router.post('', user_controller.create_user);
router.get('', user_controller.get_user);
router.put('', user_controller.update_user);
router.delete('', user_controller.delete_user);

module.exports = router;