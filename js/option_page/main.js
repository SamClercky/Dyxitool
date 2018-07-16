class AppPopup {
    constructor() {
        this.wrapper = document.getElementById("wrapper");
        this.db = new Db();
        this._settings = this.db._settings;
        this._elementData = [];
        this._counter = 0;
        this.canStartToggle = this.canStartToggle.bind(this);
        this.init = this.init.bind(this);
        this.onChangeSet = this.onChangeSet.bind(this);
        this.db.onReady(this.init);
    }
    init() {
        Log.info("Db started, Init menu");
        this.createMenu();
        $('a').on('click', () => {
            browser.tabs.create({ url: $(this).attr('href') });
            return true;
        });
    }
    createMenu() {
        for (let i in this.db._settings) {
            if (i.startsWith("_"))
                continue;
            this._counter++;
            this.db.get(i)
                .then(obj => {
                this._settings[obj.name] = obj.value;
                this._counter--;
                this._elementData.push(this.addElement(obj.value, obj.name));
            });
        }
        this.canStartToggle();
    }
    canStartToggle() {
        if (this._counter == 0) {
            for (let element in this._elementData) {
                this.toggleData(this._elementData[element].childNodes[1].childNodes[0].getAttribute("data"), this._settings[this._elementData[element].childNodes[1].childNodes[0].getAttribute("data")].value);
            }
        }
        else {
            setTimeout(this.canStartToggle, 250);
        }
    }
    addElement(setting, id) {
        let result = document.createElement("tr");
        let tdName = document.createElement("td");
        let tdData = document.createElement("td");
        let dataInput = document.createElement("input");
        tdName.className = "text";
        tdName.setAttribute("title", setting.help);
        for (let i = 0; i < setting.spacer; i++) {
            let divSpacer = document.createTextNode("\u00A0\u00A0");
            tdName.appendChild(divSpacer);
        }
        tdName.appendChild(document.createTextNode(setting.label));
        tdData.className = "input";
        dataInput.type = setting.type;
        if (setting.type == Type.range) {
            dataInput.setAttribute("max", "100");
            dataInput.setAttribute("min", "0");
            dataInput.value = (this.normalizeInput(setting.value) * 100).toString();
        }
        else if (setting.type == Type.checkbox) {
            dataInput.checked = this.normalizeInput(setting.value);
        }
        else if (setting.type == Type.color) {
            dataInput.value = Color.fromObject(setting.value).colorHex;
        }
        dataInput.setAttribute("data", id);
        dataInput.onchange = this.onChangeSet;
        tdData.appendChild(dataInput);
        result.appendChild(tdName);
        result.appendChild(tdData);
        this.wrapper.appendChild(result);
        return result;
    }
    onChangeSet(evt) {
        const target = evt.target;
        let value;
        switch (target.type) {
            case Type.checkbox:
                value = target.checked;
                break;
            case Type.color:
                value = Color.fromHex(target.value);
                value.colorAlpha = this._settings["opacity"].value;
                break;
            case Type.range:
                value = parseFloat(target.value) / 100;
        }
        this._settings[target.getAttribute("data")].value = value;
        this.toggleData(target.getAttribute("data"), value);
        this.db.update(target.getAttribute("data"), value);
        let s = new Server();
        s.send({
            name: target.getAttribute("data"),
            value: {
                value: value,
                type: target.type,
                label: "",
                help: "",
                spacer: 0
            }
        });
    }
    toggleData(name, value) {
        if (name == "dyslexic") {
            if (value == false) {
                for (var i in this._elementData) {
                    if (this._elementData[i].childNodes[1].childNodes[0].getAttribute("data") == "dyslexic")
                        continue;
                    $(this._elementData[i]).slideUp({ duration: 100 });
                }
            }
            else {
                for (var i in this._elementData) {
                    if (this._elementData[i].childNodes[1].childNodes[0].getAttribute("data") == "dyslexic")
                        continue;
                    if (!this.normalizeInput(this._settings["screen"].value) &&
                        (this._elementData[i].childNodes[1].childNodes[0].getAttribute("data") == "color" ||
                            this._elementData[i].childNodes[1].childNodes[0].getAttribute("data") == "opacity"))
                        continue;
                    $(this._elementData[i]).slideDown({ duration: 100 });
                }
            }
        }
        if (name == "screen") {
            if (value == false) {
                for (var i in this._elementData) {
                    if (this._elementData[i].childNodes[1].childNodes[0].getAttribute("data") == "color" ||
                        this._elementData[i].childNodes[1].childNodes[0].getAttribute("data") == "opacity")
                        $(this._elementData[i]).slideUp({ duration: 100 });
                }
            }
            else {
                for (var i in this._elementData) {
                    if (this._elementData[i].childNodes[1].childNodes[0].getAttribute("data") == "color" ||
                        this._elementData[i].childNodes[1].childNodes[0].getAttribute("data") == "opacity")
                        $(this._elementData[i]).slideDown({ duration: 100 });
                }
            }
        }
    }
    normalizeInput(raw) {
        if (this.isNumeric(raw)) {
            return parseFloat(raw);
        }
        else if (this.isBool(raw)) {
            return String(raw) == "true";
        }
        else {
            return raw;
        }
    }
    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    isBool(b) {
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
const appP = new AppPopup();
//# sourceMappingURL=main.js.map