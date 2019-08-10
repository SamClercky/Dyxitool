/**
 * This file is here to make the firefox plugin be compatible
 * with chrome ==> chrome.* == browser.*
 */
// @ts-ignore
function getBrowser() {
    return chrome;
}

// function overrides
/**
 * Replacement for getBrowser().storage.local.get ==> unified api
 */
// @ts-ignore
function getLocalStorage(optional: string) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(optional, (response) => {
            resolve(response);
        });
    });
}

/**
 * Get the platform specific url for local loaded content
 * @param fileUrl Relative path to requested file
 */
// @ts-ignore
function getIncludedFileUrl(fileUrl: string) {
    return "chrome-extension://__MSG_@@extension_id__/" + fileUrl;
}