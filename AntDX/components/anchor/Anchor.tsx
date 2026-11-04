import type { CSSProperties, ExtractPropTypes, PropType } from 'vue';
import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  reactive,
  ref,
  computed,
  shallowRef,
  onUnmounted,
} from 'vue';
import scrollIntoView from 'scroll-into-view-if-needed';
import classNames from '../_util/classNames';
import addEventListener from '../vc-util/Dom/addEventListener';
import Affix from '../affix';
import scrollTo from '../_util/scrollTo';
import getScroll from '../_util/getScroll';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import useProvideAnchor from './context';
import useStyle from './style';
import type { AnchorLinkItemProps } from './AnchorLink';
import AnchorLink from './AnchorLink';
import PropTypes from '../_util/vue-types';
import devWarning from '../vc-util/devWarning';
import { arrayType } from '../_util/type';
import '../_util/AgentApiRegistry';

export type AnchorDirection = 'vertical' | 'horizontal';

function getDefaultContainer() {
  return window;
}

function getOffsetTop(element: HTMLElement, container: AnchorContainer): number {
  if (!element.getClientRects().length) {
    return 0;
  }

  const rect = element.getBoundingClientRect();

  if (rect.width || rect.height) {
    if (container === window) {
      container = element.ownerDocument!.documentElement!;
      return rect.top - container.clientTop;
    }
    return rect.top - (container as HTMLElement).getBoundingClientRect().top;
  }

  return rect.top;
}

const sharpMatcherRegx = /#([\S ]+)$/;

interface Section {
  link: string;
  top: number;
}

export type AnchorContainer = HTMLElement | Window;

export const anchorProps = () => ({
  prefixCls: String,
  offsetTop: Number,
  bounds: Number,
  affix: { type: Boolean, default: true },
  showInkInFixed: { type: Boolean, default: false },
  getContainer: Function as PropType<() => AnchorContainer>,
  wrapperClass: String,
  wrapperStyle: { type: Object as PropType<CSSProperties>, default: undefined as CSSProperties },
  getCurrentAnchor: Function as PropType<(activeLink: string) => string>,
  targetOffset: Number,
  items: arrayType<AnchorLinkItemProps[]>(),
  direction: PropTypes.oneOf(['vertical', 'horizontal'] as AnchorDirection[]).def('vertical'),
  onChange: Function as PropType<(currentActiveLink: string) => void>,
  onClick: Function as PropType<(e: MouseEvent, link: { title: any; href: string }) => void>,
});

export type AnchorProps = Partial<ExtractPropTypes<ReturnType<typeof anchorProps>>>;

