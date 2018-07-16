interface BasicColor {
    _hex: string,
    alpha: number
}

class Color implements BasicColor {
    static readonly RED = Color.fromHex("#ff0000");
    static readonly GREEN = Color.fromHex("#00ff00");
    static readonly BLUE = Color.fromHex("#0000ff");
    static readonly WHITE = Color.fromHex("#ffffff");
    static readonly BLACK = Color.fromHex("#000000");

    /**
     * Do not use these, use colorHex instead !!!
     */
    _hex = ""
    /**
     * Do not use these, use colorAlpha instead !!!
     */
    alpha = 100

    private constructor(value: string, alpha?: number) {
        this.colorHex = value
        this.colorAlpha = alpha
    }

    set colorHex(value: string) {
        if (value == undefined) {
            Log.error("value is undentified :-(")
            return
        }
        if (value.startsWith("#")) {
            let color = value.substr(1, value.length-1)
            if (color.length == 3) {
                this._hex = "#"
                color.split("").forEach(char => {
                    this._hex += char + char;
                })
                this._hex = this._hex.toLowerCase();
            } else if (color.length == 6) {
                this._hex = `#${color}`.toLowerCase()
            }
        }
        this._hex = value.toLowerCase();
    }

    get colorHex(): string {
        return this._hex;
    }

    set colorAlpha(value: number) {
        if (!value) {
            this.alpha = 100
        } else if (value < 0) {
            this.alpha = 0
        } else if (value > 100) {
            this.alpha = 100
        } else {
            this.alpha = value
        }
    }

    get colorAlpha(): number {
        return this.alpha
    }

    static fromHex(hex: string, alpha?: number): Color {
        return new Color(hex, alpha);
    }

    static fromObject(obj: BasicColor): Color {
        return Color.fromHex(obj._hex, obj.alpha)
    }
}