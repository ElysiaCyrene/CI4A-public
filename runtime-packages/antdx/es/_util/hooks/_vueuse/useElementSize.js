import { shallowRef, watch } from 'vue';
import { useResizeObserver } from './useResizeObserver';
import { unrefElement } from './unrefElement';
/**
 * Reactive size of an HTML element.
 *
 * @see https://vueuse.org/useElementSize
 * @param target
 * @param callback
 * @param options
 */
export function useElementSize(target, initialSize = {
  width: 0,
  height: 0
}, options = {}) {
  const {
    box = 'content-box'
  } = options;
  const width = shallowRef(initialSize.width);
  const height = shallowRef(initialSize.height);
  useResizeObserver(target, ([entry]) => {
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
  watch(() => unrefElement(target), ele => {
    width.value = ele ? initialSize.width : 0;
    height.value = ele ? initialSize.height : 0;
  });
  return {
    width,
    height
  };
}