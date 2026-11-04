import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
var __rest = this && this.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
import { computed, ref, defineComponent, shallowRef, onMounted, onUnmounted, createVNode as _createVNode } from 'vue';
import VcSlider from '../vc-slider/src/Slider';
import VcRange from '../vc-slider/src/Range';
import VcHandle from '../vc-slider/src/Handle';
import { stringType, booleanType, someType, objectType, withInstall, functionType } from '../_util/type';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import SliderTooltip from './SliderTooltip';
import classNames from '../_util/classNames';
import { useInjectFormItemContext } from '../form/FormItemContext';
import '../_util/AgentApiRegistry';
// CSSINJS
import useStyle from './style';
import devWarning from '../vc-util/devWarning';
const defaultTipFormatter = value => typeof value === 'number' ? value.toString() : '';
export const sliderProps = () => ({
  id: String,
  prefixCls: String,
  tooltipPrefixCls: String,
  range: someType([Boolean, Object]),
  reverse: booleanType(),
  min: Number,
  max: Number,
  step: someType([Object, Number]),
  marks: objectType(),
  dots: booleanType(),
  value: someType([Array, Number]),
  defaultValue: someType([Array, Number]),
  included: booleanType(),
  disabled: booleanType(),
  vertical: booleanType(),
  tipFormatter: someType([Function, Object], () => defaultTipFormatter),
  tooltipOpen: booleanType(),
  /** @deprecated `tooltipVisible` is deprecated. Please use `tooltipOpen` instead. */
  tooltipVisible: booleanType(),
  tooltipPlacement: stringType(),
  getTooltipPopupContainer: functionType(),
  autofocus: booleanType(),
  handleStyle: someType([Array, Object]),
  trackStyle: someType([Array, Object]),
  onChange: functionType(),
  onAfterChange: functionType(),
  onFocus: functionType(),
  onBlur: functionType(),
  'onUpdate:value': functionType()
});
const Slider = defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'ASlider',
  inheritAttrs: false,
  props: sliderProps(),
  // emits: ['update:value', 'change', 'afterChange', 'blur'],
  slots: Object,
  setup(props, {
    attrs,
    slots,
    emit,
    expose
  }) {
    // Warning for deprecated usage
    if (process.env.NODE_ENV !== 'production') {
      [['tooltipVisible', 'tooltipOpen']].forEach(([deprecatedName, newName]) => {
        devWarning(props.tooltipVisible === undefined, 'Slider', `\`${deprecatedName}\` is deprecated, please use \`${newName}\` instead.`);
      });
    }
    const {
      prefixCls,
      rootPrefixCls,
      direction,
      getPopupContainer,
      configProvider
    } = useConfigInject('slider', props);
    // style
    const [wrapSSR, hashId] = useStyle(prefixCls);
    const formItemContext = useInjectFormItemContext();
    const sliderRef = ref();
    const innerValue = ref();
    const visibles = ref({});
    const toggleTooltipOpen = (index, visible) => {
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
      var _a;
      (_a = sliderRef.value) === null || _a === void 0 ? void 0 : _a.focus();
    };
    const blur = () => {
      var _a;
      (_a = sliderRef.value) === null || _a === void 0 ? void 0 : _a.blur();
    };
    const handleChange = val => {
      innerValue.value = val;
      emit('update:value', val);
      emit('change', val);
      formItemContext.onFieldChange();
    };
    const handleBlur = e => {
      emit('blur', e);
    };
    expose({
      focus,
      blur
    });
    const handleWithTooltip = _a => {
      var {
          tooltipPrefixCls
        } = _a,
        _b = _a.info,
        {
          value,
          dragging,
          index
        } = _b,
        restProps = __rest(_b, ["value", "dragging", "index"]);
      const {
        tipFormatter,
        tooltipOpen = props.tooltipVisible,
        getTooltipPopupContainer
      } = props;
      const isTipFormatter = tipFormatter ? visibles.value[index] || dragging : false;
      const open = tooltipOpen || tooltipOpen === undefined && isTipFormatter;
      return _createVNode(SliderTooltip, {
        "prefixCls": tooltipPrefixCls,
        "title": tipFormatter ? tipFormatter(value) : '',
        "open": open,
        "placement": tooltipPlacement.value,
        "transitionName": `${rootPrefixCls.value}-zoom-down`,
        "key": index,
        "overlayClassName": `${prefixCls.value}-tooltip`,
        "getPopupContainer": getTooltipPopupContainer || (getPopupContainer === null || getPopupContainer === void 0 ? void 0 : getPopupContainer.value)
      }, {
        default: () => [_createVNode(VcHandle, _objectSpread(_objectSpread({}, restProps), {}, {
          "value": value,
          "onMouseenter": () => toggleTooltipOpen(index, true),
          "onMouseleave": () => toggleTooltipOpen(index, false)
        }), null)]
      });
    };
    // ========== Agent API ===========
    const getSliderStatus = () => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
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
          range: props.range || false
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
        }
      };
    };
    const setSliderValue = value => {
      var _a, _b;
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      const min = (_a = props.min) !== null && _a !== void 0 ? _a : 0;
      const max = (_b = props.max) !== null && _b !== void 0 ? _b : 100;
      // 验证并规范化值
      let normalizedValue;
      if (props.range) {
        // 范围滑块
        if (Array.isArray(value)) {
          const [start, end] = value;
          // 确保值在min-max范围内
          const clampedStart = Math.max(min, Math.min(max, start));
          const clampedEnd = Math.max(min, Math.min(max, end));
          // 确保 start <= end
          normalizedValue = [Math.min(clampedStart, clampedEnd), Math.max(clampedStart, clampedEnd)];
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
      const markPoints = props.marks ? Object.keys(props.marks).map(Number).sort((a, b) => a - b) : [];
      // 辅助函数：找到最接近的有效值
      const getClosestValue = val => {
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
        normalizedValue = [getClosestValue(normalizedValue[0]), getClosestValue(normalizedValue[1])];
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
    const apiAttrs = shallowRef({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('slider', {
          getSliderStatus: {
            handler: getSliderStatus,
            description: 'Get the current status of the slider component, including current value, min, max, and step.'
          },
          setSliderValue: {
            handler: setSliderValue,
            description: 'Set the value of the slider component.',
            params: [{
              name: 'value',
              type: props.range ? '[number, number]' : 'number',
              required: true,
              description: 'The new value to set. Can be a number or an array of two numbers for range slider.'
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
          tooltipPrefixCls: customizeTooltipPrefixCls,
          range,
          id = formItemContext.id.value
        } = props,
        restProps = __rest(props, ["tooltipPrefixCls", "range", "id"]);
      const tooltipPrefixCls = configProvider.getPrefixCls('tooltip', customizeTooltipPrefixCls);
      const cls = classNames(attrs.class, {
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl'
      }, hashId.value);
      // make reverse default on rtl direction
      if (direction.value === 'rtl' && !restProps.vertical) {
        restProps.reverse = !restProps.reverse;
      }
      // extrack draggableTrack from range={{ ... }}
      let draggableTrack;
      if (typeof range === 'object') {
        draggableTrack = range.draggableTrack;
      }
      const mergedValue = props.value !== undefined ? props.value : innerValue.value;
      if (range) {
        return wrapSSR(_createVNode(VcRange, _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, attrs), apiAttrs.value), restProps), {}, {
          "step": restProps.step,
          "draggableTrack": draggableTrack,
          "class": cls,
          "ref": sliderRef,
          "value": mergedValue,
          "handle": info => handleWithTooltip({
            tooltipPrefixCls,
            prefixCls: prefixCls.value,
            info
          }),
          "prefixCls": prefixCls.value,
          "onChange": handleChange,
          "onBlur": handleBlur
        }), {
          mark: slots.mark
        }));
      }
      return wrapSSR(_createVNode(VcSlider, _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, attrs), apiAttrs.value), restProps), {}, {
        "id": id,
        "step": restProps.step,
        "class": cls,
        "ref": sliderRef,
        "value": mergedValue,
        "handle": info => handleWithTooltip({
          tooltipPrefixCls,
          prefixCls: prefixCls.value,
          info
        }),
        "prefixCls": prefixCls.value,
        "onChange": handleChange,
        "onBlur": handleBlur
      }), {
        mark: slots.mark
      }));
    };
  }
});
export default withInstall(Slider);