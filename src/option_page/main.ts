/// <reference path="../common/Color.ts" />
/// <reference path="../common/CommunicationInterface.ts" />
/// <reference path="../common/iStorage.ts" />
/// <reference path="../common/logging.ts" />

interface ElementDataValue {
    input: HTMLInputElement,
    wrapper: HTMLDivElement,
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
        // this.initResetBtn()
    }

    /**
     * Init for reset button on option_page
     */
    private initResetBtn(): void {
        const resetBtn = $("#resetBtn")[0];
        // @ts-ignore
        resetBtn.disabled = false;

        resetBtn.addEventListener("click", (async (evt: Event) => {
            evt.preventDefault();

            // reset data
            await this.db.reset();

            // rebuild settings
            this.canStartToggle();

            // set checkboxes
            for (let elementName in this.elementData) {
                this.setInputValues(this.db.getFromCache(elementName as keyof ElementData), this.elementData[elementName as keyof ElementData].input);
            }

        }).bind(this));
    }

    /**
     * Creates the menu
     */
    private createMenu(): void {
        // fill _elementData
        for (let elementName in this.elementData) {
            const setting = this.db.getFromCache(elementName as keyof ElementData);
            this.elementData[elementName as keyof ElementData] = this.addElement(setting, elementName);
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
     * Sets input values according to the setting and type
     *
     * @param   {Setting}           setting  The setting with the corresponding data
     * @param   {HTMLInputElement}  element  The html element that should be set
     */
    private setInputValues(setting: Setting, element: HTMLInputElement): void {
        if (setting.type == Type.range) {
            element.value = (this.normalizeInput(setting.value) * 100).toString()
        } else if (setting.type == Type.checkbox) {
            element.checked = this.normalizeInput(setting.value)
        } else if (setting.type == Type.color) {
            element.value = "#" + (setting.value as BasicColor)._hex;
        }
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
        let settingWrapper = document.createElement("div") as HTMLDivElement
        let label = document.createElement("label") as HTMLLabelElement
        let dataInput = document.createElement("input") as HTMLInputElement

        // set label properties
        label.className = "text"
        label.setAttribute("title", setting.help)

        label.appendChild(document.createTextNode(setting.label))
        label.setAttribute("for", id)

        // Add elements to screen
        // This section needs to come before the set inputs-section
        dataInput.setAttribute("data", id)
        dataInput.id = id

        // Set settingswrapper
        settingWrapper.setAttribute("data-spacer", setting.spacer.toString())

        settingWrapper.append(dataInput)
        settingWrapper.appendChild(label)
        settingWrapper.classList.add("input-wrapper");

        this.wrapper.appendChild(settingWrapper)

        // set inputs
        // tdData.className = "input"
        dataInput.type = setting.type
        if (setting.type == Type.range) {
            dataInput.onchange = this.onChangeSet // onChange is type specific
            dataInput.setAttribute("max", "100")
            dataInput.setAttribute("min", "0")

            this.setInputValues(setting, dataInput);

            // range specific logic
            settingWrapper.classList.add("no-checkbox-wrapper");
        } else if (setting.type == Type.checkbox) {
            dataInput.onchange = this.onChangeSet // onChange is type specific
            this.setInputValues(setting, dataInput);
        } else if (setting.type == Type.color) {
            // dataInput.value = Color.fromObject(setting.value as BasicColor).colorHex
            // Make shure this does not hide unintentionally
            // @ts-ignore
            $(dataInput).spectrum({
                color: (setting.value as BasicColor)._hex,
                change: ((color: any) => {
                    // Pack the plain color as a OnChangeEvent
                    // TODO: Find a more elegant way of doing this
                    this.onChangeSet({
                        target: {
                            // @ts-ignore
                            type: Type.color,
                            value: `#${color.toHex()}`,
                            getAttribute: (attrName: any) => {
                                if (attrName !== "data") throw Error("Not supported")

                                return id
                            }
                        }
                    })
                })
            });

            // TODO: find better implementation to prevent default color-picker
            dataInput.type = "text";

            // color specific logic
            settingWrapper.classList.add("no-checkbox-wrapper");

            // settingWrapper.addEventListener("click", () => {
            //     const colorInput = document.querySelector("div.sp-replacer") as HTMLDivElement
            //     colorInput.click()
            // })

        }

        return {
            input: dataInput,
            wrapper: settingWrapper
        };
    }

    private onChangeSet(evt: Event) {
        const target = evt.target as HTMLInputElement

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
        this.db.update(target.getAttribute("data") as keyof Settings, value as SettingValue)

        this.toggleData(
            this.db.getAllFromCache()
        )
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
        this.toggleSettingItem("font", option);
        this.toggleSettingItem("markup", option);
        this.toggleSettingItem("screen", option);
    }

    private toggleScreen(option: boolean) {
        this.toggleSettingItem("color", option);
        this.toggleSettingItem("opacity", option);
    }

    /**
     * Set visibility for given item based on given option
     * @param element The element that should be changed
     * @param option true to make visible
     */
    private toggleSettingItem(element: keyof ElementData, option: boolean) {
        const hiddenClass = "hidden";

        const wrapper = this.elementData[element].wrapper;
        const isHidden = wrapper.classList.contains(hiddenClass);
        if (isHidden && option) { // make visible
            wrapper.classList.remove(hiddenClass);
        } else if (!isHidden && !option) { // hide
            wrapper.classList.add(hiddenClass);
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
    private isNumeric(n: any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    private isBool(b: any) {
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