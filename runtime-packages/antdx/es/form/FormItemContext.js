import { watch, computed, inject, provide, ref, onBeforeUnmount, getCurrentInstance, defineComponent } from 'vue';
import devWarning from '../vc-util/devWarning';
import createContext from '../_util/createContext';
const ContextKey = Symbol('ContextProps');
const InternalContextKey = Symbol('InternalContextProps');
export const useProvideFormItemContext = (props, useValidation = computed(() => true)) => {
  const formItemFields = ref(new Map());
  const addFormItemField = (key, type) => {
    formItemFields.value.set(key, type);
    formItemFields.value = new Map(formItemFields.value);
  };
  const removeFormItemField = key => {
    formItemFields.value.delete(key);
    formItemFields.value = new Map(formItemFields.value);
  };
  const instance = getCurrentInstance();
  watch([useValidation, formItemFields], () => {
    if (process.env.NODE_ENV !== 'production') {
      if (useValidation.value && formItemFields.value.size > 1) {
        devWarning(false, 'Form.Item', `FormItem can only collect one field item, you haved set ${[...formItemFields.value.values()].map(v => `\`${v.name}\``).join(', ')} ${formItemFields.value.size} field items.
        You can set not need to be collected fields into \`a-form-item-rest\``);
        let cur = instance;
        while (cur.parent) {
          console.warn('at', cur.type);
          cur = cur.parent;
        }
      }
    }
  });
  provide(ContextKey, props);
  provide(InternalContextKey, {
    addFormItemField,
    removeFormItemField
  });
};
const defaultContext = {
  id: computed(() => undefined),
  onFieldBlur: () => {},
  onFieldChange: () => {},
  clearValidate: () => {}
};
const defaultInternalContext = {
  addFormItemField: () => {},
  removeFormItemField: () => {}
};
export const useInjectFormItemContext = () => {
  const internalContext = inject(InternalContextKey, defaultInternalContext);
  const formItemFieldKey = Symbol('FormItemFieldKey');
  const instance = getCurrentInstance();
  internalContext.addFormItemField(formItemFieldKey, instance.type);
  onBeforeUnmount(() => {
    internalContext.removeFormItemField(formItemFieldKey);
  });
  // We should prevent the passing of context for children
  provide(InternalContextKey, defaultInternalContext);
  provide(ContextKey, defaultContext);
  return inject(ContextKey, defaultContext);
};
export default defineComponent({
  compatConfig: {
    MODE: 3
  },
  name: 'AFormItemRest',
  setup(_, {
    slots
  }) {
    provide(InternalContextKey, defaultInternalContext);
    provide(ContextKey, defaultContext);
    return () => {
      var _a;
      return (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots);
    };
  }
});
export const FormItemInputContext = createContext({});
export const NoFormStatus = defineComponent({
  name: 'NoFormStatus',
  setup(_, {
    slots
  }) {
    FormItemInputContext.useProvide({});
    return () => {
      var _a;
      return (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots);
    };
  }
});