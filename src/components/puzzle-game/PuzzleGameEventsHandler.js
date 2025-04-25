import { Direction } from "../../core/puzzle/Direction.js";
import { PuzzleGameComponent } from "./PuzzleGameComponent.js";

export class PuzzleGameEventsHandler {
  /**
   * Handles pointer event listeners on the canvas for grid interactions.
   *
   * @param     {PuzzleGameComponent} game - Holds the main logic including the grid object that handles drag and swap actions.
   */
  constructor(game) {
    this.game = game;
    this.grid = game.gameGrid;
    this.gl = game.glContext.gl;
    this.canvas = game.glContext.canvas;
    this.canvasAspectRatio = this.canvas.height / this.canvas.width;
    this.eventHandlers = new Map(); // store event handlers for easy removal

    this.init();
  }

  init() {
    this.ui = this.getUIElements();
    this.ui.sneakPeeksMetaElement.textContent = this.game.getAvailableSneakPeeks();
    
    // add event listeners
    this.enableAllGridListeners();
    this.resizeCanvas();

    // shared state for pointer events
    this.isPointerDown = false;
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

    const swappedData = this.grid.handleSwapAction();
    // reset the grid state. This has to happen even if no swap occured
    this.grid.clearDragState();

    // no swap occurred, do nothing
    if (!swappedData) {
      return;
    }

    this.game.animationController.createSwapAnimation(swappedData.source.tile, swappedData.target.tile);

    this.notifyTextureSwap(
      swappedData.source.texture.data,
      swappedData.source.texture.offsetId
    );
    this.notifyTextureSwap(
      swappedData.target.texture.data,
      swappedData.target.texture.offsetId
    );

    this.handleCheckWin();
  }

  /**
   * Executes a callback function which shifts the grid textures
   * Triggers texture update event.
   * Checks for win condition in which case removes the grid interaction listeners.
   *
   * @param {function} handleShift - callback shift textures function
   */
  handleShiftButton(handleShift, direction) {
    const shiftResult = handleShift.call(this.grid, direction);
    this.game.animationController.createShiftAnimations(shiftResult);
    const gridTextures = this.grid.getTextures();
    this.notifyTextureSwap(gridTextures);

    this.handleCheckWin();
  }

  /**
   * Handles the "Sneak Peek" button pointer down event.
   *
   * This method performs the following actions:
   * - Disables all interactions with the grid.
   * - Retrieves the current textures and sneak peek data from the grid.
   * - Temporarily swaps the grid textures to show the sneak peek textures.
   * - Starts a countdown for the sneak peek duration.
   * - Reverts the grid textures back to the original textures after the sneak peek ends.
   * - Updates the available sneak peeks count and re-enables grid interactions.
   *
   * @async
   * @returns {Promise<void>} Resolves when the sneak peek process is complete.
   */
  async handleSneakPeekButton() {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (!this.game.getAvailableSneakPeeks()) {
      return;
    }

    // disbale any interaction with the grid
    this.disableAllGridListeners();

    // get the needed data
    const unshuffledTextures = this.grid.getOriginalTextures();
    const currentTextures = this.grid.getTextures();
    const sneakPeekDelay = this.game.animationController.createSneakPeekAnimations(this.grid.getTiles());
    const sneakPeekDuration = 8000; // ms

    // change textures after 500 ms and start the countdown
    await delay(500);
    this.notifyTextureSwap(unshuffledTextures);
    this.startSneakPeekCountdown(sneakPeekDuration);

    // wait the sneak peek duration then call sneak peek method again to trigger the end animation
    await delay(sneakPeekDelay + sneakPeekDuration);
    this.game.animationController.createSneakPeekAnimations(this.grid.getTiles());

    // change textures back after 500 ms
    await delay(500);
    this.notifyTextureSwap(currentTextures);

    // update available sneap peeks and register event handlers back once the animation is done
    await delay(sneakPeekDelay);
    this.game.useSneakPeek();
    this.ui.sneakPeeksMetaElement.textContent = this.game.getAvailableSneakPeeks();
    this.enableAllGridListeners();
  }

