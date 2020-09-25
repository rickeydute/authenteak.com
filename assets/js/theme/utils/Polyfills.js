
/** -----------------------------
    IE Polyfills
------------------------------- */

// Custom Event
if (typeof window.CustomEvent === "function") { return false; }
function CustomEvent(event, params) {
	params = params || { bubbles: false, cancelable: false, detail: null };
	var evt = document.createEvent('CustomEvent');
	evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
	return evt;
}
window.CustomEvent = CustomEvent;



// Object Assign
if (typeof Object.assign !== 'function') {
	Object.defineProperty(Object, "assign", {
		value: function assign(target, varArgs) {
			'use strict';
			if (target === null || target === undefined) {
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var to = Object(target);

			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];

				if (nextSource !== null && nextSource !== undefined) {
					for (var nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		},
		writable: true,
		configurable: true
	});
}