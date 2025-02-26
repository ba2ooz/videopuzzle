import vertexShader from 'bundle-text:./utils/shader.vert?raw';
import fragmentShader from 'bundle-text:./utils/shader.frag?raw';

import { GLContext } from "./utils/GLcontext.js";
import { GridEventsHandler } from "./puzzle/grid-interactions.js";
import { ShaderManager } from "./graphics/ShaderManager.js";
import { GameGrid } from "./puzzle/grid.js";
import { BuffersManager } from "./graphics/BuffersManager.js";
import { drawScene } from "./graphics/scene.js";
import * as video from "./graphics/video.js";
import videoUrl from "./testVideo.mp4";

const PUZZLE_SIZE = 4;

// get a WebGLRenderingContext to render content
const glContext = new GLContext("#video-canvas");

// create the game grid
const gameGrid = new GameGrid(PUZZLE_SIZE);
const gridTiles = gameGrid.getTiles();

// init the shader program and the buffers
const shaderManager = new ShaderManager(glContext.gl, vertexShader, fragmentShader);
const buffers = new BuffersManager(glContext.gl, {
  vertices: gameGrid.getVertices(),
  textures: gameGrid.getTextures(),
  indices: gameGrid.getIndices(),
}).getBuffers();

// init video texture
const videoRef = video.setupVideo(videoUrl);
const texture = video.initTexture(glContext.gl);

// add pointer listeners on the canvas
new GridEventsHandler(glContext.canvas, gameGrid);

let lastFrameTime = performance.now();

// render the scene
const render = () => {
  let now = performance.now();
  let deltaTime = now - lastFrameTime;
  lastFrameTime = now;

  video.updateTexture(glContext.gl, texture, videoRef);
  gameGrid.updateAnimations(deltaTime);
  drawScene(glContext.gl, shaderManager, buffers, gridTiles);
  requestAnimationFrame(render);
};

requestAnimationFrame(render);
