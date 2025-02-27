export class GLContext {
  static instance = null;

  /**
   * Creates an instance of GLContext.
   * If an instance already exists, it returns the existing instance.
   * 
   * @param {string} canvasSelector - The CSS selector for the canvas element.
   * @throws {Error} If the WebGL context is not initialized.
   */
  constructor(canvasSelector) {
    if (GLContext.instance) {
      return GLContext.instance;
    }

    this.canvas = document.querySelector(canvasSelector);
    this.gl = this.canvas.getContext("webgl2");

    if (!this.gl) {
      throw new Error("WebGL context is not initialized");
    }

    GLContext.instance = this;
  }
}

