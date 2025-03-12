import fragmentShader from "bundle-text:../core/shader.frag?raw";
import vertexShader from "bundle-text:../core/shader.vert?raw";

import { GridEventsHandler } from "./GridEventsHandler.js";
import { BuffersManager } from "../graphics/BuffersManager.js";
import { ShaderManager } from "../graphics/ShaderManager.js";
import { SceneManager } from "../graphics/SceneManager.js";
import { GLContext } from "../core/GLcontext.js";
import { Grid } from "./Grid.js";

const PUZZLE_SIZE = 4;

export class Game {
  constructor(videoUrl) {
    this.videoUrl = videoUrl;

    // get a WebGLRenderingContext to render content
    this.glContext = new GLContext("#video-canvas");

    // create the game grid
    this.gameGrid = new Grid(PUZZLE_SIZE);

    // init the buffers, shader program and the rendering scene
    this.buffersManager = new BuffersManager(this.glContext.gl, {
      vertices: this.gameGrid.getVertices(),
      textures: this.gameGrid.getTextures(),
      indices: this.gameGrid.getIndices(),
    });

    this.shaderManager = new ShaderManager(
      this.glContext.gl,
      vertexShader,
      fragmentShader
    );

    this.sceneManager = new SceneManager(
      this.glContext.gl,
      this.shaderManager,
      this.buffersManager
    );

    // add events listeners on the canvas
    new GridEventsHandler(this.glContext.canvas, this.gameGrid);
  }

  async start() {
    await this.sceneManager.initVideoTexture(this.videoUrl);
    this.loop();
  }

  loop = () => {
    const tiles = this.gameGrid.getTiles();
    this.sceneManager.render(tiles, (delta) =>
      this.gameGrid.updateAnimations(delta)
    );
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    this.glContext.gl = null;
    GLContext.instance = null;
  }
}