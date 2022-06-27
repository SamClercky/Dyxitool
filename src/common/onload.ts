enum OnEvent { Load = "loadList", DOMContentLoaded = "DOMList" };

/**
 * Proxy for window.onload
 */
class OnLoad {
    private static _loadStatus = {
        "loadList": false,
        "DOMList": false,
    }
    private static _cbList = {
        "loadList": [] as (() => void)[],
        "DOMList": [] as (() => void)[],
    }

    /**
     * Checks if the onload event has been fired
     */
    public static get isLoaded(): boolean {
        return OnLoad._loadStatus[OnEvent.Load];
    }

    public static get isDOMLoaded(): boolean {
        return OnLoad._loadStatus[OnEvent.DOMContentLoaded];
    }

    public static addEventListener(event: OnEvent, cb: () => void) {
        if (OnLoad._loadStatus[event] == false)
            OnLoad._cbList[event].push(cb); // if event hasn't yet fired => keep reference
        else
            cb(); // Webpage has been loaded => fire immediatly
    }

    public static waitTill(event: OnEvent) {
        return new Promise<void>(res => {
            OnLoad.addEventListener(event, () => res());
        });
    }

    /**
     * Internal function: Should not be used outside the source file
     *
     * @return  {[type]}  [return description]
     */
    static _fire(event: OnEvent) {
        OnLoad._loadStatus[event] = true; // set flag to true
        OnLoad._cbList[event].forEach(cb => cb()); // call all the callbacks
        OnLoad._cbList[event] = []; // remove all the references to the callbacks
    }
}

window.addEventListener("DOMContentLoaded", () => OnLoad._fire(OnEvent.DOMContentLoaded));
window.addEventListener("load", () => OnLoad._fire(OnEvent.Load));