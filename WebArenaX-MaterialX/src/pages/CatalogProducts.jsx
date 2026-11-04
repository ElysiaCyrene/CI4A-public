import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Pagination,
  Menu,
  Popover,
  FormControlLabel,
  Card,
  IconButton,
  Stack,
} from "@mui/material";
import FilterIcon from '@mui/icons-material/FilterList';
import EyeIcon from '@mui/icons-material/Visibility';
import SettingIcon from '@mui/icons-material/Settings';
import UploadIcon from '@mui/icons-material/Upload';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import Add from '@mui/icons-material/Add';
import axios from "axios";
import dayjs from "dayjs";
import Ci4aDatePicker from "../components/Ci4aDatePicker";

// ==================== 常量 ====================
const PAGE_SIZES = [20, 50, 100, 200];

const ALL_COLUMNS = [
  { id: "entity_id", label: "ID", sortable: true, width: 80 },
  { id: "thumbnail", label: "Thumbnail", width: 100 },
  { id: "name", label: "Name", sortable: true },
  { id: "type_id", label: "Type", sortable: true },
  { id: "attribute_set_name", label: "Attribute Set", sortable: true },
  { id: "sku", label: "SKU", sortable: true },
  {
    id: "price",
    label: "Price",
    sortable: true,
    align: "right",
    format: "currency",
  },
  {
    id: "quantity",
    label: "Quantity",
    sortable: true,
    align: "right",
    format: "number",
  },
  {
    id: "visibility",
    label: "Visibility",
    sortable: true,
    format: "visibility",
  },
  { id: "status", label: "Status", sortable: true, format: "status" },
  { id: "websites", label: "Websites" },
  {
    id: "updated_at",
    label: "Last Updated At",
    sortable: true,
    format: "date",
  },
  { id: "action", label: "Action" },
];

const TYPE_OPTIONS = [
  { value: "simple", label: "Simple Product" },
  { value: "configurable", label: "Configurable Product" },
  { value: "virtual", label: "Virtual Product" },
  { value: "bundle", label: "Bundle Product" },
  { value: "downloadable", label: "Downloadable Product" },
  { value: "grouped", label: "Grouped Product" },
];

const VISIBILITY_OPTIONS = [
  { value: "Not Visible Individually", label: "Not Visible Individually" },
  { value: "Catalog", label: "Catalog" },
  { value: "Search", label: "Search" },
  { value: "Catalog, Search", label: "Catalog, Search" },
];

const STATUS_OPTIONS = [
  { value: "Enabled", label: "Enabled" },
  { value: "Disabled", label: "Disabled" },
];

const BULK_ACTIONS = [
  { value: "delete", label: "Delete" },
  { value: "update_status", label: "Update Status" },
  { value: "update_price", label: "Update Price" },
  { value: "update_quantity", label: "Update Quantity" },
];

// ==================== 格式化 ====================
const fmtCurrency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    v ?? 0,
  );

const fmtNumber = (v) => (v != null ? parseFloat(v).toFixed(4) : "");

const fmtDate = (v) => (v ? dayjs(v).format("MMM D, YYYY h:mm:ss A") : "");

const fmtVisibility = (v) => {
  const m = {
    1: "Not Visible Individually",
    2: "Catalog",
    3: "Search",
    4: "Catalog, Search",
  };
  return m[v] || v;
};

const fmtStatus = (v) => ({ 1: "Enabled", 2: "Disabled" })[v] || v;

const fmtCell = (col, value) => {
  switch (col.format) {
    case "currency":
      return fmtCurrency(value);
    case "number":
      return fmtNumber(value);
    case "date":
      return fmtDate(value);
    case "visibility":
      return fmtVisibility(value);
    case "status":
      return fmtStatus(value);
    default:
      return value ?? "";
  }
};

