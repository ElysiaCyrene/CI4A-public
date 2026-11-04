"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
Object.defineProperty(exports, "spinProps", {
  enumerable: true,
  get: function () {
    return _Spin.spinProps;
  }
});
var _Spin = _interopRequireWildcard(require("./Spin"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
_Spin.default.setDefaultIndicator = _Spin.setDefaultIndicator;
/* istanbul ignore next */
_Spin.default.install = function (app) {
  app.component(_Spin.default.name, _Spin.default);
  return app;
};
var _default = exports.default = _Spin.default;