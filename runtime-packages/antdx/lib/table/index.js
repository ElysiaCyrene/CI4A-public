"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "TableColumn", {
  enumerable: true,
  get: function () {
    return _Column.default;
  }
});
Object.defineProperty(exports, "TableColumnGroup", {
  enumerable: true,
  get: function () {
    return _ColumnGroup.default;
  }
});
exports.default = exports.TableSummaryRow = exports.TableSummaryCell = exports.TableSummary = void 0;
Object.defineProperty(exports, "tableProps", {
  enumerable: true,
  get: function () {
    return _Table.tableProps;
  }
});
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _Table = _interopRequireWildcard(require("./Table"));
var _Column = _interopRequireDefault(require("./Column"));
var _ColumnGroup = _interopRequireDefault(require("./ColumnGroup"));
var _vcTable = require("../vc-table");
var _useSelection = require("./hooks/useSelection");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const TableSummaryRow = exports.TableSummaryRow = _vcTable.SummaryRow;
const TableSummaryCell = exports.TableSummaryCell = _vcTable.SummaryCell;
const TableSummary = exports.TableSummary = (0, _extends2.default)(_vcTable.Summary, {
  Cell: TableSummaryCell,
  Row: TableSummaryRow,
  name: 'ATableSummary'
});
/* istanbul ignore next */
var _default = exports.default = (0, _extends2.default)(_Table.default, {
  SELECTION_ALL: _useSelection.SELECTION_ALL,
  SELECTION_INVERT: _useSelection.SELECTION_INVERT,
  SELECTION_NONE: _useSelection.SELECTION_NONE,
  SELECTION_COLUMN: _useSelection.SELECTION_COLUMN,
  EXPAND_COLUMN: _vcTable.EXPAND_COLUMN,
  Column: _Column.default,
  ColumnGroup: _ColumnGroup.default,
  Summary: TableSummary,
  install: app => {
    app.component(TableSummary.name, TableSummary);
    app.component(TableSummaryCell.name, TableSummaryCell);
    app.component(TableSummaryRow.name, TableSummaryRow);
    app.component(_Table.default.name, _Table.default);
    app.component(_Column.default.name, _Column.default);
    app.component(_ColumnGroup.default.name, _ColumnGroup.default);
    return app;
  }
});