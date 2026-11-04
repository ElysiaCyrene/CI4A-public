import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { cloneVNode, defineComponent, onMounted, onUnmounted, shallowRef, ref, createVNode as _createVNode } from 'vue';
import PropTypes from '../_util/vue-types';
import { flattenChildren, getPropsSlot } from '../_util/props-util';
import warning from '../_util/warning';
import BreadcrumbItem from './BreadcrumbItem';
import Menu from '../menu';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import useStyle from './style';
import '../_util/AgentApiRegistry';
export const breadcrumbProps = () => ({
  prefixCls: String,
  routes: {
    type: Array
  },
  params: PropTypes.any,
  separator: PropTypes.any,
  itemRender: {
    type: Function
  }
});
function getBreadcrumbName(route, params) {
  if (!route.breadcrumbName) {
    return null;
  }
  const paramsKeys = Object.keys(params).join('|');
  const name = route.breadcrumbName.replace(new RegExp(`:(${paramsKeys})`, 'g'), (replacement, key) => params[key] || replacement);
  return name;
}
function defaultItemRender(opt) {
  const {
    route,
    params,
    routes,
    paths
  } = opt;
  const isLastItem = routes.indexOf(route) === routes.length - 1;
  const name = getBreadcrumbName(route, params);
  return isLastItem ? _createVNode("span", null, [name]) : _createVNode("a", {
    "href": `#/${paths.join('/')}`
  }, [name]);
}
export default defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'ABreadcrumb',
  inheritAttrs: false,
  props: breadcrumbProps(),
  slots: Object,
  setup(props, {
    slots,
    attrs
  }) {
    const {
      prefixCls,
      direction
    } = useConfigInject('breadcrumb', props);
    const [wrapSSR, hashId] = useStyle(prefixCls);
    const navRef = ref();
    const getPath = (path, params) => {
      path = (path || '').replace(/^\//, '');
      Object.keys(params).forEach(key => {
        path = path.replace(`:${key}`, params[key]);
      });
      return path;
    };
    const addChildPath = (paths, childPath, params) => {
      const originalPaths = [...paths];
      const path = getPath(childPath || '', params);
      if (path) {
        originalPaths.push(path);
      }
      return originalPaths;
    };
    const genForRoutes = ({
      routes = [],
      params = {},
      separator,
      itemRender = defaultItemRender
    }) => {
      const paths = [];
      return routes.map(route => {
        const path = getPath(route.path, params);
        if (path) {
          paths.push(path);
        }
        const tempPaths = [...paths];
        // generated overlay by route.children
        let overlay = null;
        if (route.children && route.children.length) {
          overlay = _createVNode(Menu, {
            "items": route.children.map(child => ({
              key: child.path || child.breadcrumbName,
              label: itemRender({
                route: child,
                params,
                routes,
                paths: addChildPath(tempPaths, child.path, params)
              })
            }))
          }, null);
        }
        const itemProps = {
          separator
        };
        if (overlay) {
          itemProps.overlay = overlay;
        }
        return _createVNode(BreadcrumbItem, _objectSpread(_objectSpread({}, itemProps), {}, {
          "key": path || route.breadcrumbName
        }), {
          default: () => [itemRender({
            route,
            params,
            routes,
            paths: tempPaths
          })]
        });
      });
    };
    // == Agent API Integration ==
    const getBreadcrumbStatus = () => {
      const {
        routes,
        params = {}
      } = props;
      console.log(routes, params);
      const items = [];
      if (routes && routes.length > 0) {
        // 使用 routes 配置
        const paths = [];
        routes.forEach(route => {
          const path = getPath(route.path, params);
          if (path) {
            paths.push(path);
          }
          const name = getBreadcrumbName(route, params);
          items.push({
            path: route.path,
            name: name || '',
            fullPath: paths.join('/')
          });
          // 包含子路由
          if (route.children && route.children.length) {
            console.log(route.children);
            route.children.forEach(child => {
              const childName = getBreadcrumbName(child, params);
              const childFullPath = addChildPath([...paths], child.path, params).join('/');
              items.push({
                path: child.path || '',
                name: childName || '',
                fullPath: childFullPath
              });
            });
          }
        });
      } else {
        // 从子组件中提取信息
        const children = flattenChildren(getPropsSlot(slots, props));
        console.log(children);
        if (children.length > 0 && navRef.value) {
          // 只选择 <li> 元素，每个面包屑项对应一个 li
          const breadcrumbItems = navRef.value.querySelectorAll(`ol > li`);
          breadcrumbItems.forEach((item, index) => {
            var _a, _b;
            const linkElement = item.querySelector('a');
            // 获取当前 li 的直接文本内容，排除分隔符
            const separator = item.querySelector(`.${prefixCls.value}-separator`);
            let textContent = ((_a = item.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || `Item ${index + 1}`;
            // 移除分隔符文本
            if (separator) {
              const separatorText = ((_b = separator.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
              textContent = textContent.replace(separatorText, '').trim();
            }
            const href = (linkElement === null || linkElement === void 0 ? void 0 : linkElement.getAttribute('href')) || '';
            items.push({
              path: href,
              name: textContent,
              fullPath: href,
              href: href
            });
          });
        }
      }
      return {
        data: {
          items,
          currentPath: items.length > 0 ? items[items.length - 1].fullPath : ''
        }
      };
    };
    const navigateTo = href => {
      const status = getBreadcrumbStatus();
      let targetItem;
      if (typeof href === 'number') {
        // 按索引查找
        targetItem = status.data.items[href];
      } else {
        // 按路径或名称查找
        targetItem = status.data.items.find(item => item.name === href);
      }
      if (!targetItem) {
        return {
          error: {
            code: 'ITEM_NOT_FOUND',
            message: `Breadcrumb item "${href}" not found`
          }
        };
      }
      // 触发导航
      if (typeof window !== 'undefined' && navRef.value) {
        // 查找对应的链接元素并触发点击
        const breadcrumbItems = navRef.value.querySelectorAll(`ol > li`);
        const targetIndex = status.data.items.indexOf(targetItem);
        if (targetIndex >= 0 && targetIndex < breadcrumbItems.length) {
          const targetLi = breadcrumbItems[targetIndex];
          const linkElement = targetLi.querySelector('a');
          if (linkElement) {
            // 如果有链接，触发点击事件
            linkElement.click();
          } else if (targetItem.href) {
            // 如果没有链接元素但有 href，手动导航
            if (targetItem.href.startsWith('#')) {
              window.location.hash = targetItem.href.replace('#', '');
            } else if (targetItem.href.startsWith('http') || targetItem.href.startsWith('/')) {
              window.location.href = targetItem.href;
            }
          }
        }
      }
    };
    const apiAttrs = shallowRef({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('breadcrumb', {
          getBreadcrumbStatus: {
            handler: getBreadcrumbStatus,
            description: 'Get the status of the breadcrumb navigation, including all path items.',
            params: []
          },
          navigateTo: {
            handler: navigateTo,
            description: 'Navigate to the specified breadcrumb path.',
            params: [{
              name: 'href',
              type: 'string | number',
              description: 'The path name or index to navigate to.'
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
      let crumbs;
      const {
        routes,
        params = {}
      } = props;
      const children = flattenChildren(getPropsSlot(slots, props));
      const separator = (_a = getPropsSlot(slots, props, 'separator')) !== null && _a !== void 0 ? _a : '/';
      const itemRender = props.itemRender || slots.itemRender || defaultItemRender;
      if (routes && routes.length > 0) {
        // generated by route
        crumbs = genForRoutes({
          routes,
          params,
          separator,
          itemRender
        });
      } else if (children.length) {
        crumbs = children.map((element, index) => {
          warning(typeof element.type === 'object' && (element.type.__ANT_BREADCRUMB_ITEM || element.type.__ANT_BREADCRUMB_SEPARATOR), 'Breadcrumb', "Only accepts Breadcrumb.Item and Breadcrumb.Separator as it's children");
          return cloneVNode(element, {
            separator,
            key: index
          });
        });
      }
      const breadcrumbClassName = {
        [prefixCls.value]: true,
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        [`${attrs.class}`]: !!attrs.class,
        [hashId.value]: true
      };
      return wrapSSR(_createVNode("nav", _objectSpread(_objectSpread(_objectSpread({}, attrs), apiAttrs.value), {}, {
        "class": breadcrumbClassName,
        "ref": navRef
      }), [_createVNode("ol", null, [crumbs])]));
    };
  }
});