"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _conductUtil = require("../../vc-tree/utils/conductUtil");
var _vue = require("vue");
var _default = (rawLabeledValues, rawHalfCheckedValues, treeConduction, keyEntities, maxLevel, levelEntities) => {
  const newRawCheckedValues = (0, _vue.shallowRef)([]);
  const newRawHalfCheckedValues = (0, _vue.shallowRef)([]);
  (0, _vue.watchEffect)(() => {
    let checkedKeys = rawLabeledValues.value.map(({
      value
    }) => value);
    let halfCheckedKeys = rawHalfCheckedValues.value.map(({
      value
    }) => value);
    const missingValues = checkedKeys.filter(key => !keyEntities.value[key]);
    if (treeConduction.value) {
      ({
        checkedKeys,
        halfCheckedKeys
      } = (0, _conductUtil.conductCheck)(checkedKeys, true, keyEntities.value, maxLevel.value, levelEntities.value));
    }
    newRawCheckedValues.value = Array.from(new Set([...missingValues, ...checkedKeys]));
    newRawHalfCheckedValues.value = halfCheckedKeys;
  });
  return [newRawCheckedValues, newRawHalfCheckedValues];
};
exports.default = _default;