class Client {
    onResponse(): Promise<PackedSetting> {
        return new Promise((suc: {(PackedSetting): void}) => {
            getBrowser().runtime.onMessage.addListener((request: Settings) => {
                suc(request)
            })
        })
    }
}