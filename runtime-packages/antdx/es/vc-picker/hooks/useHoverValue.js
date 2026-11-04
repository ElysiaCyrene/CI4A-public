import raf from '../../_util/raf';
import { ref, onBeforeUnmount, watch } from 'vue';
import useValueTexts from './useValueTexts';
export default function useHoverValue(valueText, {
  formatList,
  generateConfig,
  locale
}) {
  const innerValue = ref(null);
  let rafId;
  function setValue(val, immediately = false) {
    raf.cancel(rafId);
    if (immediately) {
      innerValue.value = val;
      return;
    }
    rafId = raf(() => {
      innerValue.value = val;
    });
  }
  const [, firstText] = useValueTexts(innerValue, {
    formatList,
    generateConfig,
    locale
  });
  function onEnter(date) {
    setValue(date);
  }
  function onLeave(immediately = false) {
    setValue(null, immediately);
  }
  watch(valueText, () => {
    onLeave(true);
  });
  onBeforeUnmount(() => {
    raf.cancel(rafId);
  });
  return [firstText, onEnter, onLeave];
}