import { useState, useEffect } from 'react';
import { Box, Typography, Button, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card } from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

const COLUMNS = [
  { id:'entity_id', label:'ID' }, { id:'store_website_id', label:'Store Website ID' },
  { id:'theme_theme_id', label:'Theme ID' }, { id:'action', label:'Action' },
];

export default function ContentDesignConfig() {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(20); const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/content/design-config', { params: { page, pageSize } });
      setData(res.data.items||[]); setTotal(res.data.total||0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(()=>{fetchData();},[page,pageSize]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight:600, mb:3 }}>Design Configuration</Typography>
      <Box sx={{ display:'flex', gap:1, mb:2, justifyContent:'flex-end' }}>
        <Button startIcon={<FilterIcon/>} onClick={()=>setShowFilters(!showFilters)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Filters</Button>
      </Box>
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
          data.map(row=><TableRow key={row.entity_id} hover>{COLUMNS.map(c=><TableCell key={c.id}>{
            c.id==='action'?<Typography component="a" href="#" sx={{ fontSize:13, textDecoration:'none' }}>Edit</Typography>:
            row[c.id]}</TableCell>)}</TableRow>)
        }</TableBody>
      </Table></TableContainer></Card>
    </Box>
  );
}
