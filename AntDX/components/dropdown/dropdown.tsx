import type { ExtractPropTypes } from 'vue';
import { computed, defineComponent, onMounted, onUnmounted, shallowRef } from 'vue';
import RcDropdown from '../vc-dropdown';
import DropdownButton from './dropdown-button';
import { cloneElement } from '../_util/vnode';
import classNames from '../_util/classNames';
import { isValidElement, initDefaultProps } from '../_util/props-util';
import { dropdownProps } from './props';
import RightOutlined from '@ant-design/icons-vue/RightOutlined';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import devWarning from '../vc-util/devWarning';
import omit from '../_util/omit';
import getPlacements from '../_util/placements';
import warning from '../_util/warning';
import useStyle from './style';
import { useProvideOverride } from '../menu/src/OverrideContext';
import type { CustomSlotsType } from '../_util/type';
import '../_util/AgentApiRegistry';

export type DropdownProps = Partial<ExtractPropTypes<ReturnType<typeof dropdownProps>>>;

const Dropdown = defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ADropdown',
  inheritAttrs: false,
  props: initDefaultProps(dropdownProps(), {
    mouseEnterDelay: 0.15,
    mouseLeaveDelay: 0.1,
    placement: 'bottomLeft',
    trigger: 'hover',
  }),
  // emits: ['visibleChange', 'update:visible'],
  slots: Object as CustomSlotsType<{
    default?: any;
    overlay?: any;
  }>,
  setup(props, { slots, attrs, emit }) {
    const { prefixCls, rootPrefixCls, direction, getPopupContainer } = useConfigInject(
      'dropdown',
      props,
    );
    const [wrapSSR, hashId] = useStyle(prefixCls);
    // Warning for deprecated usage
    if (process.env.NODE_ENV !== 'production') {
      [
        ['visible', 'open'],
        ['onVisibleChange', 'onOpenChange'],
        ['onUpdate:visible', 'onUpdate:open'],
      ].forEach(([deprecatedName, newName]) => {
        warning(
          props[deprecatedName] === undefined,
          'Dropdown',
          `\`${deprecatedName}\` is deprecated which will be removed in next major version, please use \`${newName}\` instead.`,
        );
      });
    }

    const transitionName = computed(() => {
      const { placement = '', transitionName } = props;
      if (transitionName !== undefined) {
        return transitionName;
      }
      if (placement.includes('top')) {
        return `${rootPrefixCls.value}-slide-down`;
      }
      return `${rootPrefixCls.value}-slide-up`;
    });
    useProvideOverride({
      prefixCls: computed(() => `${prefixCls.value}-menu`),
      expandIcon: computed(() => {
        return (
          <span class={`${prefixCls.value}-menu-submenu-arrow`}>
            <RightOutlined class={`${prefixCls.value}-menu-submenu-arrow-icon`} />
          </span>
        );
      }),
      mode: computed(() => 'vertical'),
      selectable: computed(() => false),
      onClick: () => {},
      validator: ({ mode }) => {
        // Warning if use other mode
        warning(
          !mode || mode === 'vertical',
          'Dropdown',
          `mode="${mode}" is not supported for Dropdown's Menu.`,
        );
      },
      apiAttrs: computed(() => apiAttrs.value),
    });
    const renderOverlay = () => {
      // rc-dropdown already can process the function of overlay, but we have check logic here.
      // So we need render the element to check and pass back to rc-dropdown.
      const overlay = props.overlay || slots.overlay?.();
      const overlayNode = Array.isArray(overlay) ? overlay[0] : overlay;

      if (!overlayNode) return null;
      const overlayProps = overlayNode.props || {};

      // Warning if use other mode
      devWarning(
        !overlayProps.mode || overlayProps.mode === 'vertical',
        'Dropdown',
        `mode="${overlayProps.mode}" is not supported for Dropdown's Menu.`,
      );

      // menu cannot be selectable in dropdown defaultly
      const { selectable = false, expandIcon = (overlayNode.children as any)?.expandIcon?.() } =
        overlayProps;

      const overlayNodeExpandIcon =
        typeof expandIcon !== 'undefined' && isValidElement(expandIcon) ? (
          expandIcon
        ) : (
          <span class={`${prefixCls.value}-menu-submenu-arrow`}>
            <RightOutlined class={`${prefixCls.value}-menu-submenu-arrow-icon`} />
          </span>
        );

      const fixedModeOverlay = isValidElement(overlayNode)
        ? cloneElement(overlayNode, {
            mode: 'vertical',
            selectable,
            expandIcon: () => overlayNodeExpandIcon,
          })
        : overlayNode;

      return fixedModeOverlay;
    };

    const placement = computed(() => {
      const placement = props.placement;
      if (!placement) {
        return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
      }

      if (placement.includes('Center')) {
        const newPlacement = placement.slice(0, placement.indexOf('Center'));
        devWarning(
          !placement.includes('Center'),
          'Dropdown',
          `You are using '${placement}' placement in Dropdown, which is deprecated. Try to use '${newPlacement}' instead.`,
        );
        return newPlacement;
      }
      return placement;
    });

    // ========== Visible ==========
    const forceVisible = shallowRef<boolean | null>(null);

    const mergedVisible = computed(() => {
      return (
        forceVisible.value ?? (typeof props.visible === 'boolean' ? props.visible : props.open)
      );
    });

    const handleVisibleChange = (val: boolean) => {
      emit('update:visible', val);
      emit('visibleChange', val);
      emit('update:open', val);
      emit('openChange', val);
    };

    // ========== Agent API ==========

    const getDropdownStatus = () => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }

      const overlay = props.overlay || slots.overlay?.();
      const overlayNode = Array.isArray(overlay) ? overlay[0] : overlay;

      if (!overlayNode) {
        return {
          items: [],
        };
      }

      // 获取菜单项
      const items: Array<{
        label: string;
        disabled: boolean;
      }> = [];

      // 递归遍历菜单项
      const traverseMenuItems = (vnode: any, parentDisabled = false) => {
        if (!vnode) return;

        const vnodes = Array.isArray(vnode) ? vnode : [vnode];

        vnodes.forEach(node => {
          if (!node || typeof node !== 'object') return;

          const { type, props: nodeProps, children } = node;
          const componentName = type?.name;

          // 检查是否是 MenuItem
          if (componentName === 'AMenuItem' || componentName === 'MenuItem') {
            const disabled = parentDisabled || nodeProps?.disabled !== undefined || false;

            // 获取标签内容
            let label = '';
            const defaultSlot = children.default();
            label = defaultSlot.map(c => (typeof c === 'string' ? c : c?.children || '')).join('');

            items.push({
              label: label.trim(),
              disabled,
            });
          }

          // 递归处理子节点（如 SubMenu）
          if (children) {
            const childDisabled = parentDisabled || nodeProps?.disabled !== undefined || false;
            if (typeof children === 'object' && children.default) {
              traverseMenuItems(children.default(), childDisabled);
            } else if (Array.isArray(children)) {
              traverseMenuItems(children, childDisabled);
            }
          }
        });
      };

      traverseMenuItems(overlayNode);

      return {
        data: {
          items,
        },
      };
    };

    const setVisible = (visible: boolean) => {
      if (visible === null) {
        forceVisible.value = null;
      } else {
        forceVisible.value = visible;
        handleVisibleChange(forceVisible.value);
      }
    };

    const navigateTo = (label: string) => {
      if (props.disabled) {
        return {
          success: false,
          error: 'Dropdown is disabled',
        };
      }

      // 先打开下拉菜单（如果还没打开）
      if (!mergedVisible.value) {
        setVisible(true);
      }

      // 等待 DOM 更新后查找并点击对应的菜单项
      setTimeout(() => {
        try {
          const dropdownMenuElement = document.querySelectorAll(
            `[data-cid^="${apiAttrs.value['data-cid']}_menu"]`,
          )[0];
          if (!dropdownMenuElement) {
            return {
              error: {
                code: 'DROPDOWN_MENU_NOT_FOUND',
                message: 'Dropdown menu element not found in the DOM',
              },
            };
          }
          const menuItems = dropdownMenuElement.querySelectorAll(`.${prefixCls.value}-menu-item`);
          let found = false;

          for (const menuItem of Array.from(menuItems)) {
            // 获取菜单项的文本内容
            const titleContent = menuItem.querySelector(`.${prefixCls.value}-menu-title-content`);
            const itemText = titleContent?.textContent?.trim() || menuItem.textContent?.trim();

            // 如果文本匹配且未禁用
            if (
              itemText === label &&
              !menuItem.classList.contains(`${prefixCls.value}-menu-item-disabled`)
            ) {
              found = true;

              const linkElement = menuItem.querySelector('a');
              if (linkElement) {
                // 如果有链接，直接触发链接的点击
                linkElement.click();
              } else {
                // 如果没有链接，触发菜单项本身的点击
                (menuItem as HTMLElement).click();
              }

              // 延迟关闭下拉菜单
              setTimeout(() => {
                setVisible(false);
                setTimeout(() => {
                  forceVisible.value = null;
                }, 0);
              }, 50);
              break;
            }
          }

          if (!found) {
            setVisible(false);
            setTimeout(() => {
              forceVisible.value = null;
            }, 0);
            return {
              error: {
                code: 'MENU_ITEM_NOT_FOUND',
                message: `Menu item with label "${label}" not found or is disabled.`,
              },
            };
          }
        } catch (e) {
          setVisible(false);
          setTimeout(() => {
            forceVisible.value = null;
          }, 0);
        }
      }, 100);
    };

    const apiAttrs = shallowRef<any>({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('dropdown', {
          getDropdownStatus: {
            handler: getDropdownStatus,
            description: 'Get the status of the dropdown menu, including the list of menu items.',
            params: [],
          },
          navigateTo: {
            handler: navigateTo,
            description: 'Click a specific item in the dropdown menu.',
            params: [
              {
                name: 'label',
                type: 'string',
                description: 'The text content of the menu item to click.',
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
      const { arrow, trigger, disabled, overlayClassName } = props;
      const child = slots.default?.()[0];
      const dropdownTrigger = cloneElement(
        child,
        Object.assign(
          {
            class: classNames(
              child?.props?.class,
              {
                [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
              },
              `${prefixCls.value}-trigger`,
            ),
          },
          disabled ? { disabled } : {},
          apiAttrs.value,
        ),
      );

      const overlayClassNameCustomized = classNames(overlayClassName, hashId.value, {
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
      });

      const triggerActions = disabled ? [] : trigger;
      let alignPoint: boolean;
      if (triggerActions && triggerActions.includes('contextmenu')) {
        alignPoint = true;
      }

      const builtinPlacements = getPlacements({
        arrowPointAtCenter: typeof arrow === 'object' && arrow.pointAtCenter,
        autoAdjustOverflow: true,
      });
      const dropdownProps = omit(
        {
          ...props,
          ...attrs,
          visible: mergedVisible.value,
          builtinPlacements,
          overlayClassName: overlayClassNameCustomized,
          arrow: !!arrow,
          alignPoint,
          prefixCls: prefixCls.value,
          getPopupContainer: getPopupContainer?.value,
          transitionName: transitionName.value,
          trigger: triggerActions,
          onVisibleChange: handleVisibleChange,
          placement: placement.value,
        },
        ['overlay', 'onUpdate:visible'],
      );
      return wrapSSR(
        <RcDropdown {...dropdownProps} v-slots={{ overlay: renderOverlay }}>
          {dropdownTrigger}
        </RcDropdown>,
      );
    };
  },
});
Dropdown.Button = DropdownButton;
export default Dropdown;
