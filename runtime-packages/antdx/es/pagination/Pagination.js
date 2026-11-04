import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import _extends from "@babel/runtime/helpers/esm/extends";
var __rest = this && this.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
import { computed, toRef, defineComponent, shallowRef, onMounted, onUnmounted } from 'vue';
import LeftOutlined from "@ant-design/icons-vue/es/icons/LeftOutlined";
import RightOutlined from "@ant-design/icons-vue/es/icons/RightOutlined";
import DoubleLeftOutlined from "@ant-design/icons-vue/es/icons/DoubleLeftOutlined";
import DoubleRightOutlined from "@ant-design/icons-vue/es/icons/DoubleRightOutlined";
import MiniSelect, { MiddleSelect } from './Select';
import { useLocaleReceiver } from '../locale-provider/LocaleReceiver';
import VcPagination from '../vc-pagination';
import enUS from '../vc-pagination/locale/en_US';
import classNames from '../_util/classNames';
import useConfigInject from '../config-provider/hooks/useConfigInject';
import useBreakpoint from '../_util/hooks/useBreakpoint';
import { booleanType, arrayType, stringType, functionType, someType } from '../_util/type';
import '../_util/AgentApiRegistry';
// CSSINJS
import useStyle from './style';
export const paginationProps = () => ({
  total: Number,
  defaultCurrent: Number,
  disabled: booleanType(),
  current: Number,
  defaultPageSize: Number,
  pageSize: Number,
  hideOnSinglePage: booleanType(),
  showSizeChanger: booleanType(),
  pageSizeOptions: arrayType(),
  buildOptionText: functionType(),
  showQuickJumper: someType([Boolean, Object]),
  showTotal: functionType(),
  size: stringType(),
  simple: booleanType(),
  locale: Object,
  prefixCls: String,
  selectPrefixCls: String,
  totalBoundaryShowSizeChanger: Number,
  selectComponentClass: String,
  itemRender: functionType(),
  role: String,
  responsive: Boolean,
  showLessItems: booleanType(),
  onChange: functionType(),
  onShowSizeChange: functionType(),
  'onUpdate:current': functionType(),
  'onUpdate:pageSize': functionType()
});
export const paginationConfig = () => _extends(_extends({}, paginationProps()), {
  position: stringType()
});
export default defineComponent({
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
    } = useConfigInject('pagination', props);
    // style
    const [wrapSSR, hashId] = useStyle(prefixCls);
    const selectPrefixCls = computed(() => configProvider.getPrefixCls('select', props.selectPrefixCls));
    const breakpoint = useBreakpoint();
    const [locale] = useLocaleReceiver('Pagination', enUS, toRef(props, 'locale'));
    const getIconsProps = pre => {
      const ellipsis = _createVNode("span", {
        "class": `${pre}-item-ellipsis`
      }, [_createTextVNode("\u2022\u2022\u2022")]);
      const prevIcon = _createVNode("button", {
        "class": `${pre}-item-link`,
        "type": "button",
        "tabindex": -1
      }, [direction.value === 'rtl' ? _createVNode(RightOutlined, null, null) : _createVNode(LeftOutlined, null, null)]);
      const nextIcon = _createVNode("button", {
        "class": `${pre}-item-link`,
        "type": "button",
        "tabindex": -1
      }, [direction.value === 'rtl' ? _createVNode(LeftOutlined, null, null) : _createVNode(RightOutlined, null, null)]);
      const jumpPrevIcon = _createVNode("a", {
        "rel": "nofollow",
        "class": `${pre}-item-link`
      }, [_createVNode("div", {
        "class": `${pre}-item-container`
      }, [direction.value === 'rtl' ? _createVNode(DoubleRightOutlined, {
        "class": `${pre}-item-link-icon`
      }, null) : _createVNode(DoubleLeftOutlined, {
        "class": `${pre}-item-link-icon`
      }, null), ellipsis])]);
      const jumpNextIcon = _createVNode("a", {
        "rel": "nofollow",
        "class": `${pre}-item-link`
      }, [_createVNode("div", {
        "class": `${pre}-item-container`
      }, [direction.value === 'rtl' ? _createVNode(DoubleLeftOutlined, {
        "class": `${pre}-item-link-icon`
      }, null) : _createVNode(DoubleRightOutlined, {
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
    const apiAttrs = shallowRef({});
    onMounted(() => {
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
    onUnmounted(() => {
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
      const paginationProps = _extends(_extends(_extends(_extends(_extends({}, restProps), getIconsProps(prefixCls.value)), {
        prefixCls: prefixCls.value,
        selectPrefixCls: selectPrefixCls.value,
        selectComponentClass: selectComponentClass || (isSmall ? MiniSelect : MiddleSelect),
        locale: locale.value,
        buildOptionText
      }), attrs), {
        class: classNames({
          [`${prefixCls.value}-mini`]: isSmall,
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl'
        }, attrs.class, hashId.value),
        itemRender
      });
      return wrapSSR(_createVNode(VcPagination, _objectSpread(_objectSpread({}, paginationProps), apiAttrs.value), null));
    };
  }
});