class Server {
    send(name) {
        browser.tabs.query({})
            .then((tabs) => {
            for (let tab of tabs) {
                browser.tabs.sendMessage(tab.id, name);
            }
        });
    }
}
//# sourceMappingURL=Server.js.map