
class Color {
    constructor(
        color_name,
        brightness,
        hex,
        rgb,
        hsl,
        hsv,
        position,
        id,
        description
    ){
        this.color_name = color_name;
        this.brightness = brightness;
        this.hex = hex;
        this.rgb = rgb;
        this.hsl = hsl;
        this.hsv = hsv;
        this.position = position;
        this.id = id,
        this.description = description
    }
}

module.exports = Color