import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack, Chip, Popover } from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import SettingIcon from '@mui/icons-material/Settings';
import Add from '@mui/icons-material/Add';
import axios from 'axios';
import dayjs from 'dayjs';

const fmtDate = v => v ? dayjs(v).format('MMM D, YYYY h:mm:ss A') : '';
const ALL_COLUMNS = [
  { id:'widget_id', label:'ID' }, { id:'title', label:'Title' }, { id:'type', label:'Type' },
  { id:'store_name', label:'Store' }, { id:'sort_order', label:'Sort Order' },
  { id:'creation_time', label:'Created', fmt:fmtDate }, { id:'update_time', label:'Modified', fmt:fmtDate }, { id:'action', label:'Action' },
];

export default function ContentWidgets() {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({ title:'', type:'' });
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(20); const [total, setTotal] = useState(0);
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.map(c=>c.id));
  const columns = useMemo(()=>ALL_COLUMNS.filter(c=>visibleCols.includes(c.id)),[visibleCols]);
  const [colAnchor, setColAnchor] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...filters };
      const res = await axios.get('/api/content/widgets', { params });
      setData(res.data.items||[]); setTotal(res.data.total||0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(()=>{fetchData();},[page,pageSize]);

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:3 }}>
        <Typography variant="h5" sx={{ fontWeight:600 }}>Widgets</Typography>
        <Button variant="contained" startIcon={<Add/>} sx={{ bgcolor:'#eb5202', textTransform:'none', '&:hover':{bgcolor:'#d44902'} }}>Add New Widget</Button>
      </Box>
      <Box sx={{ display:'flex', gap:1, mb:2, justifyContent:'flex-end' }}>
        <Button startIcon={<FilterIcon/>} onClick={()=>setShowFilters(!showFilters)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Filters</Button>
        <Button startIcon={<SettingIcon/>} onClick={e=>setColAnchor(e.currentTarget)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Columns</Button>
        <Popover open={Boolean(colAnchor)} anchorEl={colAnchor} onClose={()=>setColAnchor(null)} anchorOrigin={{ vertical:'bottom', horizontal:'left' }}>
          <Box sx={{ p:1.5, minWidth:200 }}><Typography variant="subtitle2" sx={{ mb:1 }}>Select Columns</Typography>
            {ALL_COLUMNS.map(c=><Box key={c.id} sx={{ display:'flex', alignItems:'center', gap:0.5 }}><Checkbox size="small" checked={visibleCols.includes(c.id)} onChange={e=>setVisibleCols(e.target.checked?[...visibleCols,c.id]:visibleCols.filter(x=>x!==c.id))}/><Typography fontSize={13}>{c.label}</Typography></Box>)}
          </Box>
        </Popover>
      </Box>
      {showFilters&&(<Card sx={{ p:3, mb:2 }}><Stack spacing={2}>
        <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
          <F label="Title"><TextField size="small" value={filters.title} onChange={e=>setFilters(prev => ({ ...prev, title:e.target.value}))}/></F>
          <F label="Type"><Select size="small" displayEmpty value={filters.type} onChange={e=>setFilters(prev => ({ ...prev, type:e.target.value}))} sx={{ minWidth:150 }}>
            <MenuItem value="">--</MenuItem><MenuItem value="CMS Static Block">CMS Static Block</MenuItem><MenuItem value="Catalog New Products List">Catalog New Products List</MenuItem></Select></F>
        </Box>
        <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1 }}>
          <Button onClick={()=>{setFilters({title:'',type:''});setPage(1);}} variant="outlined" size="small" sx={{ textTransform:'none' }}>Cancel</Button>
          <Button onClick={()=>{setPage(1);fetchData();}} variant="contained" size="small" sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Apply Filters</Button>
        </Box>
      </Stack></Card>)}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Typography fontSize={13} color="text.secondary">{total} records found</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Select size="small" value={pageSize} onChange={e=>{setPageSize(e.target.value);setPage(1);}} sx={{ minWidth:80 }}>{[20,50,100,200].map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
          <Typography fontSize={13} color="text.secondary">per page</Typography>
          <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p)=>setPage(p)} size="small" siblingCount={1}/>
        </Box>
      </Box>
      <Card><TableContainer><Table size="small">
        <TableHead><TableRow>{columns.map(c=><TableCell key={c.id} sx={{ fontWeight:600 }}>{c.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{loading?<TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow>:
          data.map(row=><TableRow key={row.widget_id} hover>{columns.map(c=><TableCell key={c.id}>{
            c.id==='creation_time'||c.id==='update_time'?fmtDate(row[c.id]):
            c.id==='action'?<Typography component="a" href="#" sx={{ fontSize:13, textDecoration:'none' }}>Edit</Typography>:
            row[c.id]}</TableCell>)}</TableRow>)
        }</TableBody>
      </Table></TableContainer></Card>
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5, color:'#333' }}>{label}</Typography>{children}</Box>; }
