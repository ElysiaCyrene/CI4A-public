import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { createVNode as _createVNode } from "vue";
import Button from '../button';
const PickerButton = (props, {
  attrs,
  slots
}) => {
  return _createVNode(Button, _objectSpread(_objectSpread({
    "size": "small",
    "type": "primary"
  }, props), attrs), slots);
};
export default PickerButton;