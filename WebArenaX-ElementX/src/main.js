import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.css'
import App from './App.vue'

// ── CI4A AgentApiRegistry bootstrap ──────────────────────────
// Must run BEFORE any Element Plus component loads, because each
// component calls window.__ci4a__.register() at onMounted.
// We inline the registry here because Vite's pre-bundler drops
// the side-effect import from element-plus/es/utils/AgentApiRegistry.mjs.

class ApiComponentRegistry {
  constructor() {
    this.components = new Map()
    this.timestamp = 0
  }
  generateUniqueId() {
    this.timestamp += 1
    return this.timestamp.toString(36)
  }
  register(component, actions) {
    const id = `${component}_${this.generateUniqueId()}`
    this.components.set(id, { id, component, actions })
    return { 'data-cid': id }
  }
  unregister(id) {
    this.components.delete(id)
  }
  getById(id) {
    return this.components.get(id)
  }
  getAll() {
    return Array.from(this.components.values())
  }
  async call(id, actionName, params) {
    try {
      const cap = this.getById(id)
      if (!cap) {
        return {
          success: false,
          error: { code: 'COMPONENT_NOT_FOUND', message: `Component not found: ${id}` },
          metadata: { componentId: id, actionName, timestamp: Date.now() },
        }
      }
      const action = cap.actions[actionName]
      if (!action) {
        return {
          success: false,
          error: {
            code: 'ACTION_NOT_FOUND',
            message: `Action "${actionName}" not found on ${cap.component}`,
            details: { availableActions: Object.keys(cap.actions) },
          },
          metadata: { componentId: id, actionName, timestamp: Date.now() },
        }
      }
      let handlerArgs = []
      if (Array.isArray(params)) {
        handlerArgs = params
      } else if (params && typeof params === 'object') {
        if (action.params && action.params.length > 0) {
          handlerArgs = action.params.map((p) => params[p.name])
        } else {
          handlerArgs = [params]
        }
      }
      const result = await action.handler(...handlerArgs)
      if (result?.error) {
        return {
          success: false,
          error: result.error,
          metadata: { componentId: id, actionName, timestamp: Date.now() },
        }
      }
      return {
        success: true,
        data: result?.data,
        metadata: { componentId: id, actionName, timestamp: Date.now() },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        metadata: { componentId: id, actionName, timestamp: Date.now() },
      }
    }
  }
  exportSchema() {
    return Array.from(this.components.values()).map((cap) => ({
      componentId: cap.id,
      componentType: cap.component,
      actions: Object.entries(cap.actions).map(([name, action]) => ({
        name,
        description: action.description,
        params: action.params,
      })),
    }))
  }
}

if (typeof window !== 'undefined' && !window.__ci4a__) {
  window.__ci4a__ = new ApiComponentRegistry()
}
// Also ensure the built module's side-effect runs (belt + suspenders)
import 'element-plus/es/utils/AgentApiRegistry.mjs'
// ──────────────────────────────────────────────────────────────

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
