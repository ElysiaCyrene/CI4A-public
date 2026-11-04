"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mentionsProps = exports.default = exports.MentionsOption = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _classNames = _interopRequireDefault(require("../_util/classNames"));
var _vueTypes = _interopRequireDefault(require("../_util/vue-types"));
var _vcMentions = _interopRequireDefault(require("../vc-mentions"));
var _mentionsProps = require("../vc-mentions/src/mentionsProps");
var _useConfigInject = _interopRequireDefault(require("../config-provider/hooks/useConfigInject"));
var _propsUtil = require("../_util/props-util");
var _FormItemContext = require("../form/FormItemContext");
var _omit = _interopRequireDefault(require("../_util/omit"));
var _Option = require("../vc-mentions/src/Option");
var _statusUtils = require("../_util/statusUtils");
var _style = _interopRequireDefault(require("./style"));
var _OverrideContext = require("../menu/src/OverrideContext");
var _warning = _interopRequireDefault(require("../_util/warning"));
var _spin = _interopRequireDefault(require("../spin"));
var _devWarning = _interopRequireDefault(require("../vc-util/devWarning"));
require("../_util/AgentApiRegistry");
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
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
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
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
const mentionsProps = () => (0, _extends2.default)((0, _extends2.default)({}, _mentionsProps.mentionsProps), {
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
  notFoundContent: _vueTypes.default.any,
  defaultValue: String,
  id: String,
  status: String
});
exports.mentionsProps = mentionsProps;
const Mentions = (0, _vue.defineComponent)({
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
      (0, _devWarning.default)(!(0, _propsUtil.flattenChildren)(((_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots)) || []).length, 'Mentions', '`Mentions.Option` is deprecated. Please use `options` instead.');
    }
    const {
      prefixCls,
      renderEmpty,
      direction
    } = (0, _useConfigInject.default)('mentions', props);
    const [wrapSSR, hashId] = (0, _style.default)(prefixCls);
    const focused = (0, _vue.shallowRef)(false);
    const vcMentions = (0, _vue.shallowRef)(null);
    const value = (0, _vue.shallowRef)((_c = (_b = props.value) !== null && _b !== void 0 ? _b : props.defaultValue) !== null && _c !== void 0 ? _c : '');
    const formItemContext = (0, _FormItemContext.useInjectFormItemContext)();
    const formItemInputContext = _FormItemContext.FormItemInputContext.useInject();
    const mergedStatus = (0, _vue.computed)(() => (0, _statusUtils.getMergedStatus)(formItemInputContext.status, props.status));
    (0, _OverrideContext.useProvideOverride)({
      prefixCls: (0, _vue.computed)(() => `${prefixCls.value}-menu`),
      mode: (0, _vue.computed)(() => 'vertical'),
      selectable: (0, _vue.computed)(() => false),
      onClick: () => {},
      validator: ({
        mode
      }) => {
        // Warning if use other mode
        (0, _warning.default)(!mode || mode === 'vertical', 'Mentions', `mode="${mode}" is not supported for Mentions's Menu.`);
      }
    });
    (0, _vue.watch)(() => props.value, val => {
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
      return (0, _propsUtil.flattenChildren)(((_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots)) || []).map(item => {
        var _a, _b;
        return (0, _extends2.default)((0, _extends2.default)({}, (0, _propsUtil.getOptionProps)(item)), {
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
    const mentionsfilterOption = (0, _vue.computed)(() => props.loading ? loadingFilterOption : props.filterOption);
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
    const apiAttrs = (0, _vue.shallowRef)({});
    (0, _vue.onMounted)(() => {
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
    (0, _vue.onUnmounted)(() => {
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
      const otherProps = (0, _omit.default)(restProps, ['defaultValue', 'onUpdate:value', 'prefixCls']);
      const mergedClassName = (0, _classNames.default)({
        [`${prefixCls.value}-disabled`]: disabled,
        [`${prefixCls.value}-focused`]: focused.value,
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl'
      }, (0, _statusUtils.getStatusClassNames)(prefixCls.value, mergedStatus.value), !hasFeedback && className, hashId.value);
      const mentionsProps = (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({
        prefixCls: prefixCls.value
      }, otherProps), {
        disabled,
        direction: direction.value,
        filterOption: mentionsfilterOption.value,
        getPopupContainer,
        options: props.loading ? [{
          value: 'ANTDV_SEARCHING',
          disabled: true,
          label: (0, _vue.createVNode)(_spin.default, {
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
      const mentions = (0, _vue.createVNode)(_vcMentions.default, (0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)({}, mentionsProps), apiAttrs.value), {}, {
        "dropdownClassName": hashId.value
      }), {
        notFoundContent: getNotFoundContent,
        option: slots.option
      });
      if (hasFeedback) {
        return wrapSSR((0, _vue.createVNode)("div", {
          "class": (0, _classNames.default)(`${prefixCls.value}-affix-wrapper`, (0, _statusUtils.getStatusClassNames)(`${prefixCls.value}-affix-wrapper`, mergedStatus.value, hasFeedback), className, hashId.value)
        }, [mentions, (0, _vue.createVNode)("span", {
          "class": `${prefixCls.value}-suffix`
        }, [feedbackIcon])]));
      }
      return wrapSSR(mentions);
    };
  }
});
/* istanbul ignore next */
const MentionsOption = exports.MentionsOption = (0, _vue.defineComponent)((0, _extends2.default)((0, _extends2.default)({
  compatConfig: {
    MODE: 3
  }
}, _Option.optionOptions), {
  name: 'AMentionsOption',
  props: _Option.optionProps
}));
var _default = exports.default = (0, _extends2.default)(Mentions, {
  Option: MentionsOption,
  getMentions,
  install: app => {
    app.component(Mentions.name, Mentions);
    app.component(MentionsOption.name, MentionsOption);
    return app;
  }
});