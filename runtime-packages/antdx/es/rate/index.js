import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { watch, defineComponent, ref, reactive, onMounted, onUnmounted, shallowRef, createVNode as _createVNode } from 'vue';
import { initDefaultProps, findDOMNode } from '../_util/props-util';
import { withInstall } from '../_util/type';
import { getOffsetLeft } from './util';
import classNames from '../_util/classNames';
import PropTypes from '../_util/vue-types';
import KeyCode from '../_util/KeyCode';
import StarFilled from "@ant-design/icons-vue/es/icons/StarFilled";
import Tooltip from '../tooltip';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import Star from './Star';
import useRefs from '../_util/hooks/useRefs';
import { useInjectFormItemContext } from '../form/FormItemContext';
import '../_util/AgentApiRegistry';
import useStyle from './style';
export const rateProps = () => ({
  prefixCls: String,
  count: Number,
  value: Number,
  allowHalf: {
    type: Boolean,
    default: undefined
  },
  allowClear: {
    type: Boolean,
    default: undefined
  },
  tooltips: Array,
  disabled: {
    type: Boolean,
    default: undefined
  },
  character: PropTypes.any,
  autofocus: {
    type: Boolean,
    default: undefined
  },
  tabindex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  direction: String,
  id: String,
  onChange: Function,
  onHoverChange: Function,
  'onUpdate:value': Function,
  onFocus: Function,
  onBlur: Function,
  onKeydown: Function
});
const Rate = defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'ARate',
  inheritAttrs: false,
  props: initDefaultProps(rateProps(), {
    value: 0,
    count: 5,
    allowHalf: false,
    allowClear: true,
    tabindex: 0,
    direction: 'ltr'
  }),
  // emits: ['hoverChange', 'update:value', 'change', 'focus', 'blur', 'keydown'],
  setup(props, {
    slots,
    attrs,
    emit,
    expose
  }) {
    const {
      prefixCls,
      direction
    } = useConfigInject('rate', props);
    const [wrapSSR, hashId] = useStyle(prefixCls);
    const formItemContext = useInjectFormItemContext();
    const rateRef = ref();
    const [setRef, starRefs] = useRefs();
    const state = reactive({
      value: props.value,
      focused: false,
      cleanedValue: null,
      hoverValue: undefined
    });
    watch(() => props.value, () => {
      state.value = props.value;
    });
    const getStarDOM = index => {
      return findDOMNode(starRefs.value.get(index));
    };
    const getStarValue = (index, x) => {
      const reverse = direction.value === 'rtl';
      let value = index + 1;
      if (props.allowHalf) {
        const starEle = getStarDOM(index);
        const leftDis = getOffsetLeft(starEle);
        const width = starEle.clientWidth;
        if (reverse && x - leftDis > width / 2) {
          value -= 0.5;
        } else if (!reverse && x - leftDis < width / 2) {
          value -= 0.5;
        }
      }
      return value;
    };
    const changeValue = value => {
      if (props.value === undefined) {
        state.value = value;
      }
      emit('update:value', value);
      emit('change', value);
      formItemContext.onFieldChange();
    };
    const onHover = (e, index) => {
      const hoverValue = getStarValue(index, e.pageX);
      if (hoverValue !== state.cleanedValue) {
        state.hoverValue = hoverValue;
        state.cleanedValue = null;
      }
      emit('hoverChange', hoverValue);
    };
    const onMouseLeave = () => {
      state.hoverValue = undefined;
      state.cleanedValue = null;
      emit('hoverChange', undefined);
    };
    const onClick = (event, index) => {
      const {
        allowClear
      } = props;
      const newValue = getStarValue(index, event.pageX);
      let isReset = false;
      if (allowClear) {
        isReset = newValue === state.value;
      }
      onMouseLeave();
      changeValue(isReset ? 0 : newValue);
      state.cleanedValue = isReset ? newValue : null;
    };
    const onFocus = e => {
      state.focused = true;
      emit('focus', e);
    };
    const onBlur = e => {
      state.focused = false;
      emit('blur', e);
      formItemContext.onFieldBlur();
    };
    const onKeyDown = event => {
      const {
        keyCode
      } = event;
      const {
        count,
        allowHalf
      } = props;
      const reverse = direction.value === 'rtl';
      if (keyCode === KeyCode.RIGHT && state.value < count && !reverse) {
        if (allowHalf) {
          state.value += 0.5;
        } else {
          state.value += 1;
        }
        changeValue(state.value);
        event.preventDefault();
      } else if (keyCode === KeyCode.LEFT && state.value > 0 && !reverse) {
        if (allowHalf) {
          state.value -= 0.5;
        } else {
          state.value -= 1;
        }
        changeValue(state.value);
        event.preventDefault();
      } else if (keyCode === KeyCode.RIGHT && state.value > 0 && reverse) {
        if (allowHalf) {
          state.value -= 0.5;
        } else {
          state.value -= 1;
        }
        changeValue(state.value);
        event.preventDefault();
      } else if (keyCode === KeyCode.LEFT && state.value < count && reverse) {
        if (allowHalf) {
          state.value += 0.5;
        } else {
          state.value += 1;
        }
        changeValue(state.value);
        event.preventDefault();
      }
      emit('keydown', event);
    };
    const focus = () => {
      if (!props.disabled) {
        rateRef.value.focus();
      }
    };
    const blur = () => {
      if (!props.disabled) {
        rateRef.value.blur();
      }
    };
    expose({
      focus,
      blur
    });
    onMounted(() => {
      const {
        autofocus,
        disabled
      } = props;
      if (autofocus && !disabled) {
        focus();
      }
    });
    const characterRender = (node, {
      index
    }) => {
      const {
        tooltips
      } = props;
      if (!tooltips) return node;
      return _createVNode(Tooltip, {
        "title": tooltips[index]
      }, {
        default: () => [node]
      });
    };
    // ========== Agent API ===========
    const getRateStatus = () => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      return {
        data: {
          value: state.value
        }
      };
    };
    const setRateValue = value => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      const {
        count
      } = props;
      // 限制value在有效范围内
      let newValue = Math.max(0, Math.min(value, count));
      // 如果不允许半星，则四舍五入到整数
      if (!props.allowHalf) {
        newValue = Math.round(newValue);
      }
      changeValue(newValue);
    };
    const apiAttrs = shallowRef({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('rate', {
          getRateStatus: {
            handler: getRateStatus,
            description: 'Get the status of the rate component, including the current value.',
            params: []
          },
          setRateValue: {
            handler: setRateValue,
            description: 'Set the value of the rate component.',
            params: [{
              name: 'value',
              type: 'number',
              required: true,
              description: 'The new value to set.'
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
        count,
        allowHalf,
        disabled,
        tabindex,
        id = formItemContext.id.value
      } = props;
      const {
        class: className,
        style
      } = attrs;
      const stars = [];
      const disabledClass = disabled ? `${prefixCls.value}-disabled` : '';
      const character = props.character || slots.character || (() => _createVNode(StarFilled, null, null));
      for (let index = 0; index < count; index++) {
        stars.push(_createVNode(Star, {
          "ref": setRef(index),
          "key": index,
          "index": index,
          "count": count,
          "disabled": disabled,
          "prefixCls": `${prefixCls.value}-star`,
          "allowHalf": allowHalf,
          "value": state.hoverValue === undefined ? state.value : state.hoverValue,
          "onClick": onClick,
          "onHover": onHover,
          "character": character,
          "characterRender": characterRender,
          "focused": state.focused
        }, null));
      }
      const rateClassName = classNames(prefixCls.value, disabledClass, className, {
        [hashId.value]: true,
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl'
      });
      return wrapSSR(_createVNode("ul", _objectSpread(_objectSpread(_objectSpread({}, attrs), apiAttrs.value), {}, {
        "id": id,
        "class": rateClassName,
        "style": style,
        "onMouseleave": disabled ? null : onMouseLeave,
        "tabindex": disabled ? -1 : tabindex,
        "onFocus": disabled ? null : onFocus,
        "onBlur": disabled ? null : onBlur,
        "onKeydown": disabled ? null : onKeyDown,
        "ref": rateRef,
        "role": "radiogroup"
      }), [stars]));
    };
  }
});
export default withInstall(Rate);