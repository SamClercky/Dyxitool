/**************
 * CAUTION
 * 
 * This file was a experiment and is not concidered as a part
 * of this software packet. Changes can be arbitrary and whithout
 * warning. The purpose of this file has been moved to
 * main.ts in the PrefabStyles itself.
 * 
 * CAUTION
 **************/


// let GlyphIsSearching = false;

async function glyphprotection() {
    console.warn("Start protectionscan");
    // if (GlyphIsSearching == false) {
    //     GlyphIsSearching = true;
        await _checkNode(document.body);
    //     GlyphIsSearching = false;
    // }
    console.warn("End protectionscan");
}

async function _checkTextNode(node: HTMLElement) {
    const text = node.nodeValue;
    // console.warn(node, _isGlyph(text));
    
    if (text.length > 10) {
        // to long ==> abandon
        return;
    } else if (_isGlyph(text)) {
        // node is glyph ==> protect against OpenDyslexic
        node.parentElement.style.fontFamily = "auto";
    }
}

async function _checkNode(node: HTMLElement) {
    // console.log("Node to check", node);
    if (_isTextNode(node)) {
        // if it is a textnode ==> check it async
        _checkTextNode(node);
        // console.info("_isTextNode", node);

    } else if (_isSearchable(node)) {
        // skip any node that is not searchable
        // check searchable recusivly
        // console.info("_isSearchable", node);
        node.childNodes.forEach(async n => {
            await _checkNode(n as HTMLElement);
        })
    } else {
        // console.info("_isNone", node);
        // leave this empty ==> only not usable nodes
    }
}

function _isSearchable(node: HTMLElement) {
    const nodeName = node.nodeName.toLowerCase();

    return nodeName != "script" &&
        !_isTextNode(node);
}

function _isTextNode(node: HTMLElement) {
    return node.nodeType === Node.TEXT_NODE;
}

function _isGlyph(text: string) {
    return text.startsWith("\\")
}