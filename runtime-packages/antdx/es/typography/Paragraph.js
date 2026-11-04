import { createVNode as _createVNode } from "vue";
import _extends from "@babel/runtime/helpers/esm/extends";
import omit from '../_util/omit';
import Base, { baseProps } from './Base';
export const paragraphProps = () => omit(baseProps(), ['component']);
const Paragraph = (props, {
  slots,
  attrs
}) => {
  const paragraphProps = _extends(_extends(_extends({}, props), {
    component: 'div'
  }), attrs);
  return _createVNode(Base, paragraphProps, slots);
};
Paragraph.displayName = 'ATypographyParagraph';
Paragraph.inheritAttrs = false;
Paragraph.props = paragraphProps();
export default Paragraph;