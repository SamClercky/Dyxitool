/// <reference path="./Server.ts" />
/// <reference path="../common/Color.ts" />
/// <reference path="../common/CommunicationInterface.ts" />
/// <reference path="../common/iStorage.ts" />
/// <reference path="../common/logging.ts" />

interface ElementDataValue {
    input: HTMLInputElement,
    wrapper: HTMLTableRowElement,
}
interface ElementData {
    dyslexic: ElementDataValue,
    font: ElementDataValue,
    markup: ElementDataValue,
    screen: ElementDataValue,
    opacity: ElementDataValue,
    color: ElementDataValue,
}

class AppPopup {
    readonly wrapper = document.getElementById("wrapper") as HTMLDivElement
    readonly db = new Db()
    private readonly durationObject = { duration: 100 };
    // _settings: Settings = Object.assign(Db.initialSettings)
    private elementData: ElementData = {
        dyslexic: null,
        font: null,
        markup: null,
        screen: null,
        opacity: null,
        color: null,
    }

    constructor() {
        // start binding
        this.canStartToggle = this.canStartToggle.bind(this)
        this.init = this.init.bind(this)
        this.onChangeSet = this.onChangeSet.bind(this)

        // start app
        this.db.onReady(this.init)
    }

    private init() {
        Log.info("Db started, Init menu")
        this.createMenu()
        $('a').on('click', () => {
            browser.tabs.create({ url: $(this).attr('href') })
            return true
        })
    }

    /**
     * Creates the menu
     */
    private createMenu(): void {
        // fill _elementData
        for (let elementName in this.elementData) {
            const setting = this.db.getFromCache(elementName);
            this.elementData[elementName] = this.addElement(setting, elementName);
        }
        this.canStartToggle();
    }

    /**
     * Set initial state for the settings
     */
    private canStartToggle(): void {
        this.toggleData(
            this.db.getAllFromCache()
        )
    }

    /**
     * Function that creates one row based on the setting given and returns the input element
     *
     * @param   {Setting}              setting  The setting needed for the creation
     * @param   {string}               id       The value of the data-attribute of the element
     *
     * @return  {ElementDataValue}              Reference to the created input element and the tr-wrapper
     */
    private addElement(setting: Setting, id: string): ElementDataValue {
        let settingWrapper = document.createElement("tr") as HTMLTableRowElement
        let tdName = document.createElement("td") as HTMLTableDataCellElement
        let tdData = document.createElement("td") as HTMLTableDataCellElement
        let dataInput = document.createElement("input") as HTMLInputElement

        // set name
        tdName.className = "text"
        tdName.setAttribute("title", setting.help)

        for (let i = 0; i < setting.spacer; i++) {
            let divSpacer = document.createTextNode("\u00A0\u00A0")
            tdName.appendChild(divSpacer)
        }
        tdName.appendChild(document.createTextNode(setting.label))

        // set input
        tdData.className = "input"
        dataInput.type = setting.type
        if (setting.type == Type.range) {
            dataInput.setAttribute("max", "100")
            dataInput.setAttribute("min", "0")

            dataInput.value = (this.normalizeInput(setting.value) * 100).toString()
        } else if (setting.type == Type.checkbox) {
            dataInput.checked = this.normalizeInput(setting.value)
        } else if (setting.type == Type.color) {
            dataInput.value = Color.fromObject(setting.value as BasicColor).colorHex
        }

        dataInput.setAttribute("data", id)
        dataInput.onchange = this.onChangeSet
        tdData.appendChild(dataInput)
        settingWrapper.appendChild(tdName)
        settingWrapper.appendChild(tdData)

        this.wrapper.appendChild(settingWrapper)

        return {
            input: dataInput,
            wrapper: settingWrapper
        };
    }

