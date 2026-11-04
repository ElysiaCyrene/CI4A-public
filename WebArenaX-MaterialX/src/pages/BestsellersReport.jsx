import { useState, useMemo } from 'react';
import { Box, Typography, Button, Select, MenuItem, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, Popover } from '@mui/material';
import SettingIcon from '@mui/icons-material/Settings';
import axios from 'axios'; import dayjs from 'dayjs'; import Ci4aDatePicker from '../components/Ci4aDatePicker';

const fmtCurrency = v => v != null ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v) : '';
const ALL_COLUMNS = [
  { id:'period_group', label:'Interval' }, { id:'product_name', label:'Product' },
  { id:'price', label:'Price', align:'right', fmt:fmtCurrency }, { id:'qty_ordered', label:'Order Quantity', align:'right' },
];

export default function BestsellersReport() {
  const [data,setData] = useState([]); const [loading,setLoading] = useState(false); const [hasSearched,setHasSearched] = useState(false); const [showSuccess,setShowSuccess] = useState(false);
  const [filters,setFilters] = useState({ period:'day', from:'', to:'', emptyRows:'No' });
  const [visibleCols,setVisibleCols] = useState(ALL_COLUMNS.map(c=>c.id));
  const columns = useMemo(()=>ALL_COLUMNS.filter(c=>visibleCols.includes(c.id)),[visibleCols]);
  const [colAnchor,setColAnchor] = useState(null);

  const fetchReport = async () => { setLoading(true); setHasSearched(true); try { const res = await axios.get('/api/reports/products/bestsellers', { params: filters }); setData(Array.isArray(res.data)?res.data:[]); setShowSuccess(true); setTimeout(()=>setShowSuccess(false),3000); } catch(e) { console.error(e); } finally { setLoading(false); } };

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:3 }}>
        <Typography variant="h5" sx={{ fontWeight:600 }}>Bestsellers Report</Typography>
        <Button variant="contained" onClick={fetchReport} sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Show Report</Button>
      </Box>

      <Card sx={{ p:3, mb:2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight:600, mb:2, borderBottom:'1px solid #e3e3e3', pb:1 }}>Filter</Typography>
        <Box sx={{ maxWidth:500 }}>
          <FRow label="Period">
            <Select size="small" value={filters.period} onChange={e=>setFilters(prev => ({ ...prev, period:e.target.value}))} sx={{ width:150 }}>
              <MenuItem value="day">Day</MenuItem><MenuItem value="month">Month</MenuItem><MenuItem value="year">Year</MenuItem>
            </Select>
          </FRow>
          <FRow label="From" required>
            <Ci4aDatePicker label="" size="small" value={filters.from?dayjs(filters.from):null} onChange={v=>setFilters(prev => ({ ...prev, from:v?v.format('YYYY-MM-DD'):''}))}/>
          </FRow>
          <FRow label="To" required>
            <Ci4aDatePicker label="" size="small" value={filters.to?dayjs(filters.to):null} onChange={v=>setFilters(prev => ({ ...prev, to:v?v.format('YYYY-MM-DD'):''}))}/>
          </FRow>
          <FRow label="Empty Rows">
            <Select size="small" value={filters.emptyRows} onChange={e=>setFilters(prev => ({ ...prev, emptyRows:e.target.value}))} sx={{ width:150 }}>
              <MenuItem value="No">No</MenuItem><MenuItem value="Yes">Yes</MenuItem>
            </Select>
          </FRow>
        </Box>
      </Card>

      <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1, mb:1 }}>
        <Typography fontSize={13} color="text.secondary" sx={{ mr:'auto' }}>Export to:</Typography>
        <Select size="small" defaultValue="CSV" sx={{ width:80 }}><MenuItem value="CSV">CSV</MenuItem><MenuItem value="Excel">Excel XML</MenuItem></Select>
        <Button size="small" variant="outlined" sx={{ textTransform:'none' }}>Export</Button>
        <Button startIcon={<SettingIcon/>} onClick={e=>setColAnchor(e.currentTarget)} size="small" variant="outlined" sx={{ textTransform:'none' }}>Columns</Button>
        <Popover open={Boolean(colAnchor)} anchorEl={colAnchor} onClose={()=>setColAnchor(null)} anchorOrigin={{ vertical:'bottom', horizontal:'left' }}>
          <Box sx={{ p:1.5, minWidth:200 }}><Typography variant="subtitle2" sx={{ mb:1 }}>Select Columns</Typography>
            {ALL_COLUMNS.map(c=><Box key={c.id} display="flex" alignItems="center" gap={0.5}><Checkbox size="small" checked={visibleCols.includes(c.id)} onChange={e=>setVisibleCols(e.target.checked?[...visibleCols,c.id]:visibleCols.filter(x=>x!==c.id))}/><Typography fontSize={13}>{c.label}</Typography></Box>)}
          </Box>
        </Popover>
      </Box>

      {showSuccess && (


        <Box sx={{ bgcolor:"#d4edda", color:"#155724", p:1.5, mb:2, borderRadius:1, border:"1px solid #c3e6cb" }}>


          Report generated successfully.


        </Box>


      )}
{hasSearched && (data.length===0 ? <Typography color="text.secondary">0 records found</Typography> :
        <Card><TableContainer><Table size="small">
          <TableHead><TableRow>{columns.map(c=><TableCell key={c.id} align={c.align||'left'} sx={{ fontWeight:600, bgcolor:'#514943', color:'#fff' }}>{c.label}</TableCell>)}</TableRow></TableHead>
          <TableBody>{loading?<TableRow><TableCell colSpan={columns.length} align="center">Loading...</TableCell></TableRow>:data.map((row,i)=><TableRow key={i}>{columns.map(c=><TableCell key={c.id} align={c.align||'left'}>{c.fmt?c.fmt(row[c.id]):row[c.id]}</TableCell>)}</TableRow>)}</TableBody>
        </Table></TableContainer></Card>
      )}
    </Box>
  );
}

function FRow({ label, required, children }) {
  return (
    <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
      <Typography sx={{ width:120, fontSize:13, fontWeight:600, color:'#333', textAlign:'right', mr:2 }}>
        {label}{required && <span style={{ color:'red' }}> *</span>}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );
}
