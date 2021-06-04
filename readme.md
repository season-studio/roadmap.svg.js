# roadmap.svg.js
Class for generating the roadmap in webview

# usage
```javascript
var roadmap = new RoadmapSVG(theContainerElement, theTemplateSVGElement);
roadmap.showProject({
    caption: "Project 1",
    items: [{
        text: "step 1",
        startTime: "2021/03/17",
        endTime: "2021/04/26",
        state: "normal",
        progress: 0.6
    }, {
        text: "step 2",
        startTime: "2021/05/07",
        endTime: "2021/06/15",
        state: ""
    }]
}, {
    caption: "Project 1",
    state: "warn",
    items: [{
        text: "step 1",
        startTime: "2021/04/17",
        endTime: "2021/05/26",
        state: "delay",
        progress: 0.1
    }, {
        text: "step 2",
        startTime: "2021/06/01",
        endTime: "2021/07/10",
        state: ""
    }]
});
```