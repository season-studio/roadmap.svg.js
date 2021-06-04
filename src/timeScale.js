import { assert } from "./toolkits/src/assert";

/**
 * find a time scale item according to the given time
 * @param {Number} _time the given time
 * @returns {Object} the scale item
 */
function findTimeScaleItem(_time) {
    const len = this.length;
    let index = this.$lastLocation;
    let stepIndex = 0;
    do {
        const item = this[index];
        if (_time < item.$startTime) {
            stepIndex || (stepIndex = -1);
        } else if (_time >= item.$endTime) {
            stepIndex || (stepIndex = 1);
        } else {
            this.$lastLocation = index;
            return item;
        }
        index += stepIndex;
    } while((index >= 0) && (index < len));
}

/**
 * get the layout location of the given time
 * @param {Number} _time the given time
 * @returns {Number} the given time
 */
function getLayoutLocation(_time) {
    let deltaTime = _time - this.$startTime;
    const timeLength = this.$timeLength;
    (deltaTime < 0) ? (deltaTime = 0) : ((deltaTime > timeLength) && (deltaTime = timeLength));
    return this.$layoutStart + (this.$layoutSize / timeLength * deltaTime);
}

/**
 * pick up the scale items into an array
 * @param {Array} _layouts the layout storage, may be the $layouts member in the layoutRoot
 * @param {Array} _storage the storage to save the scale items
 */
function pickupTimeScales(_layouts, _storage) {
    let unitCount = 0;
    _layouts.forEach(item => {
        const subLayouts = item.$layouts;
        if (subLayouts instanceof Array) {
            unitCount += pickupTimeScales(subLayouts, _storage);
        } else if (item instanceof Node) {
            unitCount += 
                (item.$layoutUnit = (Number(item.getAttribute("r:time-layout-unit")) || 1));
            isNaN(item.$startTime = Date.parse(item.getAttribute("r:time-start"))) && (item.$startTime = 0);
            isNaN(item.$endTime = Date.parse(item.getAttribute("r:time-end"))) && (item.$endTime = undefined);
            _storage.push(item);
        }
    });
    return unitCount;
}

/**
 * calculate the time data of each scale item
 * @param {Array} _scaleItems 
 */
function calculateTimeScales(_scaleItems) {
    _scaleItems.$lastLocation = 0;
    let endTime = undefined;
    for (let i = _scaleItems.length - 1; i >= 0; i--) {
        const item = _scaleItems[i];
        if (endTime === undefined) {
            endTime = item.$endTime;
        } else {
            item.$endTime = endTime;
            endTime = item.$startTime;
        }
        assert(endTime >= item.$startTime, "end time is less than start time");
        item.$timeLength = item.$endTime - item.$startTime;
    }
}

