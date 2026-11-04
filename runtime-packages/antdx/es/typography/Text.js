import { createVNode as _createVNode } from "vue";
import _extends from "@babel/runtime/helpers/esm/extends";
import omit from '../_util/omit';
import warning from '../_util/warning';
import Base, { baseProps } from './Base';
export const textProps = () => _extends(_extends({}, omit(baseProps(), ['component'])), {
  ellipsis: {
    type: [Boolean, Object],
    default: undefined
  }
});
const Text = (props, {
  slots,
  attrs
}) => {
  const {
    ellipsis
  } = props;
  warning(typeof ellipsis !== 'object' || !ellipsis || !('expandable' in ellipsis) && !('rows' in ellipsis), 'Typography.Text', '`ellipsis` do not support `expandable` or `rows` props.');
  const textProps = _extends(_extends(_extends({}, props), {
    ellipsis: ellipsis && typeof ellipsis === 'object' ? omit(ellipsis, ['expandable', 'rows']) : ellipsis,
    component: 'span'
  }), attrs);
  return _createVNode(Base, textProps, slots);
};
Text.displayName = 'ATypographyText';
Text.inheritAttrs = false;
Text.props = textProps();
export default Text;