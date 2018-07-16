class CScreen {
    constructor() {
        this.id = this.genId();
        this.position = {
            X: 0,
            Y: 0,
            Width: 0,
            Height: 0
        };
        this.color = Color.BLACK;
        this.object = null;
        this.build();
    }
    build() {
        this.object = document.createElement("div");
        this.object.setAttribute("id", this.id);
        this.setVisible(true);
        this.object.style.position = "absolute";
        this.object.style.zIndex = "1000";
        this.resetPos();
        const $this = this;
        this.object.onclick = (e) => {
            this.setVisible(false, $this);
            document.elementFromPoint(e.clientX, e.clientY).click();
            $this.setVisible(true, $this);
        };
        this.add();
    }
    genId() {
        let id = "";
        do {
            id = "uid" + (new Date()).getMilliseconds() + Math.floor(Math.random() * 1000);
        } while (document.getElementById(id) != null);
        return id;
    }
    add() {
        document.body.appendChild(this.object);
    }
    resetPos() {
        this.object.style.left = this.position.X + "px";
        this.object.style.top = this.position.Y + "px";
        this.object.style.width = this.position.Width + "px";
        this.object.style.height = this.position.Height + "px";
        this.object.style.backgroundColor = this.color.colorHex;
        this.object.style.opacity = this.color.colorAlpha.toString();
    }
    setVisible(visible, context) {
        const $this = (context) ? context : this;
        if ($this.object == null)
            return;
        if (visible) {
            $this.object.style.display = "block";
        }
        else {
            $this.object.style.display = "none";
        }
    }
}
//# sourceMappingURL=cscreen.js.map