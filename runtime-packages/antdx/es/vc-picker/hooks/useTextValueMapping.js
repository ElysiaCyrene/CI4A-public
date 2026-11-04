import { ref, watch } from 'vue';
export default function useTextValueMapping({
  valueTexts,
  onTextChange
}) {
  const text = ref('');
  function triggerTextChange(value) {
    text.value = value;
    onTextChange(value);
  }
  function resetText() {
    text.value = valueTexts.value[0];
  }
  watch(() => [...valueTexts.value], (cur, pre = []) => {
    if (cur.join('||') !== pre.join('||') && valueTexts.value.every(valText => valText !== text.value)) {
      resetText();
    }
  }, {
    immediate: true
  });
  return [text, triggerTextChange, resetText];
}