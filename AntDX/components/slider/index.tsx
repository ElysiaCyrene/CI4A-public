import type { CSSProperties, VNodeTypes, ExtractPropTypes } from 'vue';
import { computed, ref, defineComponent, shallowRef, onMounted, onUnmounted } from 'vue';
import VcSlider from '../vc-slider/src/Slider';
import VcRange from '../vc-slider/src/Range';
import VcHandle from '../vc-slider/src/Handle';

import type { VueNode, CustomSlotsType } from '../_util/type';
import {
  stringType,
  booleanType,
  someType,
  objectType,
  withInstall,
  functionType,
} from '../_util/type';
import type { TooltipPlacement } from '../tooltip/Tooltip';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import SliderTooltip from './SliderTooltip';
import classNames from '../_util/classNames';
import { useInjectFormItemContext } from '../form/FormItemContext';
import type { FocusEventHandler } from '../_util/EventInterface';
import '../_util/AgentApiRegistry';

// CSSINJS
import useStyle from './style';
import devWarning from '../vc-util/devWarning';

export type SliderValue = number | [number, number];

export interface SliderMarks {
  [key: number]:
    | VueNode
    | {
        style: CSSProperties;
        label: any;
      };
}

interface HandleGeneratorInfo {
  value?: number;
  dragging?: boolean;
  index: number;
}
export interface SliderRange {
  draggableTrack?: boolean;
}
export type HandleGeneratorFn = (config: {
  tooltipPrefixCls?: string;
  prefixCls?: string;
  info: HandleGeneratorInfo;
}) => VNodeTypes;
type Value = [number, number] | number;

const defaultTipFormatter = (value: number) => (typeof value === 'number' ? value.toString() : '');
export const sliderProps = () => ({
  id: String,
  prefixCls: String,
  tooltipPrefixCls: String,
  range: someType<boolean | SliderRange>([Boolean, Object]),
  reverse: booleanType(),
  min: Number,
  max: Number,
  step: someType<null | number>([Object, Number]),
  marks: objectType<SliderMarks>(),
  dots: booleanType(),
  value: someType<Value>([Array, Number]),
  defaultValue: someType<Value>([Array, Number]),
  included: booleanType(),
  disabled: booleanType(),
  vertical: booleanType(),
  tipFormatter: someType<((value?: number) => any) | null>(
    [Function, Object],
    () => defaultTipFormatter,
  ),
  tooltipOpen: booleanType(),
  /** @deprecated `tooltipVisible` is deprecated. Please use `tooltipOpen` instead. */
  tooltipVisible: booleanType(),
  tooltipPlacement: stringType<TooltipPlacement>(),
  getTooltipPopupContainer: functionType<(triggerNode: HTMLElement) => HTMLElement>(),
  autofocus: booleanType(),
  handleStyle: someType<CSSProperties[] | CSSProperties>([Array, Object]),
  trackStyle: someType<CSSProperties[] | CSSProperties>([Array, Object]),
  onChange: functionType<(value: Value) => void>(),
  onAfterChange: functionType<(value: Value) => void>(),
  onFocus: functionType<FocusEventHandler>(),
  onBlur: functionType<FocusEventHandler>(),
  'onUpdate:value': functionType<(value: Value) => void>(),
});

export type SliderProps = Partial<ExtractPropTypes<ReturnType<typeof sliderProps>>>;
export type Visibles = { [index: number]: boolean };

