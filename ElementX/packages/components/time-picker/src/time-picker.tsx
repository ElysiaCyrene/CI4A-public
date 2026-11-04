import {
  defineComponent,
  onMounted,
  onUnmounted,
  provide,
  ref,
  shallowRef,
} from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { UPDATE_MODEL_EVENT } from '@element-plus/constants'
import {
  DEFAULT_FORMATS_TIME,
  PICKER_POPPER_OPTIONS_INJECTION_KEY,
} from './constants'
import Picker from './common/picker.vue'
import TimePickPanel from './time-picker-com/panel-time-pick.vue'
import TimeRangePanel from './time-picker-com/panel-time-range.vue'
import { timePickerDefaultProps } from './common/props'
import '@element-plus/utils/AgentApiRegistry'

dayjs.extend(customParseFormat)

export default defineComponent({
  name: 'ElTimePicker',
  install: null,
  props: {
    ...timePickerDefaultProps,
    /**
     * @description whether to pick a time range
     */
    isRange: Boolean,
  },
  emits: [UPDATE_MODEL_EVENT],
  setup(props, ctx) {
    const commonPicker = ref<InstanceType<typeof Picker>>()
    const [type, Panel] = props.isRange
      ? ['timerange', TimeRangePanel]
      : ['time', TimePickPanel]

    const modelUpdater = (value: any) => ctx.emit(UPDATE_MODEL_EVENT, value)
    provide(PICKER_POPPER_OPTIONS_INJECTION_KEY, props.popperOptions)

    const isRange = props.isRange
    const apiAttrs = shallowRef<any>({})
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        const regName = isRange ? 'timerangepicker' : 'timepicker'
        apiAttrs.value = window.__ci4a__.register(regName, {
          getTimeStatus: {
            handler: () => ({
              data: {
                value: props.modelValue,
                disabled: props.disabled,
                isRange,
                editable: props.editable ?? true,
                clearable: props.clearable ?? true,
                format: (props as any).format || 'HH:mm:ss',
                placeholder: (props as any).placeholder || '',
              },
            }),
            description:
              'Get time picker status including format for setValue reference.',
            params: [],
          },
          setTimeValue: {
            handler: (val: any) => {
              if (props.disabled)
                return { error: { code: 'COMPONENT_DISABLED' } }
              ctx.emit(UPDATE_MODEL_EVENT, val)
              return { data: { value: val } }
            },
            description: 'Set time value.',
            params: [{ name: 'value', type: 'string|array', required: true }],
          },
        })
      }
    })
    onUnmounted(() => {
      if (apiAttrs.value)
        window.__ci4a__?.unregister(apiAttrs.value['data-cid'])
    })

    ctx.expose({
      /**
       * @description focus the Input component
       */
      focus: () => {
        commonPicker.value?.focus()
      },
      /**
       * @description blur the Input component
       */
      blur: () => {
        commonPicker.value?.blur()
      },
      /**
       * @description open the TimePicker popper
       */
      handleOpen: () => {
        commonPicker.value?.handleOpen()
      },
      /**
       * @description close the TimePicker popper
       */
      handleClose: () => {
        commonPicker.value?.handleClose()
      },
    })

    return () => {
      const format = props.format ?? DEFAULT_FORMATS_TIME

      return (
        <span {...apiAttrs.value} style="display:inline-block">
          <Picker
            {...props}
            ref={commonPicker}
            type={type}
            format={format}
            onUpdate:modelValue={modelUpdater}
          >
            {{
              default: (props: any) => <Panel {...props} />,
            }}
          </Picker>
        </span>
      )
    }
  },
})
