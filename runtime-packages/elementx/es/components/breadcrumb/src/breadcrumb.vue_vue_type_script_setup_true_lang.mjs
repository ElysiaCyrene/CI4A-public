import { useLocale } from "../../../hooks/use-locale/index.mjs";
import { useNamespace } from "../../../hooks/use-namespace/index.mjs";
import { useAgentApi } from "../../../hooks/use-agent-api.mjs";
import { breadcrumbProps } from "./breadcrumb.mjs";
import { breadcrumbKey } from "./constants.mjs";
import { createElementBlock, defineComponent, mergeProps, onMounted, openBlock, provide, ref, renderSlot, unref } from "vue";
//#region ../../packages/components/breadcrumb/src/breadcrumb.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = ["aria-label"];
var breadcrumb_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	name: "ElBreadcrumb",
	__name: "breadcrumb",
	props: breadcrumbProps,
	setup(__props) {
		const { t } = useLocale();
		const props = __props;
		const ns = useNamespace("breadcrumb");
		const breadcrumb = ref();
		provide(breadcrumbKey, props);
		onMounted(() => {
			const items = breadcrumb.value.querySelectorAll(`.${ns.e("item")}`);
			if (items.length) items[items.length - 1].setAttribute("aria-current", "page");
		});
		const apiAttrs = useAgentApi("breadcrumb", {
			getBreadcrumbStatus: {
				handler: () => {
					const items = [];
					if (breadcrumbRef.value?.children) Array.from(breadcrumbRef.value.children).forEach((el, idx) => {
						const text = el.textContent?.trim();
						const link = el.querySelector("a");
						if (text) items.push({
							key: String(idx),
							text,
							href: link?.getAttribute("href") || null
						});
					});
					return { data: { items } };
				},
				description: "Get breadcrumb items with key (for navigateTo) and text.",
				params: []
			},
			navigateTo: {
				handler: (key) => {
					if (!breadcrumbRef.value?.children) return { error: {
						code: "NO_ITEMS",
						message: "No breadcrumb items."
					} };
					const children = Array.from(breadcrumbRef.value.children);
					const idx = Number.parseInt(key, 10);
					let target = null;
					if (!Number.isNaN(idx) && idx >= 0 && idx < children.length) target = children[idx];
					if (!target) return { error: {
						code: "ITEM_NOT_FOUND",
						message: `Breadcrumb "${key}" not found. Use key from getBreadcrumbStatus items[].key.`
					} };
					const link = target.querySelector("a");
					if (link) {
						link.click();
						return { data: {
							key,
							text: target.textContent?.trim(),
							href: link.getAttribute("href")
						} };
					}
					target.click?.();
					return { data: {
						key,
						text: target.textContent?.trim()
					} };
				},
				description: "Navigate to breadcrumb item by key (from getBreadcrumbStatus items[].key).",
				params: [{
					name: "key",
					type: "string",
					required: true,
					description: "Item key from getBreadcrumbStatus items[].key."
				}]
			}
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", mergeProps(unref(apiAttrs), {
				ref_key: "breadcrumb",
				ref: breadcrumb,
				class: unref(ns).b(),
				"aria-label": unref(t)("el.breadcrumb.label"),
				role: "navigation"
			}), [renderSlot(_ctx.$slots, "default")], 16, _hoisted_1);
		};
	}
});
//#endregion
export { breadcrumb_vue_vue_type_script_setup_true_lang_default as default };

//# sourceMappingURL=breadcrumb.vue_vue_type_script_setup_true_lang.mjs.map