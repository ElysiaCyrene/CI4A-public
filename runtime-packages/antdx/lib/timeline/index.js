"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "TimelineItem", {
  enumerable: true,
  get: function () {
    return _TimelineItem.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "timelineItemProps", {
  enumerable: true,
  get: function () {
    return _TimelineItem.timelineItemProps;
  }
});
Object.defineProperty(exports, "timelineProps", {
  enumerable: true,
  get: function () {
    return _Timeline.timelineProps;
  }
});
var _Timeline = _interopRequireWildcard(require("./Timeline"));
var _TimelineItem = _interopRequireWildcard(require("./TimelineItem"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
_Timeline.default.Item = _TimelineItem.default;
/* istanbul ignore next */
_Timeline.default.install = function (app) {
  app.component(_Timeline.default.name, _Timeline.default);
  app.component(_TimelineItem.default.name, _TimelineItem.default);
  return app;
};
var _default = exports.default = _Timeline.default;