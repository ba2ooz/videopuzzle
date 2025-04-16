import modalHTML from "bundle-text:./puzzle-stats-modal.html?raw";
import { createDomElementFromHtml } from "../../utils/utils.js";

export class PuzzleStatsComponent {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.modal = createDomElementFromHtml(modalHTML);
    this.container.appendChild(this.modal);
  }

  destroy() {
    this.modal.remove();
  }
}
