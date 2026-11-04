import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack, Popover } from '@mui/material';
import SettingIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import dayjs from 'dayjs';
import Ci4aDatePicker from '../components/Ci4aDatePicker';

const ALL_COLUMNS = [
  { id:'review_id', label:'ID', w:60 }, { id:'created_at', label:'Created', w:140, fmt: v => dayjs(v).format('MMM D, YYYY h:mm A') },
  { id:'status_name', label:'Status', w:90 }, { id:'title', label:'Title', w:120 },
  { id:'nickname', label:'Nickname', w:100 }, { id:'detail', label:'Review' },
  { id:'store_names', label:'Visibility', w:120 }, { id:'type', label:'Type', w:80 },
  { id:'product_name', label:'Product', w:150 }, { id:'sku', label:'SKU', w:90 },
  { id:'action', label:'Action', w:70 },
];

const fmtDate = v => v ? dayjs(v).format('MMM D, YYYY h:mm A') : '';
const truncate = (text, n=20) => { if(!text) return ''; const w=text.split(/\s+/); return w.length>n ? w.slice(0,n).join(' ')+'...' : text; };

export default function AllReviews({ initialFilters, onNavigate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const initDeleted = initialFilters?.deletedIds || [];
  const [deletedIds, setDeletedIds] = useState(initDeleted);
  const [bulkAction, setBulkAction] = useState('');
  const [targetStatus, setTargetStatus] = useState('');
  const initFilter = (initialFilters && (() => { const {page:p,pageSize:ps,tempUpdate,deletedIds:dIds,...rest}=initialFilters; return rest; })()) || {};
  const [filters, setFilters] = useState({ id:'', created_from:'', created_to:'', status:'', title:'', nickname:'', review:'', visibility:'', type:'', product:'', sku:'', customer_id:'', ...initFilter });
  const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(20); const [total, setTotal] = useState(0);
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.map(c=>c.id));
  const columns = useMemo(() => ALL_COLUMNS.filter(c => visibleCols.includes(c.id)), [visibleCols]);
  const [colAnchor, setColAnchor] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      Object.entries(filters).forEach(([k,v]) => { if(v) params[k]=v; });
      const res = await axios.get('/api/reviews', { params });
      let items = res.data.items || [];
      setTotal(res.data.total || 0);
      if (deletedIds.length) items = items.filter(r => !deletedIds.includes(r.review_id));
      if (initialFilters?.tempUpdate) {
        const idx = items.findIndex(r => r.review_id === initialFilters.tempUpdate.review_id);
        if(idx!==-1) items[idx]={...items[idx], nickname:initialFilters.tempUpdate.nickname, title:initialFilters.tempUpdate.title, detail:initialFilters.tempUpdate.detail, status_name:{1:'Approved',2:'Pending',3:'Not Approved'}[initialFilters.tempUpdate.status_id]||items[idx].status_name};
      }
      setData(items);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);
  useEffect(() => {
    if(initialFilters) { const {page:p,pageSize:ps,deletedIds:dIds}=initialFilters; if(p)setPage(p); if(ps)setPageSize(ps); if(dIds)setDeletedIds(dIds); }
  }, []);

  const resetFilters = () => { setFilters({ id:'', created_from:'', created_to:'', status:'', title:'', nickname:'', review:'', visibility:'', type:'', product:'', sku:'', customer_id:'' }); setPage(1); fetchData(); };
  const applyFilters = () => { setPage(1); fetchData(); };

  const handleBulkSubmit = () => {
    if(!bulkAction||!selected.length) return;
    if(bulkAction==='delete'){ setDeletedIds([...deletedIds,...selected.filter(id=>!deletedIds.includes(id))]); setData(d=>d.filter(r=>!selected.includes(r.review_id))); setSelected([]); }
    else if(bulkAction==='update_status'&&targetStatus){ setData(d=>d.map(r=>selected.includes(r.review_id)?{...r,status_id:{Approved:1,Pending:2,'Not Approved':3}[targetStatus],status_name:targetStatus}:r)); setSelected([]); setTargetStatus(''); setBulkAction(''); }
  };

  const handleEdit = (record) => { onNavigate?.('marketing_review_edit',{id:record.review_id,sourcePage:'marketing_all_reviews',savedState:{...filters,page,pageSize,deletedIds}}); };

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:3 }}>
        <Typography variant="h5" sx={{ fontWeight:500 }}>Reviews</Typography>
        <Button variant="contained" sx={{ bgcolor:'#eb5202', textTransform:'none' }}>New Review</Button>
      </Box>

      {/* Filters Card */}
      <Card sx={{ p:3, mb:2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight:600, mb:2 }}>Filter</Typography>
        <Stack spacing={2}>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
            <F label="ID"><TextField size="small" value={filters.id} onChange={e => setFilters(prev => ({ ...prev, id:e.target.value}))} /></F>
            <F label="Status"><Select size="small" displayEmpty value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status:e.target.value}))} sx={{ minWidth:150 }}>
              <MenuItem value="">--</MenuItem>
              {['Approved','Pending','Not Approved'].map(o=><MenuItem key={o} value={o}>{o}</MenuItem>)}
            </Select></F>
            <F label="Created From">
              <Ci4aDatePicker label="From" size="small" value={filters.created_from?dayjs(filters.created_from):null} onChange={v=>setFilters(prev => ({ ...prev, created_from:v?v.format('YYYY-MM-DD'):''}))} />
            </F>
            <F label="Created To">
              <Ci4aDatePicker label="To" size="small" value={filters.created_to?dayjs(filters.created_to):null} onChange={v=>setFilters(prev => ({ ...prev, created_to:v?v.format('YYYY-MM-DD'):''}))} />
            </F>
            <F label="Title"><TextField size="small" value={filters.title} onChange={e => setFilters(prev => ({ ...prev, title:e.target.value}))} /></F>
            <F label="Nickname"><TextField size="small" value={filters.nickname} onChange={e => setFilters(prev => ({ ...prev, nickname:e.target.value}))} /></F>
          </Box>
          <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
            <F label="Type"><Select size="small" displayEmpty value={filters.type} onChange={e => setFilters(prev => ({ ...prev, type:e.target.value}))} sx={{ minWidth:150 }}>
              <MenuItem value="">--</MenuItem><MenuItem value="Customer">Customer</MenuItem><MenuItem value="Guest">Guest</MenuItem>
            </Select></F>
            <F label="Product"><TextField size="small" value={filters.product} onChange={e => setFilters(prev => ({ ...prev, product:e.target.value}))} /></F>
            <F label="SKU"><TextField size="small" value={filters.sku} onChange={e => setFilters(prev => ({ ...prev, sku:e.target.value}))} /></F>
            <F label="Review"><TextField size="small" value={filters.review} onChange={e => setFilters(prev => ({ ...prev, review:e.target.value}))} /></F>
          </Box>
          <Box sx={{ display:'flex', gap:1 }}>
            <Button variant="contained" size="small" onClick={applyFilters} sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Search</Button>
            <Button variant="outlined" size="small" onClick={resetFilters} sx={{ textTransform:'none' }}>Reset Filter</Button>
          </Box>
        </Stack>
      </Card>

      {/* Actions + Pagination Bar */}
      <Card sx={{ p:2, mb:2, display:'flex', gap:2, alignItems:'center', flexWrap:'wrap' }}>
        <Select size="small" displayEmpty value={bulkAction} onChange={e=>setBulkAction(e.target.value)} sx={{ minWidth:180 }}>
          <MenuItem value="">Actions</MenuItem><MenuItem value="delete">Delete</MenuItem><MenuItem value="update_status">Update Status</MenuItem>
        </Select>
        {bulkAction==='update_status' && <Select size="small" displayEmpty value={targetStatus} onChange={e=>setTargetStatus(e.target.value)} sx={{ minWidth:180 }}>
          <MenuItem value="">Select Status</MenuItem>
          {['Approved','Pending','Not Approved'].map(o=><MenuItem key={o} value={o}>{o}</MenuItem>)}
        </Select>}
        <Button variant="outlined" size="small" onClick={handleBulkSubmit} sx={{ textTransform:'none' }}>Submit</Button>
        <Button startIcon={<SettingIcon />} onClick={e=>setColAnchor(e.currentTarget)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Columns</Button>
        <Popover open={Boolean(colAnchor)} anchorEl={colAnchor} onClose={()=>setColAnchor(null)} anchorOrigin={{ vertical:'bottom', horizontal:'left' }}>
          <Box sx={{ p:1.5, minWidth:200 }}><Typography variant="subtitle2" sx={{ mb:1 }}>Select Columns</Typography>
            {ALL_COLUMNS.map(c=><Box key={c.id} sx={{ display:'flex', alignItems:'center', gap:0.5 }}><Checkbox size="small" checked={visibleCols.includes(c.id)} onChange={e=>setVisibleCols(e.target.checked?[...visibleCols,c.id]:visibleCols.filter(x=>x!==c.id))}/><Typography fontSize={13}>{c.label}</Typography></Box>)}
          </Box>
        </Popover>
        <Box sx={{ flex:1, textAlign:'right' }}><Typography fontSize={13} color="text.secondary">{total} records found</Typography></Box>
        <Select size="small" value={pageSize} onChange={e=>{setPageSize(e.target.value);setPage(1);}} sx={{ minWidth:80 }}>{[20,50,100].map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}</Select>
        <Typography fontSize={13} color="text.secondary">per page</Typography>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer><Table size="small">
          <TableHead><TableRow>
            <TableCell padding="checkbox"><Checkbox size="small" indeterminate={selected.length>0&&selected.length<data.length} checked={data.length>0&&selected.length===data.length} onChange={e=>setSelected(e.target.checked?data.map(d=>d.review_id):[])} /></TableCell>
            {columns.map(c=><TableCell key={c.id} sx={{ fontWeight:600, width:c.w }}>{c.label}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>{loading ? <TableRow><TableCell colSpan={columns.length+1} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow> :
            data.map(row=>{const isSel=selected.includes(row.review_id);return(
              <TableRow key={row.review_id} hover selected={isSel} onClick={e=>{if(['INPUT','A','BUTTON'].includes(e.target.tagName))return;handleEdit(row);}} sx={{ cursor:'pointer' }}>
                <TableCell padding="checkbox" onClick={e=>e.stopPropagation()}><Checkbox size="small" checked={isSel} onChange={()=>setSelected(isSel?selected.filter(id=>id!==row.review_id):[...selected,row.review_id])}/></TableCell>
                {columns.map(c=><TableCell key={c.id}>{c.id==='created_at'?fmtDate(row[c.id]):c.id==='detail'?truncate(row[c.id]):c.id==='action'?<Typography component="a" href="#" onClick={e=>{e.stopPropagation();handleEdit(row);}} sx={{ fontSize:13, textDecoration:'none' }}>Edit</Typography>:row[c.id]}</TableCell>)}
              </TableRow>
            )})}
          </TableBody>
        </Table></TableContainer>
      </Card>

      <Box sx={{ display:'flex', justifyContent:'flex-end', mt:2 }}>
        <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p)=>setPage(p)} size="small" siblingCount={1} />
      </Box>
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5, color:'#333' }}>{label}</Typography>{children}</Box>; }
