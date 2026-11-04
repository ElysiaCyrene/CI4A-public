import { cloneVNode } from 'vue';
import { flattenChildren } from '../_util/props-util';
const Item = ({
  setRef
}, {
  slots
}) => {
  var _a;
  const children = flattenChildren((_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots));
  return children && children.length ? cloneVNode(children[0], {
    ref: setRef
  }) : children;
};
Item.props = {
  setRef: {
    type: Function,
    default: () => {}
  }
};
export default Item;