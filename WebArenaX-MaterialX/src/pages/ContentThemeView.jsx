import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, Chip } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack'; import axios from 'axios';

export default function ContentThemeView({ themeId, onBack }) {
  const [theme,setTheme]=useState({});
  useEffect(()=>{axios.get('/api/content/themes/'+themeId).then(r=>setTheme(r.data||{})).catch(console.error);},[themeId]);

  return (
    <Box>
      <Box sx={{display:'flex',justifyContent:'space-between',mb:3}}>
        <Typography variant="h5" sx={{fontWeight:300}}>Theme: {theme.theme_title}</Typography>
        <Button startIcon={<ArrowBack/>} onClick={()=>onBack?.()} variant="outlined" size="small" sx={{textTransform:'none'}}>Back</Button>
      </Box>

      <Box sx={{display:'flex',gap:3}}>
        <Box sx={{width:200,flexShrink:0}}>
          <Card>
            <Typography variant="caption" sx={{display:'block',px:2,pt:1.5,pb:0.5,color:'#999',fontWeight:600,fontSize:11,letterSpacing:0.5}}>THEME</Typography>
            <Button fullWidth sx={{textTransform:'none',justifyContent:'flex-start',px:2,py:1,fontSize:13,color:'#fff',bgcolor:'#eb5202',borderRadius:0,'&:hover':{bgcolor:'#d44902'}}}>General</Button>
          </Card>
        </Box>

        <Box sx={{flex:1}}>
          <Card sx={{p:3,mb:2}}>
            <Typography variant="h6" sx={{mb:3,fontWeight:600,borderBottom:'1px solid #e3e3e3',pb:1}}>Theme Settings</Typography>
            <Info label="Theme ID" value={theme.theme_id}/>
            <Info label="Theme Path" value={theme.theme_path}/>
            <Info label="Theme Title" value={theme.theme_title}/>
            <Info label="Status" value={<Chip label={theme.is_active?'Active':'Inactive'} color={theme.is_active?'success':'error'} size="small" variant="outlined"/>}/>
            <Info label="Parent Theme ID" value={theme.parent_id || '— (Root Theme)'}/>
            <Info label="Preview Image" value={
              <Box sx={{width:400,height:250,border:'1px solid #e3e3e3',borderRadius:1,overflow:'hidden',bgcolor:'#fafafa',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Box sx={{textAlign:'center'}}>
                  <Typography variant="h4" sx={{color:'#eb5202',fontWeight:300,mb:1}}>Magento</Typography>
                  <Typography color="text.secondary" fontSize={13}>Theme Preview — {theme.theme_title}</Typography>
                </Box>
              </Box>
            }/>
          </Card>

          <Card sx={{p:3}}>
            <Typography variant="h6" sx={{mb:3,fontWeight:600,borderBottom:'1px solid #e3e3e3',pb:1}}>Theme Configuration</Typography>
            <Info label="Layout" value="1 column"/>
            <Info label="Header Type" value="Standard Header"/>
            <Info label="Footer Type" value="Standard Footer"/>
            <Info label="Color Scheme" value={<Box sx={{display:'flex',gap:1,alignItems:'center'}}><Box sx={{width:20,height:20,bgcolor:'#eb5202',borderRadius:'50%'}}/><Typography fontSize={13}>Magento Orange (#eb5202)</Typography></Box>}/>
            <Info label="Typography" value="Open Sans, Helvetica Neue, Arial"/>
            <Info label="Responsive" value={<Chip label="Enabled" color="success" size="small" variant="outlined"/>}/>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
function Info({ label, value }) { return <Box sx={{display:'flex',mb:2}}><Typography fontSize={13} color="text.secondary" sx={{minWidth:160,fontWeight:600}}>{label}</Typography><Box fontSize={13}>{value}</Box></Box>; }
