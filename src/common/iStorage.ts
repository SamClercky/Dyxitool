class Db {
    static readonly initialSettings: Settings = {
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

    private localCache = Object.assign(Db.initialSettings);

    private onReadyCb: { (): void }[] = [];

    private _dataName = "settings";
    private ready = false;

    /**
     * Packs the setting in a easy to use format
     * @param name The key needed to get the setting
     * @returns false if not founded and {name: Setting} if found
     * @throws When name does not exist
     */
    private getSettingByName(name: string): any {
        if (!this.dataExists(name)) throw Error("Data does not exist");
        let result = {};
        result[name] = this.localCache[name];
        return result;
    }

    private dataExists(name: string): boolean {
        const result = Db.initialSettings[name];
        if (result == undefined) return false;
        else                     return true;
    }

    constructor() {
        // check for the first run
        // cache this
        //let $this = this;
        async function init () {
            const firstRunPassed = await this.get("_firstRunPassed");

            // if run for first time ==> initialize
            if (firstRunPassed || firstRunPassed.value != undefined) { // if it is not null
                // already initialized ==> start program

                this.ready = true
                // tell everyone the db is ready
                if (this.onReadyCb != null) {
                    this.fireReady()
                }
                return;                
            } else {
                // not yet initialized ==> create db in storage.local

                for (let i in Db.initialSettings) {
                    this.insert(this.getSettingByName(i));
                }

                // make shure that it does not get intialized twise
                this.update("_firstRunPassed", true);
                
                // tell everyone the db is ready and start program
                this.ready = true;
                if (this.onReadyCb != null) {
                    this.fireReady()
                }
            }
        };
        init()
    }

    // DB operations
    /**
     * Get a field from the db
     * @param name The name of the field to retrieve !CAUTION! name != "" or it will return Settings
     */
    async get(name: string): Promise<PackedSetting> {
        const result = await browser.storage.local.get(name)

        if (name == undefined || name == "") {
            return null;
        } else {
            return this.stripData(result);
        }

        //return browser.storage.local.get(name);
    }

    /**
     * Gets all the information that is stored in the database and caches it for later use
     *
     * @return  {Promise<Settings>}  The content of the storage or if nothing is stored, the localCache
     * @throws When no data could be retrieved
     */
    async getAll(): Promise<Settings> {
        const result = await browser.storage.local.get(null); // Gets all data at once
        if (result == undefined || result == "") {
            return this.localCache;
        } else {
            this.localCache = result;
            return result as Settings;
        }
    }

    /**
     * Loads data from local cache (fast)
     *
     * @param   {string}  name  The name of the property you would want
     *
     * @return  {Setting}        The requested setting
     * @throws When no data is found
     */
    getFromCache(name: string) {
        if (!this.dataExists(name)) throw Error("No data found for " + name);
        
        return this.localCache[name];
    }

    getAllFromCache() {
        return this.localCache;
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
     * !IMPORTANT! this api can override existing sources
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
    async update(name: string, value: SettingValue): Promise<void> {
        if (!this.dataExists(name)) {
            throw Error("Value did not exist");
        }

        this.localCache[name].value = value; // store in local cache
        this.insert(this.getSettingByName(name));
    }

    onChange(cb: { (changes: browser.storage.StorageChange, name: string, area: string): void }): void {
        browser.storage.onChanged.addListener((changes, area) => {
            const name = Object.keys(changes)[0];
            cb(changes[name], name, area)
        });
    }

    onReady(cb: { (): void }) {
        if (this.ready) cb() // return immediatly
        else this.onReadyCb.push(cb) // otherwise wait for being finished
    }

    private fireReady() {
        for (let cb of this.onReadyCb) {
            cb()
        }
    }

}