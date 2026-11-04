import '../utils/AgentApiRegistry.mjs';
import { onMounted, onUnmounted, shallowRef } from "vue";
//#region ../../packages/hooks/use-agent-api.ts
function useAgentApi(componentType, actions) {
	const apiAttrs = shallowRef({});
	onMounted(() => {
		if (typeof window !== "undefined" && window.__ci4a__) apiAttrs.value = window.__ci4a__.register(componentType, actions);
	});
	onUnmounted(() => {
		if (apiAttrs.value && window.__ci4a__) window.__ci4a__.unregister(apiAttrs.value["data-cid"]);
	});
	return apiAttrs;
}
//#endregion
export { useAgentApi };

//# sourceMappingURL=use-agent-api.mjs.map