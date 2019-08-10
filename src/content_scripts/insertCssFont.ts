function insertCssFont() {
    let styles = document.createElement("style") as HTMLStyleElement
    styles.appendChild(
        document.createTextNode(
            `
            @font-face{
                font-family: OpenDyslexic;
                src: url(${getIncludedFileUrl("fonts/OpenDyslexic-Regular.otf")});
                font-style: normal;
                font-weight: 400;
            }
            @font-face{
                font-family: OpenDyslexic;
                src: url(${getIncludedFileUrl("fonts/OpenDyslexic-Italic.otf")});
                font-style: italic;
                font-weight: 400;
            }
            @font-face{
                font-family: OpenDyslexic;
                src: url(${getIncludedFileUrl("fonts/OpenDyslexic-Bold.otf")});
                font-weight: 700;
                font-style: bold;
            }
            @font-face{
                font-family: OpenDyslexic;
                src: url(${getIncludedFileUrl("fonts/OpenDyslexic-BoldItalic.otf")});
                font-weight: 700;
                font-style: italic;
            }
            @font-face{
                font-family: OpenDyslexicMono;
                src: url(${getIncludedFileUrl("fonts/OpenDyslexicMono-Regular.otf")});
                font-weight: 400;
                font-style: normal;
            }
            `.replace(/\s/g,'')
        )
    )
    document.head.appendChild(styles)
}