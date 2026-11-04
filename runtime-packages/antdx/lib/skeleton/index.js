"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "SkeletonAvatar", {
  enumerable: true,
  get: function () {
    return _Avatar.default;
  }
});
Object.defineProperty(exports, "SkeletonButton", {
  enumerable: true,
  get: function () {
    return _Button.default;
  }
});
Object.defineProperty(exports, "SkeletonImage", {
  enumerable: true,
  get: function () {
    return _Image.default;
  }
});
Object.defineProperty(exports, "SkeletonInput", {
  enumerable: true,
  get: function () {
    return _Input.default;
  }
});
Object.defineProperty(exports, "SkeletonTitle", {
  enumerable: true,
  get: function () {
    return _Title.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "skeletonProps", {
  enumerable: true,
  get: function () {
    return _Skeleton.skeletonProps;
  }
});
var _Skeleton = _interopRequireWildcard(require("./Skeleton"));
var _Button = _interopRequireDefault(require("./Button"));
var _Input = _interopRequireDefault(require("./Input"));
var _Image = _interopRequireDefault(require("./Image"));
var _Avatar = _interopRequireDefault(require("./Avatar"));
var _Title = _interopRequireDefault(require("./Title"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
_Skeleton.default.Button = _Button.default;
_Skeleton.default.Avatar = _Avatar.default;
_Skeleton.default.Input = _Input.default;
_Skeleton.default.Image = _Image.default;
_Skeleton.default.Title = _Title.default;
/* istanbul ignore next */
_Skeleton.default.install = function (app) {
  app.component(_Skeleton.default.name, _Skeleton.default);
  app.component(_Skeleton.default.Button.name, _Button.default);
  app.component(_Skeleton.default.Avatar.name, _Avatar.default);
  app.component(_Skeleton.default.Input.name, _Input.default);
  app.component(_Skeleton.default.Image.name, _Image.default);
  app.component(_Skeleton.default.Title.name, _Title.default);
  return app;
};
var _default = exports.default = _Skeleton.default;