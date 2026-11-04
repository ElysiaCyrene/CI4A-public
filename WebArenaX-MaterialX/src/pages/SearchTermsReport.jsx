import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card } from '@mui/material';
import axios from 'axios';

const getStoreName = (id) => id == 1 ? 'Main Website\nMain Website Store\nDefault Store View' : `Store ID: ${id}`;

export default function SearchTermsReport() {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(20); const [total, setTotal] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filters, setFilters] = useState({ query_text:'', store_id:'', num_results_from:'', num_results_to:'', popularity_from:'', popularity_to:'' });

  const fetchData = async () => { setLoading(true); try { const params = { page, pageSize, ...filters }; const res = await axios.get('/api/search-terms', { params }); setData(res.data.items||[]); setTotal(res.data.total||0); setShowSuccess(true); setTimeout(()=>setShowSuccess(false),3000); } catch(e) { console.error(e); } finally { setLoading(false); } };
  useEffect(()=>{fetchData();},[page,pageSize]);

  const cols = [
    { id:'query_id', label:'ID', w:80 }, { id:'query_text', label:'Search Query' },
    { id:'store_id', label:'Store' }, { id:'num_results', label:'Results', w:150 },
    { id:'popularity', label:'Hits', w:150 },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight:300, mb:3, color:'#303030' }}>Search Terms Report</Typography>
      <Card sx={{ p:2, mb:2, display:'flex', gap:1, alignItems:'center', flexWrap:'wrap' }}>
        <Button variant="contained" onClick={()=>{setPage(1);fetchData();}} sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Search</Button>
        <Button variant="text" onClick={()=>{setFilters({query_text:'',store_id:'',num_results_from:'',num_results_to:'',popularity_from:'',popularity_to:''});setPage(1);}} sx={{ textTransform:'none', color:'#007bdb' }}>Reset Filter</Button>
        <Typography fontSize={13} color="text.secondary" sx={{ ml:2 }}>{total} records found</Typography>
        <Box sx={{ flex:1 }}/>
        <Select size="small" value={pageSize} onChange={e=>{setPageSize(e.target.value);setPage(1);}} sx={{ minWidth:70 }}>{[20,50,100].map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
        <Typography fontSize={13} color="text.secondary">per page</Typography>
        <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p)=>setPage(p)} size="small" siblingCount={1}/>
      </Card>
      <Card>
        <TableContainer><Table size="small">
          <TableHead>
            <TableRow>
              {cols.map(c => <TableCell key={c.id} sx={{ fontWeight:600, bgcolor:'#514943', color:'#fff', width:c.w }}>{c.label}</TableCell>)}
            </TableRow>
            <TableRow>
              {cols.map(c => <TableCell key={`f-${c.id}`} sx={{ bgcolor:'#514943', py:0.5 }}>
                {c.id==='query_text'?<TextField size="small" placeholder="Filter" value={filters.query_text} onChange={e=>setFilters(prev => ({ ...prev, query_text:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&(setPage(1),fetchData())} sx={{ bgcolor:'#fff', borderRadius:0 }}/>:
                 c.id==='num_results'?<Box sx={{ display:'flex', flexDirection:'column', gap:0.3 }}><TextField size="small" placeholder="From" value={filters.num_results_from} onChange={e=>setFilters(prev => ({ ...prev, num_results_from:e.target.value}))} sx={{ bgcolor:'#fff', borderRadius:0, width:70 }} inputProps={{ style:{fontSize:12} }}/><TextField size="small" placeholder="To" value={filters.num_results_to} onChange={e=>setFilters(prev => ({ ...prev, num_results_to:e.target.value}))} sx={{ bgcolor:'#fff', borderRadius:0, width:70 }} inputProps={{ style:{fontSize:12} }}/></Box>:
                 c.id==='popularity'?<Box sx={{ display:'flex', flexDirection:'column', gap:0.3 }}><TextField size="small" placeholder="From" value={filters.popularity_from} onChange={e=>setFilters(prev => ({ ...prev, popularity_from:e.target.value}))} sx={{ bgcolor:'#fff', borderRadius:0, width:70 }} inputProps={{ style:{fontSize:12} }}/><TextField size="small" placeholder="To" value={filters.popularity_to} onChange={e=>setFilters(prev => ({ ...prev, popularity_to:e.target.value}))} sx={{ bgcolor:'#fff', borderRadius:0, width:70 }} inputProps={{ style:{fontSize:12} }}/></Box>:
                 null}
              </TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>{loading?<TableRow><TableCell colSpan={cols.length} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow>:
            data.map((row,i)=><TableRow key={i}>{cols.map(c=><TableCell key={c.id}>{
              c.id==='store_id'?<Box sx={{ whiteSpace:'pre-line', fontSize:12 }}>{getStoreName(row.store_id)}</Box>:row[c.id]
            }</TableCell>)}</TableRow>)}
          </TableBody>
        </Table></TableContainer>
      </Card>
    </Box>
  );
}
