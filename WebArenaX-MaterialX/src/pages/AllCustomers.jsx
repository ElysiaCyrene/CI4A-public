import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Menu, Card, Stack, Popover } from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import SettingIcon from '@mui/icons-material/Settings';
import UploadIcon from '@mui/icons-material/Upload';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import axios from 'axios';
import dayjs from 'dayjs';
import Ci4aDatePicker from '../components/Ci4aDatePicker';

const ALL_COLUMNS = [
  { id:'name', label:'Name', sortable:true },
  { id:'email', label:'Email', sortable:true },
  { id:'group', label:'Group', sortable:true },
  { id:'billing_telephone', label:'Phone' },
  { id:'billing_postcode', label:'ZIP' },
  { id:'billing_country_id', label:'Country' },
  { id:'billing_region', label:'State/Province' },
  { id:'created_at', label:'Customer Since', sortable:true, format:'date' },
];

const fmtDate = v => v ? dayjs(v).format('MMM D, YYYY h:mm:ss A') : '';

const fmtCell = (col, val, row) => {
  if (col.id === 'created_at') return fmtDate(val);
  if (col.id === 'group') return row.customer_group_code || row.group_id || '';
  return val ?? '';
};

export default function AllCustomers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    created_at_from:'', created_at_to:'', name:'', email:'', group_id:'',
    billing_telephone:'', billing_postcode:'', billing_country_id:'', billing_region:'',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // 列可见性
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.map(c => c.id));
  const columns = useMemo(() => ALL_COLUMNS.filter(c => visibleCols.includes(c.id)), [visibleCols]);
  const [colAnchor, setColAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...filters };
      if (filters.created_at_from) params.created_at_from = dayjs(filters.created_at_from).format('YYYY-MM-DD HH:mm:ss');
      if (filters.created_at_to) params.created_at_to = dayjs(filters.created_at_to).format('YYYY-MM-DD HH:mm:ss');
      const res = await axios.get('/api/customers', { params });
      setData(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);

  const resetFilters = () => {
    setFilters({ created_at_from:'', created_at_to:'', name:'', email:'', group_id:'', billing_telephone:'', billing_postcode:'', billing_country_id:'', billing_region:'' });
    setPage(1); fetchData();
  };
  const applyFilters = () => { setPage(1); fetchData(); };

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:3 }}>
        <Typography variant="h4" sx={{ fontWeight:300, color:'#262626' }}>Customers</Typography>
        <Button variant="contained" sx={{ bgcolor:'#eb5202', textTransform:'none', fontWeight:600, '&:hover':{ bgcolor:'#d44902' } }}>Add New Customer</Button>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display:'flex', gap:1, mb:2, justifyContent:'flex-end' }}>
        <Button startIcon={<FilterIcon />} onClick={() => setShowFilters(!showFilters)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Filters</Button>
        <Button startIcon={<SettingIcon />} endIcon={<DownIcon />} onClick={e => setColAnchor(e.currentTarget)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Columns</Button>
        <Popover open={Boolean(colAnchor)} anchorEl={colAnchor} onClose={() => setColAnchor(null)} anchorOrigin={{ vertical:'bottom', horizontal:'left' }}>
          <Box sx={{ p:1.5, minWidth:200 }}>
            <Typography variant="subtitle2" sx={{ mb:1 }}>Select Columns</Typography>
            {ALL_COLUMNS.map(c => (
              <Box key={c.id} sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                <Checkbox size="small" checked={visibleCols.includes(c.id)}
                  onChange={e => setVisibleCols(e.target.checked ? [...visibleCols, c.id] : visibleCols.filter(x => x!==c.id))} />
                <Typography fontSize={13}>{c.label}</Typography>
              </Box>
            ))}
          </Box>
        </Popover>
        <Button startIcon={<UploadIcon />} endIcon={<DownIcon />} onClick={e => setExportAnchor(e.currentTarget)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Export</Button>
        <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
          <MenuItem onClick={() => setExportAnchor(null)}>CSV</MenuItem>
          <MenuItem onClick={() => setExportAnchor(null)}>Excel XML</MenuItem>
        </Menu>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Card sx={{ p:3, mb:2 }}>
          <Stack spacing={2}>
            <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
              <F label="Customer Since">
                <Box sx={{ display:'flex', flexDirection:'column', gap:0.5 }}>
                  <Ci4aDatePicker label="From" size="small"
                    value={filters.created_at_from ? dayjs(filters.created_at_from) : null}
                    onChange={v => setFilters(prev => ({ ...prev, created_at_from: v ? v.format('YYYY-MM-DD') : ''}))} />
                  <Ci4aDatePicker label="To" size="small"
                    value={filters.created_at_to ? dayjs(filters.created_at_to) : null}
                    onChange={v => setFilters(prev => ({ ...prev, created_at_to: v ? v.format('YYYY-MM-DD') : ''}))} />
                </Box>
              </F>
              <F label="Name"><TextField size="small" value={filters.name} onChange={e => setFilters(prev => ({ ...prev, name:e.target.value}))} /></F>
              <F label="Email"><TextField size="small" value={filters.email} onChange={e => setFilters(prev => ({ ...prev, email:e.target.value}))} /></F>
              <F label="Group ID"><TextField size="small" value={filters.group_id} onChange={e => setFilters(prev => ({ ...prev, group_id:e.target.value}))} /></F>
            </Box>
            <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
              <F label="Phone"><TextField size="small" value={filters.billing_telephone} onChange={e => setFilters(prev => ({ ...prev, billing_telephone:e.target.value}))} /></F>
              <F label="ZIP"><TextField size="small" value={filters.billing_postcode} onChange={e => setFilters(prev => ({ ...prev, billing_postcode:e.target.value}))} /></F>
              <F label="Country"><TextField size="small" placeholder="Country Code (e.g. US)" value={filters.billing_country_id} onChange={e => setFilters(prev => ({ ...prev, billing_country_id:e.target.value}))} /></F>
              <F label="State/Province"><TextField size="small" value={filters.billing_region} onChange={e => setFilters(prev => ({ ...prev, billing_region:e.target.value}))} /></F>
            </Box>
            <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1 }}>
              <Button onClick={resetFilters} variant="outlined" size="small" sx={{ textTransform:'none' }}>Cancel</Button>
              <Button onClick={applyFilters} variant="contained" size="small" sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Apply Filters</Button>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Table header */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Typography fontSize={13} color="text.secondary">{total} records found</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Select size="small" value={pageSize} onChange={e => { setPageSize(e.target.value); setPage(1); }} sx={{ minWidth:80 }}>
            {[20,50,100,200].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
          <Typography fontSize={13} color="text.secondary">per page</Typography>
          <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p) => setPage(p)} size="small" siblingCount={1} />
        </Box>
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map(c => <TableCell key={c.id} sx={{ fontWeight:600 }}>{c.label}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow>
              ) : data.map(row => (
                <TableRow key={row.entity_id} hover>
                  {columns.map(c => <TableCell key={c.id}>{fmtCell(c, row[c.id], row)}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

function F({ label, children }) {
  return <Box><Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5, color:'#333' }}>{label}</Typography>{children}</Box>;
}
