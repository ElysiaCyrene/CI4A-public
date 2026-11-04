"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timePickerProps = exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _generatePicker = _interopRequireDefault(require("../date-picker/generatePicker"));
var _props = require("../date-picker/generatePicker/props");
var _devWarning = _interopRequireDefault(require("../vc-util/devWarning"));
var _FormItemContext = require("../form/FormItemContext");
var _omit = _interopRequireDefault(require("../_util/omit"));
var _type = require("../_util/type");
require("../_util/AgentApiRegistry");
const timePickerProps = () => ({
  format: String,
  showNow: (0, _type.booleanType)(),
  showHour: (0, _type.booleanType)(),
  showMinute: (0, _type.booleanType)(),
  showSecond: (0, _type.booleanType)(),
  use12Hours: (0, _type.booleanType)(),
  hourStep: Number,
  minuteStep: Number,
  secondStep: Number,
  hideDisabledOptions: (0, _type.booleanType)(),
  popupClassName: String,
  status: (0, _type.stringType)()
});
exports.timePickerProps = timePickerProps;
function createTimePicker(generateConfig) {
  const DatePicker = (0, _generatePicker.default)(generateConfig, (0, _extends2.default)((0, _extends2.default)({}, timePickerProps()), {
    order: {
      type: Boolean,
      default: true
    }
  }));
  const {
    TimePicker: InternalTimePicker,
    RangePicker: InternalRangePicker
  } = DatePicker;
  const TimePicker = (0, _vue.defineComponent)({
    name: 'ATimePicker',
    inheritAttrs: false,
    props: (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, (0, _props.commonProps)()), (0, _props.datePickerProps)()), timePickerProps()), {
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
      const formItemContext = (0, _FormItemContext.useInjectFormItemContext)();
      (0, _devWarning.default)(!(slots.addon || props.addon), 'TimePicker', '`addon` is deprecated. Please use `v-slot:renderExtraFooter` instead.');
      const pickerRef = (0, _vue.ref)();
      const innerValue = (0, _vue.ref)();
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
      const apiAttrs = (0, _vue.shallowRef)({});
      (0, _vue.onMounted)(() => {
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
      (0, _vue.onUnmounted)(() => {
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
        return (0, _vue.createVNode)(InternalTimePicker, (0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)({}, attrs), apiAttrs.value), (0, _omit.default)(props, ['onUpdate:value', 'onUpdate:open'])), {}, {
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
  const TimeRangePicker = (0, _vue.defineComponent)({
    name: 'ATimeRangePicker',
    inheritAttrs: false,
    props: (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, (0, _props.commonProps)()), (0, _props.rangePickerProps)()), timePickerProps()), {
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
      const pickerRef = (0, _vue.ref)();
      const formItemContext = (0, _FormItemContext.useInjectFormItemContext)();
      const innerValue = (0, _vue.ref)();
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
      const apiAttrs = (0, _vue.shallowRef)({});
      (0, _vue.onMounted)(() => {
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
      (0, _vue.onUnmounted)(() => {
        if (apiAttrs.value && window.__ci4a__) {
          window.__ci4a__.unregister(apiAttrs.value['data-cid']);
        }
      });
      return () => {
        const {
          id = formItemContext.id.value
        } = props;
        const mergedValue = props.value !== undefined ? props.value : innerValue.value;
        return (0, _vue.createVNode)(InternalRangePicker, (0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)({}, attrs), apiAttrs.value), (0, _omit.default)(props, ['onUpdate:open', 'onUpdate:value'])), {}, {
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
var _default = exports.default = createTimePicker;