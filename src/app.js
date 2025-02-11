import { addPointerListenerOn } from "./puzzle/grid-interactions.js";
import { initShaderProgram } from "./graphics/shader.js";
import { createPuzzleGrid } from "./puzzle/grid.js";
import { initBuffers } from "./graphics/buffers.js";
import { drawScene } from "./graphics/scene.js";
import * as video from "./graphics/video.js";

const PUZZLE_SIZE = 4;

// get a WebGLRenderingContext to render content
const canvas = document.querySelector("#video-canvas");
const gl = canvas.getContext("webgl2");
if (!gl) {
  const errMsg =
    "Unable to initialize WebGL. Your browser or machine may not support it.";

  alert(errMsg);

  throw Error(errMsg);
}

// init the shader program
const programInfo = initShaderProgram(gl);
const puzzleGrid = createPuzzleGrid(PUZZLE_SIZE);
const modelViewsMatrix = puzzleGrid.getTilesMatrix();
const buffers = initBuffers(gl, puzzleGrid);

// init video texture
const videoRef = video.setupVideo("testVideo.mp4");
const texture = video.initTexture(gl);

// add pointer listener to the canvas
addPointerListenerOn(gl, canvas, puzzleGrid);

// render the scene
const render = () => {
  video.updateTexture(gl, texture, videoRef);
  drawScene(gl, programInfo, buffers, modelViewsMatrix);
  requestAnimationFrame(render);
};

requestAnimationFrame(render);
