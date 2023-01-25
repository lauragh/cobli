class Image {
    constructor(
        img,
        name,
        brightness,
        saturation,
        contrast,
        dateCreation,
        dateUpdation,
        colorTags,
    ){
        this.img = img;
        this.name = name;
        this.brightness = brightness;
        this.saturation = saturation;
        this.contrast = contrast;
        this.dateCreation = dateCreation;
        this.dateUpdation = dateUpdation;
        this.colorTags = colorTags;
    }
}

module.exports = Image