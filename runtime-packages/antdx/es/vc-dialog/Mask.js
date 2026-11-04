import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { defineComponent, Transition, vShow as _vShow, createVNode as _createVNode, withDirectives as _withDirectives } from 'vue';
import { getTransitionProps } from '../_util/transition';
export default defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'DialogMask',
  props: {
    prefixCls: String,
    visible: Boolean,
    motionName: String,
    maskProps: Object
  },
  setup(props, {}) {
    return () => {
      const {
        prefixCls,
        visible,
        maskProps,
        motionName
      } = props;
      const transitionProps = getTransitionProps(motionName);
      return _createVNode(Transition, transitionProps, {
        default: () => [_withDirectives(_createVNode("div", _objectSpread({
          "class": `${prefixCls}-mask`
        }, maskProps), null), [[_vShow, visible]])]
      });
    };
  }
});