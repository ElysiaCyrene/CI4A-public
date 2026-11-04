"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _vue = require("vue");
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _transition = require("../_util/transition");
var _Notice = _interopRequireDefault(require("./Notice"));
var _configProvider = _interopRequireWildcard(require("../config-provider"));
var _classNames = _interopRequireDefault(require("../_util/classNames"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
var __rest = void 0 && (void 0).__rest || function (s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
let seed = 0;
const now = Date.now();
function getUuid() {
  const id = seed;
  seed += 1;
  return `rcNotification_${now}_${id}`;
}
const Notification = (0, _vue.defineComponent)({
  name: 'Notification',
  inheritAttrs: false,
  props: ['prefixCls', 'transitionName', 'animation', 'maxCount', 'closeIcon', 'hashId'],
  setup(props, {
    attrs,
    expose,
    slots
  }) {
    const hookRefs = new Map();
    const notices = (0, _vue.ref)([]);
    const transitionProps = (0, _vue.computed)(() => {
      const {
        prefixCls,
        animation = 'fade'
      } = props;
      let name = props.transitionName;
      if (!name && animation) {
        name = `${prefixCls}-${animation}`;
      }
      return (0, _transition.getTransitionGroupProps)(name);
    });
    const add = (originNotice, holderCallback) => {
      const key = originNotice.key || getUuid();
      const notice = (0, _extends2.default)((0, _extends2.default)({}, originNotice), {
        key
      });
      const {
        maxCount
      } = props;
      const noticeIndex = notices.value.map(v => v.notice.key).indexOf(key);
      const updatedNotices = notices.value.concat();
      if (noticeIndex !== -1) {
        updatedNotices.splice(noticeIndex, 1, {
          notice,
          holderCallback
        });
      } else {
        if (maxCount && notices.value.length >= maxCount) {
          // XXX, use key of first item to update new added (let React to move exsiting
          // instead of remove and mount). Same key was used before for both a) external
          // manual control and b) internal react 'key' prop , which is not that good.
          // eslint-disable-next-line no-param-reassign
          // zombieJ: Not know why use `updateKey`. This makes Notice infinite loop in jest.
          // Change to `updateMark` for compare instead.
          // https://github.com/react-component/notification/commit/32299e6be396f94040bfa82517eea940db947ece
          notice.key = updatedNotices[0].notice.key;
          notice.updateMark = getUuid();
          // zombieJ: That's why. User may close by key directly.
          // We need record this but not re-render to avoid upper issue
          // https://github.com/react-component/notification/issues/129
          notice.userPassKey = key;
          updatedNotices.shift();
        }
        updatedNotices.push({
          notice,
          holderCallback
        });
      }
      notices.value = updatedNotices;
    };
    const remove = removeKey => {
      notices.value = (0, _vue.toRaw)(notices.value).filter(({
        notice: {
          key,
          userPassKey
        }
      }) => {
        const mergedKey = userPassKey || key;
        return mergedKey !== removeKey;
      });
    };
    expose({
      add,
      remove,
      notices
    });
    return () => {
      var _a;
      const {
        prefixCls,
        closeIcon = (_a = slots.closeIcon) === null || _a === void 0 ? void 0 : _a.call(slots, {
          prefixCls
        })
      } = props;
      const noticeNodes = notices.value.map(({
        notice,
        holderCallback
      }, index) => {
        const updateMark = index === notices.value.length - 1 ? notice.updateMark : undefined;
        const {
          key,
          userPassKey
        } = notice;
        const {
          content
        } = notice;
        const noticeProps = (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({
          prefixCls,
          closeIcon: typeof closeIcon === 'function' ? closeIcon({
            prefixCls
          }) : closeIcon
        }, notice), notice.props), {
          key,
          noticeKey: userPassKey || key,
          updateMark,
          onClose: noticeKey => {
            var _a;
            remove(noticeKey);
            (_a = notice.onClose) === null || _a === void 0 ? void 0 : _a.call(notice);
          },
          onClick: notice.onClick
        });
        if (holderCallback) {
          return (0, _vue.createVNode)("div", {
            "key": key,
            "class": `${prefixCls}-hook-holder`,
            "ref": div => {
              if (typeof key === 'undefined') {
                return;
              }
              if (div) {
                hookRefs.set(key, div);
                holderCallback(div, noticeProps);
              } else {
                hookRefs.delete(key);
              }
            }
          }, null);
        }
        return (0, _vue.createVNode)(_Notice.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, noticeProps), {}, {
          "class": (0, _classNames.default)(noticeProps.class, props.hashId)
        }), {
          default: () => [typeof content === 'function' ? content({
            prefixCls
          }) : content]
        });
      });
      const className = {
        [prefixCls]: 1,
        [attrs.class]: !!attrs.class,
        [props.hashId]: true
      };
      return (0, _vue.createVNode)("div", {
        "class": className,
        "style": attrs.style || {
          top: '65px',
          left: '50%'
        }
      }, [(0, _vue.createVNode)(_vue.TransitionGroup, (0, _objectSpread2.default)({
        "tag": "div"
      }, transitionProps.value), {
        default: () => [noticeNodes]
      })]);
    };
  }
});
Notification.newInstance = function newNotificationInstance(properties, callback) {
  const _a = properties || {},
    {
      name = 'notification',
      getContainer,
      appContext,
      prefixCls: customizePrefixCls,
      rootPrefixCls: customRootPrefixCls,
      transitionName: customTransitionName,
      hasTransitionName,
      useStyle
    } = _a,
    props = __rest(_a, ["name", "getContainer", "appContext", "prefixCls", "rootPrefixCls", "transitionName", "hasTransitionName", "useStyle"]);
  const div = document.createElement('div');
  if (getContainer) {
    const root = getContainer();
    root.appendChild(div);
  } else {
    document.body.appendChild(div);
  }
  const Wrapper = (0, _vue.defineComponent)({
    compatConfig: {
      MODE: 3
    },
    name: 'NotificationWrapper',
    setup(_props, {
      attrs
    }) {
      const notiRef = (0, _vue.shallowRef)();
      const prefixCls = (0, _vue.computed)(() => _configProvider.globalConfigForApi.getPrefixCls(name, customizePrefixCls));
      const [, hashId] = useStyle(prefixCls);
      (0, _vue.onMounted)(() => {
        callback({
          notice(noticeProps) {
            var _a;
            (_a = notiRef.value) === null || _a === void 0 ? void 0 : _a.add(noticeProps);
          },
          removeNotice(key) {
            var _a;
            (_a = notiRef.value) === null || _a === void 0 ? void 0 : _a.remove(key);
          },
          destroy() {
            (0, _vue.render)(null, div);
            if (div.parentNode) {
              div.parentNode.removeChild(div);
            }
          },
          component: notiRef
        });
      });
      return () => {
        const global = _configProvider.globalConfigForApi;
        const rootPrefixCls = global.getRootPrefixCls(customRootPrefixCls, prefixCls.value);
        const transitionName = hasTransitionName ? customTransitionName : `${prefixCls.value}-${customTransitionName}`;
        return (0, _vue.createVNode)(_configProvider.default, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, global), {}, {
          "prefixCls": rootPrefixCls
        }), {
          default: () => [(0, _vue.createVNode)(Notification, (0, _objectSpread2.default)((0, _objectSpread2.default)({
            "ref": notiRef
          }, attrs), {}, {
            "prefixCls": prefixCls.value,
            "transitionName": transitionName,
            "hashId": hashId.value
          }), null)]
        });
      };
    }
  });
  const vm = (0, _vue.createVNode)(Wrapper, props);
  vm.appContext = appContext || vm.appContext;
  (0, _vue.render)(vm, div);
};
var _default = exports.default = Notification;