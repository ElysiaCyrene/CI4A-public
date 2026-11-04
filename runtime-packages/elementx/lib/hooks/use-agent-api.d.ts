import { APIAction } from "../utils/AgentApiRegistry.js";
import * as _$vue from "vue";

//#region ../../packages/hooks/use-agent-api.d.ts
declare function useAgentApi(componentType: string, actions: Record<string, APIAction>): _$vue.ShallowRef<Record<string, any>, Record<string, any>>;
//#endregion
export { useAgentApi };