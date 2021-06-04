import { assert } from "./toolkits/src/assert";
import { readonlyMember } from "./toolkits/src/readonly";
import NS from "./ns";
import { TimeScales } from "./timeScale";
import { ERR_BREAK, ERR_EXIT, parseExpression } from "./expression";
import defaultSampleProjects from "./sampleProjects";

// private data symbol
const $timeScales = Symbol("roadmap.timeScales");
const $dyncFuns = Symbol("roadmap.dyncFunctions");

/**
 * process the dynamic expression
 * @param {Node} _dom the node the element
 * @param {String} _attrTag the name of the attribute which contains the dynamic expression
 * @param {*} _project the information of the project
 * @param {*} _item the information of the item of the project
 * @param {*} _layout the information of the layout
 * @returns the exception while processing the expression
 * @private
 */
function processDync(_dom, _attrTag, _project, _item, _layout) {
    const fn = this[$dyncFuns].get(_dom.getAttribute(_attrTag));
    return (typeof fn === "function") && fn(_dom, _project, _item, _layout);
}

/**
 * process all the dynamic expressions in the dom tree
 * @param {Node} _dom the node the root element
 * @param {String} _attrTag the name of the attribute which contains the dynamic expression
 * @param {*} _project the information of the project
 * @param {*} _item the information of the item of the project
 * @param {*} _layout the information of the layout
 * @private
 */
function processAllDync(_rootDOM, _attrTag, _project, _item, _layout) {
    [..._rootDOM.querySelectorAll(`[${_attrTag.replace(":", "\\:")}]`)].forEach(dom => {
        const fn = this[$dyncFuns].get(dom.getAttribute(_attrTag));
        (typeof fn === "function") && fn(dom, _project, _item, _layout);
    });
    const fn = this[$dyncFuns].get(_rootDOM.getAttribute(_attrTag));
    (typeof fn === "function") && fn(_rootDOM, _project, _item, _layout);
}

/**
 * show the items of the project
 * @param {Array} _items the items of the project
 * @param {Node} _group the node of the group element as the container of the items
 * @param {*} _project the information of the project
 * @param {*} _layout the information of the layout
 * @private
 */
function showProjectItems(_items, _group, _project, _layout) {
    const template = this.template;
    const itemDOMList = [];
    const oriItemLocalIndex = _layout.itemLocalIndex;
    let subGroupCount = 0;
    _layout.itemLocalIndex = 0;
    // process each item
    _items.forEach((projectItem) => {
        if (projectItem instanceof Array) {
            // if the item is an array means the item has subgroup
            subGroupCount ++;
            const itemDOM = document.createElementNS(NS.SVG, "g");
            if (itemDOM) {
                _group.appendChild(itemDOM);
                itemDOMList.push(itemDOM);
                let itemPos = 0;
                // process each subgroup of the current group
                projectItem.forEach((subItems) => {
                    const subGroup = document.createElementNS(NS.SVG, "g");
                    if (subGroup) {
                        itemDOM.appendChild(subGroup);
                        showProjectItems.call(this, (subItems instanceof Array) ? subItems : [subItems], subGroup, _project, _layout);
                        template.setTransform(subGroup, itemPos, 0);
                        itemPos += template.getSize(subGroup) + this.parameters.itemMargin;
                    }
                });
            }
        } else {
            // process the pure item
            // prepare the layout information
            const startTime = ((typeof projectItem.start === "number") ? projectItem.start : Date.parse(projectItem.start));
            const endTime = ((typeof projectItem.end === "number") ? projectItem.end : Date.parse(projectItem.end));
            const startLayoutScale = this[$timeScales].findItem(startTime);
            // only continue while the starting scale is found
            if (startLayoutScale && (endTime > startTime)) {
                _layout.itemStart = startLayoutScale.getLayoutLocation(startTime);
                const endLayoutScale = this[$timeScales].findItem(endTime);
                if (!endLayoutScale) {
                    _layout.itemEnd = ((endTime >= this[$timeScales].$endTime) ? this[$timeScales].$lastScale.$layoutEnd : startLayoutScale.$layoutStart);
                } else {
                    _layout.itemEnd = endLayoutScale.getLayoutLocation(endTime);
                }
                _layout.itemSize = _layout.itemEnd - _layout.itemStart;

                // template process
                const itemDOM = template.item.cloneNode(true);
                if (itemDOM) {
                    projectItem.id && itemDOM.setAttribute("data-item-id", projectItem.id);
                    _group.appendChild(itemDOM);
                    itemDOMList.push(itemDOM);
                    processAllDync.call(this, itemDOM, "r:dync", _project, projectItem, _layout);
                }
            }
            _layout.itemIndex ++;
        }
        _layout.itemLocalIndex ++;
    });
    
    // centers the item in the group
    const groupSize = (_layout.itemZoneSize = template.getSize(_group));
    if (subGroupCount > 0) {
        itemDOMList.forEach((itemDOM) => {
            const itemSize = template.getSize(itemDOM);
            template.setTransform(itemDOM, (groupSize - itemSize) / 2, 0);
        });
    }

    _layout.itemLocalIndex = oriItemLocalIndex;
}

