import { useState } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem,
  Switch, FormControlLabel, Card, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Save from '@mui/icons-material/Save';
import HelpOutline from '@mui/icons-material/HelpOutlineOutlined';
import Add from '@mui/icons-material/Add';

const VISIBILITY_OPTS = ['Not Visible Individually', 'Catalog', 'Search', 'Catalog, Search'];
const STOCK_OPTS = ['In Stock', 'Out of Stock'];
const TAX_OPTS = [{ value: 0, label: 'None' }, { value: 2, label: 'Taxable Goods' }];
const COUNTRY_OPTS = ['US', 'CN', 'JP', 'DE', 'GB', 'FR'];

const ANCHORS = [
  { key: 'basic-settings', label: 'Basic Settings' },
  { key: 'section-content', label: 'Content' },
  { key: 'section-seo', label: 'SEO' },
];

export default function ProductAdd({ onNavigate }) {
  const [product, setProduct] = useState({
    status: 1, name: '', sku: '', price: '', quantity: '',
    stock_status: 'In Stock', tax_class_id: 0, visibility: 'Catalog, Search',
    country_of_manufacture: '', weight: '',
  });

  const [attrModal, setAttrModal] = useState(false);
  const [newAttrName, setNewAttrName] = useState('');
  const [customAttrs, setCustomAttrs] = useState([]);

  const updateField = (k, v) => setProduct((p) => ({ ...p, [k]: v }));

  const addAttribute = () => {
    if (newAttrName.trim()) {
      setCustomAttrs([...customAttrs, { name: newAttrName.trim(), value: '' }]);
      setNewAttrName('');
      setAttrModal(false);
    }
  };

  const saveProduct = () => {
    const data = { ...product, customAttributes: customAttrs };
    onNavigate?.('catalog_products', { tempUpdate: { ...data, entity_id: Date.now(), name: product.name || 'New Product' } });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => onNavigate?.('catalog_products')}
            variant="outlined" size="small" sx={{ textTransform: 'none' }}>Back</Button>
          <Typography variant="h4" sx={{ fontWeight: 300 }}>New Product</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<Add />}
            onClick={() => setAttrModal(true)} sx={{ textTransform: 'none' }}>Add Attribute</Button>
          <Button variant="contained" startIcon={<Save />} onClick={saveProduct}
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

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Custom Attributes */}
          {customAttrs.length > 0 && (
            <Card sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Additional Attributes</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Attribute</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 80 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customAttrs.map((attr, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{attr.name}</TableCell>
                        <TableCell>
                          <TextField size="small" fullWidth value={attr.value}
                            onChange={(e) => {
                              const updated = [...customAttrs];
                              updated[idx].value = e.target.value;
                              setCustomAttrs(updated);
                            }} />
                        </TableCell>
                        <TableCell>
                          <Button size="small" color="error" onClick={() => setCustomAttrs(customAttrs.filter((_, i) => i !== idx))}
                            sx={{ textTransform: 'none' }}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          <Card sx={{ p: 3 }}>
            <Typography id="basic-settings" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Basic Settings</Typography>

            <FormControlLabel
              control={<Switch checked={product.status === 1}
                onChange={(e) => updateField('status', e.target.checked ? 1 : 2)} />}
              label={product.status === 1 ? 'Enabled' : 'Disabled'}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <Field label="Product Name *">
                <TextField size="small" fullWidth value={product.name}
                  onChange={(e) => updateField('name', e.target.value)} />
              </Field>
              <Field label="SKU *">
                <TextField size="small" fullWidth value={product.sku}
                  onChange={(e) => updateField('sku', e.target.value)} />
              </Field>
              <Field label="Price *">
                <TextField size="small" type="number" fullWidth value={product.price}
                  onChange={(e) => updateField('price', e.target.value)} />
              </Field>
              <Field label="Quantity">
                <TextField size="small" type="number" fullWidth value={product.quantity}
                  onChange={(e) => updateField('quantity', e.target.value)} />
              </Field>
              <Field label="Stock Status">
                <Select size="small" fullWidth value={product.stock_status}
                  onChange={(e) => updateField('stock_status', e.target.value)}>
                  {STOCK_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </Field>
              <Field label="Tax Class">
                <Select size="small" fullWidth value={product.tax_class_id}
                  onChange={(e) => updateField('tax_class_id', e.target.value)}>
                  {TAX_OPTS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </Field>
              <Field label="Visibility">
                <Select size="small" fullWidth value={product.visibility}
                  onChange={(e) => updateField('visibility', e.target.value)}>
                  {VISIBILITY_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </Field>
              <Field label="Country of Manufacture">
                <Select size="small" fullWidth value={product.country_of_manufacture}
                  onChange={(e) => updateField('country_of_manufacture', e.target.value)}>
                  <MenuItem value="">--</MenuItem>
                  {COUNTRY_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </Field>
            </Box>

            <Divider sx={{ my: 3 }} />
            <Typography id="section-content" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Content</Typography>
            <Field label="Description">
              <TextField size="small" fullWidth multiline rows={4} value={product.description || ''}
                onChange={(e) => updateField('description', e.target.value)} />
            </Field>
            <Field label="Short Description" sx={{ mt: 2 }}>
              <TextField size="small" fullWidth multiline rows={2} value={product.short_description || ''}
                onChange={(e) => updateField('short_description', e.target.value)} />
            </Field>

            <Divider sx={{ my: 3 }} />
            <Typography id="section-seo" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>SEO</Typography>
            <Field label="Meta Title">
              <TextField size="small" fullWidth value={product.meta_title || ''}
                onChange={(e) => updateField('meta_title', e.target.value)} />
            </Field>
            <Field label="Meta Keywords" sx={{ mt: 2 }}>
              <TextField size="small" fullWidth value={product.meta_keywords || ''}
                onChange={(e) => updateField('meta_keywords', e.target.value)} />
            </Field>
            <Field label="Meta Description" sx={{ mt: 2 }}>
              <TextField size="small" fullWidth multiline rows={3} value={product.meta_description || ''}
                onChange={(e) => updateField('meta_description', e.target.value)} />
            </Field>
          </Card>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ width: 200, flexShrink: 0 }}>
          <Card sx={{ p: 2, position: 'sticky', top: 80 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Sections</Typography>
            {ANCHORS.map(a => (
              <Button key={a.key}
                onClick={() => document.getElementById(a.key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                sx={{ display: 'block', width: '100%', fontSize: 12, color: '#1976d2', mb: 0.3, textTransform: 'none', justifyContent: 'flex-start', p: 0.3, minWidth: 0 }}>
                {a.label}
              </Button>
            ))}
          </Card>
        </Box>
      </Box>

      {/* Add Attribute Modal */}
      <Dialog open={attrModal} onClose={() => setAttrModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Attribute</DialogTitle>
        <DialogContent>
          <Field label="Attribute Name" required>
            <TextField size="small" fullWidth autoFocus value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAttribute()} />
          </Field>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttrModal(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={addAttribute}
            sx={{ bgcolor: '#eb5202', textTransform: 'none' }}>Add</Button>
        </DialogActions>
      </Dialog>
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
