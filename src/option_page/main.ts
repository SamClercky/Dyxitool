class AppPopup {
    readonly wrapper = document.getElementById("wrapper") as HTMLDivElement
    readonly db = new Db()
    _settings: Settings = this.db._settings
    _elementData: Element[] = []
    _counter = 0

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
            getBrowser().tabs.create({url: $(this).attr('href')})
            return true
        })
    }

    private createMenu() {
        for (let i in this.db._settings) {
            if (i.startsWith("_")) continue

            this._counter++
            this.db.get(i)
                .then(obj => {
                    this._settings[obj.name] = obj.value
                    this._counter--
                    this._elementData.push(
                        this.addElement(obj.value, obj.name)
                    )
                })
        }
        this.canStartToggle()
    }

    private canStartToggle() {
        if (this._counter == 0) {
            for (let element in this._elementData) {
                this.toggleData(
                    (this._elementData[element].childNodes[1].childNodes[0] as Element).getAttribute("data"),
                    this._settings[(this._elementData[element].childNodes[1].childNodes[0] as Element).getAttribute("data")].value
                )
            }
        } else {
            setTimeout(this.canStartToggle, 250)
        }
    }

    private addElement(setting: Setting, id: string): HTMLTableRowElement {
        let result = document.createElement("tr") as HTMLTableRowElement
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
        result.appendChild(tdName)
        result.appendChild(tdData)

        this.wrapper.appendChild(result)

        return result
    }

    private onChangeSet(evt: Event) {
        const target = evt.target as HTMLInputElement
        /*let value: SettingValue = ((target.type == Type.checkbox)? target.checked : target.value) as SettingValue
        value = ((target.type == Type.range)? (Color.fromObject(
                this._settings["color"].value as BasicColor
            ).colorAlpha / 100).toString() : value) as SettingValue
        value = (target.type == Type.color)? Color.fromHex(target.value): value*/

        let value: SettingValue;
        switch(target.type) {
            case Type.checkbox:
                value = target.checked
                break
            case Type.color:
                value = Color.fromHex(target.value)
                value.colorAlpha = this._settings["opacity"].value as number
                break
            case Type.range:
                value = parseFloat(target.value) / 100
                // may cause bug if Color is not updated
        }
        // save changes
        this._settings[target.getAttribute("data")].value = value

        this.toggleData(
            target.getAttribute("data"),
            value as SettingValue
        )

        this.db.update(target.getAttribute("data"), value as SettingValue)

        let s = new Server()
        s.send(
            {
                name: target.getAttribute("data"),
                value: {
                    value: value as SettingValue,
                    type: target.type,
                    label: "",
                    help: "",
                    spacer: 0
                } as Setting
            }
        )
    }

    private toggleData(name: string, value: SettingValue){
        if (name == "dyslexic") {
            if (value == false) {
                for (var i in this._elementData) {
                    if ((this._elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "dyslexic") continue;
                    $(this._elementData[i]).slideUp({duration: 100});
                }
            } else {
                for (var i in this._elementData) {
                    if ((this._elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "dyslexic") continue;
                    if (
                        !this.normalizeInput(this._settings["screen"].value) && 
                        (
                            (this._elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "color" ||
                            (this._elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "opacity"
                        )
                    ) continue;
                    $(this._elementData[i]).slideDown({duration: 100});
                }
            }
        }
        if (name == "screen") {
            if (value == false) {
                for (var i in this._elementData) {
                    if ((this._elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "color" ||
                        (this._elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "opacity")
                        $(this._elementData[i]).slideUp({duration: 100});
                }
            } else {
                for (var i in this._elementData) {
                    if ((this._elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "color" ||
                        (this._elementData[i].childNodes[1].childNodes[0] as Element).getAttribute("data") == "opacity")
                        $(this._elementData[i]).slideDown({duration: 100});
                }
            }
        }
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