import { createVNode as _createVNode } from "vue";
import _extends from "@babel/runtime/helpers/esm/extends";
import { defineComponent } from 'vue';
import VcSelect, { selectProps } from '../select';
export default defineComponent({
  name: 'MiniSelect',
  compatConfig: {
    MODE: 3
  },
  inheritAttrs: false,
  props: selectProps(),
  Option: VcSelect.Option,
  setup(props, {
    attrs,
    slots
  }) {
    return () => {
      const selelctProps = _extends(_extends(_extends({}, props), {
        size: 'small'
      }), attrs);
      return _createVNode(VcSelect, selelctProps, slots);
    };
  }
});
export const MiddleSelect = defineComponent({
  name: 'MiddleSelect',
  inheritAttrs: false,
  props: selectProps(),
  Option: VcSelect.Option,
  setup(props, {
    attrs,
    slots
  }) {
    return () => {
      const selelctProps = _extends(_extends(_extends({}, props), {
        size: 'middle'
      }), attrs);
      return _createVNode(VcSelect, selelctProps, slots);
    };
  }
});