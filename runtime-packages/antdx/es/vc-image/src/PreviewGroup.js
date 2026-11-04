import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
var __rest = this && this.__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
import { ref, shallowRef, provide, defineComponent, inject, watch, reactive, computed, watchEffect, Fragment as _Fragment, createVNode as _createVNode } from 'vue';
import { mergeDefaultValue } from './Image';
import Preview from './Preview';
import useMergedState from '../../_util/hooks/useMergedState';
const previewGroupContext = Symbol('previewGroupContext');
export const context = {
  provide: val => {
    provide(previewGroupContext, val);
  },
  inject: () => {
    return inject(previewGroupContext, {
      isPreviewGroup: shallowRef(false),
      previewUrls: computed(() => new Map()),
      setPreviewUrls: () => {},
      current: ref(null),
      setCurrent: () => {},
      setShowPreview: () => {},
      setMousePosition: () => {},
      registerImage: null,
      rootClassName: ''
    });
  }
};
export const imageGroupProps = () => ({
  previewPrefixCls: String,
  preview: {
    type: [Boolean, Object],
    default: true
  },
  icons: {
    type: Object,
    default: () => ({})
  }
});
const Group = defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'PreviewGroup',
  inheritAttrs: false,
  props: imageGroupProps(),
  setup(props, {
    slots
  }) {
    const preview = computed(() => {
      const defaultValues = {
        visible: undefined,
        onVisibleChange: () => {},
        getContainer: undefined,
        current: 0
      };
      return typeof props.preview === 'object' ? mergeDefaultValue(props.preview, defaultValues) : defaultValues;
    });
    const previewUrls = reactive(new Map());
    const current = ref();
    const previewVisible = computed(() => preview.value.visible);
    const getPreviewContainer = computed(() => preview.value.getContainer);
    const onPreviewVisibleChange = (val, preval) => {
      var _a, _b;
      (_b = (_a = preview.value).onVisibleChange) === null || _b === void 0 ? void 0 : _b.call(_a, val, preval);
    };
    const [isShowPreview, setShowPreview] = useMergedState(!!previewVisible.value, {
      value: previewVisible,
      onChange: onPreviewVisibleChange
    });
    const mousePosition = ref(null);
    const isControlled = computed(() => previewVisible.value !== undefined);
    const previewUrlsKeys = computed(() => Array.from(previewUrls.keys()));
    const currentControlledKey = computed(() => previewUrlsKeys.value[preview.value.current]);
    const canPreviewUrls = computed(() => new Map(Array.from(previewUrls).filter(([, {
      canPreview
    }]) => !!canPreview).map(([id, {
      url
    }]) => [id, url])));
    const setPreviewUrls = (id, url, canPreview = true) => {
      previewUrls.set(id, {
        url,
        canPreview
      });
    };
    const setCurrent = val => {
      current.value = val;
    };
    const setMousePosition = val => {
      mousePosition.value = val;
    };
    const registerImage = (id, url, canPreview = true) => {
      const unRegister = () => {
        previewUrls.delete(id);
      };
      previewUrls.set(id, {
        url,
        canPreview
      });
      return unRegister;
    };
    const onPreviewClose = e => {
      e === null || e === void 0 ? void 0 : e.stopPropagation();
      setShowPreview(false);
      setMousePosition(null);
    };
    watch(currentControlledKey, val => {
      setCurrent(val);
    }, {
      immediate: true,
      flush: 'post'
    });
    watchEffect(() => {
      if (isShowPreview.value && isControlled.value) {
        setCurrent(currentControlledKey.value);
      }
    }, {
      flush: 'post'
    });
    context.provide({
      isPreviewGroup: shallowRef(true),
      previewUrls: canPreviewUrls,
      setPreviewUrls,
      current,
      setCurrent,
      setShowPreview,
      setMousePosition,
      registerImage
    });
    return () => {
      const dialogProps = __rest(preview.value, []);
      return _createVNode(_Fragment, null, [slots.default && slots.default(), _createVNode(Preview, _objectSpread(_objectSpread({}, dialogProps), {}, {
        "ria-hidden": !isShowPreview.value,
        "visible": isShowPreview.value,
        "prefixCls": props.previewPrefixCls,
        "onClose": onPreviewClose,
        "mousePosition": mousePosition.value,
        "src": canPreviewUrls.value.get(current.value),
        "icons": props.icons,
        "getContainer": getPreviewContainer.value
      }), null)]);
    };
  }
});
export default Group;