/**
 * show the caption of the project
 * @param {*} _project the information of the project
 * @param {Node} _group the node of the element as the container of the project
 * @param {*} _layout the information of the layout
 * @private
 */
function showProjectCaption(_project, _group, _layout) {
    const template = this.template;
    const captionDOM = template.caption.cloneNode(true);
    _group.appendChild(captionDOM);

    processAllDync.call(this, captionDOM, "r:dync", _project, {}, _layout);
    const zoneSize = template.getSize(_group);
    const size = template.getSize(captionDOM);
    template.setTransform(captionDOM, (zoneSize - size) / 2, 0);
}

// the functions set of the layout in horizontal or vertical situation
const LayoutHelper = {
    horizontal: {
        getSize: function (_dom) {
            return _dom ? (_dom.getBBox || _dom.getBoundingClientRect).call(_dom, {stroke:true}).height : 0;
        },
        setTransform: function (_dom, _position, _offset) {
            _dom && _dom.setAttribute("transform", `matrix(1,0,0,1,${Number(_offset) || 0},${Number(_position) || 0})`);
        }
    },
    vertical: {
        getSize: function (_dom) {
            return _dom ? (_dom.getBBox || _dom.getBoundingClientRect).call(_dom, {stroke:true}).width : 0;
        },
        setTransform: function (_dom, _position, _offset) {
            _dom && _dom.setAttribute("transform", `matrix(1,0,0,1,${Number(_position) || 0},${Number(_offset) || 0})`);
        }
    }
}

/**
 * pick up the parameters of the template
 * @returns {Object} the paramters object
 * @private
 */
function pickParameters() {
    const projectTemplate = this.template.global;
    let sampleProjects = this.svg.querySelector("[r\\:tag='sample-projects']");
    if (sampleProjects) {
        try {
            sampleProjects = JSON.parse(String(sampleProjects.innerHTML).replace(/(^[^\{]*)|([^\}]*$)/g, ""));
            (sampleProjects instanceof Array) || (sampleProjects = [sampleProjects]);
        } catch {
            sampleProjects = defaultSampleProjects;
        }
    } else {
        sampleProjects = defaultSampleProjects;
    }
    return {
        itemMargin: (Number(projectTemplate.getAttribute("r:item-margin")) || 0),
        projectMargin: (Number(projectTemplate.getAttribute("r:project-margin")) || 0),
        sampleProjects,
        maxZoneSize: (Number(this.zone.getAttribute("r:max-size")) || 0),
        primeDateMap: ((str) => (str && String(str).trim()))(this.zone.getAttribute("r:prime-date-map"))
    };
}

