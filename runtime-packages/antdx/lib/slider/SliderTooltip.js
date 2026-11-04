"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _tooltip = _interopRequireWildcard(require("../tooltip"));
var _raf = _interopRequireDefault(require("../_util/raf"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
var _default = exports.default = (0, _vue.defineComponent)({
  compatConfig: {
    MODE: 3
  },
  name: 'SliderTooltip',
  inheritAttrs: false,
  props: (0, _tooltip.tooltipProps)(),
  setup(props, {
    attrs,
    slots
  }) {
    const innerRef = (0, _vue.ref)(null);
    const rafRef = (0, _vue.ref)(null);
    function cancelKeepAlign() {
      _raf.default.cancel(rafRef.value);
      rafRef.value = null;
    }
    function keepAlign() {
      rafRef.value = (0, _raf.default)(() => {
        var _a;
        (_a = innerRef.value) === null || _a === void 0 ? void 0 : _a.forcePopupAlign();
        rafRef.value = null;
      });
    }
    const align = () => {
      cancelKeepAlign();
      if (props.open) {
        keepAlign();
      }
    };
    (0, _vue.watch)([() => props.open, () => props.title], () => {
      align();
    }, {
      flush: 'post',
      immediate: true
    });
    (0, _vue.onActivated)(() => {
      align();
    });
    (0, _vue.onBeforeUnmount)(() => {
      cancelKeepAlign();
    });
    return () => {
      return (0, _vue.createVNode)(_tooltip.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({
        "ref": innerRef
      }, props), attrs), slots);
    };
  }
});