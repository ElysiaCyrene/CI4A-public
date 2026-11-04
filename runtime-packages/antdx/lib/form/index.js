"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "FormItem", {
  enumerable: true,
  get: function () {
    return _FormItem.default;
  }
});
Object.defineProperty(exports, "FormItemRest", {
  enumerable: true,
  get: function () {
    return _FormItemContext.default;
  }
});
exports.default = void 0;
Object.defineProperty(exports, "formItemProps", {
  enumerable: true,
  get: function () {
    return _FormItem.formItemProps;
  }
});
Object.defineProperty(exports, "formProps", {
  enumerable: true,
  get: function () {
    return _Form.formProps;
  }
});
Object.defineProperty(exports, "useForm", {
  enumerable: true,
  get: function () {
    return _useForm.default;
  }
});
Object.defineProperty(exports, "useInjectFormItemContext", {
  enumerable: true,
  get: function () {
    return _FormItemContext.useInjectFormItemContext;
  }
});
var _Form = _interopRequireWildcard(require("./Form"));
var _FormItem = _interopRequireWildcard(require("./FormItem"));
var _useForm = _interopRequireDefault(require("./useForm"));
var _FormItemContext = _interopRequireWildcard(require("./FormItemContext"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
_Form.default.useInjectFormItemContext = _FormItemContext.useInjectFormItemContext;
_Form.default.ItemRest = _FormItemContext.default;
/* istanbul ignore next */
_Form.default.install = function (app) {
  app.component(_Form.default.name, _Form.default);
  app.component(_Form.default.Item.name, _Form.default.Item);
  app.component(_FormItemContext.default.name, _FormItemContext.default);
  return app;
};
var _default = exports.default = _Form.default;