require('../utils/AgentApiRegistry.js');
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
require("../_virtual/_rolldown/runtime.js");
let vue = require("vue");
//#region ../../packages/hooks/use-agent-api.ts
function useAgentApi(componentType, actions) {
	const apiAttrs = (0, vue.shallowRef)({});
	(0, vue.onMounted)(() => {
		if (typeof window !== "undefined" && window.__ci4a__) apiAttrs.value = window.__ci4a__.register(componentType, actions);
	});
	(0, vue.onUnmounted)(() => {
		if (apiAttrs.value && window.__ci4a__) window.__ci4a__.unregister(apiAttrs.value["data-cid"]);
	});
	return apiAttrs;
}
//#endregion
exports.useAgentApi = useAgentApi;

//# sourceMappingURL=use-agent-api.js.map