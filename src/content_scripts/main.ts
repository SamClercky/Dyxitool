/// <reference path="../common/Color.ts" />
/// <reference path="../common/CommunicationInterface.ts" />
/// <reference path="../common/iStorage.ts" />
/// <reference path="../common/logging.ts" />

/// <reference path="./client.ts" />
/// <reference path="./cscreen.ts" />
/// <reference path="./insertCssFont.ts" />
/// <reference path="./settingsState.ts" />

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
    readonly settingsStateNotifier: SettingsStateNotifier = new SettingsStateNotifier(this.client, this.db);
    
    private styleElements = {
        font: HTMLStyleElement,
        markup: HTMLStyleElement,
        opacity: HTMLStyleElement,
        color: HTMLStyleElement,
    }
    enableBackground = false

    constructor() {
        insertCssFont() // add support for OpenDyslexic
        // binding section
        this.init = this.init.bind(this);
        this.setLayoutFromSettings = this.setLayoutFromSettings.bind(this);
        // start on ready
        this.db.onReady(this.init);
    }

    /**
     * A utility function to facilitate creating css-selectors
     * @param Reference to cscreen
     * @returns The needed styles with selectors
     */
    private static constructPrefabFont(cscreen: CScreen): Styles {
        const concatSelectors = (prev: string, curr: string) => {
            return (prev === "") ? curr : `${prev}, ${curr}`;
        }

        const fontSelectorExceptions = [
            "", // Anders ==> .fab:not(.glyphicon):not(...)
            ".fab",
            ".fa",
            ".fas",
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
            "color": "#" + cscreen.id + ' {background: {0} !important;}',
            "opacity": "#" + cscreen.id + ' {opacity: {0} !important;}',
            "markup": markupSelector + " { text-align: justify !important;text-justify: inter-word !important;background: white !important;color: #333 !important;line-height: 1.5 !important;font-size: 1em !important;}"
        }
    }

    /**
     * Defered constructor and entry of app
     */
    private init(): void {
        Log.info("Db started, init layout")

        // this.client.onResponse().then(settings => this.onNewData(settings))
        this.settingsStateNotifier.onSettingsState(this.setLayoutFromSettings)

        // this.initLayout()
        this.createLayoutItems();
        this.initBackground();

        // update layout
        this.setLayoutFromSettings(this.db.getAllFromCache());
    }

    // private onNewData(data: PackedSetting) {
    //     this.changeLayoutItem(data.name, data.value)
    // }

    private setLayoutFromSettings(settings: Settings): void {
        Log.info("Applying settings: ");
        Log.info(settings);
        
        if (!settings.dyslexic.value) {
            // if master setting is false ==> stop everything and stop executing
            this.setDyslexicFalse();
            return;
        }
        Log.log("Dyslexic value is set");
        this.setFont(settings.font.value as boolean);
        this.setMarkup(settings.markup.value as boolean);
        this.setScreen(settings.screen.value as boolean);
        this.setScreenColor(settings.color.value as Color);
        this.setOpacity(settings.opacity.value as number);
    }

    private setDyslexicFalse() {
        this.setFont(false);
        this.setMarkup(false);
        this.setScreen(false);
    }

    private setFont(option: boolean) {
        // @ts-ignore
        this.styleElements.font.disabled = !option;
        Log.log("setFont.disabled = " + !option);
    }

    private setMarkup(option: boolean) {
        // @ts-ignore
        this.styleElements.markup.disabled = !option;
        Log.log("setMarkup.disabled = " + !option);
    }

    private setScreen(option: boolean) {
        // @ts-ignore
        this.enableBackground = option;
        Log.log("setScreen.disabled = " + !option);
    }

    private setScreenColor(color: Color) {
        // @ts-ignore
        this.styleElements.color.innerText = this.prefabStyle["color"]
            .format([color._hex]); // TODO: find better solution for _hex
    }

    private setOpacity(opacity: number) {
        // @ts-ignore
        this.styleElements.opacity.innerText = this.prefabStyle["opacity"]
            .format([opacity]);
    }

    /**
     * @deprecated
     */
    private initLayout(): void {
        Log.warn("Deprecated initLayout has been called");
        // for (let name in this.db.getAllFromCache()) {
        //     if (name.startsWith("_")) continue

        //     this.db.get(name)
        //         .then((obj) => {
        //             Log.debugRaw(obj)
        //             this.createLayoutItem(obj.name, obj.value)
        //         })
        // }
    }

    /**
     * Controls everything concerning the mechanics of the overlay
     */
    private initBackground(): void {
        let elementen = document.querySelectorAll("p, li, span, code, dd, dt, dl, th, td")
        elementen.forEach(e => {
            e.onmouseover = (evt: MouseEvent) => {
                Log.info("mouseOverEvent detected")
                // const shouldBeActive = this.db.getFromCache("screen").value as boolean;
                const shouldBeActive = this.enableBackground;

                this.cscreen.setVisible(shouldBeActive);

                if (shouldBeActive) {
                    // If active, set place ready
                    this.cscreen.position = this.getPos(evt.target as Element)
                    this.cscreen.resetPos()
                }
            }
        })
    }

    /**
     * Creates a layout item
     *
     * @param   {string}   name   The name for the prefabstyle
     * @param   {Setting}  value  The initial value for the style
     *
     * @throws If no prefabstyle could be found
     */
    private createLayoutItems() {
        for (let styleName in this.styleElements) {
            let style = document.createElement("style") as HTMLStyleElement
            style.setAttribute("data", styleName);
            style.innerText = this.prefabStyle[styleName];
            document.head.appendChild(style);
            this.styleElements[styleName] = style;
        }
    }

    /**
     * @deprecated
     *
     * @param   {string}   name   Name of setting to be handled
     * @param   {Setting}  value  New Value
     */
    private changeLayoutItem(name: string, value: Setting): void {
        Log.warn("Deprecated changeLayoutItem has been called");
        // Log.info(`changeLayoutItem called with arguments: name: ${name} and value: ${value}`)
        // this.settings[name].value = value;
    
        // switch (name) {
        //     case "dyslexic":
        //         if (!this.toBool(value.value)) {
        //             for (var item in this.styleElements) { // turn everything off
        //                 this.styleElements[item].disabled = true;
        //             }
        //             this.enableBackground = false;
        //         } else {
        //             for (var item in this.styleElements) { // turn everything while looking at the other settings
        //                 if (!this.settings["screen"].value && this.styleElements[item].getAttribute("data") == "color") {
        //                     this.styleElements[item].disabled = true;
        //                     continue;
        //                 }
        //                 if (!this.settings["font"].value && this.styleElements[item].getAttribute("data") == "font") {
        //                     this.styleElements[item].disabled = true;
        //                     continue;
        //                 }
        //                 if (!this.settings["markup"].value && this.styleElements[item].getAttribute("data") == "markup") {
        //                     this.styleElements[item].disabled = true;
        //                     continue;
        //                 }
        //                 this.styleElements[item].disabled = false;
        //             }
        //             if (this.settings["screen"].value)
        //                 this.enableBackground = true;
        //             else
        //                 this.enableBackground = false;
        //         }
        //         break;
        //     case "font":
        //         for (var item in this.styleElements) {
        //             if (this.styleElements[item].getAttribute("data") == "font") {
        //                 var entry = document.createTextNode(this.prefabStyle.font);
        //                 if (this.styleElements[item].childNodes[0])
        //                     this.styleElements[item].removeChild(this.styleElements[item].childNodes[0]);
        //                 this.styleElements[item].appendChild(entry);
    
        //                 // check if dyslexic is enabled
        //                 if (!this.settings["dyslexic"].value) {
        //                     this.styleElements[item].disabled = true;
        //                     break;
        //                 }
        //                 // otherwise
        //                 if (this.toBool(value.value) == false) {
        //                     this.styleElements[item].disabled = true;
        //                 } else {
        //                     this.styleElements[item].disabled = false;
        //                 }
        //                 break;
        //             }
        //         }
        //         break;
        //     case "markup":
        //         for (var item in this.styleElements) {
        //             if (this.styleElements[item].getAttribute("data") == "markup") {
        //                 var entry = document.createTextNode(this.prefabStyle["markup"]);
        //                 if (this.styleElements[item].childNodes[0])
        //                     this.styleElements[item].removeChild(this.styleElements[item].childNodes[0]);
        //                 this.styleElements[item].appendChild(entry);
    
        //                 // check if dyslexic is enabled
        //                 if (!this.settings["dyslexic"].value) {
        //                     this.styleElements[item].disabled = true;
        //                     break;
        //                 }
        //                 // otherwise
        //                 if (this.toBool(value.value) == false) {
        //                     this.styleElements[item].disabled = true;
        //                 } else {
        //                     this.styleElements[item].disabled = false;
        //                 }
        //                 break;
        //             }
        //         }
        //         break;
        //     case "screen":
        //         if (!this.toBool(value.value)) {
        //             for (var item in this.styleElements) {
        //                 if (this.styleElements[item].getAttribute("data") == "color") {
        //                     this.styleElements[item].disabled = true;
        //                     break;
        //                 }
        //             }
        //             this.enableBackground = false;
        //         } else {
        //             for (var item in this.styleElements) {
        //                 if (this.settings["dyslexic"].value && this.styleElements[item].getAttribute("data") == "color") {
        //                     this.styleElements[item].disabled = false;
        //                     this.enableBackground = true;
        //                     break;
        //                 }
        //             }
        //         }
        //         break;
        //     case "color":
        //         for (var item in this.styleElements) {
        //             if (this.styleElements[item].getAttribute("data") == "color") {
        //                 var entry = document.createTextNode(this.prefabStyle["color"]
        //                     .format([Color.fromObject(value.value as BasicColor).colorHex]));
        //                 if (this.styleElements[item].childNodes[0])
        //                     this.styleElements[item].removeChild(this.styleElements[item].childNodes[0]);
        //                 this.styleElements[item].appendChild(entry);
        //                 if (!this.settings["screen"].value || !this.settings["dyslexic"].value)
        //                     this.styleElements[item].disabled = true;
        //                 break;
        //             }
        //         }
        //         break;
        //     case "opacity":
        //         for (var item in this.styleElements) {
        //             if (this.styleElements[item].getAttribute("data") == "opacity") {
        //                 var entry = document.createTextNode(this.prefabStyle["opacity"].format([value.value]));
        //                 if (this.styleElements[item].childNodes[0])
        //                     this.styleElements[item].removeChild(this.styleElements[item].childNodes[0]);
        //                 this.styleElements[item].appendChild(entry);
        //                 if (!this.settings["screen"].value || !this.settings["dyslexic"].value)
        //                     this.styleElements[item].disabled = true;
        //                 break;
        //             }
        //         }
        //         break;
        // }
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