const Slider = defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ASlider',
  inheritAttrs: false,
  props: sliderProps(),
  // emits: ['update:value', 'change', 'afterChange', 'blur'],
  slots: Object as CustomSlotsType<{
    mark?: any;
    default?: any;
  }>,
  setup(props, { attrs, slots, emit, expose }) {
    // Warning for deprecated usage
    if (process.env.NODE_ENV !== 'production') {
      [['tooltipVisible', 'tooltipOpen']].forEach(([deprecatedName, newName]) => {
        devWarning(
          props.tooltipVisible === undefined,
          'Slider',
          `\`${deprecatedName}\` is deprecated, please use \`${newName}\` instead.`,
        );
      });
    }
    const { prefixCls, rootPrefixCls, direction, getPopupContainer, configProvider } =
      useConfigInject('slider', props);

    // style
    const [wrapSSR, hashId] = useStyle(prefixCls);

    const formItemContext = useInjectFormItemContext();
    const sliderRef = ref();
    const innerValue = ref<SliderValue>();
    const visibles = ref<Visibles>({});
    const toggleTooltipOpen = (index: number, visible: boolean) => {
      visibles.value[index] = visible;
    };
    const tooltipPlacement = computed(() => {
      if (props.tooltipPlacement) {
        return props.tooltipPlacement;
      }
      if (!props.vertical) {
        return 'top';
      }
      return direction.value === 'rtl' ? 'left' : 'right';
    });

    const focus = () => {
      sliderRef.value?.focus();
    };
    const blur = () => {
      sliderRef.value?.blur();
    };
    const handleChange = (val: SliderValue) => {
      innerValue.value = val;
      emit('update:value', val);
      emit('change', val);
      formItemContext.onFieldChange();
    };
    const handleBlur = (e: FocusEvent) => {
      emit('blur', e);
    };
    expose({
      focus,
      blur,
    });
    const handleWithTooltip: HandleGeneratorFn = ({
      tooltipPrefixCls,
      info: { value, dragging, index, ...restProps },
    }) => {
      const { tipFormatter, tooltipOpen = props.tooltipVisible, getTooltipPopupContainer } = props;
      const isTipFormatter = tipFormatter ? visibles.value[index] || dragging : false;
      const open = tooltipOpen || (tooltipOpen === undefined && isTipFormatter);
      return (
        <SliderTooltip
          prefixCls={tooltipPrefixCls}
          title={tipFormatter ? tipFormatter(value) : ''}
          open={open}
          placement={tooltipPlacement.value}
          transitionName={`${rootPrefixCls.value}-zoom-down`}
          key={index}
          overlayClassName={`${prefixCls.value}-tooltip`}
          getPopupContainer={getTooltipPopupContainer || getPopupContainer?.value}
        >
          <VcHandle
            {...restProps}
            value={value}
            onMouseenter={() => toggleTooltipOpen(index, true)}
            onMouseleave={() => toggleTooltipOpen(index, false)}
          />
        </SliderTooltip>
      );
    };

    // ========== Agent API ===========

    const getSliderStatus = () => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }

      const currentValue = props.value !== undefined ? props.value : innerValue.value;

      return {
        data: {
          value: currentValue,
          // min: props.min,
          // max: props.max,
          // step: props.step,
          // disabled: props.disabled,
          range: props.range || false,
          // vertical: props.vertical,
          // reverse: props.reverse,
          // included: props.included,
          // marks: props.marks,
          // dots: props.dots,
          // // 对于范围滑块,提供额外的信息
          // ...(props.range && Array.isArray(currentValue)
          //   ? {
          //       startValue: currentValue[0],
          //       endValue: currentValue[1],
          //     }
          //   : {}),
        },
      };
    };

    const setSliderValue = (value: SliderValue) => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }

      const min = props.min ?? 0;
      const max = props.max ?? 100;

      // 验证并规范化值
      let normalizedValue: SliderValue;

      if (props.range) {
        // 范围滑块
        if (Array.isArray(value)) {
          const [start, end] = value;
          // 确保值在min-max范围内
          const clampedStart = Math.max(min, Math.min(max, start));
          const clampedEnd = Math.max(min, Math.min(max, end));
          // 确保 start <= end
          normalizedValue = [
            Math.min(clampedStart, clampedEnd),
            Math.max(clampedStart, clampedEnd),
          ];
        } else {
          // 如果传入单个值,转换为范围值
          const clampedValue = Math.max(min, Math.min(max, value));
          normalizedValue = [min, clampedValue];
        }
      } else {
        // 单值滑块
        if (Array.isArray(value)) {
          // 如果传入数组,取第一个值
          normalizedValue = Math.max(min, Math.min(max, value[0]));
        } else {
          normalizedValue = Math.max(min, Math.min(max, value));
        }
      }

      // 处理 marks 和 step
      const markPoints = props.marks
        ? Object.keys(props.marks)
            .map(Number)
            .sort((a, b) => a - b)
        : [];

      // 辅助函数：找到最接近的有效值
      const getClosestValue = (val: number): number => {
        // 如果有 marks,优先对齐到 marks 的点
        if (markPoints.length > 0) {
          // 找到最接近的 mark 点
          const closest = markPoints.reduce((prev, curr) => {
            return Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev;
          });

          // 如果设置了 step,检查该值是否也符合 step
          if (props.step !== null && props.step !== undefined) {
            const stepAligned = Math.round((val - min) / props.step) * props.step + min;
            // 如果最近的 mark 点和 step 对齐的点距离很近,优先使用 mark 点
            // 否则,如果值更接近 step 对齐的点,使用 step 对齐
            if (Math.abs(closest - val) <= Math.abs(stepAligned - val)) {
              return closest;
            }
            return stepAligned;
          }

          return closest;
        }

        // 如果没有 marks,只有 step
        if (props.step !== null && props.step !== undefined) {
          return Math.round((val - min) / props.step) * props.step + min;
        }

        return val;
      };

      // 应用值的对齐
      if (Array.isArray(normalizedValue)) {
        normalizedValue = [
          getClosestValue(normalizedValue[0]),
          getClosestValue(normalizedValue[1]),
        ];
      } else {
        normalizedValue = getClosestValue(normalizedValue);
      }

      // 如果值与当前值相同,则不触发更新
      const currentValue = props.value !== undefined ? props.value : innerValue.value;
      if (JSON.stringify(currentValue) === JSON.stringify(normalizedValue)) {
        return;
      }

      innerValue.value = normalizedValue;
      emit('update:value', normalizedValue);
      emit('change', normalizedValue);
      formItemContext.onFieldChange();
    };

    const apiAttrs = shallowRef<any>({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('slider', {
          getSliderStatus: {
            handler: getSliderStatus,
            description:
              'Get the current status of the slider component, including current value, min, max, and step.',
          },
          setSliderValue: {
            handler: setSliderValue,
            description: 'Set the value of the slider component.',
            params: [
              {
                name: 'value',
                type: props.range ? '[number, number]' : 'number',
                required: true,
                description:
                  'The new value to set. Can be a number or an array of two numbers for range slider.',
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
      const {
        tooltipPrefixCls: customizeTooltipPrefixCls,
        range,
        id = formItemContext.id.value,
        ...restProps
      } = props;
      const tooltipPrefixCls = configProvider.getPrefixCls('tooltip', customizeTooltipPrefixCls);
      const cls = classNames(
        attrs.class,
        {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        hashId.value,
      );

      // make reverse default on rtl direction
      if (direction.value === 'rtl' && !restProps.vertical) {
        restProps.reverse = !restProps.reverse;
      }

      // extrack draggableTrack from range={{ ... }}
      let draggableTrack: boolean | undefined;
      if (typeof range === 'object') {
        draggableTrack = range.draggableTrack;
      }

      const mergedValue = props.value !== undefined ? props.value : innerValue.value;

      if (range) {
        return wrapSSR(
          <VcRange
            {...attrs}
            {...apiAttrs.value}
            {...restProps}
            step={restProps.step!}
            draggableTrack={draggableTrack}
            class={cls}
            ref={sliderRef}
            value={mergedValue}
            handle={(info: HandleGeneratorInfo) =>
              handleWithTooltip({
                tooltipPrefixCls,
                prefixCls: prefixCls.value,
                info,
              })
            }
            prefixCls={prefixCls.value}
            onChange={handleChange}
            onBlur={handleBlur}
            v-slots={{ mark: slots.mark }}
          />,
        );
      }
      return wrapSSR(
        <VcSlider
          {...attrs}
          {...apiAttrs.value}
          {...restProps}
          id={id}
          step={restProps.step!}
          class={cls}
          ref={sliderRef}
          value={mergedValue}
          handle={(info: HandleGeneratorInfo) =>
            handleWithTooltip({
              tooltipPrefixCls,
              prefixCls: prefixCls.value,
              info,
            })
          }
          prefixCls={prefixCls.value}
          onChange={handleChange}
          onBlur={handleBlur}
          v-slots={{ mark: slots.mark }}
        />,
      );
    };
  },
});

export default withInstall(Slider);
