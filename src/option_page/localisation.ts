/**
 * This document makes shure that all the localized strings on the option_page are in the right locale
 */

 /**
  * i18n-element
  * itemName: selector of the element
  * iMessageName: message to be retrieved from i18n
  */
interface iElement {
    itemName: string,
    iMessageName: string
}

$(document).ready(() => {
    [
        {itemName: "h2.heading",                iMessageName: "headerOptionPage"},
        {itemName: "#goAndVisitLinkOptionPage", iMessageName: "goAndVisitLinkOptionPage"},
        {itemName: "#issuesLinkOptionPage",     iMessageName: "issuesLinkOptionPage"},
        {itemName: "#resetBtn",                 iMessageName: "resetBtn"},
        {itemName: "#advancedHeading",          iMessageName: "advancedHeading"},
        {itemName: "#resetLbl",                 iMessageName: "resetLbl"},
        {itemName: "#versionDescription",       iMessageName: "versionNumberOptionPage"}
    ].forEach(item => {
        $(item.itemName).text(browser.i18n.getMessage(item.iMessageName));
    })

    // Show version number
    $("#version").text(VERSION);
})