  /**
   * Starts a countdown timer for a sneak peek feature and updates the UI with the remaining time.
   * 
   * @param {number} duration - The duration of the sneak peek in milliseconds.
   * 
   * This method initializes a countdown timer that updates the `textContent` of the 
   * `sneakPeeksMeta` element every second to display the remaining time in seconds. 
   * Once the countdown reaches zero, the timer is cleared.
   */
  startSneakPeekCountdown(duration) {
    let timeleft = duration / 1000; // seconds
    const sneakPeekInterval = 
      setInterval(() => {
        if (timeleft > -1) {
          this.ui.sneakPeeksMetaElement.textContent = `ends in ${timeleft}s`;
          timeleft--;
          return;
        } 

        clearInterval(sneakPeekInterval);
      }, 1000);
  }

  handleCheckWin() {
    if (this.grid.isUnshuffled()) {
      this.game.animationController.createWinAnimations(this.grid.getTiles());
      setTimeout(this.notifyUnshuffled, 1600); // allow the animation to finish before notifying listeners
      this.disableAllGridListeners();
    }
  }

  /**
   * Registers the grid interaction and buttons events
   */
  addListeners() {
    this.getGridEventHandlers()
      .forEach(({ element, event, handler }) =>
        this.eventHandlers.addAndStoreEventListener(element, event, handler)
      );

    this.getButtonEventHandlers()
      .forEach(({ element, event, handler }) => 
        this.eventHandlers.addAndStoreEventListener(element, event, handler)
      );
  }

  enableAllGridListeners() {
    this.addListeners();
    Object.values(this.ui.btn)
      .forEach(btn => btn.enable());
  }

  disableAllGridListeners() {
    this.eventHandlers.removeAllEventListeners();
    Object.values(this.ui.btn)
    .forEach(btn => btn.disable());
  }

  showControls() {
    Object.values(this.ui.btn)
      .forEach(btn => btn.display());
  }

  hideControls() {
    Object.values(this.ui.btn)
      .forEach(btn => btn.hide());
  }

  showSolvedPuzzle() {
    const unshuffledTextures = this.grid.getOriginalTextures();
    this.notifyTextureSwap(unshuffledTextures);
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
    const canvasRect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    return [
      (e.clientX - canvasRect.left) * dpr / this.canvas.width,
      (e.clientY - canvasRect.top) * dpr / this.canvas.height,
    ];
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const canvasRect = this.canvas.getBoundingClientRect();
    // override the css height of the canvas
    // this is needed to fix the squash effect of the canvas height as a result of the resize event
    canvasRect.height = canvasRect.width * this.canvasAspectRatio;

    // update the canvas width and height to match the CSS and the screen density
    this.canvas.width = canvasRect.width * dpr;  
    this.canvas.height = canvasRect.height * dpr;

    // adjust the viewport for WebGL
    if (this.gl) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  getUIElements() {
    return { 
      btn: {
        up: document.getElementById("shift_UP"),
        down: document.getElementById("shift_DOWN"),
        left: document.getElementById("shift_LEFT"),
        right: document.getElementById("shift_RIGHT"),
        sneakPeek: document.getElementById("sneak-peak"),
      },
      sneakPeeksMetaElement: document.getElementById("sneak-peaks-meta"),
    }
  }

  getButtonEventHandlers() {
    return [
      { element: this.ui.btn.up, event: "pointerup", handler: () => this.handleShiftButton(this.grid.shiftOnRows, Direction.UP) },
      { element: this.ui.btn.down, event: "pointerup", handler: () => this.handleShiftButton(this.grid.shiftOnRows, Direction.DOWN) },
      { element: this.ui.btn.left, event: "pointerup", handler: () => this.handleShiftButton(this.grid.shiftOnColumns, Direction.LEFT) },
      { element: this.ui.btn.right, event: "pointerup", handler: () => this.handleShiftButton(this.grid.shiftOnColumns, Direction.RIGHT) },
      { element: this.ui.btn.sneakPeek, event: "pointerup", handler: () => this.handleSneakPeekButton() },
    ]
  }

  getGridEventHandlers() {
    return [
      { element: this.canvas, event: "pointerdown", handler: this.handleGridPointerDown.bind(this) },
      { element: window, event: "pointermove", handler: this.handleGridPointerMove.bind(this) },
      { element: window, event: "pointerup", handler: this.handleGridPointerUp.bind(this) },
      { element: window, event: "resize", handler: this.resizeCanvas.bind(this) },
    ]
  }

  destroy() {
    this.eventHandlers.removeAllEventListeners();
    Object.keys(this).forEach(key => this[key] = null);
  }
}
