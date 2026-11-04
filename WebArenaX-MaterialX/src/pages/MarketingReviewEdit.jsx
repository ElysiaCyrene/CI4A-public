import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Rating, Card } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack'; import axios from 'axios';

export default function MarketingReviewEdit({ reviewId, onNavigate }) {
  const [form,setForm]=useState({product_name:'',author:'',summary_rating:0,detailed_rating:0,status_id:'Pending',nickname:'',title:'',detail:''});

  const fetchReview = async () => {
    try {
      const res = await axios.get('/api/reviews', { params: { id: reviewId } });
      if(res.data.items?.length) {
        const r=res.data.items[0];
        const st={1:'Approved',2:'Pending',3:'Not Approved'};
        setForm({product_name:r.product_name,author:r.type,summary_rating:r.rating_value||0,detailed_rating:r.rating_value||0,status_id:st[r.status_id]||'Pending',nickname:r.nickname,title:r.title,detail:r.detail});
      }
    } catch(e) { console.error(e); }
  };

  useEffect(()=>{fetchReview();},[reviewId]);

  const handleBack = () => { onNavigate?.('marketing_all_reviews',{sourcePage:'marketing_all_reviews'}); };
  const handleDelete = () => { onNavigate?.('marketing_all_reviews',{deletedId:reviewId,sourcePage:'marketing_all_reviews'}); };
  const handleReset = () => { fetchReview(); };
  const handleSave = () => {
    const st={Approved:1,Pending:2,'Not Approved':3};
    onNavigate?.('marketing_all_reviews',{updatedData:{...form,status_id:st[form.status_id]||2,review_id:reviewId},sourcePage:'marketing_all_reviews'});
  };

  return (
    <Box>
      <Box sx={{display:'flex',justifyContent:'space-between',mb:3,flexWrap:'wrap',gap:1}}>
        <Typography variant="h5" sx={{fontWeight:500}}>Edit Review</Typography>
        <Box sx={{display:'flex',gap:1,flexWrap:'wrap'}}>
          <Button startIcon={<ArrowBack/>} onClick={handleBack} variant="outlined" size="small" sx={{textTransform:'none'}}>Back</Button>
          <Button onClick={handleDelete} variant="outlined" color="error" size="small" sx={{textTransform:'none'}}>Delete Review</Button>
          <Button onClick={handleReset} variant="outlined" size="small" sx={{textTransform:'none'}}>Reset</Button>
          <Button onClick={handleSave} variant="outlined" size="small" sx={{textTransform:'none'}}>Save and Next</Button>
          <Button variant="contained" onClick={handleSave} sx={{bgcolor:'#eb5202',textTransform:'none'}}>Save Review</Button>
        </Box>
      </Box>

      <Card sx={{p:3}}>
        <Typography variant="h6" sx={{mb:2,fontWeight:600}}>Review Details</Typography>
        <Box>
          <F label="Product"><Typography component="a" href="#" fontSize={13}>{form.product_name}</Typography></F>
          <F label="Author"><Typography fontSize={13}>{form.author}</Typography></F>
          <F label="Summary Rating"><Rating value={form.summary_rating} readOnly size="small"/></F>
          <F label="Detailed Rating" required><Rating value={form.detailed_rating} onChange={(e,v)=>setForm(prev => ({ ...prev, detailed_rating:v}))} size="small"/></F>
          <F label="Status" required><Select size="small" value={form.status_id} onChange={e=>setForm(prev => ({ ...prev, status_id:e.target.value}))} sx={{width:200}}>{['Approved','Pending','Not Approved'].map(o=><MenuItem key={o} value={o}>{o}</MenuItem>)}</Select></F>
          <F label="Nickname" required><TextField size="small" fullWidth value={form.nickname} onChange={e=>setForm(prev => ({ ...prev, nickname:e.target.value}))}/></F>
          <F label="Summary of Review" required><TextField size="small" fullWidth value={form.title} onChange={e=>setForm(prev => ({ ...prev, title:e.target.value}))}/></F>
          <F label="Review" required><TextField size="small" fullWidth multiline rows={6} value={form.detail} onChange={e=>setForm(prev => ({ ...prev, detail:e.target.value}))}/></F>
        </Box>
      </Card>
    </Box>
  );
}
function F({ label, required, children }) { return <Box sx={{mb:2}}><Typography variant="caption" sx={{fontWeight:600,display:'block',mb:0.5,color:'#333'}}>{label}{required&&<span style={{color:'red'}}> *</span>}</Typography>{children}</Box>; }
