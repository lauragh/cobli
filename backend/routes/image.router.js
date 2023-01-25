const express = require("express");
const router = express.Router();
const image_controller = require('../controllers/image.controller');

const usuario = "-NMcYHxLY0F-yfnPx7b_";
const image = "-NMZgEPiehjrdVC68OpT";

router.post('/' + usuario, image_controller.create_image);
router.get('/' + usuario + '/images', image_controller.get_image);
router.put('/' + usuario + '/images', image_controller.update_image);
router.delete('/' + usuario + '/images', image_controller.delete_image);

module.exports = router;