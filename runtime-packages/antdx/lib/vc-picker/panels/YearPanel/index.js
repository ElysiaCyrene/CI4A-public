"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.YEAR_DECADE_COUNT = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _YearHeader = _interopRequireDefault(require("./YearHeader"));
var _YearBody = _interopRequireWildcard(require("./YearBody"));
var _uiUtil = require("../../utils/uiUtil");
var _useMergeProps = _interopRequireDefault(require("../../hooks/useMergeProps"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const YEAR_DECADE_COUNT = exports.YEAR_DECADE_COUNT = 10;
function YearPanel(_props) {
  const props = (0, _useMergeProps.default)(_props);
  const {
    prefixCls,
    operationRef,
    onViewDateChange,
    generateConfig,
    value,
    viewDate,
    sourceMode,
    onSelect,
    onPanelChange
  } = props;
  const panelPrefixCls = `${prefixCls}-year-panel`;
  // ======================= Keyboard =======================
  operationRef.value = {
    onKeydown: event => (0, _uiUtil.createKeydownHandler)(event, {
      onLeftRight: diff => {
        onSelect(generateConfig.addYear(value || viewDate, diff), 'key');
      },
      onCtrlLeftRight: diff => {
        onSelect(generateConfig.addYear(value || viewDate, diff * YEAR_DECADE_COUNT), 'key');
      },
      onUpDown: diff => {
        onSelect(generateConfig.addYear(value || viewDate, diff * _YearBody.YEAR_COL_COUNT), 'key');
      },
      onEnter: () => {
        onPanelChange(sourceMode === 'date' ? 'date' : 'month', value || viewDate);
      }
    })
  };
  // ==================== View Operation ====================
  const onDecadeChange = diff => {
    const newDate = generateConfig.addYear(viewDate, diff * 10);
    onViewDateChange(newDate);
    onPanelChange(null, newDate);
  };
  return (0, _vue.createVNode)("div", {
    "class": panelPrefixCls
  }, [(0, _vue.createVNode)(_YearHeader.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, props), {}, {
    "prefixCls": prefixCls,
    "onPrevDecade": () => {
      onDecadeChange(-1);
    },
    "onNextDecade": () => {
      onDecadeChange(1);
    },
    "onDecadeClick": () => {
      onPanelChange('decade', viewDate);
    }
  }), null), (0, _vue.createVNode)(_YearBody.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, props), {}, {
    "prefixCls": prefixCls,
    "onSelect": date => {
      onPanelChange(sourceMode === 'date' ? 'date' : 'month', date);
      onSelect(date, 'mouse');
    }
  }), null)]);
}
YearPanel.displayName = 'YearPanel';
YearPanel.inheritAttrs = false;
var _default = exports.default = YearPanel;