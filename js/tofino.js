(function () {
    "use strict";

    flock.init();

    fluid.defaults("colin.tofino", {
        gradeNames: [
            "aconite.animator.playable",
            "aconite.animator.debugging",
            "aconite.videoSequenceCompositor"
        ],

        fps: 60,

        model: {
            layerBlend: 0,
            diffBlend: 0
        },

        uniformModelMap: {
            layerBlend: "layerBlend",
            diffBlend: "diffBlend"
        },

        components: {
            clock: {
                options: {
                    freq: "{tofino}.options.fps"
                }
            },

            glRenderer: {
                type: "colin.tofino.glRenderer"
            },

            playButton: {
                options: {
                    playDelay: 2
                }
            },

            top: {
                type: "colin.tofino.topSequencer"
            },

            bottom: {
                type: "colin.tofino.bottomSequencer"
            },

            speedModulator: {
                type: "colin.tofino.videoSpeedModulator"
            },

            blendModulator: {
                type: "colin.tofino.videoBlendModulator"
            },

            diffBlendModulator: {
                type: "colin.tofino.videoDiffBlendModulator"
            }
        }
    });

    colin.tofino.updateUniformModelValue = function (that, tofino, modelPath) {
        // This wasn't working as a relay! Why not?
        that.value();
        fluid.set(tofino.model, modelPath, that.model.value);
    };


    fluid.defaults("colin.tofino.glRenderer", {
        gradeNames: "aconite.videoCompositor.glRenderer",

        shaders: {
            fragment: "shaders/tofino-shader.frag",
            vertex: "node_modules/aconite/src/shaders/stageVertexShader.vert"
        },

        uniforms: {
            layerBlend: {
                type: "f",
                value: 0.0
            },

            diffBlend: {
                type: "f",
                value: 0.0
            }
        }
    });


    fluid.defaults("colin.tofino.sequencer", {
        gradeNames: "aconite.clipSequencer.static",

        clip: {
            url: "videos/tofino-h264-web.mp4",
            inTime: "00:00:00",
            outTime: "00:28:36"
        },

        model: {
            clipSequence: [
                "{that}.options.clip"
            ]
        }
    });


    fluid.defaults("colin.tofino.topSequencer", {
        gradeNames: "colin.tofino.sequencer",

        components: {
            layer: {
                type: "aconite.videoCompositor.topLayer"
            }
        }
    });


    fluid.defaults("colin.tofino.bottomSequencer", {
        gradeNames: "colin.tofino.sequencer",

        components: {
            layer: {
                type: "aconite.videoCompositor.bottomLayer"
            }
        }
    });

    fluid.defaults("colin.tofino.videoSpeedModulator", {
        gradeNames: "flock.synth.frameRate",

        fps: "{tofino}.options.fps",

        synthDef: {
            ugen: "flock.ugen.triOsc",
            phase: -(Math.PI / 2),
            freq: 1/360,
            mul: 0.5,
            add: 1
        },

        components: {
            topVideo: "{top}.layer.source",
            bottomVideo: "{bottom}.layer.source"
        },

        listeners: {
            "{clock}.events.onTick": [
                "colin.tofino.videoSpeedModulator.modulateSpeed({that})"
            ]
        }
    });

    // TODO: Modelize this.
    colin.tofino.videoSpeedModulator.modulateSpeed = function (that) {
        var val = that.value();
        that.bottomVideo.element.playbackRate = val;
    };

    fluid.defaults("colin.tofino.videoBlendModulator", {
        gradeNames: ["flock.synth.frameRate"],

        fps: "{tofino}.options.fps",

        wavetableSize: 8192,

        members: {
            wavetable: {
                expander: {
                    funcName: "colin.tofino.videoBlendModulator.createWaveform",
                    args: ["{that}.options.wavetableSize", "{that}.options.wavetableSegments"]
                }
            }
        },

        model: {
            value: 0.5
        },

        synthDef: {
            id: "osc",
            ugen: "flock.ugen.osc",
            inputs: {
                freq: {
                    ugen: "flock.ugen.envGen",
                    gate: 1.0,
                    envelope: {
                        levels: [1/15, 1/15, 1/7.5, 1/15, 1/30],
                        times: [5 * 60, 8 * 60, 5 * 60, 60]
                    }
                },
                mul: {
                    ugen: "flock.ugen.envGen",
                    gate: 1.0,
                    envelope: {
                        levels: [0.3, 0.3, 0.2, 0.3, 0.5],
                        times: [7 * 60, 5 * 60, 4 * 60, 3 * 60 + 30]
                    }
                },
                add: 0.5,
                table: "{that}.wavetable"
            }
        },

        listeners: {
            "{clock}.events.onTick": [
                "colin.tofino.updateUniformModelValue({that}, {tofino}, layerBlend)"
            ]
        },

        wavetableSegments: [
            {
                type: "constant",
                start: 0.0,
                end: 0.0
            },
            {
                type: "linear",
                start: 0.0,
                end: 1.0
            },
            {
                type: "constant",
                start: 1.0,
                end: 1.0
            },
            {
                type: "linear",
                start: 1.0,
                end: 0.0
            },
            {
                type: "constant",
                start: 0.0,
                end: 0.0
            },
            {
                type: "linear",
                start: 0.0,
                end: -1.0
            },
            {
                type: "constant",
                start: -1.0,
                end: -1.0
            },
            {
                type: "linear",
                start: -1.0,
                end: 0.0
            }
        ]
    });

    colin.tofino.videoBlendModulator.createWaveform = function (wavetableSize, wavetableSegments) {
        var numSegSamps = wavetableSize / wavetableSegments.length,
            buffer = new Float32Array(wavetableSize),
            startIdx = 0;

        for (var i = 0; i < wavetableSegments.length; i++) {
            var segmentSpec = wavetableSegments[i],
                endIdx = startIdx + numSegSamps;

            flock.fillBufferWithLine(segmentSpec.type,
                buffer, segmentSpec.start, segmentSpec.end, startIdx, endIdx);

            startIdx = endIdx;
        }

        return buffer;
    };


    fluid.defaults("colin.tofino.videoDiffBlendModulator", {
        gradeNames: ["flock.synth.frameRate"],

        fps: "{tofino}.options.fps",

        model: {
            value: 0.0
        },

        synthDef: {
            id: "line",
            ugen: "flock.ugen.xLine",
            inputs: {
                start: 0.00000001,
                end: 1.0,
                duration: 17 * 60 + 10
            }
        },

        listeners: {
            "{clock}.events.onTick": [
                "colin.tofino.updateUniformModelValue({that}, {tofino}, diffBlend)"
            ]
        }
    });
}());
