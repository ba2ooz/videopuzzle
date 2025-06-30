#version 300 es

in vec4 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;

out highp vec2 vTextureCoord;

void main(void) {
    gl_Position = uProjectionMatrix * uModelMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
}