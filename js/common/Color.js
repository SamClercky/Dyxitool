class Color {
    constructor(value, alpha) {
        this._hex = "";
        this.alpha = 100;
        this.colorHex = value;
        this.colorAlpha = alpha;
    }
    set colorHex(value) {
        if (value == undefined) {
            Log.error("value is undentified :-(");
            return;
        }
        if (value.startsWith("#")) {
            let color = value.substr(1, value.length - 1);
            if (color.length == 3) {
                this._hex = "#";
                color.split("").forEach(char => {
                    this._hex += char + char;
                });
                this._hex = this._hex.toLowerCase();
            }
            else if (color.length == 6) {
                this._hex = `#${color}`.toLowerCase();
            }
        }
        this._hex = value.toLowerCase();
    }
    get colorHex() {
        return this._hex;
    }
    set colorAlpha(value) {
        if (!value) {
            this.alpha = 100;
        }
        else if (value < 0) {
            this.alpha = 0;
        }
        else if (value > 100) {
            this.alpha = 100;
        }
        else {
            this.alpha = value;
        }
    }
    get colorAlpha() {
        return this.alpha;
    }
    static fromHex(hex, alpha) {
        return new Color(hex, alpha);
    }
    static fromObject(obj) {
        return Color.fromHex(obj._hex, obj.alpha);
    }
}
Color.RED = Color.fromHex("#ff0000");
Color.GREEN = Color.fromHex("#00ff00");
Color.BLUE = Color.fromHex("#0000ff");
Color.WHITE = Color.fromHex("#ffffff");
Color.BLACK = Color.fromHex("#000000");
//# sourceMappingURL=Color.js.map