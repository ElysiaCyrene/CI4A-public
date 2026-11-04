"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMotion = getMotion;
function getMotion({
  prefixCls,
  animation,
  transitionName
}) {
  if (animation) {
    return {
      name: `${prefixCls}-${animation}`
    };
  }
  if (transitionName) {
    return {
      name: transitionName
    };
  }
  return {};
}