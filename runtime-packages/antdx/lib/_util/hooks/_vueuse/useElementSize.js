"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useElementSize = useElementSize;
var _vue = require("vue");
var _useResizeObserver = require("./useResizeObserver");
var _unrefElement = require("./unrefElement");
/**
 * Reactive size of an HTML element.
 *
 * @see https://vueuse.org/useElementSize
 * @param target
 * @param callback
 * @param options
 */
function useElementSize(target, initialSize = {
  width: 0,
  height: 0
}, options = {}) {
  const {
    box = 'content-box'
  } = options;
  const width = (0, _vue.shallowRef)(initialSize.width);
  const height = (0, _vue.shallowRef)(initialSize.height);
  (0, _useResizeObserver.useResizeObserver)(target, ([entry]) => {
    const boxSize = box === 'border-box' ? entry.borderBoxSize : box === 'content-box' ? entry.contentBoxSize : entry.devicePixelContentBoxSize;
    if (boxSize) {
      width.value = boxSize.reduce((acc, {
        inlineSize
      }) => acc + inlineSize, 0);
      height.value = boxSize.reduce((acc, {
        blockSize
      }) => acc + blockSize, 0);
    } else {
      // fallback
      width.value = entry.contentRect.width;
      height.value = entry.contentRect.height;
    }
  }, options);
  (0, _vue.watch)(() => (0, _unrefElement.unrefElement)(target), ele => {
    width.value = ele ? initialSize.width : 0;
    height.value = ele ? initialSize.height : 0;
  });
  return {
    width,
    height
  };
}