export interface AnchorState {
  scrollContainer: HTMLElement | Window;
  links: string[];
  scrollEvent: any;
  animating: boolean;
}

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'AAnchor',
  inheritAttrs: false,
  props: anchorProps(),
  setup(props, { emit, attrs, slots }) {
    const { prefixCls, getTargetContainer, direction } = useConfigInject('anchor', props);
    const anchorDirection = computed(() => props.direction ?? 'vertical');

    if (process.env.NODE_ENV !== 'production') {
      devWarning(
        props.items && typeof slots.default !== 'function',
        'Anchor',
        '`Anchor children` is deprecated. Please use `items` instead.',
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      devWarning(
        !(anchorDirection.value === 'horizontal' && props.items?.some(n => 'children' in n)),
        'Anchor',
        '`Anchor items#children` is not supported when `Anchor` direction is horizontal.',
      );
    }

    const spanLinkNode = ref<HTMLSpanElement>(null);
    const anchorRef = ref();
    const state = reactive<AnchorState>({
      links: [],
      scrollContainer: null,
      scrollEvent: null,
      animating: false,
    });
    const activeLink = ref(null);
    const getContainer = computed(() => {
      const { getContainer } = props;
      return getContainer || getTargetContainer?.value || getDefaultContainer;
    });
    // func...
    const getCurrentAnchor = (offsetTop = 0, bounds = 5) => {
      const linkSections: Array<Section> = [];
      const container = getContainer.value();
      state.links.forEach(link => {
        const sharpLinkMatch = sharpMatcherRegx.exec(link.toString());
        if (!sharpLinkMatch) {
          return;
        }
        const target = document.getElementById(sharpLinkMatch[1]);
        if (target) {
          const top = getOffsetTop(target, container);
          if (top < offsetTop + bounds) {
            linkSections.push({
              link,
              top,
            });
          }
        }
      });

      if (linkSections.length) {
        const maxSection = linkSections.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));
        return maxSection.link;
      }
      return '';
    };
    const setCurrentActiveLink = (link: string) => {
      const { getCurrentAnchor } = props;
      if (activeLink.value === link) {
        return;
      }
      activeLink.value = typeof getCurrentAnchor === 'function' ? getCurrentAnchor(link) : link;
      emit('change', link);
    };
    const handleScrollTo = (link: string) => {
      const { offsetTop, targetOffset } = props;

      setCurrentActiveLink(link);
      const sharpLinkMatch = sharpMatcherRegx.exec(link);
      if (!sharpLinkMatch) {
        return;
      }
      const targetElement = document.getElementById(sharpLinkMatch[1]);
      if (!targetElement) {
        return;
      }

      const container = getContainer.value();
      const scrollTop = getScroll(container, true);
      const eleOffsetTop = getOffsetTop(targetElement, container);
      let y = scrollTop + eleOffsetTop;
      y -= targetOffset !== undefined ? targetOffset : offsetTop || 0;
      state.animating = true;

      scrollTo(y, {
        callback: () => {
          state.animating = false;
        },
        getContainer: getContainer.value,
      });
    };

    const handleScroll = () => {
      if (state.animating) {
        return;
      }
      const { offsetTop, bounds, targetOffset } = props;
      const currentActiveLink = getCurrentAnchor(
        targetOffset !== undefined ? targetOffset : offsetTop || 0,
        bounds,
      );
      setCurrentActiveLink(currentActiveLink);
    };

    const updateInk = () => {
      const linkNode = anchorRef.value.querySelector(`.${prefixCls.value}-link-title-active`);
      if (linkNode && spanLinkNode.value) {
        const horizontalAnchor = anchorDirection.value === 'horizontal';
        spanLinkNode.value.style.top = horizontalAnchor
          ? ''
          : `${linkNode.offsetTop + linkNode.clientHeight / 2}px`;
        spanLinkNode.value.style.height = horizontalAnchor ? '' : `${linkNode.clientHeight}px`;
        spanLinkNode.value.style.left = horizontalAnchor ? `${linkNode.offsetLeft}px` : '';
        spanLinkNode.value.style.width = horizontalAnchor ? `${linkNode.clientWidth}px` : '';
        if (horizontalAnchor) {
          scrollIntoView(linkNode, {
            scrollMode: 'if-needed',
            block: 'nearest',
          });
        }
      }
    };

    useProvideAnchor({
      registerLink: (link: string) => {
        if (!state.links.includes(link)) {
          state.links.push(link);
        }
      },
      unregisterLink: (link: string) => {
        const index = state.links.indexOf(link);
        if (index !== -1) {
          state.links.splice(index, 1);
        }
      },
      activeLink,
      scrollTo: handleScrollTo,
      handleClick: (e, info) => {
        emit('click', e, info);
      },
      direction: anchorDirection,
    });

    // ========== Agent API ===========

    const getAllAnchorItems = () => {
      const items: Array<{ href: string; title: any }> = [];

      const extractItems = (options?: AnchorLinkItemProps[]) => {
        if (!Array.isArray(options)) return;

        options.forEach(option => {
          items.push({
            href: option.href,
            title: option.title,
          });

          // 递归处理嵌套的 children
          if (option.children && anchorDirection.value === 'vertical') {
            extractItems(option.children);
          }
        });
      };

      // 如果使用 items 属性
      if (Array.isArray(props.items)) {
        extractItems(props.items);
      }

      return items;
    };

    const getAnchorStatus = () => {
      return {
        data: {
          activeLink: activeLink.value,
          options: getAllAnchorItems(),
        },
      };
    };

    const navigateTo = (href: string) => {
      // 查找匹配的锚点项
      const allItems = getAllAnchorItems();
      const targetItem = allItems.find(item => item.href === href);

      if (!targetItem) {
        return {
          error: {
            code: 'ANCHOR_ITEM_NOT_FOUND',
            message: `Anchor item with href "${href}" not found.`,
          },
        };
      }

      // 使用 handleScrollTo 进行滚动
      handleScrollTo(href);
    };

    const apiAttrs = shallowRef<any>({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('anchor', {
          getAnchorStatus: {
            handler: getAnchorStatus,
            description:
              'Get the current status of the anchor, including the active link and all anchor items.',
          },
          navigateTo: {
            handler: navigateTo,
            description: 'Scroll to the specified anchor link.',
            params: [
              {
                name: 'href',
                type: 'string',
                required: true,
                description: 'The href of the anchor link to scroll to.',
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

    onMounted(() => {
      nextTick(() => {
        const container = getContainer.value();
        state.scrollContainer = container;
        state.scrollEvent = addEventListener(state.scrollContainer, 'scroll', handleScroll);
        handleScroll();
      });
    });
    onBeforeUnmount(() => {
      if (state.scrollEvent) {
        state.scrollEvent.remove();
      }
    });
    onUpdated(() => {
      if (state.scrollEvent) {
        const currentContainer = getContainer.value();
        if (state.scrollContainer !== currentContainer) {
          state.scrollContainer = currentContainer;
          state.scrollEvent.remove();
          state.scrollEvent = addEventListener(state.scrollContainer, 'scroll', handleScroll);
          handleScroll();
        }
      }
      updateInk();
    });

    const createNestedLink = (options?: AnchorLinkItemProps[]) =>
      Array.isArray(options)
        ? options.map(option => {
            const { children, key, href, target, class: cls, style, title } = option;
            return (
              <AnchorLink
                key={key}
                href={href}
                target={target}
                class={cls}
                style={style}
                title={title}
                customTitleProps={option}
                v-slots={{ customTitle: slots.customTitle }}
              >
                {anchorDirection.value === 'vertical' ? createNestedLink(children) : null}
              </AnchorLink>
            );
          })
        : null;

    const [wrapSSR, hashId] = useStyle(prefixCls);

    return () => {
      const { offsetTop, affix, showInkInFixed } = props;
      const pre = prefixCls.value;
      const inkClass = classNames(`${pre}-ink`, {
        [`${pre}-ink-visible`]: activeLink.value,
      });

      const wrapperClass = classNames(hashId.value, props.wrapperClass, `${pre}-wrapper`, {
        [`${pre}-wrapper-horizontal`]: anchorDirection.value === 'horizontal',
        [`${pre}-rtl`]: direction.value === 'rtl',
      });

      const anchorClass = classNames(pre, {
        [`${pre}-fixed`]: !affix && !showInkInFixed,
      });

      const wrapperStyle = {
        maxHeight: offsetTop ? `calc(100vh - ${offsetTop}px)` : '100vh',
        ...props.wrapperStyle,
      };
      const anchorContent = (
        <div class={wrapperClass} style={wrapperStyle} ref={anchorRef} {...apiAttrs.value}>
          <div class={anchorClass}>
            <span class={inkClass} ref={spanLinkNode} />
            {Array.isArray(props.items) ? createNestedLink(props.items) : slots.default?.()}
          </div>
        </div>
      );

      return wrapSSR(
        !affix ? (
          anchorContent
        ) : (
          <Affix {...attrs} {...apiAttrs.value} offsetTop={offsetTop} target={getContainer.value}>
            {anchorContent}
          </Affix>
        ),
      );
    };
  },
});
