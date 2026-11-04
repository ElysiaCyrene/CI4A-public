import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { createVNode as _createVNode } from "vue";
import _extends from "@babel/runtime/helpers/esm/extends";
import { computed, defineComponent, ref, onMounted, onUnmounted, shallowRef } from 'vue';
import classNames from '../_util/classNames';
import RcSelect, { selectProps as vcSelectProps, Option, OptGroup } from '../vc-select';
import getIcons from './utils/iconUtil';
import PropTypes from '../_util/vue-types';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import { DefaultRenderEmpty } from '../config-provider/renderEmpty';
import omit from '../_util/omit';
import { FormItemInputContext, useInjectFormItemContext } from '../form/FormItemContext';
import { getTransitionDirection, getTransitionName } from '../_util/transition';
import { initDefaultProps } from '../_util/props-util';
import { getStatusClassNames, getMergedStatus } from '../_util/statusUtils';
import { stringType, someType, functionType, booleanType } from '../_util/type';
import { useCompactItemContext } from '../space/Compact';
import '../_util/AgentApiRegistry';
// CSSINJS
import useStyle from './style';
import { useInjectDisabled } from '../config-provider/DisabledContext';
import devWarning from '../vc-util/devWarning';
export const selectProps = () => _extends(_extends({}, omit(vcSelectProps(), ['inputIcon', 'mode', 'getInputElement', 'getRawInputElement', 'backfill'])), {
  value: someType([Array, Object, String, Number]),
  defaultValue: someType([Array, Object, String, Number]),
  notFoundContent: PropTypes.any,
  suffixIcon: PropTypes.any,
  itemIcon: PropTypes.any,
  size: stringType(),
  mode: stringType(),
  bordered: booleanType(true),
  transitionName: String,
  choiceTransitionName: stringType(''),
  popupClassName: String,
  /** @deprecated Please use `popupClassName` instead */
  dropdownClassName: String,
  placement: stringType(),
  status: stringType(),
  'onUpdate:value': functionType()
});
const SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';
const Select = defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'ASelect',
  Option,
  OptGroup,
  inheritAttrs: false,
  props: initDefaultProps(selectProps(), {
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
    const selectRef = ref();
    const formItemContext = useInjectFormItemContext();
    const formItemInputContext = FormItemInputContext.useInject();
    const mergedStatus = computed(() => getMergedStatus(formItemInputContext.status, props.status));
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
    const mode = computed(() => {
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
      devWarning(!props.dropdownClassName, 'Select', '`dropdownClassName` is deprecated. Please use `popupClassName` instead.');
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
    } = useConfigInject('select', props);
    const {
      compactSize,
      compactItemClassnames
    } = useCompactItemContext(prefixCls, direction);
    const mergedSize = computed(() => compactSize.value || contextSize.value);
    const contextDisabled = useInjectDisabled();
    const mergedDisabled = computed(() => {
      var _a;
      return (_a = disabled.value) !== null && _a !== void 0 ? _a : contextDisabled.value;
    });
    // style
    const [wrapSSR, hashId] = useStyle(prefixCls);
    const rootPrefixCls = computed(() => getPrefixCls());
    // ===================== Placement =====================
    const placement = computed(() => {
      if (props.placement !== undefined) {
        return props.placement;
      }
      return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
    });
    const transitionName = computed(() => getTransitionName(rootPrefixCls.value, getTransitionDirection(placement.value), props.transitionName));
    const mergedClassName = computed(() => classNames({
      [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
      [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
      [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
      [`${prefixCls.value}-borderless`]: !props.bordered,
      [`${prefixCls.value}-in-form-item`]: formItemInputContext.isFormItemInput
    }, getStatusClassNames(prefixCls.value, mergedStatus.value, formItemInputContext.hasFeedback), compactItemClassnames.value, hashId.value));
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
    const isMultiple = computed(() => mode.value === 'multiple' || mode.value === 'tags');
    const mergedShowArrow = computed(() => props.showArrow !== undefined ? props.showArrow : props.loading || !(isMultiple.value || mode.value === 'combobox'));
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
            if (((_a = vnode.type) === null || _a === void 0 ? void 0 : _a.name) === 'ASelectOption' || vnode.type === Option) {
              const optionProps = vnode.props || {};
              options.push({
                value: optionProps.value,
                label: optionProps.label,
                disabled: !!optionProps.disabled
              });
            }
            // 处理 OptGroup 组件
            else if (((_b = vnode.type) === null || _b === void 0 ? void 0 : _b.name) === 'ASelectOptGroup' || vnode.type === OptGroup) {
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
    const apiAttrs = shallowRef({});
    onMounted(() => {
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
    onUnmounted(() => {
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
        mergedNotFound = (renderEmpty === null || renderEmpty === void 0 ? void 0 : renderEmpty('Select')) || _createVNode(DefaultRenderEmpty, {
          "componentName": "Select"
        }, null);
      }
      // ===================== Icons =====================
      const {
        suffixIcon,
        itemIcon,
        removeIcon,
        clearIcon
      } = getIcons(_extends(_extends({}, props), {
        multiple: isMultiple.value,
        prefixCls: prefixCls.value,
        hasFeedback,
        feedbackIcon,
        showArrow: mergedShowArrow.value
      }), slots);
      const selectProps = omit(props, ['prefixCls', 'suffixIcon', 'itemIcon', 'removeIcon', 'clearIcon', 'size', 'bordered', 'status']);
      const rcSelectRtlDropdownClassName = classNames(popupClassName || dropdownClassName, {
        [`${prefixCls.value}-dropdown-${direction.value}`]: direction.value === 'rtl'
      }, hashId.value);
      return wrapSSR(_createVNode(RcSelect, _objectSpread(_objectSpread(_objectSpread(_objectSpread({
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
export const SelectOption = Select.Option;
export const SelectOptGroup = Select.OptGroup;
export default Select;