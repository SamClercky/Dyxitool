class Server {
    send(name: PackedSetting) {
        browser.tabs.query({})
            .then((tabs) => {
                for (let tab of tabs) {
                    browser.tabs.sendMessage(
                        tab.id,
                        name
                    )
                }
            })
    }
}