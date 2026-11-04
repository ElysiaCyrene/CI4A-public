import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack } from '@mui/material';
import axios from 'axios'; import dayjs from 'dayjs'; import Ci4aDatePicker from '../components/Ci4aDatePicker';

const fmtDate = v => v ? dayjs(v).format('MMM D, YYYY h:mm A') : '';
const truncate = (t,n=20) => { if(!t) return ''; const w=t.split(/\s+/); return w.length>n?w.slice(0,n).join(' ')+'...':t; };

export default function PendingReviews({ onNavigate }) {
  const [data,setData]=useState([]); const [loading,setLoading]=useState(false);
  const [filters,setFilters]=useState({id:'',created_from:'',created_to:'',status:'Pending',title:'',nickname:'',review:'',type:'',product:'',sku:''});
  const [page,setPage]=useState(1); const [pageSize,setPageSize]=useState(20); const [total,setTotal]=useState(0);

  const fetchData = async () => { setLoading(true); try { const params = { page, pageSize }; Object.entries(filters).forEach(([k,v])=>{if(v)params[k]=v;}); const res = await axios.get('/api/reviews', { params }); setData(res.data.items||[]); setTotal(res.data.total||0); } catch(e) { console.error(e); } finally { setLoading(false); } };
  useEffect(()=>{fetchData();},[page,pageSize]);

  const cols = [
    { id:'review_id', label:'ID', w:60 }, { id:'created_at', label:'Created', w:140, fmt:fmtDate },
    { id:'status_name', label:'Status', w:90 }, { id:'title', label:'Title', w:120 },
    { id:'nickname', label:'Nickname', w:100 }, { id:'detail', label:'Review' },
    { id:'type', label:'Type', w:80 }, { id:'product_name', label:'Product', w:150 },
    { id:'sku', label:'SKU', w:90 }, { id:'action', label:'Action', w:80 },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight:500, mb:3 }}>Pending Reviews</Typography>
      <Card sx={{ p:3, mb:2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight:600, mb:2 }}>Filter</Typography>
        <Stack spacing={2}>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
            <F label="ID"><TextField size="small" value={filters.id} onChange={e=>setFilters(prev => ({ ...prev, id:e.target.value}))}/></F>
            <F label="Status"><Select size="small" displayEmpty value={filters.status} onChange={e=>setFilters(prev => ({ ...prev, status:e.target.value}))} sx={{minWidth:150}}><MenuItem value="">--</MenuItem><MenuItem value="Pending">Pending</MenuItem></Select></F>
            <F label="Created From"><Ci4aDatePicker label="" size="small" value={filters.created_from?dayjs(filters.created_from):null} onChange={v=>setFilters(prev => ({ ...prev, created_from:v?v.format('YYYY-MM-DD'):''}))}/></F>
            <F label="Created To"><Ci4aDatePicker label="" size="small" value={filters.created_to?dayjs(filters.created_to):null} onChange={v=>setFilters(prev => ({ ...prev, created_to:v?v.format('YYYY-MM-DD'):''}))}/></F>
            <F label="Title"><TextField size="small" value={filters.title} onChange={e=>setFilters(prev => ({ ...prev, title:e.target.value}))}/></F>
            <F label="Nickname"><TextField size="small" value={filters.nickname} onChange={e=>setFilters(prev => ({ ...prev, nickname:e.target.value}))}/></F>
          </Box>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
            <F label="Type"><Select size="small" displayEmpty value={filters.type} onChange={e=>setFilters(prev => ({ ...prev, type:e.target.value}))} sx={{minWidth:150}}><MenuItem value="">--</MenuItem><MenuItem value="Customer">Customer</MenuItem><MenuItem value="Guest">Guest</MenuItem></Select></F>
            <F label="Product"><TextField size="small" value={filters.product} onChange={e=>setFilters(prev => ({ ...prev, product:e.target.value}))}/></F>
            <F label="SKU"><TextField size="small" value={filters.sku} onChange={e=>setFilters(prev => ({ ...prev, sku:e.target.value}))}/></F>
            <F label="Review"><TextField size="small" value={filters.review} onChange={e=>setFilters(prev => ({ ...prev, review:e.target.value}))}/></F>
          </Box>
          <Box sx={{ display:'flex', gap:1 }}>
            <Button variant="contained" onClick={()=>{setPage(1);fetchData();}} sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Search</Button>
            <Button variant="outlined" onClick={()=>{setFilters({id:'',created_from:'',created_to:'',status:'Pending',title:'',nickname:'',review:'',type:'',product:'',sku:''});setPage(1);}} sx={{ textTransform:'none' }}>Reset Filter</Button>
          </Box>
        </Stack>
      </Card>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
        <Typography fontSize={13} color="text.secondary">{total} records found</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Select size="small" value={pageSize} onChange={e=>{setPageSize(e.target.value);setPage(1);}} sx={{minWidth:80}}>{[20,50,100].map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
          <Typography fontSize={13} color="text.secondary">per page</Typography>
          <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p)=>setPage(p)} size="small" siblingCount={1}/>
        </Box>
      </Box>
      <Card><TableContainer><Table size="small">
        <TableHead><TableRow sx={{bgcolor:'#514943'}}>{cols.map(c=><TableCell key={c.id} sx={{fontWeight:600,color:'#fff',width:c.w}}>{c.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{loading?<TableRow><TableCell colSpan={cols.length} align="center" sx={{py:4}}>Loading...</TableCell></TableRow>:
          data.map(row=><TableRow key={row.review_id} hover>{cols.map(c=><TableCell key={c.id}>{c.id==='detail'?truncate(row[c.id]):c.id==='created_at'?fmtDate(row[c.id]):c.id==='action'?<Typography component="a" href="#" onClick={e=>{e.preventDefault();onNavigate?.('marketing_review_edit',{id:row.review_id,sourcePage:'marketing_pending_reviews'});}} sx={{fontSize:13,textDecoration:'none'}}>Edit</Typography>:row[c.id]}</TableCell>)}</TableRow>)}
        </TableBody>
      </Table></TableContainer></Card>
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{fontWeight:600,display:'block',mb:0.5,color:'#333'}}>{label}</Typography>{children}</Box>; }
