import notFoundHTML from "bundle-text:./not-found.html?raw";
import page from "page";

export class NotFoundComponent {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = notFoundHTML;
    this.addListeners();
  }

  addListeners() {
    const backBtn = document.getElementById("back-to-selection");
    backBtn.addEventListener("pointerup", () => {
        this.destroy();
        page.redirect("/");
      });
  }

  destroy() {
    this.container = null;
  }
}
