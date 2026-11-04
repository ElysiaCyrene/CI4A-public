import { useState, useMemo } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar,
  TextField, InputAdornment, Menu, MenuItem, Divider,
  ListItemIcon, ListItemText,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DollarIcon from '@mui/icons-material/AttachMoney';
import InboxIcon from '@mui/icons-material/Inventory';
import UserIcon from '@mui/icons-material/People';
import SoundIcon from '@mui/icons-material/Campaign';
import FileTextIcon from '@mui/icons-material/Article';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShopIcon from '@mui/icons-material/Store';
import SettingIcon from '@mui/icons-material/Settings';
import ApiIcon from '@mui/icons-material/Api';
import AppstoreIcon from '@mui/icons-material/Apps';
import SearchIcon from '@mui/icons-material/Search';
import BellIcon from '@mui/icons-material/Notifications';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import RightIcon from '@mui/icons-material/KeyboardArrowRight';

// ==================== 菜单数据 ====================
const menuSections = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  {
    key: 'sales', label: 'Sales', icon: <DollarIcon />,
    items: [
      { key: 'sales_orders', label: 'Orders' },
      { key: 'sales_invoices', label: 'Invoices' },
      { key: 'sales_shipments', label: 'Shipments' },
      { key: 'sales_credit_memos', label: 'Credit Memos' },
    ],
  },
  {
    key: 'catalog', label: 'Catalog', icon: <InboxIcon />,
    items: [
      { key: 'catalog_products', label: 'Products' },
      { key: 'catalog_categories', label: 'Categories' },
    ],
  },
  {
    key: 'customers', label: 'Customers', icon: <UserIcon />,
    items: [
      { key: 'customers_all', label: 'All Customers' },
      { key: 'customers_groups', label: 'Customer Groups' },
    ],
  },
  {
    key: 'marketing', label: 'Marketing', icon: <SoundIcon />,
    items: [
      { key: 'marketing_catalog_price_rule', label: 'Catalog Price Rule' },
      { key: 'marketing_cart_price_rules', label: 'Cart Price Rules' },
      { key: 'marketing_newsletter_subscribers', label: 'Newsletter Subscribers' },
      { key: 'marketing_url_rewrites', label: 'URL Rewrites' },
      { key: 'marketing_all_reviews', label: 'All Reviews' },
      { key: 'marketing_pending_reviews', label: 'Pending Reviews' },
    ],
  },
  {
    key: 'content', label: 'Content', icon: <FileTextIcon />,
    items: [
      { key: 'content_pages', label: 'Pages' },
      { key: 'content_blocks', label: 'Blocks' },
      { key: 'content_widgets', label: 'Widgets' },
      { key: 'content_configuration', label: 'Configuration' },
      { key: 'content_themes', label: 'Themes' },
    ],
  },
  {
    key: 'reports', label: 'Reports', icon: <BarChartIcon />,
    items: [
      { key: 'reports_bestsellers', label: 'Bestsellers' },
      { key: 'reports_search_terms', label: 'Search Terms' },
      { key: 'reports_order_count', label: 'Order Count' },
      { key: 'reports_order_total', label: 'Order Total' },
      { key: 'reports_sales_orders', label: 'Sales Orders' },
      { key: 'reports_tax', label: 'Tax' },
      { key: 'reports_shipping', label: 'Shipping' },
      { key: 'reports_refunds', label: 'Refunds' },
      { key: 'reports_views', label: 'Product Views' },
      { key: 'reports_coupons', label: 'Coupons' },
      { key: 'reports_by_products', label: 'Reviews by Products' },
      { key: 'reports_by_customers', label: 'Reviews by Customers' },
    ],
  },
  { key: 'stores', label: 'Stores', icon: <ShopIcon />, items: [] },
  { key: 'system', label: 'System', icon: <SettingIcon />, items: [] },
];

const searchItems = menuSections.flatMap((s) =>
  (s.items?.length ? s.items : [s]).map((i) => ({
    key: i.key, title: i.label, path: `${s.label}${i.key !== s.key ? ' > ' + i.label : ''}`,
  }))
);