function calcMonthCount(_start, _end) {
    const ret = {};
    if (_start <= _end) {
        const yearEnd = _end.getFullYear();
        const monthEnd = _end.getMonth();
        for(let yearStart = _start.getFullYear(), monthStart = _start.getMonth();
            yearStart <= yearEnd; 
            yearStart++, monthStart = 0) {
            const monthCount = (yearStart < yearEnd) ? (12 - monthStart) : (monthEnd - monthStart + 1);
            ret[yearStart] = monthCount;
        }
    }
    return ret;
}

/**
 * @module Roadmap
 * @example
 * const roadmap = require('roadmap.svg.js')
 */

/**
 * @constructor Roadmap
 * @param {Node} _container the node of the element as the container of the roadmap
 * @param {SVGSVGElement} _svgTemplate an instance of SVG as the template of the roadmap
 * @public
 */
export default class Roadmap {
    static VERSION = __VERSION__;
    static STAMP = `STAMP${__STAMP__ || "no stamp"}`;

    /**
     * create a new instance of a roadmap
     * @constructor Roadmap
     * @param {Node} _container the node of the element as the container of the roadmap
     * @param {SVGSVGElement} _svgTemplate an instance of SVG as the template of the roadmap
     * @public
     */
    constructor(_container, _svgTemplate) {
        assert((_container instanceof Node) && _container.isConnected, "_container must be an Node connected to a DOM tree");
        assert(_svgTemplate instanceof SVGSVGElement, "_svgTemplate must be an instance of <SVG>");

        // render the template into the container
        _container.innerHTML = "";
        _container.appendChild(_svgTemplate);
        
        // pick up the canvas zone, the template zone, and the layout of the time scales
        const zone = _svgTemplate.querySelector("[r\\:tag='roadmap-zone']");
        const projectTemplate = _svgTemplate.querySelector("[r\\:tag='project-template']");
        assert(zone && projectTemplate, "incorrect template");
        readonlyMember(this, $timeScales, new TimeScales(_svgTemplate));

        // parser the dynamic expressions
        const dyncFuncs = new Map();
        [..._svgTemplate.querySelectorAll("[r\\:dync]")].forEach((item, index) => {
            const tag = `dync${index}`;
            dyncFuncs.set(tag, parseExpression(item.getAttribute("r:dync")));
            item.setAttribute("r:dync", tag);
        });
        [..._svgTemplate.querySelectorAll("[r\\:dync-project]")].forEach((item, index) => {
            const tag = `zone${index}`;
            dyncFuncs.set(tag, parseExpression(item.getAttribute("r:dync-project")));
            item.setAttribute("r:dync-project", tag);
        });
        readonlyMember(this, $dyncFuns, dyncFuncs);

        // pickup the template items
        const projectGroup = projectTemplate.querySelector("[r\\:tag='project-group']");
        const caption = projectTemplate.querySelector("[r\\:tag='project-caption']");
        const itemZone = projectTemplate.querySelector("[r\\:tag='project-item-zone']");
        const item = projectTemplate.querySelector("[r\\:tag='project-item']");
        assert(projectGroup && caption && itemZone && item, "incorrect template");
        projectGroup.remove();
        caption.remove();
        itemZone.remove();
        item.remove();
        const helperSelect = LayoutHelper[projectTemplate.getAttribute("r:grow-direction") === "vertical" ? "vertical" : "horizontal"];

        // the global dynamic expression must be pick up after remove the detail template from the global template
        const dyncGlobals = [..._svgTemplate.querySelectorAll("[r\\:dync-global]")];
        dyncGlobals.forEach((item, index) => {
            const tag = `global${index}`;
            dyncFuncs.set(tag, parseExpression(item.getAttribute("r:dync-global")));
            item.setAttribute("r:dync-global", tag);
        });
        projectTemplate.remove();

        readonlyMember(this, {
            svg: _svgTemplate,
            zone,
            template: Object.freeze({
                global: projectTemplate,
                projectGroup,
                caption,
                itemZone,
                item,
                dyncGlobals,
                getSize: helperSelect.getSize,
                setTransform: helperSelect.setTransform
            })
        });

        readonlyMember(this, "parameters", pickParameters.call(this));
    }

