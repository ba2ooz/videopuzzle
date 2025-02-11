import { updateTextureBuffer } from "../graphics/buffers.js";

let draggedTile = null;

export const addPointerListenerOn = (gl, canvas, grid) => {
  const getCanvasEventCoords = (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    return [(e.clientX - canvasRect.left) / canvas.width, (e.clientY - canvasRect.top) / canvas.height];
  };

  canvas.addEventListener("pointerdown", (e) => {
    const handlePointerMove = (e) => {
      // no tile should not be a valid scenario
      if (!draggedTile) return;

      // convert pointer coordinates and normalize to (-1 to 1)
      const [pointerX, pointerY] = getCanvasEventCoords(e);
      const normalizedX = 2 * pointerX - 1;
      const normalizedY = 1 - 2 * pointerY;
      grid.moveTile(draggedTile, normalizedX, normalizedY);
    };

    const handlePointerUp = (e) => {
      window.removeEventListener("pointermove", handlePointerMove);

      // get target tile, swap the textures and reset the dragged tile position
      const [pointerX, pointerY] = getCanvasEventCoords(e);
      const targetTile = grid.getTileCoords(pointerX, pointerY);
      const gridTextures = grid.swapTiles(draggedTile, targetTile);
      grid.resetTile(draggedTile);
      draggedTile = null;

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
    draggedTile = grid.getTileCoords(pointerX, pointerY);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  });
};
