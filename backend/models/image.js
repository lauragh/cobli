class Image {
    constructor(
        img,
        name,
        colorblindness,
        brightness,
        saturation,
        contrast,
        dateCreation,
        dateUpdating,
        colorTags,
    ){
        this.img = img;
        this.name = name;
        this.colorblindness = colorblindness;
        this.brightness = brightness;
        this.saturation = saturation;
        this.contrast = contrast;
        this.dateCreation = dateCreation;
        this.dateUpdating = dateUpdating;
        this.colorTags = colorTags;
    }
}

module.exports = Image