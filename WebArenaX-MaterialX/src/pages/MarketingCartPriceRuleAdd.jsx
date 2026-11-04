import { useState } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Card, Switch, FormControlLabel, Divider } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Ci4aDatePicker from '../components/Ci4aDatePicker'; import dayjs from 'dayjs';

export default function MarketingCartPriceRuleAdd({ onNavigate }) {
  const [form,setForm]=useState({
    name:'',description:'',is_active:true,website_ids:[],customer_group_ids:[],
    coupon_type:'No Coupon',uses_per_customer:'',from_date:'',to_date:'',sort_order:'',
    is_rss:true,simple_action:'by_percent',discount_amount:'',discount_qty:'',discount_step:'',
    apply_to_shipping:false,stop_rules_processing:true,
  });

  const save = () => {
    const mockRule = {
      rule_id: Date.now(), ...form,
      is_active: form.is_active ? 1 : 0,
      coupon_type: { 'No Coupon': 1, 'Specific Coupon': 2 }[form.coupon_type] || form.coupon_type,
      start_date: form.from_date, end_date: form.to_date,
      sort_order: form.sort_order || 0, type: 'Cart Price Rule',
    };
    window.__newCartRule = mockRule;
    onNavigate('marketing_cart_price_rules');
  };

  return (
    <Box>
      <Box sx={{display:'flex',justifyContent:'space-between',mb:3,flexWrap:'wrap',gap:1}}>
        <Typography variant="h5" sx={{fontWeight:300}}>New Cart Price Rule</Typography>
        <Box sx={{display:'flex',gap:1}}>
          <Button startIcon={<ArrowBack/>} onClick={()=>onNavigate('marketing_cart_price_rules')} variant="outlined" size="small" sx={{textTransform:'none'}}>Back</Button>
          <Button onClick={()=>setForm({name:'',description:'',is_active:true,website_ids:[],customer_group_ids:[],coupon_type:'No Coupon',uses_per_customer:'',from_date:'',to_date:'',sort_order:'',is_rss:true,simple_action:'by_percent',discount_amount:'',discount_qty:'',discount_step:'',apply_to_shipping:false,stop_rules_processing:true})} variant="outlined" size="small" sx={{textTransform:'none'}}>Reset</Button>
          <Button onClick={save} variant="outlined" size="small" sx={{textTransform:'none'}}>Save and Continue Edit</Button>
          <Button variant="contained" onClick={save} sx={{bgcolor:'#eb5202',textTransform:'none'}}>Save</Button>
        </Box>
      </Box>

      <Card sx={{p:3,maxWidth:1000}}>
        <F label="Rule Name" required><TextField size="small" fullWidth value={form.name} onChange={e=>setForm(prev => ({ ...prev, name:e.target.value}))}/></F>
        <F label="Description"><TextField size="small" fullWidth multiline rows={4} value={form.description} onChange={e=>setForm(prev => ({ ...prev, description:e.target.value}))}/></F>
        <F label="Active" required><FormControlLabel control={<Switch checked={form.is_active} onChange={e=>setForm(prev => ({ ...prev, is_active:e.target.checked}))}/>} label={form.is_active?'Yes':'No'}/></F>
        <F label="Websites" required>
          <Select size="small" multiple value={form.website_ids} onChange={e=>setForm(prev => ({ ...prev, website_ids:e.target.value}))} sx={{minWidth:300}} displayEmpty renderValue={v=>Array.isArray(v)&&v.length?v.join(', '):'Select Websites'}>
            <MenuItem value="1">Main Website</MenuItem>
          </Select>
        </F>
        <F label="Customer Groups" required>
          <Select size="small" multiple value={form.customer_group_ids} onChange={e=>setForm(prev => ({ ...prev, customer_group_ids:e.target.value}))} sx={{minWidth:300}} displayEmpty renderValue={v=>Array.isArray(v)&&v.length?v.join(', '):'Select Customer Groups'}>
            {['NOT LOGGED IN','General','Wholesale','Retailer'].map(o=><MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </F>
        <F label="Coupon" required>
          <Select size="small" value={form.coupon_type} onChange={e=>setForm(prev => ({ ...prev, coupon_type:e.target.value}))} sx={{width:200}}>
            <MenuItem value="No Coupon">No Coupon</MenuItem><MenuItem value="Specific Coupon">Specific Coupon</MenuItem>
          </Select>
        </F>
        <F label="Uses per Customer"><TextField size="small" value={form.uses_per_customer} onChange={e=>setForm(prev => ({ ...prev, uses_per_customer:e.target.value}))}/></F>
        <Box sx={{display:'flex',gap:2}}>
          <F label="From"><Ci4aDatePicker label="" size="small" value={form.from_date?dayjs(form.from_date):null} onChange={v=>setForm(prev => ({ ...prev, from_date:v&&v.format('YYYY-MM-DD')||''}))}/></F>
          <F label="To"><Ci4aDatePicker label="" size="small" value={form.to_date?dayjs(form.to_date):null} onChange={v=>setForm(prev => ({ ...prev, to_date:v&&v.format('YYYY-MM-DD')||''}))}/></F>
        </Box>
        <F label="Priority"><TextField size="small" value={form.sort_order} onChange={e=>setForm(prev => ({ ...prev, sort_order:e.target.value}))}/></F>
        <F label="Public In RSS Feed"><FormControlLabel control={<Switch checked={form.is_rss} onChange={e=>setForm(prev => ({ ...prev, is_rss:e.target.checked}))}/>} label={form.is_rss?'Yes':'No'}/></F>

        <Divider sx={{my:3}}/>
        <Typography variant="h6" sx={{mb:2,fontWeight:500}}>Actions</Typography>
        <F label="Apply">
          <Select size="small" value={form.simple_action} onChange={e=>setForm(prev => ({ ...prev, simple_action:e.target.value}))} sx={{minWidth:300}}>
            <MenuItem value="by_percent">Apply as percentage of original</MenuItem>
            <MenuItem value="by_fixed">Apply as fixed amount</MenuItem>
            <MenuItem value="to_percent">Adjust final price to this percentage</MenuItem>
            <MenuItem value="to_fixed">Adjust final price to this value</MenuItem>
          </Select>
        </F>
        <F label="Discount Amount" required><TextField size="small" value={form.discount_amount} onChange={e=>setForm(prev => ({ ...prev, discount_amount:e.target.value}))}/></F>
        <F label="Maximum Qty Discount is Applied To"><TextField size="small" value={form.discount_qty} onChange={e=>setForm(prev => ({ ...prev, discount_qty:e.target.value}))}/></F>
        <F label="Discount Qty Step (Buy X)"><TextField size="small" value={form.discount_step} onChange={e=>setForm(prev => ({ ...prev, discount_step:e.target.value}))}/></F>
        <F label="Apply to Shipping Amount"><FormControlLabel control={<Switch checked={form.apply_to_shipping} onChange={e=>setForm(prev => ({ ...prev, apply_to_shipping:e.target.checked}))}/>} label={form.apply_to_shipping?'Yes':'No'}/></F>
        <F label="Discard subsequent rules"><FormControlLabel control={<Switch checked={form.stop_rules_processing} onChange={e=>setForm(prev => ({ ...prev, stop_rules_processing:e.target.checked}))}/>} label={form.stop_rules_processing?'Yes':'No'}/></F>
      </Card>
    </Box>
  );
}
function F({ label, required, children }) { return <Box sx={{mb:2}}><Typography variant="caption" sx={{fontWeight:600,display:'block',mb:0.5,color:'#333'}}>{label}{required&&<span style={{color:'red'}}> *</span>}</Typography>{children}</Box>; }
