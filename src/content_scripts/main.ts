interface Styles {
    font: string,
    color: string,
    opacity: string,
    markup: string
}
interface Element {
    onmouseover: {(MouseEvent): void},
    offsetLeft: number,
    offsetTop: number,
    offsetWidth: number,
    offsetHeight: number,
    offsetParent: Element
}
interface String {
    format: any
}

// code from: https://www.codeproject.com/Tips/201899/String-Format-in-JavaScript
String.prototype.format = function (args) {
    var str = this;
    return str.replace(String.prototype.format.regex, function (item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        } else if (intVal === -1) {
            replace = "{";
        } else if (intVal === -2) {
            replace = "}";
        } else {
            replace = "";
        }
        return replace;
    });
};
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

class AppScreen {    
    readonly client = new Client()
    readonly db = new Db()
    readonly cscreen = new CScreen()
    readonly prefabStyle: Styles = AppScreen.constructPrefabFont(this.cscreen);
    
    styleElements: HTMLStyleElement[] = []
    settings: Settings = this.db._settings
    enableBackground = false

    constructor() {
        insertCssFont() // add support for OpenDyslexic
        this.init = this.init.bind(this)
        this.db.onReady(this.init)
    }

    private static constructPrefabFont(cscreen: CScreen): Styles {
        const concatSelectors = (prev: string, curr: string) => {
            return (prev === "") ? curr : `${prev}, ${curr}`;
        }

        const fontSelectorExceptions = [
            "", // Anders ==> .fab:not(.glyphicon):not(...)
            ".fab",
            ".fa",
            ".glyphicon",
        ].reduce((prev, curr) => `${prev}:not(${curr})`);

        const fontSelectorNormal = [
            "", // Zie fontSelectorExceptions
            "html",
            "body",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "p",
            "span",
            "div",
            "a",
        ].map(item => (item === "") ? item : item + fontSelectorExceptions)
        .reduce(concatSelectors);

        const fontSelectorMono = [
            "", // Zie fontSelectorException
            "code",
            "pre",
        ].reduce(concatSelectors);

        const markupSelector = [
            "", // Zie fontSelectorException
            "p",
            "span",
            "div",
            "code",
        ].reduce(concatSelectors);
        
        return {
            "font": fontSelectorNormal + ' {font-family: "OpenDyslexic" !important; } ' + fontSelectorMono + '{font-family: OpenDyslexicMono !important;}',
            "color": "#" + cscreen + ' {background: {0} !important;}',
            "opacity": "#" + cscreen + ' {opacity: {0} !important;}',
            "markup": markupSelector + " { text-align: justify !important;text-justify: inter-word !important;background: white !important;color: #333 !important;line-height: 1.5 !important;font-size: 1em !important;}"
        }
    }

    private init() {
        Log.info("Db started, init layout")

        this.client.onResponse().then(settings => this.onNewData(settings))

        this.initLayout()
        this.initBackground()
    }

    private onNewData(data: PackedSetting) {
        this.changeLayoutItem(data.name, data.value)
    }

    private initLayout() {
        for (let name in this.db._settings) {
            if (name.startsWith("_")) continue

            this.db.get(name)
                .then((obj) => {
                    Log.debugRaw(obj)
                    this.createLayoutItem(obj.name, obj.value)
                })
        }
    }

    private initBackground() {
        let elementen = document.querySelectorAll("p, li, span, code, dd, dt, dl, th, td")
        elementen.forEach(e => {
            e.onmouseover = (evt: MouseEvent) => {
                Log.info("mouseOverEvent detected")
                if (!this.enableBackground) {
                    this.cscreen.setVisible(false)
                    return
                }
                this.cscreen.setVisible(true)
                this.cscreen.position = this.getPos(evt.target as Element)

                this.cscreen.resetPos()
            }
        })
    }

    private createLayoutItem(name: string, value: Setting) {
        if (this.prefabStyle[name] != undefined) {
            let style = document.createElement("style") as HTMLStyleElement
            style.setAttribute("data", name)
            document.head.appendChild(style)
            this.styleElements.push(style)
        }
        this.changeLayoutItem(name, value)
    }