    /**
     * get the starting time of the roadmap
     */
    get startTime() {
        return new Date(this[$timeScales].$startTime);
    }

    /**
     * get the ending time of the roadmap
     */
    get endTime() {
        return new Date(this[$timeScales].$endTime);
    }

    /**
     * set the starting time of the roadmap
     */
    set startTime(_value) {
        this[$timeScales].modifyTime(_value);
    }

    /**
     * set the prime date of the roadmap
     * The start day may be map if the roadmap template has the "r:prime-date-map" parameter.
     * This method change the start time of the roadmap without change the display of the time's scale
     * @param {*} _date 
     */
    setPrimeDate(_date) {
        _date = new Date(_date);
        const mapFn = this.parameters.primeDateMap ? new Function("year", "month", "day", `return ${this.parameters.primeDateMap}`) : undefined;
        this.startTime = mapFn ? new Date(mapFn(_date.getFullYear(), _date.getMonth() + 1, _date.getDate())) : _date;
    }

    /**
     * set the time scales
     * @param {Array} _scales the set of the starting times for each time scale, the last one is the ending time of the roadmap
     */
    setTimeScales(_scales) {
        this[$timeScales].setTimeScales(_scales);
    }

    /**
     * restore the default time scales which defined in the template
     */
    restoreTimeScales() {
        this[$timeScales].restoreTimeScales();
    }

    /**
     * set the displaying text of the time scales
     * @param {Array} _layout   the display informations of the time scales. 
     *                          They stored as the struct of the layout. 
     *                          Each item should be an object, in which has "text" property means the displaying text, and "subGroup" property means the child items in the layout tree
     */
    setTimeScalesDisplay(_layout) {
        this[$timeScales].setDisplay(_layout);
    }

    /**
     * restore the default displaying text of the time scales defined in the template
     */
    restoreTimeScalesDisplay() {
        this[$timeScales].restoreDisplay();
    }

    /**
     * clear the content of the roadmap
     */
    clear() {
        this.zone.innerHTML = "";
    }

    /**
     * show the projects in the roadmap
     * @param  {...Object} _projects the set of the projects' information
     * @returns {undefined|Array<Object>} the set of projects' information which don't show in the roadmap, it often occur in the max-size has been specified in the roadmap
     */
    showProject(..._projects) {
        const projectCount = _projects.length;
        if (projectCount > 0) {
            this.clear();
            let groupPos = 0;
            const template = this.template;
            const breakState = {};
            try {
                _projects.forEach((project, projectIndex) => {
                    // prepare the project group
                    const layout = { projectIndex, itemIndex: 0 };
                    const group = template.projectGroup.cloneNode(true);
                    if (group) {
                        this.zone.appendChild(group);
                        // prepare the project zone and item zone
                        const projectZone = group.querySelector("[r\\:tag='project-zone']") || group;
                        const itemZone = template.itemZone.cloneNode(false);
                        projectZone.appendChild(itemZone);
                        // show items of the current project
                        const items = project.items;
                        (items instanceof Array) && showProjectItems.call(this, items, itemZone, project, layout);
                        // show caption of the current project
                        showProjectCaption.call(this, project, projectZone, layout);
                        layout.projectZoneSize = template.getSize(projectZone);
                        // process and layout the project group
                        group.setAttribute("data-project-index", projectIndex);
                        project.id && group.setAttribute("data-project-id", project.id);
                        processAllDync.call(this, group, "r:dync-project", project, {}, layout);
                        layout.projectSize = template.getSize(group);
                        if (this.parameters.maxZoneSize > 0) {
                            const deltaSize = parseInt(this.parameters.maxZoneSize - layout.projectSize - template.getSize(this.zone));
                            if (deltaSize === 0) {
                                (projectIndex < (projectCount - 1)) && (breakState.index = projectIndex + 1);
                            } else if (deltaSize < 0) {
                                group.remove();
                                breakState.index = projectIndex;
                            }
                        }
                        if (group.isConnected) {
                            template.setTransform(group, groupPos, 0);
                            layout.globalZoneSize = template.getSize(this.zone);
                            // process global dynamic expression
                            template.dyncGlobals.forEach(globalDyncItemDom => {
                                const err = processDync.call(this, globalDyncItemDom, "r:dync-global", project, {}, layout);
                                if ((err === ERR_EXIT) && (projectIndex < (projectCount - 1))) {
                                    breakState.index = projectIndex + 1;
                                    throw breakState;
                                }
                            });
                            // calculate the position of the next project
                            groupPos += template.getSize(group) + this.parameters.projectMargin;
                        }
                        if (breakState.index !== undefined) {
                            throw breakState;
                        }
                    }
                });
            } catch (error) {
                if (error === breakState) {
                    return _projects.slice(breakState.index);
                }
            }
        }
    }

