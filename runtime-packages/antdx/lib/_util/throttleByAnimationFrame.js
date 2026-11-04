"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _raf = _interopRequireDefault(require("./raf"));
function throttleByAnimationFrame(fn) {
  let requestId;
  const later = args => () => {
    requestId = null;
    fn(...args);
  };
  const throttled = (...args) => {
    if (requestId == null) {
      requestId = (0, _raf.default)(later(args));
    }
  };
  throttled.cancel = () => {
    _raf.default.cancel(requestId);
    requestId = null;
  };
  return throttled;
}
var _default = exports.default = throttleByAnimationFrame;