// ==================== 组件 ====================
export default function CatalogProducts({ initialFilters, onNavigate }) {
  // 列可见性
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.map((c) => c.id));
  const columns = useMemo(
    () => ALL_COLUMNS.filter((c) => visibleCols.includes(c.id)),
    [visibleCols],
  );

  // 筛选
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    id_from: "",
    id_to: "",
    price_from: "",
    price_to: "",
    qty_from: "",
    qty_to: "",
    name: "",
    sku: "",
    status: "",
    visibility: "",
    type_id: "",
    updated_at_from: "",
    updated_at_to: "",
  });

  // 表格
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // 批量操作
  const [bulkAction, setBulkAction] = useState("");
  const [targetStatus, setTargetStatus] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [targetQty, setTargetQty] = useState("");

  // 下拉菜单
  const [colAnchor, setColAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  // ===== 数据获取 =====
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...filters };
      if (filters.status) {
        params.status =
          { Enabled: 1, Disabled: 2 }[filters.status] || filters.status;
      }
      if (filters.visibility) {
        params.visibility =
          {
            "Not Visible Individually": 1,
            Catalog: 2,
            Search: 3,
            "Catalog, Search": 4,
          }[filters.visibility] || filters.visibility;
      }
      if (filters.updated_at_from)
        params.updated_at_from = dayjs(filters.updated_at_from).format(
          "YYYY-MM-DD HH:mm:ss",
        );
      if (filters.updated_at_to)
        params.updated_at_to = dayjs(filters.updated_at_to).format(
          "YYYY-MM-DD HH:mm:ss",
        );

      const res = await axios.get("/api/catalog/products", { params });
      let items = res.data.items || [];
      setTotal(res.data.total || 0);

      // 合并临时更新
      if (initialFilters?.tempUpdates)
        items = mergeUpdates(items, initialFilters.tempUpdates);
      if (initialFilters?.tempUpdate)
        items = mergeUpdates(items, [initialFilters.tempUpdate]);

      setData(items);
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  useEffect(() => {
    if (initialFilters) {
      const {
        page: p,
        pageSize: ps,
        tempUpdates,
        tempUpdate,
        ...rest
      } = initialFilters;
      if (p) setPage(p);
      if (ps) setPageSize(ps);
      if (Object.keys(rest).length)
        setFilters((prev) => ({ ...prev, ...rest }));
    }
  }, []);

  // ===== 处理函数 =====
  const applyFilters = () => {
    setPage(1);
    fetchData();
  };
  const resetFilters = () => {
    setFilters(prev => ({
      id_from: "",
      id_to: "",
      price_from: "",
      price_to: "",
      qty_from: "",
      qty_to: "",
      name: "",
      sku: "",
      status: "",
      visibility: "",
      type_id: "",
      updated_at_from: "",
      updated_at_to: "",
    }));
    setPage(1);
    fetchData();
  };

  const handleBulkSubmit = () => {
    if (!bulkAction) return;
    if (!selected.length) return;

    if (bulkAction === "delete") {
      setData((d) => d.filter((item) => !selected.includes(item.entity_id)));
      setSelected([]);
    } else if (bulkAction === "update_status" && targetStatus) {
      setData((d) =>
        d.map((item) =>
          selected.includes(item.entity_id)
            ? { ...item, status: { Enabled: 1, Disabled: 2 }[targetStatus] }
            : item,
        ),
      );
      setSelected([]);
      setTargetStatus("");
      setBulkAction("");
    } else if (bulkAction === "update_price" && targetPrice) {
      setData((d) =>
        d.map((item) =>
          selected.includes(item.entity_id)
            ? { ...item, price: parseFloat(targetPrice) }
            : item,
        ),
      );
      setSelected([]);
      setTargetPrice("");
      setBulkAction("");
    } else if (bulkAction === "update_quantity" && targetQty) {
      setData((d) =>
        d.map((item) =>
          selected.includes(item.entity_id)
            ? { ...item, quantity: parseInt(targetQty) }
            : item,
        ),
      );
      setSelected([]);
      setTargetQty("");
      setBulkAction("");
    }
  };

  const editProduct = (record) => {
    onNavigate?.("catalog_product_edit", {
      id: record.entity_id,
      savedState: { ...filters, page, pageSize },
    });
  };

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: total > 0 ? total : 100000,
        ...filters,
      };
      const res = await axios.get("/api/catalog/products", { params });
      const exportData = res.data.items || [];
      if (format === "csv") downloadCSV(exportData);
      else downloadExcelXML(exportData);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setLoading(false);
      setExportAnchor(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 300, color: "#262626" }}>
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => onNavigate?.("catalog_product_add")}
          sx={{
            bgcolor: "#eb5202",
            "&:hover": { bgcolor: "#d44902" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, justifyContent: "flex-end" }}>
        <Button
          startIcon={<FilterIcon />}
          onClick={() => setShowFilters(!showFilters)}
          sx={{ textTransform: "none", color: "#333", borderColor: "#ccc" }}
          variant="outlined"
          size="small"
        >
          Filters
        </Button>

        {/* Columns */}
        <Button
          endIcon={<DownIcon />}
          onClick={(e) => setColAnchor(e.currentTarget)}
          sx={{ textTransform: "none", color: "#333" }}
          variant="outlined"
          size="small"
          startIcon={<SettingIcon />}
        >
          Columns
        </Button>
        <Popover
          open={Boolean(colAnchor)}
          anchorEl={colAnchor}
          onClose={() => setColAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box sx={{ p: 1.5, minWidth: 200 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Columns
            </Typography>
            {ALL_COLUMNS.map((col) => (
              <FormControlLabel
                key={col.id}
                control={
                  <Checkbox
                    size="small"
                    checked={visibleCols.includes(col.id)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setVisibleCols([...visibleCols, col.id]);
                      else
                        setVisibleCols(visibleCols.filter((c) => c !== col.id));
                    }}
                  />
                }
                label={<Typography fontSize={13}>{col.label}</Typography>}
                sx={{ display: "flex", ml: 0, mb: 0.5 }}
              />
            ))}
          </Box>
        </Popover>

        {/* Export */}
        <Button
          endIcon={<DownIcon />}
          onClick={(e) => setExportAnchor(e.currentTarget)}
          sx={{ textTransform: "none", color: "#333" }}
          variant="outlined"
          size="small"
          startIcon={<UploadIcon />}
        >
          Export
        </Button>
        <Menu
          anchorEl={exportAnchor}
          open={Boolean(exportAnchor)}
          onClose={() => setExportAnchor(null)}
        >
          <MenuItem onClick={() => handleExport("csv")}>CSV</MenuItem>
          <MenuItem onClick={() => handleExport("xml")}>Excel XML</MenuItem>
        </Menu>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Card sx={{ p: 3, mb: 2 }}>
          <Stack spacing={2}>
            {/* Row 1 */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FilterField label="ID" sx={{ width: 120 }}>
                <TextField
                  size="small"
                  placeholder="from"
                  value={filters.id_from}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, id_from: e.target.value }))
                  }
                />
                <TextField
                  size="small"
                  placeholder="to"
                  value={filters.id_to}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, id_to: e.target.value }))
                  }
                />
              </FilterField>
              <FilterField label="Price" sx={{ width: 120 }}>
                <TextField
                  size="small"
                  placeholder="from"
                  value={filters.price_from}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, price_from: e.target.value }))
                  }
                />
                <TextField
                  size="small"
                  placeholder="to"
                  value={filters.price_to}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, price_to: e.target.value }))
                  }
                />
              </FilterField>
              <FilterField label="Quantity" sx={{ width: 120 }}>
                <TextField
                  size="small"
                  placeholder="from"
                  value={filters.qty_from}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, qty_from: e.target.value }))
                  }
                />
                <TextField
                  size="small"
                  placeholder="to"
                  value={filters.qty_to}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, qty_to: e.target.value }))
                  }
                />
              </FilterField>
              <FilterField label="Last Updated At" sx={{ width: 200 }}>
                <Ci4aDatePicker
                  label="From"
                  value={
                    filters.updated_at_from
                      ? dayjs(filters.updated_at_from)
                      : null
                  }
                  onChange={(v) =>
                    setFilters(prev => ({ ...prev, updated_at_from: v ? v.format("YYYY-MM-DD") : "",
                    }))
                  }
                />
                <Ci4aDatePicker
                  label="To"
                  value={
                    filters.updated_at_to ? dayjs(filters.updated_at_to) : null
                  }
                  onChange={(v) =>
                    setFilters(prev => ({ ...prev, updated_at_to: v ? v.format("YYYY-MM-DD") : "",
                    }))
                  }
                />
              </FilterField>
            </Box>
            {/* Row 2 */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FilterField label="Name">
                <TextField
                  size="small"
                  value={filters.name}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </FilterField>
              <FilterField label="Type" sx={{ width: 200 }}>
                <Select
                  size="small"
                  value={filters.type_id}
                  displayEmpty
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, type_id: e.target.value }))
                  }
                >
                  <MenuItem value="">--</MenuItem>
                  {TYPE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="SKU">
                <TextField
                  size="small"
                  value={filters.sku}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, sku: e.target.value }))
                  }
                />
              </FilterField>
              <FilterField label="Visibility" sx={{ width: 200 }}>
                <Select
                  size="small"
                  value={filters.visibility}
                  displayEmpty
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, visibility: e.target.value }))
                  }
                >
                  <MenuItem value="">--</MenuItem>
                  {VISIBILITY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FilterField>
            </Box>
            {/* Row 3 */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FilterField label="Status" sx={{ width: 160 }}>
                <Select
                  size="small"
                  value={filters.status}
                  displayEmpty
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, status: e.target.value }))
                  }
                >
                  <MenuItem value="">--</MenuItem>
                  {STATUS_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FilterField>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                onClick={resetFilters}
                variant="outlined"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                onClick={applyFilters}
                variant="contained"
                size="small"
                sx={{
                  bgcolor: "#eb5202",
                  "&:hover": { bgcolor: "#d44902" },
                  textTransform: "none",
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Bulk Actions + Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Select
            size="small"
            value={bulkAction}
            displayEmpty
            onChange={(e) => setBulkAction(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Actions</MenuItem>
            {BULK_ACTIONS.map((a) => (
              <MenuItem key={a.value} value={a.value}>
                {a.label}
              </MenuItem>
            ))}
          </Select>
          {bulkAction === "update_status" && (
            <Select
              size="small"
              value={targetStatus}
              displayEmpty
              onChange={(e) => setTargetStatus(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Select Status</MenuItem>
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          )}
          {bulkAction === "update_price" && (
            <TextField
              size="small"
              type="number"
              placeholder="Enter Price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              sx={{ width: 150 }}
            />
          )}
          {bulkAction === "update_quantity" && (
            <TextField
              size="small"
              type="number"
              placeholder="Enter Quantity"
              value={targetQty}
              onChange={(e) => setTargetQty(e.target.value)}
              sx={{ width: 150 }}
            />
          )}
          <Button
            onClick={handleBulkSubmit}
            variant="outlined"
            size="small"
            sx={{ textTransform: "none" }}
          >
            Submit
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: 13,
            color: "#666",
          }}
        >
          <span>{total} records found</span>
          <Select
            size="small"
            value={pageSize}
            onChange={(e) => {
              setPageSize(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 80 }}
          >
            {PAGE_SIZES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
          <span>per page</span>
          <Pagination
            count={Math.ceil(total / pageSize)}
            page={page}
            onChange={(e, p) => setPage(p)}
            size="small"
            siblingCount={1}
          />
        </Box>
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    indeterminate={
                      selected.length > 0 && selected.length < data.length
                    }
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? data.map((d) => d.entity_id) : [],
                      )
                    }
                  />
                </TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || "left"}
                    sx={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      minWidth: col.width,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => {
                  const isSel = selected.includes(row.entity_id);
                  return (
                    <TableRow
                      key={row.entity_id}
                      hover
                      selected={isSel}
                      onClick={(e) => {
                        const tag = e.target.tagName;
                        if (tag === "INPUT" || tag === "A" || tag === "BUTTON")
                          return;
                        editProduct(row);
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell
                        padding="checkbox"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          size="small"
                          checked={isSel}
                          onChange={() =>
                            setSelected(
                              isSel
                                ? selected.filter((id) => id !== row.entity_id)
                                : [...selected, row.entity_id],
                            )
                          }
                        />
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell
                          key={col.id}
                          align={col.align || "left"}
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {col.id === "thumbnail" ? (
                            row.thumbnail &&
                            row.thumbnail !== "no_selection" ? (
                              <Box
                                component="img"
                                src={`/media/catalog/product${row.thumbnail}`}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "contain",
                                }}
                                alt=""
                              />
                            ) : (
                              <Box
                                sx={{ width: 40, height: 40, bgcolor: "#eee" }}
                              />
                            )
                          ) : col.id === "action" ? (
                            <Typography
                              component="a"
                              href="#"
                              onClick={(e) => {
                                e.stopPropagation();
                                editProduct(row);
                              }}
                              sx={{
                                color: "#1976d2",
                                fontSize: 13,
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                              }}
                            >
                              Edit
                            </Typography>
                          ) : (
                            fmtCell(col, row[col.id])
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

// ==================== 辅助 ====================
function FilterField({ label, children, sx }) {
  return (
    <Box sx={sx}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, display: "block", mb: 0.5, color: "#333" }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {children}
      </Box>
    </Box>
  );
}

function mergeUpdates(items, updates) {
  if (!updates?.length) return items;
  const copy = [...items];
  updates.forEach((upd) => {
    const idx = copy.findIndex((p) => p.entity_id == upd.entity_id);
    if (idx !== -1) copy[idx] = { ...copy[idx], ...upd };
    else copy.unshift(upd);
  });
  return copy;
}

function downloadCSV(data) {
  const cols = ALL_COLUMNS.filter(
    (c) => c.id !== "action" && c.id !== "thumbnail",
  );
  const header = cols.map((c) => `"${c.label}"`).join(",");
  const rows = data.map((row) =>
    cols
      .map((c) => `"${String(fmtCell(c, row[c.id])).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header, ...rows].join("\n");
  downloadBlob(csv, "products.csv", "text/csv");
}

function downloadExcelXML(data) {
  const cols = ALL_COLUMNS.filter(
    (c) => c.id !== "action" && c.id !== "thumbnail",
  );
  let xml =
    '<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">\n<Worksheet ss:Name="Sheet1">\n<Table>\n';
  xml +=
    "<Row>" +
    cols
      .map((c) => `<Cell><Data ss:Type="String">${c.label}</Data></Cell>`)
      .join("") +
    "</Row>\n";
  xml += data
    .map(
      (row) =>
        "<Row>" +
        cols
          .map((c) => {
            let v = String(fmtCell(c, row[c.id]) || "");
            v = v
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
            return `<Cell><Data ss:Type="String">${v}</Data></Cell>`;
          })
          .join("") +
        "</Row>",
    )
    .join("\n");
  xml += "</Table>\n</Worksheet>\n</Workbook>";
  downloadBlob(xml, "products.xml", "application/xml");
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
