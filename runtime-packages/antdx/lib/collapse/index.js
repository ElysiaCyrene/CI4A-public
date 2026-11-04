"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CollapsePanel", {
  enumerable: true,
  get: function () {
    return _CollapsePanel.default;
  }
});
Object.defineProperty(exports, "collapsePanelProps", {
  enumerable: true,
  get: function () {
    return _CollapsePanel.collapsePanelProps;
  }
});
Object.defineProperty(exports, "collapseProps", {
  enumerable: true,
  get: function () {
    return _Collapse.collapseProps;
  }
});
exports.default = void 0;
var _Collapse = _interopRequireWildcard(require("./Collapse"));
var _CollapsePanel = _interopRequireWildcard(require("./CollapsePanel"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
_Collapse.default.Panel = _CollapsePanel.default;
/* istanbul ignore next */
_Collapse.default.install = function (app) {
  app.component(_Collapse.default.name, _Collapse.default);
  app.component(_CollapsePanel.default.name, _CollapsePanel.default);
  return app;
};
var _default = exports.default = _Collapse.default;