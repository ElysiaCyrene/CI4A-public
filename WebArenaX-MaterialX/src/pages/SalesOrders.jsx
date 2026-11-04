import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Pagination, Menu, Card, Stack,
} from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import SettingIcon from '@mui/icons-material/Settings';
import UploadIcon from '@mui/icons-material/Upload';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import axios from 'axios';
import dayjs from 'dayjs';
import Ci4aDatePicker from '../components/Ci4aDatePicker';

const PAGE_SIZES = [20, 50, 100, 200];
const ALL_COLUMNS = [
  { id: 'increment_id', label: 'ID', sortable: true, width: 100 },
  { id: 'purchase_point', label: 'Purchase Point', sortable: true, width: 150 },
  { id: 'purchase_date', label: 'Purchase Date', sortable: true, width: 180, format: 'date' },
  { id: 'bill_to_name', label: 'Bill-to Name', sortable: true },
  { id: 'ship_to_name', label: 'Ship-to Name', sortable: true },
  { id: 'base_grand_total', label: 'Grand Total (Base)', sortable: true, align: 'right', width: 120, format: 'currency' },
  { id: 'grand_total', label: 'Grand Total (Purchased)', sortable: true, align: 'right', width: 120, format: 'currency' },
  { id: 'status', label: 'Status', sortable: true, width: 100 },
  { id: 'total_item_count', label: 'Items', sortable: true, width: 80, align: 'center' },
  { id: 'action', label: 'Action', width: 80 },
];

const STATUS_OPTS = [
  'canceled','closed','complete','fraud','holded','payment_review',
  'pending','pending_payment','processing',
];

const fmtCurrency = (v) => v != null ? `$${parseFloat(v).toFixed(2)}` : '';
const fmtDate = (v) => v ? dayjs(v).format('MMM D, YYYY h:mm:ss A') : '';
const fmtCell = (col, v) => {
  if (col.format === 'currency') return fmtCurrency(v);
  if (col.format === 'date') return fmtDate(v);
  return v ?? '';
};

