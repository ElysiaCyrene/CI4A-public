"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _classNames = _interopRequireDefault(require("../_util/classNames"));
var _Checkbox = _interopRequireDefault(require("../vc-checkbox/Checkbox"));
var _propsUtil = require("../_util/props-util");
var _warning = _interopRequireDefault(require("../_util/warning"));
var _FormItemContext = require("../form/FormItemContext");
var _useConfigInject = _interopRequireDefault(require("../config-provider/hooks/useConfigInject"));
var _DisabledContext = require("../config-provider/DisabledContext");
var _interface = require("./interface");
require("../_util/AgentApiRegistry");
var _style = _interopRequireDefault(require("./style"));
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};

// CSSINJS
var _default = exports.default = (0, _vue.defineComponent)({
  compatConfig: {
    MODE: 3
  },
  name: 'ACheckbox',
  inheritAttrs: false,
  __ANT_CHECKBOX: true,
  props: (0, _interface.checkboxProps)(),
  // emits: ['change', 'update:checked'],
  setup(props, {
    emit,
    attrs,
    slots,
    expose
  }) {
    const formItemContext = (0, _FormItemContext.useInjectFormItemContext)();
    const formItemInputContext = _FormItemContext.FormItemInputContext.useInject();
    const {
      prefixCls,
      direction,
      disabled
    } = (0, _useConfigInject.default)('checkbox', props);
    const contextDisabled = (0, _DisabledContext.useInjectDisabled)();
    // style
    const [wrapSSR, hashId] = (0, _style.default)(prefixCls);
    const checkboxGroup = (0, _vue.inject)(_interface.CheckboxGroupContextKey, undefined);
    const uniId = Symbol('checkboxUniId');
    const mergedDisabled = (0, _vue.computed)(() => {
      return (checkboxGroup === null || checkboxGroup === void 0 ? void 0 : checkboxGroup.disabled.value) || disabled.value;
    });
    (0, _vue.watchEffect)(() => {
      if (!props.skipGroup && checkboxGroup) {
        checkboxGroup.registerValue(uniId, props.value);
      }
    });
    (0, _vue.onBeforeUnmount)(() => {
      if (checkboxGroup) {
        checkboxGroup.cancelValue(uniId);
      }
    });
    (0, _vue.onMounted)(() => {
      (0, _warning.default)(!!(props.checked !== undefined || checkboxGroup || props.value === undefined), 'Checkbox', '`value` is not validate prop, do you mean `checked`?');
    });
    const handleChange = event => {
      const targetChecked = event.target.checked;
      emit('update:checked', targetChecked);
      emit('change', event);
      formItemContext.onFieldChange();
    };
    const checkboxRef = (0, _vue.ref)();
    const focus = () => {
      var _a;
      (_a = checkboxRef.value) === null || _a === void 0 ? void 0 : _a.focus();
    };
    const blur = () => {
      var _a;
      (_a = checkboxRef.value) === null || _a === void 0 ? void 0 : _a.blur();
    };
    expose({
      focus,
      blur
    });
    // ========== Agent API ===========
    const getCheckboxStatus = () => {
      if (props.disabled || mergedDisabled.value || contextDisabled.value) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      return {
        data: {
          checked: props.checked
        }
      };
    };
    const setCheckboxValue = checked => {
      var _a;
      if (props.disabled || mergedDisabled.value || contextDisabled.value) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      if (checkboxGroup && !props.skipGroup) {
        // 如果在 CheckboxGroup 中，通过 toggleOption 来更新
        const currentChecked = checkboxGroup.mergedValue.value.includes(props.value);
        if (currentChecked !== checked) {
          const children = (0, _propsUtil.flattenChildren)((_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots));
          checkboxGroup.toggleOption({
            label: children,
            value: props.value
          });
        }
      } else {
        // 独立 Checkbox，触发更新事件
        emit('update:checked', checked);
        emit('change', {
          target: {
            checked
          },
          // Provide a minimal `nativeEvent` so consumers that destructure
          // `nativeEvent.shiftKey` (e.g. table row selection) don't crash.
          nativeEvent: {
            shiftKey: false
          },
          stopPropagation() {},
          preventDefault() {}
        });
        formItemContext.onFieldChange();
      }
    };
    const apiAttrs = (0, _vue.shallowRef)({});
    (0, _vue.onMounted)(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('checkbox', {
          getCheckboxStatus: {
            handler: getCheckboxStatus,
            description: 'Get the current status of the checkbox.',
            params: []
          },
          setCheckboxValue: {
            handler: setCheckboxValue,
            description: 'Set the checked status of the checkbox.',
            params: [{
              name: 'checked',
              type: 'boolean',
              description: 'Whether to check the checkbox.'
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
      var _a;
      const children = (0, _propsUtil.flattenChildren)((_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots));
      const {
          indeterminate,
          skipGroup,
          id = formItemContext.id.value
        } = props,
        restProps = __rest(props, ["indeterminate", "skipGroup", "id"]);
      const {
          onMouseenter,
          onMouseleave,
          onInput,
          class: className,
          style
        } = attrs,
        restAttrs = __rest(attrs, ["onMouseenter", "onMouseleave", "onInput", "class", "style"]);
      const checkboxProps = (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, restProps), {
        id,
        prefixCls: prefixCls.value
      }), restAttrs), {
        disabled: mergedDisabled.value
      });
      if (checkboxGroup && !skipGroup) {
        checkboxProps.onChange = (...args) => {
          emit('change', ...args);
          checkboxGroup.toggleOption({
            label: children,
            value: props.value
          });
        };
        checkboxProps.name = checkboxGroup.name.value;
        checkboxProps.checked = checkboxGroup.mergedValue.value.includes(props.value);
        checkboxProps.disabled = mergedDisabled.value || contextDisabled.value;
        checkboxProps.indeterminate = indeterminate;
      } else {
        checkboxProps.onChange = handleChange;
      }
      const classString = (0, _classNames.default)({
        [`${prefixCls.value}-wrapper`]: true,
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        [`${prefixCls.value}-wrapper-checked`]: checkboxProps.checked,
        [`${prefixCls.value}-wrapper-disabled`]: checkboxProps.disabled,
        [`${prefixCls.value}-wrapper-in-form-item`]: formItemInputContext.isFormItemInput
      }, className, hashId.value);
      const checkboxClass = (0, _classNames.default)({
        [`${prefixCls.value}-indeterminate`]: indeterminate
      }, hashId.value);
      const ariaChecked = indeterminate ? 'mixed' : undefined;
      return wrapSSR((0, _vue.createVNode)("label", (0, _objectSpread2.default)({
        "class": classString,
        "style": style,
        "onMouseenter": onMouseenter,
        "onMouseleave": onMouseleave
      }, apiAttrs.value), [(0, _vue.createVNode)(_Checkbox.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({
        "aria-checked": ariaChecked
      }, checkboxProps), {}, {
        "class": checkboxClass,
        "ref": checkboxRef
      }), null), children.length ? (0, _vue.createVNode)("span", null, [children]) : null]));
    };
  }
});