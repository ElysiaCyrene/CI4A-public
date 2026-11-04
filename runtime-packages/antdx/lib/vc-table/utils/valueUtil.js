"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getColumnsKey = getColumnsKey;
exports.getPathValue = getPathValue;
exports.mergeObject = mergeObject;
exports.validateValue = validateValue;
const INTERNAL_KEY_PREFIX = 'RC_TABLE_KEY';
function toArray(arr) {
  if (arr === undefined || arr === null) {
    return [];
  }
  return Array.isArray(arr) ? arr : [arr];
}
function getPathValue(record, path) {
  // Skip if path is empty
  if (!path && typeof path !== 'number') {
    return record;
  }
  const pathList = toArray(path);
  let current = record;
  for (let i = 0; i < pathList.length; i += 1) {
    if (!current) {
      return null;
    }
    const prop = pathList[i];
    current = current[prop];
  }
  return current;
}
function getColumnsKey(columns) {
  const columnKeys = [];
  const keys = {};
  columns.forEach(column => {
    const {
      key,
      dataIndex
    } = column || {};
    let mergedKey = key || toArray(dataIndex).join('-') || INTERNAL_KEY_PREFIX;
    while (keys[mergedKey]) {
      mergedKey = `${mergedKey}_next`;
    }
    keys[mergedKey] = true;
    columnKeys.push(mergedKey);
  });
  return columnKeys;
}
function mergeObject(...objects) {
  const merged = {};
  /* eslint-disable no-param-reassign */
  function fillProps(obj, clone) {
    if (clone) {
      Object.keys(clone).forEach(key => {
        const value = clone[key];
        if (value && typeof value === 'object') {
          obj[key] = obj[key] || {};
          fillProps(obj[key], value);
        } else {
          obj[key] = value;
        }
      });
    }
  }
  /* eslint-enable */
  objects.forEach(clone => {
    fillProps(merged, clone);
  });
  return merged;
}
function validateValue(val) {
  return val !== null && val !== undefined;
}