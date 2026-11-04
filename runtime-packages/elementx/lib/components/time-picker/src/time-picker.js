const require_runtime = require("../../../_virtual/_rolldown/runtime.js");
const require_event = require("../../../constants/event.js");
const require_constants = require("./constants.js");
const require_props = require("./common/props.js");
const require_picker = require("./common/picker.js");
const require_panel_time_pick = require("./time-picker-com/panel-time-pick.js");
const require_panel_time_range = require("./time-picker-com/panel-time-range.js");
let vue = require("vue");
let dayjs = require("dayjs");
dayjs = require_runtime.__toESM(dayjs);
let dayjs_plugin_customParseFormat_js = require("dayjs/plugin/customParseFormat.js");
dayjs_plugin_customParseFormat_js = require_runtime.__toESM(dayjs_plugin_customParseFormat_js);
//#region ../../packages/components/time-picker/src/time-picker.tsx
dayjs.default.extend(dayjs_plugin_customParseFormat_js.default);
var time_picker_default = /* @__PURE__ */ (0, vue.defineComponent)({
	name: "ElTimePicker",
	install: null,
	props: {
		...require_props.timePickerDefaultProps,
		/**
		* @description whether to pick a time range
		*/
		isRange: Boolean
	},
	emits: [require_event.UPDATE_MODEL_EVENT],
	setup(props, ctx) {
		const commonPicker = (0, vue.ref)();
		const [type, Panel] = props.isRange ? ["timerange", require_panel_time_range.default] : ["time", require_panel_time_pick.default];
		const modelUpdater = (value) => ctx.emit(require_event.UPDATE_MODEL_EVENT, value);
		(0, vue.provide)(require_constants.PICKER_POPPER_OPTIONS_INJECTION_KEY, props.popperOptions);
		const isRange = props.isRange;
		const apiAttrs = (0, vue.shallowRef)({});
		(0, vue.onMounted)(() => {
			if (typeof window !== "undefined" && window.__ci4a__) {
				const regName = isRange ? "timerangepicker" : "timepicker";
				apiAttrs.value = window.__ci4a__.register(regName, {
					getTimeStatus: {
						handler: () => ({ data: {
							value: props.modelValue,
							disabled: props.disabled,
							isRange,
							editable: props.editable ?? true,
							clearable: props.clearable ?? true,
							format: props.format || "HH:mm:ss",
							placeholder: props.placeholder || ""
						} }),
						description: "Get time picker status including format for setValue reference.",
						params: []
					},
					setTimeValue: {
						handler: (val) => {
							if (props.disabled) return { error: { code: "COMPONENT_DISABLED" } };
							ctx.emit(require_event.UPDATE_MODEL_EVENT, val);
							return { data: { value: val } };
						},
						description: "Set time value.",
						params: [{
							name: "value",
							type: "string|array",
							required: true
						}]
					}
				});
			}
		});
		(0, vue.onUnmounted)(() => {
			if (apiAttrs.value) window.__ci4a__?.unregister(apiAttrs.value["data-cid"]);
		});
		ctx.expose({
			/**
			* @description focus the Input component
			*/
			focus: () => {
				commonPicker.value?.focus();
			},
			/**
			* @description blur the Input component
			*/
			blur: () => {
				commonPicker.value?.blur();
			},
			/**
			* @description open the TimePicker popper
			*/
			handleOpen: () => {
				commonPicker.value?.handleOpen();
			},
			/**
			* @description close the TimePicker popper
			*/
			handleClose: () => {
				commonPicker.value?.handleClose();
			}
		});
		return () => {
			const format = props.format ?? "HH:mm:ss";
			return (0, vue.createVNode)("span", (0, vue.mergeProps)(apiAttrs.value, { "style": "display:inline-block" }), [(0, vue.createVNode)(require_picker.default, (0, vue.mergeProps)(props, {
				"ref": commonPicker,
				"type": type,
				"format": format,
				"onUpdate:modelValue": modelUpdater
			}), { default: (props) => (0, vue.createVNode)(Panel, props, null) })]);
		};
	}
});
//#endregion
exports.default = time_picker_default;

//# sourceMappingURL=time-picker.js.map