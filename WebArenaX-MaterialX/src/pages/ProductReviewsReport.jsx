import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack } from '@mui/material';
import axios from 'axios'; import dayjs from 'dayjs'; import Ci4aDatePicker from '../components/Ci4aDatePicker';

const fmtNumber = v => v != null ? parseFloat(v).toFixed(4) : 'N/A';
const fmtDate = v => v ? dayjs(v).format('MMM D, YYYY h:mm A') : '';

export default function ProductReviewsReport({ onNavigate }) {
  const [data,setData]=useState([]);
  const [showSuccess, setShowSuccess] = useState(false); const [loading,setLoading]=useState(false);
  const [filters,setFilters]=useState({id:'',product:'',reviews_count:'',avg_rating:'',avg_rating_approved:'',last_review_from:'',last_review_to:''});
  const [page,setPage]=useState(1); const [pageSize,setPageSize]=useState(20); const [total,setTotal]=useState(0);

  const fetchReport = async () => { setLoading(true); try { const params = { page, pageSize }; Object.entries(filters).forEach(([k,v])=>{if(v)params[k]=v;}); const res = await axios.get('/api/reports/product-reviews', { params }); setData(res.data.items||[]); setTotal(res.data.total||0); } catch(e) { console.error(e); } finally { setLoading(false); } };

  useEffect(() => { fetchReport(); }, [page, pageSize]);

  const handleSearch = () => { setPage(1); fetchReport(); };
  const handleReset = () => { setFilters({id:'',product:'',reviews_count:'',avg_rating:'',avg_rating_approved:'',last_review_from:'',last_review_to:''}); setPage(1); };
  const showReviews = (record) => { onNavigate?.('marketing_all_reviews', { product: record.product_name }); };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight:500, mb:3 }}>Product Reviews Report</Typography>

      <Card sx={{ p:3, mb:2 }}>
        <Stack spacing={2}>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
            <F label="ID"><TextField size="small" value={filters.id} onChange={e=>setFilters(prev => ({ ...prev, id:e.target.value}))}/></F>
            <F label="Product"><TextField size="small" placeholder="Product Name" value={filters.product} onChange={e=>setFilters(prev => ({ ...prev, product:e.target.value}))}/></F>
            <F label="Reviews"><TextField size="small" placeholder="Count" value={filters.reviews_count} onChange={e=>setFilters(prev => ({ ...prev, reviews_count:e.target.value}))}/></F>
            <F label="Average"><TextField size="small" placeholder="Average" value={filters.avg_rating} onChange={e=>setFilters(prev => ({ ...prev, avg_rating:e.target.value}))}/></F>
            <F label="Avg (Approved)"><TextField size="small" placeholder="Avg (Approved)" value={filters.avg_rating_approved} onChange={e=>setFilters(prev => ({ ...prev, avg_rating_approved:e.target.value}))}/></F>
          </Box>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
            <F label="Last Review From"><Ci4aDatePicker label="From" size="small" value={filters.last_review_from?dayjs(filters.last_review_from):null} onChange={v=>setFilters(prev => ({ ...prev, last_review_from:v?v.format('YYYY-MM-DD'):''}))}/></F>
            <F label="Last Review To"><Ci4aDatePicker label="To" size="small" value={filters.last_review_to?dayjs(filters.last_review_to):null} onChange={v=>setFilters(prev => ({ ...prev, last_review_to:v?v.format('YYYY-MM-DD'):''}))}/></F>
          </Box>
          <Box sx={{ display:'flex', gap:1 }}>
            <Button variant="contained" onClick={handleSearch} sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Search</Button>
            <Button variant="outlined" onClick={handleReset} sx={{ textTransform:'none' }}>Reset Filter</Button>
          </Box>
        </Stack>
      </Card>

      <Card>
        <Box sx={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:1, p:2, borderBottom:'1px solid #f0f0f0' }}>
          <Typography fontSize={13} color="text.secondary" sx={{ mr:'auto' }}>Export to:</Typography>
          <Select size="small" defaultValue="csv" sx={{ width:100 }}><MenuItem value="csv">CSV</MenuItem><MenuItem value="excel">Excel</MenuItem></Select>
          <Button size="small" variant="outlined" sx={{ textTransform:'none' }}>Export</Button>
        </Box>
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ bgcolor:'#514943' }}>
            {['ID','Product','Reviews','Average','Average (Approved)','Last Review','Action'].map(h=><TableCell key={h} sx={{ fontWeight:600, color:'#fff' }}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>{loading?<TableRow><TableCell colSpan={7} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow>:
            data.map(row=>(
              <TableRow key={row.product_id} hover sx={{ cursor:'pointer' }} onClick={()=>showReviews(row)}>
                <TableCell>{row.product_id}</TableCell>
                <TableCell>{row.product_name}</TableCell>
                <TableCell align="right">{row.review_count}</TableCell>
                <TableCell align="right">{fmtNumber(row.avg_rating)}</TableCell>
                <TableCell align="right">{fmtNumber(row.avg_rating_approved)}</TableCell>
                <TableCell>{fmtDate(row.last_review)}</TableCell>
                <TableCell><Typography component="a" href="#" onClick={e=>{e.stopPropagation();showReviews(row);}} sx={{ fontSize:13, textDecoration:'none' }}>Show Reviews</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
        <Box sx={{ display:'flex', justifyContent:'flex-end', p:2 }}>
          <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p)=>setPage(p)} size="small" siblingCount={1}/>
        </Box>
      </Card>
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{fontWeight:600,display:'block',mb:0.5,color:'#333'}}>{label}</Typography>{children}</Box>; }
