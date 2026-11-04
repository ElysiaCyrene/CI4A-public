import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  Tabs, Tab, Grid,
} from '@mui/material';
import QuestionIcon from '@mui/icons-material/HelpOutlineOutlined';
import ExportIcon from '@mui/icons-material/Launch';
import axios from 'axios';

// ------ 格式化工具 ------
const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

// ------ TabPanel ------
function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const [scope, setScope] = useState('all');

  // 数据
  const [lifetimeSales, setLifetimeSales] = useState(0);
  const [averageOrder, setAverageOrder] = useState(0);
  const [lastOrders, setLastOrders] = useState([]);
  const [lastSearchTerms, setLastSearchTerms] = useState([]);
  const [topSearchTerms, setTopSearchTerms] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newCustomers, setNewCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);

  const fetchData = async () => {
    try {
      const params = {};
      if (scope !== 'all') params.store_id = scope;

      const [
        stats, lastOrd, lastSearch, topSearch,
        best, newCust, cust,
      ] = await Promise.all([
        axios.get('/api/dashboard/stats', { params }),
        axios.get('/api/dashboard/last-orders', { params }),
        axios.get('/api/dashboard/last-search-terms', { params }),
        axios.get('/api/dashboard/top-search-terms', { params }),
        axios.get('/api/dashboard/bestsellers', { params }),
        axios.get('/api/dashboard/new-customers', { params }),
        axios.get('/api/dashboard/customers', { params }),
      ]);

      setLifetimeSales(stats.data.lifetime_sales);
      setAverageOrder(stats.data.average_order);
      setLastOrders(lastOrd.data.map((d, i) => ({ ...d, key: i })));
      setLastSearchTerms(lastSearch.data.map((d, i) => ({ ...d, key: i })));
      setTopSearchTerms(topSearch.data.map((d, i) => ({ ...d, key: i })));
      setBestsellers(best.data.map((d, i) => ({ ...d, key: i })));
      setNewCustomers(newCust.data.map((d, i) => ({ ...d, key: i })));
      setCustomers(cust.data.map((d, i) => ({ ...d, key: i })));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  };

  useEffect(() => { fetchData(); }, [scope]);

  // ------ 表格列定义 ------
  const orderColumns = [
    { id: 'customer', label: 'Customer' },
    { id: 'items', label: 'Items', align: 'center' },
    { id: 'total', label: 'Total', align: 'right', format: fmtCurrency },
  ];
  const searchColumns = [
    { id: 'term', label: 'Search Term' },
    { id: 'results', label: 'Results', align: 'center' },
    { id: 'uses', label: 'Uses', align: 'right' },
  ];
  const bestsellerColumns = [
    { id: 'product', label: 'Product' },
    { id: 'price', label: 'Price', align: 'right', format: fmtCurrency },
    { id: 'quantity', label: 'Quantity', align: 'right' },
  ];
  const customerColumns = [
    { id: 'customer', label: 'Customer' },
    { id: 'orders', label: 'Orders', align: 'center' },
    { id: 'average', label: 'Average', align: 'right', format: fmtCurrency },
    { id: 'total', label: 'Total', align: 'right', format: fmtCurrency },
  ];

  const renderTable = (data, cols) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {cols.map((c) => (
              <TableCell key={c.id} align={c.align || 'left'}
                sx={{ fontWeight: 600, borderBottom: '1px solid #e3e3e3' }}>
                {c.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.key}>
              {cols.map((c) => (
                <TableCell key={c.id} align={c.align || 'left'}>
                  {c.format ? c.format(row[c.id]) : row[c.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ fontFamily: '"Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      {/* ===== Header ===== */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 300, color: '#333' }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography fontWeight={600} fontSize={14}>Scope:</Typography>
            <Select
              size="small"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All Store Views</MenuItem>
              <MenuItem value="1">Default Store View</MenuItem>
            </Select>
            <QuestionIcon sx={{ color: '#666', fontSize: 18 }} />
          </Box>
          <Button
            variant="contained"
            onClick={fetchData}
            sx={{ bgcolor: '#eb5202', '&:hover': { bgcolor: '#d44902' }, textTransform: 'none', fontWeight: 600 }}
          >
            Reload Data
          </Button>
        </Box>
      </Box>

      {/* ===== Advanced Reporting ===== */}
      <Paper sx={{ p: 2.5, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Advanced Reporting</Typography>
          <Typography color="text.secondary" fontSize={13}>
            Gain new insights and take command of your business' performance,
            using our dynamic product, order, and customer reports tailored to your customer data.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          endIcon={<ExportIcon />}
          sx={{ color: '#007bdb', borderColor: '#007bdb', fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap', ml: 2 }}
        >
          Go to Advanced Reporting
        </Button>
      </Paper>

      {/* ===== Chart Section ===== */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>Lifetime Sales</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#eb5202' }}>{fmtCurrency(lifetimeSales)}</Typography>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>Average Order</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#eb5202' }}>{fmtCurrency(averageOrder)}</Typography>
          </Box>

          <Box sx={{ display: 'flex', borderTop: '1px solid #e3e3e3', pt: 3 }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <Typography color="text.secondary" fontSize={13}>
                Chart is disabled. To enable the chart, click <a href="#">here</a>.
              </Typography>
            </Box>
            <Box sx={{ width: 300, pl: 3 }}>
              {[
                { label: 'Revenue', value: '$0.00' },
                { label: 'Tax', value: '$0.00' },
                { label: 'Shipping', value: '$0.00' },
                { label: 'Quantity', value: '0' },
              ].map((s) => (
                <Box key={s.label} sx={{ mb: 2.5 }}>
                  <Typography fontWeight={600} fontSize={13}>{s.label}</Typography>
                  <Typography fontSize={18} fontWeight={600} color="#eb5202">{s.value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, color: '#333' }}>
      {children}
    </Typography>
  );
}
