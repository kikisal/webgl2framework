#version 300 es

precision highp float;

out vec4 fragColor;

in vec3 fragLocalPos;


void main() {
    fragColor = vec4(fragLocalPos, 1.0f);
}