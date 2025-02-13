import { updateTextureBuffer } from "../graphics/buffers.js";

export const addPointerListenerOn = (gl, canvas, grid) => {
  // gets pointer coords relative to canvas
  const getCanvasEventCoords = (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    return [
      (e.clientX - canvasRect.left) / canvas.width,
      (e.clientY - canvasRect.top) / canvas.height,
    ];
  };

  // handle pointer down within the canvas
  canvas.addEventListener("pointerdown", (e) => {
    // handle pointer movement during pointer down event
    const handlePointerMove = (e) => {
      const [pointerX, pointerY] = getCanvasEventCoords(e);
      grid.dragTile(pointerX, pointerY);
    };

    // handle pointer down released
    const handlePointerUp = (e) => {
      window.removeEventListener("pointermove", handlePointerMove);
      
      // swap dragged and highlighted tiles texture
      const gridTextures = grid.swapTiles();
      // reset the grid state. This has to happen even if no swap occured
      grid.cleanDragState();

      // no swap occurred, do nothing
      if (!gridTextures) {
        return;
      }

      updateTextureBuffer(gl, gridTextures);

      if (grid.isUnshuffled()) {
        console.log("puzzle solved");
      }
    };

    const [pointerX, pointerY] = getCanvasEventCoords(e);
    grid.initDragState(pointerX, pointerY);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  });
};