
class Color {
    constructor(
        id,
        color,
        clarity,
        hexCod,
        rgb,
        hsl,
        hsv,
        position
    ){
        this.id = id;
        this.color = color;
        this.clarity = clarity;
        this.hexCod = hexCod;
        this.rgb = rgb;
        this.hsl = hsl;
        this.hsv = hsv;
        this.positio = position;
    }
}

module.exports = Color