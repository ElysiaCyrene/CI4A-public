"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _motion = require("../../style/motion");
var _internal = require("../../theme/internal");
var _style = require("../../style");
var _placementArrow = _interopRequireWildcard(require("../../style/placementArrow"));
require("vue");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const genTooltipStyle = token => {
  const {
    componentCls,
    // ant-tooltip
    tooltipMaxWidth,
    tooltipColor,
    tooltipBg,
    tooltipBorderRadius,
    zIndexPopup,
    controlHeight,
    boxShadowSecondary,
    paddingSM,
    paddingXS,
    tooltipRadiusOuter
  } = token;
  return [{
    [componentCls]: (0, _extends2.default)((0, _extends2.default)((0, _extends2.default)((0, _extends2.default)({}, (0, _style.resetComponent)(token)), {
      position: 'absolute',
      zIndex: zIndexPopup,
      display: 'block',
      '&': [{
        width: 'max-content'
      }, {
        width: 'intrinsic'
      }],
      maxWidth: tooltipMaxWidth,
      visibility: 'visible',
      '&-hidden': {
        display: 'none'
      },
      '--antd-arrow-background-color': tooltipBg,
      // Wrapper for the tooltip content
      [`${componentCls}-inner`]: {
        minWidth: controlHeight,
        minHeight: controlHeight,
        padding: `${paddingSM / 2}px ${paddingXS}px`,
        color: tooltipColor,
        textAlign: 'start',
        textDecoration: 'none',
        wordWrap: 'break-word',
        backgroundColor: tooltipBg,
        borderRadius: tooltipBorderRadius,
        boxShadow: boxShadowSecondary
      },
      // Limit left and right placement radius
      [[`&-placement-left`, `&-placement-leftTop`, `&-placement-leftBottom`, `&-placement-right`, `&-placement-rightTop`, `&-placement-rightBottom`].join(',')]: {
        [`${componentCls}-inner`]: {
          borderRadius: Math.min(tooltipBorderRadius, _placementArrow.MAX_VERTICAL_CONTENT_RADIUS)
        }
      },
      [`${componentCls}-content`]: {
        position: 'relative'
      }
    }), (0, _style.genPresetColor)(token, (colorKey, {
      darkColor
    }) => ({
      [`&${componentCls}-${colorKey}`]: {
        [`${componentCls}-inner`]: {
          backgroundColor: darkColor
        },
        [`${componentCls}-arrow`]: {
          '--antd-arrow-background-color': darkColor
        }
      }
    }))), {
      // RTL
      '&-rtl': {
        direction: 'rtl'
      }
    })
  },
  // Arrow Style
  (0, _placementArrow.default)((0, _internal.mergeToken)(token, {
    borderRadiusOuter: tooltipRadiusOuter
  }), {
    colorBg: 'var(--antd-arrow-background-color)',
    showArrowCls: '',
    contentRadius: tooltipBorderRadius,
    limitVerticalRadius: true
  }),
  // Pure Render
  {
    [`${componentCls}-pure`]: {
      position: 'relative',
      maxWidth: 'none'
    }
  }];
};
// ============================== Export ==============================
var _default = (prefixCls, injectStyle) => {
  const useOriginHook = (0, _internal.genComponentStyleHook)('Tooltip', token => {
    // Popover use Tooltip as internal component. We do not need to handle this.
    if ((injectStyle === null || injectStyle === void 0 ? void 0 : injectStyle.value) === false) {
      return [];
    }
    const {
      borderRadius,
      colorTextLightSolid,
      colorBgDefault,
      borderRadiusOuter
    } = token;
    const TooltipToken = (0, _internal.mergeToken)(token, {
      // default variables
      tooltipMaxWidth: 250,
      tooltipColor: colorTextLightSolid,
      tooltipBorderRadius: borderRadius,
      tooltipBg: colorBgDefault,
      tooltipRadiusOuter: borderRadiusOuter > 4 ? 4 : borderRadiusOuter
    });
    return [genTooltipStyle(TooltipToken), (0, _motion.initZoomMotion)(token, 'zoom-big-fast')];
  }, ({
    zIndexPopupBase,
    colorBgSpotlight
  }) => ({
    zIndexPopup: zIndexPopupBase + 70,
    colorBgDefault: colorBgSpotlight
  }));
  return useOriginHook(prefixCls);
};
exports.default = _default;