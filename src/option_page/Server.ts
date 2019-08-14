class Server {
    send(msg: PackedSetting) {
        browser.tabs.query({})
            .then((tabs) => {
                for (let tab of tabs) {
                    try {
                        browser.tabs.sendMessage(
                            tab.id,
                            msg
                        )
                    } catch (e) {
                        console.error("Could not send message ", msg, " to tab with id ", tab.id);
                    }
                }
            })
    }
}