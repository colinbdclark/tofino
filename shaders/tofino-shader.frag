precision highp float;

uniform sampler2D topSampler;
uniform sampler2D bottomSampler;
uniform vec2 textureSize;

float luma (vec4 fragment) {
    return (fragment.r * 0.2126) + (fragment.g * 0.7152) + (fragment.b * 0.0722);
}

void main(void) {
    vec2 coords = vec2(gl_FragCoord.x / textureSize.x, gl_FragCoord.y / textureSize.y);
    vec4 topFrag = texture2D(topSampler, coords);
    vec4 bottomFrag = texture2D(bottomSampler, coords);

    float topLum = luma(topFrag);
    float bottomLum = luma(bottomFrag);
    float diff = (topLum - bottomLum);
    float recipDiff = 1.0 - diff;

    vec4 topComp = vec4(topFrag.r * diff, topFrag.g * diff, topFrag.b * diff, 1.0);
    vec4 bottomComp = vec4(bottomFrag.r * recipDiff, bottomFrag.g * recipDiff, bottomFrag.b * recipDiff, 1.0);
    // gl_FragColor = topComp;

    gl_FragColor = (topFrag + bottomFrag) * 0.5;

    // vec4 fullColorDiff = vec4(topFrag.r - bottomFrag.r, topFrag.g - bottomFrag.g, topFrag.b - bottomFrag.b, 1.0);
    // gl_FragColor = vec4(topFrag.r - diff, topFrag.g - diff, topFrag.b - diff, 1.0) + fullColorDiff;

    // gl_FragColor = topComp * 0.5 + bottomComp * 0.5;
}
