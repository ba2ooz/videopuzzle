import tutorialHTML from "bundle-text:./puzzle-game-tutorial.html?raw";
import { createDomElementFromHtml } from "../../utils";
import { PuzzleGameComponent } from ".."

export class PuzzleGameTutorialComponent {
  /**
   * 
   * @param {PuzzleGameComponent} game 
   */
  constructor(game) {
    this.game = game;
    this.eventHandlers = new Map();
  }

  render() {
    this.ui = this.getUIElements();
    this.game.ui.puzzleBoardElement.insertBefore(
      this.ui.tutorialElement,
      this.game.ui.puzzleBoardElement.firstChild
    );
    this.addListeners();

    this.game.gameEventsHandler.disableAllListeners();
    
    this.startStep(this.game.getMovesCount());

    return this.ui.tutorialElement;
  }

  startStep(step) {
    let stepElement = null;
    let stepButton = null;

    switch(step) {
      case 0: 
        stepElement = this.ui.step1Element; 
        break;

      case 1: 
        stepElement = this.ui.step3Element; 
        stepButton = this.game.gameEventsHandler.ui.btn.up; 
        break;

      case 2: 
        stepElement = this.ui.step2Element; 
        stepButton = this.game.gameEventsHandler.ui.btn.left; 
        break;

      default: 
        this.destroy(); return;
    }

    this.deactivateCurrentStep();
    this.activateStep(stepElement, stepButton);
  }

  activateStep(stepElement, stepButton = null) {
    if (stepButton){
      this.currentFocusBtn = stepButton
      this.currentFocusBtn.classList.add("flicker-button");
      this.game.gameEventsHandler.enableButton(this.currentFocusBtn);
    } else {
      this.game.gameEventsHandler.addGridListeners();
    }

    if (stepElement) {
      this.activeElement = stepElement;
      this.activeElement.display();
    }
  }

  deactivateCurrentStep() {
    this.game?.gameEventsHandler.disableAllListeners();

    if (this.currentFocusBtn)
      this.currentFocusBtn.classList.remove("flicker-button");

    if (this.activeElement)
      this.activeElement.hide();
  }

  addListeners() {
    this.eventHandlers.addAndStoreEventListener(
      document, "texture_swap", this.handleUpdateStep.bind(this)
    );
  }

  handleUpdateStep() {
    const nextStep = this.game.getMovesCount();
    console.log(nextStep);
    this.startStep(nextStep);
  }

  getUIElements() {
    this.tutorialNode = createDomElementFromHtml(tutorialHTML);

    return {
      step1Element: this.tutorialNode.querySelector(".step1"),
      step2Element: this.tutorialNode.querySelector(".step2"),
      step3Element: this.tutorialNode.querySelector(".step3"),
      tutorialElement: this.tutorialNode,
    };
  }

  destroy() {
    this.deactivateCurrentStep();
    this.eventHandlers?.removeAllEventListeners();

    Object.keys(this).forEach(key => this[key] = null);
  }
}
