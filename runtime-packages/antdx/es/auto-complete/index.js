import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { createVNode as _createVNode } from "vue";
import _extends from "@babel/runtime/helpers/esm/extends";
import { defineComponent, ref, shallowRef, onMounted, onUnmounted } from 'vue';
import Select, { selectProps } from '../select';
import { isValidElement, flattenChildren } from '../_util/props-util';
import warning from '../_util/warning';
import Option from './Option';
import OptGroup from './OptGroup';
import omit from '../_util/omit';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import '../_util/AgentApiRegistry';
function isSelectOptionOrSelectOptGroup(child) {
  var _a, _b;
  return ((_a = child === null || child === void 0 ? void 0 : child.type) === null || _a === void 0 ? void 0 : _a.isSelectOption) || ((_b = child === null || child === void 0 ? void 0 : child.type) === null || _b === void 0 ? void 0 : _b.isSelectOptGroup);
}
export const autoCompleteProps = () => _extends(_extends({}, omit(selectProps(), ['loading', 'mode', 'optionLabelProp', 'labelInValue'])), {
  dataSource: Array,
  dropdownMenuStyle: {
    type: Object,
    default: undefined
  },
  // optionLabelProp: String,
  dropdownMatchSelectWidth: {
    type: [Number, Boolean],
    default: true
  },
  prefixCls: String,
  showSearch: {
    type: Boolean,
    default: undefined
  },
  transitionName: String,
  choiceTransitionName: {
    type: String,
    default: 'zoom'
  },
  autofocus: {
    type: Boolean,
    default: undefined
  },
  backfill: {
    type: Boolean,
    default: undefined
  },
  // optionLabelProp: PropTypes.string.def('children'),
  filterOption: {
    type: [Boolean, Function],
    default: false
  },
  defaultActiveFirstOption: {
    type: Boolean,
    default: true
  },
  status: String
});
export const AutoCompleteOption = Option;
export const AutoCompleteOptGroup = OptGroup;
const AutoComplete = defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'AAutoComplete',
  inheritAttrs: false,
  props: autoCompleteProps(),
  // emits: ['change', 'select', 'focus', 'blur'],
  slots: Object,
  setup(props, {
    slots,
    attrs,
    expose,
    emit
  }) {
    warning(!('dataSource' in slots), 'AutoComplete', '`dataSource` slot is deprecated, please use props `options` instead.');
    warning(!('options' in slots), 'AutoComplete', '`options` slot is deprecated, please use props `options` instead.');
    warning(!props.dropdownClassName, 'AutoComplete', '`dropdownClassName` is deprecated, please use `popupClassName` instead.');
    const selectRef = ref();
    const getInputElement = () => {
      var _a;
      const children = flattenChildren((_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots));
      const element = children.length ? children[0] : undefined;
      return element;
    };
    const focus = () => {
      var _a;
      (_a = selectRef.value) === null || _a === void 0 ? void 0 : _a.focus();
    };
    const blur = () => {
      var _a;
      (_a = selectRef.value) === null || _a === void 0 ? void 0 : _a.blur();
    };
    expose({
      focus,
      blur
    });
    const {
      prefixCls
    } = useConfigInject('select', props);
    const getAutocompleteStatus = () => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      const optionsList = [];
      // 优先从 dataSource 获取选项
      if (props.dataSource && props.dataSource.length > 0) {
        props.dataSource.forEach(item => {
          if (typeof item === 'string') {
            optionsList.push({
              value: item,
              label: item
            });
          } else if (typeof item === 'object') {
            // 如果是分组选项
            if (item.options && Array.isArray(item.options)) {
              item.options.forEach(subItem => {
                optionsList.push({
                  value: subItem.value,
                  label: subItem.label || subItem.value
                });
              });
            } else {
              // 普通选项
              optionsList.push({
                value: item.value,
                label: item.text || item.label || item.value
              });
            }
          }
        });
      }
      // 从 props.options 获取选项
      else if (props.options) {
        props.options.forEach(opt => {
          // 如果是分组选项
          if (opt.options && Array.isArray(opt.options)) {
            opt.options.forEach(subOpt => {
              optionsList.push({
                value: subOpt.value !== undefined ? subOpt.value : subOpt,
                label: subOpt.label || subOpt.value || subOpt
              });
            });
          } else {
            // 普通选项
            optionsList.push({
              value: opt.value !== undefined ? opt.value : opt,
              label: opt.label || opt.value || opt
            });
          }
        });
      }
      return {
        data: {
          options: optionsList
        }
      };
    };
    const setAutocompleteValue = value => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
            message: 'AutoComplete component is disabled'
          }
        };
      }
      // 获取所有可用的选项值
      const availableValues = [];
      // 优先从 dataSource 获取选项
      if (props.dataSource && props.dataSource.length > 0) {
        props.dataSource.forEach(item => {
          if (typeof item === 'string') {
            availableValues.push(item);
          } else if (typeof item === 'object') {
            // 如果是分组选项
            if (item.options && Array.isArray(item.options)) {
              item.options.forEach(subItem => {
                availableValues.push(subItem.value);
              });
            } else {
              // 普通选项
              availableValues.push(item.value);
            }
          }
        });
      }
      // 从 props.options 获取选项
      else if (props.options) {
        props.options.forEach(opt => {
          // 如果是分组选项
          if (opt.options && Array.isArray(opt.options)) {
            opt.options.forEach(subOpt => {
              availableValues.push(subOpt.value !== undefined ? subOpt.value : subOpt);
            });
          } else {
            // 普通选项
            availableValues.push(opt.value !== undefined ? opt.value : opt);
          }
        });
      }
      // 验证值是否在可用选项中
      if (!availableValues.includes(value)) {
        return {
          error: {
            code: 'OPTION_NOT_FOUND',
            message: `Option with value "${value}" not found in available options`,
            value: value
          }
        };
      }
      // 触发 update:value 事件和 change 事件来更新选中的值
      emit('update:value', value);
      emit('change', value);
      // 同时触发 select事件
      emit('select', value);
    };
    const setAutocompleteText = text => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
            message: 'AutoComplete component is disabled'
          }
        };
      }
      if (text === undefined || text === null) {
        return {
          error: {
            code: 'INVALID_INPUT',
            message: 'Input text cannot be undefined or null'
          }
        };
      }
      // 直接设置输入的文本值,不验证是否在选项列表中
      emit('update:value', text);
      emit('change', text);
      // 触发 search 事件以更新选项列表
      emit('search', text);
      return {
        data: {
          value: text,
          success: true
        }
      };
    };
    const apiAttrs = shallowRef({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('autocomplete', {
          getAutocompleteStatus: {
            handler: getAutocompleteStatus,
            description: 'Get the status of the autocomplete component, including the list of options.',
            params: []
          },
          setAutocompleteValue: {
            handler: setAutocompleteValue,
            description: 'Set the selected value of the autocomplete component (must be a value in the option list).',
            params: [{
              name: 'value',
              type: 'string',
              description: 'The value to select.'
            }]
          },
          setAutocompleteText: {
            handler: setAutocompleteText,
            description: 'Set the input text of the autocomplete component (can be any text).',
            params: [{
              name: 'text',
              type: 'string',
              description: 'The text to input.'
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
      var _a, _b, _c;
      const {
        size,
        dataSource,
        notFoundContent = (_a = slots.notFoundContent) === null || _a === void 0 ? void 0 : _a.call(slots)
      } = props;
      let optionChildren;
      const {
        class: className
      } = attrs;
      const cls = {
        [className]: !!className,
        [`${prefixCls.value}-lg`]: size === 'large',
        [`${prefixCls.value}-sm`]: size === 'small',
        [`${prefixCls.value}-show-search`]: true,
        [`${prefixCls.value}-auto-complete`]: true
      };
      if (props.options === undefined) {
        const childArray = ((_b = slots.dataSource) === null || _b === void 0 ? void 0 : _b.call(slots)) || ((_c = slots.options) === null || _c === void 0 ? void 0 : _c.call(slots)) || [];
        if (childArray.length && isSelectOptionOrSelectOptGroup(childArray[0])) {
          optionChildren = childArray;
        } else {
          optionChildren = dataSource ? dataSource.map(item => {
            if (isValidElement(item)) {
              return item;
            }
            switch (typeof item) {
              case 'string':
                return _createVNode(Option, {
                  "key": item,
                  "value": item
                }, {
                  default: () => [item]
                });
              case 'object':
                return _createVNode(Option, {
                  "key": item.value,
                  "value": item.value
                }, {
                  default: () => [item.text]
                });
              default:
                throw new Error('AutoComplete[dataSource] only supports type `string[] | Object[]`.');
            }
          }) : [];
        }
      }
      const selectProps = omit(_extends(_extends(_extends({}, props), attrs), {
        mode: Select.SECRET_COMBOBOX_MODE_DO_NOT_USE,
        // optionLabelProp,
        getInputElement,
        notFoundContent,
        // placeholder: '',
        class: cls,
        popupClassName: props.popupClassName || props.dropdownClassName,
        ref: selectRef
      }), ['dataSource', 'loading']);
      return _createVNode(Select, _objectSpread(_objectSpread({}, selectProps), apiAttrs.value), _objectSpread({
        default: () => [optionChildren]
      }, omit(slots, ['default', 'dataSource', 'options'])));
    };
  }
});
/* istanbul ignore next */
export default _extends(AutoComplete, {
  Option,
  OptGroup,
  install(app) {
    app.component(AutoComplete.name, AutoComplete);
    app.component(Option.displayName, Option);
    app.component(OptGroup.displayName, OptGroup);
    return app;
  }
});