"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _vue = require("vue");
var _vcDropdown = _interopRequireDefault(require("../vc-dropdown"));
var _dropdownButton = _interopRequireDefault(require("./dropdown-button"));
var _vnode = require("../_util/vnode");
var _classNames = _interopRequireDefault(require("../_util/classNames"));
var _propsUtil = require("../_util/props-util");
var _props = require("./props");
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons-vue/lib/icons/RightOutlined"));
var _useConfigInject = _interopRequireDefault(require("../config-provider/hooks/useConfigInject"));
var _devWarning = _interopRequireDefault(require("../vc-util/devWarning"));
var _omit = _interopRequireDefault(require("../_util/omit"));
var _placements = _interopRequireDefault(require("../_util/placements"));
var _warning = _interopRequireDefault(require("../_util/warning"));
var _style = _interopRequireDefault(require("./style"));
var _OverrideContext = require("../menu/src/OverrideContext");
require("../_util/AgentApiRegistry");
const Dropdown = (0, _vue.defineComponent)({
  compatConfig: {
    MODE: 3
  },
  name: 'ADropdown',
  inheritAttrs: false,
  props: (0, _propsUtil.initDefaultProps)((0, _props.dropdownProps)(), {
    mouseEnterDelay: 0.15,
    mouseLeaveDelay: 0.1,
    placement: 'bottomLeft',
    trigger: 'hover'
  }),
  // emits: ['visibleChange', 'update:visible'],
  slots: Object,
  setup(props, {
    slots,
    attrs,
    emit
  }) {
    const {
      prefixCls,
      rootPrefixCls,
      direction,
      getPopupContainer
    } = (0, _useConfigInject.default)('dropdown', props);
    const [wrapSSR, hashId] = (0, _style.default)(prefixCls);
    // Warning for deprecated usage
    if (process.env.NODE_ENV !== 'production') {
      [['visible', 'open'], ['onVisibleChange', 'onOpenChange'], ['onUpdate:visible', 'onUpdate:open']].forEach(([deprecatedName, newName]) => {
        (0, _warning.default)(props[deprecatedName] === undefined, 'Dropdown', `\`${deprecatedName}\` is deprecated which will be removed in next major version, please use \`${newName}\` instead.`);
      });
    }
    const transitionName = (0, _vue.computed)(() => {
      const {
        placement = '',
        transitionName
      } = props;
      if (transitionName !== undefined) {
        return transitionName;
      }
      if (placement.includes('top')) {
        return `${rootPrefixCls.value}-slide-down`;
      }
      return `${rootPrefixCls.value}-slide-up`;
    });
    (0, _OverrideContext.useProvideOverride)({
      prefixCls: (0, _vue.computed)(() => `${prefixCls.value}-menu`),
      expandIcon: (0, _vue.computed)(() => {
        return (0, _vue.createVNode)("span", {
          "class": `${prefixCls.value}-menu-submenu-arrow`
        }, [(0, _vue.createVNode)(_RightOutlined.default, {
          "class": `${prefixCls.value}-menu-submenu-arrow-icon`
        }, null)]);
      }),
      mode: (0, _vue.computed)(() => 'vertical'),
      selectable: (0, _vue.computed)(() => false),
      onClick: () => {},
      validator: ({
        mode
      }) => {
        // Warning if use other mode
        (0, _warning.default)(!mode || mode === 'vertical', 'Dropdown', `mode="${mode}" is not supported for Dropdown's Menu.`);
      },
      apiAttrs: (0, _vue.computed)(() => apiAttrs.value)
    });
    const renderOverlay = () => {
      var _a, _b, _c;
      // rc-dropdown already can process the function of overlay, but we have check logic here.
      // So we need render the element to check and pass back to rc-dropdown.
      const overlay = props.overlay || ((_a = slots.overlay) === null || _a === void 0 ? void 0 : _a.call(slots));
      const overlayNode = Array.isArray(overlay) ? overlay[0] : overlay;
      if (!overlayNode) return null;
      const overlayProps = overlayNode.props || {};
      // Warning if use other mode
      (0, _devWarning.default)(!overlayProps.mode || overlayProps.mode === 'vertical', 'Dropdown', `mode="${overlayProps.mode}" is not supported for Dropdown's Menu.`);
      // menu cannot be selectable in dropdown defaultly
      const {
        selectable = false,
        expandIcon = (_c = (_b = overlayNode.children) === null || _b === void 0 ? void 0 : _b.expandIcon) === null || _c === void 0 ? void 0 : _c.call(_b)
      } = overlayProps;
      const overlayNodeExpandIcon = typeof expandIcon !== 'undefined' && (0, _propsUtil.isValidElement)(expandIcon) ? expandIcon : (0, _vue.createVNode)("span", {
        "class": `${prefixCls.value}-menu-submenu-arrow`
      }, [(0, _vue.createVNode)(_RightOutlined.default, {
        "class": `${prefixCls.value}-menu-submenu-arrow-icon`
      }, null)]);
      const fixedModeOverlay = (0, _propsUtil.isValidElement)(overlayNode) ? (0, _vnode.cloneElement)(overlayNode, {
        mode: 'vertical',
        selectable,
        expandIcon: () => overlayNodeExpandIcon
      }) : overlayNode;
      return fixedModeOverlay;
    };
    const placement = (0, _vue.computed)(() => {
      const placement = props.placement;
      if (!placement) {
        return direction.value === 'rtl' ? 'bottomRight' : 'bottomLeft';
      }
      if (placement.includes('Center')) {
        const newPlacement = placement.slice(0, placement.indexOf('Center'));
        (0, _devWarning.default)(!placement.includes('Center'), 'Dropdown', `You are using '${placement}' placement in Dropdown, which is deprecated. Try to use '${newPlacement}' instead.`);
        return newPlacement;
      }
      return placement;
    });
    // ========== Visible ==========
    const forceVisible = (0, _vue.shallowRef)(null);
    const mergedVisible = (0, _vue.computed)(() => {
      var _a;
      return (_a = forceVisible.value) !== null && _a !== void 0 ? _a : typeof props.visible === 'boolean' ? props.visible : props.open;
    });
    const handleVisibleChange = val => {
      emit('update:visible', val);
      emit('visibleChange', val);
      emit('update:open', val);
      emit('openChange', val);
    };
    // ========== Agent API ==========
    const getDropdownStatus = () => {
      var _a;
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      const overlay = props.overlay || ((_a = slots.overlay) === null || _a === void 0 ? void 0 : _a.call(slots));
      const overlayNode = Array.isArray(overlay) ? overlay[0] : overlay;
      if (!overlayNode) {
        return {
          items: []
        };
      }
      // 获取菜单项
      const items = [];
      // 递归遍历菜单项
      const traverseMenuItems = (vnode, parentDisabled = false) => {
        if (!vnode) return;
        const vnodes = Array.isArray(vnode) ? vnode : [vnode];
        vnodes.forEach(node => {
          if (!node || typeof node !== 'object') return;
          const {
            type,
            props: nodeProps,
            children
          } = node;
          const componentName = type === null || type === void 0 ? void 0 : type.name;
          // 检查是否是 MenuItem
          if (componentName === 'AMenuItem' || componentName === 'MenuItem') {
            const disabled = parentDisabled || (nodeProps === null || nodeProps === void 0 ? void 0 : nodeProps.disabled) !== undefined || false;
            // 获取标签内容
            let label = '';
            const defaultSlot = children.default();
            label = defaultSlot.map(c => typeof c === 'string' ? c : (c === null || c === void 0 ? void 0 : c.children) || '').join('');
            items.push({
              label: label.trim(),
              disabled
            });
          }
          // 递归处理子节点（如 SubMenu）
          if (children) {
            const childDisabled = parentDisabled || (nodeProps === null || nodeProps === void 0 ? void 0 : nodeProps.disabled) !== undefined || false;
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
          items
        }
      };
    };
    const setVisible = visible => {
      if (visible === null) {
        forceVisible.value = null;
      } else {
        forceVisible.value = visible;
        handleVisibleChange(forceVisible.value);
      }
    };
    const navigateTo = label => {
      if (props.disabled) {
        return {
          success: false,
          error: 'Dropdown is disabled'
        };
      }
      // 先打开下拉菜单（如果还没打开）
      if (!mergedVisible.value) {
        setVisible(true);
      }
      // 等待 DOM 更新后查找并点击对应的菜单项
      setTimeout(() => {
        var _a, _b;
        try {
          const dropdownMenuElement = document.querySelectorAll(`[data-cid^="${apiAttrs.value['data-cid']}_menu"]`)[0];
          if (!dropdownMenuElement) {
            return {
              error: {
                code: 'DROPDOWN_MENU_NOT_FOUND',
                message: 'Dropdown menu element not found in the DOM'
              }
            };
          }
          const menuItems = dropdownMenuElement.querySelectorAll(`.${prefixCls.value}-menu-item`);
          let found = false;
          for (const menuItem of Array.from(menuItems)) {
            // 获取菜单项的文本内容
            const titleContent = menuItem.querySelector(`.${prefixCls.value}-menu-title-content`);
            const itemText = ((_a = titleContent === null || titleContent === void 0 ? void 0 : titleContent.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ((_b = menuItem.textContent) === null || _b === void 0 ? void 0 : _b.trim());
            // 如果文本匹配且未禁用
            if (itemText === label && !menuItem.classList.contains(`${prefixCls.value}-menu-item-disabled`)) {
              found = true;
              const linkElement = menuItem.querySelector('a');
              if (linkElement) {
                // 如果有链接，直接触发链接的点击
                linkElement.click();
              } else {
                // 如果没有链接，触发菜单项本身的点击
                menuItem.click();
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
                message: `Menu item with label "${label}" not found or is disabled.`
              }
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
    const apiAttrs = (0, _vue.shallowRef)({});
    (0, _vue.onMounted)(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('dropdown', {
          getDropdownStatus: {
            handler: getDropdownStatus,
            description: 'Get the status of the dropdown menu, including the list of menu items.',
            params: []
          },
          navigateTo: {
            handler: navigateTo,
            description: 'Click a specific item in the dropdown menu.',
            params: [{
              name: 'label',
              type: 'string',
              description: 'The text content of the menu item to click.'
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
      var _a, _b;
      const {
        arrow,
        trigger,
        disabled,
        overlayClassName
      } = props;
      const child = (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots)[0];
      const dropdownTrigger = (0, _vnode.cloneElement)(child, (0, _extends2.default)({
        class: (0, _classNames.default)((_b = child === null || child === void 0 ? void 0 : child.props) === null || _b === void 0 ? void 0 : _b.class, {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl'
        }, `${prefixCls.value}-trigger`)
      }, disabled ? {
        disabled
      } : {}, apiAttrs.value));
      const overlayClassNameCustomized = (0, _classNames.default)(overlayClassName, hashId.value, {
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl'
      });
      const triggerActions = disabled ? [] : trigger;
      let alignPoint;
      if (triggerActions && triggerActions.includes('contextmenu')) {
        alignPoint = true;
      }
      const builtinPlacements = (0, _placements.default)({
        arrowPointAtCenter: typeof arrow === 'object' && arrow.pointAtCenter,
        autoAdjustOverflow: true
      });
      const dropdownProps = (0, _omit.default)((0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, props), attrs), {
        visible: mergedVisible.value,
        builtinPlacements,
        overlayClassName: overlayClassNameCustomized,
        arrow: !!arrow,
        alignPoint,
        prefixCls: prefixCls.value,
        getPopupContainer: getPopupContainer === null || getPopupContainer === void 0 ? void 0 : getPopupContainer.value,
        transitionName: transitionName.value,
        trigger: triggerActions,
        onVisibleChange: handleVisibleChange,
        placement: placement.value
      }), ['overlay', 'onUpdate:visible']);
      return wrapSSR((0, _vue.createVNode)(_vcDropdown.default, dropdownProps, {
        default: () => [dropdownTrigger],
        overlay: renderOverlay
      }));
    };
  }
});
Dropdown.Button = _dropdownButton.default;
var _default = exports.default = Dropdown;