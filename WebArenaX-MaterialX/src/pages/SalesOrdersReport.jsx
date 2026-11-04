import { useState, useMemo } from 'react';
import { Box, Typography, Button, Select, MenuItem, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter, Card, Popover } from '@mui/material';
import SettingIcon from '@mui/icons-material/Settings';
import axios from 'axios'; import dayjs from 'dayjs'; import Ci4aDatePicker from '../components/Ci4aDatePicker';

const fmtCurrency = v => v != null ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v) : '';
const ALL_COLUMNS = [
  { id:'period', label:'Interval', w:150 }, { id:'orders_count', label:'Orders', align:'right' }, { id:'sales_items', label:'Sales Items', align:'right' },
  { id:'sales_total', label:'Sales Total', align:'right', fmt:fmtCurrency }, { id:'invoiced', label:'Invoiced', align:'right', fmt:fmtCurrency },
  { id:'refunded', label:'Refunded', align:'right', fmt:fmtCurrency }, { id:'sales_tax', label:'Sales Tax', align:'right', fmt:fmtCurrency },
  { id:'sales_shipping', label:'Sales Shipping', align:'right', fmt:fmtCurrency }, { id:'sales_discount', label:'Sales Discount', align:'right', fmt:fmtCurrency },
  { id:'canceled', label:'Canceled', align:'right' },
];

