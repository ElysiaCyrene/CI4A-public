require("../../../_virtual/_rolldown/runtime.js");
const require_index = require("../../../hooks/use-locale/index.js");
const require_index$1 = require("../../../hooks/use-namespace/index.js");
const require_use_agent_api = require("../../../hooks/use-agent-api.js");
const require_breadcrumb = require("./breadcrumb.js");
const require_constants = require("./constants.js");
let vue = require("vue");
//#region ../../packages/components/breadcrumb/src/breadcrumb.vue?vue&type=script&setup=true&lang.ts
const _hoisted_1 = ["aria-label"];
var breadcrumb_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ (0, vue.defineComponent)({
	name: "ElBreadcrumb",
	__name: "breadcrumb",
	props: require_breadcrumb.breadcrumbProps,
	setup(__props) {
		const { t } = require_index.useLocale();
		const props = __props;
		const ns = require_index$1.useNamespace("breadcrumb");
		const breadcrumb = (0, vue.ref)();
		(0, vue.provide)(require_constants.breadcrumbKey, props);
		(0, vue.onMounted)(() => {
			const items = breadcrumb.value.querySelectorAll(`.${ns.e("item")}`);
			if (items.length) items[items.length - 1].setAttribute("aria-current", "page");
		});
		const apiAttrs = require_use_agent_api.useAgentApi("breadcrumb", {
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
			return (0, vue.openBlock)(), (0, vue.createElementBlock)("div", (0, vue.mergeProps)((0, vue.unref)(apiAttrs), {
				ref_key: "breadcrumb",
				ref: breadcrumb,
				class: (0, vue.unref)(ns).b(),
				"aria-label": (0, vue.unref)(t)("el.breadcrumb.label"),
				role: "navigation"
			}), [(0, vue.renderSlot)(_ctx.$slots, "default")], 16, _hoisted_1);
		};
	}
});
//#endregion
exports.default = breadcrumb_vue_vue_type_script_setup_true_lang_default;

//# sourceMappingURL=breadcrumb.vue_vue_type_script_setup_true_lang.js.map