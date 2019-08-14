type OnStateChangedFunc = {(settingsState: Settings): void};

class SettingsStateNotifier {
    private onStateChange: OnStateChangedFunc[] = []

    constructor(client: Client, storage: Db) {
        // client.onResponse()
        //     .then((packedSetting: PackedSetting) => {
        //         // when new signal is received ==> update view
        //         storage.updateCache(packedSetting);
        //         this.handleChange(storage.getAllFromCache());
        //     });
        storage.onChange((changes, name, area) => {
            // TODO: add implementation or see if it is realy needed
            Log.warn("Storage onChange is used, is this realy needed?");
            Log.warn(changes)
            Log.warn(name)
            Log.warn(area)
            storage.updateCache({
                name: name,
                value: changes.newValue.value
            })
            this.handleChange(storage.getAllFromCache());
        })
    }

    onSettingsState(cb: OnStateChangedFunc): void {
        this.onStateChange.push(cb);
    }

    private handleChange(state: Settings) {
        this.onStateChange.forEach(cb => cb(state));
    }
}