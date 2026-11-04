import { shallowRef, onBeforeUnmount } from 'vue';
import raf from '../../../_util/raf';
export default function useRaf(callback) {
  const rafRef = shallowRef();
  const removedRef = shallowRef(false);
  function trigger(...args) {
    if (!removedRef.value) {
      raf.cancel(rafRef.value);
      rafRef.value = raf(() => {
        callback(...args);
      });
    }
  }
  onBeforeUnmount(() => {
    removedRef.value = true;
    raf.cancel(rafRef.value);
  });
  return trigger;
}
export function useRafState(defaultState) {
  const batchRef = shallowRef([]);
  const state = shallowRef(typeof defaultState === 'function' ? defaultState() : defaultState);
  const flushUpdate = useRaf(() => {
    let value = state.value;
    batchRef.value.forEach(callback => {
      value = callback(value);
    });
    batchRef.value = [];
    state.value = value;
  });
  function updater(callback) {
    batchRef.value.push(callback);
    flushUpdate();
  }
  return [state, updater];
}