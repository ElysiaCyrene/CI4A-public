import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Select, MenuItem, TextField,
  Checkbox, FormControlLabel, Chip, Divider, IconButton,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Delete from '@mui/icons-material/Delete';
import axios from 'axios';
import dayjs from 'dayjs';

const STATUS_OPTS = ['pending','processing','complete','closed','canceled','holded'];
const CARRIERS = [
  { value:'custom', label:'Custom Value' }, { value:'dhl', label:'DHL' },
  { value:'fedex', label:'FedEx' }, { value:'ups', label:'UPS' }, { value:'usps', label:'USPS' },
];

export default function SalesOrderView({ orderId, onNavigate }) {
  const [order, setOrder] = useState(null);
  const [tab, setTab] = useState('information');
  const [editingBilling, setEditingBilling] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);
  const [billingForm, setBillingForm] = useState({});
  const [shippingForm, setShippingForm] = useState({});
  const [tracking, setTracking] = useState([]);
  const [statusForm, setStatusForm] = useState({ status:'processing', comment:'', notify:false, visible:false });
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`/api/sales/orders/${orderId}`).then(res => {
      const o = res.data;
      setOrder(o);
      if (o.billing_address) setBillingForm({ ...o.billing_address });
      if (o.shipping_address) setShippingForm({ ...o.shipping_address });
    }).catch(e => console.error(e));
  }, [orderId]);

  if (!order) return <Typography sx={{ p: 4 }}>Loading...</Typography>;

  const fmtCurrency = v => v != null ? `$${parseFloat(v).toFixed(2)}` : '';
  const fmtDate = v => v ? dayjs(v).format('MMM D, YYYY h:mm A') : '';

  const updateStatus = () => {
    // Mock: only updates local comments, does NOT call backend
    setComments(prev => [{ ...statusForm, created_at: new Date().toISOString() }, ...prev]);
    setStatusForm({ status:'processing', comment:'', notify:false, visible:false });
  };

  const saveBilling = () => { setOrder(prev => ({...prev, billing_address: billingForm})); setEditingBilling(false); };
  const saveShipping = () => { setOrder(prev => ({...prev, shipping_address: shippingForm})); setEditingShipping(false); };
  const addTracking = () => setTracking([...tracking, { carrier:'', title:'', number:'' }]);

  const menuItems = [
    { key:'information', label:'Information' }, { key:'invoices', label:'Invoices' },
    { key:'credit_memos', label:'Credit Memos' }, { key:'shipments', label:'Shipments' },
    { key:'comments', label:'Comments History' },
  ];

  const itemCols = ['product','original_price','price','qty_ordered','subtotal','tax_amount','discount_amount','row_total'];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3, flexWrap:'wrap', gap:1 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => onNavigate?.('sales_orders')}
            variant="outlined" size="small" sx={{ textTransform:'none' }}>Back</Button>
          <Typography variant="h4" sx={{ fontWeight:300 }}>#{order.increment_id}</Typography>
        </Box>
        <Box sx={{ display:'flex', gap:0.5, flexWrap:'wrap' }}>
          {['Send Email','Hold','Invoice','Ship','Reorder'].map(a => (
            <Button key={a} size="small" variant="outlined" sx={{ textTransform:'none' }}>{a}</Button>
          ))}
          <Button size="small" variant="contained" sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Edit</Button>
        </Box>
      </Box>

      <Box sx={{ display:'flex', gap:3 }}>
        {/* Left Menu */}
        <Box sx={{ width:200, flexShrink:0 }}>
          <Card>
            {menuItems.map(m => (
              <Button key={m.key} fullWidth onClick={() => setTab(m.key)}
                sx={{ textTransform:'none', justifyContent:'flex-start', px:2, py:1.5, fontSize:13, borderRadius:0,
                  color: tab===m.key ? '#fff':'#333', bgcolor: tab===m.key ? '#eb5202':'transparent',
                  '&:hover':{ bgcolor: tab===m.key ? '#d44902':'#f5f5f5' } }}>
                {m.label}
              </Button>
            ))}
          </Card>
        </Box>

        {/* Main */}
        <Box sx={{ flex:1, minWidth:0 }}>
          <Section>Order & Account Information</Section>
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, mb:3 }}>
            <InfoBox title={`Order # ${order.increment_id}`}>
              <Row label="Order Date">{fmtDate(order.created_at)}</Row>
              <Row label="Order Status"><Chip label={order.status} size="small" /></Row>
              <Row label="Purchased From">{order.store_name}</Row>
              <Row label="Placed from IP">{order.remote_ip}</Row>
            </InfoBox>
            <InfoBox title="Account Information">
              <Row label="Customer Name">{order.customer_firstname} {order.customer_lastname}</Row>
              <Row label="Email"><a href={`mailto:${order.customer_email}`}>{order.customer_email}</a></Row>
              <Row label="Customer Group">General</Row>
            </InfoBox>
          </Box>

          {/* Address Information */}
          <Section>Address Information</Section>
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, mb:3 }}>
            <InfoBox title="Billing Address" edit onClick={() => setEditingBilling(!editingBilling)}>
              {editingBilling ? (
                <AddressForm form={billingForm} setForm={setBillingForm} onSave={saveBilling} onCancel={() => setEditingBilling(false)} />
              ) : order.billing_address ? (
                <AddressDisplay addr={order.billing_address} />
              ) : <Typography fontSize={13} color="text.secondary">No billing address</Typography>}
            </InfoBox>
            <InfoBox title="Shipping Address" edit onClick={() => setEditingShipping(!editingShipping)}>
              {editingShipping ? (
                <AddressForm form={shippingForm} setForm={setShippingForm} onSave={saveShipping} onCancel={() => setEditingShipping(false)} />
              ) : order.shipping_address ? (
                <AddressDisplay addr={order.shipping_address} />
              ) : <Typography fontSize={13} color="text.secondary">No shipping address</Typography>}
            </InfoBox>
          </Box>

          {/* Payment & Shipping */}
          <Section>Payment & Shipping Method</Section>
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, mb:3 }}>
            <InfoBox title="Payment Information">
              <Typography fontSize={13}>{order.payment?.method || 'Check / Money order'}</Typography>
              <Typography fontSize={13} color="text.secondary">The order was placed using {order.order_currency_code}.</Typography>
            </InfoBox>
            <InfoBox title="Shipping & Handling Information">
              <Typography fontSize={13}>{order.shipping_description} {fmtCurrency(order.shipping_amount)}</Typography>
              <Box sx={{ mt:1 }}>
                {tracking.map((t, i) => (
                  <Box key={i} sx={{ display:'flex', gap:0.5, mb:0.5 }}>
                    <Select size="small" value={t.carrier} onChange={e => { const n=[...tracking]; n[i].carrier=e.target.value; setTracking(n); }} sx={{ flex:2 }}>
                      {CARRIERS.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                    </Select>
                    <TextField size="small" placeholder="Title" value={t.title} onChange={e => { const n=[...tracking]; n[i].title=e.target.value; setTracking(n); }} sx={{ flex:2 }} />
                    <TextField size="small" placeholder="Number" value={t.number} onChange={e => { const n=[...tracking]; n[i].number=e.target.value; setTracking(n); }} sx={{ flex:2 }} />
                    <IconButton size="small" onClick={() => setTracking(tracking.filter((_,j) => j!==i))}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={addTracking} sx={{ textTransform:'none', mt:0.5 }}>Add Tracking Number</Button>
              </Box>
            </InfoBox>
          </Box>

          {/* Items Ordered */}
          <Section>Items Ordered</Section>
          <Card sx={{ mb:3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Product','Original Price','Price','Qty','Subtotal','Tax','Discount','Row Total'].map(h => (
                      <TableCell key={h} sx={{ fontWeight:600, fontSize:12 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(order.items || []).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {item.name}
                        <Typography variant="caption" display="block" color="text.secondary">SKU: {item.sku}</Typography>
                        {item.product_options && <Typography variant="caption" display="block" color="text.secondary">{item.product_options}</Typography>}
                      </TableCell>
                      {['original_price','price','qty_ordered','subtotal','tax_amount','discount_amount','row_total'].map(k => (
                        <TableCell key={k}>{k === 'qty_ordered' ? item[k] : fmtCurrency(item[k])}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Totals + Notes */}
          <Box sx={{ display:'flex', gap:3, flexWrap:'wrap' }}>
            {/* Notes */}
            <Box sx={{ flex:2, minWidth:300 }}>
              <Section>Notes for this Order</Section>
              <Card sx={{ p:2 }}>
                <Field label="Status">
                  <Select size="small" value={statusForm.status} onChange={e => setStatusForm({...statusForm, status:e.target.value})} sx={{ width:200 }}>
                    {STATUS_OPTS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </Field>
                <Field label="Comment">
                  <TextField size="small" fullWidth multiline rows={4} value={statusForm.comment}
                    onChange={e => setStatusForm({...statusForm, comment:e.target.value})} />
                </Field>
                <FormControlLabel control={<Checkbox size="small" checked={statusForm.notify}
                  onChange={e => setStatusForm({...statusForm, notify:e.target.checked})} />} label="Notify Customer by Email" />
                <Box sx={{ mb:1 }}>
                  <FormControlLabel control={<Checkbox size="small" checked={statusForm.visible}
                    onChange={e => setStatusForm({...statusForm, visible:e.target.checked})} />} label="Visible on Storefront" />
                </Box>
                <Button variant="contained" onClick={updateStatus} disabled={submitting}
                  sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Submit Comment</Button>

                {comments.length > 0 && (
                  <Box sx={{ mt:3, borderTop:'1px solid #eee', pt:2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight:600, mb:1.5 }}>Comments History</Typography>
                    {comments.map((c, i) => (
                      <Box key={i} sx={{ mb:1.5, pb:1, borderBottom:'1px dashed #f0f0f0' }}>
                        <Box sx={{ display:'flex', gap:1, alignItems:'center', mb:0.5, fontSize:13 }}>
                          <Typography fontWeight={600}>{fmtDate(c.created_at)}</Typography>
                          <Chip label={c.status} size="small" variant="outlined" />
                          {c.is_customer_notified && <Typography color="green" fontSize={12}>Customer Notified</Typography>}
                        </Box>
                        <Typography fontSize={13}>{c.comment}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            </Box>

            {/* Totals */}
            <Box sx={{ flex:1, minWidth:250 }}>
              <Section>Order Totals</Section>
              <Card sx={{ p:2 }}>
                {[
                  ['Subtotal', order.subtotal], ['Discount', order.discount_amount],
                  ['Shipping & Handling', order.shipping_amount], ['Tax', order.tax_amount],
                ].map(([k,v]) => (
                  <Box key={k} sx={{ display:'flex', justifyContent:'space-between', py:0.3 }}>
                    <Typography fontSize={13}>{k}</Typography>
                    <Typography fontSize={13}>{fmtCurrency(v)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my:1 }} />
                <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                  <Typography fontWeight={700}>Grand Total</Typography>
                  <Typography fontWeight={700}>{fmtCurrency(order.grand_total)}</Typography>
                </Box>
                <Box sx={{ display:'flex', justifyContent:'space-between', mt:0.5 }}>
                  <Typography fontWeight={700}>Total Paid</Typography>
                  <Typography fontWeight={700}>{fmtCurrency(order.total_paid)}</Typography>
                </Box>
                <Box sx={{ display:'flex', justifyContent:'space-between', mt:0.5 }}>
                  <Typography fontWeight={700}>Total Due</Typography>
                  <Typography fontWeight={700}>{fmtCurrency(order.total_due)}</Typography>
                </Box>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ===== 子组件 =====
function Section({ children }) {
  return <Typography variant="subtitle1" sx={{ fontWeight:600, mb:1.5, color:'#333' }}>{children}</Typography>;
}

function InfoBox({ title, edit, onClick, children }) {
  return (
    <Card sx={{ p:2 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight:600 }}>{title}</Typography>
        {edit && <Button size="small" onClick={onClick} sx={{ textTransform:'none', fontSize:12 }}>Edit</Button>}
      </Box>
      {children}
    </Card>
  );
}

function Row({ label, children }) {
  return (
    <Box sx={{ display:'flex', mb:0.8, fontSize:13 }}>
      <Typography color="text.secondary" sx={{ minWidth:140 }}>{label}</Typography>
      <Box>{children}</Box>
    </Box>
  );
}

function AddressDisplay({ addr }) {
  if (!addr) return null;
  return (
    <Box fontSize={13}>
      <div>{addr.firstname} {addr.lastname}</div>
      <div>{addr.street}</div>
      <div>{addr.city}, {addr.region}, {addr.postcode}</div>
      <div>{addr.country_id}</div>
      <div>T: {addr.telephone}</div>
    </Box>
  );
}

function AddressForm({ form, setForm, onSave, onCancel }) {
  const u = (k, v) => setForm(prev => ({ ...prev, [k]:v}));
  return (
    <Box>
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 }}>
        <Field label="First Name"><TextField size="small" fullWidth value={form.firstname||''} onChange={e => u('firstname', e.target.value)} /></Field>
        <Field label="Last Name"><TextField size="small" fullWidth value={form.lastname||''} onChange={e => u('lastname', e.target.value)} /></Field>
      </Box>
      <Field label="Street"><TextField size="small" fullWidth value={form.street||''} onChange={e => u('street', e.target.value)} /></Field>
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 }}>
        <Field label="City"><TextField size="small" fullWidth value={form.city||''} onChange={e => u('city', e.target.value)} /></Field>
        <Field label="Region"><TextField size="small" fullWidth value={form.region||''} onChange={e => u('region', e.target.value)} /></Field>
      </Box>
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1 }}>
        <Field label="Postcode"><TextField size="small" fullWidth value={form.postcode||''} onChange={e => u('postcode', e.target.value)} /></Field>
        <Field label="Country"><TextField size="small" fullWidth value={form.country_id||''} onChange={e => u('country_id', e.target.value)} /></Field>
      </Box>
      <Field label="Telephone"><TextField size="small" fullWidth value={form.telephone||''} onChange={e => u('telephone', e.target.value)} /></Field>
      <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1, mt:1 }}>
        <Button size="small" onClick={onCancel} sx={{ textTransform:'none' }}>Cancel</Button>
        <Button size="small" variant="contained" onClick={onSave} sx={{ bgcolor:'#eb5202', textTransform:'none' }}>Save</Button>
      </Box>
    </Box>
  );
}

function Field({ label, children }) {
  return (
    <Box sx={{ mb:1 }}>
      <Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5, color:'#333' }}>{label}</Typography>
      {children}
    </Box>
  );
}
