import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { createVNode as _createVNode } from "vue";
import _extends from "@babel/runtime/helpers/esm/extends";
import { defineComponent, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import generatePicker from '../date-picker/generatePicker';
import { commonProps, datePickerProps, rangePickerProps } from '../date-picker/generatePicker/props';
import devWarning from '../vc-util/devWarning';
import { useInjectFormItemContext } from '../form/FormItemContext';
import omit from '../_util/omit';
import { booleanType, stringType } from '../_util/type';
import '../_util/AgentApiRegistry';
export const timePickerProps = () => ({
  format: String,
  showNow: booleanType(),
  showHour: booleanType(),
  showMinute: booleanType(),
  showSecond: booleanType(),
  use12Hours: booleanType(),
  hourStep: Number,
  minuteStep: Number,
  secondStep: Number,
  hideDisabledOptions: booleanType(),
  popupClassName: String,
  status: stringType()
});
function createTimePicker(generateConfig) {
  const DatePicker = generatePicker(generateConfig, _extends(_extends({}, timePickerProps()), {
    order: {
      type: Boolean,
      default: true
    }
  }));
  const {
    TimePicker: InternalTimePicker,
    RangePicker: InternalRangePicker
  } = DatePicker;
  const TimePicker = defineComponent({
    name: 'ATimePicker',
    inheritAttrs: false,
    props: _extends(_extends(_extends(_extends({}, commonProps()), datePickerProps()), timePickerProps()), {
      addon: {
        type: Function
      }
    }),
    slots: Object,
    setup(p, {
      slots,
      expose,
      emit,
      attrs
    }) {
      const props = p;
      const formItemContext = useInjectFormItemContext();
      devWarning(!(slots.addon || props.addon), 'TimePicker', '`addon` is deprecated. Please use `v-slot:renderExtraFooter` instead.');
      const pickerRef = ref();
      const innerValue = ref();
      expose({
        focus: () => {
          var _a;
          (_a = pickerRef.value) === null || _a === void 0 ? void 0 : _a.focus();
        },
        blur: () => {
          var _a;
          (_a = pickerRef.value) === null || _a === void 0 ? void 0 : _a.blur();
        }
      });
      const onChange = (value, dateString) => {
        innerValue.value = value;
        emit('update:value', value);
        emit('change', value, dateString);
        formItemContext.onFieldChange();
      };
      const onOpenChange = open => {
        emit('update:open', open);
        emit('openChange', open);
      };
      const onFocus = e => {
        emit('focus', e);
      };
      const onBlur = e => {
        emit('blur', e);
        formItemContext.onFieldBlur();
      };
      const onOk = value => {
        emit('ok', value);
      };
      // ===== Agent API =====
      const getTimepickerStatus = () => {
        if (props.disabled) {
          return {
            error: {
              code: 'COMPONENT_DISABLED'
            }
          };
        }
        return {
          data: {
            time: innerValue.value,
            metadata: {
              format: props.valueFormat || 'HH:mm:ss'
            }
          }
        };
      };
      const setTimeValue = (hour, minute, second) => {
        if (props.disabled) {
          return {
            error: {
              code: 'COMPONENT_DISABLED'
            }
          };
        }
        const s = second === undefined || second === null ? 0 : second;
        const hh = String(hour).padStart(2, '0');
        const mm = String(minute).padStart(2, '0');
        const ss = String(s).padStart(2, '0');
        const timeString = `${hh}:${mm}:${ss}`;
        const formatStr = typeof props.format === 'string' ? props.format : 'HH:mm:ss';
        const newTime = props.valueFormat ? generateConfig.toDate(timeString, props.valueFormat) : generateConfig.toDate(timeString, formatStr);
        innerValue.value = newTime;
        emit('update:value', newTime);
        emit('change', newTime, timeString);
        formItemContext.onFieldChange();
        return {
          data: {
            time: timeString
          }
        };
      };
      const apiAttrs = shallowRef({});
      onMounted(() => {
        if (typeof window !== 'undefined' && window.__ci4a__) {
          apiAttrs.value = window.__ci4a__.register('timepicker', {
            getTimepickerStatus: {
              handler: getTimepickerStatus,
              description: 'Get the status of the time picker, including current value and format.',
              params: []
            },
            setTimeValue: {
              handler: setTimeValue,
              description: 'Set the value of the time picker using numeric components.',
              params: [{
                name: 'hour',
                type: 'number',
                description: 'Hour component (0-23)'
              }, {
                name: 'minute',
                type: 'number',
                description: 'Minute component (0-59)'
              }, {
                name: 'second',
                type: 'number',
                description: 'Second component (0-59), optional (defaults to 0)'
              }]
            }
          });
        }
      });
      onUnmounted(() => {
        if (apiAttrs.value && window.__ci4a__) {
          window.__ci4a__.unregister(apiAttrs.value['data-cid']);
        }
      });
      return () => {
        const {
          id = formItemContext.id.value
        } = props;
        const mergedValue = props.value !== undefined ? props.value : innerValue.value;
        //restProps.addon
        return _createVNode(InternalTimePicker, _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, attrs), apiAttrs.value), omit(props, ['onUpdate:value', 'onUpdate:open'])), {}, {
          "id": id,
          "value": mergedValue,
          "dropdownClassName": props.popupClassName,
          "mode": undefined,
          "ref": pickerRef,
          "renderExtraFooter": props.addon || slots.addon || props.renderExtraFooter || slots.renderExtraFooter,
          "onChange": onChange,
          "onOpenChange": onOpenChange,
          "onFocus": onFocus,
          "onBlur": onBlur,
          "onOk": onOk
        }), slots);
      };
    }
  });
  const TimeRangePicker = defineComponent({
    name: 'ATimeRangePicker',
    inheritAttrs: false,
    props: _extends(_extends(_extends(_extends({}, commonProps()), rangePickerProps()), timePickerProps()), {
      order: {
        type: Boolean,
        default: true
      }
    }),
    slots: Object,
    setup(p, {
      slots,
      expose,
      emit,
      attrs
    }) {
      const props = p;
      const pickerRef = ref();
      const formItemContext = useInjectFormItemContext();
      const innerValue = ref();
      expose({
        focus: () => {
          var _a;
          (_a = pickerRef.value) === null || _a === void 0 ? void 0 : _a.focus();
        },
        blur: () => {
          var _a;
          (_a = pickerRef.value) === null || _a === void 0 ? void 0 : _a.blur();
        }
      });
      const onChange = (values, dateStrings) => {
        innerValue.value = values;
        emit('update:value', values);
        emit('change', values, dateStrings);
        formItemContext.onFieldChange();
      };
      const onOpenChange = open => {
        emit('update:open', open);
        emit('openChange', open);
      };
      const onFocus = e => {
        emit('focus', e);
      };
      const onBlur = e => {
        emit('blur', e);
        formItemContext.onFieldBlur();
      };
      const onPanelChange = (values, modes) => {
        emit('panelChange', values, modes);
      };
      const onOk = values => {
        emit('ok', values);
      };
      const onCalendarChange = (values, dateStrings, info) => {
        emit('calendarChange', values, dateStrings, info);
      };
      // ===== Agent API =====
      const getTimepickerStatus = () => {
        if (props.disabled) {
          return {
            error: {
              code: 'COMPONENT_DISABLED'
            }
          };
        }
        return {
          data: {
            time: innerValue.value,
            metadata: {
              format: props.valueFormat || 'HH:mm:ss'
            }
          }
        };
      };
      const setTimerangeValues = (startHour, startMinute, startSecond, endHour, endMinute, endSecond) => {
        if (props.disabled) {
          return {
            error: {
              code: 'COMPONENT_DISABLED'
            }
          };
        }
        const ss = startSecond === undefined || startSecond === null ? 0 : startSecond;
        const es = endSecond === undefined || endSecond === null ? 0 : endSecond;
        const sh = String(startHour).padStart(2, '0');
        const sm = String(startMinute).padStart(2, '0');
        const ssStr = String(ss).padStart(2, '0');
        const eh = String(endHour).padStart(2, '0');
        const em = String(endMinute).padStart(2, '0');
        const esStr = String(es).padStart(2, '0');
        const startTimeString = `${sh}:${sm}:${ssStr}`;
        const endTimeString = `${eh}:${em}:${esStr}`;
        const formatStr = typeof props.format === 'string' ? props.format : 'HH:mm:ss';
        const newStartTime = props.valueFormat ? generateConfig.toDate(startTimeString, props.valueFormat) : generateConfig.toDate(startTimeString, formatStr);
        const newEndTime = props.valueFormat ? generateConfig.toDate(endTimeString, props.valueFormat) : generateConfig.toDate(endTimeString, formatStr);
        const values = [newStartTime, newEndTime];
        innerValue.value = values;
        emit('update:value', values);
        emit('change', values, [startTimeString, endTimeString]);
        formItemContext.onFieldChange();
        return {
          data: {
            times: [startTimeString, endTimeString]
          }
        };
      };
      const apiAttrs = shallowRef({});
      onMounted(() => {
        if (typeof window !== 'undefined' && window.__ci4a__) {
          apiAttrs.value = window.__ci4a__.register('timerangepicker', {
            getTimepickerStatus: {
              handler: getTimepickerStatus,
              description: 'Get the status of the time range picker, including current values and format.',
              params: []
            },
            setTimerangeValues: {
              handler: setTimerangeValues,
              description: 'Set the values of the time range picker using numeric components.',
              params: [{
                name: 'startHour',
                type: 'number',
                description: 'Start hour (0-23)'
              }, {
                name: 'startMinute',
                type: 'number',
                description: 'Start minute (0-59)'
              }, {
                name: 'startSecond',
                type: 'number',
                description: 'Start second (0-59), optional (defaults to 0)'
              }, {
                name: 'endHour',
                type: 'number',
                description: 'End hour (0-23)'
              }, {
                name: 'endMinute',
                type: 'number',
                description: 'End minute (0-59)'
              }, {
                name: 'endSecond',
                type: 'number',
                description: 'End second (0-59), optional (defaults to 0)'
              }]
            }
          });
        }
      });
      onUnmounted(() => {
        if (apiAttrs.value && window.__ci4a__) {
          window.__ci4a__.unregister(apiAttrs.value['data-cid']);
        }
      });
      return () => {
        const {
          id = formItemContext.id.value
        } = props;
        const mergedValue = props.value !== undefined ? props.value : innerValue.value;
        return _createVNode(InternalRangePicker, _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, attrs), apiAttrs.value), omit(props, ['onUpdate:open', 'onUpdate:value'])), {}, {
          "id": id,
          "value": mergedValue,
          "dropdownClassName": props.popupClassName,
          "picker": "time",
          "mode": undefined,
          "ref": pickerRef,
          "onChange": onChange,
          "onOpenChange": onOpenChange,
          "onFocus": onFocus,
          "onBlur": onBlur,
          "onPanelChange": onPanelChange,
          "onOk": onOk,
          "onCalendarChange": onCalendarChange
        }), slots);
      };
    }
  });
  return {
    TimePicker,
    TimeRangePicker
  };
}
export default createTimePicker;