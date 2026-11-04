"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reactivePick = reactivePick;
var _vue = require("vue");
var _fromPairs = _interopRequireDefault(require("lodash/fromPairs"));
/**
 * Reactively pick fields from a reactive object
 *
 * @see https://vueuse.js.org/reactivePick
 */
function reactivePick(obj, ...keys) {
  return (0, _vue.reactive)((0, _fromPairs.default)(keys.map(k => [k, (0, _vue.toRef)(obj, k)])));
}