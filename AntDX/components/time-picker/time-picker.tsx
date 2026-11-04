import type { ExtractPropTypes } from 'vue';
import { defineComponent, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import type { RangePickerTimeProps } from '../date-picker/generatePicker';
import generatePicker from '../date-picker/generatePicker';
import {
  commonProps,
  datePickerProps,
  rangePickerProps,
} from '../date-picker/generatePicker/props';
import type { CommonProps, DatePickerProps } from '../date-picker/generatePicker/props';
import type { GenerateConfig } from '../vc-picker/generate';
import type { PanelMode, RangeValue } from '../vc-picker/interface';
import type { RangePickerSharedProps } from '../vc-picker/RangePicker';
import devWarning from '../vc-util/devWarning';
import { useInjectFormItemContext } from '../form/FormItemContext';
import omit from '../_util/omit';

import type { InputStatus } from '../_util/statusUtils';
import { booleanType, stringType } from '../_util/type';
import type { CustomSlotsType } from '../_util/type';
import '../_util/AgentApiRegistry';

export interface TimePickerLocale {
  placeholder?: string;
  rangePlaceholder?: [string, string];
}

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
  status: stringType<InputStatus>(),
});
type CommonTimePickerProps = Partial<ExtractPropTypes<ReturnType<typeof timePickerProps>>>;
export type TimeRangePickerProps<DateType> = Omit<
  RangePickerTimeProps<DateType>,
  'picker' | 'defaultPickerValue' | 'defaultValue' | 'value' | 'onChange' | 'onPanelChange' | 'onOk'
> & {
  popupClassName?: string;
  valueFormat?: string;
  defaultPickerValue?: RangeValue<DateType> | RangeValue<string>;
  defaultValue?: RangeValue<DateType> | RangeValue<string>;
  value?: RangeValue<DateType> | RangeValue<string>;
  onChange?: (
    value: RangeValue<DateType> | RangeValue<string> | null,
    dateString: [string, string],
  ) => void;
  'onUpdate:value'?: (value: RangeValue<DateType> | RangeValue<string> | null) => void;
  onPanelChange?: (
    values: RangeValue<DateType> | RangeValue<string>,
    modes: [PanelMode, PanelMode],
  ) => void;
  onOk?: (dates: RangeValue<DateType> | RangeValue<string>) => void;
};

export type TimePickerProps<DateType> = CommonProps<DateType> &
  DatePickerProps<DateType> &
  CommonTimePickerProps & {
    addon?: () => void;
  };

function createTimePicker<
  DateType,
  DTimePickerProps extends TimePickerProps<DateType> = TimePickerProps<DateType>,
  DTimeRangePickerProps extends TimeRangePickerProps<DateType> = TimeRangePickerProps<DateType>,
