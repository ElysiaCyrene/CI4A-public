"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.titleProps = exports.default = void 0;
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _omit = _interopRequireDefault(require("../_util/omit"));
var _type = require("../_util/type");
var _warning = _interopRequireDefault(require("../_util/warning"));
var _Base = _interopRequireWildcard(require("./Base"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const TITLE_ELE_LIST = (0, _type.tupleNum)(1, 2, 3, 4, 5);
const titleProps = () => (0, _extends2.default)((0, _extends2.default)({}, (0, _omit.default)((0, _Base.baseProps)(), ['component', 'strong'])), {
  level: Number
});
exports.titleProps = titleProps;
const Title = (props, {
  slots,
  attrs
}) => {
  const {
      level = 1
    } = props,
    restProps = __rest(props, ["level"]);
  let component;
  if (TITLE_ELE_LIST.includes(level)) {
    component = `h${level}`;
  } else {
    (0, _warning.default)(false, 'Typography', 'Title only accept `1 | 2 | 3 | 4 | 5` as `level` value.');
    component = 'h1';
  }
  const titleProps = (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, restProps), {
    component
  }), attrs);
  return (0, _vue.createVNode)(_Base.default, titleProps, slots);
};
Title.displayName = 'ATypographyTitle';
Title.inheritAttrs = false;
Title.props = titleProps();
var _default = exports.default = Title;