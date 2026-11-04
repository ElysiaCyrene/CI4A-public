"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useHoverValue;
var _raf = _interopRequireDefault(require("../../_util/raf"));
var _vue = require("vue");
var _useValueTexts = _interopRequireDefault(require("./useValueTexts"));
function useHoverValue(valueText, {
  formatList,
  generateConfig,
  locale
}) {
  const innerValue = (0, _vue.ref)(null);
  let rafId;
  function setValue(val, immediately = false) {
    _raf.default.cancel(rafId);
    if (immediately) {
      innerValue.value = val;
      return;
    }
    rafId = (0, _raf.default)(() => {
      innerValue.value = val;
    });
  }
  const [, firstText] = (0, _useValueTexts.default)(innerValue, {
    formatList,
    generateConfig,
    locale
  });
  function onEnter(date) {
    setValue(date);
  }
  function onLeave(immediately = false) {
    setValue(null, immediately);
  }
  (0, _vue.watch)(valueText, () => {
    onLeave(true);
  });
  (0, _vue.onBeforeUnmount)(() => {
    _raf.default.cancel(rafId);
  });
  return [firstText, onEnter, onLeave];
}