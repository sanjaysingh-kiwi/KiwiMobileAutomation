#version 100

uniform mat4 uMVP;

attribute vec3 aVertex;
attribute vec2 aTexcoord;

varying vec2 vTexcoord;

void main(void)
{
   vTexcoord = vec2(aTexcoord.x, 1.0 - aTexcoord.y);

   vec4 pos = vec4(aVertex, 1.0);
   gl_Position = uMVP * pos;
}