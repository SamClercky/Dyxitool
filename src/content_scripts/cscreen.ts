interface Rect {
    X: number,
    Y: number,
    Width: number,
    Height: number
}

class CScreen {
    private readonly PADDING = 5; // px

    private color = Color.BLACK
    private object: HTMLDivElement = null

    id = this.genId()
    position: Rect = {
        X: 0,
        Y: 0,
        Width: 0,
        Height: 0
    }

    constructor() {
        OnLoad.addEventListener(OnEvent.DOMContentLoaded, this.build.bind(this)); // wait until everything is loaded
    }

    build() {
        this.object = document.createElement("div") as HTMLDivElement
        this.object.setAttribute("id", this.id)

        // cosmetic improvemnt
        this.object.style.transition = "width 0.05s, height 0.05s, left 0.05s, top 0.05s";
        this.object.style.borderRadius = this.PADDING + "px";

        this.setVisible(true)
        this.object.style.position = "absolute"
        this.object.style.zIndex = "100000"
        this.object.style.pointerEvents = "none";
        this.resetPos()

        const $this = this // context
        this.object.onclick = (e) => { // TODO: add css-property pointer-events: none to mitigate issue #5
            this.setVisible(false, $this)

            document.elementFromPoint(e.clientX, e.clientY).click()

            $this.setVisible(true, $this)
        }
        this.add()
    }


    private genId(): string {
        let id = ""
        do {
            id = "uid" + (new Date()).getMilliseconds() + Math.floor(Math.random() * 1000);
        } while (document.getElementById(id) != null)

        return id;
    }

    add() {
        document.body.appendChild(this.object)
    }

    resetPos() {
        this.object.style.left = (this.position.X - this.PADDING) + "px"
        this.object.style.top = (this.position.Y - this.PADDING) + "px"
        this.object.style.width = (this.position.Width + this.PADDING * 2) + "px"
        this.object.style.height = (this.position.Height + this.PADDING * 2) + "px"
        this.object.style.opacity = this.color.colorAlpha.toString()
    }

    setVisible(visible: boolean, context?: CScreen) {
        const $this = (context) ? context : this

        if ($this.object == null) return

        if (visible) {
            $this.object.style.display = "block"
        } else {
            $this.object.style.display = "none"
        }
    }
}

interface Element {
    click?: { (): void } // make the compiler quiet
}