export default function SalesOrdersReport() {
  const [data,setData]=useState([]); const [loading,setLoading]=useState(false); const [hasSearched,setHasSearched]=useState(false);
  const [filters,setFilters]=useState({period:'day',from:'',to:'',status:'Any',emptyRows:'No',showActualValues:'No'});
  const [visibleCols,setVisibleCols]=useState(ALL_COLUMNS.map(c=>c.id));
  const columns=useMemo(()=>ALL_COLUMNS.filter(c=>visibleCols.includes(c.id)),[visibleCols]);
  const [colAnchor,setColAnchor]=useState(null);

  const fetchReport = async () => {
    setLoading(true); setHasSearched(true);
    try {
      const params = { period: filters.period||'day', from: filters.from, to: filters.to, status: filters.status||'Any' };
      const res = await axios.get('/api/reports/sales/orders', { params });
      setData((Array.isArray(res.data)?res.data:[]).map((item,i)=>({...item,id:i})));
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const fetchWithSuccess = () => { fetchReport(); setShowSuccess(true); setTimeout(()=>setShowSuccess(false),3000); };

  const shouldShowPeriod = (i) => i===0 || data[i].period !== data[i-1].period;
  const totals = useMemo(() => {
    const t={orders_count:0,sales_items:0,sales_total:0,invoiced:0,refunded:0,sales_tax:0,sales_shipping:0,sales_discount:0,canceled:0};
    data.forEach(r=>{t.orders_count+=+r.orders_count||0;t.sales_items+=+r.sales_items||0;t.sales_total+=+r.sales_total||0;t.invoiced+=+r.invoiced||0;t.refunded+=+r.refunded||0;t.sales_tax+=+r.sales_tax||0;t.sales_shipping+=+r.sales_shipping||0;t.sales_discount+=+r.sales_discount||0;t.canceled+=+r.canceled||0;});
    return t;
  },[data]);

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:3 }}>
        <Typography variant="h5" sx={{ fontWeight:500 }}>Orders Report</Typography>
        <Button variant="contained" onClick={fetchWithSuccess} sx={{ bgcolor:'#eb5202', textTransform:'none', px:4 }}>Show Report</Button>
      </Box>

      <Card sx={{ p:3, mb:2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight:600, mb:2 }}>Filter</Typography>
        <Box sx={{ maxWidth:500 }}>
          <F label="Date Used">
            <Select size="small" value="Order Created" disabled sx={{ width:200 }}>
              <MenuItem value="Order Created">Order Created</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt:0.5 }}>
              The Order Updated report is created in real time and does not require a refresh.
            </Typography>
          </F>
          <F label="Period"><Select size="small" value={filters.period} onChange={e=>setFilters(prev => ({...prev,period:e.target.value}))} sx={{ width:150 }}><MenuItem value="day">Day</MenuItem><MenuItem value="month">Month</MenuItem><MenuItem value="year">Year</MenuItem></Select></F>
          <F label="From" required><Ci4aDatePicker label="" size="small" value={filters.from?dayjs(filters.from):null} onChange={v=>setFilters(prev => ({...prev,from:v&&v.format('YYYY-MM-DD')||''}))}/></F>
          <F label="To" required><Ci4aDatePicker label="" size="small" value={filters.to?dayjs(filters.to):null} onChange={v=>setFilters(prev => ({...prev,to:v&&v.format('YYYY-MM-DD')||''}))}/></F>
          <F label="Order Status">
            <Select size="small" value={filters.status} onChange={e=>setFilters(prev => ({...prev,status:e.target.value}))} sx={{ width:180 }}>
              <MenuItem value="Any">Any</MenuItem><MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem><MenuItem value="complete">Complete</MenuItem>
              <MenuItem value="closed">Closed</MenuItem><MenuItem value="canceled">Canceled</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt:0.5 }}>
              Applies to Any of the Specified Order Statuses except canceled orders
            </Typography>
          </F>
          <F label="Empty Rows"><Select size="small" value={filters.emptyRows} onChange={e=>setFilters(prev => ({...prev,emptyRows:e.target.value}))} sx={{ width:120 }}><MenuItem value="No">No</MenuItem><MenuItem value="Yes">Yes</MenuItem></Select></F>
          <F label="Show Actual Values"><Select size="small" value={filters.showActualValues} onChange={e=>setFilters(prev => ({...prev,showActualValues:e.target.value}))} sx={{ width:120 }}><MenuItem value="No">No</MenuItem><MenuItem value="Yes">Yes</MenuItem></Select></F>
        </Box>
      </Card>

      {showSuccess && (
        <Box sx={{ bgcolor:'#d4edda', color:'#155724', p:1.5, mb:2, borderRadius:1, border:'1px solid #c3e6cb' }}>
          Report generated successfully.
        </Box>
      )}
      {hasSearched && (
        <Box>
          <Typography fontSize={13} color="text.secondary" sx={{ mb:1 }}>{data.length} records found</Typography>
          <Card sx={{ mb:2, p:1, display:'flex', justifyContent:'flex-end', gap:1 }}>
            <Typography fontSize={13} color="text.secondary" sx={{ mr:'auto', alignSelf:'center' }}>Export to:</Typography>
            <Select size="small" defaultValue="csv" sx={{ width:100 }}><MenuItem value="csv">CSV</MenuItem><MenuItem value="excel">Excel</MenuItem></Select>
            <Button size="small" variant="outlined" sx={{ textTransform:'none' }}>Export</Button>
            <Button startIcon={<SettingIcon/>} onClick={e=>setColAnchor(e.currentTarget)} size="small" variant="outlined" sx={{ textTransform:'none' }}>Columns</Button>
            <Popover open={Boolean(colAnchor)} anchorEl={colAnchor} onClose={()=>setColAnchor(null)} anchorOrigin={{ vertical:'bottom', horizontal:'left' }}>
              <Box sx={{ p:1.5, minWidth:200 }}><Typography variant="subtitle2" sx={{ mb:1 }}>Select Columns</Typography>
                {ALL_COLUMNS.map(c=><Box key={c.id} display="flex" alignItems="center" gap={0.5}><Checkbox size="small" checked={visibleCols.includes(c.id)} onChange={e=>setVisibleCols(e.target.checked?[...visibleCols,c.id]:visibleCols.filter(x=>x!==c.id))}/><Typography fontSize={13}>{c.label}</Typography></Box>)}
              </Box>
            </Popover>
          </Card>
          <Card><TableContainer><Table size="small">
            <TableHead><TableRow>{columns.map(c=><TableCell key={c.id} align={c.align||'left'} sx={{fontWeight:600,bgcolor:'#514943',color:'#fff',width:c.w}}>{c.label}</TableCell>)}</TableRow></TableHead>
            <TableBody>{data.map((row,i)=><TableRow key={i}>{columns.map(c=><TableCell key={c.id} align={c.align||'left'}>{c.id==='period'?(shouldShowPeriod(i)?row.period:''):c.fmt?c.fmt(row[c.id]):row[c.id]}</TableCell>)}</TableRow>)}</TableBody>
            {data.length>0&&<TableFooter><TableRow sx={{bgcolor:'#514943','& td':{color:'#fff',fontWeight:'bold'}}}><TableCell sx={{color:'#fff',fontWeight:'bold'}}>Total</TableCell>{columns.filter(c=>c.id!=='period').map(c=><TableCell key={c.id} align={c.align||'right'} sx={{color:'#fff',fontWeight:'bold'}}>{c.fmt&&totals[c.id]!=null?c.fmt(totals[c.id]):totals[c.id]}</TableCell>)}</TableRow></TableFooter>}
          </Table></TableContainer></Card>
        </Box>
      )}
    </Box>
  );
}
function F({ label, required, children }) { return (<Box sx={{display:'flex',alignItems:'center',mb:2}}><Typography sx={{width:140,fontSize:13,fontWeight:600,color:'#333',textAlign:'right',mr:2}}>{label}{required&&<span style={{color:'red'}}> *</span>}</Typography><Box sx={{flex:1}}>{children}</Box></Box>); }
