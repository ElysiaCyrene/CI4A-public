import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { nextTick, defineComponent, ref, watch, computed, onMounted, shallowRef, onUnmounted, createVNode as _createVNode } from 'vue';
import classNames from '../_util/classNames';
import PropTypes from '../_util/vue-types';
import Radio from './Radio';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import { booleanType, stringType, arrayType, functionType } from '../_util/type';
import { useInjectFormItemContext } from '../form/FormItemContext';
import { useProvideRadioGroupContext } from './context';
import '../_util/AgentApiRegistry';
// CSSINJS
import useStyle from './style';
const RadioGroupSizeTypes = ['large', 'default', 'small'];
export const radioGroupProps = () => ({
  prefixCls: String,
  value: PropTypes.any,
  size: stringType(),
  options: arrayType(),
  disabled: booleanType(),
  name: String,
  buttonStyle: stringType('outline'),
  id: String,
  optionType: stringType('default'),
  onChange: functionType(),
  'onUpdate:value': functionType()
});
export default defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'ARadioGroup',
  inheritAttrs: false,
  props: radioGroupProps(),
  // emits: ['update:value', 'change'],
  setup(props, {
    slots,
    emit,
    attrs
  }) {
    const formItemContext = useInjectFormItemContext();
    const {
      prefixCls,
      direction,
      size
    } = useConfigInject('radio', props);
    // Style
    const [wrapSSR, hashId] = useStyle(prefixCls);
    const stateValue = ref(props.value);
    const updatingValue = ref(false);
    watch(() => props.value, val => {
      stateValue.value = val;
      updatingValue.value = false;
    });
    const onRadioChange = ev => {
      const lastValue = stateValue.value;
      const {
        value
      } = ev.target;
      if (!('value' in props)) {
        stateValue.value = value;
      }
      // nextTick for https://github.com/vueComponent/ant-design-vue/issues/1280
      if (!updatingValue.value && value !== lastValue) {
        updatingValue.value = true;
        emit('update:value', value);
        emit('change', ev);
        formItemContext.onFieldChange();
      }
      nextTick(() => {
        updatingValue.value = false;
      });
    };
    useProvideRadioGroupContext({
      onChange: onRadioChange,
      value: stateValue,
      disabled: computed(() => props.disabled),
      name: computed(() => props.name),
      optionType: computed(() => props.optionType)
    });
    // ========== Agent API ===========
    const getRadiogroupStatus = () => {
      var _a;
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      const {
        options
      } = props;
      const radioOptions = [];
      if (options && options.length > 0) {
        // 如果使用 options 属性定义
        options.forEach(option => {
          if (typeof option === 'string' || typeof option === 'number') {
            radioOptions.push({
              value: option,
              label: option,
              disabled: props.disabled || false,
              checked: stateValue.value === option
            });
          } else {
            const {
              value,
              disabled,
              label
            } = option;
            radioOptions.push({
              value,
              label: label,
              disabled: disabled || props.disabled || false,
              checked: stateValue.value === value
            });
          }
        });
      } else {
        // 从 slots 中提取选项
        const children = (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots);
        if (children) {
          const extractOptions = vnodes => {
            vnodes.forEach(vnode => {
              var _a, _b, _c;
              if (!vnode) return;
              // 处理 Radio 或 RadioButton 组件
              if (((_a = vnode.type) === null || _a === void 0 ? void 0 : _a.name) === 'ARadio' || ((_b = vnode.type) === null || _b === void 0 ? void 0 : _b.name) === 'ARadioButton' || vnode.type === Radio) {
                const radioProps = vnode.props || {};
                const value = radioProps.value;
                // 提取 label 文本
                let label = value; // 默认使用 value
                if ((_c = vnode.children) === null || _c === void 0 ? void 0 : _c.default) {
                  const childNodes = vnode.children.default();
                  if (Array.isArray(childNodes) && childNodes.length > 0) {
                    // 提取文本内容
                    const textContent = childNodes.map(child => {
                      if (typeof child === 'string') return child;
                      if (child && typeof child === 'object' && 'children' in child) {
                        return child.children;
                      }
                      return '';
                    }).join('');
                    label = textContent || value;
                  }
                }
                // 从 props 中获取实际的 disabled 值
                const disabled = radioProps.disabled === '' || radioProps.disabled === true;
                radioOptions.push({
                  value,
                  label,
                  disabled: disabled || props.disabled || false
                  // checked: stateValue.value === value,
                });
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
      }
      return {
        data: {
          value: stateValue.value,
          options: radioOptions
        }
      };
    };
    const setRadiogroupValue = value => {
      var _a;
      if (props.disabled) {
        return {
          success: false,
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      const {
        options
      } = props;
      // 验证 value 是否是有效的选项
      let isValidOption = false;
      let isDisabledOption = false;
      if (options && options.length > 0) {
        // 从 options 属性中验证
        options.some(option => {
          if (typeof option === 'string' || typeof option === 'number') {
            if (option === value) {
              isValidOption = true;
              return true;
            }
          } else {
            const opt = option;
            if (opt.value === value) {
              isValidOption = true;
              isDisabledOption = opt.disabled || false;
              return true;
            }
          }
          return false;
        });
      } else {
        // 从 slots 中验证
        const children = (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots);
        if (children) {
          const checkOptions = vnodes => {
            vnodes.forEach(vnode => {
              var _a, _b;
              if (!vnode || isValidOption) return;
              if (((_a = vnode.type) === null || _a === void 0 ? void 0 : _a.name) === 'ARadio' || ((_b = vnode.type) === null || _b === void 0 ? void 0 : _b.name) === 'ARadioButton' || vnode.type === Radio) {
                const radioProps = vnode.props || {};
                if (radioProps.value === value) {
                  isValidOption = true;
                  // 从 props 中获取实际的 disabled 值
                  isDisabledOption = radioProps.disabled === '' || radioProps.disabled === true;
                }
              } else if (vnode.children) {
                if (Array.isArray(vnode.children)) {
                  checkOptions(vnode.children);
                } else if (vnode.children.default) {
                  const defaultChildren = vnode.children.default();
                  if (Array.isArray(defaultChildren)) {
                    checkOptions(defaultChildren);
                  }
                }
              }
              if (Array.isArray(vnode)) {
                checkOptions(vnode);
              }
            });
          };
          checkOptions(Array.isArray(children) ? children : [children]);
        }
      }
      if (!isValidOption) {
        return {
          error: {
            code: 'INVALID_OPTION',
            message: `The value "${value}" is not in the available options`
          }
        };
      }
      if (isDisabledOption) {
        return {
          error: {
            code: 'OPTION_DISABLED',
            message: `The option with value "${value}" is disabled`
          }
        };
      }
      // 更新值
      stateValue.value = value;
      emit('update:value', value);
      // 触发 change 事件
      const ev = {
        target: {
          value
        }
      };
      emit('change', ev);
      formItemContext.onFieldChange();
    };
    const apiAttrs = shallowRef({});
    onMounted(() => {
      // 只在 Menu 不在 Dropdown 里时注册 API
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('radiogroup', {
          getRadiogroupStatus: {
            handler: getRadiogroupStatus,
            description: 'Get the current status of the radio group component, including current value and all options.'
          },
          setRadiogroupValue: {
            handler: setRadiogroupValue,
            description: 'Set the value of the radio group component.',
            params: [{
              name: 'value',
              type: 'string | number',
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
      var _a;
      const {
        options,
        buttonStyle,
        id = formItemContext.id.value
      } = props;
      const groupPrefixCls = `${prefixCls.value}-group`;
      const classString = classNames(groupPrefixCls, `${groupPrefixCls}-${buttonStyle}`, {
        [`${groupPrefixCls}-${size.value}`]: size.value,
        [`${groupPrefixCls}-rtl`]: direction.value === 'rtl'
      }, attrs.class, hashId.value);
      let children = null;
      if (options && options.length > 0) {
        children = options.map(option => {
          if (typeof option === 'string' || typeof option === 'number') {
            return _createVNode(Radio, {
              "key": option,
              "prefixCls": prefixCls.value,
              "disabled": props.disabled,
              "value": option,
              "checked": stateValue.value === option
            }, {
              default: () => [option]
            });
          }
          const {
            value,
            disabled,
            label
          } = option;
          return _createVNode(Radio, {
            "key": `radio-group-value-options-${value}`,
            "prefixCls": prefixCls.value,
            "disabled": disabled || props.disabled,
            "value": value,
            "checked": stateValue.value === value
          }, {
            default: () => [label]
          });
        });
      } else {
        children = (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots);
      }
      return wrapSSR(_createVNode("div", _objectSpread(_objectSpread(_objectSpread({}, attrs), apiAttrs.value), {}, {
        "class": classString,
        "id": id
      }), [children]));
    };
  }
});