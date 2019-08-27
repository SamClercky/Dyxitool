browser.runtime.onInstalled
    .addListener(async ({reason, temporary}) => {
        // if (temporary) return

        switch (reason) {
            case "install": {
                console.log("Dyxitool has been installed");
                // const url = browser.runtime.getURL("https://samclercky.github.io/Dyxitool/onbording.html");
                await browser.tabs.create({url: "https://samclercky.github.io/Dyxitool/onbording.html"});
                break;
            }
        }
    });