"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LayoutSider = exports.LayoutHeader = exports.LayoutFooter = exports.LayoutContent = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _layout = _interopRequireWildcard(require("./layout"));
var _Sider = _interopRequireDefault(require("./Sider"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/* istanbul ignore next */
const LayoutHeader = exports.LayoutHeader = _layout.Header;
const LayoutFooter = exports.LayoutFooter = _layout.Footer;
const LayoutSider = exports.LayoutSider = _Sider.default;
const LayoutContent = exports.LayoutContent = _layout.Content;
var _default = exports.default = (0, _extends2.default)(_layout.default, {
  Header: _layout.Header,
  Footer: _layout.Footer,
  Content: _layout.Content,
  Sider: _Sider.default,
  install: app => {
    app.component(_layout.default.name, _layout.default);
    app.component(_layout.Header.name, _layout.Header);
    app.component(_layout.Footer.name, _layout.Footer);
    app.component(_Sider.default.name, _Sider.default);
    app.component(_layout.Content.name, _layout.Content);
    return app;
  }
});