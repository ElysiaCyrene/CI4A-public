"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DECADE_UNIT_DIFF = exports.DECADE_DISTANCE_COUNT = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _DecadeHeader = _interopRequireDefault(require("./DecadeHeader"));
var _DecadeBody = _interopRequireWildcard(require("./DecadeBody"));
var _uiUtil = require("../../utils/uiUtil");
var _useMergeProps = _interopRequireDefault(require("../../hooks/useMergeProps"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const DECADE_UNIT_DIFF = exports.DECADE_UNIT_DIFF = 10;
const DECADE_DISTANCE_COUNT = exports.DECADE_DISTANCE_COUNT = DECADE_UNIT_DIFF * 10;
function DecadePanel(_props) {
  const props = (0, _useMergeProps.default)(_props);
  const {
    prefixCls,
    onViewDateChange,
    generateConfig,
    viewDate,
    operationRef,
    onSelect,
    onPanelChange
  } = props;
  const panelPrefixCls = `${prefixCls}-decade-panel`;
  // ======================= Keyboard =======================
  operationRef.value = {
    onKeydown: event => (0, _uiUtil.createKeydownHandler)(event, {
      onLeftRight: diff => {
        onSelect(generateConfig.addYear(viewDate, diff * DECADE_UNIT_DIFF), 'key');
      },
      onCtrlLeftRight: diff => {
        onSelect(generateConfig.addYear(viewDate, diff * DECADE_DISTANCE_COUNT), 'key');
      },
      onUpDown: diff => {
        onSelect(generateConfig.addYear(viewDate, diff * DECADE_UNIT_DIFF * _DecadeBody.DECADE_COL_COUNT), 'key');
      },
      onEnter: () => {
        onPanelChange('year', viewDate);
      }
    })
  };
  // ==================== View Operation ====================
  const onDecadesChange = diff => {
    const newDate = generateConfig.addYear(viewDate, diff * DECADE_DISTANCE_COUNT);
    onViewDateChange(newDate);
    onPanelChange(null, newDate);
  };
  const onInternalSelect = date => {
    onSelect(date, 'mouse');
    onPanelChange('year', date);
  };
  return (0, _vue.createVNode)("div", {
    "class": panelPrefixCls
  }, [(0, _vue.createVNode)(_DecadeHeader.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, props), {}, {
    "prefixCls": prefixCls,
    "onPrevDecades": () => {
      onDecadesChange(-1);
    },
    "onNextDecades": () => {
      onDecadesChange(1);
    }
  }), null), (0, _vue.createVNode)(_DecadeBody.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, props), {}, {
    "prefixCls": prefixCls,
    "onSelect": onInternalSelect
  }), null)]);
}
DecadePanel.displayName = 'DecadePanel';
DecadePanel.inheritAttrs = false;
var _default = exports.default = DecadePanel;