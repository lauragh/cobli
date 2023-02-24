const express = require("express");
const router = express.Router();
const image_controller = require('../controllers/image.controller');

router.post('/:userId', image_controller.create_image);
router.get('/:userId/images', image_controller.get_images);
router.get('/:userId/images/:imageId', image_controller.get_image);
router.put('/:userId/images/:imageId', image_controller.update_image);
router.delete('/:userId/images/:imageId', image_controller.delete_image);

module.exports = router;