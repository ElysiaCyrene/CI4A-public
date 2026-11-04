import type { PropType, ExtractPropTypes } from 'vue';
import { cloneVNode, defineComponent, onMounted, onUnmounted, shallowRef, ref } from 'vue';
import PropTypes from '../_util/vue-types';
import { flattenChildren, getPropsSlot } from '../_util/props-util';
import warning from '../_util/warning';
import type { BreadcrumbItemProps } from './BreadcrumbItem';
import BreadcrumbItem from './BreadcrumbItem';
import Menu from '../menu';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import useStyle from './style';
import type { CustomSlotsType, VueNode } from '../_util/type';
import '../_util/AgentApiRegistry';

export interface Route {
  path: string;
  breadcrumbName: string;
  children?: Omit<Route, 'children'>[];
}

export const breadcrumbProps = () => ({
  prefixCls: String,
  routes: { type: Array as PropType<Route[]> },
  params: PropTypes.any,
  separator: PropTypes.any,
  itemRender: {
    type: Function as PropType<
      (opt: { route: Route; params: unknown; routes: Route[]; paths: string[] }) => VueNode
    >,
  },
});

export type BreadcrumbProps = Partial<ExtractPropTypes<ReturnType<typeof breadcrumbProps>>>;

function getBreadcrumbName(route: Route, params: unknown) {
  if (!route.breadcrumbName) {
    return null;
  }
  const paramsKeys = Object.keys(params).join('|');
  const name = route.breadcrumbName.replace(
    new RegExp(`:(${paramsKeys})`, 'g'),
    (replacement, key) => params[key] || replacement,
  );
  return name;
}
function defaultItemRender(opt: {
  route: Route;
  params: unknown;
  routes: Route[];
  paths: string[];
}): VueNode {
  const { route, params, routes, paths } = opt;
  const isLastItem = routes.indexOf(route) === routes.length - 1;
  const name = getBreadcrumbName(route, params);
  return isLastItem ? <span>{name}</span> : <a href={`#/${paths.join('/')}`}>{name}</a>;
}

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ABreadcrumb',
  inheritAttrs: false,
  props: breadcrumbProps(),
  slots: Object as CustomSlotsType<{
    separator: any;
    itemRender: { route: Route; params: any; routes: Route[]; paths: string[] };
    default: any;
  }>,
  setup(props, { slots, attrs }) {
    const { prefixCls, direction } = useConfigInject('breadcrumb', props);
    const [wrapSSR, hashId] = useStyle(prefixCls);
    const navRef = ref<HTMLElement>();
    const getPath = (path: string, params: unknown) => {
      path = (path || '').replace(/^\//, '');
      Object.keys(params).forEach(key => {
        path = path.replace(`:${key}`, params[key]);
      });
      return path;
    };

    const addChildPath = (paths: string[], childPath: string, params: unknown) => {
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
      itemRender = defaultItemRender,
    }: any) => {
      const paths = [];
      return routes.map((route: Route) => {
        const path = getPath(route.path, params);

        if (path) {
          paths.push(path);
        }
        const tempPaths = [...paths];
        // generated overlay by route.children
        let overlay = null;
        if (route.children && route.children.length) {
          overlay = (
            <Menu
              items={route.children.map(child => ({
                key: child.path || child.breadcrumbName,
                label: itemRender({
                  route: child,
                  params,
                  routes,
                  paths: addChildPath(tempPaths, child.path, params),
                }),
              }))}
            ></Menu>
          );
        }
        const itemProps: BreadcrumbItemProps = { separator };
        if (overlay) {
          itemProps.overlay = overlay;
        }
        return (
          <BreadcrumbItem {...itemProps} key={path || route.breadcrumbName}>
            {itemRender({ route, params, routes, paths: tempPaths })}
          </BreadcrumbItem>
        );
      });
    };

    // == Agent API Integration ==

    const getBreadcrumbStatus = () => {
      const { routes, params = {} } = props;
      console.log(routes, params);
      const items: Array<{ path: string; name: string; fullPath: string; href?: string }> = [];

      if (routes && routes.length > 0) {
        // 使用 routes 配置
        const paths: string[] = [];
        routes.forEach(route => {
          const path = getPath(route.path, params);
          if (path) {
            paths.push(path);
          }
          const name = getBreadcrumbName(route, params);
          items.push({
            path: route.path,
            name: name || '',
            fullPath: paths.join('/'),
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
                fullPath: childFullPath,
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
            const linkElement = item.querySelector('a');
            // 获取当前 li 的直接文本内容，排除分隔符
            const separator = item.querySelector(`.${prefixCls.value}-separator`);
            let textContent = (item as HTMLElement).textContent?.trim() || `Item ${index + 1}`;

            // 移除分隔符文本
            if (separator) {
              const separatorText = separator.textContent?.trim() || '';
              textContent = textContent.replace(separatorText, '').trim();
            }

            const href = linkElement?.getAttribute('href') || '';

            items.push({
              path: href,
              name: textContent,
              fullPath: href,
              href: href,
            });
          });
        }
      }

      return {
        data: {
          items,
          currentPath: items.length > 0 ? items[items.length - 1].fullPath : '',
        },
      };
    };

    const navigateTo = (href: string | number) => {
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
            message: `Breadcrumb item "${href}" not found`,
          },
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

    const apiAttrs = shallowRef<any>({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('breadcrumb', {
          getBreadcrumbStatus: {
            handler: getBreadcrumbStatus,
            description: 'Get the status of the breadcrumb navigation, including all path items.',
            params: [],
          },
          navigateTo: {
            handler: navigateTo,
            description: 'Navigate to the specified breadcrumb path.',
            params: [
              {
                name: 'href',
                type: 'string | number',
                description: 'The path name or index to navigate to.',
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
      let crumbs: VueNode[];

      const { routes, params = {} } = props;

      const children = flattenChildren(getPropsSlot(slots, props));
      const separator = getPropsSlot(slots, props, 'separator') ?? '/';

      const itemRender = props.itemRender || slots.itemRender || defaultItemRender;
      if (routes && routes.length > 0) {
        // generated by route
        crumbs = genForRoutes({
          routes,
          params,
          separator,
          itemRender,
        });
      } else if (children.length) {
        crumbs = children.map((element, index) => {
          warning(
            typeof element.type === 'object' &&
              (element.type.__ANT_BREADCRUMB_ITEM || element.type.__ANT_BREADCRUMB_SEPARATOR),
            'Breadcrumb',
            "Only accepts Breadcrumb.Item and Breadcrumb.Separator as it's children",
          );
          return cloneVNode(element, { separator, key: index });
        });
      }

      const breadcrumbClassName = {
        [prefixCls.value]: true,
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        [`${attrs.class}`]: !!attrs.class,
        [hashId.value]: true,
      };

      return wrapSSR(
        <nav {...attrs} {...apiAttrs.value} class={breadcrumbClassName} ref={navRef}>
          <ol>{crumbs}</ol>
        </nav>,
      );
    };
  },
});
