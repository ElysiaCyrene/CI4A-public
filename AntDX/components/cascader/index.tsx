import type { ShowSearchType, FieldNames, BaseOptionType, DefaultOptionType } from '../vc-cascader';
import VcCascader, {
  cascaderProps as vcCascaderProps,
  SHOW_CHILD,
  SHOW_PARENT,
} from '../vc-cascader';
import RightOutlined from '@ant-design/icons-vue/RightOutlined';
import LoadingOutlined from '@ant-design/icons-vue/LoadingOutlined';
import LeftOutlined from '@ant-design/icons-vue/LeftOutlined';
import getIcons from '../select/utils/iconUtil';
import type { VueNode } from '../_util/type';
import { withInstall } from '../_util/type';
import omit from '../_util/omit';
import {
  computed,
  defineComponent,
  onUnmounted,
  onMounted,
  shallowRef,
  ref,
  watchEffect,
} from 'vue';
import type { ExtractPropTypes, PropType } from 'vue';
import PropTypes from '../_util/vue-types';
import { initDefaultProps } from '../_util/props-util';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import classNames from '../_util/classNames';
import type { SizeType } from '../config-provider';
import devWarning from '../vc-util/devWarning';
import type { SelectCommonPlacement } from '../_util/transition';
import { getTransitionDirection, getTransitionName } from '../_util/transition';
import { useInjectFormItemContext } from '../form';
import type { ValueType } from '../vc-cascader/Cascader';
import type { InputStatus } from '../_util/statusUtils';
import { getStatusClassNames, getMergedStatus } from '../_util/statusUtils';
import { FormItemInputContext } from '../form/FormItemContext';
import { useCompactItemContext } from '../space/Compact';
import '../_util/AgentApiRegistry';

import useSelectStyle from '../select/style';
import useStyle from './style';
import { useInjectDisabled } from '../config-provider/DisabledContext';
// Align the design since we use `rc-select` in root. This help:
// - List search content will show all content
// - Hover opacity style
// - Search filter match case

export type { BaseOptionType, DefaultOptionType, ShowSearchType };

export type FieldNamesType = FieldNames;

export type FilledFieldNamesType = Required<FieldNamesType>;

function highlightKeyword(str: string, lowerKeyword: string, prefixCls?: string) {
  const cells = str
    .toLowerCase()
    .split(lowerKeyword)
    .reduce((list, cur, index) => (index === 0 ? [cur] : [...list, lowerKeyword, cur]), []);
  const fillCells: VueNode[] = [];
  let start = 0;

  cells.forEach((cell, index) => {
    const end = start + cell.length;
    let originWorld: VueNode = str.slice(start, end);
    start = end;

    if (index % 2 === 1) {
      originWorld = (
        <span class={`${prefixCls}-menu-item-keyword`} key="seperator">
          {originWorld}
        </span>
      );
    }

    fillCells.push(originWorld);
  });

  return fillCells;
}

const defaultSearchRender: ShowSearchType['render'] = ({
  inputValue,
  path,
  prefixCls,
  fieldNames,
}) => {
  const optionList: VueNode[] = [];

  // We do lower here to save perf
  const lower = inputValue.toLowerCase();

  path.forEach((node, index) => {
    if (index !== 0) {
      optionList.push(' / ');
    }

    let label = (node as any)[fieldNames.label!];
    const type = typeof label;
    if (type === 'string' || type === 'number') {
      label = highlightKeyword(String(label), lower, prefixCls);
    }

    optionList.push(label);
  });
  return optionList;
};

export interface CascaderOptionType extends DefaultOptionType {
  isLeaf?: boolean;
  loading?: boolean;
  children?: CascaderOptionType[];
  [key: string]: any;
}
export function cascaderProps<DataNodeType extends CascaderOptionType = CascaderOptionType>() {
  return {
    ...omit(vcCascaderProps(), ['customSlots', 'checkable', 'options']),
    multiple: { type: Boolean, default: undefined },
    size: String as PropType<SizeType>,
    bordered: { type: Boolean, default: undefined },
    placement: { type: String as PropType<SelectCommonPlacement> },
    suffixIcon: PropTypes.any,
    status: String as PropType<InputStatus>,
    options: Array as PropType<DataNodeType[]>,
    popupClassName: String,
    /** @deprecated Please use `popupClassName` instead */
    dropdownClassName: String,
    'onUpdate:value': Function as PropType<(value: ValueType) => void>,
  };
}

