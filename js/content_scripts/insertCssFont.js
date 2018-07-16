function insertCssFont() {
    let styles = document.createElement("style");
    styles.appendChild(document.createTextNode(`
            @font-face{
                font-family: OpenDyslexic;
                src: url('${browser.extension.getURL("fonts/OpenDyslexic-Regular.otf")}');
                font-style: normal;
                font-weight: 400;
            }
            @font-face{
                font-family: OpenDyslexic;
                src: url('${browser.extension.getURL("fonts/OpenDyslexic-Italic.otf")}');
                font-style: italic;
                font-weight: 400;
            }
            @font-face{
                font-family: OpenDyslexic;
                src: url('${browser.extension.getURL("fonts/OpenDyslexic-Bold.otf")}');
                font-weight: 700;
                font-style: bold;
            }
            @font-face{
                font-family: OpenDyslexic;
                src: url('${browser.extension.getURL("fonts/OpenDyslexic-BoldItalic.otf")}');
                font-weight: 700;
                font-style: italic;
            }
            @font-face{
                font-family: OpenDyslexicMono;
                src: url('${browser.extension.getURL("fonts/OpenDyslexicMono-Regular.otf")}');
                font-weight: 400;
                font-style: normal;
            }
            `));
    document.head.appendChild(styles);
}
//# sourceMappingURL=insertCssFont.js.map