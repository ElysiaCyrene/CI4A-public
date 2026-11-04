import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack } from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

const COLUMNS = [
  { id:'theme_id', label:'ID' }, { id:'theme_title', label:'Theme Title' },
  { id:'theme_path', label:'Theme Path' }, { id:'parent_id', label:'Parent ID' },
  { id:'action', label:'Action' },
];

export default function ContentThemes({ initialFilters, onNavigate }) {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({ theme_title:'' });
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(20); const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...filters };
      const res = await axios.get('/api/content/themes', { params });
      setData(res.data.items||[]); setTotal(res.data.total||0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(()=>{fetchData();},[page,pageSize]);
  useEffect(()=>{ if(initialFilters) { const {page:p,pageSize:ps,...rest}=initialFilters; if(p)setPage(p); if(ps)setPageSize(ps); if(Object.keys(rest).length) setFilters(prev=>({...prev,...rest})); } },[]);

  const resetFilters = () => { setFilters({ theme_title:'' }); setPage(1); fetchData(); };
  const applyFilters = () => { setPage(1); fetchData(); };
  const handleView = (record) => { onNavigate?.('content_theme_view',{ id:record.theme_id, savedState:{...filters,page,pageSize} }); };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight:600, mb:3 }}>Themes</Typography>
      <Box sx={{ display:'flex', gap:1, mb:2, justifyContent:'flex-end' }}>
        <Button startIcon={<FilterIcon/>} onClick={()=>setShowFilters(!showFilters)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Filters</Button>
      </Box>
      {showFilters&&(
        <Card sx={{ p:3, mb:2 }}>
          <Stack spacing={2}>
            <Box sx={{ display:'flex', gap:2 }}>
              <F label="Theme Title"><TextField size="small" value={filters.theme_title} onChange={e=>setFilters(prev => ({ ...prev, theme_title:e.target.value}))}/></F>
            </Box>
            <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1 }}>
              <Button onClick={resetFilters} variant="outlined" size="small" sx={{ textTransform:'none' }}>Cancel</Button>
              <Button onClick={applyFilters} variant="contained" size="small" sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Apply Filters</Button>
            </Box>
          </Stack>
        </Card>
      )}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Typography fontSize={13} color="text.secondary">{total} records found</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Select size="small" value={pageSize} onChange={e=>{setPageSize(e.target.value);setPage(1);}} sx={{ minWidth:80 }}>{[20,50,100,200].map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
          <Typography fontSize={13} color="text.secondary">per page</Typography>
          <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p)=>setPage(p)} size="small" siblingCount={1}/>
        </Box>
      </Box>
      <Card><TableContainer><Table size="small">
        <TableHead><TableRow>{COLUMNS.map(c=><TableCell key={c.id} sx={{ fontWeight:600 }}>{c.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{loading?<TableRow><TableCell colSpan={COLUMNS.length} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow>:
          data.map(row=><TableRow key={row.theme_id} hover>{COLUMNS.map(c=><TableCell key={c.id}>
            {c.id==='action'?<Typography component="a" href="#" onClick={e=>{e.preventDefault();handleView(row);}} sx={{ fontSize:13, textDecoration:'none' }}>View</Typography>:row[c.id]}
          </TableCell>)}</TableRow>)
        }</TableBody>
      </Table></TableContainer></Card>
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5, color:'#333' }}>{label}</Typography>{children}</Box>; }
