import { createVNode as _createVNode } from "vue";
import _extends from "@babel/runtime/helpers/esm/extends";
/* eslint-disable */
const Track = (_, {
  attrs
}) => {
  const {
    included,
    vertical,
    style,
    class: className
  } = attrs;
  let {
    length,
    offset,
    reverse
  } = attrs;
  if (length < 0) {
    reverse = !reverse;
    length = Math.abs(length);
    offset = 100 - offset;
  }
  const positionStyle = vertical ? {
    [reverse ? 'top' : 'bottom']: `${offset}%`,
    [reverse ? 'bottom' : 'top']: 'auto',
    height: `${length}%`
  } : {
    [reverse ? 'right' : 'left']: `${offset}%`,
    [reverse ? 'left' : 'right']: 'auto',
    width: `${length}%`
  };
  const elStyle = _extends(_extends({}, style), positionStyle);
  return included ? _createVNode("div", {
    "class": className,
    "style": elStyle
  }, null) : null;
};
Track.inheritAttrs = false;
export default Track;