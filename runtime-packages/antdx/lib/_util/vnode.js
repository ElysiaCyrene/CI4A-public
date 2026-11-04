"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cloneElement = cloneElement;
exports.cloneVNodes = cloneVNodes;
exports.customRenderSlot = customRenderSlot;
exports.deepCloneElement = deepCloneElement;
exports.triggerVNodeUpdate = triggerVNodeUpdate;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _propsUtil = require("./props-util");
var _vue = require("vue");
var _warning = _interopRequireDefault(require("./warning"));
function cloneElement(vnode, nodeProps = {}, override = true, mergeRef = false) {
  let ele = vnode;
  if (Array.isArray(vnode)) {
    ele = (0, _propsUtil.filterEmpty)(vnode)[0];
  }
  if (!ele) {
    return null;
  }
  const node = (0, _vue.cloneVNode)(ele, nodeProps, mergeRef);
  // cloneVNode内部是合并属性，这里改成覆盖属性
  node.props = override ? (0, _extends2.default)((0, _extends2.default)({}, node.props), nodeProps) : node.props;
  (0, _warning.default)(typeof node.props.class !== 'object', 'class must be string');
  return node;
}
function cloneVNodes(vnodes, nodeProps = {}, override = true) {
  return vnodes.map(vnode => cloneElement(vnode, nodeProps, override));
}
function deepCloneElement(vnode, nodeProps = {}, override = true, mergeRef = false) {
  if (Array.isArray(vnode)) {
    return vnode.map(item => deepCloneElement(item, nodeProps, override, mergeRef));
  } else {
    // 需要判断是否为vnode方可进行clone操作
    if (!(0, _vue.isVNode)(vnode)) {
      return vnode;
    }
    const cloned = cloneElement(vnode, nodeProps, override, mergeRef);
    if (Array.isArray(cloned.children)) {
      cloned.children = deepCloneElement(cloned.children);
    }
    return cloned;
  }
}
function triggerVNodeUpdate(vm, attrs, dom) {
  (0, _vue.render)((0, _vue.cloneVNode)(vm, (0, _extends2.default)({}, attrs)), dom);
}
const ensureValidVNode = slot => {
  return (slot || []).some(child => {
    if (!(0, _vue.isVNode)(child)) return true;
    if (child.type === _vue.Comment) return false;
    if (child.type === _vue.Fragment && !ensureValidVNode(child.children)) return false;
    return true;
  }) ? slot : null;
};
function customRenderSlot(slots, name, props, fallback) {
  var _a;
  const slot = (_a = slots[name]) === null || _a === void 0 ? void 0 : _a.call(slots, props);
  if (ensureValidVNode(slot)) {
    return slot;
  }
  return fallback === null || fallback === void 0 ? void 0 : fallback();
}