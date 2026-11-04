import { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel,
  Box, Typography, Checkbox, FormControlLabel, Radio, RadioGroup, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider,
} from '@mui/material';

const ATTRS = [
  { code:'color', label:'Color', options:['Black','Blue','Brown','Gray','Green','Lavender','Multi','Orange','Purple','Red','White','Yellow'] },
  { code:'size', label:'Size', options:['XS','S','M','L','XL','28','29','30','31','32'] },
  { code:'format', label:'Format', options:['Download','DVD'] },
];

export default function ProductConfigurationsModal({ open, onClose, product, onGenerate }) {
  const [step, setStep] = useState(0);
  const [selectedAttrs, setSelectedAttrs] = useState([]);
  const [selValues, setSelValues] = useState({});
  const [bulk, setBulk] = useState({ images:'skip', priceType:'single', singlePrice:0, qtyType:'single', singleQty:100 });

  const selectedData = useMemo(() => ATTRS.filter(a => selectedAttrs.includes(a.code)), [selectedAttrs]);

  const generated = useMemo(() => {
    if (!selectedData.length) return [];
    let combos = [{}];
    selectedData.forEach(attr => {
      const vals = selValues[attr.code] || [];
      if (!vals.length) return;
      const next = [];
      combos.forEach(ex => vals.forEach(v => next.push({...ex, [attr.code]:v})));
      combos = next;
    });
    return combos.map(c => {
      const suffix = Object.values(c).join('-');
      return {
        name: `${(product?.name||'Product')}-${suffix}`,
        sku: `${(product?.sku||'SKU')}-${suffix}`,
        price: bulk.priceType === 'single' ? bulk.singlePrice : 0,
        quantity: bulk.qtyType === 'single' ? bulk.singleQty : 0,
        weight: 1, status: 'Enabled',
        attributes: Object.entries(c).map(([k,v]) => `${ATTRS.find(a=>a.code===k)?.label}: ${v}`).join(', '),
        ...c,
      };
    });
  }, [selectedData, selValues, bulk, product]);

  const toggleAttr = (code) => {
    setSelectedAttrs(prev => prev.includes(code) ? prev.filter(c => c!==code) : [...prev, code]);
    if (!selValues[code]) setSelValues(prev => ({...prev, [code]:[]}));
  };

  const selAll = (code) => { const a = ATTRS.find(x=>x.code===code); if(a) setSelValues({...selValues, [code]:[...a.options]}); };
  const deselAll = (code) => { setSelValues({...selValues, [code]:[]}); };

  const handleClose = () => { setStep(0); setSelectedAttrs([]); setSelValues({}); onClose(); };
  const handleGenerate = () => { onGenerate(generated); handleClose(); };

  const summaryCols = useMemo(() => {
    const cols = [
      { id:'name', label:'Name' }, { id:'sku', label:'SKU' },
      { id:'price', label:'Price' }, { id:'quantity', label:'Quantity' },
      { id:'weight', label:'Weight' },
    ];
    selectedData.forEach(a => cols.splice(2, 0, { id:a.code, label:a.label }));
    return cols;
  }, [selectedData]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Create Product Configurations</DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} sx={{ mb:3 }}>
          {['Select Attributes','Attribute Values','Bulk Images & Price','Summary'].map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {step === 0 && <Box sx={{ minHeight:300 }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
            <Typography variant="h6">Step 1: Select Attributes</Typography>
          </Box>
          <Typography sx={{ mb:2 }}>Selected Attributes: {selectedData.map(a=>a.label).join(', ') || 'None'}</Typography>
          {ATTRS.map(a => (
            <Box key={a.code} sx={{ mb:1, p:1.5, border:'1px solid #f0f0f0', borderRadius:1 }}>
              <FormControlLabel
                control={<Checkbox checked={selectedAttrs.includes(a.code)} onChange={()=>toggleAttr(a.code)}/>}
                label={<Box sx={{ display:'flex', gap:4 }}><strong>{a.label}</strong><Typography color="text.secondary">Code: {a.code}</Typography><Typography color="text.secondary">Scope: Global</Typography></Box>}
              />
            </Box>
          ))}
        </Box>}

        {step === 1 && <Box sx={{ minHeight:300 }}>
          <Typography variant="h6" sx={{ mb:1 }}>Step 2: Attribute Values</Typography>
          <Typography sx={{ mb:2 }} color="text.secondary">Select values from each attribute. Each unique combination creates a unique SKU.</Typography>
          {selectedData.map(a => (
            <Box key={a.code} sx={{ mb:3, border:'1px solid #eee', p:2 }}>
              <Typography variant="subtitle1" fontWeight={600}>{a.label}</Typography>
              <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.5, my:1.5 }}>
                {a.options.map(o => (
                  <FormControlLabel key={o} sx={{ width:'16%', m:0 }}
                    control={<Checkbox size="small" checked={(selValues[a.code]||[]).includes(o)}
                      onChange={e => {
                        const cur = selValues[a.code] || [];
                        setSelValues({...selValues, [a.code]: e.target.checked ? [...cur,o] : cur.filter(v=>v!==o)});
                      }}/>}
                    label={o}/>
                ))}
              </Box>
              <Box sx={{ display:'flex', gap:1 }}>
                <Button size="small" sx={{textTransform:'none'}} onClick={()=>selAll(a.code)}>Select All</Button>
                <Divider orientation="vertical" flexItem/>
                <Button size="small" sx={{textTransform:'none'}} onClick={()=>deselAll(a.code)}>Deselect All</Button>
              </Box>
            </Box>
          ))}
        </Box>}

        {step === 2 && <Box sx={{ minHeight:300 }}>
          <Typography variant="h6" sx={{ mb:2 }}>Step 3: Bulk Images, Price and Quantity</Typography>
          <Box sx={{ mb:3 }}><Typography fontWeight={600} sx={{ mb:1 }}>Images</Typography>
            <RadioGroup value={bulk.images} onChange={e=>setBulk({...bulk, images:e.target.value})}>
              <FormControlLabel value="single" control={<Radio/>} label="Apply single set of images to all SKUs"/>
              <FormControlLabel value="unique" control={<Radio/>} label="Apply unique images by attribute to each SKU"/>
              <FormControlLabel value="skip" control={<Radio/>} label="Skip image uploading at this time"/>
            </RadioGroup>
          </Box>
          <Box sx={{ mb:3 }}><Typography fontWeight={600} sx={{ mb:1 }}>Price</Typography>
            <RadioGroup value={bulk.priceType} onChange={e=>setBulk({...bulk, priceType:e.target.value})}>
              <FormControlLabel value="single" control={<Radio/>} label="Apply single price to all SKUs"/>
              <FormControlLabel value="unique" control={<Radio/>} label="Apply unique prices by attribute to each SKU"/>
              <FormControlLabel value="skip" control={<Radio/>} label="Skip price at this time"/>
            </RadioGroup>
            {bulk.priceType==='single' && <TextField size="small" type="number" value={bulk.singlePrice} onChange={e=>setBulk({...bulk, singlePrice:e.target.value})} sx={{width:200,ml:4}}/>}
          </Box>
          <Box sx={{ mb:3 }}><Typography fontWeight={600} sx={{ mb:1 }}>Quantity</Typography>
            <RadioGroup value={bulk.qtyType} onChange={e=>setBulk({...bulk, qtyType:e.target.value})}>
              <FormControlLabel value="single" control={<Radio/>} label="Apply single quantity to each SKU"/>
              <FormControlLabel value="unique" control={<Radio/>} label="Apply unique quantity by attribute to each SKU"/>
              <FormControlLabel value="skip" control={<Radio/>} label="Skip quantity at this time"/>
            </RadioGroup>
            {bulk.qtyType==='single' && <TextField size="small" type="number" value={bulk.singleQty} onChange={e=>setBulk({...bulk, singleQty:e.target.value})} sx={{width:200,ml:4}} placeholder="Quantity"/>}
          </Box>
        </Box>}

        {step === 3 && <Box sx={{ minHeight:300 }}>
          <Typography variant="h6" sx={{ mb:2 }}>Step 4: Summary</Typography>
          <Typography sx={{ mb:2 }} color="text.secondary">Here are the products you're about to create.</Typography>
          <TableContainer><Table size="small">
            <TableHead><TableRow>{summaryCols.map(c=><TableCell key={c.id} sx={{fontWeight:600}}>{c.label}</TableCell>)}</TableRow></TableHead>
            <TableBody>{generated.map((p,i)=><TableRow key={i}>{summaryCols.map(c=><TableCell key={c.id}>{p[c.id]}</TableCell>)}</TableRow>)}</TableBody>
          </Table></TableContainer>
        </Box>}
      </DialogContent>
      <DialogActions sx={{ borderTop:'1px solid #e8e8e8', pt:2 }}>
        <Button onClick={handleClose} sx={{textTransform:'none'}}>Cancel</Button>
        {step > 0 && <Button onClick={()=>setStep(step-1)} sx={{textTransform:'none'}}>Back</Button>}
        {step < 3 && <Button variant="contained" onClick={()=>setStep(step+1)} sx={{textTransform:'none'}}>Next</Button>}
        {step === 3 && <Button variant="contained" onClick={handleGenerate} sx={{bgcolor:'#eb5202',textTransform:'none'}}>Generate Products</Button>}
      </DialogActions>
    </Dialog>
  );
}