// ==================== SectionMenu 组件 ====================
// 每个大类一个独立的 CI4A Menu
function SectionMenu({ section, selectedKey, onMenuClick }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleItemClick = (key) => {
    onMenuClick(key);
    setAnchorEl(null);
  };

  const hasChildren = section.items?.length > 0;
  const isActive = hasChildren
    ? section.items.some((i) => i.key === selectedKey)
    : selectedKey === section.key;

  return (
    <>
      {/* 触发按钮 */}
      <Box
        data-ci4a-trigger={section.key}
        onClick={hasChildren ? handleClick : () => onMenuClick(section.key)}
        sx={{
          display: 'flex', alignItems: 'center', px: 2, py: 1.2, cursor: 'pointer',
          color: isActive ? '#fff' : '#ccc',
          bgcolor: !hasChildren && isActive ? '#eb5202' : 'transparent',
          '&:hover': {
            bgcolor: !hasChildren && isActive ? '#d44902' : 'rgba(255,255,255,0.08)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: isActive ? '#fff' : '#999' }}>
          {section.icon}
        </ListItemIcon>
        <ListItemText
          primary={section.label}
          primaryTypographyProps={{ sx: { fontSize: 13 } }}
        />
        {hasChildren && <RightIcon sx={{ fontSize: 16 }} />}
      </Box>

      {/* CI4A Menu: 每个大类独立的弹出菜单 */}
      {hasChildren && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onCi4aNavigate={(idx) => {
            const item = section.items[idx];
            if (item) onMenuClick(item.key);
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                ml: 1,
                minWidth: 200,
                bgcolor: '#343434',
                color: '#ccc',
                '& .MuiList-root': { py: 0.5 },
              },
            },
          }}
        >
          {section.items.map((item) => (
            <MenuItem
              key={item.key}
              selected={selectedKey === item.key}
              onClick={() => handleItemClick(item.key)}
              sx={{
                fontSize: 13, py: 0.8,
                '&.Mui-selected': {
                  bgcolor: '#eb5202 !important', color: '#fff',
                  '&:hover': { bgcolor: '#d44902 !important' },
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
}

// ==================== AdminLayout ====================
export default function AdminLayout({ selectedKey, onMenuClick, children }) {
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchItems
      .filter((i) => i.title.toLowerCase().includes(q) || i.path.toLowerCase().includes(q))
      .slice(0, 10);
  }, [searchQuery]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ===== 侧边栏 ===== */}
      <Box
        sx={{
          width: 260, bgcolor: '#343434', display: 'flex',
          flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
        }}
      >
        <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AppstoreIcon sx={{ fontSize: 32, color: '#eb5202' }} />
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

        <Box sx={{ flex: 1, overflow: 'auto', py: 0.5 }}>
          {menuSections.map((section) => (
            <SectionMenu
              key={section.key}
              section={section}
              selectedKey={selectedKey}
              onMenuClick={onMenuClick}
            />
          ))}
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <Box
          onClick={() => onMenuClick('find_partners')}
          sx={{
            display: 'flex', alignItems: 'center', px: 2, py: 1.2,
            cursor: 'pointer', color: '#ccc',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: '#999' }}><ApiIcon /></ListItemIcon>
          <ListItemText primary="Find Partners" primaryTypographyProps={{ sx: { fontSize: 13 } }} />
        </Box>
      </Box>

      {/* ===== 右侧主体 ===== */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky" color="default" elevation={0}
          sx={{ bgcolor: '#fff', borderBottom: '1px solid #e3e3e3', zIndex: 1100 }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
            <Box />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <IconButton onClick={(e) => setSearchAnchor(e.currentTarget)} size="small">
                <SearchIcon sx={{ fontSize: 18, color: '#666' }} />
              </IconButton>
              <Menu
                anchorEl={searchAnchor}
                open={Boolean(searchAnchor)}
                onClose={() => { setSearchAnchor(null); setSearchQuery(''); }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { width: 420, mt: 1, p: 1.5 } } }}
              >
                <TextField
                  fullWidth autoFocus size="small" placeholder="search menu..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start"><SearchIcon sx={{ color: '#999' }} /></InputAdornment>
                      ),
                    },
                  }}
                />
                <Box sx={{ maxHeight: 320, overflow: 'auto', mt: 1 }}>
                  {filteredResults.length === 0 && searchQuery ? (
                    <Typography sx={{ p: 2, textAlign: 'center', color: '#999' }}>No matches</Typography>
                  ) : (
                    filteredResults.map((item) => (
                      <Box
                        key={item.key}
                        onClick={() => { onMenuClick(item.key); setSearchAnchor(null); setSearchQuery(''); }}
                        sx={{ p: 1.5, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
                      >
                        <Typography fontWeight={500} fontSize={14}>{item.title}</Typography>
                        <Typography fontSize={12} color="text.secondary">{item.path}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Menu>

              <IconButton size="small"><BellIcon sx={{ fontSize: 18, color: '#666' }} /></IconButton>

              <Box
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3e3e3' }}>
                  <UserIcon sx={{ color: '#666', fontSize: 18 }} />
                </Avatar>
                <Typography fontWeight={500} fontSize={14}>admin</Typography>
                <DownIcon sx={{ fontSize: 12, color: '#666' }} />
              </Box>
              <Menu
                anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => setUserMenuAnchor(null)}>Account Setting</MenuItem>
                <MenuItem onClick={() => setUserMenuAnchor(null)}>Customer View</MenuItem>
                <Divider />
                <MenuItem onClick={() => setUserMenuAnchor(null)}>Sign Out</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, bgcolor: '#f4f4f4', p: 3, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
