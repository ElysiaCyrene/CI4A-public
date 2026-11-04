"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sliderProps = exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _Slider = _interopRequireDefault(require("../vc-slider/src/Slider"));
var _Range = _interopRequireDefault(require("../vc-slider/src/Range"));
var _Handle = _interopRequireDefault(require("../vc-slider/src/Handle"));
var _type = require("../_util/type");
var _useConfigInject = _interopRequireDefault(require("../config-provider/hooks/useConfigInject"));
var _SliderTooltip = _interopRequireDefault(require("./SliderTooltip"));
var _classNames = _interopRequireDefault(require("../_util/classNames"));
var _FormItemContext = require("../form/FormItemContext");
require("../_util/AgentApiRegistry");
var _style = _interopRequireDefault(require("./style"));
var _devWarning = _interopRequireDefault(require("../vc-util/devWarning"));
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};

// CSSINJS

const defaultTipFormatter = value => typeof value === 'number' ? value.toString() : '';
const sliderProps = () => ({
  id: String,
  prefixCls: String,
  tooltipPrefixCls: String,
  range: (0, _type.someType)([Boolean, Object]),
  reverse: (0, _type.booleanType)(),
  min: Number,
  max: Number,
  step: (0, _type.someType)([Object, Number]),
  marks: (0, _type.objectType)(),
  dots: (0, _type.booleanType)(),
  value: (0, _type.someType)([Array, Number]),
  defaultValue: (0, _type.someType)([Array, Number]),
  included: (0, _type.booleanType)(),
  disabled: (0, _type.booleanType)(),
  vertical: (0, _type.booleanType)(),
  tipFormatter: (0, _type.someType)([Function, Object], () => defaultTipFormatter),
  tooltipOpen: (0, _type.booleanType)(),
  /** @deprecated `tooltipVisible` is deprecated. Please use `tooltipOpen` instead. */
  tooltipVisible: (0, _type.booleanType)(),
  tooltipPlacement: (0, _type.stringType)(),
  getTooltipPopupContainer: (0, _type.functionType)(),
  autofocus: (0, _type.booleanType)(),
  handleStyle: (0, _type.someType)([Array, Object]),
  trackStyle: (0, _type.someType)([Array, Object]),
  onChange: (0, _type.functionType)(),
  onAfterChange: (0, _type.functionType)(),
  onFocus: (0, _type.functionType)(),
  onBlur: (0, _type.functionType)(),
  'onUpdate:value': (0, _type.functionType)()
});
exports.sliderProps = sliderProps;
const Slider = (0, _vue.defineComponent)({
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
        (0, _devWarning.default)(props.tooltipVisible === undefined, 'Slider', `\`${deprecatedName}\` is deprecated, please use \`${newName}\` instead.`);
      });
    }
    const {
      prefixCls,
      rootPrefixCls,
      direction,
      getPopupContainer,
      configProvider
    } = (0, _useConfigInject.default)('slider', props);
    // style
    const [wrapSSR, hashId] = (0, _style.default)(prefixCls);
    const formItemContext = (0, _FormItemContext.useInjectFormItemContext)();
    const sliderRef = (0, _vue.ref)();
    const innerValue = (0, _vue.ref)();
    const visibles = (0, _vue.ref)({});
    const toggleTooltipOpen = (index, visible) => {
      visibles.value[index] = visible;
    };
    const tooltipPlacement = (0, _vue.computed)(() => {
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
      return (0, _vue.createVNode)(_SliderTooltip.default, {
        "prefixCls": tooltipPrefixCls,
        "title": tipFormatter ? tipFormatter(value) : '',
        "open": open,
        "placement": tooltipPlacement.value,
        "transitionName": `${rootPrefixCls.value}-zoom-down`,
        "key": index,
        "overlayClassName": `${prefixCls.value}-tooltip`,
        "getPopupContainer": getTooltipPopupContainer || (getPopupContainer === null || getPopupContainer === void 0 ? void 0 : getPopupContainer.value)
      }, {
        default: () => [(0, _vue.createVNode)(_Handle.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, restProps), {}, {
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
    const apiAttrs = (0, _vue.shallowRef)({});
    (0, _vue.onMounted)(() => {
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
    (0, _vue.onUnmounted)(() => {
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
      const cls = (0, _classNames.default)(attrs.class, {
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
        return wrapSSR((0, _vue.createVNode)(_Range.default, (0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)({}, attrs), apiAttrs.value), restProps), {}, {
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
      return wrapSSR((0, _vue.createVNode)(_Slider.default, (0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)({}, attrs), apiAttrs.value), restProps), {}, {
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
var _default = exports.default = (0, _type.withInstall)(Slider);