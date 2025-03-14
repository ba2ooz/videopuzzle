import { Direction } from "../../core/puzzle/Direction.js";
import { Grid } from "../../core/puzzle/Grid.js";
import { PuzzleGameComponent } from "./PuzzleGameComponent.js";

export class PuzzleGameEventsHandler {
  /**
   * Handles pointer event listeners on the canvas for grid interactions.
   *
   * @param     {HTMLCanvasElement}     canvas           - the gl canvas
   * @param     {PuzzleGameComponent}   game             - Holds the main logic including the grid object that handles drag and swap actions.
   */
  constructor(canvas, game) {
    this.game = game;
    this.grid = game.gameGrid;
    this.canvas = canvas;
    this.canvasRect = canvas.getBoundingClientRect();
    this.eventHandlers = new Map(); // store event handlers for easy removal

    // shared state for pointer events
    this.isPointerDown = false;

    // set the available sneak peeks
    this.sneakPeeksAvailable = document.getElementById("sneak-peaks-left");
    this.sneakPeeksAvailable.textContent = this.game.getAvailableSneakPeeks();

    // add event listeners
    this.enableAllGridListeners();
  }

  /**
   * Handles the pointer down within the canvas.
   *
   * @param {Event} e - The pointer move event.
   */
  handleGridPointerDown(e) {
    this.isPointerDown = true;
    const [pointerX, pointerY] = this.getCanvasEventCoords(e);
    this.grid.initDragState(pointerX, pointerY);
  }

  /**
   * Handles the pointer move event on the entire window for as long as pointerdown is active
   *
   * @param {Event} e - The pointer move event.
   */
  handleGridPointerMove(e) {
    if (!this.isPointerDown) {
      return;
    }

    const [pointerX, pointerY] = this.getCanvasEventCoords(e);
    this.grid.handleDragAction(pointerX, pointerY);
  }

  /**
   * Handles the pointer up event on entire window.
   * This is triggered when the pointer is released.
   * It resets @param isPointerDown state and handles a two tiles swap event.
   *
   * @param {Event} e - The pointer event object.
   */
  handleGridPointerUp(e) {
    if (!this.isPointerDown) {
      return;
    }

    // pointerdown released, update the state
    this.isPointerDown = false;

    const swappedTextures = this.grid.handleSwapAction();
    // reset the grid state. This has to happen even if no swap occured
    this.grid.clearDragState();

    // no swap occurred, do nothing
    if (!swappedTextures) {
      return;
    }

    this.notifyTextureSwap(
      swappedTextures.texture1.data,
      swappedTextures.texture1.offsetId
    );
    this.notifyTextureSwap(
      swappedTextures.texture2.data,
      swappedTextures.texture2.offsetId
    );

    if (this.grid.isUnshuffled()) {
      this.grid.unshuffledWithSuccess();
      this.notifyUnshuffled();
      this.disableAllGridListeners();
    }
  }

  /**
   * Executes a callback function which shifts the grid textures
   * Triggers texture update event.
   * Checks for win condition in which case removes the grid interaction listeners.
   *
   * @param {function} handleShift - callback shift textures function
   */
  handleShiftButtonPointerDown(handleShift, direction) {
    const gridTextures = handleShift.call(this.grid, direction);
    this.notifyTextureSwap(gridTextures);

    if (this.grid.isUnshuffled()) {
      this.grid.unshuffledWithSuccess();
      this.notifyUnshuffled();
      this.disableAllGridListeners();
    }
  }

  async handleSneakPeekButtonPointerDown() {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (!this.game.getAvailableSneakPeeks()) {
      return;
    }

    this.game.useSneakPeek();
    this.sneakPeeksAvailable.textContent = this.game.getAvailableSneakPeeks();

    // get the data
    const currentTextures = this.grid.getTextures();
    const sneakPeekData = this.grid.sneakPeek();
    const sneakPeekEndsIn = 5000;

    // disbale any interaction with the grid
    this.disableAllGridListeners();

    // change textures after 500 ms
    await delay(500);
    this.notifyTextureSwap(sneakPeekData.textures);

    // wait for four seconds then call sneak peek again to trigger an animation
    await delay(sneakPeekData.delay + sneakPeekEndsIn);
    this.grid.sneakPeek();

    // change textures back after 500 ms
    await delay(500);
    this.notifyTextureSwap(currentTextures);

    // register event handlers back once the animation is done
    await delay(sneakPeekData.delay);
    this.enableAllGridListeners();
  }

