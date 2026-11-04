import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { createVNode as _createVNode } from "vue";
import _extends from "@babel/runtime/helpers/esm/extends";
var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __rest = this && this.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
import { computed, watch, shallowRef, defineComponent, onMounted, onUnmounted } from 'vue';
import classNames from '../_util/classNames';
import PropTypes from '../_util/vue-types';
import VcMentions from '../vc-mentions';
import { mentionsProps as baseMentionsProps } from '../vc-mentions/src/mentionsProps';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import { flattenChildren, getOptionProps } from '../_util/props-util';
import { FormItemInputContext, useInjectFormItemContext } from '../form/FormItemContext';
import omit from '../_util/omit';
import { optionProps, optionOptions } from '../vc-mentions/src/Option';
import { getStatusClassNames, getMergedStatus } from '../_util/statusUtils';
import useStyle from './style';
import { useProvideOverride } from '../menu/src/OverrideContext';
import warning from '../_util/warning';
import Spin from '../spin';
import devWarning from '../vc-util/devWarning';
import '../_util/AgentApiRegistry';
function loadingFilterOption() {
  return true;
}
const getMentions = (value = '', config = {}) => {
  const {
    prefix = '@',
    split = ' '
  } = config;
  const prefixList = Array.isArray(prefix) ? prefix : [prefix];
  return value.split(split).map((str = '') => {
    let hitPrefix = null;
    prefixList.some(prefixStr => {
      const startStr = str.slice(0, prefixStr.length);
      if (startStr === prefixStr) {
        hitPrefix = prefixStr;
        return true;
      }
      return false;
    });
    if (hitPrefix !== null) {
      return {
        prefix: hitPrefix,
        value: str.slice(hitPrefix.length)
      };
    }
    return null;
  }).filter(entity => !!entity && !!entity.value);
};
export const mentionsProps = () => _extends(_extends({}, baseMentionsProps), {
  loading: {
    type: Boolean,
    default: undefined
  },
  onFocus: {
    type: Function
  },
  onBlur: {
    type: Function
  },
  onSelect: {
    type: Function
  },
  onChange: {
    type: Function
  },
  onPressenter: {
    type: Function
  },
  'onUpdate:value': {
    type: Function
  },
  notFoundContent: PropTypes.any,
  defaultValue: String,
  id: String,
  status: String
});
const Mentions = defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'AMentions',
  inheritAttrs: false,
  props: mentionsProps(),
  slots: Object,
  setup(props, {
    slots,
    emit,
    attrs,
    expose
  }) {
    var _a, _b, _c;
    // =================== Warning =====================
    if (process.env.NODE_ENV !== 'production') {
      devWarning(!flattenChildren(((_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots)) || []).length, 'Mentions', '`Mentions.Option` is deprecated. Please use `options` instead.');
    }
    const {
      prefixCls,
      renderEmpty,
      direction
    } = useConfigInject('mentions', props);
    const [wrapSSR, hashId] = useStyle(prefixCls);
    const focused = shallowRef(false);
    const vcMentions = shallowRef(null);
    const value = shallowRef((_c = (_b = props.value) !== null && _b !== void 0 ? _b : props.defaultValue) !== null && _c !== void 0 ? _c : '');
    const formItemContext = useInjectFormItemContext();
    const formItemInputContext = FormItemInputContext.useInject();
    const mergedStatus = computed(() => getMergedStatus(formItemInputContext.status, props.status));
    useProvideOverride({
      prefixCls: computed(() => `${prefixCls.value}-menu`),
      mode: computed(() => 'vertical'),
      selectable: computed(() => false),
      onClick: () => {},
      validator: ({
        mode
      }) => {
        // Warning if use other mode
        warning(!mode || mode === 'vertical', 'Mentions', `mode="${mode}" is not supported for Mentions's Menu.`);
      }
    });
    watch(() => props.value, val => {
      value.value = val;
    });
    const handleFocus = e => {
      focused.value = true;
      emit('focus', e);
    };
    const handleBlur = e => {
      focused.value = false;
      emit('blur', e);
      formItemContext.onFieldBlur();
    };
    const handleSelect = (...args) => {
      emit('select', ...args);
      focused.value = true;
    };
    const handleChange = val => {
      if (props.value === undefined) {
        value.value = val;
      }
      emit('update:value', val);
      emit('change', val);
      formItemContext.onFieldChange();
    };
    const getNotFoundContent = () => {
      const notFoundContent = props.notFoundContent;
      if (notFoundContent !== undefined) {
        return notFoundContent;
      }
      if (slots.notFoundContent) {
        return slots.notFoundContent();
      }
      return renderEmpty('Select');
    };
    const getOptions = () => {
      var _a;
      return flattenChildren(((_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots)) || []).map(item => {
        var _a, _b;
        return _extends(_extends({}, getOptionProps(item)), {
          label: (_b = (_a = item.children) === null || _a === void 0 ? void 0 : _a.default) === null || _b === void 0 ? void 0 : _b.call(_a)
        });
      });
    };
    const focus = () => {
      vcMentions.value.focus();
    };
    const blur = () => {
      vcMentions.value.blur();
    };
    expose({
      focus,
      blur
    });
    const mentionsfilterOption = computed(() => props.loading ? loadingFilterOption : props.filterOption);
    // =================== Agent API ===================
    const setMentionPrefix = prefix => {
      return new Promise((resolve, reject) => {
        // 检查 prefix 是否在配置的 prefix 列表中
        const prefixList = Array.isArray(props.prefix) ? props.prefix : [props.prefix];
        if (!prefixList.includes(prefix)) {
          console.warn(`[Mentions] prefix "${prefix}" is not in the configured prefix list`);
          reject(new Error(`prefix "${prefix}" is not in the configured prefix list`));
          return;
        }
        // 先聚焦组件
        focus();
        // 使用 setTimeout 确保聚焦完成后再设置值
        setTimeout(() => {
          var _a, _b;
          // 获取底层的 textarea 元素
          const textareaElement = (_b = (_a = vcMentions.value) === null || _a === void 0 ? void 0 : _a.$el) === null || _b === void 0 ? void 0 : _b.querySelector('textarea');
          if (textareaElement) {
            // 设置新的值为 prefix
            const newValue = prefix;
            // 更新 textarea 的值
            textareaElement.value = newValue;
            // 设置光标位置到最后
            textareaElement.selectionStart = newValue.length;
            textareaElement.selectionEnd = newValue.length;
            // 触发 input 事件
            const inputEvent = new Event('input', {
              bubbles: true,
              cancelable: true
            });
            Object.defineProperty(inputEvent, 'target', {
              writable: false,
              value: textareaElement
            });
            textareaElement.dispatchEvent(inputEvent);
            // 触发 keyup 事件来触发 onSearch（模拟用户按下 prefix 键）
            const keyupEvent = new KeyboardEvent('keyup', {
              key: prefix,
              code: `Key${prefix.toUpperCase()}`,
              bubbles: true,
              cancelable: true
            });
            Object.defineProperty(keyupEvent, 'target', {
              writable: false,
              value: textareaElement
            });
            textareaElement.dispatchEvent(keyupEvent);
            // 同时更新组件状态
            handleChange(newValue);
            resolve();
          } else {
            reject(new Error('textarea element not found'));
          }
        }, 50);
      });
    };
    const getMentionStatus = () => __awaiter(this, void 0, void 0, function* () {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      const currentValue = value.value || '';
      const prefixList = Array.isArray(props.prefix) ? props.prefix : [props.prefix];
      const mentions = getMentions(currentValue, {
        prefix: prefixList,
        split: props.split
      });
      const allOptions = {};
      for (const prefix of prefixList) {
        try {
          yield setMentionPrefix(prefix);
          allOptions[prefix] = props.options || getOptions();
        } catch (error) {
          console.error(`Failed to set mention prefix "${prefix}":`, error);
          allOptions[prefix] = [];
        }
      }
      // 恢复原本的值
      handleChange(currentValue);
      return {
        data: {
          value: currentValue,
          options: allOptions,
          mentions,
          prefix: props.prefix
        }
      };
    });
    const setMentionValue = value => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      // 将传入的任意字符串设置为组件值（空或 falsy 则清空）
      const newValue = value || '';
      handleChange(newValue);
      return {
        data: {
          value: newValue
        }
      };
    };
    const apiAttrs = shallowRef({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('mention', {
          getMentionStatus: {
            handler: getMentionStatus,
            description: 'Get the current status of the mentions component, including current value, options, and mentions.'
          },
          setMentionValue: {
            handler: setMentionValue,
            description: 'Set the value of the mentions component to an arbitrary string.',
            params: [{
              name: 'value',
              type: 'string',
              required: true,
              description: 'The new value to set for the mentions input.'
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
          disabled,
          getPopupContainer,
          rows = 1,
          id = formItemContext.id.value
        } = props,
        restProps = __rest(props, ["disabled", "getPopupContainer", "rows", "id"]);
      const {
        hasFeedback,
        feedbackIcon
      } = formItemInputContext;
      const {
          class: className
        } = attrs,
        otherAttrs = __rest(attrs, ["class"]);
      const otherProps = omit(restProps, ['defaultValue', 'onUpdate:value', 'prefixCls']);
      const mergedClassName = classNames({
        [`${prefixCls.value}-disabled`]: disabled,
        [`${prefixCls.value}-focused`]: focused.value,
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl'
      }, getStatusClassNames(prefixCls.value, mergedStatus.value), !hasFeedback && className, hashId.value);
      const mentionsProps = _extends(_extends(_extends(_extends({
        prefixCls: prefixCls.value
      }, otherProps), {
        disabled,
        direction: direction.value,
        filterOption: mentionsfilterOption.value,
        getPopupContainer,
        options: props.loading ? [{
          value: 'ANTDV_SEARCHING',
          disabled: true,
          label: _createVNode(Spin, {
            "size": "small"
          }, null)
        }] : props.options || getOptions(),
        class: mergedClassName
      }), otherAttrs), {
        rows,
        onChange: handleChange,
        onSelect: handleSelect,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ref: vcMentions,
        value: value.value,
        id
      });
      const mentions = _createVNode(VcMentions, _objectSpread(_objectSpread(_objectSpread({}, mentionsProps), apiAttrs.value), {}, {
        "dropdownClassName": hashId.value
      }), {
        notFoundContent: getNotFoundContent,
        option: slots.option
      });
      if (hasFeedback) {
        return wrapSSR(_createVNode("div", {
          "class": classNames(`${prefixCls.value}-affix-wrapper`, getStatusClassNames(`${prefixCls.value}-affix-wrapper`, mergedStatus.value, hasFeedback), className, hashId.value)
        }, [mentions, _createVNode("span", {
          "class": `${prefixCls.value}-suffix`
        }, [feedbackIcon])]));
      }
      return wrapSSR(mentions);
    };
  }
});
/* istanbul ignore next */
export const MentionsOption = defineComponent(_extends(_extends({
  compatConfig: {
    MODE: 3
  }
}, optionOptions), {
  name: 'AMentionsOption',
  props: optionProps
}));
export default _extends(Mentions, {
  Option: MentionsOption,
  getMentions,
  install: app => {
    app.component(Mentions.name, Mentions);
    app.component(MentionsOption.name, MentionsOption);
    return app;
  }
});