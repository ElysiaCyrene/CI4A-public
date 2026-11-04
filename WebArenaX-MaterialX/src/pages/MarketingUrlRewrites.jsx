import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack } from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

const COLUMNS = [
  { id:'url_rewrite_id', label:'ID' }, { id:'store_id', label:'Store View' },
  { id:'request_path', label:'Request Path' }, { id:'target_path', label:'Target Path' },
  { id:'redirect_type', label:'Redirect Type' }, { id:'action', label:'Action' },
];

export default function MarketingUrlRewrites() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({ url_rewrite_id_from:'', url_rewrite_id_to:'', request_path:'', target_path:'' });
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(20); const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      Object.entries(filters).forEach(([k,v]) => { if(v) params[k]=v; });
      const res = await axios.get('/api/marketing/url-rewrites', { params });
      setData(res.data.items || []); setTotal(res.data.total || 0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);

  const resetFilters = () => { setFilters({ url_rewrite_id_from:'', url_rewrite_id_to:'', request_path:'', target_path:'' }); setPage(1); };
  const applyFilters = () => { setPage(1); fetchData(); };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight:300, mb:3, color:'#262626' }}>URL Rewrites</Typography>
      <Box sx={{ display:'flex', gap:1, mb:2, justifyContent:'flex-end' }}>
        <Button startIcon={<FilterIcon />} onClick={() => setShowFilters(!showFilters)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Filters</Button>
      </Box>
      {showFilters && (
        <Card sx={{ p:3, mb:2 }}><Stack spacing={2}>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
            <F label="ID"><Box sx={{ display:'flex', flexDirection:'column', gap:0.5 }}>
              <TextField size="small" placeholder="from" value={filters.url_rewrite_id_from} onChange={e => setFilters(prev => ({ ...prev, url_rewrite_id_from:e.target.value}))} />
              <TextField size="small" placeholder="to" value={filters.url_rewrite_id_to} onChange={e => setFilters(prev => ({ ...prev, url_rewrite_id_to:e.target.value}))} />
            </Box></F>
            <F label="Request Path"><TextField size="small" value={filters.request_path} onChange={e => setFilters(prev => ({ ...prev, request_path:e.target.value}))} /></F>
            <F label="Target Path"><TextField size="small" value={filters.target_path} onChange={e => setFilters(prev => ({ ...prev, target_path:e.target.value}))} /></F>
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
          <Select size="small" value={pageSize} onChange={e => { setPageSize(e.target.value); setPage(1); }} sx={{ minWidth:80 }}>{[20,50,100,200].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
          <Typography fontSize={13} color="text.secondary">per page</Typography>
          <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p) => setPage(p)} size="small" siblingCount={1} />
        </Box>
      </Box>
      <Card><TableContainer><Table size="small">
        <TableHead><TableRow>{COLUMNS.map(c => <TableCell key={c.id} sx={{ fontWeight:600 }}>{c.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{loading ? <TableRow><TableCell colSpan={COLUMNS.length} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow> :
          data.map(row => <TableRow key={row.url_rewrite_id} hover>{COLUMNS.map(c => <TableCell key={c.id}>{c.id==='action' ? <Typography component="a" href="#" sx={{ fontSize:13, textDecoration:'none' }}>Edit</Typography> : row[c.id]}</TableCell>)}</TableRow>)}
        </TableBody>
      </Table></TableContainer></Card>
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5, color:'#333' }}>{label}</Typography>{children}</Box>; }