    /**
     * show the projects in the roadmap
     * @param {Array<Object>} _projects the set of the projects' information
     * @returns {undefined|Array<Object>} the set of projects' information which don't show in the roadmap, it often occur in the max-size has been specified in the roadmap
     */
    showProjects(_projects) {
        return (_projects instanceof Array) && this.showProject.apply(this, _projects);
    }

    /**
     * show the sample project in the roadmap
     * @returns {undefined|Array<Object>} the set of projects' information which don't show in the roadmap, it often occur in the max-size has been specified in the roadmap
     */
    showSample() {
        return this.showProject.apply(this, this.parameters.sampleProjects);
    }

    /**
     * convert the roadmap to an image object
     * @returns {Promise<Image>} the image of the roadmap
     */
    toImage() {
        return new Promise((resolve, reject) => {
            const serializer = new XMLSerializer();
            const source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(this.svg);
            const image = new Image();
            image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            image.onload = () => resolve(image);
            image.onerror = (e) => reject(e);
        });
    }

    /**
     * convert the roadmap to the data of a image
     * @param {String} _type the type of the image, "png" will be taken as default when ignore this parameter
     * @returns {Promise<String>} the data of the image of the roadmap
     */
    async toImageData(_type) {
        return this.toImage().then(image => {
            const { width, height } = image;
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            context.fillStyle = 'rgba(255,255,255,0)';
            context.fillRect(0, 0, width, height);
            context.drawImage(image, 0, 0);  
            return {
                width,
                height,
                data: canvas.toDataURL(`image/${_type || "png"}`)
            };
        });
    }

    /**
     * Infer the prime year of the given projects
     * @param  {...Object} _projects the set of the projects' information
     * @returns {Number|String} the prime year
     */
    static inferPrimeYear(..._projects) {
        const record = {};

        const processItem = (item) => {
            if (item instanceof Array) {
                item.forEach(processItem);
            } else {
                const monthCountSet = calcMonthCount(new Date(item.start), new Date(item.end));
                for (let year in monthCountSet) {
                    const monthCount = monthCountSet[year];
                    const oldCount = record[year];
                    if (!oldCount || (oldCount < monthCount)) {
                        record[year] = monthCount;
                    }
                }
            }
        };

        _projects.forEach(project => project.items.forEach(processItem));

        let primeYear = Number.MAX_SAFE_INTEGER, monthCount = 0;
        for (let year in record) {
            const newCount = record[year];
            if ((newCount > monthCount) || ((newCount === monthCount) && (year < primeYear))) {
                primeYear = year;
                monthCount = newCount;
            }
        }

        return primeYear;
    }
}