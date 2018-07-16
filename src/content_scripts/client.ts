class Client {
    onResponse(): Promise<PackedSetting> {
        return new Promise((suc: {(PackedSetting): void}) => {
            browser.runtime.onMessage.addListener((request: Settings) => {
                suc(request)
            })
        })
    }
}