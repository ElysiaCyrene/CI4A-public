import type { ExtractPropTypes } from 'vue';
import { computed, toRef, defineComponent, shallowRef, onMounted, onUnmounted } from 'vue';
import LeftOutlined from '@ant-design/icons-vue/LeftOutlined';
import RightOutlined from '@ant-design/icons-vue/RightOutlined';
import DoubleLeftOutlined from '@ant-design/icons-vue/DoubleLeftOutlined';
import DoubleRightOutlined from '@ant-design/icons-vue/DoubleRightOutlined';
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
  pageSizeOptions: arrayType<(string | number)[]>(),
  buildOptionText: functionType<(opt: { value: any }) => any>(),
  showQuickJumper: someType<boolean | { goButton?: any }>([Boolean, Object]),
  showTotal: functionType<(total: number, range: [number, number]) => any>(),
  size: stringType<'default' | 'small'>(),
  simple: booleanType(),
  locale: Object,
  prefixCls: String,
  selectPrefixCls: String,
  totalBoundaryShowSizeChanger: Number,
  selectComponentClass: String,
  itemRender:
    functionType<
      (opt: {
        page: number;
        type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next';
        originalElement: any;
      }) => any
    >(),
  role: String,
  responsive: Boolean,
  showLessItems: booleanType(),
  onChange: functionType<(page: number, pageSize: number) => void>(),
  onShowSizeChange: functionType<(current: number, size: number) => void>(),
  'onUpdate:current': functionType<(current: number) => void>(),
  'onUpdate:pageSize': functionType<(size: number) => void>(),
});

export type PaginationPosition = 'top' | 'bottom' | 'both';
export const paginationConfig = () => ({
  ...paginationProps(),
  position: stringType<PaginationPosition>(),
});

export type PaginationProps = Partial<ExtractPropTypes<ReturnType<typeof paginationProps>>>;
export type PaginationConfig = Partial<ExtractPropTypes<ReturnType<typeof paginationConfig>>>;

export interface PaginationLocale {
  items_per_page?: string;
  jump_to?: string;
  jump_to_confirm?: string;
  page?: string;
  prev_page?: string;
  next_page?: string;
  prev_5?: string;
  next_5?: string;
  prev_3?: string;
  next_3?: string;
}

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'APagination',
  inheritAttrs: false,
  props: paginationProps(),
  // emits: ['change', 'showSizeChange', 'update:current', 'update:pageSize'],
  setup(props, { slots, attrs }) {
    const { prefixCls, configProvider, direction, size } = useConfigInject('pagination', props);

    // style
    const [wrapSSR, hashId] = useStyle(prefixCls);

    const selectPrefixCls = computed(() =>
      configProvider.getPrefixCls('select', props.selectPrefixCls),
    );
    const breakpoint = useBreakpoint();
    const [locale] = useLocaleReceiver('Pagination', enUS, toRef(props, 'locale'));
    const getIconsProps = (pre: string) => {
      const ellipsis = <span class={`${pre}-item-ellipsis`}>•••</span>;
      const prevIcon = (
        <button class={`${pre}-item-link`} type="button" tabindex={-1}>
          {direction.value === 'rtl' ? <RightOutlined /> : <LeftOutlined />}
        </button>
      );
      const nextIcon = (
        <button class={`${pre}-item-link`} type="button" tabindex={-1}>
          {direction.value === 'rtl' ? <LeftOutlined /> : <RightOutlined />}
        </button>
      );
      const jumpPrevIcon = (
        <a rel="nofollow" class={`${pre}-item-link`}>
          <div class={`${pre}-item-container`}>
            {direction.value === 'rtl' ? (
              <DoubleRightOutlined class={`${pre}-item-link-icon`} />
            ) : (
              <DoubleLeftOutlined class={`${pre}-item-link-icon`} />
            )}
            {ellipsis}
          </div>
        </a>
      );
      const jumpNextIcon = (
        <a rel="nofollow" class={`${pre}-item-link`}>
          <div class={`${pre}-item-container`}>
            {direction.value === 'rtl' ? (
              <DoubleLeftOutlined class={`${pre}-item-link-icon`} />
            ) : (
              <DoubleRightOutlined class={`${pre}-item-link-icon`} />
            )}
            {ellipsis}
          </div>
        </a>
      );
      return { prevIcon, nextIcon, jumpPrevIcon, jumpNextIcon };
    };

    // ========== Agent API ===========

    const getPaginationStatus = () => {
      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }
      const currentPage = props.current || props.defaultCurrent || 1;
      const pageSize = props.pageSize || props.defaultPageSize || 10;
      const total = props.total || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: { currentPage, pageSize, total, totalPages },
      };
    };

    const navigateTo = (page: number | string) => {
      const { currentPage, pageSize, totalPages } = getPaginationStatus().data;

      if (props.disabled) {
        return {
          error: {
            code: 'COMPONENT_DISABLED',
          },
        };
      }

      let targetPage: number;

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
              error: `Invalid page: ${page}`,
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
            message: `Page ${targetPage} is out of range (1-${totalPages})`,
          },
        };
      }

      // 如果已经在目标页，直接返回
      if (targetPage === currentPage) {
        return {
          success: true,
          data: { currentPage: targetPage, message: 'Already on target page' },
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
        totalPages,
      };
    };

    const apiAttrs = shallowRef<any>({});
    onMounted(() => {
      if (typeof window !== 'undefined' && window.__ci4a__) {
        apiAttrs.value = window.__ci4a__.register('pagination', {
          getPaginationStatus: {
            handler: getPaginationStatus,
            description:
              'Get the current status of the pagination component, including current page, page size, and total pages.',
          },
          navigateTo: {
            handler: navigateTo,
            description: 'Navigate to a specific page.',
            params: [
              {
                name: 'page',
                type: 'number',
                required: true,
                description: 'The page number or keyword (next, prev, first, last) to navigate to.',
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
      const {
        itemRender = slots.itemRender,
        buildOptionText = slots.buildOptionText,
        selectComponentClass,
        responsive,
        ...restProps
      } = props;

      const isSmall =
        size.value === 'small' || !!(breakpoint.value?.xs && !size.value && responsive);
      const paginationProps = {
        ...restProps,
        ...getIconsProps(prefixCls.value),
        prefixCls: prefixCls.value,
        selectPrefixCls: selectPrefixCls.value,
        selectComponentClass: selectComponentClass || (isSmall ? MiniSelect : MiddleSelect),
        locale: locale.value,
        buildOptionText,
        ...attrs,
        class: classNames(
          {
            [`${prefixCls.value}-mini`]: isSmall,
            [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          },
          attrs.class,
          hashId.value,
        ),
        itemRender,
      };

      return wrapSSR(<VcPagination {...paginationProps} {...apiAttrs.value} />);
    };
  },
});
