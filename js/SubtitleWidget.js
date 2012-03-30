/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011-2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {
    fluid.setLogging(false);

    /*******************************************************************************
     * Subtitle Widget                                                             *
     *                                                                             *
     * Attach itself onto the provided video container that allows users to add or * 
     * select subtitles.                                                           *
     *******************************************************************************/
    
    /**
     * Video player renders HTML 5 video content and degrades gracefully to an alternative.
     * 
     * @param {Object} container the container in which video and (optionally) captions are displayed
     * @param {Object} options configuration options for the component
     */

    fluid.defaults("fluid.subtitleWidget", {
        gradeNames: ["fluid.eventedComponent", "fluid.modelComponent", "autoInit"],
        components: {
            renderWidget: {
                type: "fluid.subtitleWidget.renderWidget",
                container: "{videoPlayer}.dom.video",
                createOnEvent: "onCreateMediaReady",
                priority: "first",
                options: {
                    model: "{videoPlayer}.model",
                    applier: "{videoPlayer}.applier",
                    events: {
                        onMediaReady: "{videoPlayer}.events.onMediaReady"
                    },
                    sources: "{videoPlayer}.options.video.sources"
                }
            }
        },
        finalInitFunction: "fluid.subtitleWidget.finalInit",
        events: {
            onReady: null,
        },
        selectors: {
            videoPlayer: ".flc-videoPlayer-main",
            video: ".flc-videoPlayer-video",
            caption: ".flc-videoPlayer-captionArea",
            controllers: ".flc-videoPlayer-controller",
            transcript: ".flc-videoPlayer-transcriptArea",
            overlay: ".flc-videoPlayer-overlay"
        },
        strings: {
            captionsOff: "Captions OFF",
            turnCaptionsOff: "Turn Captions OFF",
            transcriptsOff: "Transcripts OFF",
            turnTranscriptsOff: "Turn Transcripts OFF"
        },
        model: {
        },
        templates: {
            subtitleWidget: {   // ToDo: get rid of "subtitleWidget" key as subtitle widget component only has one template
                forceCache: true,
                href: "../html/SubtitleWidget_template.html"
            }
        }
    });

    fluid.subtitleWidget.produceTree = function (that) {
        var tree = {};
        
        if (fluid.hasFeature("fluid.browser.html5") && that.options.controls === "native") {
            // Use browser built-in video player
            tree.video = {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        controls: "true"
                    }
                }]
            };
        } else if (that.canRenderMedia(that.options.video.sources)) {
            // Keep the selector to render "fluid.subtitleWidget.media"
            that.options.selectorsToIgnore.push("video");
        }
        
        // Keep the selector to render "fluid.subtitleWidget.controllers"
        if (that.canRenderControllers(that.options.controls)) {
            that.options.selectorsToIgnore.push("controllers");
        }
        
        return tree;
    };

    fluid.subtitleWidget.finalInit = function (that) {
        that.container.attr("role", "application");

        // Render each media source with its custom renderer, registered by type.
        // If we aren't on an HTML 5 video-enabled browser, don't bother setting up the controller, captions or transcripts.

        fluid.fetchResources(that.options.templates, function (res) {
            var fetchFailed = false;
            for (var key in res) {
                if (res[key].fetchError) {
                    fluid.log("couldn't fetch" + res[key].href);
                    fluid.log("status: " + res[key].fetchError.status +
                        ", textStatus: " + res[key].fetchError.textStatus +
                        ", errorThrown: " + res[key].fetchError.errorThrown);
                    that.events.onTemplateLoadError.fire(res[key].href);
                    fetchFailed = true;
                } else if (key === "subtitleWidget") { // ToDo: remove the "else if" when "subtitleWidget" key is removed
                    // ToDo: create the wrapper for subtitle widget template + the video (that.container)
                }
            }

            that.events.onReady.fire(that);
        });
        
        return that;
    };
        
    /*********************************************************************************
     * Event Binder:                                                                 *
     * Shared by all video player component whenever an event binder component is    *
     * needed                                                                        *
     *********************************************************************************/
        
    fluid.defaults("fluid.subtitleWidget.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });

    /*********************************************************************************
     * Demands blocks for event binding components                                   *
     *********************************************************************************/
    
    fluid.demands("mediaEventBinder", ["fluid.subtitleWidget.media", "fluid.subtitleWidget"], {
        options: {
            listeners: {
                "{videoPlayer}.events.onScrub": "{media}.setTime",
                "{videoPlayer}.events.onViewReady": "{media}.refresh",
                "{videoPlayer}.events.onTimeChange": "{media}.updateCurrentTime",
                "{videoPlayer}.events.onTranscriptElementChange": "{media}.setTime"
            }
        }
    });

})(jQuery);
