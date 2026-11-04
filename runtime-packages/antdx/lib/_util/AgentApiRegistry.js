"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApiComponentRegistry = exports.APIErrorCode = void 0;
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var APIErrorCode;
(function (APIErrorCode) {
  APIErrorCode["COMPONENT_NOT_FOUND"] = "COMPONENT_NOT_FOUND";
  APIErrorCode["ACTION_NOT_FOUND"] = "ACTION_NOT_FOUND";
  APIErrorCode["COMPONENT_DISABLED"] = "COMPONENT_DISABLED";
  APIErrorCode["EXECUTION_ERROR"] = "EXECUTION_ERROR";
  APIErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
})(APIErrorCode || (exports.APIErrorCode = APIErrorCode = {}));
class ApiComponentRegistry {
  constructor() {
    this.components = new Map();
    this.timestamp = 0;
  }
  generateUniqueId() {
    this.timestamp += 1;
    return this.timestamp.toString(36);
  }
  register(component, actions) {
    const id = `${component}_${this.generateUniqueId()}`;
    const cap = {
      id,
      component,
      actions
    };
    this.components.set(cap.id, cap);
    return {
      'data-cid': cap.id
    };
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
  call(id, actionName, params) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const cap = this.getById(id);
        if (!cap) {
          return {
            success: false,
            error: {
              code: APIErrorCode.COMPONENT_NOT_FOUND,
              message: `APIComponent not found: ${id}`
            },
            metadata: {
              componentId: id,
              actionName,
              timestamp: Date.now()
            }
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
                availableActions: Object.keys(cap.actions)
              }
            },
            metadata: {
              componentId: id,
              actionName,
              timestamp: Date.now()
            }
          };
        }
        let handlerArgs = [];
        if (Array.isArray(params)) {
          handlerArgs = params;
        } else if (params && typeof params === 'object') {
          if (action.params && action.params.length > 0) {
            handlerArgs = action.params.map(p => params[p.name]);
          } else {
            handlerArgs = [params];
          }
        } else {
          handlerArgs = [];
        }
        const result = yield action.handler(...handlerArgs);
        if (result === null || result === void 0 ? void 0 : result.error) {
          if ((result === null || result === void 0 ? void 0 : result.error.code) === APIErrorCode.COMPONENT_DISABLED) {
            return {
              success: false,
              error: {
                code: APIErrorCode.COMPONENT_DISABLED,
                message: `Component ${cap.component} is disabled.`
              },
              metadata: {
                componentId: id,
                actionName,
                timestamp: Date.now()
              }
            };
          } else if ((result === null || result === void 0 ? void 0 : result.error.code) === APIErrorCode.PERMISSION_DENIED) {
            return {
              success: false,
              error: {
                code: APIErrorCode.PERMISSION_DENIED,
                message: `Permission denied for action "${actionName}" on component ${cap.component}.`
              },
              metadata: {
                componentId: id,
                actionName,
                timestamp: Date.now()
              }
            };
          } else if (result.error) {
            return {
              success: false,
              error: result.error,
              metadata: {
                componentId: id,
                actionName,
                timestamp: Date.now()
              }
            };
          }
        }
        return {
          success: true,
          data: result === null || result === void 0 ? void 0 : result.data,
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
            code: APIErrorCode.EXECUTION_ERROR,
            message: error instanceof Error ? error.message : 'Unknown execution error',
            details: {
              stack: error instanceof Error ? error.stack : undefined
            }
          },
          metadata: {
            componentId: id,
            actionName,
            timestamp: Date.now()
          }
        };
      }
    });
  }
  exportSchema() {
    const schema = [];
    for (const cap of this.components.values()) {
      const actions = Object.entries(cap.actions).map(([name, action]) => ({
        name,
        description: action.description,
        params: action.params
      }));
      schema.push({
        componentId: cap.id,
        componentType: cap.component,
        actions
      });
    }
    return schema;
  }
}
exports.ApiComponentRegistry = ApiComponentRegistry;
if (typeof window !== 'undefined' && !window.__ci4a__) {
  window.__ci4a__ = new ApiComponentRegistry();
}