"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.paginationProps = exports.paginationConfig = exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _LeftOutlined = _interopRequireDefault(require("@ant-design/icons-vue/lib/icons/LeftOutlined"));
var _RightOutlined = _interopRequireDefault(require("@ant-design/icons-vue/lib/icons/RightOutlined"));
var _DoubleLeftOutlined = _interopRequireDefault(require("@ant-design/icons-vue/lib/icons/DoubleLeftOutlined"));
var _DoubleRightOutlined = _interopRequireDefault(require("@ant-design/icons-vue/lib/icons/DoubleRightOutlined"));
var _Select = _interopRequireWildcard(require("./Select"));
var _LocaleReceiver = require("../locale-provider/LocaleReceiver");
var _vcPagination = _interopRequireDefault(require("../vc-pagination"));
var _en_US = _interopRequireDefault(require("../vc-pagination/locale/en_US"));
var _classNames = _interopRequireDefault(require("../_util/classNames"));
var _useConfigInject = _interopRequireDefault(require("../config-provider/hooks/useConfigInject"));
var _useBreakpoint = _interopRequireDefault(require("../_util/hooks/useBreakpoint"));
var _type = require("../_util/type");
require("../_util/AgentApiRegistry");
var _style = _interopRequireDefault(require("./style"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};

// CSSINJS

const paginationProps = () => ({
  total: Number,
  defaultCurrent: Number,
  disabled: (0, _type.booleanType)(),
  current: Number,
  defaultPageSize: Number,
  pageSize: Number,
  hideOnSinglePage: (0, _type.booleanType)(),
  showSizeChanger: (0, _type.booleanType)(),
  pageSizeOptions: (0, _type.arrayType)(),
  buildOptionText: (0, _type.functionType)(),
  showQuickJumper: (0, _type.someType)([Boolean, Object]),
  showTotal: (0, _type.functionType)(),
  size: (0, _type.stringType)(),
  simple: (0, _type.booleanType)(),
  locale: Object,
  prefixCls: String,
  selectPrefixCls: String,
  totalBoundaryShowSizeChanger: Number,
  selectComponentClass: String,
  itemRender: (0, _type.functionType)(),
  role: String,
  responsive: Boolean,
  showLessItems: (0, _type.booleanType)(),
  onChange: (0, _type.functionType)(),
  onShowSizeChange: (0, _type.functionType)(),
  'onUpdate:current': (0, _type.functionType)(),
  'onUpdate:pageSize': (0, _type.functionType)()
});
exports.paginationProps = paginationProps;
const paginationConfig = () => (0, _extends2.default)((0, _extends2.default)({}, paginationProps()), {
  position: (0, _type.stringType)()
});
exports.paginationConfig = paginationConfig;
var _default = exports.default = (0, _vue.defineComponent)({
  compatConfig: {
    MODE: 3
  },
  name: 'APagination',
  inheritAttrs: false,
  props: paginationProps(),
  // emits: ['change', 'showSizeChange', 'update:current', 'update:pageSize'],
  setup(props, {
    slots,
    attrs
  }) {
    const {
      prefixCls,
      configProvider,
      direction,
      size
    } = (0, _useConfigInject.default)('pagination', props);
    // style
    const [wrapSSR, hashId] = (0, _style.default)(prefixCls);
    const selectPrefixCls = (0, _vue.computed)(() => configProvider.getPrefixCls('select', props.selectPrefixCls));
    const breakpoint = (0, _useBreakpoint.default)();
    const [locale] = (0, _LocaleReceiver.useLocaleReceiver)('Pagination', _en_US.default, (0, _vue.toRef)(props, 'locale'));
    const getIconsProps = pre => {
      const ellipsis = (0, _vue.createVNode)("span", {
        "class": `${pre}-item-ellipsis`
      }, [(0, _vue.createTextVNode)("\u2022\u2022\u2022")]);
      const prevIcon = (0, _vue.createVNode)("button", {
        "class": `${pre}-item-link`,
        "type": "button",
        "tabindex": -1
      }, [direction.value === 'rtl' ? (0, _vue.createVNode)(_RightOutlined.default, null, null) : (0, _vue.createVNode)(_LeftOutlined.default, null, null)]);
      const nextIcon = (0, _vue.createVNode)("button", {
        "class": `${pre}-item-link`,
        "type": "button",
        "tabindex": -1
      }, [direction.value === 'rtl' ? (0, _vue.createVNode)(_LeftOutlined.default, null, null) : (0, _vue.createVNode)(_RightOutlined.default, null, null)]);
      const jumpPrevIcon = (0, _vue.createVNode)("a", {
        "rel": "nofollow",
        "class": `${pre}-item-link`
      }, [(0, _vue.createVNode)("div", {
        "class": `${pre}-item-container`
      }, [direction.value === 'rtl' ? (0, _vue.createVNode)(_DoubleRightOutlined.default, {
        "class": `${pre}-item-link-icon`
      }, null) : (0, _vue.createVNode)(_DoubleLeftOutlined.default, {
        "class": `${pre}-item-link-icon`
      }, null), ellipsis])]);
      const jumpNextIcon = (0, _vue.createVNode)("a", {
        "rel": "nofollow",
        "class": `${pre}-item-link`
      }, [(0, _vue.createVNode)("div", {
        "class": `${pre}-item-container`
      }, [direction.value === 'rtl' ? (0, _vue.createVNode)(_DoubleLeftOutlined.default, {
        "class": `${pre}-item-link-icon`
      }, null) : (0, _vue.createVNode)(_DoubleRightOutlined.default, {
        "class": `${pre}-item-link-icon`
      }, null), ellipsis])]);
      return {
        prevIcon,
        nextIcon,
        jumpPrevIcon,
        jumpNextIcon
      };
    };
    // ========== Agent API ===========
    const getPaginationStatus = () => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      const currentPage = props.current || props.defaultCurrent || 1;
      const pageSize = props.pageSize || props.defaultPageSize || 10;
      const total = props.total || 0;
      const totalPages = Math.ceil(total / pageSize);
      return {
        data: {
          currentPage,
          pageSize,
          total,
          totalPages
        }
      };
    };
    const navigateTo = page => {
      const {
        currentPage,
        pageSize,
        totalPages
      } = getPaginationStatus().data;
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED'
          }
        };
      }
      let targetPage;
      // 处理字符串类型的页码
      if (typeof page === 'string') {
        if (page === 'next') {
          targetPage = currentPage + 1;
        } else if (page === 'prev' || page === 'previous') {
          targetPage = currentPage - 1;
        } else if (page === 'first') {
          targetPage = 1;
        } else if (page === 'last') {
          targetPage = totalPages;
        } else {
          // 尝试解析为数字
          targetPage = parseInt(page, 10);
          if (isNaN(targetPage)) {
            return {
              success: false,
              error: `Invalid page: ${page}`
            };
          }
        }
      } else {
        targetPage = page;
      }
      // 验证页码范围
      if (targetPage < 1 || targetPage > totalPages) {
        return {
          error: {
            code: 'PAGE_OUT_OF_RANGE',
            message: `Page ${targetPage} is out of range (1-${totalPages})`
          }
        };
      }
      // 如果已经在目标页，直接返回
      if (targetPage === currentPage) {
        return {
          success: true,
          data: {
            currentPage: targetPage,
            message: 'Already on target page'
          }
        };
      }
      // 调用 onChange 回调
      if (props.onChange) {
        props.onChange(targetPage, pageSize);
      }
      // 触发 update:current 事件
      if (props['onUpdate:current']) {
        props['onUpdate:current'](targetPage);
      }
      return {
        success: true,
        currentPage: targetPage,
        pageSize,
        totalPages
      };
    };
    const apiAttrs = (0, _vue.shallowRef)({});
    (0, _vue.onMounted)(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('pagination', {
          getPaginationStatus: {
            handler: getPaginationStatus,
            description: 'Get the current status of the pagination component, including current page, page size, and total pages.'
          },
          navigateTo: {
            handler: navigateTo,
            description: 'Navigate to a specific page.',
            params: [{
              name: 'page',
              type: 'number',
              required: true,
              description: 'The page number or keyword (next, prev, first, last) to navigate to.'
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
      var _a;
      const {
          itemRender = slots.itemRender,
          buildOptionText = slots.buildOptionText,
          selectComponentClass,
          responsive
        } = props,
        restProps = __rest(props, ["itemRender", "buildOptionText", "selectComponentClass", "responsive"]);
      const isSmall = size.value === 'small' || !!(((_a = breakpoint.value) === null || _a === void 0 ? void 0 : _a.xs) && !size.value && responsive);
      const paginationProps = (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, restProps), getIconsProps(prefixCls.value)), {
        prefixCls: prefixCls.value,
        selectPrefixCls: selectPrefixCls.value,
        selectComponentClass: selectComponentClass || (isSmall ? _Select.default : _Select.MiddleSelect),
        locale: locale.value,
        buildOptionText
      }), attrs), {
        class: (0, _classNames.default)({
          [`${prefixCls.value}-mini`]: isSmall,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl'
        }, attrs.class, hashId.value),
        itemRender
      });
      return wrapSSR((0, _vue.createVNode)(_vcPagination.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, paginationProps), apiAttrs.value), null));
    };
  }
});