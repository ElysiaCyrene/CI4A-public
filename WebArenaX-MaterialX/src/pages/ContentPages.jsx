import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack, Chip, Popover } from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import SettingIcon from '@mui/icons-material/Settings';
import Add from '@mui/icons-material/Add';
import axios from 'axios';
import dayjs from 'dayjs';

const fmtDate = v => v ? dayjs(v).format('MMM D, YYYY h:mm:ss A') : '';

const ALL_COLUMNS = [
  { id:'page_id', label:'ID' }, { id:'title', label:'Title' }, { id:'identifier', label:'URL Key' },
  { id:'is_active', label:'Status' }, { id:'creation_time', label:'Created', fmt:fmtDate },
  { id:'update_time', label:'Modified', fmt:fmtDate }, { id:'action', label:'Action', w:200 },
];

export default function ContentPages({ initialFilters, onNavigate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const initF = (() => { if(initialFilters) { const {page:p,pageSize:ps,tempUpdate,newPage,...rest}=initialFilters; return rest; } return {}; })();
  const [filters, setFilters] = useState({ title:'', identifier:'', is_active:'', ...initF });
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(20); const [total, setTotal] = useState(0);
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.map(c=>c.id));
  const columns = useMemo(()=>ALL_COLUMNS.filter(c=>visibleCols.includes(c.id)),[visibleCols]);
  const [colAnchor, setColAnchor] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, ...filters };
      if(filters.is_active) params.is_active = { Enabled:1, Disabled:0 }[filters.is_active] ?? filters.is_active;
      const res = await axios.get('/api/content/pages', { params });
      let items = res.data.items || [];
      setTotal(res.data.total || 0);
      if(initialFilters?.tempUpdate){
        const idx = items.findIndex(i=>i.page_id==initialFilters.tempUpdate.page_id);
        if(idx!==-1) items[idx]={...items[idx],...initialFilters.tempUpdate};
        else if(initialFilters?.newPage) items.unshift(initialFilters.tempUpdate);
      }
      if(window.__contentPageEdit){
        const {tempUpdate, newPage} = window.__contentPageEdit;
        if(newPage) items.unshift(tempUpdate);
        else {
          const idx = items.findIndex(i=>i.page_id==tempUpdate.page_id);
          if(idx!==-1) items[idx]={...items[idx],...tempUpdate};
        }
      }
      setData(items);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData().then(()=>{ window.__contentPageEdit = null; }); }, [page, pageSize]);
  useEffect(() => { if(initialFilters) { const {page:p,pageSize:ps}=initialFilters; if(p)setPage(p); if(ps)setPageSize(ps); } }, []);

  const resetFilters = () => { setFilters({ title:'', identifier:'', is_active:'' }); setPage(1); fetchData(); };
  const applyFilters = () => { setPage(1); fetchData(); };
  const handleDelete = (record) => { setData(d=>d.filter(i=>i.page_id!==record.page_id)); setTotal(t=>t-1); };

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:3 }}>
        <Typography variant="h5" sx={{ fontWeight:600 }}>Pages</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={()=>onNavigate?.('content_page_edit',{id:'new'})}
          sx={{ bgcolor:'#eb5202', textTransform:'none', fontWeight:600, '&:hover':{bgcolor:'#d44902'} }}>Add New Page</Button>
      </Box>

      <Box sx={{ display:'flex', gap:1, mb:2, justifyContent:'flex-end' }}>
        <Button startIcon={<FilterIcon />} onClick={()=>setShowFilters(!showFilters)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Filters</Button>
        <Button startIcon={<SettingIcon />} onClick={e=>setColAnchor(e.currentTarget)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Columns</Button>
        <Popover open={Boolean(colAnchor)} anchorEl={colAnchor} onClose={()=>setColAnchor(null)} anchorOrigin={{ vertical:'bottom', horizontal:'left' }}>
          <Box sx={{ p:1.5, minWidth:200 }}>
            <Typography variant="subtitle2" sx={{ mb:1 }}>Select Columns</Typography>
            {ALL_COLUMNS.map(c=><Box key={c.id} sx={{ display:'flex', alignItems:'center', gap:0.5 }}><Checkbox size="small" checked={visibleCols.includes(c.id)} onChange={e=>setVisibleCols(e.target.checked?[...visibleCols,c.id]:visibleCols.filter(x=>x!==c.id))}/><Typography fontSize={13}>{c.label}</Typography></Box>)}
          </Box>
        </Popover>
      </Box>

      {showFilters && (
        <Card sx={{ p:3, mb:2 }}>
          <Stack spacing={2}>
            <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
              <F label="Title"><TextField size="small" value={filters.title} onChange={e=>setFilters(prev => ({ ...prev, title:e.target.value}))}/></F>
              <F label="URL Key"><TextField size="small" value={filters.identifier} onChange={e=>setFilters(prev => ({ ...prev, identifier:e.target.value}))}/></F>
              <F label="Status"><Select size="small" displayEmpty value={filters.is_active} onChange={e=>setFilters(prev => ({ ...prev, is_active:e.target.value}))} sx={{ minWidth:150 }}>
                <MenuItem value="">--</MenuItem><MenuItem value="Enabled">Enabled</MenuItem><MenuItem value="Disabled">Disabled</MenuItem>
              </Select></F>
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
        <TableHead><TableRow>{columns.map(c=><TableCell key={c.id} sx={{ fontWeight:600, width:c.w }}>{c.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{loading?<TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow>:
          data.map(row=><TableRow key={row.page_id} hover>
            {columns.map(c=><TableCell key={c.id}>{
              c.id==='is_active'?<Chip label={row.is_active?'Enabled':'Disabled'} color={row.is_active?'success':'error'} size="small" variant="outlined"/>:
              c.id==='creation_time'||c.id==='update_time'?fmtDate(row[c.id]):
              c.id==='action'?<Box sx={{ display:'flex', gap:0.5 }}>
                <Typography component="a" href="#" onClick={e=>{e.preventDefault();onNavigate?.('content_page_edit',{id:row.page_id,savedState:{...filters,page,pageSize}});}} sx={{ fontSize:13, textDecoration:'none' }}>Edit</Typography>
                <Typography sx={{ color:'#ccc' }}>|</Typography>
                <Typography component="a" href="#" onClick={e=>{e.preventDefault();handleDelete(row);}} sx={{ fontSize:13, textDecoration:'none', color:'red' }}>Delete</Typography>
                <Typography sx={{ color:'#ccc' }}>|</Typography>
                <Typography component="a" href="#" onClick={e=>{e.preventDefault();onNavigate?.('content_page_view',{id:row.page_id,savedState:{...filters,page,pageSize}});}} sx={{ fontSize:13, textDecoration:'none' }}>View</Typography>
              </Box>:
              row[c.id]
            }</TableCell>)}
          </TableRow>)
        }</TableBody>
      </Table></TableContainer></Card>
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5, color:'#333' }}>{label}</Typography>{children}</Box>; }
