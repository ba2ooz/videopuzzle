import { Direction } from "./direction.js";
import {
  updateTextureBuffer,
  updateTextureBufferSubData,
} from "../graphics/buffers.js";
import { GameGrid } from "./grid.js";

/**
 * Adds pointer and click event listeners to the canvas and document elements for grid interactions.
 *
 * @param {WebGLRenderingContext} gl - The WebGL rendering context.
 * @param {HTMLCanvasElement} canvas - The canvas element to attach pointer events to.
 * @param {GameGrid} grid - The grid object that handles drag and swap actions.
 */
export const addPointerListenerOn = (gl, canvas, grid) => {
  /**
   * Calculates the coordinates of a mouse event relative to the canvas.
   *
   * @param {Event} e - The mouse event object.
   * @returns {number[]} An array containing the normalized x and y coordinates of the event.
   */
  const getCanvasEventCoords = (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    return [
      (e.clientX - canvasRect.left) / canvas.width,
      (e.clientY - canvasRect.top) / canvas.height,
    ];
  };

  /**
   * Handles the pointer down within the canvas.
   *
   * @param {Event} e - The pointer move event.
   */
  canvas.addEventListener("pointerdown", (e) => {
    /**
     * Handles the pointer move event by getting the coordinates of the event
     * on the canvas and passing them to the grid's drag action handler.
     *
     * @param {Event} e - The pointer move event.
     */
    const handlePointerMove = (e) => {
      const [pointerX, pointerY] = getCanvasEventCoords(e);
      grid.handleDragAction(pointerX, pointerY);
    };

    /**
     * Handles the pointer up event.
     *
     * This function is triggered when the pointer is released. It removes the
     * pointer move event listener, swaps the textures of the dragged and
     * highlighted tiles, and updates the texture buffer data.
     *
     * @param {PointerEvent} e - The pointer event object.
     */
    const handlePointerUp = (e) => {
      window.removeEventListener("pointermove", handlePointerMove);

      // swap dragged and highlighted tiles texture
      const swappedTextures = grid.handleSwapAction();
      // reset the grid state. This has to happen even if no swap occured
      grid.clearDragState();

      // no swap occurred, do nothing
      if (!swappedTextures) {
        return;
      }

      updateTextureBufferSubData(
        gl,
        swappedTextures.texture1.data,
        swappedTextures.texture1.offsetId
      );
      updateTextureBufferSubData(
        gl,
        swappedTextures.texture2.data,
        swappedTextures.texture2.offsetId
      );

      if (grid.isUnshuffled()) {
        console.log("puzzle solved");
      }
    };

    const [pointerX, pointerY] = getCanvasEventCoords(e);
    grid.initDragState(pointerX, pointerY);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  });

  document.getElementById("shift_LEFT").addEventListener("click", () => {
    const gridTextures = grid.shiftOnColumns(Direction.LEFT);
    updateTextureBuffer(gl, gridTextures);
  });

  document.getElementById("shift_RIGHT").addEventListener("click", () => {
    const gridTextures = grid.shiftOnColumns(Direction.RIGHT);
    updateTextureBuffer(gl, gridTextures);
  });

  document.getElementById("shift_UP").addEventListener("click", () => {
    const gridTextures = grid.shiftOnRows(Direction.UP);
    console.log(gridTextures);
    updateTextureBuffer(gl, gridTextures);
  });

  document.getElementById("shift_DOWN").addEventListener("click", () => {
    const gridTextures = grid.shiftOnRows(Direction.DOWN);
    console.log(gridTextures);
    updateTextureBuffer(gl, gridTextures);
  });
};
