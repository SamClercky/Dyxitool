String.prototype.format = function (args) {
    var str = this;
    return str.replace(String.prototype.format.regex, function (item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        }
        else if (intVal === -1) {
            replace = "{";
        }
        else if (intVal === -2) {
            replace = "}";
        }
        else {
            replace = "";
        }
        return replace;
    });
};
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");
class AppScreen {
    constructor() {
        this.client = new Client();
        this.db = new Db();
        this.cscreen = new CScreen();
        this.prefabStyle = {
            "font": '*, html, body, h1, h2, h3, h4, h5, h6, p, span, div, code{font-family: "OpenDyslexic" !important; line-height: 150%;} code,pre{font-family: OpenDyslexicMono !important;}',
            "color": "#" + this.cscreen.id + ' {background: {0} !important;}',
            "opacity": "#" + this.cscreen.id + ' {opacity: {0} !important;}',
            "markup": "p, span, div, code { text-align: justify !important;text-justify: inter-word !important;background: white !important;color: #333 !important;line-height: 1.5 !important;font-size: 1em !important;}"
        };
        this.styleElements = [];
        this.settings = this.db._settings;
        this.enableBackground = false;
        insertCssFont();
        this.init = this.init.bind(this);
        this.db.onReady(this.init);
    }
    init() {
        Log.info("Db started, init layout");
        this.client.onResponse().then(settings => this.onNewData(settings));
        this.initLayout();
        this.initBackground();
    }
    onNewData(data) {
        this.changeLayoutItem(data.name, data.value);
    }
    initLayout() {
        for (let name in this.db._settings) {
            if (name.startsWith("_"))
                continue;
            this.db.get(name)
                .then((obj) => {
                Log.debugRaw(obj);
                this.createLayoutItem(obj.name, obj.value);
            });
        }
    }
    initBackground() {
        let elementen = document.querySelectorAll("p, li, span, code, dd, dt, dl, th, td");
        elementen.forEach(e => {
            e.onmouseover = (evt) => {
                Log.info("mouseOverEvent detected");
                if (!this.enableBackground) {
                    this.cscreen.setVisible(false);
                    return;
                }
                this.cscreen.setVisible(true);
                this.cscreen.position = this.getPos(evt.target);
                this.cscreen.resetPos();
            };
        });
    }
    createLayoutItem(name, value) {
        if (this.prefabStyle[name] != undefined) {
            let style = document.createElement("style");
            style.setAttribute("data", name);
            document.head.appendChild(style);
            this.styleElements.push(style);
        }
        this.changeLayoutItem(name, value);
    }
    changeLayoutItem(name, value) {
        Log.info(`changeLayoutItem called with arguments: name: ${name} and value: ${value}`);
        this.settings[name].value = value;
        switch (name) {
            case "dyslexic":
                if (!this.toBool(value.value)) {
                    for (var item in this.styleElements) {
                        this.styleElements[item].disabled = true;
                    }
                    this.enableBackground = false;
                }
                else {
                    for (var item in this.styleElements) {
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
                        if (!this.settings["dyslexic"].value) {
                            this.styleElements[item].disabled = true;
                            break;
                        }
                        if (this.toBool(value.value) == false) {
                            this.styleElements[item].disabled = true;
                        }
                        else {
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
                        if (!this.settings["dyslexic"].value) {
                            this.styleElements[item].disabled = true;
                            break;
                        }
                        if (this.toBool(value.value) == false) {
                            this.styleElements[item].disabled = true;
                        }
                        else {
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
                }
                else {
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
                            .format([Color.fromObject(value.value).colorHex]));
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
    getPos(elem) {
        let body = document.body;
        let pos = {
            X: elem.offsetLeft,
            Y: elem.offsetTop,
            Width: elem.offsetWidth,
            Height: elem.offsetHeight
        };
        while (elem.offsetParent) {
            let parent = elem.offsetParent;
            pos.X += parent.offsetLeft;
            pos.Y += parent.offsetTop;
            if (elem == body) {
                break;
            }
            else {
                elem = elem.offsetParent;
            }
        }
        return pos;
    }
    toBool(value) {
        if (typeof value == "boolean")
            return value;
        else
            return null;
    }
}
let app = new AppScreen();
//# sourceMappingURL=main.js.map