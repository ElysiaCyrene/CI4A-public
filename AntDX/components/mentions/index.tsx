import type { App, PropType, ExtractPropTypes } from 'vue';
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
import type { KeyboardEventHandler } from '../_util/EventInterface';
import type { InputStatus } from '../_util/statusUtils';
import { getStatusClassNames, getMergedStatus } from '../_util/statusUtils';
import useStyle from './style';
import { useProvideOverride } from '../menu/src/OverrideContext';
import warning from '../_util/warning';
import Spin from '../spin';
import devWarning from '../vc-util/devWarning';
import type { CustomSlotsType } from '../_util/type';
import '../_util/AgentApiRegistry';

interface MentionsConfig {
  prefix?: string | string[];
  split?: string;
}

export interface MentionsOptionProps {
  value: string;
  disabled?: boolean;
  label?: string | number | ((o: MentionsOptionProps) => any);
  [key: string]: any;
}

interface MentionsEntity {
  prefix: string;
  value: string;
}

export type MentionPlacement = 'top' | 'bottom';

function loadingFilterOption() {
  return true;
}
const getMentions = (value = '', config: MentionsConfig = {}): MentionsEntity[] => {
  const { prefix = '@', split = ' ' } = config;
  const prefixList: string[] = Array.isArray(prefix) ? prefix : [prefix];

  return value
    .split(split)
    .map((str = ''): MentionsEntity | null => {
      let hitPrefix: string | null = null;

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
          value: str.slice((hitPrefix as string).length),
        };
      }
      return null;
    })
    .filter((entity): entity is MentionsEntity => !!entity && !!entity.value);
};

export const mentionsProps = () => ({
  ...baseMentionsProps,
  loading: { type: Boolean, default: undefined },
  onFocus: {
    type: Function as PropType<(e: FocusEvent) => void>,
  },
  onBlur: {
    type: Function as PropType<(e: FocusEvent) => void>,
  },
  onSelect: {
    type: Function as PropType<(option: MentionsOptionProps, prefix: string) => void>,
  },
  onChange: {
    type: Function as PropType<(text: string) => void>,
  },
  onPressenter: {
    type: Function as PropType<KeyboardEventHandler>,
  },
  'onUpdate:value': {
    type: Function as PropType<(text: string) => void>,
  },
  notFoundContent: PropTypes.any,
  defaultValue: String,
  id: String,
  status: String as PropType<InputStatus>,
});

export type MentionsProps = Partial<ExtractPropTypes<ReturnType<typeof mentionsProps>>>;

