import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack, Chip } from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import Add from '@mui/icons-material/Add';
import axios from 'axios';
import dayjs from 'dayjs';
import Ci4aDatePicker from '../components/Ci4aDatePicker';

const fmtDate = v => v ? dayjs(v).format('MMM D, YYYY') : '';

const COLUMNS = [
  { id:'rule_id', label:'ID', w:80 }, { id:'name', label:'Rule' },
  { id:'from_date', label:'Start', fmt:fmtDate }, { id:'to_date', label:'End', fmt:fmtDate },
  { id:'is_active', label:'Status' }, { id:'website', label:'Web Site' }, { id:'action', label:'Action', w:80 },
];

export default function MarketingCatalogPriceRule({ initialFilters, onNavigate }) {
  const [data,setData]=useState([]); const [loading,setLoading]=useState(false);
  const [showFilters,setShowFilters]=useState(true);
  const [filters,setFilters]=useState({ rule_id_from:'', rule_id_to:'', name:'', from_date_from:'', from_date_to:'', to_date_from:'', to_date_to:'', is_active:'' });
  const [page,setPage]=useState(1); const [pageSize,setPageSize]=useState(20); const [total,setTotal]=useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, rule_id: filters.rule_id_from, name: filters.name, is_active: filters.is_active };
      const res = await axios.get('/api/marketing/catalog-rules', { params });
      let items = res.data.items || [];
      setTotal(res.data.total || 0);
      if (window.__newCatalogRule) items.unshift(window.__newCatalogRule);
      setData(items);
    } catch(e) { console.error(e); setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);
  useEffect(() => {
    if (initialFilters) {
      const { newRule, ...rest } = initialFilters;
      if (Object.keys(rest).length) setFilters(prev => ({ ...prev, ...rest }));
    }
    if (window.__newCatalogRule) {
      setData(prev => [window.__newCatalogRule, ...prev]);
    }
  }, []);

  const resetFilters = () => { setFilters({ rule_id_from:'', rule_id_to:'', name:'', from_date_from:'', from_date_to:'', to_date_from:'', to_date_to:'', is_active:'' }); setPage(1); };
  const applyFilters = () => { setPage(1); fetchData(); };

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:3 }}>
        <Typography variant="h4" sx={{ fontWeight:500, fontSize:24 }}>Catalog Price Rule</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => onNavigate?.('marketing_catalog_price_rule_add')}
          sx={{ bgcolor:'#eb5202', textTransform:'none', fontWeight:600, '&:hover':{ bgcolor:'#d44902' } }}>Add New Rule</Button>
      </Box>

      <Box sx={{ display:'flex', gap:1, mb:2, justifyContent:'flex-end' }}>
        <Button startIcon={<FilterIcon />} onClick={() => setShowFilters(!showFilters)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Filters</Button>
      </Box>

      {showFilters && (
        <Card sx={{ p:3, mb:2 }}><Stack spacing={2}>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
            <F label="ID"><Box sx={{ display:'flex', flexDirection:'column', gap:0.5 }}>
              <TextField size="small" placeholder="from" value={filters.rule_id_from} onChange={e => setFilters(prev => ({ ...prev, rule_id_from:e.target.value}))} />
              <TextField size="small" placeholder="to" value={filters.rule_id_to} onChange={e => setFilters(prev => ({ ...prev, rule_id_to:e.target.value}))} />
            </Box></F>
            <F label="Rule"><TextField size="small" value={filters.name} onChange={e => setFilters(prev => ({ ...prev, name:e.target.value}))} /></F>
            <F label="Start"><Box sx={{ display:'flex', gap:1 }}>
              <Ci4aDatePicker label="From" size="small" value={filters.from_date_from ? dayjs(filters.from_date_from) : null} onChange={v => setFilters(prev => ({ ...prev, from_date_from: v ? v.format('YYYY-MM-DD') : ''}))} />
              <Ci4aDatePicker label="To" size="small" value={filters.from_date_to ? dayjs(filters.from_date_to) : null} onChange={v => setFilters(prev => ({ ...prev, from_date_to: v ? v.format('YYYY-MM-DD') : ''}))} />
            </Box></F>
            <F label="End"><Box sx={{ display:'flex', gap:1 }}>
              <Ci4aDatePicker label="From" size="small" value={filters.to_date_from ? dayjs(filters.to_date_from) : null} onChange={v => setFilters(prev => ({ ...prev, to_date_from: v ? v.format('YYYY-MM-DD') : ''}))} />
              <Ci4aDatePicker label="To" size="small" value={filters.to_date_to ? dayjs(filters.to_date_to) : null} onChange={v => setFilters(prev => ({ ...prev, to_date_to: v ? v.format('YYYY-MM-DD') : ''}))} />
            </Box></F>
          </Box>
          <Box sx={{ display:'flex', gap:2 }}>
            <F label="Status"><Select size="small" displayEmpty value={filters.is_active} onChange={e => setFilters(prev => ({ ...prev, is_active:e.target.value}))} sx={{ minWidth:150 }}>
              <MenuItem value="">--</MenuItem><MenuItem value={1}>Active</MenuItem><MenuItem value={0}>Inactive</MenuItem>
            </Select></F>
          </Box>
          <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1 }}>
            <Button onClick={resetFilters} variant="outlined" size="small" sx={{ textTransform:'none' }}>Cancel</Button>
            <Button onClick={applyFilters} variant="contained" size="small" sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Apply Filters</Button>
          </Box>
        </Stack></Card>
      )}

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

      <Card><TableContainer><Table size="small">
        <TableHead><TableRow>{COLUMNS.map(c => <TableCell key={c.id} sx={{ fontWeight:600, width:c.w }}>{c.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{loading ? <TableRow><TableCell colSpan={COLUMNS.length} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow> :
          data.map(row => <TableRow key={row.rule_id} hover>
            {COLUMNS.map(c => <TableCell key={c.id}>{
              c.id === 'is_active' ? <Chip label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'error'} size="small" variant="outlined" /> :
              c.id === 'action' ? <Typography component="a" href="#" sx={{ fontSize:13, textDecoration:'none' }}>Edit</Typography> :
              c.fmt ? c.fmt(row[c.id]) : row[c.id]
            }</TableCell>)}
          </TableRow>)}
        </TableBody>
      </Table></TableContainer></Card>
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5, color:'#333' }}>{label}</Typography>{children}</Box>; }