>(generateConfig: GenerateConfig<DateType>) {
  const DatePicker = generatePicker<DateType>(generateConfig, {
    ...timePickerProps(),
    order: { type: Boolean, default: true },
  });

  const { TimePicker: InternalTimePicker, RangePicker: InternalRangePicker } = DatePicker as any;
  const TimePicker = defineComponent<DTimePickerProps>({
    name: 'ATimePicker',
    inheritAttrs: false,
    props: {
      ...commonProps<any>(),
      ...datePickerProps<any>(),
      ...timePickerProps(),
      addon: { type: Function },
    } as any,
    slots: Object as CustomSlotsType<{
      addon?: any;
      renderExtraFooter?: any;
      suffixIcon?: any;
      clearIcon?: any;
      default: any;
    }>,
    setup(p, { slots, expose, emit, attrs }) {
      const props = p as unknown as DTimePickerProps;
      const formItemContext = useInjectFormItemContext();
      devWarning(
        !(slots.addon || props.addon),
        'TimePicker',
        '`addon` is deprecated. Please use `v-slot:renderExtraFooter` instead.',
      );
      const pickerRef = ref();
      const innerValue = ref<DateType | string>();

      expose({
        focus: () => {
          pickerRef.value?.focus();
        },
        blur: () => {
          pickerRef.value?.blur();
        },
      });
      const onChange = (value: DateType | string, dateString: string) => {
        innerValue.value = value;
        emit('update:value', value);
        emit('change', value, dateString);
        formItemContext.onFieldChange();
      };
      const onOpenChange = (open: boolean) => {
        emit('update:open', open);
        emit('openChange', open);
      };
      const onFocus = (e: FocusEvent) => {
        emit('focus', e);
      };
      const onBlur = (e: FocusEvent) => {
        emit('blur', e);
        formItemContext.onFieldBlur();
      };
      const onOk = (value: DateType) => {
        emit('ok', value);
      };

      // ===== Agent API =====

      const getTimepickerStatus = () => {
        if (props.disabled) {
          return {
            error: {
              code: 'COMPONENT_DISABLED',
            },
          };
        }
        return {
          data: {
            time: innerValue.value,
            metadata: {
              format: props.valueFormat || 'HH:mm:ss',
            },
          },
        };
      };

      const setTimeValue = (hour: number, minute: number, second?: number) => {
        if (props.disabled) {
          return {
            error: {
              code: 'COMPONENT_DISABLED',
            },
          };
        }

        const s = second === undefined || second === null ? 0 : second;
        const hh = String(hour).padStart(2, '0');
        const mm = String(minute).padStart(2, '0');
        const ss = String(s).padStart(2, '0');
        const timeString = `${hh}:${mm}:${ss}`;

        const formatStr = typeof props.format === 'string' ? props.format : 'HH:mm:ss';
        const newTime: DateType = props.valueFormat
          ? (generateConfig.toDate(timeString, props.valueFormat as string) as DateType)
          : (generateConfig.toDate(timeString, formatStr) as DateType);

        innerValue.value = newTime;
        emit('update:value', newTime);
        emit('change', newTime, timeString);
        formItemContext.onFieldChange();

        return {
          data: {
            time: timeString,
          },
        };
      };

      const apiAttrs = shallowRef<any>({});
      onMounted(() => {
        if (typeof window !== 'undefined' && window.__ci4a__) {
          apiAttrs.value = window.__ci4a__.register('timepicker', {
            getTimepickerStatus: {
              handler: getTimepickerStatus,
              description: 'Get the status of the time picker, including current value and format.',
              params: [],
            },
            setTimeValue: {
              handler: setTimeValue,
              description: 'Set the value of the time picker using numeric components.',
              params: [
                {
                  name: 'hour',
                  type: 'number',
                  description: 'Hour component (0-23)',
                },
                {
                  name: 'minute',
                  type: 'number',
                  description: 'Minute component (0-59)',
                },
                {
                  name: 'second',
                  type: 'number',
                  description: 'Second component (0-59), optional (defaults to 0)',
                },
              ],
            },
          });
        }
      });
      onUnmounted(() => {
        if (apiAttrs.value && window.__ci4a__) {
          window.__ci4a__.unregister(apiAttrs.value['data-cid']);
        }
      });

      return () => {
        const { id = formItemContext.id.value } = props;
        const mergedValue = props.value !== undefined ? props.value : innerValue.value;
        //restProps.addon
        return (
          <InternalTimePicker
            {...attrs}
            {...apiAttrs.value}
            {...omit(props, ['onUpdate:value', 'onUpdate:open'])}
            id={id}
            value={mergedValue}
            dropdownClassName={props.popupClassName}
            mode={undefined}
            ref={pickerRef}
            renderExtraFooter={
              props.addon || slots.addon || props.renderExtraFooter || slots.renderExtraFooter
            }
            onChange={onChange}
            onOpenChange={onOpenChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onOk={onOk}
            v-slots={slots}
          />
        );
      };
    },
  });

  const TimeRangePicker = defineComponent<DTimeRangePickerProps>({
    name: 'ATimeRangePicker',
    inheritAttrs: false,
    props: {
      ...commonProps<any>(),
      ...rangePickerProps<any>(),
      ...timePickerProps(),
      order: { type: Boolean, default: true },
    } as any,
    slots: Object as CustomSlotsType<{
      renderExtraFooter?: any;
      suffixIcon?: any;
      clearIcon?: any;
      default: any;
    }>,
    setup(p, { slots, expose, emit, attrs }) {
      const props = p as unknown as DTimeRangePickerProps;
      const pickerRef = ref();
      const formItemContext = useInjectFormItemContext();
      const innerValue = ref<RangeValue<DateType | string>>();

      expose({
        focus: () => {
          pickerRef.value?.focus();
        },
        blur: () => {
          pickerRef.value?.blur();
        },
      });
      const onChange = (
        values: RangeValue<string> | RangeValue<DateType>,
        dateStrings: [string, string],
      ) => {
        innerValue.value = values;
        emit('update:value', values);
        emit('change', values, dateStrings);
        formItemContext.onFieldChange();
      };
      const onOpenChange = (open: boolean) => {
        emit('update:open', open);
        emit('openChange', open);
      };
      const onFocus = (e: FocusEvent) => {
        emit('focus', e);
      };
      const onBlur = (e: FocusEvent) => {
        emit('blur', e);
        formItemContext.onFieldBlur();
      };
      const onPanelChange = (
        values: RangeValue<string> | RangeValue<DateType>,
        modes: [PanelMode, PanelMode],
      ) => {
        emit('panelChange', values, modes);
      };
      const onOk = (values: RangeValue<string | DateType>) => {
        emit('ok', values);
      };
      const onCalendarChange: RangePickerSharedProps<DateType>['onCalendarChange'] = (
        values: RangeValue<string> | RangeValue<DateType>,
        dateStrings: [string, string],
        info,
      ) => {
        emit('calendarChange', values, dateStrings, info);
      };

      // ===== Agent API =====

      const getTimepickerStatus = () => {
        if (props.disabled) {
          return {
            error: {
              code: 'COMPONENT_DISABLED',
            },
          };
        }
        return {
          data: {
            time: innerValue.value,
            metadata: {
              format: props.valueFormat || 'HH:mm:ss',
            },
          },
        };
      };

      const setTimerangeValues = (
        startHour: number,
        startMinute: number,
        startSecond: number | undefined,
        endHour: number,
        endMinute: number,
        endSecond: number | undefined,
      ) => {
        if (props.disabled) {
          return {
            error: {
              code: 'COMPONENT_DISABLED',
            },
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

        const newStartTime: DateType = props.valueFormat
          ? (generateConfig.toDate(startTimeString, props.valueFormat as string) as DateType)
          : (generateConfig.toDate(startTimeString, formatStr) as DateType);
        const newEndTime: DateType = props.valueFormat
          ? (generateConfig.toDate(endTimeString, props.valueFormat as string) as DateType)
          : (generateConfig.toDate(endTimeString, formatStr) as DateType);

        const values: RangeValue<DateType> = [newStartTime, newEndTime];
        innerValue.value = values;
        emit('update:value', values);
        emit('change', values, [startTimeString, endTimeString]);
        formItemContext.onFieldChange();

        return {
          data: {
            times: [startTimeString, endTimeString],
          },
        };
      };

      const apiAttrs = shallowRef<any>({});
      onMounted(() => {
        if (typeof window !== 'undefined' && window.__ci4a__) {
          apiAttrs.value = window.__ci4a__.register('timerangepicker', {
            getTimepickerStatus: {
              handler: getTimepickerStatus,
              description:
                'Get the status of the time range picker, including current values and format.',
              params: [],
            },
            setTimerangeValues: {
              handler: setTimerangeValues,
              description: 'Set the values of the time range picker using numeric components.',
              params: [
                { name: 'startHour', type: 'number', description: 'Start hour (0-23)' },
                { name: 'startMinute', type: 'number', description: 'Start minute (0-59)' },
                {
                  name: 'startSecond',
                  type: 'number',
                  description: 'Start second (0-59), optional (defaults to 0)',
                },
                { name: 'endHour', type: 'number', description: 'End hour (0-23)' },
                { name: 'endMinute', type: 'number', description: 'End minute (0-59)' },
                {
                  name: 'endSecond',
                  type: 'number',
                  description: 'End second (0-59), optional (defaults to 0)',
                },
              ],
            },
          });
        }
      });
      onUnmounted(() => {
        if (apiAttrs.value && window.__ci4a__) {
          window.__ci4a__.unregister(apiAttrs.value['data-cid']);
        }
      });

      return () => {
        const { id = formItemContext.id.value } = props;
        const mergedValue = props.value !== undefined ? props.value : innerValue.value;
        return (
          <InternalRangePicker
            {...attrs}
            {...apiAttrs.value}
            {...omit(props, ['onUpdate:open', 'onUpdate:value'] as any)}
            id={id}
            value={mergedValue}
            dropdownClassName={props.popupClassName}
            picker="time"
            mode={undefined}
            ref={pickerRef}
            onChange={onChange}
            onOpenChange={onOpenChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onPanelChange={onPanelChange}
            onOk={onOk}
            onCalendarChange={onCalendarChange}
            v-slots={slots}
          />
        );
      };
    },
  });

  return {
    TimePicker,
    TimeRangePicker,
  };
}

export default createTimePicker;
