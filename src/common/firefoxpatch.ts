/**
 * This file is here to make the chrome plugin be compatible
 * with firefox ==> chrome.* == browser.*
 */
// @ts-ignore
function getBrowser() {
    return browser;
}

// function overrides
/**
 * Replacement for getBrowser().storage.local.get ==> unified api
 */
// @ts-ignore
function getLocalStorage(optional: string) {
    return browser.storage.local.get(optional);
}

/**
 * Get the platform specific url for local loaded content
 * @param fileUrl Relative path to requested file
 */
// @ts-ignore
function getIncludedFileUrl(fileUrl: string) {
    return getBrowser().extension.getURL(fileUrl);
}