const Mentions = defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AMentions',
  inheritAttrs: false,
  props: mentionsProps(),
  slots: Object as CustomSlotsType<{
    notFoundContent?: any;
    option?: any;
    default?: any;
  }>,
  setup(props, { slots, emit, attrs, expose }) {
    // =================== Warning =====================
    if (process.env.NODE_ENV !== 'production') {
      devWarning(
        !flattenChildren(slots.default?.() || []).length,
        'Mentions',
        '`Mentions.Option` is deprecated. Please use `options` instead.',
      );
    }
    const { prefixCls, renderEmpty, direction } = useConfigInject('mentions', props);
    const [wrapSSR, hashId] = useStyle(prefixCls);
    const focused = shallowRef(false);
    const vcMentions = shallowRef(null);
    const value = shallowRef(props.value ?? props.defaultValue ?? '');
    const formItemContext = useInjectFormItemContext();
    const formItemInputContext = FormItemInputContext.useInject();
    const mergedStatus = computed(() => getMergedStatus(formItemInputContext.status, props.status));
    useProvideOverride({
      prefixCls: computed(() => `${prefixCls.value}-menu`),
      mode: computed(() => 'vertical'),
      selectable: computed(() => false),
      onClick: () => {},
      validator: ({ mode }) => {
        // Warning if use other mode
        warning(
          !mode || mode === 'vertical',
          'Mentions',
          `mode="${mode}" is not supported for Mentions's Menu.`,
        );
      },
    });
    watch(
      () => props.value,
      val => {
        value.value = val;
      },
    );
    const handleFocus = (e: FocusEvent) => {
      focused.value = true;
      emit('focus', e);
    };

    const handleBlur = (e: FocusEvent) => {
      focused.value = false;
      emit('blur', e);
      formItemContext.onFieldBlur();
    };

    const handleSelect = (...args: [MentionsOptionProps, string]) => {
      emit('select', ...args);
      focused.value = true;
    };

    const handleChange = (val: string) => {
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
      return flattenChildren(slots.default?.() || []).map(item => {
        return { ...getOptionProps(item), label: (item.children as any)?.default?.() };
      });
    };

    const focus = () => {
      (vcMentions.value as HTMLTextAreaElement).focus();
    };

    const blur = () => {
      (vcMentions.value as HTMLTextAreaElement).blur();
    };

    expose({ focus, blur });
    const mentionsfilterOption = computed(() =>
      props.loading ? loadingFilterOption : props.filterOption,
    );

    // =================== Agent API ===================

    const setMentionPrefix = (prefix: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // 检查 prefix 是否在配置的 prefix 列表中
        const prefixList: string[] = Array.isArray(props.prefix) ? props.prefix : [props.prefix];
        if (!prefixList.includes(prefix)) {
          console.warn(`[Mentions] prefix "${prefix}" is not in the configured prefix list`);
          reject(new Error(`prefix "${prefix}" is not in the configured prefix list`));
          return;
        }

        // 先聚焦组件
        focus();

        // 使用 setTimeout 确保聚焦完成后再设置值
        setTimeout(() => {
          // 获取底层的 textarea 元素
          const textareaElement = (vcMentions.value as any)?.$el?.querySelector('textarea');
          if (textareaElement) {
            // 设置新的值为 prefix
            const newValue = prefix;

            // 更新 textarea 的值
            textareaElement.value = newValue;

            // 设置光标位置到最后
            textareaElement.selectionStart = newValue.length;
            textareaElement.selectionEnd = newValue.length;

            // 触发 input 事件
            const inputEvent = new Event('input', { bubbles: true, cancelable: true });
            Object.defineProperty(inputEvent, 'target', {
              writable: false,
              value: textareaElement,
            });
            textareaElement.dispatchEvent(inputEvent);

            // 触发 keyup 事件来触发 onSearch（模拟用户按下 prefix 键）
            const keyupEvent = new KeyboardEvent('keyup', {
              key: prefix,
              code: `Key${prefix.toUpperCase()}`,
              bubbles: true,
              cancelable: true,
            });
            Object.defineProperty(keyupEvent, 'target', {
              writable: false,
              value: textareaElement,
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

    const getMentionStatus = async () => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }

      const currentValue = value.value || '';
      const prefixList: string[] = Array.isArray(props.prefix) ? props.prefix : [props.prefix];
      const mentions = getMentions(currentValue, {
        prefix: prefixList,
        split: props.split,
      });

      const allOptions = {};
      for (const prefix of prefixList) {
        try {
          await setMentionPrefix(prefix);
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
          prefix: props.prefix,
        },
      };
    };

    const setMentionValue = (value: string) => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }

      // 将传入的任意字符串设置为组件值（空或 falsy 则清空）
      const newValue = value || '';
      handleChange(newValue);

      return {
        data: {
          value: newValue,
        },
      };
    };

    const apiAttrs = shallowRef<any>({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('mention', {
          getMentionStatus: {
            handler: getMentionStatus,
            description:
              'Get the current status of the mentions component, including current value, options, and mentions.',
          },
          setMentionValue: {
            handler: setMentionValue,
            description: 'Set the value of the mentions component to an arbitrary string.',
            params: [
              {
                name: 'value',
                type: 'string',
                required: true,
                description: 'The new value to set for the mentions input.',
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
      const {
        disabled,
        getPopupContainer,
        rows = 1,
        id = formItemContext.id.value,
        ...restProps
      } = props;
      const { hasFeedback, feedbackIcon } = formItemInputContext;
      const { class: className, ...otherAttrs } = attrs;
      const otherProps = omit(restProps, ['defaultValue', 'onUpdate:value', 'prefixCls']);

      const mergedClassName = classNames(
        {
          [`${prefixCls.value}-disabled`]: disabled,
          [`${prefixCls.value}-focused`]: focused.value,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        },
        getStatusClassNames(prefixCls.value, mergedStatus.value),
        !hasFeedback && className,
        hashId.value,
      );

      const mentionsProps = {
        prefixCls: prefixCls.value,
        ...otherProps,
        disabled,
        direction: direction.value,
        filterOption: mentionsfilterOption.value,
        getPopupContainer,
        options: props.loading
          ? [
              {
                value: 'ANTDV_SEARCHING',
                disabled: true,
                label: <Spin size="small" />,
              },
            ]
          : props.options || getOptions(),
        class: mergedClassName,
        ...otherAttrs,
        rows,
        onChange: handleChange,
        onSelect: handleSelect,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ref: vcMentions,
        value: value.value,
        id,
      };
      const mentions = (
        <VcMentions
          {...mentionsProps}
          {...apiAttrs.value}
          dropdownClassName={hashId.value}
          v-slots={{ notFoundContent: getNotFoundContent, option: slots.option }}
        ></VcMentions>
      );
      if (hasFeedback) {
        return wrapSSR(
          <div
            class={classNames(
              `${prefixCls.value}-affix-wrapper`,
              getStatusClassNames(
                `${prefixCls.value}-affix-wrapper`,
                mergedStatus.value,
                hasFeedback,
              ),
              className,
              hashId.value,
            )}
          >
            {mentions}
            <span class={`${prefixCls.value}-suffix`}>{feedbackIcon}</span>
          </div>,
        );
      }
      return wrapSSR(mentions);
    };
  },
});

/* istanbul ignore next */
export const MentionsOption = defineComponent({
  compatConfig: { MODE: 3 },
  ...optionOptions,
  name: 'AMentionsOption',
  props: optionProps,
});

export default Object.assign(Mentions, {
  Option: MentionsOption,
  getMentions,
  install: (app: App) => {
    app.component(Mentions.name, Mentions);
    app.component(MentionsOption.name, MentionsOption);
    return app;
  },
});
