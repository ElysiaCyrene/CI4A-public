import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
  shallowRef,
  toRef,
} from 'vue'
import {
  CommonPicker,
  DEFAULT_FORMATS_DATE,
  DEFAULT_FORMATS_DATEPICKER,
  PICKER_POPPER_OPTIONS_INJECTION_KEY,
} from '@element-plus/components/time-picker'
import { UPDATE_MODEL_EVENT } from '@element-plus/constants'
import {
  ElDatePickerPanel,
  ROOT_PICKER_IS_DEFAULT_FORMAT_INJECTION_KEY,
} from '@element-plus/components/date-picker-panel'
import { datePickerProps } from './props'
import '@element-plus/utils/AgentApiRegistry'

import type {
  DateModelType,
  SingleOrRange,
} from '@element-plus/components/time-picker'
import type { DatePickerExpose } from './instance'

export default defineComponent({
  name: 'ElDatePicker',
  install: null,
  props: datePickerProps,
  emits: [UPDATE_MODEL_EVENT],
  setup(props, { expose, emit, slots }) {
    const isDefaultFormat = computed(() => {
      return !props.format
    })
    provide(ROOT_PICKER_IS_DEFAULT_FORMAT_INJECTION_KEY, isDefaultFormat)
    provide(
      PICKER_POPPER_OPTIONS_INJECTION_KEY,
      reactive(toRef(props, 'popperOptions'))
    )
    const commonPicker = ref<InstanceType<typeof CommonPicker>>()
    const refProps: DatePickerExpose = {
      focus: () => {
        commonPicker.value?.focus()
      },
      blur: () => {
        commonPicker.value?.blur()
      },
      handleOpen: () => {
        commonPicker.value?.handleOpen()
      },
      handleClose: () => {
        commonPicker.value?.handleClose()
      },
    }

    expose(refProps)

    const isRange = computed(() => props.type?.includes('range'))
    const apiAttrs = shallowRef<any>({})
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        const regName = isRange.value ? 'daterangepicker' : 'datepicker'
        const isR = isRange.value
        apiAttrs.value = window.__ci4a__.register(regName, {
          getDateStatus: {
            handler: () => ({
              data: {
                value: props.modelValue,
                type: props.type,
                isRange: isR,
                disabled: props.disabled,
                valueFormat: (props as any).valueFormat || 'YYYY-MM-DD',
              },
            }),
            description: isR
              ? 'Get date range picker status including format, valueFormat for setValue reference.'
              : 'Get date picker status including format, valueFormat for setValue reference.',
            params: [],
          },
          setDateValue: {
            handler: (val: any) => {
              if (props.disabled)
                return { error: { code: 'COMPONENT_DISABLED' } }
              emit(UPDATE_MODEL_EVENT, val)
              return { data: { value: val } }
            },
            description: 'Set date value.',
            params: [{ name: 'value', type: 'string|array', required: true }],
          },
          [isR ? 'setDateRangeValue' : 'setDateValue']: {
            handler: (val: any) => {
              if (props.disabled)
                return { error: { code: 'COMPONENT_DISABLED' } }
              emit(UPDATE_MODEL_EVENT, val)
              return { data: { value: val } }
            },
            description: 'Set date range value.',
            params: [
              {
                name: 'value',
                type: 'array',
                required: true,
                description: 'Array of [startDate, endDate].',
              },
            ],
          },
        })
      }
    })
    onUnmounted(() => {
      if (apiAttrs.value)
        window.__ci4a__?.unregister(apiAttrs.value['data-cid'])
    })

    const onModelValueUpdated = (val: SingleOrRange<DateModelType> | null) => {
      emit(UPDATE_MODEL_EVENT, val)
    }

    return () => {
      // since props always have all defined keys on it, {format, ...props} will always overwrite format
      // pick props.format or provide default value here before spreading
      const format =
        props.format ??
        (DEFAULT_FORMATS_DATEPICKER[props.type] || DEFAULT_FORMATS_DATE)

      return (
        <span {...apiAttrs.value} style="display:inline-block">
          <CommonPicker
            {...props}
            format={format}
            type={props.type}
            ref={commonPicker}
            onUpdate:modelValue={onModelValueUpdated}
          >
            {{
              default: (scopedProps: /**FIXME: remove any type */ any) => (
                <ElDatePickerPanel
                  disabled={props.disabled}
                  editable={props.editable}
                  border={false}
                  {...scopedProps}
                >
                  {slots}
                </ElDatePickerPanel>
              ),
              'range-separator': slots['range-separator'],
            }}
          </CommonPicker>
        </span>
      )
    }
  },
})
