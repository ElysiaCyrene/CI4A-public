"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textProps = exports.default = void 0;
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _omit = _interopRequireDefault(require("../_util/omit"));
var _warning = _interopRequireDefault(require("../_util/warning"));
var _Base = _interopRequireWildcard(require("./Base"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const textProps = () => (0, _extends2.default)((0, _extends2.default)({}, (0, _omit.default)((0, _Base.baseProps)(), ['component'])), {
  ellipsis: {
    type: [Boolean, Object],
    default: undefined
  }
});
exports.textProps = textProps;
const Text = (props, {
  slots,
  attrs
}) => {
  const {
    ellipsis
  } = props;
  (0, _warning.default)(typeof ellipsis !== 'object' || !ellipsis || !('expandable' in ellipsis) && !('rows' in ellipsis), 'Typography.Text', '`ellipsis` do not support `expandable` or `rows` props.');
  const textProps = (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, props), {
    ellipsis: ellipsis && typeof ellipsis === 'object' ? (0, _omit.default)(ellipsis, ['expandable', 'rows']) : ellipsis,
    component: 'span'
  }), attrs);
  return (0, _vue.createVNode)(_Base.default, textProps, slots);
};
Text.displayName = 'ATypographyText';
Text.inheritAttrs = false;
Text.props = textProps();
var _default = exports.default = Text;