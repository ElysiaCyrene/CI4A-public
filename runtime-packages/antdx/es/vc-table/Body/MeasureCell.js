import { defineComponent, onMounted, ref, createTextVNode as _createTextVNode, createVNode as _createVNode } from 'vue';
import VCResizeObserver from '../../vc-resize-observer';
export default defineComponent({
  name: 'MeasureCell',
  props: ['columnKey'],
  setup(props, {
    emit
  }) {
    const tdRef = ref();
    onMounted(() => {
      if (tdRef.value) {
        emit('columnResize', props.columnKey, tdRef.value.offsetWidth);
      }
    });
    return () => {
      return _createVNode(VCResizeObserver, {
        "onResize": ({
          offsetWidth
        }) => {
          emit('columnResize', props.columnKey, offsetWidth);
        }
      }, {
        default: () => [_createVNode("td", {
          "ref": tdRef,
          "style": {
            padding: 0,
            border: 0,
            height: 0
          }
        }, [_createVNode("div", {
          "style": {
            height: 0,
            overflow: 'hidden'
          }
        }, [_createTextVNode("\xA0")])])]
      });
    };
  }
});