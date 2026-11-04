"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.carouselProps = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _vueTypes = _interopRequireDefault(require("../_util/vue-types"));
var _warning = _interopRequireDefault(require("../_util/warning"));
var _classNames = _interopRequireDefault(require("../_util/classNames"));
var _vcSlick = _interopRequireDefault(require("../vc-slick"));
var _type = require("../_util/type");
var _useConfigInject = _interopRequireDefault(require("../config-provider/hooks/useConfigInject"));
require("../_util/AgentApiRegistry");
var _style = _interopRequireDefault(require("./style"));
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};

// CSSINJS

// Carousel
const carouselProps = () => ({
  effect: (0, _type.stringType)(),
  dots: (0, _type.booleanType)(true),
  vertical: (0, _type.booleanType)(),
  autoplay: (0, _type.booleanType)(),
  easing: String,
  beforeChange: (0, _type.functionType)(),
  afterChange: (0, _type.functionType)(),
  // style: PropTypes.React.CSSProperties,
  prefixCls: String,
  accessibility: (0, _type.booleanType)(),
  nextArrow: _vueTypes.default.any,
  prevArrow: _vueTypes.default.any,
  pauseOnHover: (0, _type.booleanType)(),
  // className: String,
  adaptiveHeight: (0, _type.booleanType)(),
  arrows: (0, _type.booleanType)(false),
  autoplaySpeed: Number,
  centerMode: (0, _type.booleanType)(),
  centerPadding: String,
  cssEase: String,
  dotsClass: String,
  draggable: (0, _type.booleanType)(false),
  fade: (0, _type.booleanType)(),
  focusOnSelect: (0, _type.booleanType)(),
  infinite: (0, _type.booleanType)(),
  initialSlide: Number,
  lazyLoad: (0, _type.stringType)(),
  rtl: (0, _type.booleanType)(),
  slide: String,
  slidesToShow: Number,
  slidesToScroll: Number,
  speed: Number,
  swipe: (0, _type.booleanType)(),
  swipeToSlide: (0, _type.booleanType)(),
  swipeEvent: (0, _type.functionType)(),
  touchMove: (0, _type.booleanType)(),
  touchThreshold: Number,
  variableWidth: (0, _type.booleanType)(),
  useCSS: (0, _type.booleanType)(),
  slickGoTo: Number,
  responsive: Array,
  dotPosition: (0, _type.stringType)(),
  verticalSwiping: (0, _type.booleanType)(false)
});
exports.carouselProps = carouselProps;
const Carousel = (0, _vue.defineComponent)({
  compatConfig: {
    MODE: 3
  },
  name: 'ACarousel',
  inheritAttrs: false,
  props: carouselProps(),
  setup(props, {
    slots,
    attrs,
    expose
  }) {
    const slickRef = (0, _vue.ref)();
    const goTo = (slide, dontAnimate = false) => {
      var _a;
      (_a = slickRef.value) === null || _a === void 0 ? void 0 : _a.slickGoTo(slide, dontAnimate);
    };
    expose({
      goTo,
      autoplay: palyType => {
        var _a, _b;
        (_b = (_a = slickRef.value) === null || _a === void 0 ? void 0 : _a.innerSlider) === null || _b === void 0 ? void 0 : _b.handleAutoPlay(palyType);
      },
      prev: () => {
        var _a;
        (_a = slickRef.value) === null || _a === void 0 ? void 0 : _a.slickPrev();
      },
      next: () => {
        var _a;
        (_a = slickRef.value) === null || _a === void 0 ? void 0 : _a.slickNext();
      },
      innerSlider: (0, _vue.computed)(() => {
        var _a;
        return (_a = slickRef.value) === null || _a === void 0 ? void 0 : _a.innerSlider;
      })
    });
    (0, _vue.watchEffect)(() => {
      (0, _warning.default)(props.vertical === undefined, 'Carousel', '`vertical` is deprecated, please use `dotPosition` instead.');
    });
    const {
      prefixCls,
      direction
    } = (0, _useConfigInject.default)('carousel', props);
    // style
    const [wrapSSR, hashId] = (0, _style.default)(prefixCls);
    const dotPosition = (0, _vue.computed)(() => {
      if (props.dotPosition) return props.dotPosition;
      if (props.vertical !== undefined) return props.vertical ? 'right' : 'bottom';
      return 'bottom';
    });
    const vertical = (0, _vue.computed)(() => dotPosition.value === 'left' || dotPosition.value === 'right');
    const dsClass = (0, _vue.computed)(() => {
      const dotsClass = 'slick-dots';
      return (0, _classNames.default)({
        [dotsClass]: true,
        [`${dotsClass}-${dotPosition.value}`]: true,
        [`${props.dotsClass}`]: !!props.dotsClass
      });
    });
    // ================== Agent API ==================
    /**
     * 从 DOM 元素中提取语义信息
     */
    const extractSemanticInfo = element => {
      var _a;
      if (!element) return null;
      const info = {
        tagName: element.tagName.toLowerCase(),
        text: '',
        attributes: {}
      };
      // 提取文本内容（只取直接文本，不包括子元素）
      const textContent = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).map(node => {
        var _a;
        return (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim();
      }).filter(Boolean).join(' ');
      if (textContent) {
        info.text = textContent;
      }
      // 提取完整的文本内容（包括子元素）
      const fullText = (_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim();
      if (fullText && fullText !== textContent) {
        info.fullText = fullText;
      }
      // 提取关键属性
      const keyAttributes = ['id', 'class', 'alt', 'title', 'aria-label', 'data-*', 'src', 'href'];
      Array.from(element.attributes).forEach(attr => {
        if (keyAttributes.some(key => key === attr.name || key.endsWith('*') && attr.name.startsWith(key.slice(0, -1)))) {
          info.attributes[attr.name] = attr.value;
        }
      });
      // 提取图片信息
      const images = Array.from(element.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        title: img.title
      }));
      if (images.length > 0) {
        info.images = images;
      }
      // 提取链接信息
      const links = Array.from(element.querySelectorAll('a')).map(link => {
        var _a;
        return {
          href: link.href,
          text: (_a = link.textContent) === null || _a === void 0 ? void 0 : _a.trim(),
          title: link.title
        };
      });
      if (links.length > 0) {
        info.links = links;
      }
      // 提取按钮信息
      const buttons = Array.from(element.querySelectorAll('button, [role="button"]')).map(btn => {
        var _a;
        return {
          text: (_a = btn.textContent) === null || _a === void 0 ? void 0 : _a.trim(),
          type: btn.getAttribute('type'),
          ariaLabel: btn.getAttribute('aria-label')
        };
      });
      if (buttons.length > 0) {
        info.buttons = buttons;
      }
      return info;
    };
    const getCarouselStatus = () => {
      var _a, _b, _c;
      const innerSlider = (_a = slickRef.value) === null || _a === void 0 ? void 0 : _a.innerSlider;
      if (!innerSlider) {
        return {
          error: {
            code: 'CAROUSEL_NO_INNERSLIDER',
            message: 'Carousel innerSlider is not available'
          }
        };
      }
      // 获取所有幻灯片的语义信息
      const slides = [];
      const trackDom = innerSlider.track;
      if (trackDom) {
        const slideElements = trackDom.querySelectorAll('.slick-slide:not(.slick-cloned)');
        slideElements.forEach((slideEl, index) => {
          const slideInfo = {
            index,
            isActive: index === innerSlider.currentSlide,
            semantic: extractSemanticInfo(slideEl)
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
      const currentSlideIndex = (_b = innerSlider.currentSlide) !== null && _b !== void 0 ? _b : 0;
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
          currentSlideContent: ((_c = slides[currentSlideIndex]) === null || _c === void 0 ? void 0 : _c.semantic) || null
          // // DOM 元素
          // dom: slickRef.value?.$el || null,
          // listDom: innerSlider.list || null,
          // trackDom: trackDom || null,
        }
      };
    };
    const apiAttrs = (0, _vue.shallowRef)({});
    (0, _vue.onMounted)(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('carousel', {
          getCarouselStatus: {
            handler: getCarouselStatus,
            description: 'Get the status of the carousel, including current slide index, total count, configuration, and semantic content of slides.',
            params: []
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
      const {
        dots,
        arrows,
        draggable,
        effect
      } = props;
      const {
          class: cls,
          style
        } = attrs,
        restAttrs = __rest(attrs, ["class", "style"]);
      const fade = effect === 'fade' ? true : props.fade;
      const className = (0, _classNames.default)(prefixCls.value, {
        [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
        [`${prefixCls.value}-vertical`]: vertical.value,
        [`${cls}`]: !!cls
      }, hashId.value);
      return wrapSSR((0, _vue.createVNode)("div", (0, _objectSpread2.default)({
        "class": className,
        "style": style
      }, apiAttrs.value), [(0, _vue.createVNode)(_vcSlick.default, (0, _objectSpread2.default)((0, _objectSpread2.default)((0, _objectSpread2.default)({
        "ref": slickRef
      }, props), restAttrs), {}, {
        "dots": !!dots,
        "dotsClass": dsClass.value,
        "arrows": arrows,
        "draggable": draggable,
        "fade": fade,
        "vertical": vertical.value
      }), slots)]));
    };
  }
});
var _default = exports.default = (0, _type.withInstall)(Carousel);