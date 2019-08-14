type OnStateChangedFunc = {(settingsState: Settings): void};

class SettingsStateNotifier {
    private onStateChange: OnStateChangedFunc[] = []

    constructor(storage: Db) {
        storage.onChange((changes, name, area) => {
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