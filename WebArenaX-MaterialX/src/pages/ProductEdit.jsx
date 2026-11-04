import { useState, useEffect } from 'react';
import ProductConfigurationsModal from '../components/ProductConfigurationsModal';
import {
  Box, Typography, Button, TextField, Select, MenuItem,
  Switch, FormControlLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Card, Divider,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Save from '@mui/icons-material/Save';
import HelpOutline from '@mui/icons-material/HelpOutlineOutlined';
import axios from 'axios';
import dayjs from 'dayjs';

const VISIBILITY_OPTS = ['Not Visible Individually', 'Catalog', 'Search', 'Catalog, Search'];
const STOCK_OPTS = ['In Stock', 'Out of Stock'];
const TAX_OPTS = [{ value: 0, label: 'None' }, { value: 2, label: 'Taxable Goods' }];
const COUNTRY_OPTS = ['US', 'CN', 'JP', 'DE', 'GB', 'FR'];

const ANCHORS = [
  { key: 'basic-settings', label: 'Basic Settings' },
  { key: 'section-content', label: 'Content' },
  { key: 'section-configurations', label: 'Configurations' },
  { key: 'section-reviews', label: 'Reviews' },
  { key: 'section-images', label: 'Images & Videos' },
  { key: 'section-seo', label: 'SEO' },
];

export default function ProductEdit({ productId, onNavigate }) {
  const [product, setProduct] = useState({});
  const [reviews, setReviews] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/catalog/product/${productId}`);
      const data = res.data || {};
      setProduct(data);
      if (data.name) {
        fetchReviews(data.name);
        // Mock existing configurations for demonstration
        setConfigurations([
          { name:`${data.name}-XS-Black`, sku:`${data.sku}-XS-Black`, price:data.price, quantity:100, weight:1, status:'Enabled', attributes:'Size: XS, Color: Black' },
          { name:`${data.name}-S-Black`, sku:`${data.sku}-S-Black`, price:data.price, quantity:85, weight:1, status:'Enabled', attributes:'Size: S, Color: Black' },
        ]);
      }
    } catch (e) { console.error(e); }
  };

  const fetchReviews = async (name) => {
    try {
      const res = await axios.get('/api/reviews', { params: { product: name } });
      setReviews(res.data.items || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchProduct(); }, [productId]);

  const updateField = (k, v) => setProduct((p) => ({ ...p, [k]: v }));

  const reviewCols = [
    { id: 'review_id', label: 'ID', w: 80 },
    { id: 'created_at', label: 'Created', w: 140, fmt: (v) => dayjs(v).format('MMM D, YYYY h:mm A') },
    { id: 'status_name', label: 'Status', w: 100 },
    { id: 'nickname', label: 'Nickname', w: 120 },
    { id: 'detail', label: 'Review' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => onNavigate?.('catalog_products', { updatedData: product })}
            variant="outlined" size="small" sx={{ textTransform: 'none' }}>Back</Button>
          <Typography variant="h4" sx={{ fontWeight: 300 }}>{product.name || 'Edit Product'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" sx={{ textTransform: 'none' }}>Add Attribute</Button>
          <Button variant="contained" startIcon={<Save />}
            onClick={() => onNavigate?.('catalog_products', { updatedData: product })}
            sx={{ bgcolor: '#eb5202', '&:hover': { bgcolor: '#d44902' }, textTransform: 'none' }}>Save</Button>
        </Box>
      </Box>

      {/* Scope */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography fontWeight={600} fontSize={14}>Scope:</Typography>
        <Select size="small" defaultValue="all_store_views" sx={{ minWidth: 200 }}>
          <MenuItem value="all_store_views">All Store Views</MenuItem>
        </Select>
        <HelpOutline sx={{ color: '#999', fontSize: 18 }} />
      </Box>

      {/* Main Layout */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Form */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={{ p: 3 }}>
            <Typography id="basic-settings" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Basic Settings</Typography>

            <FormControlLabel
              control={<Switch checked={product.status === 1}
                onChange={(e) => updateField('status', e.target.checked ? 1 : 2)} />}
              label={product.status === 1 ? 'Enabled' : 'Disabled'}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <Field label="Product Name *">
                <TextField size="small" fullWidth value={product.name || ''} onChange={(e) => updateField('name', e.target.value)} />
              </Field>
              <Field label="SKU *">
                <TextField size="small" fullWidth value={product.sku || ''} onChange={(e) => updateField('sku', e.target.value)} />
              </Field>
              <Field label="Price *">
                <TextField size="small" type="number" fullWidth value={product.price || ''} onChange={(e) => updateField('price', e.target.value)} />
              </Field>
              <Field label="Quantity">
                <TextField size="small" type="number" fullWidth value={product.quantity || ''} onChange={(e) => updateField('quantity', e.target.value)} />
              </Field>
              <Field label="Stock Status">
                <Select size="small" fullWidth value={product.stock_status || ''} onChange={(e) => updateField('stock_status', e.target.value)}>
                  {STOCK_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </Field>
              <Field label="Tax Class">
                <Select size="small" fullWidth value={product.tax_class_id ?? ''} onChange={(e) => updateField('tax_class_id', e.target.value)}>
                  {TAX_OPTS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </Field>
              <Field label="Visibility">
                <Select size="small" fullWidth value={product.visibility || ''} onChange={(e) => updateField('visibility', e.target.value)}>
                  {VISIBILITY_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </Field>
              <Field label="Country of Manufacture">
                <Select size="small" fullWidth value={product.country_of_manufacture || ''} onChange={(e) => updateField('country_of_manufacture', e.target.value)}>
                  <MenuItem value="">--</MenuItem>
                  {COUNTRY_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </Field>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography id="section-content" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Content</Typography>
            <Field label="Description">
              <TextField size="small" fullWidth multiline rows={4} value={product.description || ''} onChange={(e) => updateField('description', e.target.value)} />
            </Field>
            <Field label="Short Description" sx={{ mt: 2 }}>
              <TextField size="small" fullWidth multiline rows={2} value={product.short_description || ''} onChange={(e) => updateField('short_description', e.target.value)} />
            </Field>

            <Divider sx={{ my: 3 }} />

            <Box id="section-configurations">
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Configurations</Typography>
              <Typography color="text.secondary" fontSize={13} sx={{ mb:2 }}>
                Configurable products allow customers to choose options (Ex: shirt color).
                You need to create a simple product for each configuration (Ex: a product for each color).
              </Typography>
              <Box sx={{ textAlign:'right', mb:2 }}>
                <Button variant="outlined" size="small" onClick={()=>setShowConfigModal(true)} sx={{textTransform:'none'}}>
                  Create Configurations
                </Button>
              </Box>
              {configurations.length > 0 && <>
                <Typography fontWeight={600} fontSize={13} sx={{ mb:1 }}>Current Variations</Typography>
                <TableContainer><Table size="small">
                  <TableHead><TableRow>
                    {['Image','Name','SKU','Price','Quantity','Weight','Status','Attributes','Action'].map(h=><TableCell key={h} sx={{fontWeight:600}}>{h}</TableCell>)}
                  </TableRow></TableHead>
                  <TableBody>
                    {configurations.map((c,i)=><TableRow key={i}>
                      <TableCell><Box sx={{width:40,height:40,bgcolor:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#ccc'}}>📷</Box></TableCell>
                      <TableCell>{c.name}</TableCell><TableCell>{c.sku}</TableCell>
                      <TableCell>${c.price}</TableCell><TableCell>{c.quantity}</TableCell>
                      <TableCell>{c.weight}</TableCell><TableCell>{c.status}</TableCell>
                      <TableCell>{c.attributes}</TableCell>
                      <TableCell><Typography component="a" href="#" sx={{fontSize:13}}>Select</Typography></TableCell>
                    </TableRow>)}
                  </TableBody>
                </Table></TableContainer>
              </>}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography id="section-reviews" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Product Reviews</Typography>
            {reviews.length === 0 ? (
              <Typography color="text.secondary">No reviews found.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow>{reviewCols.map(c => <TableCell key={c.id} sx={{ fontWeight: 600, width: c.w }}>{c.label}</TableCell>)}</TableRow></TableHead>
                  <TableBody>
                    {reviews.map(r => (
                      <TableRow key={r.review_id}>
                        {reviewCols.map(c => <TableCell key={c.id}>{c.fmt ? c.fmt(r[c.id]) : r[c.id]}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Divider sx={{ my: 3 }} />

            <Box id="section-images">
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Images & Videos</Typography>
              <Typography color="text.secondary" fontSize={13}>Image management placeholder.</Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography id="section-seo" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>SEO</Typography>
            <Field label="Meta Title">
              <TextField size="small" fullWidth value={product.meta_title || ''} onChange={(e) => updateField('meta_title', e.target.value)} />
            </Field>
            <Field label="Meta Keywords" sx={{ mt: 2 }}>
              <TextField size="small" fullWidth value={product.meta_keywords || ''} onChange={(e) => updateField('meta_keywords', e.target.value)} />
            </Field>
            <Field label="Meta Description" sx={{ mt: 2 }}>
              <TextField size="small" fullWidth multiline rows={3} value={product.meta_description || ''} onChange={(e) => updateField('meta_description', e.target.value)} />
            </Field>
          </Card>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ width: 200, flexShrink: 0 }}>
          <Card sx={{ p: 2, position: 'sticky', top: 80 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Sections</Typography>
            {ANCHORS.map(a => (
              <Button
                key={a.key}
                onClick={() => document.getElementById(a.key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                sx={{ display: 'block', width: '100%', fontSize: 12, color: '#1976d2', mb: 0.3, textTransform: 'none', justifyContent: 'flex-start', p: 0.3, minWidth: 0 }}
              >
                {a.label}
              </Button>
            ))}
          </Card>
        </Box>
      </Box>

      <ProductConfigurationsModal
        open={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        product={product}
        onGenerate={(newProducts) => {
          setConfigurations(prev => [...prev, ...newProducts]);
        }}
      />
    </Box>
  );
}

function Field({ label, required, children, sx }) {
  return (
    <Box sx={sx}>
      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: '#333' }}>
        {label}{required && <span style={{ color: 'red' }}> *</span>}
      </Typography>
      {children}
    </Box>
  );
}
