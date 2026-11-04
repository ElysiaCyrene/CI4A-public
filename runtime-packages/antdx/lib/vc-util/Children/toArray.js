"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toArray;
var _propsUtil = require("../../_util/props-util");
function toArray(children, option = {}) {
  let ret = [];
  children.forEach(child => {
    if ((child === undefined || child === null) && !option.keepEmpty) {
      return;
    }
    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child));
    } else if ((0, _propsUtil.isFragment)(child) && child.props) {
      ret = ret.concat(toArray(child.props.children, option));
    } else {
      ret.push(child);
    }
  });
  return ret;
}