"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _vue = require("vue");
var _menu = _interopRequireWildcard(require("../../menu"));
var _MentionsContext = _interopRequireDefault(require("./MentionsContext"));
var _spin = _interopRequireDefault(require("../../spin"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function noop() {}
var _default = exports.default = (0, _vue.defineComponent)({
  compatConfig: {
    MODE: 3
  },
  name: 'DropdownMenu',
  props: {
    prefixCls: String,
    options: {
      type: Array,
      default: () => []
    }
  },
  setup(props, {
    slots
  }) {
    const {
      activeIndex,
      setActiveIndex,
      selectOption,
      onFocus = noop,
      loading
    } = (0, _vue.inject)(_MentionsContext.default, {
      activeIndex: (0, _vue.shallowRef)(),
      loading: (0, _vue.shallowRef)(false)
    });
    let timeoutId;
    const onMousedown = e => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onFocus(e);
      });
    };
    (0, _vue.onBeforeUnmount)(() => {
      clearTimeout(timeoutId);
    });
    return () => {
      var _a;
      const {
        prefixCls,
        options
      } = props;
      const activeOption = options[activeIndex.value] || {};
      return (0, _vue.createVNode)(_menu.default, {
        "prefixCls": `${prefixCls}-menu`,
        "activeKey": activeOption.value,
        "onSelect": ({
          key
        }) => {
          const option = options.find(({
            value
          }) => value === key);
          selectOption(option);
        },
        "onMousedown": onMousedown
      }, {
        default: () => [!loading.value && options.map((option, index) => {
          var _a, _b;
          const {
            value,
            disabled,
            label = option.value,
            class: className,
            style
          } = option;
          return (0, _vue.createVNode)(_menu.Item, {
            "key": value,
            "disabled": disabled,
            "onMouseenter": () => {
              setActiveIndex(index);
            },
            "class": className,
            "style": style
          }, {
            default: () => [(_b = (_a = slots.option) === null || _a === void 0 ? void 0 : _a.call(slots, option)) !== null && _b !== void 0 ? _b : typeof label === 'function' ? label(option) : label]
          });
        }), !loading.value && options.length === 0 ? (0, _vue.createVNode)(_menu.Item, {
          "key": "notFoundContent",
          "disabled": true
        }, {
          default: () => [(_a = slots.notFoundContent) === null || _a === void 0 ? void 0 : _a.call(slots)]
        }) : null, loading.value && (0, _vue.createVNode)(_menu.Item, {
          "key": "loading",
          "disabled": true
        }, {
          default: () => [(0, _vue.createVNode)(_spin.default, {
            "size": "small"
          }, null)]
        })]
      });
    };
  }
});