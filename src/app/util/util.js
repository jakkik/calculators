const zeroPadding = "0000000000000000000000000000000000000"

export function zeroPad(str, len, padRight) {
    if (!padRight) {
        return (zeroPadding + str).slice(-len)
    } else {
        return (str + zeroPadding).substring(0, len)
    }
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

export function isDefined(value) {
    return value !== undefined && value !== null
}

export function isNumber(value) {
    return value !== undefined && value !== null && typeof value == "number"
}

export function isString(value) {
    return value !== undefined && value !== null && typeof value == "string"
}

export function noop() {}

export function toUpperCase(value) { return typeof value === "string" ? value.toUpperCase() : undefined }

export function identity(value) { return value }

export function nonEmpty(value) {
    return value && value.length && value.length > 0
}

export function combine(a, b) {
    return `${a}${b}`
}

export function combineWith(separator) {
    return (a, b) => `${a}${separator}${b}`
}

export function reverse(value) {
   return value.split("").reverse().join("")
}

const consoleMethods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
]

// Avoid `console` errors in browsers that lack a console.
export function fixConsole() {

    var length = consoleMethods.length
    var console = (window.console = window.console || {})

    while (length--) {
        const method = consoleMethods[length]

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop
        }
    }
}
