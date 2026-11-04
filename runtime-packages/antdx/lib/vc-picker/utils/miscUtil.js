"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getDataOrAriaProps;
exports.getValue = getValue;
exports.leftPad = leftPad;
exports.toArray = toArray;
exports.tuple = void 0;
exports.updateValues = updateValues;
function leftPad(str, length, fill = '0') {
  let current = String(str);
  while (current.length < length) {
    current = `${fill}${str}`;
  }
  return current;
}
const tuple = (...args) => args;
exports.tuple = tuple;
function toArray(val) {
  if (val === null || val === undefined) {
    return [];
  }
  return Array.isArray(val) ? val : [val];
}
function getDataOrAriaProps(props) {
  const retProps = {};
  Object.keys(props).forEach(key => {
    if ((key.startsWith('data-') || key.startsWith('aria-') || key === 'role' || key === 'name') && !key.startsWith('data-__')) {
      retProps[key] = props[key];
    }
  });
  return retProps;
}
function getValue(values, index) {
  return values ? values[index] : null;
}
function updateValues(values, value, index) {
  const newValues = [getValue(values, 0), getValue(values, 1)];
  newValues[index] = typeof value === 'function' ? value(newValues[index]) : value;
  if (!newValues[0] && !newValues[1]) {
    return null;
  }
  return newValues;
}