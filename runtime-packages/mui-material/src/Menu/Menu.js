import '../AgentApiRegistry/AgentApiRegistry.js';
'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import HTMLElementType from '@mui/utils/HTMLElementType';
import { useRtl } from '@mui/system/RtlProvider';
import useSlotProps from '@mui/utils/useSlotProps';
import MenuList from '../MenuList';
import Popover, { PopoverPaper } from '../Popover';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';
import { styled } from '../zero-styled';
import { useDefaultProps } from '../DefaultPropsProvider';
import { getMenuUtilityClass } from './menuClasses';
import useSlot from '../utils/useSlot';
import { jsx as _jsx } from "react/jsx-runtime";
const RTL_ORIGIN = {
  vertical: 'top',
  horizontal: 'right'
};
const LTR_ORIGIN = {
  vertical: 'top',
  horizontal: 'left'
};
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['root'],
    paper: ['paper'],
    list: ['list']
  };
  return composeClasses(slots, getMenuUtilityClass, classes);
};
const MenuRoot = styled(Popover, {
  shouldForwardProp: prop => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiMenu',
  slot: 'Root'
})({});
export const MenuPaper = styled(PopoverPaper, {
  name: 'MuiMenu',
  slot: 'Paper'
})({
  // specZ: The maximum height of a simple menu should be one or more rows less than the view
  // height. This ensures a tappable area outside of the simple menu with which to dismiss
  // the menu.
  maxHeight: 'calc(100% - 96px)',
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: 'touch'
});
const MenuMenuList = styled(MenuList, {
  name: 'MuiMenu',
  slot: 'List'
})({
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0
});
const Menu = /*#__PURE__*/React.forwardRef(function Menu(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiMenu'
  });
  const {
    autoFocus = true,
    children,
    className,
    disableAutoFocusItem = false,
    onClose,
    open,
    PopoverClasses,
    transitionDuration = 'auto',
    variant = 'selectedMenu',
    slots = {},
    slotProps = {},
    ...other
  } = props;
  const isRtl = useRtl();
  const ownerState = {
    ...props,
    autoFocus,
    disableAutoFocusItem,
    transitionDuration,
    variant
  };
  const classes = useUtilityClasses(ownerState);

  // ===================== Agent API =====================
  const domRef = React.useRef(null);
  const [apiAttrs, setApiAttrs] = React.useState({});
  // Always keep latest props for handlers
  const propsRef = React.useRef({
    children,
    anchorEl: other.anchorEl,
    onClose,
    open
  });
  // Remember the trigger even after it becomes null (menu closed)
  const triggerRef = React.useRef(null);
  propsRef.current = {
    children,
    anchorEl: other.anchorEl,
    onClose,
    open
  };
  if (other.anchorEl) triggerRef.current = other.anchorEl;

  // Only register CI4A if this is a standalone Menu (not used internally by e.g. Select)
  const isInternal = !!other['data-ci4a-skip'];
  React.useEffect(() => {
    if (isInternal) return;
    if (typeof window !== 'undefined' && window.__ci4a__) {
      const attrs = window.__ci4a__.register('menu', {
        getMenuStatus: {
          handler: () => {
            const {
              children: childNodes,
              open: isOpen
            } = propsRef.current;
            const items = [];
            React.Children.forEach(childNodes, (child, idx) => {
              if (/*#__PURE__*/React.isValidElement(child)) {
                const text = typeof child.props.children === 'string' ? child.props.children : String(child.props.value || `Item ${idx}`);
                items.push({
                  index: idx,
                  text,
                  key: String(idx),
                  disabled: child.props.disabled || false
                });
              }
            });
            return {
              data: {
                items,
                open: !!isOpen
              }
            };
          },
          description: 'Get menu items. Use item.key (index) or item.text in navigateTo.',
          params: []
        },
        navigateTo: {
          handler: async key => {
            const {
              children: childNodes
            } = propsRef.current;
            const k = String(key);
            const idx = parseInt(k, 10);

            // Try DOM click first if items are rendered
            if (domRef.current && document.body.contains(domRef.current)) {
              const listItems = domRef.current.querySelectorAll('[role="menuitem"]');
              if (listItems.length > 0) {
                let target = null;
                if (!isNaN(idx) && idx >= 0 && idx < listItems.length) {
                  target = listItems[idx];
                } else {
                  const kLower = k.toLowerCase().trim();
                  listItems.forEach(item => {
                    if (target) return;
                    if ((item.textContent || '').trim().toLowerCase() === kLower) target = item;
                  });
                }
                if (target && !(target.getAttribute('aria-disabled') === 'true' || target.classList.contains('Mui-disabled'))) {
                  target.click();
                  return {
                    data: {
                      key: k
                    }
                  };
                }
              }
            }

            // Fallback: use onCi4aNavigate callback (no DOM needed)
            const onNavigate = other['onCi4aNavigate'];
            if (typeof onNavigate === 'function') {
              let text;
              if (!isNaN(idx) && idx >= 0) {
                React.Children.forEach(childNodes, (child, i) => {
                  if (i === idx && /*#__PURE__*/React.isValidElement(child)) {
                    text = typeof child.props.children === 'string' ? child.props.children : String(child.props.value || `Item ${idx}`);
                  }
                });
              }
              onNavigate(idx, text || k);
              return {
                data: {
                  key: k,
                  text: text || k
                }
              };
            }
            return {
              error: {
                code: 'NOT_NAVIGABLE',
                message: 'Menu is closed and no onCi4aNavigate callback provided.'
              }
            };
          },
          description: 'Navigate to a menu item by index. Requires onCi4aNavigate prop for DOM-free navigation.',
          params: [{
            name: 'key',
            type: 'string',
            required: true,
            description: 'Item index from getMenuStatus (e.g. "0").'
          }]
        }
      });
      setApiAttrs(attrs);
      return () => {
        window.__ci4a__?.unregister(attrs['data-cid']);
      };
    }
    return undefined;
  }, [isInternal]);
  const mergedRef = React.useCallback(node => {
    domRef.current = node;
    if (typeof ref === 'function') ref(node);else if (ref) ref.current = node;
  }, [ref]);
  const shouldManageInitialFocus = autoFocus && open; // `&& open` prevents a Menu with `keepMounted={true}` from accidentally stealing focus
  const shouldAutoFocusActiveItem = shouldManageInitialFocus && !disableAutoFocusItem;
  const menuListActionsRef = React.useRef(null);
  const handleEntering = (element, _isAppearing) => {
    if (menuListActionsRef.current) {
      menuListActionsRef.current.adjustStyleForScrollbar(element, {
        direction: isRtl ? 'rtl' : 'ltr'
      });
      if (shouldManageInitialFocus) {
        menuListActionsRef.current.focusInitialTarget?.();
      }
    }
  };
  const handleListKeyDown = event => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (onClose) {
        onClose(event, 'tabKeyDown');
      }
    }
  };
  const externalForwardedProps = {
    slots,
    slotProps
  };
  const rootSlotProps = useSlotProps({
    elementType: slots.root,
    externalSlotProps: slotProps.root,
    ownerState,
    className: [classes.root, className]
  });
  const [PaperSlot, paperSlotProps] = useSlot('paper', {
    className: classes.paper,
    elementType: MenuPaper,
    externalForwardedProps,
    shouldForwardComponentProp: true,
    ownerState
  });
  const [ListSlot, listSlotProps] = useSlot('list', {
    className: classes.list,
    elementType: MenuMenuList,
    shouldForwardComponentProp: true,
    externalForwardedProps,
    getSlotProps: handlers => ({
      ...handlers,
      onKeyDown: event => {
        handleListKeyDown(event);
        handlers.onKeyDown?.(event);
      }
    }),
    ownerState
  });
  const resolvedTransitionProps = typeof slotProps.transition === 'function' ? slotProps.transition(ownerState) : slotProps.transition;
  return (
    /*#__PURE__*/
    // CI4A: Wrapper div carries data-cid so agents can discover the Menu
    // in the DOM even when the Popover is closed. The MenuRoot (Popover)
    // portals its content to document.body, but this wrapper stays at the
    // source position and is always queryable.
    _jsx("div", {
      ...apiAttrs,
      style: {
        display: 'inline-block',
        minWidth: 1,
        minHeight: 1
      },
      children: /*#__PURE__*/_jsx(MenuRoot
      // `disableAutoFocus={autoFocus}` is NOT a mistake
      //   - `autoFocus` means `Menu` will control focus and move it into `MenuList` or an active `MenuItem`
      //   - `disableAutoFocus` means disable `MenuRoot`s underlying `Popover`'s autoFocus handling
      // This prevents `MenuList` and `Popover` from fighting each other to control focus.
      // (This has nothing to do with DOM `autoFocus`)
      , {
        disableAutoFocus: autoFocus,
        onClose: onClose,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: isRtl ? 'right' : 'left'
        },
        transformOrigin: isRtl ? RTL_ORIGIN : LTR_ORIGIN,
        slots: {
          root: slots.root,
          paper: PaperSlot,
          backdrop: slots.backdrop,
          transition: slots.transition
        },
        slotProps: {
          root: rootSlotProps,
          paper: paperSlotProps,
          backdrop: typeof slotProps.backdrop === 'function' ? slotProps.backdrop(ownerState) : slotProps.backdrop,
          transition: {
            ...resolvedTransitionProps,
            onEntering: (...args) => {
              handleEntering(...args);
              resolvedTransitionProps?.onEntering?.(...args);
            }
          }
        },
        open: open,
        ref: mergedRef,
        transitionDuration: transitionDuration,
        ownerState: ownerState,
        ...other,
        classes: PopoverClasses,
        children: /*#__PURE__*/_jsx(ListSlot, {
          actions: menuListActionsRef,
          autoFocus: shouldManageInitialFocus,
          autoFocusItem: shouldAutoFocusActiveItem,
          variant: variant,
          ...listSlotProps,
          children: children
        })
      })
    })
  );
});
Menu.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * An HTML element, or a function that returns one.
   * It's used to set the position of the menu.
   */
  anchorEl: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([HTMLElementType, PropTypes.func]),
  /**
   * If `true` (Default) will focus the `[role="menu"]` if no focusable child is found. Disabled
   * children are not focusable. If you set this prop to `false` focus will be placed
   * on the parent modal container. This has severe accessibility implications
   * and should only be considered if you manage focus otherwise.
   * @default true
   */
  autoFocus: PropTypes.bool,
  /**
   * Menu contents, normally `MenuItem`s.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * When opening the menu will not focus the active item but the `[role="menu"]`
   * unless `autoFocus` is also set to `false`. Not using the default means not
   * following WAI-ARIA authoring practices. Please be considerate about possible
   * accessibility implications.
   * @default false
   */
  disableAutoFocusItem: PropTypes.bool,
  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`, `"tabKeyDown"`.
   */
  onClose: PropTypes.func,
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool.isRequired,
  /**
   * `classes` prop applied to the [`Popover`](https://mui.com/material-ui/api/popover/) element.
   */
  PopoverClasses: PropTypes.object,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    backdrop: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    list: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    paper: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    transition: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    backdrop: PropTypes.elementType,
    list: PropTypes.elementType,
    paper: PropTypes.elementType,
    root: PropTypes.elementType,
    transition: PropTypes.elementType
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object]),
  /**
   * The length of the transition in `ms`, or 'auto'
   * @default 'auto'
   */
  transitionDuration: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.number, PropTypes.shape({
    appear: PropTypes.number,
    enter: PropTypes.number,
    exit: PropTypes.number
  })]),
  /**
   * The variant to use. Use `menu` to prevent selected items from impacting the initial focus.
   * @default 'selectedMenu'
   */
  variant: PropTypes.oneOf(['menu', 'selectedMenu'])
};
export default Menu;
