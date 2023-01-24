class Image {
    constructor(
        img,
        name,
        brightness,
        saturation,
        contrast,
        dateCreation
    ){
        this.img = img;
        this.name = name;
        this.brightness = brightness;
        this.saturation = saturation;
        this.contrast = contrast;
        this.dateCreation = dateCreation;
    }
}

module.exports = Image