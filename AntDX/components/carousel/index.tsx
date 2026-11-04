import type { CSSProperties, ExtractPropTypes } from 'vue';
import {
  ref,
  computed,
  watchEffect,
  defineComponent,
  shallowRef,
  onMounted,
  onUnmounted,
} from 'vue';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import classNames from '../_util/classNames';
import SlickCarousel from '../vc-slick';
import { withInstall, booleanType, functionType, stringType } from '../_util/type';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import '../_util/AgentApiRegistry';

// CSSINJS
import useStyle from './style';

export type SwipeDirection = 'left' | 'down' | 'right' | 'up' | string;

export type LazyLoadTypes = 'ondemand' | 'progressive';

export type CarouselEffect = 'scrollx' | 'fade';
export type DotPosition = 'top' | 'bottom' | 'left' | 'right';

export interface CarouselRef {
  goTo: (slide: number, dontAnimate?: boolean) => void;
  next: () => void;
  prev: () => void;
  autoplay: (palyType?: 'update' | 'leave' | 'blur') => void;
  innerSlider: any;
}

// Carousel
export const carouselProps = () => ({
  effect: stringType<CarouselEffect>(),
  dots: booleanType(true),
  vertical: booleanType(),
  autoplay: booleanType(),
  easing: String,
  beforeChange: functionType<(currentSlide: number, nextSlide: number) => void>(),
  afterChange: functionType<(currentSlide: number) => void>(),
  // style: PropTypes.React.CSSProperties,
  prefixCls: String,
  accessibility: booleanType(),
  nextArrow: PropTypes.any,
  prevArrow: PropTypes.any,
  pauseOnHover: booleanType(),
  // className: String,
  adaptiveHeight: booleanType(),
  arrows: booleanType(false),
  autoplaySpeed: Number,
  centerMode: booleanType(),
  centerPadding: String,
  cssEase: String,
  dotsClass: String,
  draggable: booleanType(false),
  fade: booleanType(),
  focusOnSelect: booleanType(),
  infinite: booleanType(),
  initialSlide: Number,
  lazyLoad: stringType<LazyLoadTypes>(),
  rtl: booleanType(),
  slide: String,
  slidesToShow: Number,
  slidesToScroll: Number,
  speed: Number,
  swipe: booleanType(),
  swipeToSlide: booleanType(),
  swipeEvent: functionType<(swipeDirection: SwipeDirection) => void>(),
  touchMove: booleanType(),
  touchThreshold: Number,
  variableWidth: booleanType(),
  useCSS: booleanType(),
  slickGoTo: Number,
  responsive: Array,
  dotPosition: stringType<DotPosition>(),
  verticalSwiping: booleanType(false),
});
export type CarouselProps = Partial<ExtractPropTypes<ReturnType<typeof carouselProps>>>;
const Carousel = defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ACarousel',
  inheritAttrs: false,
  props: carouselProps(),
  setup(props, { slots, attrs, expose }) {
    const slickRef = ref();

    const goTo = (slide: number, dontAnimate = false) => {
      slickRef.value?.slickGoTo(slide, dontAnimate);
    };

    expose({
      goTo,
      autoplay: palyType => {
        slickRef.value?.innerSlider?.handleAutoPlay(palyType);
      },
      prev: () => {
        slickRef.value?.slickPrev();
      },
      next: () => {
        slickRef.value?.slickNext();
      },
      innerSlider: computed(() => {
        return slickRef.value?.innerSlider;
      }),
    } as CarouselRef);
    watchEffect(() => {
      warning(
        props.vertical === undefined,
        'Carousel',
        '`vertical` is deprecated, please use `dotPosition` instead.',
      );
    });
    const { prefixCls, direction } = useConfigInject('carousel', props);

    // style
    const [wrapSSR, hashId] = useStyle(prefixCls);

    const dotPosition = computed(() => {
      if (props.dotPosition) return props.dotPosition;
      if (props.vertical !== undefined) return props.vertical ? 'right' : 'bottom';
      return 'bottom';
    });
    const vertical = computed(() => dotPosition.value === 'left' || dotPosition.value === 'right');
    const dsClass = computed(() => {
      const dotsClass = 'slick-dots';
      return classNames({
        [dotsClass]: true,
        [`${dotsClass}-${dotPosition.value}`]: true,
        [`${props.dotsClass}`]: !!props.dotsClass,
      });
    });

    // ================== Agent API ==================

    /**
     * 从 DOM 元素中提取语义信息
     */
    const extractSemanticInfo = (element: HTMLElement) => {
      if (!element) return null;

      const info: any = {
        tagName: element.tagName.toLowerCase(),
        text: '',
        attributes: {},
      };

      // 提取文本内容（只取直接文本，不包括子元素）
      const textContent = Array.from(element.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent?.trim())
        .filter(Boolean)
        .join(' ');

      if (textContent) {
        info.text = textContent;
      }

      // 提取完整的文本内容（包括子元素）
      const fullText = element.textContent?.trim();
      if (fullText && fullText !== textContent) {
        info.fullText = fullText;
      }

      // 提取关键属性
      const keyAttributes = ['id', 'class', 'alt', 'title', 'aria-label', 'data-*', 'src', 'href'];
      Array.from(element.attributes).forEach(attr => {
        if (
          keyAttributes.some(
            key =>
              key === attr.name || (key.endsWith('*') && attr.name.startsWith(key.slice(0, -1))),
          )
        ) {
          info.attributes[attr.name] = attr.value;
        }
      });

      // 提取图片信息
      const images = Array.from(element.querySelectorAll('img')).map((img: HTMLImageElement) => ({
        src: img.src,
        alt: img.alt,
        title: img.title,
      }));
      if (images.length > 0) {
        info.images = images;
      }

      // 提取链接信息
      const links = Array.from(element.querySelectorAll('a')).map((link: HTMLAnchorElement) => ({
        href: link.href,
        text: link.textContent?.trim(),
        title: link.title,
      }));
      if (links.length > 0) {
        info.links = links;
      }

      // 提取按钮信息
      const buttons = Array.from(element.querySelectorAll('button, [role="button"]')).map(
        (btn: HTMLElement) => ({
          text: btn.textContent?.trim(),
          type: btn.getAttribute('type'),
          ariaLabel: btn.getAttribute('aria-label'),
        }),
      );
      if (buttons.length > 0) {
        info.buttons = buttons;
      }

      return info;
    };

    const getCarouselStatus = () => {
      const innerSlider = slickRef.value?.innerSlider;

      if (!innerSlider) {
        return {
          error: {
            code: 'CAROUSEL_NO_INNERSLIDER',
            message: 'Carousel innerSlider is not available',
          },
        };
      }

      // 获取所有幻灯片的语义信息
      const slides: any[] = [];
      const trackDom = innerSlider.track;

      if (trackDom) {
        const slideElements = trackDom.querySelectorAll('.slick-slide:not(.slick-cloned)');
        slideElements.forEach((slideEl: HTMLElement, index: number) => {
          const slideInfo: any = {
            index,
            isActive: index === innerSlider.currentSlide,
            semantic: extractSemanticInfo(slideEl),
          };

          // 添加可见性信息
          const dataIndex = slideEl.getAttribute('data-index');
          if (dataIndex !== null) {
            slideInfo.dataIndex = parseInt(dataIndex, 10);
          }

          slides.push(slideInfo);
        });
      }

      // 获取当前可见的幻灯片
      const currentSlideIndex = innerSlider.currentSlide ?? 0;
      // const slidesToShow = innerSlider.slidesToShow ?? 1;
      // const visibleSlides = slides.slice(currentSlideIndex, currentSlideIndex + slidesToShow);

      return {
        data: {
          // // 当前状态
          // currentSlide: currentSlideIndex,
          // slideCount: innerSlider.slideCount ?? 0,
          // // 配置信息
          // slidesToShow: slidesToShow,
          // slidesToScroll: innerSlider.slidesToScroll ?? 1,
          // autoplay: innerSlider.autoplay ?? false,
          // autoplaySpeed: innerSlider.autoplaySpeed ?? 3000,
          // // 动画状态
          // animating: innerSlider.animating ?? false,
          // dragging: innerSlider.dragging ?? false,
          // // 其他状态
          // infinite: innerSlider.infinite ?? false,
          // centerMode: innerSlider.centerMode ?? false,
          // 语义信息
          slides: slides,
          // visibleSlides: visibleSlides,
          currentSlideContent: slides[currentSlideIndex]?.semantic || null,
          // // DOM 元素
          // dom: slickRef.value?.$el || null,
          // listDom: innerSlider.list || null,
          // trackDom: trackDom || null,
        },
      };
    };

    const apiAttrs = shallowRef<any>({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('carousel', {
          getCarouselStatus: {
            handler: getCarouselStatus,
            description:
              'Get the status of the carousel, including current slide index, total count, configuration, and semantic content of slides.',
            params: [],
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
      const { dots, arrows, draggable, effect } = props;
      const { class: cls, style, ...restAttrs } = attrs;
      const fade = effect === 'fade' ? true : props.fade;
      const className = classNames(
        prefixCls.value,
        {
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-vertical`]: vertical.value,
          [`${cls}`]: !!cls,
        },
        hashId.value,
      );
      return wrapSSR(
        <div class={className} style={style as CSSProperties} {...apiAttrs.value}>
          <SlickCarousel
            ref={slickRef}
            {...props}
            {...restAttrs}
            dots={!!dots}
            dotsClass={dsClass.value}
            arrows={arrows}
            draggable={draggable}
            fade={fade}
            vertical={vertical.value}
            v-slots={slots}
          />
        </div>,
      );
    };
  },
});

export default withInstall(Carousel);