    private onChangeSet(evt: Event) {
        const target = evt.target as HTMLInputElement
        /*let value: SettingValue = ((target.type == Type.checkbox)? target.checked : target.value) as SettingValue
        value = ((target.type == Type.range)? (Color.fromObject(
                this._settings["color"].value as BasicColor
            ).colorAlpha / 100).toString() : value) as SettingValue
        value = (target.type == Type.color)? Color.fromHex(target.value): value*/

        let value: SettingValue;
        switch (target.type) {
            case Type.checkbox:
                value = target.checked
                break
            case Type.color:
                value = Color.fromHex(target.value)
                value.colorAlpha = this.db.getAllFromCache().opacity.value as number
                break
            case Type.range:
                value = parseFloat(target.value) / 100
            // may cause bug if Color is not updated
        }
        // save changes
        // this.db.getAllFromCache()[target.getAttribute("data")].value = value
        this.db.update(target.getAttribute("data"), value as SettingValue)

        this.toggleData(
            this.db.getAllFromCache()
        )

        // @Deprecated functionality ==> know via iStorage and onChange
        // let s = new Server()
        // s.send(
        //     {
        //         name: target.getAttribute("data"),
        //         value: value as SettingValue,
        //     }
        // )
    }

    private toggleData(settings: Settings) {
        if (!settings.dyslexic.value) {
            this.toggleDyslexicFalse();
        } else {
            this.toggleNonScreen(true);
            this.toggleScreen(settings.screen.value as boolean);
        }
    }

    private toggleDyslexicFalse() {
        // hide/show screen section
        this.toggleScreen(false);
        this.toggleNonScreen(false);
    }

    private toggleNonScreen(option: boolean) {
        const font = $(this.elementData.font.wrapper);
        const markup = $(this.elementData.markup.wrapper);
        const screen = $(this.elementData.screen.wrapper);

        if (option) {
            font.slideDown(this.durationObject);
            markup.slideDown(this.durationObject);
            screen.slideDown(this.durationObject);
        } else {
            font.slideUp(this.durationObject);
            markup.slideUp(this.durationObject);
            screen.slideUp(this.durationObject);
        }
    }

    private toggleScreen(option: boolean) {
        const color = $(this.elementData.color.wrapper);
        const opacity = $(this.elementData.opacity.wrapper);

        if (option) {
            color.slideDown(this.durationObject);
            opacity.slideDown(this.durationObject);
        } else {
            color.slideUp(this.durationObject);
            opacity.slideUp(this.durationObject);
        }
    }

    /**
     * @deprecated
     */
    private toggleData2(name: string, value: SettingValue) {
        // if (name == "dyslexic") {
        //     if (value == false) {
        //         for (let elementName in this.elementData) {
        //             if (elementName == "dyslexic") continue;
        //             $(this.elementData[elementName]).slideUp({ duration: 100 });
        //         }
        //     } else {
        //         for (let elementName in this.elementData) {
        //             if (elementName == "dyslexic") continue;
        //             if (
        //                 !this.normalizeInput(this.db.getAllFromCache().screen.value) &&
        //                 (
        //                     (this.elementData[elementName].childNodes[1].childNodes[0] as Element).getAttribute("data") == "color" ||
        //                     (this.elementData[elementName].childNodes[1].childNodes[0] as Element).getAttribute("data") == "opacity"
        //                 )
        //             ) continue;
        //             $(this.elementData[elementName]).slideDown({ duration: 100 });
        //         }
        //     }
        // }
        // if (name == "screen") {
        //     if (value == false) {
        //         for (var i in this.elementData) {
        //             if ((this.elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "color" ||
        //                 (this.elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "opacity")
        //                 $(this.elementData[i]).slideUp({ duration: 100 });
        //         }
        //     } else {
        //         for (var i in this.elementData) {
        //             if ((this.elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "color" ||
        //                 (this.elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "opacity")
        //                 $(this.elementData[i]).slideDown({ duration: 100 });
        //         }
        //     }
        // }
    }

    private normalizeInput(raw: any): any {
        if (this.isNumeric(raw)) {
            return parseFloat(raw);
        } else if (this.isBool(raw)) {
            return String(raw) == "true";
        } else {
            return raw;
        }
    }
    private isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    private isBool(b) {
        switch (b) {
            case "true":
                return true;
            case "false":
                return true;
            default:
                return false;
        }
    }
}

const appP = new AppPopup()

// for debugging only
//appP.db.onChange((e) => {
//    Log.debugRaw(e)
//})