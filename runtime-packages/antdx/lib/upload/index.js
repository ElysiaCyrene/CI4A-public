"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.UploadDragger = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _Upload = _interopRequireWildcard(require("./Upload"));
var _Dragger = _interopRequireDefault(require("./Dragger"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/* istanbul ignore next */
const UploadDragger = exports.UploadDragger = _Dragger.default;
var _default = exports.default = (0, _extends2.default)(_Upload.default, {
  Dragger: _Dragger.default,
  LIST_IGNORE: _Upload.LIST_IGNORE,
  install(app) {
    app.component(_Upload.default.name, _Upload.default);
    app.component(_Dragger.default.name, _Dragger.default);
    return app;
  }
});