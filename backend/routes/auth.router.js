const express = require("express");
const router = express.Router();
const auth_controller = require('../controllers/auth.controller')

router.post('/login', auth_controller.login_user);
router.put('/newPassword', auth_controller.update_password);

// router.post('/register', auth_controller.registerUser);
// router.post('/logout', auth_controller.logoutUser);

module.exports = router;