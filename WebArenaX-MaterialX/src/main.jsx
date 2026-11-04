import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// ── Magento 橙色主题 ──
const theme = createTheme({
  palette: {
    primary: {
      main: '#eb5202',
      dark: '#d44902',
      contrastText: '#fff',
    },
    background: {
      default: '#f4f4f4',
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

// ── CI4A AgentApiRegistry bootstrap ──────────────────────────
// Must run BEFORE any MUI component loads, because each component
// calls window.__ci4a__.register() at module init time.
// We inline the registry here because Vite's pre-bundler drops
// the side-effect import from @mui/material/src/index.js.

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
    this.components.set(id, { id, component, actions });
    return { 'data-cid': id };
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
      if (!cap) {
        return {
          success: false,
          error: { code: 'COMPONENT_NOT_FOUND', message: `Component not found: ${id}` },
          metadata: { componentId: id, actionName, timestamp: Date.now() },
        };
      }
      const action = cap.actions[actionName];
      if (!action) {
        return {
          success: false,
          error: {
            code: 'ACTION_NOT_FOUND',
            message: `Action "${actionName}" not found on ${cap.component}`,
            details: { availableActions: Object.keys(cap.actions) },
          },
          metadata: { componentId: id, actionName, timestamp: Date.now() },
        };
      }
      let handlerArgs = [];
      if (Array.isArray(params)) {
        handlerArgs = params;
      } else if (params && typeof params === 'object') {
        if (action.params && action.params.length > 0) {
          handlerArgs = action.params.map((p) => params[p.name]);
        } else {
          handlerArgs = [params];
        }
      }
      const result = await action.handler(...handlerArgs);
      if (result?.error) {
        return {
          success: false,
          error: result.error,
          metadata: { componentId: id, actionName, timestamp: Date.now() },
        };
      }
      return {
        success: true,
        data: result?.data,
        metadata: { componentId: id, actionName, timestamp: Date.now() },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        metadata: { componentId: id, actionName, timestamp: Date.now() },
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
        params: action.params,
      })),
    }));
  }
}

if (typeof window !== 'undefined' && !window.__ci4a__) {
  window.__ci4a__ = new ApiComponentRegistry();
}
// ──────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
