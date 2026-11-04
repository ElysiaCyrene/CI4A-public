"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.autoCompleteProps = exports.AutoCompleteOption = exports.AutoCompleteOptGroup = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _select = _interopRequireWildcard(require("../select"));
var _propsUtil = require("../_util/props-util");
var _warning = _interopRequireDefault(require("../_util/warning"));
var _Option = _interopRequireDefault(require("./Option"));
var _OptGroup = _interopRequireDefault(require("./OptGroup"));
var _omit = _interopRequireDefault(require("../_util/omit"));
var _useConfigInject = _interopRequireDefault(require("../config-provider/hooks/useConfigInject"));
require("../_util/AgentApiRegistry");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function isSelectOptionOrSelectOptGroup(child) {
  var _a, _b;
  return ((_a = child === null || child === void 0 ? void 0 : child.type) === null || _a === void 0 ? void 0 : _a.isSelectOption) || ((_b = child === null || child === void 0 ? void 0 : child.type) === null || _b === void 0 ? void 0 : _b.isSelectOptGroup);
}
const autoCompleteProps = () => (0, _extends2.default)((0, _extends2.default)({}, (0, _omit.default)((0, _select.selectProps)(), ['loading', 'mode', 'optionLabelProp', 'labelInValue'])), {
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
exports.autoCompleteProps = autoCompleteProps;
const AutoCompleteOption = exports.AutoCompleteOption = _Option.default;
const AutoCompleteOptGroup = exports.AutoCompleteOptGroup = _OptGroup.default;
const AutoComplete = (0, _vue.defineComponent)({
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
    (0, _warning.default)(!('dataSource' in slots), 'AutoComplete', '`dataSource` slot is deprecated, please use props `options` instead.');
    (0, _warning.default)(!('options' in slots), 'AutoComplete', '`options` slot is deprecated, please use props `options` instead.');
    (0, _warning.default)(!props.dropdownClassName, 'AutoComplete', '`dropdownClassName` is deprecated, please use `popupClassName` instead.');
    const selectRef = (0, _vue.ref)();
    const getInputElement = () => {
      var _a;
      const children = (0, _propsUtil.flattenChildren)((_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots));
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
    } = (0, _useConfigInject.default)('select', props);
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
    const apiAttrs = (0, _vue.shallowRef)({});
    (0, _vue.onMounted)(() => {
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
    (0, _vue.onUnmounted)(() => {
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
            if ((0, _propsUtil.isValidElement)(item)) {
              return item;
            }
            switch (typeof item) {
              case 'string':
                return (0, _vue.createVNode)(_Option.default, {
                  "key": item,
                  "value": item
                }, {
                  default: () => [item]
                });
              case 'object':
                return (0, _vue.createVNode)(_Option.default, {
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
      const selectProps = (0, _omit.default)((0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, props), attrs), {
        mode: _select.default.SECRET_COMBOBOX_MODE_DO_NOT_USE,
        // optionLabelProp,
        getInputElement,
        notFoundContent,
        // placeholder: '',
        class: cls,
        popupClassName: props.popupClassName || props.dropdownClassName,
        ref: selectRef
      }), ['dataSource', 'loading']);
      return (0, _vue.createVNode)(_select.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, selectProps), apiAttrs.value), (0, _objectSpread2.default)({
        default: () => [optionChildren]
      }, (0, _omit.default)(slots, ['default', 'dataSource', 'options'])));
    };
  }
});
/* istanbul ignore next */
var _default = exports.default = (0, _extends2.default)(AutoComplete, {
  Option: _Option.default,
  OptGroup: _OptGroup.default,
  install(app) {
    app.component(AutoComplete.name, AutoComplete);
    app.component(_Option.default.displayName, _Option.default);
    app.component(_OptGroup.default.displayName, _OptGroup.default);
    return app;
  }
});