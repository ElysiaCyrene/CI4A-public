import { useState, useMemo } from 'react';
import { Box, Typography, Button, Select, MenuItem, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, Popover } from '@mui/material';
import SettingIcon from '@mui/icons-material/Settings';
import axios from 'axios'; import dayjs from 'dayjs'; import Ci4aDatePicker from '../components/Ci4aDatePicker';

const fmtCurrency = v => v != null ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v) : '';
const ALL_COLUMNS = [
  { id:'period_group', label:'Interval', w:150 }, { id:'shipping_method', label:'Carrier/Method' },
  { id:'orders_count', label:'Orders', align:'right' }, { id:'sales_shipping', label:'Total Sales Shipping', align:'right', fmt:fmtCurrency },
  { id:'total_shipping', label:'Total Shipping', align:'right', fmt:fmtCurrency },
];

export default function ShippingReport() {
  const [data,setData]=useState([]);
  const [showSuccess, setShowSuccess] = useState(false); const [hasSearched,setHasSearched]=useState(false);
  const [filters,setFilters]=useState({from:'',to:'',period:'year',status:'Any',emptyRows:'No'});
  const [visibleCols,setVisibleCols]=useState(ALL_COLUMNS.map(c=>c.id));
  const columns=useMemo(()=>ALL_COLUMNS.filter(c=>visibleCols.includes(c.id)),[visibleCols]);
  const [colAnchor,setColAnchor]=useState(null);

  const fetchReport = async () => { setHasSearched(true); try { const params = { period: filters.period||'year' }; if(filters.from) params.from = filters.from; if(filters.to) params.to = filters.to; const res = await axios.get('/api/reports/sales/shipping', { params }); setData(Array.isArray(res.data)?res.data:[]); setShowSuccess(true); setTimeout(()=>setShowSuccess(false),3000); } catch(e) { console.error(e); } };
  const shouldShowPeriod = i => i===0 || data[i]?.period_group !== data[i-1]?.period_group;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight:500, mb:3 }}>Shipping Report</Typography>
      <Card sx={{ p:3, mb:2 }}>
        <Box sx={{ maxWidth:500 }}>
          <F label="Period"><Select size="small" value={filters.period} onChange={e=>setFilters(prev => ({ ...prev, period:e.target.value}))} sx={{width:150}}><MenuItem value="year">Year</MenuItem><MenuItem value="month">Month</MenuItem><MenuItem value="day">Day</MenuItem></Select></F>
          <F label="From"><Ci4aDatePicker label="" size="small" value={filters.from?dayjs(filters.from):null} onChange={v=>setFilters(prev => ({ ...prev, from:v?v.format('YYYY-MM-DD'):''}))} /></F>
          <F label="To"><Ci4aDatePicker label="" size="small" value={filters.to?dayjs(filters.to):null} onChange={v=>setFilters(prev => ({ ...prev, to:v?v.format('YYYY-MM-DD'):''}))} /></F>
          <F label="Order Status"><Select size="small" value={filters.status} onChange={e=>setFilters(prev => ({ ...prev, status:e.target.value}))} sx={{width:150}}><MenuItem value="Any">Any</MenuItem><MenuItem value="pending">Pending</MenuItem><MenuItem value="processing">Processing</MenuItem><MenuItem value="complete">Complete</MenuItem><MenuItem value="closed">Closed</MenuItem></Select></F>
          <F label="Empty Rows"><Select size="small" value={filters.emptyRows} onChange={e=>setFilters(prev => ({ ...prev, emptyRows:e.target.value}))} sx={{width:120}}><MenuItem value="No">No</MenuItem><MenuItem value="Yes">Yes</MenuItem></Select></F>
          <Box sx={{ mt:2 }}><Button variant="contained" onClick={fetchReport} sx={{ bgcolor:'#eb5202', textTransform:'none', px:4 }}>Refresh</Button></Box>
        </Box>
      </Card>
      {showSuccess && (

        <Box sx={{ bgcolor:"#d4edda", color:"#155724", p:1.5, mb:2, borderRadius:1, border:"1px solid #c3e6cb" }}>

          Report generated successfully.

        </Box>

      )}
{hasSearched && (
        <Box>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
            <Typography fontSize={13} color="text.secondary">{data.length} records found</Typography>
            <Button startIcon={<SettingIcon/>} onClick={e=>setColAnchor(e.currentTarget)} size="small" variant="outlined" sx={{ textTransform:'none' }}>Columns</Button>
            <Popover open={Boolean(colAnchor)} anchorEl={colAnchor} onClose={()=>setColAnchor(null)} anchorOrigin={{ vertical:'bottom', horizontal:'left' }}>
              <Box sx={{ p:1.5, minWidth:200 }}><Typography variant="subtitle2" sx={{ mb:1 }}>Select Columns</Typography>
                {ALL_COLUMNS.map(c=><Box key={c.id} display="flex" alignItems="center" gap={0.5}><Checkbox size="small" checked={visibleCols.includes(c.id)} onChange={e=>setVisibleCols(e.target.checked?[...visibleCols,c.id]:visibleCols.filter(x=>x!==c.id))}/><Typography fontSize={13}>{c.label}</Typography></Box>)}
              </Box>
            </Popover>
          </Box>
          <Card><TableContainer><Table size="small">
            <TableHead><TableRow>{columns.map(c=><TableCell key={c.id} align={c.align||'left'} sx={{fontWeight:600,bgcolor:'#514943',color:'#fff',width:c.w}}>{c.label}</TableCell>)}</TableRow></TableHead>
            <TableBody>{data.map((row,i)=><TableRow key={i}>{columns.map(c=><TableCell key={c.id} align={c.align||'left'}>{c.id==='period_group'?(shouldShowPeriod(i)?row.period_group:''):c.fmt?c.fmt(row[c.id]):row[c.id]}</TableCell>)}</TableRow>)}</TableBody>
          </Table></TableContainer></Card>
        </Box>
      )}
    </Box>
  );
}
function F({ label, required, children }) { return (<Box sx={{display:'flex',alignItems:'center',mb:2}}><Typography sx={{width:130,fontSize:13,fontWeight:600,color:'#333',textAlign:'right',mr:2}}>{label}{required&&<span style={{color:'red'}}> *</span>}</Typography><Box>{children}</Box></Box>); }