export type CascaderProps = Partial<ExtractPropTypes<ReturnType<typeof cascaderProps>>>;

export interface CascaderRef {
  focus: () => void;
  blur: () => void;
}

const Cascader = defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ACascader',
  inheritAttrs: false,
  props: initDefaultProps(cascaderProps(), {
    bordered: true,
    choiceTransitionName: '',
    allowClear: true,
  }),
  setup(props, { attrs, expose, slots, emit }) {
    // ====================== Warning ======================
    if (process.env.NODE_ENV !== 'production') {
      devWarning(
        !props.dropdownClassName,
        'Cascader',
        '`dropdownClassName` is deprecated. Please use `popupClassName` instead.',
      );
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
      disabled,
    } = useConfigInject('cascader', props);
    const prefixCls = computed(() => getPrefixCls('select', props.prefixCls));
    const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);
    const mergedSize = computed(() => compactSize.value || contextSize.value);
    const contextDisabled = useInjectDisabled();
    const mergedDisabled = computed(() => disabled.value ?? contextDisabled.value);

    const [wrapSelectSSR, hashId] = useSelectStyle(prefixCls);
    const [wrapCascaderSSR] = useStyle(cascaderPrefixCls);

    const isRtl = computed(() => direction.value === 'rtl');
    // =================== Warning =====================
    if (process.env.NODE_ENV !== 'production') {
      watchEffect(() => {
        devWarning(
          !props.multiple || !props.displayRender || !slots.displayRender,
          'Cascader',
          '`displayRender` not work on `multiple`. Please use `tagRender` instead.',
        );
      });
    }
    // ==================== Search =====================
    const mergedShowSearch = computed(() => {
      if (!props.showSearch) {
        return props.showSearch;
      }

      let searchConfig: ShowSearchType = {
        render: defaultSearchRender,
      };

      if (typeof props.showSearch === 'object') {
        searchConfig = {
          ...searchConfig,
          ...props.showSearch,
        };
      }

      return searchConfig;
    });

    // =================== Dropdown ====================
    const mergedDropdownClassName = computed(() =>
      classNames(
        props.popupClassName || props.dropdownClassName,
        `${cascaderPrefixCls.value}-dropdown`,
        {
          [`${cascaderPrefixCls.value}-dropdown-rtl`]: isRtl.value,
        },
        hashId.value,
      ),
    );

    const selectRef = ref<CascaderRef>();
    expose({
      focus() {
        selectRef.value?.focus();
      },
      blur() {
        selectRef.value?.blur();
      },
    } as CascaderRef);

    const handleChange: CascaderProps['onChange'] = (...args) => {
      emit('update:value', args[0]);
      emit('change', ...args);
      formItemContext.onFieldChange();
    };
    const handleBlur: CascaderProps['onBlur'] = (...args) => {
      emit('blur', ...args);
      formItemContext.onFieldBlur();
    };
    const mergedShowArrow = computed(() =>
      props.showArrow !== undefined ? props.showArrow : props.loading || !props.multiple,
    );
    const placement = computed(() => {
      if (props.placement !== undefined) {
        return props.placement;
      }
      return direction.value === 'rtl'
        ? ('bottomRight' as SelectCommonPlacement)
        : ('bottomLeft' as SelectCommonPlacement);
    });

    // ========== Agent API ===========

    const getCascaderStatus = () => {
      if (props.disabled || mergedDisabled.value) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }

      // Get all selectable options from the cascader
      const options = props.options || [];
      const fieldNames = props.fieldNames || {};
      const valueField = fieldNames.value || 'value';
      const labelField = fieldNames.label || 'label';
      const childrenField = fieldNames.children || 'children';
      const showCheckedStrategy = props.showCheckedStrategy ?? SHOW_PARENT;
      const changeOnSelect = props.changeOnSelect ?? false;

      // Recursively collect all options
      const collectOptions = (
        items: CascaderOptionType[],
        path: any[] = [],
        parentDisabled = false,
      ): any[] => {
        const result: any[] = [];
        items.forEach(item => {
          const currentPath = [...path, item[valueField]];
          const isDisabled = parentDisabled || item.disabled || false;
          const hasChildren = item[childrenField]?.length > 0;
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
            isSelectable: isSelectable && !isDisabled,
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
          changeOnSelect: changeOnSelect, // Whether parent nodes can be selected
          showCheckedStrategy: showCheckedStrategy, // Controls how selected results are displayed
        },
      };
    };

    const setCascaderValues = (values: any) => {
      // Get cascader status to obtain options information
      const statusResult = getCascaderStatus();
      if (statusResult.error) {
        return {
          error: statusResult.error,
        };
      }

      const { options: allOptions, ismultiple, showCheckedStrategy } = statusResult.data;

      // Create a map from value to option info for quick lookup
      const valueToOptionMap = new Map();
      allOptions.forEach((opt: any) => {
        valueToOptionMap.set(opt.value, opt);
      });

      // Find option by single value and return its path
      const findPathByValue = (
        value: any,
      ): { path: any[]; valid: boolean; isSelectable: boolean } => {
        const option = valueToOptionMap.get(value);
        if (!option) {
          return { path: [], valid: false, isSelectable: false };
        }
        return { path: option.path, valid: true, isSelectable: option.isSelectable };
      };

      // Get all descendant leaf paths by value
      const getAllLeafPathsByValue = (value: any): any[][] => {
        const leafPaths: any[][] = [];
        const option = valueToOptionMap.get(value);
        if (!option) return [];

        // Find all descendants of this option
        allOptions.forEach((opt: any) => {
          // Check if opt is a descendant of the given value
          const optPath = opt.path;
          const valuePath = option.path;
          if (optPath.length > valuePath.length) {
            const isDescendant = valuePath.every((v: any, i: number) => optPath[i] === v);
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
      const normalizeValues = (
        inputValues: any,
      ): { paths: any; error?: { code: string; message: string } } => {
        if (!ismultiple) {
          // Single mode: convert value to path
          const result = findPathByValue(inputValues);
          if (!result.valid) {
            return {
              paths: null,
              error: {
                code: 'INVALID_VALUE',
                message: `Invalid value: ${inputValues}`,
              },
            };
          }
          if (!result.isSelectable) {
            return {
              paths: null,
              error: {
                code: 'VALUE_NOT_SELECTABLE',
                message: `Value is not selectable: ${inputValues}`,
              },
            };
          }
          return { paths: result.path };
        }

        // Multiple mode: convert array of values to array of paths
        const validPaths: any[][] = [];
        const inputArray = Array.isArray(inputValues) ? inputValues : [inputValues];
        const invalidValues: any[] = [];
        const unselectableValues: any[] = [];

        inputArray.forEach((value: any) => {
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
              message: `Invalid values: ${invalidValues.join(', ')}`,
            },
          };
        }
        if (unselectableValues.length > 0) {
          return {
            paths: null,
            error: {
              code: 'VALUE_NOT_SELECTABLE',
              message: `Values are not selectable: ${unselectableValues.join(', ')}`,
            },
          };
        }

        return { paths: validPaths };
      };

      const normalizeResult = normalizeValues(values);

      // If validation failed, return error
      if (normalizeResult.error) {
        return {
          error: normalizeResult.error,
        };
      }

      const normalizedValues = normalizeResult.paths;

      // If validation failed, don't update
      if (
        normalizedValues === null ||
        (Array.isArray(normalizedValues) && normalizedValues.length === 0 && values.length > 0)
      ) {
        return {
          error: {
            code: 'INVALID_VALUE',
            message: `Invalid value: ${values}`,
          },
        };
      }

      // Get the actual option objects for the change event
      const fieldNames = props.fieldNames || {};
      const valueField = fieldNames.value || 'value';
      const childrenField = fieldNames.children || 'children';
      const options = props.options || [];

      const findOptionsByPath = (path: any[]): CascaderOptionType[] => {
        const result: CascaderOptionType[] = [];
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
        const selectedOptions = normalizedValues.map((path: any[]) => findOptionsByPath(path));
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

    const apiAttrs = shallowRef<any>({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('cascader', {
          getCascaderStatus: {
            handler: getCascaderStatus,
            description: 'Get the status of the cascader, including the list of options.',
            params: [],
          },
          setCascaderValues: {
            handler: setCascaderValues,
            description: 'Set the value of the cascader.',
            params: [
              {
                name: 'values',
                type: props.multiple ? 'string | number' : 'list[string | number]',
                description:
                  'The value to set. Can be a single value or an array (for multiple mode).',
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
        notFoundContent = slots.notFoundContent?.(),
        expandIcon = slots.expandIcon?.(),
        multiple,
        bordered,
        allowClear,
        choiceTransitionName,
        transitionName,
        id = formItemContext.id.value,
        ...restProps
      } = props;
      // =================== No Found ====================
      const mergedNotFoundContent = notFoundContent || renderEmpty('Cascader');

      // ===================== Icon ======================
      let mergedExpandIcon = expandIcon;
      if (!expandIcon) {
        mergedExpandIcon = isRtl.value ? <LeftOutlined /> : <RightOutlined />;
      }

      const loadingIcon = (
        <span class={`${prefixCls.value}-menu-item-loading-icon`}>
          <LoadingOutlined spin />
        </span>
      );

      // ===================== Icons =====================
      const { suffixIcon, removeIcon, clearIcon } = getIcons(
        {
          ...props,
          hasFeedback: formItemInputContext.hasFeedback,
          feedbackIcon: formItemInputContext.feedbackIcon,
          multiple,
          prefixCls: prefixCls.value,
          showArrow: mergedShowArrow.value,
        },
        slots,
      );
      return wrapCascaderSSR(
        wrapSelectSSR(
          <VcCascader
            {...restProps}
            {...attrs}
            {...apiAttrs.value}
            id={id}
            prefixCls={prefixCls.value}
            class={[
              cascaderPrefixCls.value,
              {
                [`${prefixCls.value}-lg`]: mergedSize.value === 'large',
                [`${prefixCls.value}-sm`]: mergedSize.value === 'small',
                [`${prefixCls.value}-rtl`]: isRtl.value,
                [`${prefixCls.value}-borderless`]: !bordered,
                [`${prefixCls.value}-in-form-item`]: formItemInputContext.isFormItemInput,
              },
              getStatusClassNames(
                prefixCls.value,
                mergedStatus.value,
                formItemInputContext.hasFeedback,
              ),
              compactItemClassnames.value,
              attrs.class,
              hashId.value,
            ]}
            disabled={mergedDisabled.value}
            direction={direction.value}
            placement={placement.value}
            notFoundContent={mergedNotFoundContent}
            allowClear={allowClear}
            showSearch={mergedShowSearch.value}
            expandIcon={mergedExpandIcon}
            inputIcon={suffixIcon}
            removeIcon={removeIcon}
            clearIcon={clearIcon}
            loadingIcon={loadingIcon}
            checkable={!!multiple}
            dropdownClassName={mergedDropdownClassName.value}
            dropdownPrefixCls={cascaderPrefixCls.value}
            choiceTransitionName={getTransitionName(rootPrefixCls.value, '', choiceTransitionName)}
            transitionName={getTransitionName(
              rootPrefixCls.value,
              getTransitionDirection(placement.value),
              transitionName,
            )}
            getPopupContainer={getPopupContainer?.value}
            customSlots={{
              ...slots,
              checkable: () => <span class={`${cascaderPrefixCls.value}-checkbox-inner`} />,
            }}
            tagRender={props.tagRender || slots.tagRender}
            displayRender={props.displayRender || slots.displayRender}
            maxTagPlaceholder={props.maxTagPlaceholder || slots.maxTagPlaceholder}
            showArrow={formItemInputContext.hasFeedback || props.showArrow}
            onChange={handleChange}
            onBlur={handleBlur}
            v-slots={slots}
            ref={selectRef}
          />,
        ),
      );
    };
  },
});
export default withInstall<
  typeof Cascader & {
    SHOW_PARENT: typeof SHOW_PARENT;
    SHOW_CHILD: typeof SHOW_CHILD;
  }
>(
  Object.assign(Cascader, {
    SHOW_CHILD,
    SHOW_PARENT,
  } as any),
);
