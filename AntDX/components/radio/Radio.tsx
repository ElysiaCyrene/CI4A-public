import type { ExtractPropTypes } from 'vue';
import { computed, defineComponent, ref, shallowRef, onMounted, onUnmounted } from 'vue';
import PropTypes from '../_util/vue-types';
import VcCheckbox from '../vc-checkbox/Checkbox';
import classNames from '../_util/classNames';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import type { RadioChangeEvent } from './interface';
import { FormItemInputContext, useInjectFormItemContext } from '../form/FormItemContext';
import omit from '../_util/omit';
import type { FocusEventHandler, MouseEventHandler } from '../_util/EventInterface';
import { useInjectRadioGroupContext, useInjectRadioOptionTypeContext } from './context';
import { booleanType, functionType } from '../_util/type';
import '../_util/AgentApiRegistry';

// CSSINJS
import useStyle from './style';
import { useInjectDisabled } from '../config-provider/DisabledContext';

export const radioProps = () => ({
  prefixCls: String,
  checked: booleanType(),
  disabled: booleanType(),
  isGroup: booleanType(),
  value: PropTypes.any,
  name: String,
  id: String,
  autofocus: booleanType(),
  onChange: functionType<(event: RadioChangeEvent) => void>(),
  onFocus: functionType<FocusEventHandler>(),
  onBlur: functionType<FocusEventHandler>(),
  onClick: functionType<MouseEventHandler>(),
  'onUpdate:checked': functionType<(checked: boolean) => void>(),
  'onUpdate:value': functionType<(checked: boolean) => void>(),
});

export type RadioProps = Partial<ExtractPropTypes<ReturnType<typeof radioProps>>>;

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ARadio',
  inheritAttrs: false,
  props: radioProps(),
  setup(props, { emit, expose, slots, attrs }) {
    const formItemContext = useInjectFormItemContext();
    const formItemInputContext = FormItemInputContext.useInject();
    const radioOptionTypeContext = useInjectRadioOptionTypeContext();
    const radioGroupContext = useInjectRadioGroupContext();
    const disabledContext = useInjectDisabled();
    const mergedDisabled = computed(() => disabled.value ?? disabledContext.value);

    const vcCheckbox = ref<HTMLElement>();

    const { prefixCls: radioPrefixCls, direction, disabled } = useConfigInject('radio', props);
    const prefixCls = computed(() =>
      radioGroupContext?.optionType.value === 'button' || radioOptionTypeContext === 'button'
        ? `${radioPrefixCls.value}-button`
        : radioPrefixCls.value,
    );
    const contextDisabled = useInjectDisabled();

    // Style
    const [wrapSSR, hashId] = useStyle(radioPrefixCls);

    const focus = () => {
      vcCheckbox.value.focus();
    };

    const blur = () => {
      vcCheckbox.value.blur();
    };

    expose({ focus, blur });

    const handleChange = (event: RadioChangeEvent) => {
      const targetChecked = event.target.checked;
      emit('update:checked', targetChecked);
      emit('update:value', targetChecked);
      emit('change', event);
      formItemContext.onFieldChange();
    };

    const onChange = (e: RadioChangeEvent) => {
      emit('change', e);
      if (radioGroupContext && radioGroupContext.onChange) {
        radioGroupContext.onChange(e);
      }
    };

    // ================ Agent API ================

    const getRadioStatus = () => {
      if (props.disabled || mergedDisabled.value || contextDisabled.value) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }

      return {
        data: {
          checked: props.checked,
        },
      };
    };

    const setRadioValue = (checked: boolean) => {
      if (props.disabled || mergedDisabled.value || contextDisabled.value) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }

      emit('update:checked', checked);
      emit('update:value', checked);

      // 创建一个模拟的事件对象来触发 change 事件
      const mockEvent = {
        target: {
          checked,
          value: props.value,
        },
      } as RadioChangeEvent;
      emit('change', mockEvent);
      formItemContext.onFieldChange();

      return {
        success: true,
      };
    };

    const apiAttrs = shallowRef<any>({});
    onMounted(() => {
      if (!radioGroupContext && typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('radio', {
          getRadioStatus: {
            handler: getRadioStatus,
            description: 'Get the current status of the radio component.',
            params: [],
          },
          setRadioValue: {
            handler: setRadioValue,
            description: 'Set the checked status of the radio component.',
            params: [
              {
                name: 'checked',
                type: 'boolean',
                required: true,
                description: 'The new checked status.',
              },
            ],
          },
        });
      }
    });
    onUnmounted(() => {
      if (apiAttrs.value && window.__ci4a__) {
        window.__ci4a__.unregister(apiAttrs.value['data-cid']);
      }
    });

    return () => {
      const radioGroup = radioGroupContext;
      const { prefixCls: customizePrefixCls, id = formItemContext.id.value, ...restProps } = props;

      const rProps: RadioProps = {
        prefixCls: prefixCls.value,
        id,
        ...omit(restProps, ['onUpdate:checked', 'onUpdate:value']),
        disabled: disabled.value ?? contextDisabled.value,
      };

      if (radioGroup) {
        rProps.name = radioGroup.name.value;
        rProps.onChange = onChange;
        rProps.checked = props.value === radioGroup.value.value;
        rProps.disabled = mergedDisabled.value || radioGroup.disabled.value;
      } else {
        rProps.onChange = handleChange;
      }
      const wrapperClassString = classNames(
        {
          [`${prefixCls.value}-wrapper`]: true,
          [`${prefixCls.value}-wrapper-checked`]: rProps.checked,
          [`${prefixCls.value}-wrapper-disabled`]: rProps.disabled,
          [`${prefixCls.value}-wrapper-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-wrapper-in-form-item`]: formItemInputContext.isFormItemInput,
        },
        attrs.class,
        hashId.value,
      );

      return wrapSSR(
        <label {...attrs} {...apiAttrs.value} class={wrapperClassString}>
          <VcCheckbox {...rProps} type="radio" ref={vcCheckbox} />
          {slots.default && <span>{slots.default()}</span>}
        </label>,
      );
    };
  },
});
