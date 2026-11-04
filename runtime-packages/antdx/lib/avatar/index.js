"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "AvatarGroup", {
  enumerable: true,
  get: function () {
    return _Group.default;
  }
});
Object.defineProperty(exports, "avatarProps", {
  enumerable: true,
  get: function () {
    return _Avatar.avatarProps;
  }
});
exports.default = void 0;
var _Avatar = _interopRequireWildcard(require("./Avatar"));
var _Group = _interopRequireDefault(require("./Group"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
_Avatar.default.Group = _Group.default;
/* istanbul ignore next */
_Avatar.default.install = function (app) {
  app.component(_Avatar.default.name, _Avatar.default);
  app.component(_Group.default.name, _Group.default);
  return app;
};
var _default = exports.default = _Avatar.default;