class Db {
    static readonly initialSettings: Settings = {
        dyslexic: { // all settings on or off
            value: true,
            type: Type.checkbox,
            label: browser.i18n.getMessage("dyslexicSettionLabel"),
            help: "",
            spacer: 0
        },
        font: { // font on of off
            value: true,
            type: Type.checkbox,
            label: browser.i18n.getMessage("fontSettionLabel"),
            help: "",
            spacer: 1
        },
        markup: { // special markup on or off
            value: false,
            type: Type.checkbox,
            label: browser.i18n.getMessage("markupSettionLabel"),
            help: "",
            spacer: 1
        },
        screen: { // screen functionality on or off
            value: true,
            type: Type.checkbox,
            label: browser.i18n.getMessage("screenSettionLabel"),
            help: "",
            spacer: 1
        },
        color: { // the color of the screen
            value: Color.fromHex("#3cab3b"),
            type: Type.color,
            label: browser.i18n.getMessage("colorSettingLabel"),
            help: "",
            spacer: 2
        },
        opacity: { // the opacity of the screen
            value: 0.8,
            type: Type.range,
            label: browser.i18n.getMessage("opacitySettingLabel"),
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

    private localCache: Settings = { ...Db.initialSettings };

    private onReadyCb: { (): void }[] = [];

    public get isReady(): boolean {
        return this.localCache._firstRunPassed.value as boolean;
    }


    /**
     * Packs the setting in a easy to use format
     * @param name The key needed to get the setting
     * @returns false if not founded and {name: Setting} if found
     * @throws When name does not exist
     */
    private getSettingByName(name: keyof Settings): any {
        if (!this.dataExists(name)) throw Error("Data does not exist");
        let result: Partial<Settings> = {};
        result[name] = this.localCache[name];
        return result;
    }

    private dataExists(name: keyof Settings): boolean {
        const result = Db.initialSettings[name];
        if (result == undefined) return false;
        else return true;
    }

    constructor() {
        // check for the first run
        // cache this
        //let $this = this;
        let init = async () => {
            const firstRunPassed = (await this.getAll())._firstRunPassed;

            // if run for first time ==> initialize
            if (firstRunPassed != undefined && firstRunPassed.value == true) { // if it is not null
                // already initialized ==> start program

                // update cache
                this.localCache._firstRunPassed.value = true;

                // tell everyone the db is ready
                if (this.onReadyCb != null) {
                    this.fireReady()
                }
                return;
            } else {
                // not yet initialized ==> create db in storage.local
                await this.initData();

                // tell everyone the db is ready and start program
                if (this.onReadyCb != null) {
                    this.fireReady()
                }
            }
        };
        init = init.bind(this);
        init()
    }

    private async initData(): Promise<void> {

        for (let i in Db.initialSettings) {
            await this.insert(this.getSettingByName(i as keyof Settings));
        }

        // make shure that it does not get intialized twise
        this.update("_firstRunPassed", true);
    }

    async cleanData() {
        this.localCache = { ...Db.initialSettings };
        return await browser.storage.local.clear();
    }

    async reset() {
        await this.cleanData();
        await this.initData();
    }

    // DB operations
    /**
     * Get a field from the db
     * @param name The name of the field to retrieve !CAUTION! name != "" or it will return Settings
     */
    async get(name: string): Promise<PackedSetting> {
        const result = await browser.storage.local.get(name)

        Log.info("GetMessage with name: " + name);
        Log.info(result);

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
        const result: Settings | null = await browser.storage.local.get(null) as Settings | null; // Gets all data at once

        Log.info("getAll result:");
        Log.info(result);

        // Protect localCache from undefined values and return the most accurate values
        if (result == undefined || result._firstRunPassed == undefined) {
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
    getFromCache(name: keyof Settings): Setting {
        if (!this.dataExists(name)) throw Error("No data found for " + name);

        Log.info("getFromCacke with name: " + name);
        Log.info(this.localCache[name]);

        return this.localCache[name];
    }

    /**
     * Get all the stored data from cache. This may not be the latest data
     *
     */
    getAllFromCache(): Settings {
        return this.localCache;
    }

    /**
     * Update the local cache with a new operation
     *
     * @param   {PackedSetting}  newState  The changed setting
     *
     * @throws When newState.name is not a valid value
     */
    updateCache(newState: PackedSetting): void {
        if (!this.dataExists(newState.name)) throw Error("No data found for " + newState.name);

        this.localCache[newState.name].value = newState.value;

        Log.info("New updated cache is:")
        Log.info(this.getAllFromCache());
    }

    stripData(setting: Partial<Settings>): PackedSetting {
        let name = Object.keys(setting)[0] as keyof Settings
        let value = setting[name].value as SettingValue

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
    async update(name: keyof Settings, value: SettingValue): Promise<void> {
        if (!this.dataExists(name)) {
            throw Error("Value did not exist");
        }

        // store in local cache
        this.updateCache({
            name: name,
            value: value,
        })
        this.insert(this.getSettingByName(name));
    }

    onChange(cb: { (changes: browser.storage.StorageChange, name: keyof Settings, area: string): void }): void {
        browser.storage.onChanged.addListener((changes, area) => {
            const name = Object.keys(changes)[0] as keyof Settings;
            cb(changes[name], name, area)
        });
    }

    onReady(cb: { (): void }) {
        if (this.isReady) cb() // return immediatly
        else this.onReadyCb.push(cb) // otherwise wait for being finished
    }

    onReadyAsync() {
        return new Promise<void>(((res: () => void) => {
            this.onReady(() => res());
        }).bind(this));
    }

    private fireReady(): void {
        for (let cb of this.onReadyCb) {
            cb()
        }
    }

}