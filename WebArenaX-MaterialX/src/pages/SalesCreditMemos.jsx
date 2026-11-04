import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack } from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import dayjs from 'dayjs';
import Ci4aDatePicker from '../components/Ci4aDatePicker';

const fmtCurrency = v => v != null ? `$${parseFloat(v).toFixed(2)}` : '';
const fmtDate = v => v ? dayjs(v).format('MMM D, YYYY h:mm A') : '';

const ALL_COLUMNS = [
  { id:'creditmemo_increment_id', label:'Credit Memo', w:130 },
  { id:'created_at', label:'Created', fmt:fmtDate, w:170 },
  { id:'order_increment_id', label:'Order #', w:100 },
  { id:'order_created_at', label:'Order Date', fmt:fmtDate, w:170 },
  { id:'bill_to_name', label:'Bill-to Name' },
  { id:'status', label:'Status', w:100 },
  { id:'refunded', label:'Refunded', align:'right', fmt:fmtCurrency, w:120 },
  { id:'action', label:'Action', w:80 },
];

export default function SalesCreditMemos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    credit_date_from:'', credit_date_to:'', order_date_from:'', order_date_to:'',
    order_increment_id:'', bill_to_name:'', status:'',
  });
  const [bulkAction, setBulkAction] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      Object.entries(filters).forEach(([k,v]) => { if(v) params[k]=v; });
      const res = await axios.get('/api/sales/credit-memos', { params });
      setData(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);

  const resetFilters = () => {
    setFilters({ credit_date_from:'', credit_date_to:'', order_date_from:'', order_date_to:'', order_increment_id:'', bill_to_name:'', status:'' });
    setPage(1);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight:300, mb:3 }}>Credit Memos</Typography>
      <Box sx={{ display:'flex', gap:1, mb:2, justifyContent:'flex-end' }}>
        <Button startIcon={<FilterIcon />} onClick={() => setShowFilters(!showFilters)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Filters</Button>
      </Box>
      {showFilters && (
        <Card sx={{ p:3, mb:2 }}>
          <Stack spacing={2}>
            <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
              <F label="Credit Date"><Box sx={{ display:'flex', gap:1 }}>
                <Ci4aDatePicker label="From" size="small" value={filters.credit_date_from ? dayjs(filters.credit_date_from) : null} onChange={v => setFilters(prev => ({ ...prev, credit_date_from: v ? v.format('YYYY-MM-DD') : ''}))} />
                <Ci4aDatePicker label="To" size="small" value={filters.credit_date_to ? dayjs(filters.credit_date_to) : null} onChange={v => setFilters(prev => ({ ...prev, credit_date_to: v ? v.format('YYYY-MM-DD') : ''}))} />
              </Box></F>
              <F label="Order Date"><Box sx={{ display:'flex', gap:1 }}>
                <Ci4aDatePicker label="From" size="small" value={filters.order_date_from ? dayjs(filters.order_date_from) : null} onChange={v => setFilters(prev => ({ ...prev, order_date_from: v ? v.format('YYYY-MM-DD') : ''}))} />
                <Ci4aDatePicker label="To" size="small" value={filters.order_date_to ? dayjs(filters.order_date_to) : null} onChange={v => setFilters(prev => ({ ...prev, order_date_to: v ? v.format('YYYY-MM-DD') : ''}))} />
              </Box></F>
              <F label="Order #"><TextField size="small" value={filters.order_increment_id} onChange={e => setFilters(prev => ({ ...prev, order_increment_id:e.target.value}))} /></F>
              <F label="Bill-to Name"><TextField size="small" value={filters.bill_to_name} onChange={e => setFilters(prev => ({ ...prev, bill_to_name:e.target.value}))} /></F>
              <F label="Status"><Select size="small" displayEmpty value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status:e.target.value}))} sx={{ minWidth:150 }}>
                <MenuItem value="">--</MenuItem>
                {['Open','Paid','Canceled'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select></F>
            </Box>
            <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1 }}>
              <Button onClick={resetFilters} variant="outlined" size="small" sx={{ textTransform:'none' }}>Cancel</Button>
              <Button onClick={() => { setPage(1); fetchData(); }} variant="contained" size="small" sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Apply Filters</Button>
            </Box>
          </Stack>
        </Card>
      )}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2, flexWrap:'wrap', gap:1 }}>
        <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
          <Select size="small" displayEmpty value={bulkAction} onChange={e => setBulkAction(e.target.value)} sx={{ minWidth:150 }}>
            <MenuItem value="">Actions</MenuItem>
            <MenuItem value="pdf_credit_memos">PDF Credit Memos</MenuItem>
          </Select>
          <Button variant="outlined" size="small" sx={{ textTransform:'none' }}>Submit</Button>
          <Typography fontSize={13} color="text.secondary">{total} records found</Typography>
        </Box>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Select size="small" value={pageSize} onChange={e => { setPageSize(e.target.value); setPage(1); }} sx={{ minWidth:80 }}>
            {[20,50,100,200].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
          <Typography fontSize={13} color="text.secondary">per page</Typography>
          <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p) => setPage(p)} size="small" siblingCount={1} />
        </Box>
      </Box>
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox size="small" indeterminate={selected.length>0 && selected.length<data.length}
                    checked={data.length>0 && selected.length===data.length}
                    onChange={e => setSelected(e.target.checked ? data.map(d => d.entity_id) : [])} />
                </TableCell>
                {ALL_COLUMNS.map(c => <TableCell key={c.id} align={c.align||'left'} sx={{ fontWeight:600, width:c.w }}>{c.label}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={ALL_COLUMNS.length+1} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow>
              ) : data.map(row => {
                const isSel = selected.includes(row.entity_id);
                return (
                  <TableRow key={row.entity_id} hover selected={isSel}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={isSel}
                        onChange={() => setSelected(isSel ? selected.filter(id => id!==row.entity_id) : [...selected, row.entity_id])} />
                    </TableCell>
                    {ALL_COLUMNS.map(c => (
                      <TableCell key={c.id} align={c.align||'left'}>
                        {c.id === 'action' ? (
                          <Typography component="a" href="#" sx={{ fontSize:13, textDecoration:'none', '&:hover':{ textDecoration:'underline' } }}>View</Typography>
                        ) : c.fmt ? c.fmt(row[c.id]) : row[c.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

function F({ label, children }) {
  return <Box><Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5 }}>{label}</Typography>{children}</Box>;
}
