#version 300 es

precision mediump float;

in highp vec2 vTextureCoord;
out vec4 fragColor;

uniform sampler2D uSampler;
uniform vec4 uOverlayColor; // RGBA color with transparency

void main(void) {
    vec4 texColor = texture(uSampler, vTextureCoord);
    // blend texture color with overlay color
    vec4 finalColor = mix(texColor, uOverlayColor, uOverlayColor.a);
    fragColor = finalColor;
}