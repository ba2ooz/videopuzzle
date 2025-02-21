import { addPointerListenerOn } from "./puzzle/grid-interactions.js";
import { initShaderProgram } from "./graphics/shader.js";
import { GameGrid } from "./puzzle/grid.js";
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
const gameGrid = new GameGrid(PUZZLE_SIZE);
const gridTiles = gameGrid.getTiles();
const buffers = initBuffers(gl, gameGrid);

// init video texture
const videoRef = video.setupVideo("testVideo.mp4");
const texture = video.initTexture(gl);

// add pointer listener to the canvas
addPointerListenerOn(gl, canvas, gameGrid);

let lastFrameTime = performance.now();

// render the scene
const render = () => {
  let now = performance.now();
  let deltaTime = now - lastFrameTime;
  lastFrameTime = now;

  video.updateTexture(gl, texture, videoRef);
  gameGrid.updateAnimations(deltaTime);
  drawScene(gl, programInfo, buffers, gridTiles);
  requestAnimationFrame(render);
};

requestAnimationFrame(render);
