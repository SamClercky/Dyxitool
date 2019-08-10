class Server {
    send(name: PackedSetting) {
        getBrowser().tabs.query({})
            .then((tabs) => {
                for (let tab of tabs) {
                    getBrowser().tabs.sendMessage(
                        tab.id,
                        name
                    )
                }
            })
    }
}