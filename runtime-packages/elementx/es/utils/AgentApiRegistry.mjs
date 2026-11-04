//#region ../../packages/utils/AgentApiRegistry.ts
let APIErrorCode = /* @__PURE__ */ function(APIErrorCode) {
	APIErrorCode["COMPONENT_NOT_FOUND"] = "COMPONENT_NOT_FOUND";
	APIErrorCode["ACTION_NOT_FOUND"] = "ACTION_NOT_FOUND";
	APIErrorCode["COMPONENT_DISABLED"] = "COMPONENT_DISABLED";
	APIErrorCode["EXECUTION_ERROR"] = "EXECUTION_ERROR";
	APIErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
	return APIErrorCode;
}({});
var ApiComponentRegistry = class {
	constructor() {
		this.components = /* @__PURE__ */ new Map();
		this.timestamp = 0;
	}
	generateUniqueId() {
		this.timestamp += 1;
		return this.timestamp.toString(36);
	}
	register(component, actions) {
		const cap = {
			id: `${component}_${this.generateUniqueId()}`,
			component,
			actions
		};
		this.components.set(cap.id, cap);
		return { "data-cid": cap.id };
	}
	unregister(id) {
		this.components.delete(id);
	}
	getById(id) {
		return this.components.get(id);
	}
	getAll() {
		return Array.from(this.components.values());
	}
	async call(id, actionName, params) {
		try {
			const cap = this.getById(id);
			if (!cap) return {
				success: false,
				error: {
					code: "COMPONENT_NOT_FOUND",
					message: `Component not found: ${id}`
				},
				metadata: {
					componentId: id,
					actionName,
					timestamp: Date.now()
				}
			};
			const action = cap.actions[actionName];
			if (!action) return {
				success: false,
				error: {
					code: "ACTION_NOT_FOUND",
					message: `Action "${actionName}" not found on component ${cap.component}`,
					details: { availableActions: Object.keys(cap.actions) }
				},
				metadata: {
					componentId: id,
					actionName,
					timestamp: Date.now()
				}
			};
			let handlerArgs = [];
			if (Array.isArray(params)) handlerArgs = params;
			else if (params && typeof params === "object") if (action.params && action.params.length > 0) handlerArgs = action.params.map((p) => params[p.name]);
			else handlerArgs = [params];
			const result = await action.handler(...handlerArgs);
			if (result?.error) return {
				success: false,
				error: result.error,
				metadata: {
					componentId: id,
					actionName,
					timestamp: Date.now()
				}
			};
			return {
				success: true,
				data: result?.data,
				metadata: {
					componentId: id,
					actionName,
					timestamp: Date.now()
				}
			};
		} catch (error) {
			return {
				success: false,
				error: {
					code: "EXECUTION_ERROR",
					message: error instanceof Error ? error.message : "Unknown execution error"
				},
				metadata: {
					componentId: id,
					actionName,
					timestamp: Date.now()
				}
			};
		}
	}
	exportSchema() {
		return Array.from(this.components.values()).map((cap) => ({
			componentId: cap.id,
			componentType: cap.component,
			actions: Object.entries(cap.actions).map(([name, action]) => ({
				name,
				description: action.description,
				params: action.params
			}))
		}));
	}
};
if (typeof window !== "undefined" && !window.__ci4a__) window.__ci4a__ = new ApiComponentRegistry();
//#endregion
export { APIErrorCode, ApiComponentRegistry };

//# sourceMappingURL=AgentApiRegistry.mjs.map