class Client {
    onResponse() {
        return new Promise((suc) => {
            browser.runtime.onMessage.addListener((request) => {
                suc(request);
            });
        });
    }
}
//# sourceMappingURL=client.js.map