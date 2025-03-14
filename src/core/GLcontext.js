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

  cleanUpWebGLResources() {
    this.cleanup = [
      "Buffer",
      "Framebuffer",
      "Renderbuffer",
      "Program",
      "Shader",
      "Texture",
    ].map((suffix) => {
      const remove = "delete" + suffix;
      const create = "create" + suffix;
      const original = this.gl[create];
      const handles = [];

      this.gl[create] = (...args) => {
        const handle = original.apply(this.gl, args);
        handles.push(handle);
        return handle;
      };

      return { remove, handles };
    });

    this.reset();
  }

  reset() {
    this.cleanup.forEach((kind) => {
      console.log(kind);
      kind.handles.forEach((handle) => this.gl[kind.remove](handle));
      kind.handles.length = 0; // Clear the array after deletion
    });

    const numAttribs = this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS);
    const tmp = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tmp);
    for (let i = 0; i < numAttribs; i++) {
      console.log("buff", i);
      this.gl.disableVertexAttribArray(i);
      this.gl.vertexAttribPointer(i, 4, this.gl.FLOAT, false, 0, 0);
      this.gl.vertexAttrib1f(i, 0);
    }
    this.gl.deleteBuffer(tmp);

    const numTextureUnits = this.gl.getParameter(
      this.gl.MAX_TEXTURE_IMAGE_UNITS
    );
    for (let i = 0; i < numTextureUnits; i++) {
      console.log("tex", i);

      this.gl.activeTexture(this.gl.TEXTURE0 + i);
      this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.useProgram(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);

    this.gl.disable(this.gl.BLEND);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.DITHER);
    this.gl.disable(this.gl.SCISSOR_TEST);
    
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(
      this.gl.COLOR_BUFFER_BIT |
        this.gl.DEPTH_BUFFER_BIT |
        this.gl.STENCIL_BUFFER_BIT
    );
  }

  destroy() {
    this.cleanUpWebGLResources(this.gl);
    this.gl = null;
    this.canvas = null;
    GLContext.instance = null;
  }
}
