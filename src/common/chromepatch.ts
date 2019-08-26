/**
 * Get the platform specific url for local loaded content
 * @param fileUrl Relative path to requested file
 */
// @ts-ignore
function getIncludedFileUrl(fileUrl: string) {
    return "chrome-extension://__MSG_@@extension_id__/" + fileUrl;
}