    private changeLayoutItem(name: string, value: Setting) {
        Log.info(`changeLayoutItem called with arguments: name: ${name} and value: ${value}`)
        this.settings[name].value = value;
    
        switch (name) {
            case "dyslexic":
                if (!this.toBool(value.value)) {
                    for (var item in this.styleElements) { // turn everything off
                        this.styleElements[item].disabled = true;
                    }
                    this.enableBackground = false;
                } else {
                    for (var item in this.styleElements) { // turn everything while looking at the other settings
                        if (!this.settings["screen"].value && this.styleElements[item].getAttribute("data") == "color") {
                            this.styleElements[item].disabled = true;
                            continue;
                        }
                        if (!this.settings["font"].value && this.styleElements[item].getAttribute("data") == "font") {
                            this.styleElements[item].disabled = true;
                            continue;
                        }
                        if (!this.settings["markup"].value && this.styleElements[item].getAttribute("data") == "markup") {
                            this.styleElements[item].disabled = true;
                            continue;
                        }
                        this.styleElements[item].disabled = false;
                    }
                    if (this.settings["screen"].value)
                        this.enableBackground = true;
                    else
                        this.enableBackground = false;
                }
                break;
            case "font":
                for (var item in this.styleElements) {
                    if (this.styleElements[item].getAttribute("data") == "font") {
                        var entry = document.createTextNode(this.prefabStyle.font);
                        if (this.styleElements[item].childNodes[0])
                            this.styleElements[item].removeChild(this.styleElements[item].childNodes[0]);
                        this.styleElements[item].appendChild(entry);
    
                        // check if dyslexic is enabled
                        if (!this.settings["dyslexic"].value) {
                            this.styleElements[item].disabled = true;
                            break;
                        }
                        // otherwise
                        if (this.toBool(value.value) == false) {
                            this.styleElements[item].disabled = true;
                        } else {
                            this.styleElements[item].disabled = false;
                        }
                        break;
                    }
                }
                break;
            case "markup":
                for (var item in this.styleElements) {
                    if (this.styleElements[item].getAttribute("data") == "markup") {
                        var entry = document.createTextNode(this.prefabStyle["markup"]);
                        if (this.styleElements[item].childNodes[0])
                            this.styleElements[item].removeChild(this.styleElements[item].childNodes[0]);
                        this.styleElements[item].appendChild(entry);
    
                        // check if dyslexic is enabled
                        if (!this.settings["dyslexic"].value) {
                            this.styleElements[item].disabled = true;
                            break;
                        }
                        // otherwise
                        if (this.toBool(value.value) == false) {
                            this.styleElements[item].disabled = true;
                        } else {
                            this.styleElements[item].disabled = false;
                        }
                        break;
                    }
                }
                break;
            case "screen":
                if (!this.toBool(value.value)) {
                    for (var item in this.styleElements) {
                        if (this.styleElements[item].getAttribute("data") == "color") {
                            this.styleElements[item].disabled = true;
                            break;
                        }
                    }
                    this.enableBackground = false;
                } else {
                    for (var item in this.styleElements) {
                        if (this.settings["dyslexic"].value && this.styleElements[item].getAttribute("data") == "color") {
                            this.styleElements[item].disabled = false;
                            this.enableBackground = true;
                            break;
                        }
                    }
                }
                break;
            case "color":
                for (var item in this.styleElements) {
                    if (this.styleElements[item].getAttribute("data") == "color") {
                        var entry = document.createTextNode(this.prefabStyle["color"]
                            .format([Color.fromObject(value.value as BasicColor).colorHex]));
                        if (this.styleElements[item].childNodes[0])
                            this.styleElements[item].removeChild(this.styleElements[item].childNodes[0]);
                        this.styleElements[item].appendChild(entry);
                        if (!this.settings["screen"].value || !this.settings["dyslexic"].value)
                            this.styleElements[item].disabled = true;
                        break;
                    }
                }
                break;
            case "opacity":
                for (var item in this.styleElements) {
                    if (this.styleElements[item].getAttribute("data") == "opacity") {
                        var entry = document.createTextNode(this.prefabStyle["opacity"].format([value.value]));
                        if (this.styleElements[item].childNodes[0])
                            this.styleElements[item].removeChild(this.styleElements[item].childNodes[0]);
                        this.styleElements[item].appendChild(entry);
                        if (!this.settings["screen"].value || !this.settings["dyslexic"].value)
                            this.styleElements[item].disabled = true;
                        break;
                    }
                }
                break;
        }
    }

    private getPos(elem: Element): Rect {
        let body = document.body

        let pos: Rect = {
            X: elem.offsetLeft,
            Y: elem.offsetTop,
            Width: elem.offsetWidth,
            Height: elem.offsetHeight
        }

        while (elem.offsetParent) {
            let parent = elem.offsetParent
            pos.X += parent.offsetLeft
            pos.Y += parent.offsetTop
            
            if (elem == body) {
                break
            } else {
                elem = elem.offsetParent
            }
        }

        return pos
    }

    private toBool(value: SettingValue): boolean {
        if (typeof value == "boolean")
            return value
        else
            return null
    }
}

let app = new AppScreen() // start application

// window.addEventListener("load", () => {
//     // at load walk dom tree and eliminate glyphs
//     setTimeout(async () => {await glyphprotection();}, 6000);
//     // setInterval(async () => { await glyphprotection()}, 10000);
// });
// Log.debugRaw(app)
// Log.info("App started!!!")

// for debugging only
// app.db.onChange((e) => {
//     Log.debugRaw(e)
// })
