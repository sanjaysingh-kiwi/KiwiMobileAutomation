#version 100

#ifdef GL_ES
   precision mediump float;
#endif

uniform sampler2D sTexture;

varying vec2 vTexcoord;

void main()
{
   gl_FragColor = texture2D(sTexture, vTexcoord.xy);
}