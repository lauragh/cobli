const express = require("express");
const router = express.Router();
const color_controller = require('../controllers/color.controller')

const usuario = "-NMcYHxLY0F-yfnPx7b_";
const image = "-NMZgEPiehjrdVC68OpT";

router.post('/' + usuario + '/images', color_controller.create_color);
router.get('/' + usuario + '/images/' + image, color_controller.get_color);
router.put('/' + usuario + '/images/' + image + '/colorTags', color_controller.update_color);
router.delete('/' + usuario +'/images/' + image + '/colorTags', color_controller.delete_color);

module.exports = router;