// the days count of each month
const MonthDays = [31, function (_year) {
    return ((((_year % 4) === 0) && ((_year % 100) !== 0)) || ((_year % 400) === 0)) ? 29 : 28;
}, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * get the count of days of the given month in the given year
 * @param {Number} _year the given year
 * @param {Number} _month the given month
 * @returns {Number}
 */
function getMonthDays(_year, _month) {
    let ret = MonthDays[_month];
    return (typeof ret === "function") ? ret(_year) : ret;
}

/**
 * modify the time scale by special the new starting time
 * @param {*} _startTime 
 */
function modifyTime(_startTime) {
    !(_startTime instanceof Date) && (_startTime = new Date(_startTime));
    const sourceTime = new Date(this[0].$startTime);
    const theYear = _startTime.getFullYear();
    const deltaYear = theYear - sourceTime.getFullYear();
    const theMonth = _startTime.getMonth();
    const deltaMonth = theMonth - sourceTime.getMonth();
    const theDay = _startTime.getDate();
    const isLastDay = (theDay === getMonthDays(theYear, theMonth));
    const destHours = _startTime.getHours();
    const destMin = _startTime.getMinutes();
    const destSec = _startTime.getSeconds();
    const modifyFn = (oriTime) => {
        oriTime = new Date(oriTime);
        const oriMonth = oriTime.getMonth();
        const oriYear = oriTime.getFullYear();
        let destYear = oriYear + deltaYear, destMonth = oriMonth + deltaMonth;
        if (destMonth > 12) {
            destYear += 1;
            destMonth -= 12;
        }
        const destDay = (isLastDay ? getMonthDays(destYear, destMonth) : theDay);
        return (new Date(destYear, destMonth, destDay, destHours, destMin, destSec, 0)).getTime();
    }
    this.forEach(item => {
        item.$startTime = modifyFn(item.$startTime);
    });
    const lastItemIndex = this.length - 1;
    this[lastItemIndex].$endTime = modifyFn(this[lastItemIndex].$endTime);
    calculateTimeScales(this);
}

/**
 * set the time scales by the given values
 * @param {Array} _scales the given scales, the last one is the end-time of the scales
 */
function setTimeScales(_scales) {
    assert(_scales instanceof Array, "the parameter must be an array");
    const count = this.length;
    _scales.map((item, index) => {
        const time = (new Date(item)).getTime();
        if (isNaN(time)) {
            throw `the parameter[${index}] is not avaliable time`;
        }
        return time;
    }).forEach((time, index) => {
        (index < count) ? (this[index].$startTime = time) : (this[count - 1].$endTime = time);
    });
    calculateTimeScales(this);
}

/**
 * restore the time scales to the default value defined in the template
 */
function restoreTimeScales() {
    this.forEach(item => {
        isNaN(item.$startTime = Date.parse(item.getAttribute("r:time-start"))) && (item.$startTime = 0);
        isNaN(item.$endTime = Date.parse(item.getAttribute("r:time-end"))) && (item.$endTime = undefined);
    });
    calculateTimeScales(this);
}

/**
 * set the displaying content of the time scales
 * @param {Array} _destGroup the dest scales
 * @param {Array} _srcGroup the src values
 */
function setTimeScalesDisplay(_destGroup, _srcGroup) {
    (_destGroup instanceof Array) && (_srcGroup instanceof Array) && _srcGroup.forEach((item, index) => {
        if (item != null) {
            _destGroup[index].textContent = ((item.text !== undefined) ? item.text : item);
            item.subGroup && setTimeScalesDisplay(_destGroup.$layouts, item.subGroup);
        }
    });
}

/**
 * restore the default displaying content of the time scales
 * @param {Array} _destGroup the dest scales
 */
function restoreDefaultScalesDisplay(_destGroup) {
    (_destGroup instanceof Array) && _destGroup.forEach(item => {
        item.textContent = item.$defaultText;
        item.$layouts && restoreDefaultScalesDisplay(item.$layouts);
    })
}

/**
 * pick up the global layout of the timescale
 * the reault include the time-scale element in a tree struct and the scale items in an array
 * @param {*} _root 
 * @returns {Object} the layout object {$layouts:[], scaleItems:[]}
 */
export function TimeScales(_root) {
    // pick up each time-scale element into the layout tree
    const timeElements = [..._root.querySelectorAll("[r\\:time]")];
    const rootLayouts = [];
    timeElements.forEach(item => {
        let parent = { $layouts: rootLayouts };
        // build the layout tree according to the r:time attribute
        const tags = String(item.getAttribute("r:time")).split("-");
        const lastPos = tags.length - 1;
        let key, subLayouts;
        for (let i = 0; i < lastPos; i++) {
            key = tags[i];
            subLayouts = (parent.$layouts || (parent.$layouts = []));
            parent = (subLayouts[key] || (subLayouts[key] = {}));
        }
        key = tags[lastPos];
        subLayouts = (parent.$layouts || (parent.$layouts = []));
        const existedItem = subLayouts[key];
        subLayouts[key] = item;
        existedItem && (item.$layouts = existedItem.$layouts);
        // record the default text
        item.$defaultText = item.textContent;
    });
    // pick up the scale items into an array
    const scaleItems = [];
    scaleItems.$unitCount = pickupTimeScales(rootLayouts, scaleItems);
    calculateTimeScales(scaleItems);
    const firstScale = scaleItems[0];
    const lastScale = scaleItems[scaleItems.length - 1];
    Object.defineProperties(this, {
        $layouts: {
            value: rootLayouts,
            writable: false
        },
        $firstScale: {
            value: firstScale,
            writable: false
        },
        $lastScale: {
            value: lastScale,
            writable: false
        },
        $startTime: {
            get: () => firstScale.$startTime
        },
        $endTime: {
            get: () => lastScale.$endTime
        },
        $scaleItems: {
            value: scaleItems,
            writable: false
        }
    });
    this.modifyTime = modifyTime.bind(scaleItems);
    this.setTimeScales = setTimeScales.bind(scaleItems);
    this.restoreTimeScales = restoreTimeScales.bind(scaleItems);
    this.setDisplay = (_layout) => {
        setTimeScalesDisplay(rootLayouts, _layout);
    };
    this.restoreDisplay = () => restoreDefaultScalesDisplay(rootLayouts);
    this.findItem = findTimeScaleItem.bind(scaleItems);

    // calculate the layout size of the each scale item
    const timeScaleElement = _root.querySelector("[r\\:time-scale-size]");
    const timeScaleSize = timeScaleElement ? (timeScaleElement.getBBox || timeScaleElement.getBoundingClientRect).call(timeScaleElement, {stroke:true})[timeScaleElement.getAttribute("r:time-scale-size")] : 0;
    const unitSize = timeScaleSize / scaleItems.$unitCount;
    let startPos = 0;
    scaleItems.forEach(item => {
        item.$layoutSize = unitSize * item.$layoutUnit;
        item.$layoutStart = startPos;
        item.$layoutEnd = (startPos += item.$layoutSize);
        item.getLayoutLocation = getLayoutLocation.bind(item);
    });

    Object.seal(this);
}
