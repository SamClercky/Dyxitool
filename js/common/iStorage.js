class Db {
    constructor() {
        this._settings = {
            dyslexic: {
                value: true,
                type: Type.checkbox,
                label: "Activate dyslexic extension",
                help: "",
                spacer: 0
            },
            font: {
                value: true,
                type: Type.checkbox,
                label: "Activate OpenDyslexic",
                help: "",
                spacer: 1
            },
            markup: {
                value: true,
                type: Type.checkbox,
                label: "Force easy reading mark-up",
                help: "",
                spacer: 1
            },
            screen: {
                value: true,
                type: Type.checkbox,
                label: "Activate overlay",
                help: "",
                spacer: 1
            },
            color: {
                value: Color.fromHex("#00ecff"),
                type: Type.color,
                label: "Choose overlaycolor",
                help: "",
                spacer: 2
            },
            opacity: {
                value: 0.8,
                type: Type.range,
                label: "Opacity",
                help: "",
                spacer: 2
            },
            _firstRunPassed: {
                value: false,
                type: Type.checkbox,
                label: "",
                help: "",
                spacer: 0
            }
        };
        this.onReadyCb = [];
        this._dataName = "settings";
        this._ready = false;
        this.get("_firstRunPassed")
            .then(data => {
            if (data.value != undefined) {
                this._ready = true;
                if (this.onReadyCb != null) {
                    this.fireReady();
                }
                return;
            }
            for (let i in this._settings) {
                this.insert(this.getSettingByName(i, this._settings[i]));
            }
            this._ready = true;
            if (this.onReadyCb != null) {
                this.fireReady();
            }
            this.update("_firstRunPassed", true);
        });
    }
    getSettingByName(name, data) {
        if (!this.dataExists(name))
            return false;
        let result = {};
        result[name] = this._settings[name];
        return result;
    }
    dataExists(name) {
        for (let key of Object.keys(this._settings)) {
            if (key == name)
                return true;
        }
        return false;
    }
    get(name) {
        return new Promise((res, rej) => {
            browser.storage.local.get(name)
                .then(obj => {
                if (name == undefined || name == "") {
                    res(obj);
                }
                else {
                    res(this.stripData(obj));
                }
            })
                .catch(err => {
                Log.error(err);
                rej(err);
            });
        });
    }
    stripData(setting) {
        let name = Object.keys(setting)[0];
        let value = setting[name];
        return {
            name: name,
            value: value
        };
    }
    insert(data) {
        return browser.storage.local.set(data);
    }
    update(name, value) {
        return new Promise((res, rej) => {
            if (!this.dataExists(name)) {
                rej("Value did not exist");
                return;
            }
            this._settings[name].value = value;
            this.insert(this.getSettingByName(name, this._settings[name]));
            res();
        });
    }
    onChange(cb) {
        browser.storage.onChanged.addListener((changes, area) => {
            const name = Object.keys(changes)[0];
            cb(changes[name], name, area);
        });
    }
    onReady(cb) {
        if (this._ready)
            cb();
        else
            this.onReadyCb.push(cb);
    }
    fireReady() {
        for (let cb of this.onReadyCb) {
            cb();
        }
    }
}
//# sourceMappingURL=iStorage.js.map