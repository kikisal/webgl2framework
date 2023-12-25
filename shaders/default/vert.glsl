#version 300 es

layout (location = 0) in vec3 aPosition;

out vec3 fragLocalPos;

void main() {
    gl_Position  = vec4(aPosition, 1.0f);
    fragLocalPos = aPosition;
}