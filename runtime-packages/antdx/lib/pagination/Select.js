"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.MiddleSelect = void 0;
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _select = _interopRequireWildcard(require("../select"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
var _default = exports.default = (0, _vue.defineComponent)({
  name: 'MiniSelect',
  compatConfig: {
    MODE: 3
  },
  inheritAttrs: false,
  props: (0, _select.selectProps)(),
  Option: _select.default.Option,
  setup(props, {
    attrs,
    slots
  }) {
    return () => {
      const selelctProps = (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, props), {
        size: 'small'
      }), attrs);
      return (0, _vue.createVNode)(_select.default, selelctProps, slots);
    };
  }
});
const MiddleSelect = exports.MiddleSelect = (0, _vue.defineComponent)({
  name: 'MiddleSelect',
  inheritAttrs: false,
  props: (0, _select.selectProps)(),
  Option: _select.default.Option,
  setup(props, {
    attrs,
    slots
  }) {
    return () => {
      const selelctProps = (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, props), {
        size: 'middle'
      }), attrs);
      return (0, _vue.createVNode)(_select.default, selelctProps, slots);
    };
  }
});