(function () {
    "use strict";

    flock.init();

    fluid.defaults("colin.tofino", {
        gradeNames: [
            "aconite.animator.playable",
            "aconite.animator.debugging",
            "aconite.videoSequenceCompositor"
        ],

        fps: 24,

        model: {
            layerBlend: "{blendModulator}.model.value"
        },

        uniformModelMap: {
            layerBlend: "layerBlend"
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
            }
        }
    });


    fluid.defaults("colin.tofino.glRenderer", {
        gradeNames: "aconite.videoCompositor.glRenderer",

        shaders: {
            fragment: "shaders/tofino-shader.frag",
            vertex: "node_modules/aconite/src/shaders/stageVertexShader.vert"
        },

        uniforms: {
            layerBlend: {
                type: "f",
                value: 0
            }
        }
    });


    fluid.defaults("colin.tofino.sequencer", {
        gradeNames: "aconite.clipSequencer.static",

        clip: {
            url: "videos/tofino-h264-web-short-high-quality.mp4",
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
        gradeNames: ["flock.synth.frameRate", "flock.modelSynth"],

        fps: "{tofino}.options.fps",

        model: {
            value: 0.5
        },

        synthDef: {
            id: "osc",
            ugen: "flock.ugen.triOsc",
            freq: 1/30,
            // freq: {
            //     ugen: "flock.ugen.lfNoise",
            //     options: {
            //         interpolation: "linear"
            //     },
            //     freq: 1/20,
            //     mul: 1/150,
            //     add: 1/150 + 1/60
            // },
            mul: 0.40,
            add: 0.50
        },

        listeners: {
            "{clock}.events.onTick": [
                "{videoBlendModulator}.value()"
            ]
        }
    });
}());
