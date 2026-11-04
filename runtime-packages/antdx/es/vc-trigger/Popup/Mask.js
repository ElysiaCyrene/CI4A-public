import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { Transition, vShow as _vShow, createVNode as _createVNode, withDirectives as _withDirectives } from 'vue';
import { getMotion } from '../utils/motionUtil';
export default function Mask(props) {
  const {
    prefixCls,
    visible,
    zIndex,
    mask,
    maskAnimation,
    maskTransitionName
  } = props;
  if (!mask) {
    return null;
  }
  let motion = {};
  if (maskTransitionName || maskAnimation) {
    motion = getMotion({
      prefixCls,
      transitionName: maskTransitionName,
      animation: maskAnimation
    });
  }
  return _createVNode(Transition, _objectSpread({
    "appear": true
  }, motion), {
    default: () => [_withDirectives(_createVNode("div", {
      "style": {
        zIndex
      },
      "class": `${prefixCls}-mask`
    }, null), [[_vShow, visible]])]
  });
}
Mask.displayName = 'Mask';