  /**
   * Registers the grid interaction events
   */
  addGridListeners() {
    this.eventHandlers.addAndStoreEventListener(
      this.canvas,
      "pointerdown",
      this.handleGridPointerDown.bind(this)
    );
    this.eventHandlers.addAndStoreEventListener(
      window,
      "pointermove",
      this.handleGridPointerMove.bind(this)
    );
    this.eventHandlers.addAndStoreEventListener(
      window,
      "pointerup",
      this.handleGridPointerUp.bind(this)
    );
  }

  /**
   * Registers the grid buttons click events
   */
  addButtonListeners() {
    this.upButton = document.getElementById("shift_UP");
    this.downButton = document.getElementById("shift_DOWN");
    this.leftButton = document.getElementById("shift_LEFT");
    this.rightButton = document.getElementById("shift_RIGHT");
    this.sneakPeekButton = document.getElementById("sneak-peak");

    const eventType = "pointerdown";
    this.eventHandlers.addAndStoreEventListener(this.upButton, eventType, () =>
      this.handleShiftButtonPointerDown(this.grid.shiftOnRows, Direction.UP)
    );
    this.eventHandlers.addAndStoreEventListener(
      this.downButton,
      eventType,
      () =>
        this.handleShiftButtonPointerDown(this.grid.shiftOnRows, Direction.DOWN)
    );
    this.eventHandlers.addAndStoreEventListener(
      this.leftButton,
      eventType,
      () =>
        this.handleShiftButtonPointerDown(
          this.grid.shiftOnColumns,
          Direction.LEFT
        )
    );
    this.eventHandlers.addAndStoreEventListener(
      this.rightButton,
      eventType,
      () =>
        this.handleShiftButtonPointerDown(
          this.grid.shiftOnColumns,
          Direction.RIGHT
        )
    );
    this.eventHandlers.addAndStoreEventListener(
      this.sneakPeekButton,
      eventType,
      this.handleSneakPeekButtonPointerDown.bind(this)
    );
  }

  enableAllGridListeners() {
    this.addGridListeners();
    this.addButtonListeners();
    this.upButton.classList.remove("inactive");
    this.downButton.classList.remove("inactive");
    this.leftButton.classList.remove("inactive");
    this.rightButton.classList.remove("inactive");
    this.sneakPeekButton.classList.remove("inactive");
  }

  disableAllGridListeners() {
    this.eventHandlers.removeAllEventListeners();
    this.upButton.classList.add("inactive");
    this.downButton.classList.add("inactive");
    this.leftButton.classList.add("inactive");
    this.rightButton.classList.add("inactive");
    this.sneakPeekButton.classList.add("inactive");
  }

  /**
   * Triggers a custom texture update event
   *
   * @param {Array}  data   - An array containing either all textures or one specific texture
   * @param {number} offset - The offset id at which data should be inserted - if null, the entire textures array will be replaced
   */
  notifyTextureSwap(data, offset = null) {
    const offsetId = offset === null ? -1 : offset;
    document.dispatchEvent(
      new CustomEvent("texture_swap", {
        detail: {
          data: data,
          offset: offsetId,
        },
      })
    );
  }

  notifyUnshuffled() {
    document.dispatchEvent(new CustomEvent("unshuffled"));
  }

  /**
   * Calculates the coordinates of a mouse event relative to the canvas.
   *
   * @param   {Event} e  - The mouse event object.
   * @returns {number[]} An array containing the normalized x and y coordinates of the event.
   */
  getCanvasEventCoords(e) {
    return [
      (e.clientX - this.canvasRect.left) / this.canvas.width,
      (e.clientY - this.canvasRect.top) / this.canvas.height,
    ];
  }

  destroy() {
    this.grid = null;
    this.canvas = null;
    this.canvasRect = null;
    this.upButton = null;
    this.downButton = null;
    this.leftButton = null;
    this.rightButton = null;
  }
}
