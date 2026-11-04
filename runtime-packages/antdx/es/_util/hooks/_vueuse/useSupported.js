import { tryOnMounted } from './tryOnMounted';
import { shallowRef } from 'vue';
export function useSupported(callback, sync = false) {
  const isSupported = shallowRef();
  const update = () => isSupported.value = Boolean(callback());
  update();
  tryOnMounted(update, sync);
  return isSupported;
}