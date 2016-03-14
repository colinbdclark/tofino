precision lowp float;

uniform sampler2D topSampler;
uniform sampler2D bottomSampler;
uniform vec2 textureSize;
uniform float layerBlend;
uniform float differenceBlend;

float luma (vec4 fragment) {
    return (fragment.r * 0.2126) + (fragment.g * 0.7152) + (fragment.b * 0.0722);
}

vec4 scaleColorChannels (vec4 fragment, float scale) {
    return vec4(fragment.r * scale, fragment.g * scale, fragment.b * scale, 1.0);
}

vec4 alpha(vec4 fragment, float alpha) {
    return vec4(fragment.r, fragment.g, fragment.b, alpha);
}

vec4 overlay(vec4 topFrag, vec4 bottomFrag, float blend) {
    return mix(topFrag, bottomFrag, blend);
}

vec4 differenceMix(vec4 topFrag, vec4 bottomFrag) {
    // Difference compositing in full colour.
    vec3 colorDiff = abs(vec3(topFrag.rgb - bottomFrag.rgb));
    vec3 mixed = mix(topFrag.rgb, bottomFrag.rgb, colorDiff);
    return vec4(mixed, 1.0);
}

vec4 difference(vec4 topFrag, vec4 bottomFrag) {
    vec3 diff = vec3(topFrag.rgb - bottomFrag.rgb);
    return vec4(diff, 1.0);
}

vec4 weirdDiffMix(vec4 topFrag, vec4 bottomFrag) {
    // Some strange variations on the above.
    // float diff = abs(topLum - bottomLum);
    // float recipDiff = 1.0 - diff;
    // vec4 topComp = scaleColorChannels(topFrag, diff);
    // vec4 bottomComp = scaleColorChannels(bottomFrag, recipDiff);
    vec3 colorDiff = abs(vec3(topFrag.rgb - bottomFrag.rgb));
    vec3 recipColorDiff = abs(vec3(bottomFrag.rgb - topFrag.rgb));

    return mix(topFrag, bottomFrag, vec4(colorDiff, 1.0) + vec4(recipColorDiff, 1.0));
    //return (vec4(topFrag.rgb - colorDiff, 1.0) + vec4(bottomFrag.rgb - recipColorDiff, 1.0)) * 0.5;
    //vec4(topFrag.r - diff, topFrag.g - diff, topFrag.b - diff, 1.0) + fullColorDiff;
}

void main(void) {
    vec2 coords = vec2(gl_FragCoord.x / textureSize.x, gl_FragCoord.y / textureSize.y);
    vec4 topFrag = texture2D(topSampler, coords);
    vec4 bottomFrag = texture2D(bottomSampler, coords);

    vec4 overlaid = overlay(topFrag, bottomFrag, layerBlend);
    vec4 difference = weirdDiffMix(topFrag, bottomFrag);
    gl_FragColor = vec4(mix(overlaid.rgb, difference.rgb, differenceBlend), 1.0);
    // It looks quite good.

    // Difference-based compositing:
    // float topLum = luma(topFrag);
    // float bottomLum = luma(bottomFrag);
    // float diff = abs(topLum - bottomLum);
    // float recipDiff = 1.0 - diff;
    // gl_FragColor = scaleColorChannels(topFrag, diff) + scaleColorChannels(bottomFrag, recipDiff);


    // This is weird and cool but probably not what I want.
    // float threshold = 0.5;
    // if (diff >= threshold) {
    //     gl_FragColor = bottomFrag;
    // } else {
    //     gl_FragColor = mix(topFrag, bottomFrag, smoothstep(0.01, threshold + (threshold / 2.0), diff));
    // }
}
