import { useState, useEffect } from 'react'; import { Box, Typography, Button, TextField, Select, MenuItem, Card, Switch, FormControlLabel } from '@mui/material'; import ArrowBack from '@mui/icons-material/ArrowBack'; import axios from 'axios';

export default function ContentPageEdit({ pageId, onNavigate }) {
  const [form,setForm]=useState({title:'',identifier:'',content:'',meta_title:'',meta_keywords:'',meta_description:'',is_active:true});
  const isNew = pageId === 'new';

  useEffect(()=>{if(!isNew)axios.get('/api/content/pages/'+pageId).then(r=>setForm(r.data||{})).catch(console.error);},[pageId]);

  const save = () => {
    const data = isNew ? {tempUpdate:{...form,page_id:Date.now()},newPage:true} : {tempUpdate:form};
    window.__contentPageEdit = data;
    onNavigate?.('content_pages');
  };

  return (<Box>
    <Box sx={{display:'flex',justifyContent:'space-between',mb:3}}>
      <Box sx={{display:'flex',alignItems:'center',gap:2}}>
        <Button startIcon={<ArrowBack/>} onClick={()=>onNavigate?.('content_pages')} variant="outlined" size="small" sx={{textTransform:'none'}}>Back</Button>
        <Typography variant="h5" sx={{fontWeight:300}}>{isNew?'New Page':'Edit Page'}</Typography>
      </Box>
      <Button variant="contained" onClick={save} sx={{bgcolor:'#eb5202',textTransform:'none'}}>Save</Button>
    </Box>
    <Card sx={{p:3,maxWidth:800}}>
      <Typography variant="h6" sx={{mb:2,fontWeight:600}}>Page Information</Typography>
      <F label="Page Title"><TextField size="small" fullWidth value={form.title} onChange={e=>setForm(prev => ({ ...prev, title:e.target.value}))}/></F>
      <F label="URL Key"><TextField size="small" fullWidth value={form.identifier} onChange={e=>setForm(prev => ({ ...prev, identifier:e.target.value}))}/></F>
      <F label="Content"><TextField size="small" fullWidth multiline rows={10} value={form.content||''} onChange={e=>setForm(prev => ({ ...prev, content:e.target.value}))}/></F>
      <F label="Enable Page"><FormControlLabel control={<Switch checked={form.is_active} onChange={e=>setForm(prev => ({ ...prev, is_active:e.target.checked}))}/>} label={form.is_active?'Enabled':'Disabled'}/></F>
      <Typography variant="h6" sx={{mb:2,fontWeight:600,mt:3}}>SEO</Typography>
      <F label="Meta Title"><TextField size="small" fullWidth value={form.meta_title||''} onChange={e=>setForm(prev => ({ ...prev, meta_title:e.target.value}))}/></F>
      <F label="Meta Keywords"><TextField size="small" fullWidth value={form.meta_keywords||''} onChange={e=>setForm(prev => ({ ...prev, meta_keywords:e.target.value}))}/></F>
      <F label="Meta Description"><TextField size="small" fullWidth multiline rows={3} value={form.meta_description||''} onChange={e=>setForm(prev => ({ ...prev, meta_description:e.target.value}))}/></F>
    </Card>
  </Box>);
}
function F({ label, children }) { return <Box sx={{mb:2}}><Typography variant="caption" sx={{fontWeight:600,display:'block',mb:0.5,color:'#333'}}>{label}</Typography>{children}</Box>; }
