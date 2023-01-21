const httpCodes = require('../database/httpCodes');

class Images {
    constructor(
        img,
        name,
        colorTags,
        brightness,
        saturation,
        contrast,
        dateCreation
    ){
        this.img = img;
        if(!this.validatePicture(img)){
            // return res.status(httpCodes.BAD_REQUEST).json({
            //     ok: false,
            //     msg: 'La imagen no es válida'
            // });
            throw new Error("La imagen no es válida")
        }
        this.name = name;
        this.colorTags = colorTags;
        this.brightness = brightness;
        this.saturation = saturation;
        this.contrast = contrast;
        this.dateCreation = dateCreation;
    }

    validatePicture(picture){
        let pattern = ".+(\\.jpg|\\.png|\\.jpeg)";
        let matcher = new RegExp(pattern);
        return matcher.test(picture)
    }
}

module.exports = Images