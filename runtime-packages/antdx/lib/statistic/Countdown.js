"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.countdownProps = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _omit = _interopRequireDefault(require("../_util/omit"));
var _initDefaultProps = _interopRequireDefault(require("../_util/props-util/initDefaultProps"));
var _type = require("../_util/type");
var _Statistic = _interopRequireWildcard(require("./Statistic"));
var _utils = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const REFRESH_INTERVAL = 1000 / 30;
function getTime(value) {
  return new Date(value).getTime();
}
const countdownProps = () => {
  return (0, _extends2.default)((0, _extends2.default)({}, (0, _Statistic.statisticProps)()), {
    value: (0, _type.someType)([Number, String, Object]),
    format: String,
    onFinish: Function,
    onChange: Function
  });
};
exports.countdownProps = countdownProps;
var _default = exports.default = (0, _vue.defineComponent)({
  compatConfig: {
    MODE: 3
  },
  name: 'AStatisticCountdown',
  props: (0, _initDefaultProps.default)(countdownProps(), {
    format: 'HH:mm:ss'
  }),
  // emits: ['finish', 'change'],
  setup(props, {
    emit,
    slots
  }) {
    const countdownId = (0, _vue.ref)();
    const statistic = (0, _vue.ref)();
    const syncTimer = () => {
      const {
        value
      } = props;
      const timestamp = getTime(value);
      if (timestamp >= Date.now()) {
        startTimer();
      } else {
        stopTimer();
      }
    };
    const startTimer = () => {
      if (countdownId.value) return;
      const timestamp = getTime(props.value);
      countdownId.value = setInterval(() => {
        statistic.value.$forceUpdate();
        if (timestamp > Date.now()) {
          emit('change', timestamp - Date.now());
        }
        syncTimer();
      }, REFRESH_INTERVAL);
    };
    const stopTimer = () => {
      const {
        value
      } = props;
      if (countdownId.value) {
        clearInterval(countdownId.value);
        countdownId.value = undefined;
        const timestamp = getTime(value);
        if (timestamp < Date.now()) {
          emit('finish');
        }
      }
    };
    const formatCountdown = ({
      value,
      config
    }) => {
      const {
        format
      } = props;
      return (0, _utils.formatCountdown)(value, (0, _extends2.default)((0, _extends2.default)({}, config), {
        format
      }));
    };
    const valueRenderHtml = node => node;
    (0, _vue.onMounted)(() => {
      syncTimer();
    });
    (0, _vue.onUpdated)(() => {
      syncTimer();
    });
    (0, _vue.onBeforeUnmount)(() => {
      stopTimer();
    });
    return () => {
      const value = props.value;
      return (0, _vue.createVNode)(_Statistic.default, (0, _objectSpread2.default)({
        "ref": statistic
      }, (0, _extends2.default)((0, _extends2.default)({}, (0, _omit.default)(props, ['onFinish', 'onChange'])), {
        value,
        valueRender: valueRenderHtml,
        formatter: formatCountdown
      })), slots);
    };
  }
});