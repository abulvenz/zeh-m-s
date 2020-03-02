// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/mithril/render/vnode.js":[function(require,module,exports) {
"use strict"

function Vnode(tag, key, attrs, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node == null || typeof node === "boolean") return null
	if (typeof node === "object") return node
	return Vnode("#", undefined, undefined, String(node), undefined, undefined)
}
Vnode.normalizeChildren = function(input) {
	var children = []
	if (input.length) {
		var isKeyed = input[0] != null && input[0].key != null
		// Note: this is a *very* perf-sensitive check.
		// Fun fact: merging the loop like this is somehow faster than splitting
		// it, noticeably so.
		for (var i = 1; i < input.length; i++) {
			if ((input[i] != null && input[i].key != null) !== isKeyed) {
				throw new TypeError("Vnodes must either always have keys or never have keys!")
			}
		}
		for (var i = 0; i < input.length; i++) {
			children[i] = Vnode.normalize(input[i])
		}
	}
	return children
}

module.exports = Vnode

},{}],"../node_modules/mithril/render/hyperscriptVnode.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

// Call via `hyperscriptVnode.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript` and `fragment` factories and define this as
// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// module.exports = function(attrs, ...children) {
//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
//     } else {
//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
//         attrs = undefined
//     }
//
//     if (attrs == null) attrs = {}
//     return Vnode("", attrs.key, attrs, children)
// }
module.exports = function() {
	var attrs = arguments[this], start = this + 1, children

	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = this
	}

	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}

	return Vnode("", attrs.key, attrs, children)
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/render/hyperscript.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty

function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}

function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, vnode) {
	var attrs = vnode.attrs
	var children = Vnode.normalizeChildren(vnode.children)
	var hasClass = hasOwn.call(attrs, "class")
	var className = hasClass ? attrs.class : attrs.className

	vnode.tag = state.tag
	vnode.attrs = null
	vnode.children = undefined

	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}

		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
		}

		attrs = newAttrs
	}

	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key]
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null

	if (hasClass) attrs.class = null

	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs
			break
		}
	}

	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		vnode.text = children[0].children
	} else {
		vnode.children = children
	}

	return vnode
}

function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}

	var vnode = hyperscriptVnode.apply(1, arguments)

	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}

	vnode.tag = selector
	return vnode
}

module.exports = hyperscript

},{"../render/vnode":"../node_modules/mithril/render/vnode.js","./hyperscriptVnode":"../node_modules/mithril/render/hyperscriptVnode.js"}],"../node_modules/mithril/render/trust.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/render/fragment.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

module.exports = function() {
	var vnode = hyperscriptVnode.apply(0, arguments)

	vnode.tag = "["
	vnode.children = Vnode.normalizeChildren(vnode.children)
	return vnode
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js","./hyperscriptVnode":"../node_modules/mithril/render/hyperscriptVnode.js"}],"../node_modules/mithril/hyperscript.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./render/hyperscript")

hyperscript.trust = require("./render/trust")
hyperscript.fragment = require("./render/fragment")

module.exports = hyperscript

},{"./render/hyperscript":"../node_modules/mithril/render/hyperscript.js","./render/trust":"../node_modules/mithril/render/trust.js","./render/fragment":"../node_modules/mithril/render/fragment.js"}],"../node_modules/mithril/promise/polyfill.js":[function(require,module,exports) {
"use strict"
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")

	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}

	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}

