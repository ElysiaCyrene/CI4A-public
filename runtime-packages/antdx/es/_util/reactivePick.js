import { reactive, toRef } from 'vue';
import fromPairs from 'lodash-es/fromPairs';
/**
 * Reactively pick fields from a reactive object
 *
 * @see https://vueuse.js.org/reactivePick
 */
export function reactivePick(obj, ...keys) {
  return reactive(fromPairs(keys.map(k => [k, toRef(obj, k)])));
}