//#region ../../packages/utils/AgentApiRegistry.d.ts
declare enum APIErrorCode {
  COMPONENT_NOT_FOUND = "COMPONENT_NOT_FOUND",
  ACTION_NOT_FOUND = "ACTION_NOT_FOUND",
  COMPONENT_DISABLED = "COMPONENT_DISABLED",
  EXECUTION_ERROR = "EXECUTION_ERROR",
  PERMISSION_DENIED = "PERMISSION_DENIED"
}
interface APIError {
  code: APIErrorCode;
  message: string;
  details?: any;
}
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    componentId?: string;
    actionName?: string;
    timestamp?: number;
  };
}
interface APIAction {
  handler: (...args: any[]) => any | Promise<any>;
  description?: string;
  params?: Array<{
    name: string;
    type: string;
    required?: boolean;
    description?: string;
  }>;
}
interface APIComponent {
  id: string;
  component: string;
  actions: Record<string, APIAction>;
}
declare class ApiComponentRegistry {
  private components;
  private timestamp;
  private generateUniqueId;
  register(component: string, actions: Record<string, APIAction>): {
    'data-cid': string;
  };
  unregister(id: string): void;
  getById(id: string): APIComponent | undefined;
  getAll(): APIComponent[];
  call(id: string, actionName: string, params?: Record<string, any> | any[]): Promise<APIResponse>;
  exportSchema(): {
    componentId: string;
    componentType: string;
    actions: {
      name: string;
      description: string | undefined;
      params: {
        name: string;
        type: string;
        required?: boolean;
        description?: string;
      }[] | undefined;
    }[];
  }[];
}
declare global {
  interface Window {
    __ci4a__?: ApiComponentRegistry;
  }
}
//#endregion
export { APIAction, APIComponent, APIError, APIErrorCode, APIResponse, ApiComponentRegistry };