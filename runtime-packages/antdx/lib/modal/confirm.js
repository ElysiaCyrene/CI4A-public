"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.withConfirm = withConfirm;
exports.withError = withError;
exports.withInfo = withInfo;
exports.withSuccess = withSuccess;
exports.withWarn = withWarn;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _ConfirmDialog = _interopRequireDefault(require("./ConfirmDialog"));
var _configProvider = _interopRequireWildcard(require("../config-provider"));
var _omit = _interopRequireDefault(require("../_util/omit"));
var _vnode = require("../_util/vnode");
var _locale = require("./locale");
var _destroyFns = _interopRequireDefault(require("./destroyFns"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const confirm = config => {
  const container = document.createDocumentFragment();
  let currentConfig = (0, _extends2.default)((0, _extends2.default)({}, (0, _omit.default)(config, ['parentContext', 'appContext'])), {
    close,
    open: true
  });
  let confirmDialogInstance = null;
  function destroy(...args) {
    if (confirmDialogInstance) {
      // destroy
      (0, _vue.render)(null, container);
      confirmDialogInstance = null;
    }
    const triggerCancel = args.some(param => param && param.triggerCancel);
    if (config.onCancel && triggerCancel) {
      config.onCancel(() => {}, ...args.slice(1));
    }
    for (let i = 0; i < _destroyFns.default.length; i++) {
      const fn = _destroyFns.default[i];
      if (fn === close) {
        _destroyFns.default.splice(i, 1);
        break;
      }
    }
  }
  function close(...args) {
    currentConfig = (0, _extends2.default)((0, _extends2.default)({}, currentConfig), {
      open: false,
      afterClose: () => {
        if (typeof config.afterClose === 'function') {
          config.afterClose();
        }
        destroy.apply(this, args);
      }
    });
    // Legacy support
    if (currentConfig.visible) {
      delete currentConfig.visible;
    }
    update(currentConfig);
  }
  function update(configUpdate) {
    if (typeof configUpdate === 'function') {
      currentConfig = configUpdate(currentConfig);
    } else {
      currentConfig = (0, _extends2.default)((0, _extends2.default)({}, currentConfig), configUpdate);
    }
    if (confirmDialogInstance) {
      (0, _vnode.triggerVNodeUpdate)(confirmDialogInstance, currentConfig, container);
    }
  }
  const Wrapper = p => {
    const global = _configProvider.globalConfigForApi;
    const rootPrefixCls = global.prefixCls;
    const prefixCls = p.prefixCls || `${rootPrefixCls}-modal`;
    const iconPrefixCls = global.iconPrefixCls;
    const runtimeLocale = (0, _locale.getConfirmLocale)();
    return (0, _vue.createVNode)(_configProvider.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, global), {}, {
      "prefixCls": rootPrefixCls
    }), {
      default: () => [(0, _vue.createVNode)(_ConfirmDialog.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, p), {}, {
        "rootPrefixCls": rootPrefixCls,
        "prefixCls": prefixCls,
        "iconPrefixCls": iconPrefixCls,
        "locale": runtimeLocale,
        "cancelText": p.cancelText || runtimeLocale.cancelText
      }), null)]
    });
  };
  function render(props) {
    const vm = (0, _vue.createVNode)(Wrapper, (0, _extends2.default)({}, props));
    vm.appContext = config.parentContext || config.appContext || vm.appContext;
    (0, _vue.render)(vm, container);
    return vm;
  }
  confirmDialogInstance = render(currentConfig);
  _destroyFns.default.push(close);
  return {
    destroy: close,
    update
  };
};
var _default = exports.default = confirm;
function withWarn(props) {
  return (0, _extends2.default)((0, _extends2.default)({}, props), {
    type: 'warning'
  });
}
function withInfo(props) {
  return (0, _extends2.default)((0, _extends2.default)({}, props), {
    type: 'info'
  });
}
function withSuccess(props) {
  return (0, _extends2.default)((0, _extends2.default)({}, props), {
    type: 'success'
  });
}
function withError(props) {
  return (0, _extends2.default)((0, _extends2.default)({}, props), {
    type: 'error'
  });
}
function withConfirm(props) {
  return (0, _extends2.default)((0, _extends2.default)({}, props), {
    type: 'confirm'
  });
}