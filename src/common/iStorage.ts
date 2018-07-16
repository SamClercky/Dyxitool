class Db {
    _settings: Settings = {
        dyslexic: { // all settings on or off
            value: true,
            type: Type.checkbox,
            label: "Activate dyslexic extension",
            help: "",
            spacer: 0
        },
        font: { // font on of off
            value: true,
            type: Type.checkbox,
            label: "Activate OpenDyslexic",
            help: "",
            spacer: 1
        },
        markup: { // special markup on or off
            value: true,
            type: Type.checkbox,
            label: "Force easy reading mark-up",
            help: "",
            spacer: 1
        },
        screen: { // screen functionality on or off
            value: true,
            type: Type.checkbox,
            label: "Activate overlay",
            help: "",
            spacer: 1
        },
        color: { // the color of the screen
            value: Color.fromHex("#00ecff"),
            type: Type.color,
            label: "Choose overlaycolor",
            help: "",
            spacer: 2
        },
        opacity: { // the opacity of the screen
            value: 0.8,
            type: Type.range,
            label: "Opacity",
            help: "",
            spacer: 2
        },
        _firstRunPassed: { // look if the db has been initialized
            value: false,
            type: Type.checkbox,
            label: "",
            help: "",
            spacer: 0
        }
    };

    private onReadyCb: {(): void}[] = []

    private _dataName = "settings";
    private _ready = false;

    /**
     * Packs the setting in a easy to use format
     * @param name The key needed to get the setting
     * @returns false if not founded and {name: Setting} if found
     */
    private getSettingByName(name: string, data: Setting): any | boolean {
        if (!this.dataExists(name)) return false;
        let result = {};
        result[name] = this._settings[name];
        return result;
    }

    private dataExists(name: string): boolean {
        for (let key of Object.keys(this._settings)) {
            if (key == name) return true;
        }
        return false;
    }

    constructor() {
        // check for the first run
        // cache this
        //let $this = this;
        this.get("_firstRunPassed")
            .then(data => {
                if (data.value != undefined) {
                    this._ready = true;
                    // tell everyone the db is ready
                    if (this.onReadyCb != null) {
                        this.fireReady()
                    }
                    return;
                }

                for (let i in this._settings) {
                    this.insert(this.getSettingByName(i, this._settings[i]));
                }
                this._ready = true;

                // tell everyone the db is ready
                if (this.onReadyCb != null) {
                    this.fireReady()
                }
                this.update("_firstRunPassed", true);
            })
    }

    // DB operations
    /**
     * Get a field from the db
     * @param name The name of the field to retrieve !CAUTION! name != "" or it will return Settings
     */
    get(name: string): Promise<PackedSetting> {
        return new Promise<PackedSetting>((res, rej) => {
            browser.storage.local.get(name)
                .then(obj => {
                    if (name == undefined || name == "") {
                        res(obj)
                    } else {
                        res(this.stripData(obj))
                    }
                })
                .catch(err => {
                    Log.error(err)
                    rej(err)
                })
        })

        //return browser.storage.local.get(name);
    }

    stripData(setting: object): PackedSetting {      
        let name = Object.keys(setting)[0]
        let value = setting[name] as Setting

        return {
            name: name,
            value: value
        }
    } 

    /**
     * Add a new data element to the db.
     * !IMPORTANT! this api does can override existing sources
     * @param data The data to add
     */
    private insert(data: Setting): Promise<void> {
        return browser.storage.local.set(data);
    }

    /**
     * Updates a new element
     * @param name The name of the value to change
     * @param value The new value
     */
    update(name: string, value: SettingValue): Promise<any> {
        return new Promise<any>((res: {(): void}, rej: {(string): void}) => {
            // check if the value exists
            if (!this.dataExists(name)) {
                rej("Value did not exist");
                return;
            }

            this._settings[name].value = value;

            this.insert(this.getSettingByName(name, this._settings[name]));
            res();
        })
    }

    onChange(cb: {(changes: browser.storage.StorageChange, name: string, area: string): void}): void {
        browser.storage.onChanged.addListener((changes, area) => {
            const name = Object.keys(changes)[0];
            cb(changes[name], name, area)
        });
    }

    onReady(cb: {(): void}) {
        if (this._ready) cb() // return immediatly
        else this.onReadyCb.push(cb) // otherwise wait for being finished
    }

    private fireReady() {
        for(let cb of this.onReadyCb) {
            cb()
        }
    }

}