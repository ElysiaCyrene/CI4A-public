import { useState } from 'react';
import { Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, Stack } from '@mui/material';
import axios from 'axios';

export default function CustomerReviewsReport() {
  const [data,setData]=useState([]);
  const [showSuccess, setShowSuccess] = useState(false); const [hasSearched,setHasSearched]=useState(false);
  const [filters,setFilters]=useState({customer_name:'',review_count:''});

  const fetchReport=async()=>{setHasSearched(true);try{const params={};Object.entries(filters).forEach(([k,v])=>{if(v)params[k]=v;});const res=await axios.get('/api/reports/customer-reviews',{params});setData(res.data.items||[]);}catch(e){console.error(e);}};

  return (
    <Box>
      <Typography variant="h5" sx={{fontWeight:600,mb:3}}>Customer Reviews Report</Typography>
      <Card sx={{p:3,mb:2}}>
        <Typography variant="subtitle1" sx={{fontWeight:600,mb:2}}>Filter</Typography>
        <Stack spacing={2}>
          <Box sx={{display:'flex',gap:2,flexWrap:'wrap'}}>
            <F label="Customer Name"><TextField size="small" value={filters.customer_name} onChange={e=>setFilters(prev => ({ ...prev, customer_name:e.target.value}))}/></F>
            <F label="Review Count"><TextField size="small" type="number" value={filters.review_count} onChange={e=>setFilters(prev => ({ ...prev, review_count:e.target.value}))}/></F>
          </Box>
          <Box sx={{display:'flex',gap:1}}>
            <Button variant="contained" onClick={fetchReport} sx={{bgcolor:'#eb5202',textTransform:'none'}}>Search</Button>
            <Button variant="outlined" onClick={()=>{setFilters({customer_name:'',review_count:''});}} sx={{textTransform:'none'}}>Reset Filter</Button>
          </Box>
        </Stack>
      </Card>
      {showSuccess && (

        <Box sx={{ bgcolor:"#d4edda", color:"#155724", p:1.5, mb:2, borderRadius:1, border:"1px solid #c3e6cb" }}>

          Report generated successfully.

        </Box>

      )}
{hasSearched && (
        <Card><TableContainer><Table size="small">
          <TableHead><TableRow>{['Customer','Reviews','Avg Rating'].map(h=><TableCell key={h} sx={{fontWeight:600,bgcolor:'#514943',color:'#fff'}}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{data.map((row,i)=><TableRow key={i}>{['customer_name','review_count','avg_rating'].map(k=><TableCell key={k}>{row[k]}</TableCell>)}</TableRow>)}</TableBody>
        </Table></TableContainer></Card>
      )}
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{fontWeight:600,display:'block',mb:0.5,color:'#333'}}>{label}</Typography>{children}</Box>; }
