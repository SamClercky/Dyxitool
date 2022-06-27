/// <reference path="../common/Color.ts" />
/// <reference path="../common/CommunicationInterface.ts" />
/// <reference path="../common/iStorage.ts" />
/// <reference path="../common/logging.ts" />
/// <reference path="../common/onload.ts" />

/// <reference path="./cscreen.ts" />
/// <reference path="./insertCssFont.ts" />
/// <reference path="./settingsState.ts" />

interface Styles {
    font: string,
    color: string,
    opacity: string,
    markup: string,
}

interface StyleElements {
    font: HTMLStyleElement,
    color: HTMLStyleElement,
    opacity: HTMLStyleElement,
    markup: HTMLStyleElement,
}

interface Element {
    onmouseover: { (evt: MouseEvent): void },
    offsetLeft: number,
    offsetTop: number,
    offsetWidth: number,
    offsetHeight: number,
    offsetParent: Element,
}
interface String {
    format: any
}

// code from: https://www.codeproject.com/Tips/201899/String-Format-in-JavaScript
String.prototype.format = function (args: any[]) {
    var str = this;
    return str.replace(String.prototype.format.regex, function (item: String) {
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
    readonly db = new Db()
    readonly cscreen = new CScreen()
    readonly prefabStyle: Styles = AppScreen.constructPrefabFont(this.cscreen);
    readonly settingsStateNotifier: SettingsStateNotifier = new SettingsStateNotifier(this.db);

    private styleElements: StyleElements = {
        font: document.createElement("style"),
        markup: document.createElement("style"),
        opacity: document.createElement("style"),
        color: document.createElement("style"),
    }
    enableBackground = false

    constructor() {
        // binding section
        this.init = this.init.bind(this);
        this.setLayoutFromSettings = this.setLayoutFromSettings.bind(this);

        this.preInit();

        // start on ready
        this.init();
    }

    /**
     * A utility function to facilitate creating css-selectors
     * @param Reference to cscreen
     * @returns The needed styles with selectors
     */
    private static constructPrefabFont(cscreen: CScreen): Styles {
        const concatSelectors = (prev: string, curr: string) => `${prev}, ${curr}`;

        const fontSelectorExceptions = [
            ".fa", ".fas", ".far", ".fal", ".fad", ".fab",
            ".glyphicon", "[aria-hidden=true]"
        ]
            .map(curr => `:not(${curr})`)
            .reduce((prev, curr) => prev + curr);

        const fontSelectorNormal = [
            "html", "body",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "p", "span",
            "div",
            "a",
        ].map(item => (item === "") ? item : item + fontSelectorExceptions)
            .reduce(concatSelectors);

        const fontSelectorMono = [
            "code",
            "pre",
        ].reduce(concatSelectors);

        const markupSelector = [
            "p", "span", "code",
            "div",
        ].reduce(concatSelectors);

        return {
            "font": fontSelectorNormal + ' {font-family: "OpenDyslexic" !important; } ' + fontSelectorMono + '{font-family: OpenDyslexicMono !important;}',
            "color": "#" + cscreen.id + ' {background: {0} !important;}',
            "opacity": "#" + cscreen.id + ' {opacity: {0} !important;}',
            "markup": markupSelector + " { text-align: justify !important;text-justify: inter-word !important;background: white !important;color: #333 !important;line-height: 1.5 !important;font-size: 1em !important;}"
        }
    }

    /**
     * Async loading certain resources and styles ==> better performance
     * Should be run before init()
     * 
     * This function first needs to wait till DOM has been loaded
     */
    private async preInit() {
        await OnLoad.waitTill(OnEvent.DOMContentLoaded);

        const font = insertCssFont() // add support for OpenDyslexic
        const layout = this.createLayoutItems();

        await Promise.all([font, layout]);
        if (!this.db.isReady) {
            // If the main program hasn't run yet, provide basic settings
            this.setDyslexicFalse();
        }
    }
    /**
     * Defered constructor and entry of app
     * 
     * Waits till DOM and db are initialized
     */
    private async init() {
        const waitDb = this.db.onReadyAsync();
        const waitDOM = OnLoad.waitTill(OnEvent.DOMContentLoaded);
        await Promise.all([waitDb, waitDOM]); // waiting ...

        // start of program
        Log.info("Db started, init layout")

        // this.client.onResponse().then(settings => this.onNewData(settings))
        this.settingsStateNotifier.onSettingsState(this.setLayoutFromSettings)

        // update layout
        const background = this.initBackground();
        const settings = this.setLayoutFromSettings(this.db.getAllFromCache());

        await Promise.all([background, settings]);
    }

    private async setLayoutFromSettings(settings: Settings) {
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
     * Controls everything concerning the mechanics of the overlay
     */
    private async initBackground() {
        OnLoad.addEventListener(OnEvent.DOMContentLoaded, (() => {
            const elementen = document.querySelectorAll(
                [
                    "p", "span", "code",
                    "li",
                    "dd", "dt", "dl", "th", "td",
                    "h1", "h2", "h3", "h4", "h5", "h6"
                ].reduce((prev, curr) => `${prev}, ${curr}`)
            )
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
        }).bind(this))
    }

    /**
     * Creates the layout items
     *
     * @throws If no prefabstyle could be found
     */
    private async createLayoutItems() {
        for (let styleName in this.styleElements) {
            const style = document.createElement("style") as HTMLStyleElement
            style.setAttribute("data", styleName);
            style.innerText = this.prefabStyle[styleName as keyof Styles];
            document.head.appendChild(style);
            this.styleElements[styleName as keyof StyleElements] = style;
        }
    }

    private getPos(elem: Element): Rect {
        const body = document.body

        const pos: Rect = {
            X: elem.offsetLeft,
            Y: elem.offsetTop,
            Width: elem.offsetWidth,
            Height: elem.offsetHeight
        }

        while (elem.offsetParent) {
            const parent = elem.offsetParent
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
}

const app = new AppScreen() // start application
