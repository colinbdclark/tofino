precision lowp float;

uniform sampler2D topSampler;
uniform sampler2D bottomSampler;
uniform vec2 textureSize;
uniform float layerBlend;
uniform float diffBlend;

void main(void) {
    vec2 coords = vec2(gl_FragCoord.x / textureSize.x, gl_FragCoord.y / textureSize.y);
    vec4 topFrag = texture2D(topSampler, coords);
    vec4 bottomFrag = texture2D(bottomSampler, coords);

    gl_FragColor = vec4(topFrag.rgb - bottomFrag.rgb, 1.0);
}
