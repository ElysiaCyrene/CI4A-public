"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectProps = exports.default = exports.SelectOption = exports.SelectOptGroup = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _classNames = _interopRequireDefault(require("../_util/classNames"));
var _vcSelect = _interopRequireWildcard(require("../vc-select"));
var _iconUtil = _interopRequireDefault(require("./utils/iconUtil"));
var _vueTypes = _interopRequireDefault(require("../_util/vue-types"));
var _useConfigInject = _interopRequireDefault(require("../config-provider/hooks/useConfigInject"));
var _renderEmpty = require("../config-provider/renderEmpty");
var _omit = _interopRequireDefault(require("../_util/omit"));
var _FormItemContext = require("../form/FormItemContext");
var _transition = require("../_util/transition");
var _propsUtil = require("../_util/props-util");
var _statusUtils = require("../_util/statusUtils");
var _type = require("../_util/type");
var _Compact = require("../space/Compact");
require("../_util/AgentApiRegistry");
var _style = _interopRequireDefault(require("./style"));
var _DisabledContext = require("../config-provider/DisabledContext");
var _devWarning = _interopRequireDefault(require("../vc-util/devWarning"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// CSSINJS

const selectProps = () => (0, _extends2.default)((0, _extends2.default)({}, (0, _omit.default)((0, _vcSelect.selectProps)(), ['inputIcon', 'mode', 'getInputElement', 'getRawInputElement', 'backfill'])), {
  value: (0, _type.someType)([Array, Object, String, Number]),
  defaultValue: (0, _type.someType)([Array, Object, String, Number]),
  notFoundContent: _vueTypes.default.any,
  suffixIcon: _vueTypes.default.any,
  itemIcon: _vueTypes.default.any,
  size: (0, _type.stringType)(),
  mode: (0, _type.stringType)(),
  bordered: (0, _type.booleanType)(true),
  transitionName: String,
  choiceTransitionName: (0, _type.stringType)(''),
  popupClassName: String,
  /** @deprecated Please use `popupClassName` instead */
  dropdownClassName: String,
  placement: (0, _type.stringType)(),
  status: (0, _type.stringType)(),
  'onUpdate:value': (0, _type.functionType)()
});
exports.selectProps = selectProps;
const SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';
const Select = (0, _vue.defineComponent)({
  compatConfig: {
    MODE: 3
  },
  name: 'ASelect',
  Option: _vcSelect.Option,
  OptGroup: _vcSelect.OptGroup,
  inheritAttrs: false,
  props: (0, _propsUtil.initDefaultProps)(selectProps(), {
    listHeight: 256,
    listItemHeight: 24
  }),
  SECRET_COMBOBOX_MODE_DO_NOT_USE,
  slots: Object,
  setup(props, {
    attrs,
    emit,
    slots,
    expose
  }) {
    const selectRef = (0, _vue.ref)();
    const formItemContext = (0, _FormItemContext.useInjectFormItemContext)();
    const formItemInputContext = _FormItemContext.FormItemInputContext.useInject();
    const mergedStatus = (0, _vue.computed)(() => (0, _statusUtils.getMergedStatus)(formItemInputContext.status, props.status));
    const focus = () => {
      var _a;
      (_a = selectRef.value) === null || _a === void 0 ? void 0 : _a.focus();
    };
    const blur = () => {
      var _a;
      (_a = selectRef.value) === null || _a === void 0 ? void 0 : _a.blur();
    };
    const scrollTo = arg => {
      var _a;
      (_a = selectRef.value) === null || _a === void 0 ? void 0 : _a.scrollTo(arg);
    };
    const mode = (0, _vue.computed)(() => {
      const {
        mode
      } = props;
      if (mode === 'combobox') {
        return undefined;
      }
      if (mode === SECRET_COMBOBOX_MODE_DO_NOT_USE) {
        return 'combobox';
      }
      return mode;
    });
    // ====================== Warning ======================
    if (process.env.NODE_ENV !== 'production') {
      (0, _devWarning.default)(!props.dropdownClassName, 'Select', '`dropdownClassName` is deprecated. Please use `popupClassName` instead.');
    }
    const {
      prefixCls,
      direction,
      configProvider,
      renderEmpty,
      size: contextSize,
      getPrefixCls,
      getPopupContainer,
      disabled,
      select
    } = (0, _useConfigInject.default)('select', props);
    const {
      compactSize,
      compactItemClassnames
    } = (0, _Compact.useCompactItemContext)(prefixCls, direction);
    const mergedSize = (0, _vue.computed)(() => compactSize.value || contextSize.value);
    const contextDisabled = (0, _DisabledContext.useInjectDisabled)();
    const mergedDisabled = (0, _vue.computed)(() => {
      var _a;
      return (_a = disabled.value) !== null && _a !== void 0 ? _a : contextDisabled.value;
    });
    // style
    const [wrapSSR, hashId] = (0, _style.default)(prefixCls);
    const rootPrefixCls = (0, _vue.computed)(() => getPrefixCls());
    // ===================== Placement =====================
    const placement = (0, _vue.computed)(() => {
      if (props.placement !== undefined) {
        return props.placement;
      }
      return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
    });
    const transitionName = (0, _vue.computed)(() => (0, _transition.getTransitionName)(rootPrefixCls.value, (0, _transition.getTransitionDirection)(placement.value), props.transitionName));
    const mergedClassName = (0, _vue.computed)(() => (0, _classNames.default)({
      [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
      [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
      [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
      [`${prefixCls.value}-borderless`]: !props.bordered,
      [`${prefixCls.value}-in-form-item`]: formItemInputContext.isFormItemInput
    }, (0, _statusUtils.getStatusClassNames)(prefixCls.value, mergedStatus.value, formItemInputContext.hasFeedback), compactItemClassnames.value, hashId.value));
    const triggerChange = (...args) => {
      emit('update:value', args[0]);
      emit('change', ...args);
      formItemContext.onFieldChange();
    };
    const handleBlur = e => {
      emit('blur', e);
      formItemContext.onFieldBlur();
    };
    expose({
      blur,
      focus,
      scrollTo
    });
    const isMultiple = (0, _vue.computed)(() => mode.value === 'multiple' || mode.value === 'tags');
    const mergedShowArrow = (0, _vue.computed)(() => props.showArrow !== undefined ? props.showArrow : props.loading || !(isMultiple.value || mode.value === 'combobox'));
    // ===================== Agent API =====================
    const getSelectOptions = () => {
      var _a;
      // 获取所有选项
      const options = [];
      // 从 slots.default 中提取选项
      const children = (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots);
      if (children) {
        const extractOptions = vnodes => {
          vnodes.forEach(vnode => {
            var _a, _b, _c;
            if (!vnode) return;
            // 处理 Option 组件
            if (((_a = vnode.type) === null || _a === void 0 ? void 0 : _a.name) === 'ASelectOption' || vnode.type === _vcSelect.Option) {
              const optionProps = vnode.props || {};
              options.push({
                value: optionProps.value,
                label: optionProps.label,
                disabled: !!optionProps.disabled
              });
            }
            // 处理 OptGroup 组件
            else if (((_b = vnode.type) === null || _b === void 0 ? void 0 : _b.name) === 'ASelectOptGroup' || vnode.type === _vcSelect.OptGroup) {
              if ((_c = vnode.children) === null || _c === void 0 ? void 0 : _c.default) {
                const groupChildren = vnode.children.default();
                if (Array.isArray(groupChildren)) {
                  extractOptions(groupChildren);
                }
              }
            }
            // 递归处理子节点
            else if (vnode.children) {
              if (Array.isArray(vnode.children)) {
                extractOptions(vnode.children);
              } else if (vnode.children.default) {
                const defaultChildren = vnode.children.default();
                if (Array.isArray(defaultChildren)) {
                  extractOptions(defaultChildren);
                }
              }
            }
            // 处理数组类型的 vnode
            if (Array.isArray(vnode)) {
              extractOptions(vnode);
            }
          });
        };
        extractOptions(Array.isArray(children) ? children : [children]);
      }
      // 从 props.options 中提取选项（如果使用了 options 属性）
      if (props.options && Array.isArray(props.options)) {
        props.options.forEach(option => {
          if (option.options) {
            // OptGroup
            option.options.forEach(subOption => {
              options.push({
                value: subOption.value,
                label: subOption.label || subOption.value,
                disabled: !!subOption.disabled
              });
            });
          } else {
            options.push({
              value: option.value,
              label: option.label,
              disabled: !!option.disabled
            });
          }
        });
      }
      return options;
    };
    const getSelectStatus = () => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      const options = getSelectOptions();
      return {
        data: {
          // 当前选中的值
          value: props.value,
          // 是否多选
          is_multiple: isMultiple.value,
          // 所有可选项
          options: options
        }
      };
    };
    const setSelectValues = values => {
      // 获取所有可用选项
      const options = getSelectOptions();
      // 验证值是否在可用选项中
      const availableValuesMap = new Map(options.map(opt => [opt.value, opt]));
      const valuesToCheck = isMultiple.value ? Array.isArray(values) ? values : values ? [values] : [] : values !== undefined && values !== null ? [values] : [];
      // 检查每个值是否存在以及是否被禁用
      const invalidValues = [];
      const disabledValues = [];
      (Array.isArray(valuesToCheck) ? valuesToCheck : [valuesToCheck]).forEach(val => {
        const actualValue = typeof val === 'object' && val !== null && 'value' in val ? val.value : val;
        // 只检查 value，不检查 label
        if (actualValue !== undefined && actualValue !== null) {
          const option = availableValuesMap.get(actualValue);
          if (!option) {
            invalidValues.push(actualValue);
          } else if (option.disabled) {
            disabledValues.push(actualValue);
          }
        }
      });
      if (invalidValues.length > 0) {
        return {
          error: {
            code: 'INVALID_OPTION',
            message: `The following values are not in the available options: ${invalidValues.join(', ')}`
          }
        };
      }
      if (disabledValues.length > 0) {
        return {
          error: {
            code: 'OPTION_DISABLED',
            message: `The following options are disabled: ${disabledValues.join(', ')}`
          }
        };
      }
      // 格式化值
      let formattedValues = values;
      if (isMultiple.value) {
        formattedValues = Array.isArray(values) ? values : values ? [values] : [];
      }
      // 触发值更新
      triggerChange(formattedValues, null);
    };
    const apiAttrs = (0, _vue.shallowRef)({});
    (0, _vue.onMounted)(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        // 检查是否在 AutoComplete 中使用
        const isInAutoComplete = mode.value === 'combobox';
        if (!isInAutoComplete) {
          apiAttrs.value = window.__ci4a__.register('select', {
            getSelectStatus: {
              handler: getSelectStatus,
              description: 'Get the current status of the select component, including the current value and all options.'
            },
            setSelectValues: {
              handler: setSelectValues,
              description: 'Set the value of the select component.',
              params: [{
                name: 'values',
                type: isMultiple.value ? 'list[string | number]' : 'string | number',
                required: true,
                description: 'The new value to set.'
              }]
            }
          });
        }
      }
    });
    (0, _vue.onUnmounted)(() => {
      if (apiAttrs.value && window.__ci4a__) {
        window.__ci4a__.unregister(apiAttrs.value['data-cid']);
      }
    });
    return () => {
      var _a, _b, _c, _d;
      const {
        notFoundContent,
        listHeight = 256,
        listItemHeight = 24,
        popupClassName,
        dropdownClassName,
        virtual,
        dropdownMatchSelectWidth,
        id = formItemContext.id.value,
        placeholder = (_a = slots.placeholder) === null || _a === void 0 ? void 0 : _a.call(slots),
        showArrow
      } = props;
      const {
        hasFeedback,
        feedbackIcon
      } = formItemInputContext;
      const {} = configProvider;
      // ===================== Empty =====================
      let mergedNotFound;
      if (notFoundContent !== undefined) {
        mergedNotFound = notFoundContent;
      } else if (slots.notFoundContent) {
        mergedNotFound = slots.notFoundContent();
      } else if (mode.value === 'combobox') {
        mergedNotFound = null;
      } else {
        mergedNotFound = (renderEmpty === null || renderEmpty === void 0 ? void 0 : renderEmpty('Select')) || (0, _vue.createVNode)(_renderEmpty.DefaultRenderEmpty, {
          "componentName": "Select"
        }, null);
      }
      // ===================== Icons =====================
      const {
        suffixIcon,
        itemIcon,
        removeIcon,
        clearIcon
      } = (0, _iconUtil.default)((0, _extends2.default)((0, _extends2.default)({}, props), {
        multiple: isMultiple.value,
        prefixCls: prefixCls.value,
        hasFeedback,
        feedbackIcon,
        showArrow: mergedShowArrow.value
      }), slots);
      const selectProps = (0, _omit.default)(props, ['prefixCls', 'suffixIcon', 'itemIcon', 'removeIcon', 'clearIcon', 'size', 'bordered', 'status']);
      const rcSelectRtlDropdownClassName = (0, _classNames.default)(popupClassName || dropdownClassName, {
        [`${prefixCls.value}-dropdown-${direction.value}`]: direction.value === 'rtl'
      }, hashId.value);
      return wrapSSR((0, _vue.createVNode)(_vcSelect.default, (0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)({
        "ref": selectRef,
        "virtual": virtual,
        "dropdownMatchSelectWidth": dropdownMatchSelectWidth
      }, selectProps), attrs), apiAttrs.value), {}, {
        "showSearch": (_b = props.showSearch) !== null && _b !== void 0 ? _b : (_c = select === null || select === void 0 ? void 0 : select.value) === null || _c === void 0 ? void 0 : _c.showSearch,
        "placeholder": placeholder,
        "listHeight": listHeight,
        "listItemHeight": listItemHeight,
        "mode": mode.value,
        "prefixCls": prefixCls.value,
        "direction": direction.value,
        "inputIcon": suffixIcon,
        "menuItemSelectedIcon": itemIcon,
        "removeIcon": removeIcon,
        "clearIcon": clearIcon,
        "notFoundContent": mergedNotFound,
        "class": [mergedClassName.value, attrs.class],
        "getPopupContainer": getPopupContainer === null || getPopupContainer === void 0 ? void 0 : getPopupContainer.value,
        "dropdownClassName": rcSelectRtlDropdownClassName,
        "onChange": triggerChange,
        "onBlur": handleBlur,
        "id": id,
        "dropdownRender": selectProps.dropdownRender || slots.dropdownRender,
        "transitionName": transitionName.value,
        "children": (_d = slots.default) === null || _d === void 0 ? void 0 : _d.call(slots),
        "tagRender": props.tagRender || slots.tagRender,
        "optionLabelRender": slots.optionLabel,
        "maxTagPlaceholder": props.maxTagPlaceholder || slots.maxTagPlaceholder,
        "showArrow": hasFeedback || showArrow,
        "disabled": mergedDisabled.value
      }), {
        option: slots.option
      }));
    };
  }
});
/* istanbul ignore next */
Select.install = function (app) {
  app.component(Select.name, Select);
  app.component(Select.Option.displayName, Select.Option);
  app.component(Select.OptGroup.displayName, Select.OptGroup);
  return app;
};
const SelectOption = exports.SelectOption = Select.Option;
const SelectOptGroup = exports.SelectOptGroup = Select.OptGroup;
var _default = exports.default = Select;