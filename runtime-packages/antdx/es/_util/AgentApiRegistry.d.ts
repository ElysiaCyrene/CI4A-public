export declare enum APIErrorCode {
    COMPONENT_NOT_FOUND = "COMPONENT_NOT_FOUND",
    ACTION_NOT_FOUND = "ACTION_NOT_FOUND",
    COMPONENT_DISABLED = "COMPONENT_DISABLED",
    EXECUTION_ERROR = "EXECUTION_ERROR",
    PERMISSION_DENIED = "PERMISSION_DENIED"
}
export interface APIError {
    code: APIErrorCode;
    message: string;
    details?: any;
}
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: APIError;
    metadata?: {
        componentId?: string;
        actionName?: string;
        timestamp?: number;
    };
}
export interface APIAction {
    handler: (...args: any[]) => any | Promise<any>;
    description?: string;
    params?: Array<{
        name: string;
        type: string;
        required?: boolean;
        description?: string;
    }>;
}
export interface APIComponent {
    id: string;
    component: string;
    actions: Record<string, APIAction>;
}
export declare class ApiComponentRegistry {
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
    exportSchema(): any[];
}
declare global {
    interface Window {
        __ci4a__?: ApiComponentRegistry;
    }
}