export default function SalesOrders({ initialFilters, onNavigate }) {
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.map(c => c.id));
  const columns = useMemo(() => ALL_COLUMNS.filter(c => visibleCols.includes(c.id)), [visibleCols]);

  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    purchase_date_from: '', purchase_date_to: '',
    base_grand_total_from: '', base_grand_total_to: '',
    grand_total_from: '', grand_total_to: '',
    purchase_point: '', increment_id: '', bill_to_name: '',
    ship_to_name: '', status: '', braintree_transaction_source: '',
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [bulkAction, setBulkAction] = useState('');
  const [targetStatus, setTargetStatus] = useState('');
  const [colAnchor, setColAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...filters };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await axios.get('/api/sales/orders', { params });
      setData(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);
  useEffect(() => {
    if (initialFilters) {
      const { page: p, pageSize: ps, ...rest } = initialFilters;
      if (p) setPage(p);
      if (ps) setPageSize(ps);
      if (Object.keys(rest).length) setFilters(prev => ({ ...prev, ...rest }));
    }
  }, []);

  const applyFilters = () => { setPage(1); fetchData(); };
  const resetFilters = () => {
    setFilters({
      purchase_date_from: '', purchase_date_to: '',
      base_grand_total_from: '', base_grand_total_to: '',
      grand_total_from: '', grand_total_to: '',
      purchase_point: '', increment_id: '', bill_to_name: '',
      ship_to_name: '', status: '', braintree_transaction_source: '',
    });
    setPage(1); fetchData();
  };

  const handleBulkSubmit = () => {
    if (!bulkAction || !selected.length) return;
    if (bulkAction === 'delete') {
      setData(d => d.filter(i => !selected.includes(i.entity_id)));
      setSelected([]);
    } else if (bulkAction === 'update_status' && targetStatus) {
      setData(d => d.map(i => selected.includes(i.entity_id) ? { ...i, status: targetStatus } : i));
      setSelected([]); setTargetStatus(''); setBulkAction('');
    }
  };

  const viewOrder = (record) => {
    onNavigate?.('sales_order_view', {
      id: record.entity_id,
      savedState: { ...filters, page, pageSize },
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 300 }}>Orders</Typography>
        <Button variant="contained"
          sx={{ bgcolor: '#eb5202', '&:hover': { bgcolor: '#d44902' }, textTransform: 'none', fontWeight: 600 }}>
          Create New Order
        </Button>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'flex-end' }}>
        <Button startIcon={<FilterIcon />} onClick={() => setShowFilters(!showFilters)}
          variant="outlined" size="small" sx={{ textTransform: 'none' }}>Filters</Button>
        <Button startIcon={<SettingIcon />} endIcon={<DownIcon />} onClick={e => setColAnchor(e.currentTarget)}
          variant="outlined" size="small" sx={{ textTransform: 'none' }}>Columns</Button>
        <Menu anchorEl={colAnchor} open={Boolean(colAnchor)} onClose={() => setColAnchor(null)}>
          <Box sx={{ p: 1.5, minWidth: 220 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Columns</Typography>
            {ALL_COLUMNS.map(col => (
              <Box key={col.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Checkbox size="small" checked={visibleCols.includes(col.id)}
                  onChange={e => setVisibleCols(e.target.checked ? [...visibleCols, col.id] : visibleCols.filter(c => c !== col.id))} />
                <Typography fontSize={13}>{col.label}</Typography>
              </Box>
            ))}
          </Box>
        </Menu>
        <Button startIcon={<UploadIcon />} endIcon={<DownIcon />} onClick={e => setExportAnchor(e.currentTarget)}
          variant="outlined" size="small" sx={{ textTransform: 'none' }}>Export</Button>
        <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
          <MenuItem onClick={() => setExportAnchor(null)}>CSV</MenuItem>
          <MenuItem onClick={() => setExportAnchor(null)}>Excel XML</MenuItem>
        </Menu>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Card sx={{ p: 3, mb: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Field label="Purchase Date">
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Ci4aDatePicker label="From" size="small"
                    value={filters.purchase_date_from ? dayjs(filters.purchase_date_from) : null}
                    onChange={v => setFilters(prev => ({ ...prev, purchase_date_from: v ? v.format('YYYY-MM-DD') : '' }))} />
                  <Ci4aDatePicker label="To" size="small"
                    value={filters.purchase_date_to ? dayjs(filters.purchase_date_to) : null}
                    onChange={v => setFilters(prev => ({ ...prev, purchase_date_to: v ? v.format('YYYY-MM-DD') : '' }))} />
                </Box>
              </Field>
              <Field label="Grand Total (Base)" w={220}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" placeholder="From" value={filters.base_grand_total_from}
                    onChange={e => setFilters(prev => ({ ...prev, base_grand_total_from: e.target.value }))} />
                  <TextField size="small" placeholder="To" value={filters.base_grand_total_to}
                    onChange={e => setFilters(prev => ({ ...prev, base_grand_total_to: e.target.value }))} />
                </Box>
              </Field>
              <Field label="Grand Total (Purchased)" w={220}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" placeholder="From" value={filters.grand_total_from}
                    onChange={e => setFilters(prev => ({ ...prev, grand_total_from: e.target.value }))} />
                  <TextField size="small" placeholder="To" value={filters.grand_total_to}
                    onChange={e => setFilters(prev => ({ ...prev, grand_total_to: e.target.value }))} />
                </Box>
              </Field>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Field label="ID">
                <TextField size="small" value={filters.increment_id}
                  onChange={e => setFilters(prev => ({ ...prev, increment_id: e.target.value }))} />
              </Field>
              <Field label="Bill-to Name">
                <TextField size="small" value={filters.bill_to_name}
                  onChange={e => setFilters(prev => ({ ...prev, bill_to_name: e.target.value }))} />
              </Field>
              <Field label="Ship-to Name">
                <TextField size="small" value={filters.ship_to_name}
                  onChange={e => setFilters(prev => ({ ...prev, ship_to_name: e.target.value }))} />
              </Field>
              <Field label="Status" w={180}>
                <Select size="small" fullWidth displayEmpty value={filters.status}
                  onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                  <MenuItem value="">--</MenuItem>
                  {STATUS_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </Field>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={resetFilters} variant="outlined" size="small" sx={{ textTransform: 'none' }}>Cancel</Button>
              <Button onClick={applyFilters} variant="contained" size="small"
                sx={{ bgcolor: '#eb5202', textTransform: 'none' }}>Apply Filters</Button>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Bulk + Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Select size="small" displayEmpty value={bulkAction} onChange={e => setBulkAction(e.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="">Actions</MenuItem>
            <MenuItem value="delete">Delete</MenuItem>
            <MenuItem value="update_status">Update Status</MenuItem>
          </Select>
          {bulkAction === 'update_status' && (
            <Select size="small" displayEmpty value={targetStatus} onChange={e => setTargetStatus(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="">Select Status</MenuItem>
              {STATUS_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </Select>
          )}
          <Button onClick={handleBulkSubmit} variant="outlined" size="small" sx={{ textTransform: 'none' }}>Submit</Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 13, color: '#666' }}>
          <span>{total} records found</span>
          <Select size="small" value={pageSize} onChange={e => { setPageSize(e.target.value); setPage(1); }} sx={{ minWidth: 80 }}>
            {PAGE_SIZES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
          <span>per page</span>
          <Pagination count={Math.ceil(total / pageSize)} page={page} onChange={(e, p) => setPage(p)} size="small" siblingCount={1} />
        </Box>
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox size="small" checked={data.length > 0 && selected.length === data.length}
                    onChange={e => setSelected(e.target.checked ? data.map(d => d.entity_id) : [])} />
                </TableCell>
                {columns.map(col => (
                  <TableCell key={col.id} align={col.align || 'left'} sx={{ fontWeight: 600, minWidth: col.width }}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>Loading...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>No records found.</TableCell></TableRow>
              ) : (
                data.map(row => {
                  const isSel = selected.includes(row.entity_id);
                  return (
                    <TableRow key={row.entity_id} hover selected={isSel} onClick={e => {
                      if (['INPUT','A','BUTTON'].includes(e.target.tagName)) return;
                      viewOrder(row);
                    }} sx={{ cursor: 'pointer' }}>
                      <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                        <Checkbox size="small" checked={isSel}
                          onChange={() => setSelected(isSel ? selected.filter(id => id !== row.entity_id) : [...selected, row.entity_id])} />
                      </TableCell>
                      {columns.map(col => (
                        <TableCell key={col.id} align={col.align || 'left'}>
                          {col.id === 'action' ? (
                            <Typography component="a" href="#" onClick={e => { e.stopPropagation(); viewOrder(row); }}
                              sx={{ color: '#1976d2', fontSize: 13, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                              View
                            </Typography>
                          ) : fmtCell(col, row[col.id])}
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

function Field({ label, children, w }) {
  return (
    <Box sx={{ width: w }}>
      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: '#333' }}>{label}</Typography>
      {children}
    </Box>
  );
}
