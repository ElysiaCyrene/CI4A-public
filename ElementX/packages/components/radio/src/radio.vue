<template>
  <label
    v-bind="apiAttrs"
    :class="[
      ns.b(),
      ns.is('disabled', disabled),
      ns.is('focus', focus),
      ns.is('bordered', border),
      ns.is('checked', modelValue === actualValue),
      ns.m(size),
    ]"
  >
    <span
      :class="[
        ns.e('input'),
        ns.is('disabled', disabled),
        ns.is('checked', modelValue === actualValue),
      ]"
    >
      <input
        ref="radioRef"
        v-model="modelValue"
        :class="ns.e('original')"
        :value="actualValue"
        :name="name || radioGroup?.name"
        :disabled="disabled"
        :checked="modelValue === actualValue"
        type="radio"
        @focus="focus = true"
        @blur="focus = false"
        @change="handleChange"
        @click.stop
      />
      <span :class="ns.e('inner')" />
    </span>
    <span :class="ns.e('label')" @keydown.stop>
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>

<script lang="ts" setup>
import { nextTick } from 'vue'
import { useNamespace } from '@element-plus/hooks'
import { useAgentApi } from '@element-plus/hooks/use-agent-api'
import '@element-plus/utils/AgentApiRegistry'
import { CHANGE_EVENT } from '@element-plus/constants'
import { type RadioProps, radioEmits, radioPropsDefaults } from './radio'
import { useRadio } from './use-radio'

defineOptions({
  name: 'ElRadio',
})

const props = withDefaults(defineProps<RadioProps>(), radioPropsDefaults)
const emit = defineEmits(radioEmits)

const ns = useNamespace('radio')
const { radioRef, radioGroup, focus, size, disabled, modelValue, actualValue } =
  useRadio(props, emit)

function handleChange() {
  nextTick(() => emit(CHANGE_EVENT, modelValue.value))
}

const apiAttrs = useAgentApi('radio', {
  getRadioStatus: {
    handler: () => ({
      data: {
        checked: modelValue.value === actualValue.value,
        value: actualValue.value,
        disabled: disabled.value,
      },
    }),
    description: 'Get radio state.',
    params: [],
  },
  setValue: {
    handler: () => {
      if (disabled.value) return { error: { code: 'COMPONENT_DISABLED' } }
      modelValue.value = actualValue.value
      return { data: { checked: true } }
    },
    description: 'Select this radio.',
    params: [],
  },
})
</script>
