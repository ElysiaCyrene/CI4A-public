import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Card, Stack, Chip } from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

const STATUS_LABELS = { 1:'Subscribed', 2:'Not Activated', 3:'Unsubscribed', 4:'Unconfirmed' };
const STATUS_COLORS = { 1:'success', 3:'error' };

const COLUMNS = [
  { id:'subscriber_id', label:'ID', w:80 },
  { id:'subscriber_email', label:'Email' },
  { id:'type', label:'Type' },
  { id:'customer_name', label:'Customer Name' },
  { id:'subscriber_status', label:'Status' },
  { id:'store_id', label:'Store' },
  { id:'store_view', label:'Store View' },
  { id:'action', label:'Action', w:100 },
];

export default function MarketingNewsletterSubscribers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({ subscriber_id_from:'', subscriber_id_to:'', subscriber_email:'', subscriber_status:'' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusMap = { Subscribed:1, 'Not Activated':2, Unsubscribed:3, Unconfirmed:4 };
      const params = { page, pageSize, subscriber_id: filters.subscriber_id_from, subscriber_email: filters.subscriber_email };
      if (filters.subscriber_status && statusMap[filters.subscriber_status] !== undefined)
        params.subscriber_status = statusMap[filters.subscriber_status];
      const res = await axios.get('/api/marketing/newsletter-subscribers', { params });
      setData(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);

  const resetFilters = () => { setFilters({ subscriber_id_from:'', subscriber_id_to:'', subscriber_email:'', subscriber_status:'' }); setPage(1); fetchData(); };
  const applyFilters = () => { setPage(1); fetchData(); };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight:500, fontSize:24, mb:3 }}>Newsletter Subscribers</Typography>

      <Box sx={{ display:'flex', gap:1, mb:2, justifyContent:'flex-end' }}>
        <Button startIcon={<FilterIcon />} onClick={() => setShowFilters(!showFilters)} variant="outlined" size="small" sx={{ textTransform:'none' }}>Filters</Button>
      </Box>

      {showFilters && (
        <Card sx={{ p:3, mb:2 }}>
          <Stack spacing={2}>
            <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
              <F label="ID"><Box sx={{ display:'flex', flexDirection:'column', gap:0.5 }}>
                <TextField size="small" placeholder="from" value={filters.subscriber_id_from} onChange={e => setFilters(prev => ({ ...prev, subscriber_id_from:e.target.value}))} />
                <TextField size="small" placeholder="to" value={filters.subscriber_id_to} onChange={e => setFilters(prev => ({ ...prev, subscriber_id_to:e.target.value}))} />
              </Box></F>
              <F label="Email"><TextField size="small" value={filters.subscriber_email} onChange={e => setFilters(prev => ({ ...prev, subscriber_email:e.target.value}))} /></F>
              <F label="Status"><Select size="small" displayEmpty value={filters.subscriber_status} onChange={e => setFilters(prev => ({ ...prev, subscriber_status:e.target.value}))} sx={{ minWidth:180 }}>
                <MenuItem value="">--</MenuItem>
                <MenuItem value="Subscribed">Subscribed</MenuItem>
                <MenuItem value="Not Activated">Not Activated</MenuItem>
                <MenuItem value="Unsubscribed">Unsubscribed</MenuItem>
                <MenuItem value="Unconfirmed">Unconfirmed</MenuItem>
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
          <Select size="small" value={pageSize} onChange={e => { setPageSize(e.target.value); setPage(1); }} sx={{ minWidth:80 }}>
            {[20,50,100,200].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
          <Typography fontSize={13} color="text.secondary">per page</Typography>
          <Pagination count={Math.ceil(total/pageSize)} page={page} onChange={(e,p) => setPage(p)} size="small" siblingCount={1} />
        </Box>
      </Box>

      <Card><TableContainer><Table size="small">
        <TableHead><TableRow>{COLUMNS.map(c => <TableCell key={c.id} sx={{ fontWeight:600, width:c.w }}>{c.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{loading ? <TableRow><TableCell colSpan={COLUMNS.length} align="center" sx={{ py:4 }}>Loading...</TableCell></TableRow> :
          data.map(row => <TableRow key={row.subscriber_id} hover>
            {COLUMNS.map(c => <TableCell key={c.id}>{
              c.id === 'type' ? (row.customer_id ? 'Customer' : 'Guest') :
              c.id === 'subscriber_status' ? <Chip label={STATUS_LABELS[row.subscriber_status] || 'Unknown'} color={STATUS_COLORS[row.subscriber_status] || 'default'} size="small" variant="outlined" /> :
              c.id === 'action' ? <Typography component="a" href="#" sx={{ fontSize:13, textDecoration:'none' }}>Unsubscribe</Typography> :
              row[c.id]
            }</TableCell>)}
          </TableRow>)}
        </TableBody>
      </Table></TableContainer></Card>
    </Box>
  );
}
function F({ label, children }) { return <Box><Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5, color:'#333' }}>{label}</Typography>{children}</Box>; }
