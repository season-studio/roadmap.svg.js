/**
 * setter for the attribute
 * @param {Node} _dom the node of the element
 * @param {String} _key the key of the attribute
 * @param {*} _value the value
 */
function setAttribute(_dom, _key, _value) {
    _dom.setAttribute(_key, _value);
}

/**
 * setter for the style
 * @param {Node} _dom the node of the element
 * @param {String} _key the key of the style
 * @param {*} _value the value
 */
function setStyle(_dom, _key, _value) {
    _dom.style[_key] = _value;
}

/**
 * setter for the text content
 * @param {Node} _dom the node of the element
 * @param {String} _key ignore
 * @param {*} _value the value
 */
function setTextContent(_dom, _key, _value) {
    _dom.textContent = _value;
}

// the exception for drop the setting
export const ERR_DROP = Symbol("roadmap.expression.drop");
// the exception for break the expression
export const ERR_BREAK = Symbol("roadmap.expression.break");
// the exception for break and exit the expression queue
export const ERR_EXIT = Symbol("roadmap.expression.exit");

// the set of the inner exeptions
const InnerExceptions = [ERR_DROP, ERR_BREAK, ERR_EXIT];

// the set of the setters of the controling action
const CtrlSetters = {
    $show: function (_dom, _key, _value) {
        (!_value) && (_dom.remove());
    },
    $break: function (_dom, _key, _value) {
        if (_value) {
            throw ERR_BREAK;
        }
    },
    $exit: function (_dom, _key, _value) {
        if (_value) {
            throw ERR_EXIT;
        }
    }
}

/**
 * the class of Exception for break expression
 * @class
 * @private
 * @param {*} _value the value when break
 * @param {*} _error the error information
 */
function BreakValue(_value, _error) {
    this.value = _value;
    this.error = _error;
}

/**
 * check the value and throw exception if checking fail
 * @param {Array} _args the first element is the value to be check, the second element is the checher function or the stander value
 * @param {*} _error the exception
 * @returns the value or the BreakValue
 * @private
 */
function checkAndThrow(_args, _error) {
    try {
        const { 0: value, 1: check } = _args;
        if (value === check) {
            throw _error;
        } else if (typeof check === "function") {
            if (check(value)) {
                throw _error;
            }
        } else if ((_args.length <= 1) && (!value)) {
            throw _error;
        }
        return value;
    } catch (error) {
        if (error instanceof BreakValue) {
            return error;
        } else {
            throw error;
        }
    }
}

// the object assigned to the $ symbol in the expression
const CtrlGlobal = {
    break: function (_value, _check) {
        return checkAndThrow(arguments, new BreakValue(_value, ERR_BREAK));
    },
    exit: function (_value, _check) {
        return checkAndThrow(arguments, new BreakValue(_value, ERR_EXIT));
    },
    drop: function (_value, _check) {
        return checkAndThrow(arguments, ERR_DROP);
    },
}

/**
 * process the expressions, the this value should be the list expression
 * @param {Node} _dom the node of the element
 * @param {*} _project the information of the project
 * @param {*} _item the item information of the project
 * @param {*} _layout the information of the layout
 * @returns the exception when process expressions
 * @private
 */
function processExpressions(_dom, _project, _item, _layout) {
    try {
        this.forEach(({fn, setter, key, expression}) => {
            try {
                if (typeof fn === "function") {
                    const result = fn.call(_dom, _project, _item, _layout, CtrlGlobal);
                    if (result instanceof BreakValue) {
                        (typeof setter === "function") && setter(_dom, key, result.value);
                        throw result.error;
                    } else {
                        (typeof setter === "function") && setter(_dom, key, result);
                    }
                }
            } catch (error) {
                if (InnerExceptions.includes(error)) {
                    if (error !== ERR_DROP) {
                        throw error;
                    }
                } else {
                    console.error("[Dynamic Expression Run Fail]", expression);
                    console.error(error);
                }
            }
        });
    } catch (error) {
        return error;
    }
}

/**
 * parse the expressions
 * @param {String} _expressionLine the text of the expression 
 * @returns {Function} the instance of the function processing the expression
 */
export function parseExpression(_expressionLine) {
    const expressionList = String(_expressionLine).split(";").map(item => {
        item = item.trim();
        if (item) {
            let {0: key, 1:expression } = item.split(/(?<!\=[^\=]*)=/);
            key = key.trim();
            let setter;
            if (key === "") {
                setter = undefined;
            } else if (key[0] === "@") {
                setter = setStyle;
                key = key.substr(1);
            } else if (key[0] === "$") {
                setter = CtrlSetters[key];
            } else if (key[0] === ":") {
                setter = setTextContent;
            } else {
                setter = setAttribute;
            }
            try {
                return {
                    fn: new Function("project", "item", "layout", "$", `return (${expression})`),
                    setter,
                    key,
                    expression
                };
            } catch (error) {
                console.error("[Dynamic Expression Parse Fail]", expression);
                return { };
            }
        }
    });
    return processExpressions.bind(expressionList);
}