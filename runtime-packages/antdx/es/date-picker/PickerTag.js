import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { createVNode as _createVNode } from "vue";
import Tag from '../tag';
export default function PickerTag(props, {
  slots,
  attrs
}) {
  return _createVNode(Tag, _objectSpread(_objectSpread({
    "color": "blue"
  }, props), attrs), slots);
}