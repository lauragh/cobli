const express = require("express");
const router = express.Router();
const color_controller = require('../controllers/color.controller')

router.post('/:userId/images/:imageId', color_controller.create_color);
router.get('/:userId/images/:imageId/colorTags', color_controller.get_color);
// router.put('/:userId/images/:imageId/colorTags/:colorId', color_controller.update_color);
router.delete('/:userId/images/:imageId/colorTags/:colorId', color_controller.delete_color);

module.exports = router;