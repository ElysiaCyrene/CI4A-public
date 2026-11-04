export enum APIErrorCode {
  COMPONENT_NOT_FOUND = 'COMPONENT_NOT_FOUND',
  ACTION_NOT_FOUND = 'ACTION_NOT_FOUND',
  COMPONENT_DISABLED = 'COMPONENT_DISABLED',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
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

export class ApiComponentRegistry {
  private components = new Map<string, APIComponent>();

  private timestamp = 0;

  private generateUniqueId() {
    this.timestamp += 1;
    return this.timestamp.toString(36);
  }

  register(component: string, actions: Record<string, APIAction>) {
    const id = `${component}_${this.generateUniqueId()}`;
    const cap: APIComponent = {
      id,
      component,
      actions,
    };
    this.components.set(cap.id, cap);
    return {
      'data-cid': cap.id,
    };
  }

  unregister(id: string) {
    this.components.delete(id);
  }

  getById(id: string): APIComponent | undefined {
    return this.components.get(id);
  }

  getAll(): APIComponent[] {
    return Array.from(this.components.values());
  }

  async call(
    id: string,
    actionName: string,
    params?: Record<string, any> | any[],
  ): Promise<APIResponse> {
    try {
      const cap = this.getById(id);
      if (!cap) {
        return {
          success: false,
          error: {
            code: APIErrorCode.COMPONENT_NOT_FOUND,
            message: `APIComponent not found: ${id}`,
          },
          metadata: {
            componentId: id,
            actionName,
            timestamp: Date.now(),
          },
        };
      }

      const action = cap.actions[actionName];
      if (!action) {
        return {
          success: false,
          error: {
            code: APIErrorCode.ACTION_NOT_FOUND,
            message: `Action "${actionName}" not found on component ${cap.component}`,
            details: {
              availableActions: Object.keys(cap.actions),
            },
          },
          metadata: {
            componentId: id,
            actionName,
            timestamp: Date.now(),
          },
        };
      }

      let handlerArgs: any[] = [];
      if (Array.isArray(params)) {
        handlerArgs = params;
      } else if (params && typeof params === 'object') {
        if (action.params && action.params.length > 0) {
          handlerArgs = action.params.map(p => (params as Record<string, any>)[p.name]);
        } else {
          handlerArgs = [params];
        }
      } else {
        handlerArgs = [];
      }

      const result = await action.handler(...handlerArgs);
      if (result?.error) {
        if (result?.error.code === APIErrorCode.COMPONENT_DISABLED) {
          return {
            success: false,
            error: {
              code: APIErrorCode.COMPONENT_DISABLED,
              message: `Component ${cap.component} is disabled.`,
            },
            metadata: {
              componentId: id,
              actionName,
              timestamp: Date.now(),
            },
          };
        } else if (result?.error.code === APIErrorCode.PERMISSION_DENIED) {
          return {
            success: false,
            error: {
              code: APIErrorCode.PERMISSION_DENIED,
              message: `Permission denied for action "${actionName}" on component ${cap.component}.`,
            },
            metadata: {
              componentId: id,
              actionName,
              timestamp: Date.now(),
            },
          };
        } else if (result.error) {
          return {
            success: false,
            error: result.error,
            metadata: {
              componentId: id,
              actionName,
              timestamp: Date.now(),
            },
          };
        }
      }
      return {
        success: true,
        data: result?.data,
        metadata: {
          componentId: id,
          actionName,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: APIErrorCode.EXECUTION_ERROR,
          message: error instanceof Error ? error.message : 'Unknown execution error',
          details: {
            stack: error instanceof Error ? error.stack : undefined,
          },
        },
        metadata: {
          componentId: id,
          actionName,
          timestamp: Date.now(),
        },
      };
    }
  }

  exportSchema() {
    const schema: any[] = [];

    for (const cap of this.components.values()) {
      const actions = Object.entries(cap.actions).map(([name, action]) => ({
        name,
        description: action.description,
        params: action.params,
      }));

      schema.push({
        componentId: cap.id,
        componentType: cap.component,
        actions,
      });
    }

    return schema;
  }
}

declare global {
  interface Window {
    __ci4a__?: ApiComponentRegistry;
  }
}

if (typeof window !== 'undefined' && !window.__ci4a__) {
  window.__ci4a__ = new ApiComponentRegistry();
}
