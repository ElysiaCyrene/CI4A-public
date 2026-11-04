"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "SHOW_CHILD", {
  enumerable: true,
  get: function () {
    return _Cascader.SHOW_CHILD;
  }
});
Object.defineProperty(exports, "SHOW_PARENT", {
  enumerable: true,
  get: function () {
    return _Cascader.SHOW_PARENT;
  }
});
Object.defineProperty(exports, "cascaderProps", {
  enumerable: true,
  get: function () {
    return _Cascader.internalCascaderProps;
  }
});
exports.default = void 0;
var _Cascader = _interopRequireWildcard(require("./Cascader"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// rc-cascader@3.4.2
var _default = exports.default = _Cascader.default;