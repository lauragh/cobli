
class Color {
    constructor(
        color_name,
        clarity,
        hexCod,
        rgb,
        hsl,
        hsv,
        position
    ){
        this.color_name = color_name;
        this.clarity = clarity;
        this.hexCod = hexCod;
        this.rgb = rgb;
        this.hsl = hsl;
        this.hsv = hsv;
        this.position = position;
    }
}

module.exports = Color