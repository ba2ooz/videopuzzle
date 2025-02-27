import fragmentShader from "bundle-text:./utils/shader.frag?raw";
import vertexShader from "bundle-text:./utils/shader.vert?raw";

import { GridEventsHandler } from "./puzzle/grid-interactions.js";
import { BuffersManager } from "./graphics/BuffersManager.js";
import { ShaderManager } from "./graphics/ShaderManager.js";
import { SceneManager } from "./graphics/SceneManager.js";
import { GLContext } from "./utils/GLcontext.js";
import { GameGrid } from "./puzzle/grid.js";
import videoUrl from "./testVideo.mp4";

const PUZZLE_SIZE = 4;

// create the game grid
const gameGrid = new GameGrid(PUZZLE_SIZE);
const gridTiles = gameGrid.getTiles();

// get a WebGLRenderingContext to render content
const glContext = new GLContext("#video-canvas");

// init the shader program, buffers and the rendering scene
const buffers = new BuffersManager(glContext.gl, {
  vertices: gameGrid.getVertices(),
  textures: gameGrid.getTextures(),
  indices: gameGrid.getIndices(),
}).getBuffers();
const shaderManager = new ShaderManager(
  glContext.gl,
  vertexShader,
  fragmentShader
);
const sceneManager = new SceneManager(glContext.gl, shaderManager, buffers);

// init video texture
const initVideo = async () => await sceneManager.initVideoTexture(videoUrl);

// add pointer listeners on the canvas
new GridEventsHandler(glContext.canvas, gameGrid);

// render the scene
const renderLoop = () => {
  sceneManager.render(gridTiles, (delta) =>
    gameGrid.updateAnimations(delta)
  );
  requestAnimationFrame(renderLoop);
};

initVideo();
requestAnimationFrame(renderLoop);
