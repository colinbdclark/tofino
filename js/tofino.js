(function () {
    "use strict";

    flock.init();

    fluid.defaults("colin.tofino", {
        gradeNames: [
            "aconite.animator.playable",
            "aconite.animator.debugging",
            "aconite.videoSequenceCompositor"
        ],

        uniformModelMap: {},

        components: {
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
            }
        }
    });


    fluid.defaults("colin.tofino.glRenderer", {
        gradeNames: "aconite.videoCompositor.glRenderer",

        shaders: {
            fragment: "shaders/tofino-shader.frag",
            vertex: "node_modules/aconite/src/shaders/stageVertexShader.vert"
        },

        uniforms: {}
    });


    fluid.defaults("colin.tofino.sequencer", {
        gradeNames: "aconite.clipSequencer.static",

        clip: {
            url: "videos/tofino-h264-web.m4v",
            // inTime: "00:42:09",
            inTime: "00:00:00",
            outTime: "01:18:50"
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

        fps: 60,

        synthDef: {
            ugen:"flock.ugen.print",
            source: {
                ugen: "flock.ugen.triOsc",
                phase: -(Math.PI / 2),
                freq: {
                    ugen: "flock.ugen.line",
                    start: 1/60,
                    end: 1/600,
                    duration: 5 * 60
                },
                mul: 0.5,
                add: 1
            }
        },

        components: {
            topVideo: "{top}.layer.source",
            bottomVideo: "{bottom}.layer.source"
        },

        listeners: {
            "{clock}.events.onTick": "colin.tofino.videoSpeedModulator.modulateSpeed({that})"
        }
    });

    colin.tofino.videoSpeedModulator.modulateSpeed = function (that) {
        var val = that.value();
        that.bottomVideo.element.playbackRate = val;
    };

}());
