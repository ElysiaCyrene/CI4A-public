import { useState, useEffect } from 'react'; import { Box, Typography, Button, Card, Chip } from '@mui/material'; import ArrowBack from '@mui/icons-material/ArrowBack'; import axios from 'axios';

export default function ContentPageView({ pageId, onNavigate }) {
  const [page,setPage]=useState(null);
  useEffect(()=>{axios.get('/api/content/pages/'+pageId).then(r=>setPage(r.data||{})).catch(console.error);},[pageId]);
  if(!page) return <Typography sx={{p:4}}>Loading...</Typography>;

  return (<Box>
    <Box sx={{display:'flex',alignItems:'center',gap:2,mb:3}}>
      <Button startIcon={<ArrowBack/>} onClick={()=>onNavigate?.('content_pages')} variant="outlined" size="small" sx={{textTransform:'none'}}>Back</Button>
      <Typography variant="h5" sx={{fontWeight:300}}>{page.title}</Typography>
    </Box>
    <Card sx={{p:3}}>
      <Info label="Page ID" value={page.page_id}/>
      <Info label="URL Key" value={page.identifier}/>
      <Info label="Status" value={<Chip label={page.is_active?'Enabled':'Disabled'} color={page.is_active?'success':'error'} size="small" variant="outlined"/>}/>
      <Info label="Created" value={page.creation_time}/>
      <Info label="Modified" value={page.update_time}/>
      {page.content && <Box sx={{mt:2}}><Typography variant="subtitle2" sx={{fontWeight:600,mb:1}}>Content</Typography><Box sx={{border:'1px solid #e3e3e3',p:2,borderRadius:1,minHeight:100}}><Typography fontSize={13}>{page.content}</Typography></Box></Box>}
    </Card>
  </Box>);
}
function Info({ label, value }) { return <Box sx={{display:'flex',mb:1}}><Typography fontSize={13} color="text.secondary" sx={{minWidth:120}}>{label}</Typography><Box fontSize={13}>{value}</Box></Box>; }