module.exports = PromisePolyfill

},{}],"../node_modules/mithril/promise/promise.js":[function(require,module,exports) {
var global = arguments[3];
"use strict"

var PromisePolyfill = require("./polyfill")

if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") {
		global.Promise = PromisePolyfill
	} else if (!global.Promise.prototype.finally) {
		global.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = global.Promise
} else {
	module.exports = PromisePolyfill
}

},{"./polyfill":"../node_modules/mithril/promise/polyfill.js"}],"../node_modules/mithril/render/render.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function($window) {
	var $doc = $window && $window.document
	var currentRedraw

	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}

	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}

	//sanity check to discourage people from doing `vnode.state = ...`
	function checkState(vnode, original) {
		if (vnode.state !== original) throw new Error("`vnode.state` must not be modified")
	}

	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode` is the first argument in
	//all lifecycle methods.
	function callHook(vnode) {
		var original = vnode.state
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode, original)
		}
	}

	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": createText(parent, vnode, nextSibling); break
				case "<": createHTML(parent, vnode, ns, nextSibling); break
				case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
				default: createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}
	function createHTML(parent, vnode, ns, nextSibling) {
		var match = vnode.children.match(/^\s*?<(\w+)/im) || []
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match[1]] || "div")
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>"
			temp = temp.firstChild
		} else {
			temp.innerHTML = vnode.children
		}
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		// Capture nodes to remove, so we don't confuse them.
		vnode.instance = []
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			vnode.instance.push(child)
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs = vnode.attrs
		var is = attrs && attrs.is

		ns = getNameSpace(vnode) || ns

		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element

		if (attrs != null) {
			setAttrs(vnode, attrs, ns)
		}

		insertNode(parent, element, nextSibling)

		if (!maybeSetContentEditable(vnode)) {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs)
			}
		}
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		initLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
		}
		else {
			vnode.domSize = 0
		}
	}

	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.

	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.

	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
	// over the new list and for each new vnode, find the corresponding vnode in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
	// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next sibling (cached in the `nextSibling` variable).


	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.

	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length)
		else {
			var isOldKeyed = old[0] != null && old[0].key != null
			var isKeyed = vnodes[0] != null && vnodes[0].key != null
			var start = 0, oldStart = 0
			if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++
			if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++
			if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
			if (isOldKeyed !== isKeyed) {
				removeNodes(parent, old, oldStart, old.length)
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else if (!isKeyed) {
				// Don't index past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length
				// Rewind if necessary to the first non-null index on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart
				for (; start < commonLength; start++) {
					o = old[start]
					v = vnodes[start]
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
					else if (v == null) removeNode(parent, o)
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
				}
				if (old.length > commonLength) removeNodes(parent, old, start, old.length)
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd]
					ve = vnodes[end]
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart]
					v = vnodes[start]
					if (o.key !== v.key) break
					oldStart++, start++
					if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (start === end) break
					if (o.key !== ve.key || oe.key !== v.key) break
					topSibling = getNextSibling(old, oldStart, nextSibling)
					moveNodes(parent, oe, topSibling)
					if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
					if (++start <= --end) moveNodes(parent, o, nextSibling)
					if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldStart++; oldEnd--
					oe = old[oldEnd]
					ve = vnodes[end]
					o = old[oldStart]
					v = vnodes[start]
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
					oe = old[oldEnd]
					ve = vnodes[end]
				}
				if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
						ve = vnodes[i]
						var oldIndex = map[ve.key]
						if (oldIndex != null) {
							pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
							oldIndices[i-start] = oldIndex
							oe = old[oldIndex]
							old[oldIndex] = null
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
							if (ve.dom != null) nextSibling = ve.dom
							matched++
						}
					}
					nextSibling = originalNextSibling
					if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices)
							li = lisIndices.length - 1
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								else {
									if (lisIndices[li] === i - start) li--
									else moveNodes(parent, v, nextSibling)
								}
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode.events = old.events
			if (shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, ns)
		}
		else {
			removeNode(parent, old)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, ns, nextSibling) {
		if (old.children !== vnode.children) {
			removeHTML(parent, old)
			createHTML(parent, vnode, ns, nextSibling)
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
		}
	}
	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns

		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (!maybeSetContentEditable(vnode)) {
			if (old.text != null && vnode.text != null && vnode.text !== "") {
				if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
			}
			else {
				if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
				if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
				updateNodes(element, old.children, vnode.children, hooks, null, ns)
			}
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(parent, old.instance)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null)
		for (; start < end; start++) {
			var vnode = vnodes[start]
			if (vnode != null) {
				var key = vnode.key
				if (key != null) map[key] = start
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequece
	var lisTemp = []
	function makeLisIndices(a) {
		var result = [0]
		var u = 0, v = 0, i = 0
		var il = lisTemp.length = a.length
		for (var i = 0; i < il; i++) lisTemp[i] = a[i]
		for (var i = 0; i < il; ++i) {
			if (a[i] === -1) continue
			var j = result[result.length - 1]
			if (a[j] < a[i]) {
				lisTemp[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				// Fast integer average without overflow.
				// eslint-disable-next-line no-bitwise
				var c = (u >>> 1) + (v >>> 1) + (u & v & 1)
				if (a[result[c]] < a[i]) {
					u = c + 1
				}
				else {
					v = c
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) lisTemp[i] = result[u - 1]
				result[u] = i
			}
		}
		u = result.length
		v = result[u - 1]
		while (u-- > 0) {
			result[u] = v
			v = lisTemp[v]
		}
		lisTemp.length = 0
		return result
	}

	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}

	// This covers a really specific edge case:
	// - Parent node is keyed and contains child
	// - Child is removed, returns unresolved promise in `onbeforeremove`
	// - Parent node is moved in keyed diff
	// - Remaining children still need moved appropriately
	//
	// Ideally, I'd track removed nodes as well, but that introduces a lot more
	// complexity and I'm not exactly interested in doing that.
	function moveNodes(parent, vnode, nextSibling) {
		var frag = $doc.createDocumentFragment()
		moveChildToFrag(parent, frag, vnode)
		insertNode(parent, frag, nextSibling)
	}
	function moveChildToFrag(parent, frag, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				for (var i = 0; i < vnode.instance.length; i++) {
					frag.appendChild(vnode.instance[i])
				}
			} else if (vnode.tag !== "[") {
				// Don't recurse for text nodes *or* elements, just fragments
				frag.appendChild(vnode.dom)
			} else if (vnode.children.length === 1) {
				vnode = vnode.children[0]
				if (vnode != null) continue
			} else {
				for (var i = 0; i < vnode.children.length; i++) {
					var child = vnode.children[i]
					if (child != null) moveChildToFrag(parent, frag, child)
				}
			}
			break
		}
	}

	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}

	function maybeSetContentEditable(vnode) {
		if (vnode.attrs == null || (
			vnode.attrs.contenteditable == null && // attribute
			vnode.attrs.contentEditable == null // property
		)) return false
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
		return true
	}

	//remove
	function removeNodes(parent, vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) removeNode(parent, vnode)
		}
	}
	function removeNode(parent, vnode) {
		var mask = 0
		var original = vnode.state
		var stateResult, attrsResult
		if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
			var result = callHook.call(vnode.state.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				mask = 1
				stateResult = result
			}
		}
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode.attrs.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				// eslint-disable-next-line no-bitwise
				mask |= 2
				attrsResult = result
			}
		}
		checkState(vnode, original)

		// If we can, try to fast-path it and avoid all the overhead of awaiting
		if (!mask) {
			onremove(vnode)
			removeChild(parent, vnode)
		} else {
			if (stateResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 1) { mask &= 2; if (!mask) reallyRemove() }
				}
				stateResult.then(next, next)
			}
			if (attrsResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 2) { mask &= 1; if (!mask) reallyRemove() }
				}
				attrsResult.then(next, next)
			}
		}

		function reallyRemove() {
			checkState(vnode, original)
			onremove(vnode)
			removeChild(parent, vnode)
		}
	}
	function removeHTML(parent, vnode) {
		for (var i = 0; i < vnode.instance.length; i++) {
			parent.removeChild(vnode.instance[i])
		}
	}
	function removeChild(parent, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				removeHTML(parent, vnode)
			} else {
				if (vnode.tag !== "[") {
					parent.removeChild(vnode.dom)
					if (!Array.isArray(vnode.children)) break
				}
				if (vnode.children.length === 1) {
					vnode = vnode.children[0]
					if (vnode != null) continue
				} else {
					for (var i = 0; i < vnode.children.length; i++) {
						var child = vnode.children[i]
						if (child != null) removeChild(parent, child)
					}
				}
			}
			break
		}
	}
	function onremove(vnode) {
		if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode)
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode)
		if (typeof vnode.tag !== "string") {
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}

	//attrs
	function setAttrs(vnode, attrs, ns) {
		for (var key in attrs) {
			setAttr(vnode, key, null, attrs[key], ns)
		}
	}
	function setAttr(vnode, key, old, value, ns) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
		if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
		else if (key === "style") updateStyle(vnode.dom, old, value)
		else if (hasPropertyKey(vnode, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && vnode.dom === activeElement()) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
				/* eslint-enable no-implicit-coercion */
			}
			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
			if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value)
			else vnode.dom[key] = value
		} else {
			if (typeof value === "boolean") {
				if (value) vnode.dom.setAttribute(key, "")
				else vnode.dom.removeAttribute(key)
			}
			else vnode.dom.setAttribute(key === "className" ? "class" : key, value)
		}
	}
	function removeAttr(vnode, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode, key, undefined)
		else if (key === "style") updateStyle(vnode.dom, old, null)
		else if (
			hasPropertyKey(vnode, key, ns)
			&& key !== "className"
			&& !(key === "value" && (
				vnode.tag === "option"
				|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
			))
			&& !(vnode.tag === "input" && key === "type")
		) {
			vnode.dom[key] = null
		} else {
			var nsLastIndex = key.indexOf(":")
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
			if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key)
		}
	}
	function setLateSelectAttrs(vnode, attrs) {
		if ("value" in attrs) {
			if(attrs.value === null) {
				if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
			} else {
				var normalized = "" + attrs.value // eslint-disable-line no-implicit-coercion
				if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
					vnode.dom.value = normalized
				}
			}
		}
		if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined)
	}
	function updateAttrs(vnode, old, attrs, ns) {
		if (attrs != null) {
			for (var key in attrs) {
				setAttr(vnode, key, old && old[key], attrs[key], ns)
			}
		}
		var val
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(vnode, key, val, ns)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode.dom
	}

	//style
	var uppercaseRegex = /[A-Z]/g
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) {
			// Styles are equivalent, do nothing.
		} else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = ""
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = ""
			// Add new style properties
			for (var key in style) {
				var value = style[key]
				if (value != null) element.style.setProperty(normalizeKey(key), String(value))
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key]
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value)
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key))
				}
			}
		}
	}

	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {
		// Save this, so the current redraw is correctly tracked.
		this._ = currentRedraw
	}
	EventDict.prototype = Object.create(null)
	EventDict.prototype.handleEvent = function (ev) {
		var handler = this["on" + ev.type]
		var result
		if (typeof handler === "function") result = handler.call(ev.currentTarget, ev)
		else if (typeof handler.handleEvent === "function") handler.handleEvent(ev)
		if (this._ && ev.redraw !== false) (0, this._)()
		if (result === false) {
			ev.preventDefault()
			ev.stopPropagation()
		}
	}

	//event
	function updateEvent(vnode, key, value) {
		if (vnode.events != null) {
			if (vnode.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = value
			} else {
				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = undefined
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode.events = new EventDict()
			vnode.dom.addEventListener(key.slice(2), vnode.events, false)
			vnode.events[key] = value
		}
	}

	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode)
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		do {
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode.state.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode.dom = old.dom
		vnode.domSize = old.domSize
		vnode.instance = old.instance
		// One would think having the actual latest attributes would be ideal,
		// but it doesn't let us properly diff based on our current internal
		// representation. We have to save not only the old DOM info, but also
		// the attributes used to create it, as we diff *that*, not against the
		// DOM directly (with a few exceptions in `setAttr`). And, of course, we
		// need to save the children and text as they are conceptually not
		// unlike special "attributes" internally.
		vnode.attrs = old.attrs
		vnode.children = old.children
		vnode.text = old.text
		return true
	}

	return function(dom, vnodes, redraw) {
		if (!dom) throw new TypeError("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = activeElement()
		var namespace = dom.namespaceURI

		// First time rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""

		vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
		var prevRedraw = currentRedraw
		try {
			currentRedraw = typeof redraw === "function" ? redraw : undefined
			updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		} finally {
			currentRedraw = prevRedraw
		}
		dom.vnodes = vnodes
		// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
		if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus()
		for (var i = 0; i < hooks.length; i++) hooks[i]()
	}
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/render.js":[function(require,module,exports) {
"use strict"

module.exports = require("./render/render")(window)

},{"./render/render":"../node_modules/mithril/render/render.js"}],"../node_modules/mithril/api/mount-redraw.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(render, schedule, console) {
	var subscriptions = []
	var rendering = false
	var pending = false

	function sync() {
		if (rendering) throw new Error("Nested m.redraw.sync() call")
		rendering = true
		for (var i = 0; i < subscriptions.length; i += 2) {
			try { render(subscriptions[i], Vnode(subscriptions[i + 1]), redraw) }
			catch (e) { console.error(e) }
		}
		rendering = false
	}

	function redraw() {
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	function mount(root, component) {
		if (component != null && component.view == null && typeof component !== "function") {
			throw new TypeError("m.mount(element, component) expects a component, not a vnode")
		}

		var index = subscriptions.indexOf(root)
		if (index >= 0) {
			subscriptions.splice(index, 2)
			render(root, [], redraw)
		}

		if (component != null) {
			subscriptions.push(root, component)
			render(root, Vnode(component), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/mount-redraw.js":[function(require,module,exports) {
"use strict"

var render = require("./render")

module.exports = require("./api/mount-redraw")(render, requestAnimationFrame, console)

},{"./render":"../node_modules/mithril/render.js","./api/mount-redraw":"../node_modules/mithril/api/mount-redraw.js"}],"../node_modules/mithril/querystring/build.js":[function(require,module,exports) {
"use strict"

module.exports = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""

	var args = []
	for (var key in object) {
		destructure(key, object[key])
	}

	return args.join("&")

	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}

},{}],"../node_modules/mithril/pathname/assign.js":[function(require,module,exports) {
"use strict"

module.exports = Object.assign || function(target, source) {
	if(source) Object.keys(source).forEach(function(key) { target[key] = source[key] })
}

},{}],"../node_modules/mithril/pathname/build.js":[function(require,module,exports) {
"use strict"

var buildQueryString = require("../querystring/build")
var assign = require("./assign")

// Returns `path` from `template` + `params`
module.exports = function(template, params) {
	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
		throw new SyntaxError("Template parameter names *must* be separated")
	}
	if (params == null) return template
	var queryIndex = template.indexOf("?")
	var hashIndex = template.indexOf("#")
	var queryEnd = hashIndex < 0 ? template.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = template.slice(0, pathEnd)
	var query = {}

	assign(query, params)

	var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
		delete query[key]
		// If no such parameter exists, don't interpolate it.
		if (params[key] == null) return m
		// Escape normal parameters, but not variadic ones.
		return variadic ? params[key] : encodeURIComponent(String(params[key]))
	})

	// In case the template substitution adds new query/hash parameters.
	var newQueryIndex = resolved.indexOf("?")
	var newHashIndex = resolved.indexOf("#")
	var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
	var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
	var result = resolved.slice(0, newPathEnd)

	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd)
	if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd)
	var querystring = buildQueryString(query)
	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring
	if (hashIndex >= 0) result += template.slice(hashIndex)
	if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex)
	return result
}

},{"../querystring/build":"../node_modules/mithril/querystring/build.js","./assign":"../node_modules/mithril/pathname/assign.js"}],"../node_modules/mithril/request/request.js":[function(require,module,exports) {
"use strict"

var buildPathname = require("../pathname/build")

module.exports = function($window, Promise, oncompletion) {
	var callbackCount = 0

	function PromiseProxy(executor) {
		return new Promise(executor)
	}

	// In case the global Promise is some userland library's where they rely on
	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
	// similar. Let's *not* break them.
	PromiseProxy.prototype = Promise.prototype
	PromiseProxy.__proto__ = Promise // eslint-disable-line no-proto

	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			var promise = new Promise(function(resolve, reject) {
				factory(buildPathname(url, args.params), args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i])
							}
						}
						else data = new args.type(data)
					}
					resolve(data)
				}, reject)
			})
			if (args.background === true) return promise
			var count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}

			return wrap(promise)

			function wrap(promise) {
				var then = promise.then
				// Set the constructor, so engines know to not await or resolve
				// this as a native promise. At the time of writing, this is
				// only necessary for V8, but their behavior is the correct
				// behavior per spec. See this spec issue for more details:
				// https://github.com/tc39/ecma262/issues/1577. Also, see the
				// corresponding comment in `request/tests/test-request.js` for
				// a bit more background on the issue at hand.
				promise.constructor = PromiseProxy
				promise.then = function() {
					count++
					var next = then.apply(promise, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise
			}
		}
	}

	function hasHeader(args, name) {
		for (var key in args.headers) {
			if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
		}
		return false
	}

	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET"
			var body = args.body
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData)
			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")

			var xhr = new $window.XMLHttpRequest(), aborted = false
			var original = xhr, replacedAbort
			var abort = xhr.abort

			xhr.abort = function() {
				aborted = true
				abort.call(this)
			}

			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

			if (assumeJSON && body != null && !hasHeader(args, /^content-type$/i)) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			xhr.responseType = responseType

			for (var key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			xhr.onreadystatechange = function(ev) {
				// Don't throw errors on xhr.abort().
				if (aborted) return

				if (ev.target.readyState === 4) {
					try {
						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
						// When the response type isn't "" or "text",
						// `xhr.responseText` is the wrong thing to use.
						// Browsers do the right thing and throw here, and we
						// should honor that and do the right thing by
						// preferring `xhr.response` where possible/practical.
						var response = ev.target.response, message

						if (responseType === "json") {
							// For IE and Edge, which don't implement
							// `responseType: "json"`.
							if (!ev.target.responseType && typeof args.extract !== "function") response = JSON.parse(ev.target.responseText)
						} else if (!responseType || responseType === "text") {
							// Only use this default if it's text. If a parsed
							// document is needed on old IE and friends (all
							// unsupported), the user should use a custom
							// `config` instead. They're already using this at
							// their own risk.
							if (response == null) response = ev.target.responseText
						}

						if (typeof args.extract === "function") {
							response = args.extract(ev.target, args)
							success = true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						}
						if (success) resolve(response)
						else {
							try { message = ev.target.responseText }
							catch (e) { message = response }
							var error = new Error(message)
							error.code = ev.target.status
							error.response = response
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args, url) || xhr

				// Propagate the `abort` to any replacement XHR as well.
				if (xhr !== original) {
					replacedAbort = xhr.abort
					xhr.abort = function() {
						aborted = true
						replacedAbort.call(this)
					}
				}
			}

			if (body == null) xhr.send()
			else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
			else if (body instanceof $window.FormData) xhr.send(body)
			else xhr.send(JSON.stringify(body))
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				resolve(data)
			}
			script.onerror = function() {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
			}
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName)
			$window.document.documentElement.appendChild(script)
		}),
	}
}

},{"../pathname/build":"../node_modules/mithril/pathname/build.js"}],"../node_modules/mithril/request.js":[function(require,module,exports) {
"use strict"

var PromisePolyfill = require("./promise/promise")
var mountRedraw = require("./mount-redraw")

module.exports = require("./request/request")(window, PromisePolyfill, mountRedraw.redraw)

},{"./promise/promise":"../node_modules/mithril/promise/promise.js","./mount-redraw":"../node_modules/mithril/mount-redraw.js","./request/request":"../node_modules/mithril/request/request.js"}],"../node_modules/mithril/querystring/parse.js":[function(require,module,exports) {
"use strict"

module.exports = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)

	var entries = string.split("&"), counters = {}, data = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""

		if (value === "true") value = true
		else if (value === "false") value = false

		var levels = key.split(/\]\[?|\[/)
		var cursor = data
		if (key.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			if (level === "") {
				var key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = Array.isArray(cursor) ? cursor.length : 0
				}
				level = counters[key]++
			}
			// Disallow direct prototype pollution
			else if (level === "__proto__") break
			if (j === levels.length - 1) cursor[level] = value
			else {
				// Read own properties exclusively to disallow indirect
				// prototype pollution
				var desc = Object.getOwnPropertyDescriptor(cursor, level)
				if (desc != null) desc = desc.value
				if (desc == null) cursor[level] = desc = isNumber ? [] : {}
				cursor = desc
			}
		}
	}
	return data
}

},{}],"../node_modules/mithril/pathname/parse.js":[function(require,module,exports) {
"use strict"

var parseQueryString = require("../querystring/parse")

// Returns `{path, params}` from `url`
module.exports = function(url) {
	var queryIndex = url.indexOf("?")
	var hashIndex = url.indexOf("#")
	var queryEnd = hashIndex < 0 ? url.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/")

	if (!path) path = "/"
	else {
		if (path[0] !== "/") path = "/" + path
		if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1)
	}
	return {
		path: path,
		params: queryIndex < 0
			? {}
			: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
	}
}

},{"../querystring/parse":"../node_modules/mithril/querystring/parse.js"}],"../node_modules/mithril/pathname/compileTemplate.js":[function(require,module,exports) {
"use strict"

var parsePathname = require("./parse")

// Compiles a template into a function that takes a resolved path (without query
// strings) and returns an object containing the template parameters with their
// parsed values. This expects the input of the compiled template to be the
// output of `parsePathname`. Note that it does *not* remove query parameters
// specified in the template.
module.exports = function(template) {
	var templateData = parsePathname(template)
	var templateKeys = Object.keys(templateData.params)
	var keys = []
	var regexp = new RegExp("^" + templateData.path.replace(
		// I escape literal text so people can use things like `:file.:ext` or
		// `:lang-:locale` in routes. This is all merged into one pass so I
		// don't also accidentally escape `-` and make it harder to detect it to
		// ban it from template parameters.
		/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
		function(m, key, extra) {
			if (key == null) return "\\" + m
			keys.push({k: key, r: extra === "..."})
			if (extra === "...") return "(.*)"
			if (extra === ".") return "([^/]+)\\."
			return "([^/]+)" + (extra || "")
		}
	) + "$")
	return function(data) {
		// First, check the params. Usually, there isn't any, and it's just
		// checking a static set.
		for (var i = 0; i < templateKeys.length; i++) {
			if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
		}
		// If no interpolations exist, let's skip all the ceremony
		if (!keys.length) return regexp.test(data.path)
		var values = regexp.exec(data.path)
		if (values == null) return false
		for (var i = 0; i < keys.length; i++) {
			data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1])
		}
		return true
	}
}

},{"./parse":"../node_modules/mithril/pathname/parse.js"}],"../node_modules/mithril/api/router.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var m = require("../render/hyperscript")
var Promise = require("../promise/promise")

var buildPathname = require("../pathname/build")
var parsePathname = require("../pathname/parse")
var compileTemplate = require("../pathname/compileTemplate")
var assign = require("../pathname/assign")

var sentinel = {}

module.exports = function($window, mountRedraw) {
	var fireAsync

	function setPath(path, data, options) {
		path = buildPathname(path, data)
		if (fireAsync != null) {
			fireAsync()
			var state = options ? options.state : null
			var title = options ? options.title : null
			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path)
			else $window.history.pushState(state, title, route.prefix + path)
		}
		else {
			$window.location.href = route.prefix + path
		}
	}

	var currentResolver = sentinel, component, attrs, currentPath, lastUpdate

	var SKIP = route.SKIP = {}

	function route(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		// 0 = start
		// 1 = init
		// 2 = ready
		var state = 0

		var compiled = Object.keys(routes).map(function(route) {
			if (route[0] !== "/") throw new SyntaxError("Routes must start with a `/`")
			if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
				throw new SyntaxError("Route parameter names must be separated with either `/`, `.`, or `-`")
			}
			return {
				route: route,
				component: routes[route],
				check: compileTemplate(route),
			}
		})
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
		var p = Promise.resolve()
		var scheduled = false
		var onremove

		fireAsync = null

		if (defaultRoute != null) {
			var defaultData = parsePathname(defaultRoute)

			if (!compiled.some(function (i) { return i.check(defaultData) })) {
				throw new ReferenceError("Default route doesn't match any known routes")
			}
		}

		function resolveRoute() {
			scheduled = false
			// Consider the pathname holistically. The prefix might even be invalid,
			// but that's not our problem.
			var prefix = $window.location.hash
			if (route.prefix[0] !== "#") {
				prefix = $window.location.search + prefix
				if (route.prefix[0] !== "?") {
					prefix = $window.location.pathname + prefix
					if (prefix[0] !== "/") prefix = "/" + prefix
				}
			}
			// This seemingly useless `.concat()` speeds up the tests quite a bit,
			// since the representation is consistently a relatively poorly
			// optimized cons string.
			var path = prefix.concat()
				.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
				.slice(route.prefix.length)
			var data = parsePathname(path)

			assign(data.params, $window.history.state)

			function fail() {
				if (path === defaultRoute) throw new Error("Could not resolve default route " + defaultRoute)
				setPath(defaultRoute, null, {replace: true})
			}

			loop(0)
			function loop(i) {
				// 0 = init
				// 1 = scheduled
				// 2 = done
				for (; i < compiled.length; i++) {
					if (compiled[i].check(data)) {
						var payload = compiled[i].component
						var matchedRoute = compiled[i].route
						var localComp = payload
						var update = lastUpdate = function(comp) {
							if (update !== lastUpdate) return
							if (comp === SKIP) return loop(i + 1)
							component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
							attrs = data.params, currentPath = path, lastUpdate = null
							currentResolver = payload.render ? payload : null
							if (state === 2) mountRedraw.redraw()
							else {
								state = 2
								mountRedraw.redraw.sync()
							}
						}
						// There's no understating how much I *wish* I could
						// use `async`/`await` here...
						if (payload.view || typeof payload === "function") {
							payload = {}
							update(localComp)
						}
						else if (payload.onmatch) {
							p.then(function () {
								return payload.onmatch(data.params, path, matchedRoute)
							}).then(update, fail)
						}
						else update("div")
						return
					}
				}
				fail()
			}
		}

		// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
		// even if neither `pushState` nor `hashchange` are supported. It's
		// cleared if `hashchange` is used, since that makes it automatically
		// async.
		fireAsync = function() {
			if (!scheduled) {
				scheduled = true
				callAsync(resolveRoute)
			}
		}

		if (typeof $window.history.pushState === "function") {
			onremove = function() {
				$window.removeEventListener("popstate", fireAsync, false)
			}
			$window.addEventListener("popstate", fireAsync, false)
		} else if (route.prefix[0] === "#") {
			fireAsync = null
			onremove = function() {
				$window.removeEventListener("hashchange", resolveRoute, false)
			}
			$window.addEventListener("hashchange", resolveRoute, false)
		}

		return mountRedraw.mount(root, {
			onbeforeupdate: function() {
				state = state ? 2 : 1
				return !(!state || sentinel === currentResolver)
			},
			oncreate: resolveRoute,
			onremove: onremove,
			view: function() {
				if (!state || sentinel === currentResolver) return
				// Wrap in a fragment to preserve existing key semantics
				var vnode = [Vnode(component, attrs.key, attrs)]
				if (currentResolver) vnode = currentResolver.render(vnode[0])
				return vnode
			},
		})
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = "#!"
	route.Link = {
		view: function(vnode) {
			var options = vnode.attrs.options
			// Remove these so they don't get overwritten
			var attrs = {}, onclick, href
			assign(attrs, vnode.attrs)
			// The first two are internal, but the rest are magic attributes
			// that need censored to not screw up rendering.
			attrs.selector = attrs.options = attrs.key = attrs.oninit =
			attrs.oncreate = attrs.onbeforeupdate = attrs.onupdate =
			attrs.onbeforeremove = attrs.onremove = null

			// Do this now so we can get the most current `href` and `disabled`.
			// Those attributes may also be specified in the selector, and we
			// should honor that.
			var child = m(vnode.attrs.selector || "a", attrs, vnode.children)

			// Let's provide a *right* way to disable a route link, rather than
			// letting people screw up accessibility on accident.
			//
			// The attribute is coerced so users don't get surprised over
			// `disabled: 0` resulting in a button that's somehow routable
			// despite being visibly disabled.
			if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
				child.attrs.href = null
				child.attrs["aria-disabled"] = "true"
				// If you *really* do want to do this on a disabled link, use
				// an `oncreate` hook to add it.
				child.attrs.onclick = null
			} else {
				onclick = child.attrs.onclick
				href = child.attrs.href
				child.attrs.href = route.prefix + href
				child.attrs.onclick = function(e) {
					var result
					if (typeof onclick === "function") {
						result = onclick.call(e.currentTarget, e)
					} else if (onclick == null || typeof onclick !== "object") {
						// do nothing
					} else if (typeof onclick.handleEvent === "function") {
						onclick.handleEvent(e)
					}

					// Adapted from React Router's implementation:
					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
					//
					// Try to be flexible and intuitive in how we handle links.
					// Fun fact: links aren't as obvious to get right as you
					// would expect. There's a lot more valid ways to click a
					// link than this, and one might want to not simply click a
					// link, but right click or command-click it to copy the
					// link target, etc. Nope, this isn't just for blind people.
					if (
						// Skip if `onclick` prevented default
						result !== false && !e.defaultPrevented &&
						// Ignore everything but left clicks
						(e.button === 0 || e.which === 0 || e.which === 1) &&
						// Let the browser handle `target=_blank`, etc.
						(!e.currentTarget.target || e.currentTarget.target === "_self") &&
						// No modifier keys
						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
					) {
						e.preventDefault()
						e.redraw = false
						route.set(href, null, options)
					}
				}
			}
			return child
		},
	}
	route.param = function(key) {
		return attrs && key != null ? attrs[key] : attrs
	}

	return route
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js","../render/hyperscript":"../node_modules/mithril/render/hyperscript.js","../promise/promise":"../node_modules/mithril/promise/promise.js","../pathname/build":"../node_modules/mithril/pathname/build.js","../pathname/parse":"../node_modules/mithril/pathname/parse.js","../pathname/compileTemplate":"../node_modules/mithril/pathname/compileTemplate.js","../pathname/assign":"../node_modules/mithril/pathname/assign.js"}],"../node_modules/mithril/route.js":[function(require,module,exports) {
"use strict"

var mountRedraw = require("./mount-redraw")

module.exports = require("./api/router")(window, mountRedraw)

},{"./mount-redraw":"../node_modules/mithril/mount-redraw.js","./api/router":"../node_modules/mithril/api/router.js"}],"../node_modules/mithril/index.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./hyperscript")
var request = require("./request")
var mountRedraw = require("./mount-redraw")

var m = function m() { return hyperscript.apply(this, arguments) }
m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.mount = mountRedraw.mount
m.route = require("./route")
m.render = require("./render")
m.redraw = mountRedraw.redraw
m.request = request.request
m.jsonp = request.jsonp
m.parseQueryString = require("./querystring/parse")
m.buildQueryString = require("./querystring/build")
m.parsePathname = require("./pathname/parse")
m.buildPathname = require("./pathname/build")
m.vnode = require("./render/vnode")
m.PromisePolyfill = require("./promise/polyfill")

module.exports = m

},{"./hyperscript":"../node_modules/mithril/hyperscript.js","./request":"../node_modules/mithril/request.js","./mount-redraw":"../node_modules/mithril/mount-redraw.js","./route":"../node_modules/mithril/route.js","./render":"../node_modules/mithril/render.js","./querystring/parse":"../node_modules/mithril/querystring/parse.js","./querystring/build":"../node_modules/mithril/querystring/build.js","./pathname/parse":"../node_modules/mithril/pathname/parse.js","./pathname/build":"../node_modules/mithril/pathname/build.js","./render/vnode":"../node_modules/mithril/render/vnode.js","./promise/polyfill":"../node_modules/mithril/promise/polyfill.js"}],"../node_modules/tagl/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function noop() {}

function tagl(h) {
  function createProxy(tagName) {
    return new Proxy(noop, {
      apply: (_, __, args) => h(tagName, [], ...args),
      get: (_, className) => {
        const classNames = [className];
        const proxy = new Proxy(noop, {
          get(_, className) {
            classNames.push(className);
            return proxy;
          },

          apply(_, ___, args) {
            return h(tagName, classNames, ...args);
          }

        });
        return proxy;
      }
    });
  }

  return new Proxy(component => createProxy(component), {
    get: (components, tagName) => createProxy(components[tagName] || tagName)
  });
}

var _default = tagl;
exports.default = _default;
},{}],"../node_modules/tagl-mithril/lib/index.js":[function(require,module,exports) {
"use strict";

var _mithril = require("mithril");

var _mithril2 = _interopRequireDefault(_mithril);

var _tagl = require("tagl");

var _tagl2 = _interopRequireDefault(_tagl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var camelToHyphen = function camelToHyphen(s) {
  return s.replace(/([A-Z])/g, function (g) {
    return "-" + g[0].toLowerCase();
  });
};

var tagl_hyperscript = function tagl_hyperscript() {
  return (0, _tagl2.default)(function (tagName, classes) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    var cls = classes.map(camelToHyphen).join(".");
    var fullTagName = cls.length ? [tagName, cls].join(".").replace(".$", "#") : tagName;
    return _mithril2.default.apply(undefined, [fullTagName].concat(args));
  });
};

if (true) {
  module.exports = tagl_hyperscript;
} else {
  module.exports.tagl = tagl_hyperscript;
  module.exports.a = tagl_hyperscript();
  module.exports.abbr = tagl_hyperscript();
  module.exports.acronym = tagl_hyperscript();
  module.exports.address = tagl_hyperscript();
  module.exports.applet = tagl_hyperscript();
  module.exports.area = tagl_hyperscript();
  module.exports.article = tagl_hyperscript();
  module.exports.aside = tagl_hyperscript();
  module.exports.audio = tagl_hyperscript();
  module.exports.b = tagl_hyperscript();
  module.exports.base = tagl_hyperscript();
  module.exports.basefont = tagl_hyperscript();
  module.exports.bdi = tagl_hyperscript();
  module.exports.bdo = tagl_hyperscript();
  module.exports.big = tagl_hyperscript();
  module.exports.blockquote = tagl_hyperscript();
  module.exports.body = tagl_hyperscript();
  module.exports.br = tagl_hyperscript();
  module.exports.button = tagl_hyperscript();
  module.exports.canvas = tagl_hyperscript();
  module.exports.caption = tagl_hyperscript();
  module.exports.center = tagl_hyperscript();
  module.exports.cite = tagl_hyperscript();
  module.exports.code = tagl_hyperscript();
  module.exports.col = tagl_hyperscript();
  module.exports.colgroup = tagl_hyperscript();
  module.exports.datalist = tagl_hyperscript();
  module.exports.dd = tagl_hyperscript();
  module.exports.del = tagl_hyperscript();
  module.exports.details = tagl_hyperscript();
  module.exports.dfn = tagl_hyperscript();
  module.exports.dir = tagl_hyperscript();
  module.exports.div = tagl_hyperscript();
  module.exports.dl = tagl_hyperscript();
  module.exports.dt = tagl_hyperscript();
  module.exports.em = tagl_hyperscript();
  module.exports.embed = tagl_hyperscript();
  module.exports.fieldset = tagl_hyperscript();
  module.exports.figcaption = tagl_hyperscript();
  module.exports.figure = tagl_hyperscript();
  module.exports.font = tagl_hyperscript();
  module.exports.footer = tagl_hyperscript();
  module.exports.form = tagl_hyperscript();
  module.exports.frame = tagl_hyperscript();
  module.exports.frameset = tagl_hyperscript();
  module.exports.h1 = tagl_hyperscript();
  module.exports.h2 = tagl_hyperscript();
  module.exports.h3 = tagl_hyperscript();
  module.exports.h4 = tagl_hyperscript();
  module.exports.h5 = tagl_hyperscript();
  module.exports.h6 = tagl_hyperscript();
  module.exports.head = tagl_hyperscript();
  module.exports.header = tagl_hyperscript();
  module.exports.hgroup = tagl_hyperscript();
  module.exports.hr = tagl_hyperscript();
  module.exports.html = tagl_hyperscript();
  module.exports.i = tagl_hyperscript();
  module.exports.iframe = tagl_hyperscript();
  module.exports.img = tagl_hyperscript();
  module.exports.input = tagl_hyperscript();
  module.exports.ins = tagl_hyperscript();
  module.exports.kbd = tagl_hyperscript();
  module.exports.keygen = tagl_hyperscript();
  module.exports.label = tagl_hyperscript();
  module.exports.legend = tagl_hyperscript();
  module.exports.li = tagl_hyperscript();
  module.exports.link = tagl_hyperscript();
  module.exports.map = tagl_hyperscript();
  module.exports.mark = tagl_hyperscript();
  module.exports.menu = tagl_hyperscript();
  module.exports.meta = tagl_hyperscript();
  module.exports.meter = tagl_hyperscript();
  module.exports.nav = tagl_hyperscript();
  module.exports.noframes = tagl_hyperscript();
  module.exports.noscript = tagl_hyperscript();
  module.exports.object = tagl_hyperscript();
  module.exports.ol = tagl_hyperscript();
  module.exports.optgroup = tagl_hyperscript();
  module.exports.option = tagl_hyperscript();
  module.exports.output = tagl_hyperscript();
  module.exports.p = tagl_hyperscript();
  module.exports.param = tagl_hyperscript();
  module.exports.pre = tagl_hyperscript();
  module.exports.progress = tagl_hyperscript();
  module.exports.q = tagl_hyperscript();
  module.exports.rp = tagl_hyperscript();
  module.exports.rt = tagl_hyperscript();
  module.exports.ruby = tagl_hyperscript();
  module.exports.s = tagl_hyperscript();
  module.exports.samp = tagl_hyperscript();
  module.exports.script = tagl_hyperscript();
  module.exports.section = tagl_hyperscript();
  module.exports.select = tagl_hyperscript();
  module.exports.small = tagl_hyperscript();
  module.exports.source = tagl_hyperscript();
  module.exports.span = tagl_hyperscript();
  module.exports.strike = tagl_hyperscript();
  module.exports.strong = tagl_hyperscript();
  module.exports.style = tagl_hyperscript();
  module.exports.sub = tagl_hyperscript();
  module.exports.summary = tagl_hyperscript();
  module.exports.sup = tagl_hyperscript();
  module.exports.table = tagl_hyperscript();
  module.exports.tbody = tagl_hyperscript();
  module.exports.td = tagl_hyperscript();
  module.exports.textarea = tagl_hyperscript();
  module.exports.tfoot = tagl_hyperscript();
  module.exports.th = tagl_hyperscript();
  module.exports.thead = tagl_hyperscript();
  module.exports.time = tagl_hyperscript();
  module.exports.tr = tagl_hyperscript();
  module.exports.track = tagl_hyperscript();
  module.exports.tt = tagl_hyperscript();
  module.exports.u = tagl_hyperscript();
  module.exports.ul = tagl_hyperscript();
  module.exports.var_ = tagl_hyperscript();
  module.exports.video = tagl_hyperscript();
  module.exports.wbr = tagl_hyperscript();
  module.exports.animate = tagl_hyperscript();
  module.exports.animateMotion = tagl_hyperscript();
  module.exports.animateTransform = tagl_hyperscript();
  module.exports.circle = tagl_hyperscript();
  module.exports.clipPath = tagl_hyperscript();
  module.exports.colorProfile = tagl_hyperscript();
  module.exports.defs = tagl_hyperscript();
  module.exports.desc = tagl_hyperscript();
  module.exports.discard = tagl_hyperscript();
  module.exports.ellipse = tagl_hyperscript();
  module.exports.feBlend = tagl_hyperscript();
  module.exports.feColorMatrix = tagl_hyperscript();
  module.exports.feComponentTransfer = tagl_hyperscript();
  module.exports.feComposite = tagl_hyperscript();
  module.exports.feConvolveMatrix = tagl_hyperscript();
  module.exports.feDiffuseLighting = tagl_hyperscript();
  module.exports.feDisplacementMap = tagl_hyperscript();
  module.exports.feDistantLight = tagl_hyperscript();
  module.exports.feDropShadow = tagl_hyperscript();
  module.exports.feFlood = tagl_hyperscript();
  module.exports.feFuncA = tagl_hyperscript();
  module.exports.feFuncB = tagl_hyperscript();
  module.exports.feFuncG = tagl_hyperscript();
  module.exports.feFuncR = tagl_hyperscript();
  module.exports.feGaussianBlur = tagl_hyperscript();
  module.exports.feImage = tagl_hyperscript();
  module.exports.feMerge = tagl_hyperscript();
  module.exports.feMergeNode = tagl_hyperscript();
  module.exports.feMorphology = tagl_hyperscript();
  module.exports.feOffset = tagl_hyperscript();
  module.exports.fePointLight = tagl_hyperscript();
  module.exports.feSpecularLighting = tagl_hyperscript();
  module.exports.feSpotLight = tagl_hyperscript();
  module.exports.feTile = tagl_hyperscript();
  module.exports.feTurbulence = tagl_hyperscript();
  module.exports.filter = tagl_hyperscript();
  module.exports.foreignObject = tagl_hyperscript();
  module.exports.g = tagl_hyperscript();
  module.exports.hatch = tagl_hyperscript();
  module.exports.hatchpath = tagl_hyperscript();
  module.exports.image = tagl_hyperscript();
  module.exports.line = tagl_hyperscript();
  module.exports.linearGradient = tagl_hyperscript();
  module.exports.marker = tagl_hyperscript();
  module.exports.mask = tagl_hyperscript();
  module.exports.mesh = tagl_hyperscript();
  module.exports.meshgradient = tagl_hyperscript();
  module.exports.meshpatch = tagl_hyperscript();
  module.exports.meshrow = tagl_hyperscript();
  module.exports.metadata = tagl_hyperscript();
  module.exports.mpath = tagl_hyperscript();
  module.exports.path = tagl_hyperscript();
  module.exports.pattern = tagl_hyperscript();
  module.exports.polygon = tagl_hyperscript();
  module.exports.polyline = tagl_hyperscript();
  module.exports.radialGradient = tagl_hyperscript();
  module.exports.rect = tagl_hyperscript();
  module.exports.set = tagl_hyperscript();
  module.exports.solidcolor = tagl_hyperscript();
  module.exports.stop = tagl_hyperscript();
  module.exports.svg = tagl_hyperscript();
  module.exports.switch_ = tagl_hyperscript();
  module.exports.symbol = tagl_hyperscript();
  module.exports.text = tagl_hyperscript();
  module.exports.textPath = tagl_hyperscript();
  module.exports.tspan = tagl_hyperscript();
  module.exports.unknown = tagl_hyperscript();
  module.exports.use = tagl_hyperscript();
  module.exports.view = tagl_hyperscript();
  module.exports.math = tagl_hyperscript();
  module.exports.maction = tagl_hyperscript();
  module.exports.maligngroup = tagl_hyperscript();
  module.exports.malignmark = tagl_hyperscript();
  module.exports.menclose = tagl_hyperscript();
  module.exports.merror = tagl_hyperscript();
  module.exports.mfenced = tagl_hyperscript();
  module.exports.mfrac = tagl_hyperscript();
  module.exports.mglyph = tagl_hyperscript();
  module.exports.mi = tagl_hyperscript();
  module.exports.mlabeledtr = tagl_hyperscript();
  module.exports.mlongdiv = tagl_hyperscript();
  module.exports.mmultiscripts = tagl_hyperscript();
  module.exports.mn = tagl_hyperscript();
  module.exports.mo = tagl_hyperscript();
  module.exports.mover = tagl_hyperscript();
  module.exports.mpadded = tagl_hyperscript();
  module.exports.mphantom = tagl_hyperscript();
  module.exports.mroot = tagl_hyperscript();
  module.exports.mrow = tagl_hyperscript();
  module.exports.ms = tagl_hyperscript();
  module.exports.mscarries = tagl_hyperscript();
  module.exports.mscarry = tagl_hyperscript();
  module.exports.msgroup = tagl_hyperscript();
  module.exports.msline = tagl_hyperscript();
  module.exports.mspace = tagl_hyperscript();
  module.exports.msqrt = tagl_hyperscript();
  module.exports.msrow = tagl_hyperscript();
  module.exports.mstack = tagl_hyperscript();
  module.exports.mstyle = tagl_hyperscript();
  module.exports.msub = tagl_hyperscript();
  module.exports.msup = tagl_hyperscript();
  module.exports.msubsup = tagl_hyperscript();
  module.exports.mtable = tagl_hyperscript();
  module.exports.mtd = tagl_hyperscript();
  module.exports.mtext = tagl_hyperscript();
  module.exports.mtr = tagl_hyperscript();
  module.exports.munder = tagl_hyperscript();
  module.exports.munderover = tagl_hyperscript();
  module.exports.semantics = tagl_hyperscript();
  module.exports.annotation = tagl_hyperscript();
  module.exports.annotationXml = tagl_hyperscript();
  module.exports.m = _mithril2.default;
}
},{"mithril":"../node_modules/mithril/index.js","tagl":"../node_modules/tagl/index.js"}],"tags.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sub = exports.style = exports.strong = exports.strike = exports.span = exports.source = exports.small = exports.select = exports.section = exports.script = exports.samp = exports.s = exports.ruby = exports.rt = exports.rp = exports.q = exports.progress = exports.pre = exports.param = exports.p = exports.output = exports.option = exports.optgroup = exports.ol = exports.object = exports.noscript = exports.noframes = exports.nav = exports.meter = exports.meta = exports.menu = exports.mark = exports.map = exports.link = exports.li = exports.legend = exports.label = exports.keygen = exports.kbd = exports.ins = exports.input = exports.img = exports.iframe = exports.i = exports.html = exports.hr = exports.hgroup = exports.header = exports.head = exports.h6 = exports.h5 = exports.h4 = exports.h3 = exports.h2 = exports.h1 = exports.frameset = exports.frame = exports.form = exports.footer = exports.font = exports.figure = exports.figcaption = exports.fieldset = exports.embed = exports.em = exports.dt = exports.dl = exports.div = exports.dir = exports.dfn = exports.details = exports.del = exports.dd = exports.datalist = exports.colgroup = exports.col = exports.code = exports.cite = exports.center = exports.caption = exports.canvas = exports.button = exports.br = exports.body = exports.blockquote = exports.big = exports.bdo = exports.bdi = exports.basefont = exports.base = exports.b = exports.audio = exports.aside = exports.article = exports.area = exports.applet = exports.address = exports.acronym = exports.abbr = exports.a = void 0;
exports.mmultiscripts = exports.mlongdiv = exports.mlabeledtr = exports.mi = exports.mglyph = exports.mfrac = exports.mfenced = exports.merror = exports.menclose = exports.malignmark = exports.maligngroup = exports.maction = exports.math = exports.view = exports.use = exports.unknown = exports.tspan = exports.textPath = exports.text = exports.symbol = exports.switch_ = exports.svg = exports.stop = exports.solidcolor = exports.set = exports.rect = exports.radialGradient = exports.polyline = exports.polygon = exports.pattern = exports.path = exports.mpath = exports.metadata = exports.meshrow = exports.meshpatch = exports.meshgradient = exports.mesh = exports.mask = exports.marker = exports.linearGradient = exports.line = exports.image = exports.hatchpath = exports.hatch = exports.g = exports.foreignObject = exports.filter = exports.feTurbulence = exports.feTile = exports.feSpotLight = exports.feSpecularLighting = exports.fePointLight = exports.feOffset = exports.feMorphology = exports.feMergeNode = exports.feMerge = exports.feImage = exports.feGaussianBlur = exports.feFuncR = exports.feFuncG = exports.feFuncB = exports.feFuncA = exports.feFlood = exports.feDropShadow = exports.feDistantLight = exports.feDisplacementMap = exports.feDiffuseLighting = exports.feConvolveMatrix = exports.feComposite = exports.feComponentTransfer = exports.feColorMatrix = exports.feBlend = exports.ellipse = exports.discard = exports.desc = exports.defs = exports.colorProfile = exports.clipPath = exports.circle = exports.animateTransform = exports.animateMotion = exports.animate = exports.wbr = exports.video = exports.var_ = exports.ul = exports.u = exports.tt = exports.track = exports.tr = exports.time = exports.thead = exports.th = exports.tfoot = exports.textarea = exports.td = exports.tbody = exports.table = exports.sup = exports.summary = void 0;
exports.annotationXml = exports.annotation = exports.semantics = exports.munderover = exports.munder = exports.mtr = exports.mtext = exports.mtd = exports.mtable = exports.msubsup = exports.msup = exports.msub = exports.mstyle = exports.mstack = exports.msrow = exports.msqrt = exports.mspace = exports.msline = exports.msgroup = exports.mscarry = exports.mscarries = exports.ms = exports.mrow = exports.mroot = exports.mphantom = exports.mpadded = exports.mover = exports.mo = exports.mn = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _taglMithril = _interopRequireDefault(require("tagl-mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _tagl = (0, _taglMithril.default)(_mithril.default),
    a = _tagl.a;

exports.a = a;

var _tagl2 = (0, _taglMithril.default)(_mithril.default),
    abbr = _tagl2.abbr;

exports.abbr = abbr;

var _tagl3 = (0, _taglMithril.default)(_mithril.default),
    acronym = _tagl3.acronym;

exports.acronym = acronym;

var _tagl4 = (0, _taglMithril.default)(_mithril.default),
    address = _tagl4.address;

exports.address = address;

var _tagl5 = (0, _taglMithril.default)(_mithril.default),
    applet = _tagl5.applet;

exports.applet = applet;

var _tagl6 = (0, _taglMithril.default)(_mithril.default),
    area = _tagl6.area;

exports.area = area;

var _tagl7 = (0, _taglMithril.default)(_mithril.default),
    article = _tagl7.article;

exports.article = article;

var _tagl8 = (0, _taglMithril.default)(_mithril.default),
    aside = _tagl8.aside;

exports.aside = aside;

var _tagl9 = (0, _taglMithril.default)(_mithril.default),
    audio = _tagl9.audio;

exports.audio = audio;

var _tagl10 = (0, _taglMithril.default)(_mithril.default),
    b = _tagl10.b;

exports.b = b;

var _tagl11 = (0, _taglMithril.default)(_mithril.default),
    base = _tagl11.base;

exports.base = base;

var _tagl12 = (0, _taglMithril.default)(_mithril.default),
    basefont = _tagl12.basefont;

exports.basefont = basefont;

var _tagl13 = (0, _taglMithril.default)(_mithril.default),
    bdi = _tagl13.bdi;

exports.bdi = bdi;

var _tagl14 = (0, _taglMithril.default)(_mithril.default),
    bdo = _tagl14.bdo;

exports.bdo = bdo;

var _tagl15 = (0, _taglMithril.default)(_mithril.default),
    big = _tagl15.big;

exports.big = big;

var _tagl16 = (0, _taglMithril.default)(_mithril.default),
    blockquote = _tagl16.blockquote;

exports.blockquote = blockquote;

var _tagl17 = (0, _taglMithril.default)(_mithril.default),
    body = _tagl17.body;

exports.body = body;

var _tagl18 = (0, _taglMithril.default)(_mithril.default),
    br = _tagl18.br;

exports.br = br;

var _tagl19 = (0, _taglMithril.default)(_mithril.default),
    button = _tagl19.button;

exports.button = button;

var _tagl20 = (0, _taglMithril.default)(_mithril.default),
    canvas = _tagl20.canvas;

exports.canvas = canvas;

var _tagl21 = (0, _taglMithril.default)(_mithril.default),
    caption = _tagl21.caption;

exports.caption = caption;

var _tagl22 = (0, _taglMithril.default)(_mithril.default),
    center = _tagl22.center;

exports.center = center;

var _tagl23 = (0, _taglMithril.default)(_mithril.default),
    cite = _tagl23.cite;

exports.cite = cite;

var _tagl24 = (0, _taglMithril.default)(_mithril.default),
    code = _tagl24.code;

exports.code = code;

var _tagl25 = (0, _taglMithril.default)(_mithril.default),
    col = _tagl25.col;

exports.col = col;

var _tagl26 = (0, _taglMithril.default)(_mithril.default),
    colgroup = _tagl26.colgroup;

exports.colgroup = colgroup;

var _tagl27 = (0, _taglMithril.default)(_mithril.default),
    datalist = _tagl27.datalist;

exports.datalist = datalist;

var _tagl28 = (0, _taglMithril.default)(_mithril.default),
    dd = _tagl28.dd;

exports.dd = dd;

var _tagl29 = (0, _taglMithril.default)(_mithril.default),
    del = _tagl29.del;

exports.del = del;

var _tagl30 = (0, _taglMithril.default)(_mithril.default),
    details = _tagl30.details;

exports.details = details;

var _tagl31 = (0, _taglMithril.default)(_mithril.default),
    dfn = _tagl31.dfn;

exports.dfn = dfn;

var _tagl32 = (0, _taglMithril.default)(_mithril.default),
    dir = _tagl32.dir;

exports.dir = dir;

var _tagl33 = (0, _taglMithril.default)(_mithril.default),
    div = _tagl33.div;

exports.div = div;

var _tagl34 = (0, _taglMithril.default)(_mithril.default),
    dl = _tagl34.dl;

exports.dl = dl;

var _tagl35 = (0, _taglMithril.default)(_mithril.default),
    dt = _tagl35.dt;

exports.dt = dt;

var _tagl36 = (0, _taglMithril.default)(_mithril.default),
    em = _tagl36.em;

exports.em = em;

var _tagl37 = (0, _taglMithril.default)(_mithril.default),
    embed = _tagl37.embed;

exports.embed = embed;

var _tagl38 = (0, _taglMithril.default)(_mithril.default),
    fieldset = _tagl38.fieldset;

exports.fieldset = fieldset;

var _tagl39 = (0, _taglMithril.default)(_mithril.default),
    figcaption = _tagl39.figcaption;

exports.figcaption = figcaption;

var _tagl40 = (0, _taglMithril.default)(_mithril.default),
    figure = _tagl40.figure;

exports.figure = figure;

var _tagl41 = (0, _taglMithril.default)(_mithril.default),
    font = _tagl41.font;

exports.font = font;

var _tagl42 = (0, _taglMithril.default)(_mithril.default),
    footer = _tagl42.footer;

exports.footer = footer;

var _tagl43 = (0, _taglMithril.default)(_mithril.default),
    form = _tagl43.form;

exports.form = form;

var _tagl44 = (0, _taglMithril.default)(_mithril.default),
    frame = _tagl44.frame;

exports.frame = frame;

var _tagl45 = (0, _taglMithril.default)(_mithril.default),
    frameset = _tagl45.frameset;

exports.frameset = frameset;

var _tagl46 = (0, _taglMithril.default)(_mithril.default),
    h1 = _tagl46.h1;

exports.h1 = h1;

var _tagl47 = (0, _taglMithril.default)(_mithril.default),
    h2 = _tagl47.h2;

exports.h2 = h2;

var _tagl48 = (0, _taglMithril.default)(_mithril.default),
    h3 = _tagl48.h3;

exports.h3 = h3;

var _tagl49 = (0, _taglMithril.default)(_mithril.default),
    h4 = _tagl49.h4;

exports.h4 = h4;

var _tagl50 = (0, _taglMithril.default)(_mithril.default),
    h5 = _tagl50.h5;

exports.h5 = h5;

var _tagl51 = (0, _taglMithril.default)(_mithril.default),
    h6 = _tagl51.h6;

exports.h6 = h6;

var _tagl52 = (0, _taglMithril.default)(_mithril.default),
    head = _tagl52.head;

exports.head = head;

var _tagl53 = (0, _taglMithril.default)(_mithril.default),
    header = _tagl53.header;

exports.header = header;

var _tagl54 = (0, _taglMithril.default)(_mithril.default),
    hgroup = _tagl54.hgroup;

exports.hgroup = hgroup;

var _tagl55 = (0, _taglMithril.default)(_mithril.default),
    hr = _tagl55.hr;

exports.hr = hr;

var _tagl56 = (0, _taglMithril.default)(_mithril.default),
    html = _tagl56.html;

exports.html = html;

var _tagl57 = (0, _taglMithril.default)(_mithril.default),
    i = _tagl57.i;

exports.i = i;

var _tagl58 = (0, _taglMithril.default)(_mithril.default),
    iframe = _tagl58.iframe;

exports.iframe = iframe;

var _tagl59 = (0, _taglMithril.default)(_mithril.default),
    img = _tagl59.img;

exports.img = img;

var _tagl60 = (0, _taglMithril.default)(_mithril.default),
    input = _tagl60.input;

exports.input = input;

var _tagl61 = (0, _taglMithril.default)(_mithril.default),
    ins = _tagl61.ins;

exports.ins = ins;

var _tagl62 = (0, _taglMithril.default)(_mithril.default),
    kbd = _tagl62.kbd;

exports.kbd = kbd;

var _tagl63 = (0, _taglMithril.default)(_mithril.default),
    keygen = _tagl63.keygen;

exports.keygen = keygen;

var _tagl64 = (0, _taglMithril.default)(_mithril.default),
    label = _tagl64.label;

exports.label = label;

var _tagl65 = (0, _taglMithril.default)(_mithril.default),
    legend = _tagl65.legend;

exports.legend = legend;

var _tagl66 = (0, _taglMithril.default)(_mithril.default),
    li = _tagl66.li;

exports.li = li;

var _tagl67 = (0, _taglMithril.default)(_mithril.default),
    link = _tagl67.link;

exports.link = link;

var _tagl68 = (0, _taglMithril.default)(_mithril.default),
    map = _tagl68.map;

exports.map = map;

var _tagl69 = (0, _taglMithril.default)(_mithril.default),
    mark = _tagl69.mark;

exports.mark = mark;

var _tagl70 = (0, _taglMithril.default)(_mithril.default),
    menu = _tagl70.menu;

exports.menu = menu;

var _tagl71 = (0, _taglMithril.default)(_mithril.default),
    meta = _tagl71.meta;

exports.meta = meta;

var _tagl72 = (0, _taglMithril.default)(_mithril.default),
    meter = _tagl72.meter;

exports.meter = meter;

var _tagl73 = (0, _taglMithril.default)(_mithril.default),
    nav = _tagl73.nav;

exports.nav = nav;

var _tagl74 = (0, _taglMithril.default)(_mithril.default),
    noframes = _tagl74.noframes;

exports.noframes = noframes;

var _tagl75 = (0, _taglMithril.default)(_mithril.default),
    noscript = _tagl75.noscript;

exports.noscript = noscript;

var _tagl76 = (0, _taglMithril.default)(_mithril.default),
    object = _tagl76.object;

exports.object = object;

var _tagl77 = (0, _taglMithril.default)(_mithril.default),
    ol = _tagl77.ol;

exports.ol = ol;

var _tagl78 = (0, _taglMithril.default)(_mithril.default),
    optgroup = _tagl78.optgroup;

exports.optgroup = optgroup;

var _tagl79 = (0, _taglMithril.default)(_mithril.default),
    option = _tagl79.option;

exports.option = option;

var _tagl80 = (0, _taglMithril.default)(_mithril.default),
    output = _tagl80.output;

exports.output = output;

var _tagl81 = (0, _taglMithril.default)(_mithril.default),
    p = _tagl81.p;

exports.p = p;

var _tagl82 = (0, _taglMithril.default)(_mithril.default),
    param = _tagl82.param;

exports.param = param;

var _tagl83 = (0, _taglMithril.default)(_mithril.default),
    pre = _tagl83.pre;

exports.pre = pre;

var _tagl84 = (0, _taglMithril.default)(_mithril.default),
    progress = _tagl84.progress;

exports.progress = progress;

var _tagl85 = (0, _taglMithril.default)(_mithril.default),
    q = _tagl85.q;

exports.q = q;

var _tagl86 = (0, _taglMithril.default)(_mithril.default),
    rp = _tagl86.rp;

exports.rp = rp;

var _tagl87 = (0, _taglMithril.default)(_mithril.default),
    rt = _tagl87.rt;

exports.rt = rt;

var _tagl88 = (0, _taglMithril.default)(_mithril.default),
    ruby = _tagl88.ruby;

exports.ruby = ruby;

var _tagl89 = (0, _taglMithril.default)(_mithril.default),
    s = _tagl89.s;

exports.s = s;

var _tagl90 = (0, _taglMithril.default)(_mithril.default),
    samp = _tagl90.samp;

exports.samp = samp;

var _tagl91 = (0, _taglMithril.default)(_mithril.default),
    script = _tagl91.script;

exports.script = script;

var _tagl92 = (0, _taglMithril.default)(_mithril.default),
    section = _tagl92.section;

exports.section = section;

var _tagl93 = (0, _taglMithril.default)(_mithril.default),
    select = _tagl93.select;

exports.select = select;

var _tagl94 = (0, _taglMithril.default)(_mithril.default),
    small = _tagl94.small;

exports.small = small;

var _tagl95 = (0, _taglMithril.default)(_mithril.default),
    source = _tagl95.source;

exports.source = source;

var _tagl96 = (0, _taglMithril.default)(_mithril.default),
    span = _tagl96.span;

exports.span = span;

var _tagl97 = (0, _taglMithril.default)(_mithril.default),
    strike = _tagl97.strike;

exports.strike = strike;

var _tagl98 = (0, _taglMithril.default)(_mithril.default),
    strong = _tagl98.strong;

exports.strong = strong;

var _tagl99 = (0, _taglMithril.default)(_mithril.default),
    style = _tagl99.style;

exports.style = style;

var _tagl100 = (0, _taglMithril.default)(_mithril.default),
    sub = _tagl100.sub;

exports.sub = sub;

var _tagl101 = (0, _taglMithril.default)(_mithril.default),
    summary = _tagl101.summary;

exports.summary = summary;

var _tagl102 = (0, _taglMithril.default)(_mithril.default),
    sup = _tagl102.sup;

exports.sup = sup;

var _tagl103 = (0, _taglMithril.default)(_mithril.default),
    table = _tagl103.table;

exports.table = table;

var _tagl104 = (0, _taglMithril.default)(_mithril.default),
    tbody = _tagl104.tbody;

exports.tbody = tbody;

var _tagl105 = (0, _taglMithril.default)(_mithril.default),
    td = _tagl105.td;

exports.td = td;

var _tagl106 = (0, _taglMithril.default)(_mithril.default),
    textarea = _tagl106.textarea;

exports.textarea = textarea;

var _tagl107 = (0, _taglMithril.default)(_mithril.default),
    tfoot = _tagl107.tfoot;

exports.tfoot = tfoot;

var _tagl108 = (0, _taglMithril.default)(_mithril.default),
    th = _tagl108.th;

exports.th = th;

var _tagl109 = (0, _taglMithril.default)(_mithril.default),
    thead = _tagl109.thead;

exports.thead = thead;

var _tagl110 = (0, _taglMithril.default)(_mithril.default),
    time = _tagl110.time;

exports.time = time;

var _tagl111 = (0, _taglMithril.default)(_mithril.default),
    tr = _tagl111.tr;

exports.tr = tr;

var _tagl112 = (0, _taglMithril.default)(_mithril.default),
    track = _tagl112.track;

exports.track = track;

var _tagl113 = (0, _taglMithril.default)(_mithril.default),
    tt = _tagl113.tt;

exports.tt = tt;

var _tagl114 = (0, _taglMithril.default)(_mithril.default),
    u = _tagl114.u;

exports.u = u;

var _tagl115 = (0, _taglMithril.default)(_mithril.default),
    ul = _tagl115.ul;

exports.ul = ul;

var _tagl116 = (0, _taglMithril.default)(_mithril.default),
    var_ = _tagl116.var_;

exports.var_ = var_;

var _tagl117 = (0, _taglMithril.default)(_mithril.default),
    video = _tagl117.video;

exports.video = video;

var _tagl118 = (0, _taglMithril.default)(_mithril.default),
    wbr = _tagl118.wbr;

exports.wbr = wbr;

var _tagl119 = (0, _taglMithril.default)(_mithril.default),
    animate = _tagl119.animate;

exports.animate = animate;

var _tagl120 = (0, _taglMithril.default)(_mithril.default),
    animateMotion = _tagl120.animateMotion;

exports.animateMotion = animateMotion;

var _tagl121 = (0, _taglMithril.default)(_mithril.default),
    animateTransform = _tagl121.animateTransform;

exports.animateTransform = animateTransform;

var _tagl122 = (0, _taglMithril.default)(_mithril.default),
    circle = _tagl122.circle;

exports.circle = circle;

var _tagl123 = (0, _taglMithril.default)(_mithril.default),
    clipPath = _tagl123.clipPath;

exports.clipPath = clipPath;

var _tagl124 = (0, _taglMithril.default)(_mithril.default),
    colorProfile = _tagl124.colorProfile;

exports.colorProfile = colorProfile;

var _tagl125 = (0, _taglMithril.default)(_mithril.default),
    defs = _tagl125.defs;

exports.defs = defs;

var _tagl126 = (0, _taglMithril.default)(_mithril.default),
    desc = _tagl126.desc;

exports.desc = desc;

var _tagl127 = (0, _taglMithril.default)(_mithril.default),
    discard = _tagl127.discard;

exports.discard = discard;

var _tagl128 = (0, _taglMithril.default)(_mithril.default),
    ellipse = _tagl128.ellipse;

exports.ellipse = ellipse;

var _tagl129 = (0, _taglMithril.default)(_mithril.default),
    feBlend = _tagl129.feBlend;

exports.feBlend = feBlend;

var _tagl130 = (0, _taglMithril.default)(_mithril.default),
    feColorMatrix = _tagl130.feColorMatrix;

exports.feColorMatrix = feColorMatrix;

var _tagl131 = (0, _taglMithril.default)(_mithril.default),
    feComponentTransfer = _tagl131.feComponentTransfer;

exports.feComponentTransfer = feComponentTransfer;

var _tagl132 = (0, _taglMithril.default)(_mithril.default),
    feComposite = _tagl132.feComposite;

exports.feComposite = feComposite;

var _tagl133 = (0, _taglMithril.default)(_mithril.default),
    feConvolveMatrix = _tagl133.feConvolveMatrix;

exports.feConvolveMatrix = feConvolveMatrix;

var _tagl134 = (0, _taglMithril.default)(_mithril.default),
    feDiffuseLighting = _tagl134.feDiffuseLighting;

exports.feDiffuseLighting = feDiffuseLighting;

var _tagl135 = (0, _taglMithril.default)(_mithril.default),
    feDisplacementMap = _tagl135.feDisplacementMap;

exports.feDisplacementMap = feDisplacementMap;

var _tagl136 = (0, _taglMithril.default)(_mithril.default),
    feDistantLight = _tagl136.feDistantLight;

exports.feDistantLight = feDistantLight;

var _tagl137 = (0, _taglMithril.default)(_mithril.default),
    feDropShadow = _tagl137.feDropShadow;

exports.feDropShadow = feDropShadow;

var _tagl138 = (0, _taglMithril.default)(_mithril.default),
    feFlood = _tagl138.feFlood;

exports.feFlood = feFlood;

var _tagl139 = (0, _taglMithril.default)(_mithril.default),
    feFuncA = _tagl139.feFuncA;

exports.feFuncA = feFuncA;

var _tagl140 = (0, _taglMithril.default)(_mithril.default),
    feFuncB = _tagl140.feFuncB;

exports.feFuncB = feFuncB;

var _tagl141 = (0, _taglMithril.default)(_mithril.default),
    feFuncG = _tagl141.feFuncG;

exports.feFuncG = feFuncG;

var _tagl142 = (0, _taglMithril.default)(_mithril.default),
    feFuncR = _tagl142.feFuncR;

exports.feFuncR = feFuncR;

var _tagl143 = (0, _taglMithril.default)(_mithril.default),
    feGaussianBlur = _tagl143.feGaussianBlur;

exports.feGaussianBlur = feGaussianBlur;

var _tagl144 = (0, _taglMithril.default)(_mithril.default),
    feImage = _tagl144.feImage;

exports.feImage = feImage;

var _tagl145 = (0, _taglMithril.default)(_mithril.default),
    feMerge = _tagl145.feMerge;

exports.feMerge = feMerge;

var _tagl146 = (0, _taglMithril.default)(_mithril.default),
    feMergeNode = _tagl146.feMergeNode;

exports.feMergeNode = feMergeNode;

var _tagl147 = (0, _taglMithril.default)(_mithril.default),
    feMorphology = _tagl147.feMorphology;

exports.feMorphology = feMorphology;

var _tagl148 = (0, _taglMithril.default)(_mithril.default),
    feOffset = _tagl148.feOffset;

exports.feOffset = feOffset;

var _tagl149 = (0, _taglMithril.default)(_mithril.default),
    fePointLight = _tagl149.fePointLight;

exports.fePointLight = fePointLight;

var _tagl150 = (0, _taglMithril.default)(_mithril.default),
    feSpecularLighting = _tagl150.feSpecularLighting;

exports.feSpecularLighting = feSpecularLighting;

var _tagl151 = (0, _taglMithril.default)(_mithril.default),
    feSpotLight = _tagl151.feSpotLight;

exports.feSpotLight = feSpotLight;

var _tagl152 = (0, _taglMithril.default)(_mithril.default),
    feTile = _tagl152.feTile;

exports.feTile = feTile;

var _tagl153 = (0, _taglMithril.default)(_mithril.default),
    feTurbulence = _tagl153.feTurbulence;

exports.feTurbulence = feTurbulence;

var _tagl154 = (0, _taglMithril.default)(_mithril.default),
    filter = _tagl154.filter;

exports.filter = filter;

var _tagl155 = (0, _taglMithril.default)(_mithril.default),
    foreignObject = _tagl155.foreignObject;

exports.foreignObject = foreignObject;

var _tagl156 = (0, _taglMithril.default)(_mithril.default),
    g = _tagl156.g;

exports.g = g;

var _tagl157 = (0, _taglMithril.default)(_mithril.default),
    hatch = _tagl157.hatch;

exports.hatch = hatch;

var _tagl158 = (0, _taglMithril.default)(_mithril.default),
    hatchpath = _tagl158.hatchpath;

exports.hatchpath = hatchpath;

var _tagl159 = (0, _taglMithril.default)(_mithril.default),
    image = _tagl159.image;

exports.image = image;

var _tagl160 = (0, _taglMithril.default)(_mithril.default),
    line = _tagl160.line;

exports.line = line;

var _tagl161 = (0, _taglMithril.default)(_mithril.default),
    linearGradient = _tagl161.linearGradient;

exports.linearGradient = linearGradient;

var _tagl162 = (0, _taglMithril.default)(_mithril.default),
    marker = _tagl162.marker;

exports.marker = marker;

var _tagl163 = (0, _taglMithril.default)(_mithril.default),
    mask = _tagl163.mask;

exports.mask = mask;

var _tagl164 = (0, _taglMithril.default)(_mithril.default),
    mesh = _tagl164.mesh;

exports.mesh = mesh;

var _tagl165 = (0, _taglMithril.default)(_mithril.default),
    meshgradient = _tagl165.meshgradient;

exports.meshgradient = meshgradient;

var _tagl166 = (0, _taglMithril.default)(_mithril.default),
    meshpatch = _tagl166.meshpatch;

exports.meshpatch = meshpatch;

var _tagl167 = (0, _taglMithril.default)(_mithril.default),
    meshrow = _tagl167.meshrow;

exports.meshrow = meshrow;

var _tagl168 = (0, _taglMithril.default)(_mithril.default),
    metadata = _tagl168.metadata;

exports.metadata = metadata;

var _tagl169 = (0, _taglMithril.default)(_mithril.default),
    mpath = _tagl169.mpath;

exports.mpath = mpath;

var _tagl170 = (0, _taglMithril.default)(_mithril.default),
    path = _tagl170.path;

exports.path = path;

var _tagl171 = (0, _taglMithril.default)(_mithril.default),
    pattern = _tagl171.pattern;

exports.pattern = pattern;

var _tagl172 = (0, _taglMithril.default)(_mithril.default),
    polygon = _tagl172.polygon;

exports.polygon = polygon;

var _tagl173 = (0, _taglMithril.default)(_mithril.default),
    polyline = _tagl173.polyline;

exports.polyline = polyline;

var _tagl174 = (0, _taglMithril.default)(_mithril.default),
    radialGradient = _tagl174.radialGradient;

exports.radialGradient = radialGradient;

var _tagl175 = (0, _taglMithril.default)(_mithril.default),
    rect = _tagl175.rect;

exports.rect = rect;

var _tagl176 = (0, _taglMithril.default)(_mithril.default),
    set = _tagl176.set;

exports.set = set;

var _tagl177 = (0, _taglMithril.default)(_mithril.default),
    solidcolor = _tagl177.solidcolor;

exports.solidcolor = solidcolor;

var _tagl178 = (0, _taglMithril.default)(_mithril.default),
    stop = _tagl178.stop;

exports.stop = stop;

var _tagl179 = (0, _taglMithril.default)(_mithril.default),
    svg = _tagl179.svg;

exports.svg = svg;

var _tagl180 = (0, _taglMithril.default)(_mithril.default),
    switch_ = _tagl180.switch_;

exports.switch_ = switch_;

var _tagl181 = (0, _taglMithril.default)(_mithril.default),
    symbol = _tagl181.symbol;

exports.symbol = symbol;

var _tagl182 = (0, _taglMithril.default)(_mithril.default),
    text = _tagl182.text;

exports.text = text;

var _tagl183 = (0, _taglMithril.default)(_mithril.default),
    textPath = _tagl183.textPath;

exports.textPath = textPath;

var _tagl184 = (0, _taglMithril.default)(_mithril.default),
    tspan = _tagl184.tspan;

exports.tspan = tspan;

var _tagl185 = (0, _taglMithril.default)(_mithril.default),
    unknown = _tagl185.unknown;

exports.unknown = unknown;

var _tagl186 = (0, _taglMithril.default)(_mithril.default),
    use = _tagl186.use;

exports.use = use;

var _tagl187 = (0, _taglMithril.default)(_mithril.default),
    view = _tagl187.view;

exports.view = view;

var _tagl188 = (0, _taglMithril.default)(_mithril.default),
    math = _tagl188.math;

exports.math = math;

var _tagl189 = (0, _taglMithril.default)(_mithril.default),
    maction = _tagl189.maction;

exports.maction = maction;

var _tagl190 = (0, _taglMithril.default)(_mithril.default),
    maligngroup = _tagl190.maligngroup;

exports.maligngroup = maligngroup;

var _tagl191 = (0, _taglMithril.default)(_mithril.default),
    malignmark = _tagl191.malignmark;

exports.malignmark = malignmark;

var _tagl192 = (0, _taglMithril.default)(_mithril.default),
    menclose = _tagl192.menclose;

exports.menclose = menclose;

var _tagl193 = (0, _taglMithril.default)(_mithril.default),
    merror = _tagl193.merror;

exports.merror = merror;

var _tagl194 = (0, _taglMithril.default)(_mithril.default),
    mfenced = _tagl194.mfenced;

exports.mfenced = mfenced;

var _tagl195 = (0, _taglMithril.default)(_mithril.default),
    mfrac = _tagl195.mfrac;

exports.mfrac = mfrac;

var _tagl196 = (0, _taglMithril.default)(_mithril.default),
    mglyph = _tagl196.mglyph;

exports.mglyph = mglyph;

var _tagl197 = (0, _taglMithril.default)(_mithril.default),
    mi = _tagl197.mi;

exports.mi = mi;

var _tagl198 = (0, _taglMithril.default)(_mithril.default),
    mlabeledtr = _tagl198.mlabeledtr;

exports.mlabeledtr = mlabeledtr;

var _tagl199 = (0, _taglMithril.default)(_mithril.default),
    mlongdiv = _tagl199.mlongdiv;

exports.mlongdiv = mlongdiv;

var _tagl200 = (0, _taglMithril.default)(_mithril.default),
    mmultiscripts = _tagl200.mmultiscripts;

exports.mmultiscripts = mmultiscripts;

var _tagl201 = (0, _taglMithril.default)(_mithril.default),
    mn = _tagl201.mn;

exports.mn = mn;

var _tagl202 = (0, _taglMithril.default)(_mithril.default),
    mo = _tagl202.mo;

exports.mo = mo;

var _tagl203 = (0, _taglMithril.default)(_mithril.default),
    mover = _tagl203.mover;

exports.mover = mover;

var _tagl204 = (0, _taglMithril.default)(_mithril.default),
    mpadded = _tagl204.mpadded;

exports.mpadded = mpadded;

var _tagl205 = (0, _taglMithril.default)(_mithril.default),
    mphantom = _tagl205.mphantom;

exports.mphantom = mphantom;

var _tagl206 = (0, _taglMithril.default)(_mithril.default),
    mroot = _tagl206.mroot;

exports.mroot = mroot;

var _tagl207 = (0, _taglMithril.default)(_mithril.default),
    mrow = _tagl207.mrow;

exports.mrow = mrow;

var _tagl208 = (0, _taglMithril.default)(_mithril.default),
    ms = _tagl208.ms;

exports.ms = ms;

var _tagl209 = (0, _taglMithril.default)(_mithril.default),
    mscarries = _tagl209.mscarries;

exports.mscarries = mscarries;

var _tagl210 = (0, _taglMithril.default)(_mithril.default),
    mscarry = _tagl210.mscarry;

exports.mscarry = mscarry;

var _tagl211 = (0, _taglMithril.default)(_mithril.default),
    msgroup = _tagl211.msgroup;

exports.msgroup = msgroup;

var _tagl212 = (0, _taglMithril.default)(_mithril.default),
    msline = _tagl212.msline;

exports.msline = msline;

var _tagl213 = (0, _taglMithril.default)(_mithril.default),
    mspace = _tagl213.mspace;

exports.mspace = mspace;

var _tagl214 = (0, _taglMithril.default)(_mithril.default),
    msqrt = _tagl214.msqrt;

exports.msqrt = msqrt;

var _tagl215 = (0, _taglMithril.default)(_mithril.default),
    msrow = _tagl215.msrow;

exports.msrow = msrow;

var _tagl216 = (0, _taglMithril.default)(_mithril.default),
    mstack = _tagl216.mstack;

exports.mstack = mstack;

var _tagl217 = (0, _taglMithril.default)(_mithril.default),
    mstyle = _tagl217.mstyle;

exports.mstyle = mstyle;

var _tagl218 = (0, _taglMithril.default)(_mithril.default),
    msub = _tagl218.msub;

exports.msub = msub;

var _tagl219 = (0, _taglMithril.default)(_mithril.default),
    msup = _tagl219.msup;

exports.msup = msup;

var _tagl220 = (0, _taglMithril.default)(_mithril.default),
    msubsup = _tagl220.msubsup;

exports.msubsup = msubsup;

var _tagl221 = (0, _taglMithril.default)(_mithril.default),
    mtable = _tagl221.mtable;

exports.mtable = mtable;

var _tagl222 = (0, _taglMithril.default)(_mithril.default),
    mtd = _tagl222.mtd;

exports.mtd = mtd;

var _tagl223 = (0, _taglMithril.default)(_mithril.default),
    mtext = _tagl223.mtext;

exports.mtext = mtext;

var _tagl224 = (0, _taglMithril.default)(_mithril.default),
    mtr = _tagl224.mtr;

exports.mtr = mtr;

var _tagl225 = (0, _taglMithril.default)(_mithril.default),
    munder = _tagl225.munder;

exports.munder = munder;

var _tagl226 = (0, _taglMithril.default)(_mithril.default),
    munderover = _tagl226.munderover;

exports.munderover = munderover;

var _tagl227 = (0, _taglMithril.default)(_mithril.default),
    semantics = _tagl227.semantics;

exports.semantics = semantics;

var _tagl228 = (0, _taglMithril.default)(_mithril.default),
    annotation = _tagl228.annotation;

exports.annotation = annotation;

var _tagl229 = (0, _taglMithril.default)(_mithril.default),
    annotationXml = _tagl229.annotationXml;

exports.annotationXml = annotationXml;
},{"mithril":"../node_modules/mithril/index.js","tagl-mithril":"../node_modules/tagl-mithril/lib/index.js"}],"images/img_avatar.png":[function(require,module,exports) {
module.exports = "/img_avatar.92e665ab.png";
},{}],"images/img_avatar2.png":[function(require,module,exports) {
module.exports = "/img_avatar2.c185f3df.png";
},{}],"images/*.png":[function(require,module,exports) {
module.exports = {
  "img_avatar": require("./img_avatar.png"),
  "img_avatar2": require("./img_avatar2.png")
};
},{"./img_avatar.png":"images/img_avatar.png","./img_avatar2.png":"images/img_avatar2.png"}],"settings.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var base = 'http://localhost:9000';
var _default = {
  url: function url(_url) {
    return base + _url;
  }
};
exports.default = _default;
},{}],"../node_modules/jwt-decode/lib/atob.js":[function(require,module,exports) {
/**
 * The code was extracted from:
 * https://github.com/davidchambers/Base64.js
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function InvalidCharacterError(message) {
  this.message = message;
}

InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

function polyfill (input) {
  var str = String(input).replace(/=+$/, '');
  if (str.length % 4 == 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = '';
    // get next character
    buffer = str.charAt(idx++);
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}


module.exports = typeof window !== 'undefined' && window.atob && window.atob.bind(window) || polyfill;

},{}],"../node_modules/jwt-decode/lib/base64_url_decode.js":[function(require,module,exports) {
var atob = require('./atob');

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    var code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
}

module.exports = function(str) {
  var output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try{
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
};

},{"./atob":"../node_modules/jwt-decode/lib/atob.js"}],"../node_modules/jwt-decode/lib/index.js":[function(require,module,exports) {
'use strict';

var base64_url_decode = require('./base64_url_decode');

function InvalidTokenError(message) {
  this.message = message;
}

InvalidTokenError.prototype = new Error();
InvalidTokenError.prototype.name = 'InvalidTokenError';

module.exports = function (token,options) {
  if (typeof token !== 'string') {
    throw new InvalidTokenError('Invalid token specified');
  }

  options = options || {};
  var pos = options.header === true ? 0 : 1;
  try {
    return JSON.parse(base64_url_decode(token.split('.')[pos]));
  } catch (e) {
    throw new InvalidTokenError('Invalid token specified: ' + e.message);
  }
};

module.exports.InvalidTokenError = InvalidTokenError;

},{"./base64_url_decode":"../node_modules/jwt-decode/lib/base64_url_decode.js"}],"auth.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _settings = _interopRequireDefault(require("./settings"));

var _jwtDecode = _interopRequireDefault(require("jwt-decode"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var user = undefined;

var auth = function () {
  var email = "";
  var password = "";
  var _token = null;
  var expMillis = -1;
  var eventBus = null;
  var userid = null;
  var userMessageSubscriptions = [];
  var _connected = false;

  var refresh = function refresh(cb, err_cb) {
    if (email === "" || password === "") return;

    _mithril.default.request({
      data: {
        email: email,
        password: password
      },
      url: _settings.default.url("/api/auth/login"),
      method: "post"
    }).then(function (response) {
      _token = response.token;
      var ttt = (0, _jwtDecode.default)(_token);
      expMillis = ttt.exp * 1000;
      userid = ttt.crypto;
      if (cb) cb();
      setTimeout(refresh, -Date.now() + expMillis - 100);
    }, function (err) {
      _connected = false;
      _token = null;
      err_cb && err_cb(err);
    });
  };

  return {
    sessionRunningMillis: function sessionRunningMillis() {
      return expMillis;
    },
    login: refresh,
    logout: function logout() {
      eventBus && eventBus.close();

      _mithril.default.request({
        method: "post",
        url: _settings.default.url("/api/logout")
      }).then(function (response) {
        return _token = null;
      });
    },
    signup: function signup(cb) {
      _mithril.default.request({
        data: {
          username: email,
          description: "Empty",
          email: email,
          password: password,
          color: "sepia",
          language: "de"
        },
        url: _settings.default.url("/api/auth/register"),
        method: "post"
      }).then(cb);
    },
    isLoggedIn: function isLoggedIn() {
      return _token !== null;
    },
    token: function token() {
      return _token;
    },
    connected: function connected() {
      return _connected;
    },
    setEmail: function setEmail(email_) {
      if (!!email_ && email_ !== "") email = email_;
    },
    setPassword: function setPassword(password_) {
      if (!!password_ && password_ !== "") password = password_;
    },
    request: function request(options) {
      options.url = _settings.default.url(options.url);
      var headers = options.headers || {};
      headers["Authorization"] = "Bearer " + _token;
      options.headers = headers;
      return _mithril.default.request(_objectSpread({}, options));
    },
    send: function send(topic, msg) {
      eventBus && eventBus.send(topic, _defineProperty({
        token: _token
      }, "token", _token), msg);
    },
    subscribe: function subscribe(topic, cb) {
      eventBus && eventBus.registerHandler(topic, _defineProperty({
        token: _token
      }, "token", _token), cb);
    },
    subscribeToUserMessages: function subscribeToUserMessages(cb) {
      userMessageSubscriptions.push(cb);
    }
  };
}();

var _default = auth;
exports.default = _default;
},{"mithril":"../node_modules/mithril/index.js","./settings":"settings.js","jwt-decode":"../node_modules/jwt-decode/lib/index.js"}],"login.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _tags = require("./tags");

var _ = _interopRequireDefault(require("./images/*.png"));

var _auth = _interopRequireDefault(require("./auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hidden = true;

var _default = function _default(vnode) {
  return {
    view: function view(vnode) {
      return [(0, _tags.button)({
        "onclick": function onclick(e) {
          return document.getElementById('id01').style.display = 'block';
        },
        "style": {
          "width": "auto"
        }
      }, "Login"), _tags.div.modal.$id01(_tags.form.modalContent.animate([_tags.div.imgcontainer([_tags.span.close({
        "onclick": function onclick(e) {
          return document.getElementById('id01').style.display = 'none';
        },
        "title": "Close Modal"
      }, _mithril.default.trust("&times;")), _tags.img.avatar({
        "src": _.default.img_avatar2,
        "alt": "Avatar"
      })]), _tags.div.container([(0, _tags.label)({
        "for": "uname"
      }, (0, _tags.b)("Username")), (0, _tags.input)({
        "type": "text",
        "placeholder": "Enter Username",
        "name": "uname",
        "required": "required",
        oninput: function oninput(e) {
          return _auth.default.setEmail(e.target.value);
        }
      }), (0, _tags.label)({
        "for": "psw"
      }, (0, _tags.b)("Password")), (0, _tags.input)({
        "type": "password",
        "placeholder": "Enter Password",
        "name": "psw",
        "required": "required",
        oninput: function oninput(e) {
          return _auth.default.setPassword(e.target.value);
        }
      }), (0, _tags.button)({
        "type": "button",
        onclick: function onclick(e) {
          return _auth.default.login(function (e) {
            return document.getElementById('id01').style.display = 'none';
          });
        }
      }, "Login"), (0, _tags.label)([(0, _tags.input)({
        "type": "checkbox",
        "checked": "checked",
        "name": "remember"
      }), " Remember me "])]), _tags.div.container({
        "style": {
          "background-color": "#f1f1f1"
        }
      }, [_tags.button.cancelbtn({
        "type": "button",
        "onclick": function onclick(e) {
          return document.getElementById('id01').style.display = 'none';
        }
      }, "Cancel"), _tags.span.psw(["Forgot ", (0, _tags.a)({
        "href": "#"
      }, "password?")])])]))];
    }
  };
};

exports.default = _default;
},{"mithril":"../node_modules/mithril/index.js","./tags":"tags.js","./images/*.png":"images/*.png","./auth":"auth.js"}],"main.js":[function(require,module,exports) {
"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _login = _interopRequireDefault(require("./login"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mithril.default.mount(document.body, {
  view: function view(vnode) {
    return [(0, _mithril.default)('h1', 'Hello'), (0, _mithril.default)(_login.default)];
  }
});
},{"mithril":"../node_modules/mithril/index.js","./login":"login.js"}],"../../../../.npm/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "33285" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../.npm/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.js.map