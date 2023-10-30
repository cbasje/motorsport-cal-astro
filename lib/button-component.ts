import { navigate } from "astro:transitions/client";

class BackButton extends HTMLButtonElement {
    constructor() {
        super();

        this.addEventListener("click", () => {
            if (this.dataset.link) navigate(this.dataset.link);
            else history.back();
        });
    }
}

customElements.define("back-button", BackButton, { extends: "button" });
