"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestAnimationTimeout = exports.cancelAnimationTimeout = void 0;
var _getRequestAnimationFrame = _interopRequireWildcard(require("./getRequestAnimationFrame"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const raf = (0, _getRequestAnimationFrame.default)();
const cancelAnimationTimeout = frame => (0, _getRequestAnimationFrame.cancelRequestAnimationFrame)(frame.id);
exports.cancelAnimationTimeout = cancelAnimationTimeout;
const requestAnimationTimeout = (callback, delay = 0) => {
  const start = Date.now();
  function timeout() {
    if (Date.now() - start >= delay) {
      callback.call();
    } else {
      frame.id = raf(timeout);
    }
  }
  const frame = {
    id: raf(timeout)
  };
  return frame;
};
exports.requestAnimationTimeout = requestAnimationTimeout;