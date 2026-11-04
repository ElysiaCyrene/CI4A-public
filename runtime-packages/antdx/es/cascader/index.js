import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _extends from "@babel/runtime/helpers/esm/extends";
import { createVNode as _createVNode } from "vue";
var __rest = this && this.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
import VcCascader, { cascaderProps as vcCascaderProps, SHOW_CHILD, SHOW_PARENT } from '../vc-cascader';
import RightOutlined from "@ant-design/icons-vue/es/icons/RightOutlined";
import LoadingOutlined from "@ant-design/icons-vue/es/icons/LoadingOutlined";
import LeftOutlined from "@ant-design/icons-vue/es/icons/LeftOutlined";
import getIcons from '../select/utils/iconUtil';
import { withInstall } from '../_util/type';
import omit from '../_util/omit';
import { computed, defineComponent, onUnmounted, onMounted, shallowRef, ref, watchEffect } from 'vue';
import PropTypes from '../_util/vue-types';
import { initDefaultProps } from '../_util/props-util';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import classNames from '../_util/classNames';
import devWarning from '../vc-util/devWarning';
import { getTransitionDirection, getTransitionName } from '../_util/transition';
import { useInjectFormItemContext } from '../form';
import { getStatusClassNames, getMergedStatus } from '../_util/statusUtils';
import { FormItemInputContext } from '../form/FormItemContext';
import { useCompactItemContext } from '../space/Compact';
import '../_util/AgentApiRegistry';
import useSelectStyle from '../select/style';
import useStyle from './style';
import { useInjectDisabled } from '../config-provider/DisabledContext';
function highlightKeyword(str, lowerKeyword, prefixCls) {
  const cells = str.toLowerCase().split(lowerKeyword).reduce((list, cur, index) => index === 0 ? [cur] : [...list, lowerKeyword, cur], []);
  const fillCells = [];
  let start = 0;
  cells.forEach((cell, index) => {
    const end = start + cell.length;
    let originWorld = str.slice(start, end);
    start = end;
    if (index % 2 === 1) {
      const _originWorld = function () {
        return originWorld;
      }();
      originWorld = _createVNode("span", {
        "class": `${prefixCls}-menu-item-keyword`,
        "key": "seperator"
      }, [originWorld]);
    }
    fillCells.push(originWorld);
  });
  return fillCells;
}
const defaultSearchRender = ({
  inputValue,
  path,
  prefixCls,
  fieldNames
}) => {
  const optionList = [];
  // We do lower here to save perf
  const lower = inputValue.toLowerCase();
  path.forEach((node, index) => {
    if (index !== 0) {
      optionList.push(' / ');
    }
    let label = node[fieldNames.label];
    const type = typeof label;
    if (type === 'string' || type === 'number') {
      label = highlightKeyword(String(label), lower, prefixCls);
    }
    optionList.push(label);
  });
  return optionList;
};
export function cascaderProps() {
  return _extends(_extends({}, omit(vcCascaderProps(), ['customSlots', 'checkable', 'options'])), {
    multiple: {
      type: Boolean,
      default: undefined
    },
    size: String,
    bordered: {
      type: Boolean,
      default: undefined
    },
    placement: {
      type: String
    },
    suffixIcon: PropTypes.any,
    status: String,
    options: Array,
    popupClassName: String,
    /** @deprecated Please use `popupClassName` instead */
    dropdownClassName: String,
    'onUpdate:value': Function
  });
}
const Cascader = defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'ACascader',
  inheritAttrs: false,
  props: initDefaultProps(cascaderProps(), {
    bordered: true,
    choiceTransitionName: '',
    allowClear: true
  }),
  setup(props, {
    attrs,
    expose,
    slots,
    emit
  }) {
    // ====================== Warning ======================
    if (process.env.NODE_ENV !== 'production') {
      devWarning(!props.dropdownClassName, 'Cascader', '`dropdownClassName` is deprecated. Please use `popupClassName` instead.');
    }
    const formItemContext = useInjectFormItemContext();
    const formItemInputContext = FormItemInputContext.useInject();
    const mergedStatus = computed(() => getMergedStatus(formItemInputContext.status, props.status));
    const {
      prefixCls: cascaderPrefixCls,
      rootPrefixCls,
      getPrefixCls,
      direction,
      getPopupContainer,
      renderEmpty,
      size: contextSize,
      disabled
    } = useConfigInject('cascader', props);
    const prefixCls = computed(() => getPrefixCls('select', props.prefixCls));
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
    const [wrapSelectSSR, hashId] = useSelectStyle(prefixCls);
    const [wrapCascaderSSR] = useStyle(cascaderPrefixCls);
    const isRtl = computed(() => direction.value === 'rtl');
    // =================== Warning =====================
    if (process.env.NODE_ENV !== 'production') {
      watchEffect(() => {
        devWarning(!props.multiple || !props.displayRender || !slots.displayRender, 'Cascader', '`displayRender` not work on `multiple`. Please use `tagRender` instead.');
      });
    }
    // ==================== Search =====================
    const mergedShowSearch = computed(() => {
      if (!props.showSearch) {
        return props.showSearch;
      }
      let searchConfig = {
        render: defaultSearchRender
      };
      if (typeof props.showSearch === 'object') {
        searchConfig = _extends(_extends({}, searchConfig), props.showSearch);
      }
      return searchConfig;
    });
    // =================== Dropdown ====================
    const mergedDropdownClassName = computed(() => classNames(props.popupClassName || props.dropdownClassName, `${cascaderPrefixCls.value}-dropdown`, {
      [`${cascaderPrefixCls.value}-dropdown-rtl`]: isRtl.value
    }, hashId.value));
    const selectRef = ref();
    expose({
      focus() {
        var _a;
        (_a = selectRef.value) === null || _a === void 0 ? void 0 : _a.focus();
      },
      blur() {
        var _a;
        (_a = selectRef.value) === null || _a === void 0 ? void 0 : _a.blur();
      }
    });
    const handleChange = (...args) => {
      emit('update:value', args[0]);
      emit('change', ...args);
      formItemContext.onFieldChange();
    };
    const handleBlur = (...args) => {
      emit('blur', ...args);
      formItemContext.onFieldBlur();
    };
    const mergedShowArrow = computed(() => props.showArrow !== undefined ? props.showArrow : props.loading || !props.multiple);
    const placement = computed(() => {
      if (props.placement !== undefined) {
        return props.placement;
      }
      return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
    });
    // ========== Agent API ===========
    const getCascaderStatus = () => {
      var _a, _b;
      if (props.disabled || mergedDisabled.value) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      // Get all selectable options from the cascader
      const options = props.options || [];
      const fieldNames = props.fieldNames || {};
      const valueField = fieldNames.value || 'value';
      const labelField = fieldNames.label || 'label';
      const childrenField = fieldNames.children || 'children';
      const showCheckedStrategy = (_a = props.showCheckedStrategy) !== null && _a !== void 0 ? _a : SHOW_PARENT;
      const changeOnSelect = (_b = props.changeOnSelect) !== null && _b !== void 0 ? _b : false;
      // Recursively collect all options
      const collectOptions = (items, path = [], parentDisabled = false) => {
        const result = [];
        items.forEach(item => {
          var _a;
          const currentPath = [...path, item[valueField]];
          const isDisabled = parentDisabled || item.disabled || false;
          const hasChildren = ((_a = item[childrenField]) === null || _a === void 0 ? void 0 : _a.length) > 0;
          const isLeaf = item.isLeaf !== false && !hasChildren;
          // Parent nodes are only selectable if changeOnSelect is true or in multiple mode
          const canSelectParent = changeOnSelect || props.multiple;
          const isSelectable = isLeaf || canSelectParent;
          const optionInfo = {
            value: item[valueField],
            label: item[labelField],
            path: currentPath,
            // disabled: isDisabled,
            isLeaf: isLeaf,
            isSelectable: isSelectable && !isDisabled
          };
          result.push(optionInfo);
          // Recursively collect children options, inherit disabled state
          if (hasChildren) {
            result.push(...collectOptions(item[childrenField], currentPath, isDisabled));
          }
        });
        return result;
      };
      return {
        data: {
          options: collectOptions(options),
          Value: props.value,
          ismultiple: props.multiple,
          changeOnSelect: changeOnSelect,
          showCheckedStrategy: showCheckedStrategy // Controls how selected results are displayed
        }
      };
    };
    const setCascaderValues = values => {
      // Get cascader status to obtain options information
      const statusResult = getCascaderStatus();
      if (statusResult.error) {
        return {
          error: statusResult.error
        };
      }
      const {
        options: allOptions,
        ismultiple,
        showCheckedStrategy
      } = statusResult.data;
      // Create a map from value to option info for quick lookup
      const valueToOptionMap = new Map();
      allOptions.forEach(opt => {
        valueToOptionMap.set(opt.value, opt);
      });
      // Find option by single value and return its path
      const findPathByValue = value => {
        const option = valueToOptionMap.get(value);
        if (!option) {
          return {
            path: [],
            valid: false,
            isSelectable: false
          };
        }
        return {
          path: option.path,
          valid: true,
          isSelectable: option.isSelectable
        };
      };
      // Get all descendant leaf paths by value
      const getAllLeafPathsByValue = value => {
        const leafPaths = [];
        const option = valueToOptionMap.get(value);
        if (!option) return [];
        // Find all descendants of this option
        allOptions.forEach(opt => {
          // Check if opt is a descendant of the given value
          const optPath = opt.path;
          const valuePath = option.path;
          if (optPath.length > valuePath.length) {
            const isDescendant = valuePath.every((v, i) => optPath[i] === v);
            if (isDescendant && opt.isLeaf) {
              leafPaths.push(opt.path);
            }
          }
        });
        // If no descendants found, return current path if it's a leaf
        if (leafPaths.length === 0 && option.isLeaf) {
          leafPaths.push(option.path);
        }
        return leafPaths;
      };
      // Validate and convert values based on mode and showCheckedStrategy
      const normalizeValues = inputValues => {
        if (!ismultiple) {
          // Single mode: convert value to path
          const result = findPathByValue(inputValues);
          if (!result.valid) {
            return {
              paths: null,
              error: {
                code: 'INVALID_VALUE',
                message: `Invalid value: ${inputValues}`
              }
            };
          }
          if (!result.isSelectable) {
            return {
              paths: null,
              error: {
                code: 'VALUE_NOT_SELECTABLE',
                message: `Value is not selectable: ${inputValues}`
              }
            };
          }
          return {
            paths: result.path
          };
        }
        // Multiple mode: convert array of values to array of paths
        const validPaths = [];
        const inputArray = Array.isArray(inputValues) ? inputValues : [inputValues];
        const invalidValues = [];
        const unselectableValues = [];
        inputArray.forEach(value => {
          const result = findPathByValue(value);
          if (!result.valid) {
            invalidValues.push(value);
            return;
          }
          if (!result.isSelectable) {
            unselectableValues.push(value);
            return;
          }
          if (showCheckedStrategy === SHOW_CHILD) {
            const option = valueToOptionMap.get(value);
            if (option && !option.isLeaf) {
              // Has children, expand to all leaf nodes
              const leafPaths = getAllLeafPathsByValue(value);
              validPaths.push(...leafPaths);
            } else {
              // Is leaf, use as is
              validPaths.push(result.path);
            }
          } else {
            // SHOW_PARENT mode: use paths as is
            validPaths.push(result.path);
          }
        });
        // Return error if any invalid or unselectable values
        if (invalidValues.length > 0) {
          return {
            paths: null,
            error: {
              code: 'INVALID_VALUE',
              message: `Invalid values: ${invalidValues.join(', ')}`
            }
          };
        }
        if (unselectableValues.length > 0) {
          return {
            paths: null,
            error: {
              code: 'VALUE_NOT_SELECTABLE',
              message: `Values are not selectable: ${unselectableValues.join(', ')}`
            }
          };
        }
        return {
          paths: validPaths
        };
      };
      const normalizeResult = normalizeValues(values);
      // If validation failed, return error
      if (normalizeResult.error) {
        return {
          error: normalizeResult.error
        };
      }
      const normalizedValues = normalizeResult.paths;
      // If validation failed, don't update
      if (normalizedValues === null || Array.isArray(normalizedValues) && normalizedValues.length === 0 && values.length > 0) {
        return {
          error: {
            code: 'INVALID_VALUE',
            message: `Invalid value: ${values}`
          }
        };
      }
      // Get the actual option objects for the change event
      const fieldNames = props.fieldNames || {};
      const valueField = fieldNames.value || 'value';
      const childrenField = fieldNames.children || 'children';
      const options = props.options || [];
      const findOptionsByPath = path => {
        const result = [];
        let currentOptions = options;
        for (const value of path) {
          const found = currentOptions.find(opt => opt[valueField] === value);
          if (found) {
            result.push(found);
            currentOptions = found[childrenField] || [];
          }
        }
        return result;
      };
      if (ismultiple) {
        // For multiple mode, values should be an array of paths
        const selectedOptions = normalizedValues.map(path => findOptionsByPath(path));
        emit('update:value', normalizedValues);
        emit('change', normalizedValues, selectedOptions);
      } else {
        // For single mode, value should be a single path array
        const selectedOptions = findOptionsByPath(normalizedValues);
        emit('update:value', normalizedValues);
        emit('change', normalizedValues, selectedOptions);
      }
      formItemContext.onFieldChange();
    };
    const apiAttrs = shallowRef({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('cascader', {
          getCascaderStatus: {
            handler: getCascaderStatus,
            description: 'Get the status of the cascader, including the list of options.',
            params: []
          },
          setCascaderValues: {
            handler: setCascaderValues,
            description: 'Set the value of the cascader.',
            params: [{
              name: 'values',
              type: props.multiple ? 'string | number' : 'list[string | number]',
              description: 'The value to set. Can be a single value or an array (for multiple mode).'
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
      var _a, _b;
      const {
          notFoundContent = (_a = slots.notFoundContent) === null || _a === void 0 ? void 0 : _a.call(slots),
          expandIcon = (_b = slots.expandIcon) === null || _b === void 0 ? void 0 : _b.call(slots),
          multiple,
          bordered,
          allowClear,
          choiceTransitionName,
          transitionName,
          id = formItemContext.id.value
        } = props,
        restProps = __rest(props, ["notFoundContent", "expandIcon", "multiple", "bordered", "allowClear", "choiceTransitionName", "transitionName", "id"]);
      // =================== No Found ====================
      const mergedNotFoundContent = notFoundContent || renderEmpty('Cascader');
      // ===================== Icon ======================
      let mergedExpandIcon = expandIcon;
      if (!expandIcon) {
        mergedExpandIcon = isRtl.value ? _createVNode(LeftOutlined, null, null) : _createVNode(RightOutlined, null, null);
      }
      const loadingIcon = _createVNode("span", {
        "class": `${prefixCls.value}-menu-item-loading-icon`
      }, [_createVNode(LoadingOutlined, {
        "spin": true
      }, null)]);
      // ===================== Icons =====================
      const {
        suffixIcon,
        removeIcon,
        clearIcon
      } = getIcons(_extends(_extends({}, props), {
        hasFeedback: formItemInputContext.hasFeedback,
        feedbackIcon: formItemInputContext.feedbackIcon,
        multiple,
        prefixCls: prefixCls.value,
        showArrow: mergedShowArrow.value
      }), slots);
      return wrapCascaderSSR(wrapSelectSSR(_createVNode(VcCascader, _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, restProps), attrs), apiAttrs.value), {}, {
        "id": id,
        "prefixCls": prefixCls.value,
        "class": [cascaderPrefixCls.value, {
          [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
          [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
          [`${prefixCls.value}-rtl`]: isRtl.value,
          [`${prefixCls.value}-borderless`]: !bordered,
          [`${prefixCls.value}-in-form-item`]: formItemInputContext.isFormItemInput
        }, getStatusClassNames(prefixCls.value, mergedStatus.value, formItemInputContext.hasFeedback), compactItemClassnames.value, attrs.class, hashId.value],
        "disabled": mergedDisabled.value,
        "direction": direction.value,
        "placement": placement.value,
        "notFoundContent": mergedNotFoundContent,
        "allowClear": allowClear,
        "showSearch": mergedShowSearch.value,
        "expandIcon": mergedExpandIcon,
        "inputIcon": suffixIcon,
        "removeIcon": removeIcon,
        "clearIcon": clearIcon,
        "loadingIcon": loadingIcon,
        "checkable": !!multiple,
        "dropdownClassName": mergedDropdownClassName.value,
        "dropdownPrefixCls": cascaderPrefixCls.value,
        "choiceTransitionName": getTransitionName(rootPrefixCls.value, '', choiceTransitionName),
        "transitionName": getTransitionName(rootPrefixCls.value, getTransitionDirection(placement.value), transitionName),
        "getPopupContainer": getPopupContainer === null || getPopupContainer === void 0 ? void 0 : getPopupContainer.value,
        "customSlots": _extends(_extends({}, slots), {
          checkable: () => _createVNode("span", {
            "class": `${cascaderPrefixCls.value}-checkbox-inner`
          }, null)
        }),
        "tagRender": props.tagRender || slots.tagRender,
        "displayRender": props.displayRender || slots.displayRender,
        "maxTagPlaceholder": props.maxTagPlaceholder || slots.maxTagPlaceholder,
        "showArrow": formItemInputContext.hasFeedback || props.showArrow,
        "onChange": handleChange,
        "onBlur": handleBlur,
        "ref": selectRef
      }), slots)));
    };
  }
});
export default withInstall(_extends(Cascader, {
  SHOW_CHILD,
  SHOW_PARENT
}));