# WebArenaX → MUI CI4A 迁移计划

## 概述

将 WebArenaX（Vue 3 + Ant Design Vue）的 Magento 后台管理面板复刻为 React + MUI CI4A 版本。

- **源项目**: `../WebArenaX` (Vue 3 + AntDV)
- **目标项目**: `.` (React 19 + MUI 9.2.0 CI4A)
- **API 后端**: `http://localhost:5000` (Express + MySQL，复用现有后端)
- **迁移策略**: 一次一个页面，每个页面完成后需验证标记 ✅

---

## 架构映射

| 概念 | WebArenaX (Vue/AntDV) | mui-ci4a-demo (React/MUI) |
|------|----------------------|--------------------------|
| 框架 | Vue 3 Composition API | React 19 + Hooks |
| UI 库 | ant-design-vue (AntDV) | @mui/material (MUI CI4A) |
| 图标 | @ant-design/icons-vue | @mui/icons-material |
| 路由 | `v-if` 条件渲染 (currentPage ref) | `useState` + 条件渲染 |
| 样式 | Scoped CSS + AntDV 主题 | MUI `sx` prop + `styled()` |
| HTTP | axios / fetch | axios (需安装) |
| 日期 | dayjs | dayjs (需安装) |
| 状态管理 | reactive/ref | useState/useReducer |

---

## AntDV → MUI 组件映射速查

| AntDV 组件 | MUI 等价组件 |
|-----------|-------------|
| `a-layout` / `a-layout-sider` / `a-layout-header` / `a-layout-content` | `Box` + `Drawer` + `AppBar` + custom layout |
| `a-menu` / `a-menu-item` / `a-sub-menu` (侧边栏) | `List` + `ListItemButton` + `Collapse` (递归树形) |
| `a-dropdown` / `a-menu` (下拉菜单) | `Menu` + `MenuItem` ✅ **CI4A patched** (`getMenuStatus`, `navigateTo`) |
| `a-button` | `Button` ✅ **CI4A patched** (`clickButton`, `getButtonStatus`) |
| `a-input` / `a-input-number` | `TextField` ✅ **CI4A patched** (`getInputStatus`, `setValue`) |
| `a-select` / `a-select-option` | `Select` + `MenuItem` ✅ **CI4A patched** (`getSelectStatus`, `setValue`) |
| `a-table` | `Table` + `TableHead` + `TableBody` + `TableRow` + `TableCell` ✅ **CI4A patched** (`getTableStatus`, `selectRow`, `selectAllRows`) |
| `a-pagination` | `Pagination` ✅ **CI4A patched** (`getPaginationStatus`, `goToPage`) |
| `a-form` / `a-form-item` | 无直接等价 CI4A 组件，但子组件可用：`TextField`/`Select`/`Checkbox`/`Switch`/`Radio` 等 ✅ |
| `a-card` | `Card` / `Paper` |
| `a-checkbox` / `a-checkbox-group` | `Checkbox` + `FormControlLabel` ✅ **CI4A patched** (`getCheckboxStatus`, `setValue`) |
| `a-switch` | `Switch` ✅ **CI4A patched** (`getSwitchStatus`, `setValue`) |
| `a-radio-group` / `a-radio` | `RadioGroup` + `Radio` ✅ **CI4A patched** (`getRadioGroupStatus`/`getRadioStatus`, `setValue`) |
| `a-slider` | `Slider` ✅ **CI4A patched** (`getSliderStatus`) |
| `a-rate` | `Rating` ✅ **CI4A patched** (`getRatingStatus`) |
| `a-autocomplete` | `Autocomplete` ✅ **CI4A patched** (`getAutocompleteStatus`, `setValue`) |
| `a-date-picker` | `TextField type="date"` 或 MUI X `DatePicker` |
| `a-tabs` / `a-tab-pane` | `Tabs` + `Tab` + `TabPanel` |
| `a-popover` | `Popover` |
| `a-modal` | `Dialog` |
| `a-tag` | `Chip` |
| `a-empty` | 自定义 `Box` 居中提示 |
| `a-message` / `a-notification` | `Snackbar` / `Alert` |
| `a-row` / `a-col` | `Grid` |
| `a-space` | `Stack` |
| `a-breadcrumb` | `Breadcrumbs` ✅ **CI4A patched** (`getBreadcrumbStatus`, `navigateTo`) |
| `a-upload` | 自定义文件上传 |

---

## 基础设施 (Phase 0) ✅ 已完成

需要在开始页面迁移前完成：

- [x] **0.1** 添加 API 代理到 vite.config.js (`/api` → `http://127.0.0.1:5000`)
- [x] **0.2** 安装额外依赖: `axios`, `dayjs`
- [x] **0.3** 创建 `AdminLayout.jsx` (侧边栏 + 顶栏 + 内容区)
  - 侧边栏: `List` + `ListItemButton` + `Collapse` 递归树形导航
  - 顶栏: 搜索(CI4A `Menu`+`TextField`)、通知、用户头像(CI4A `Menu`)
  - Magento 橙色主题 `#eb5202`
- [x] **0.4** 改造 `App.jsx` 为页面路由容器 (useState 条件渲染 + VALID_PAGES)
- [x] **0.5** 创建通用 `NoData.jsx` 页面组件
- [x] **0.6** 添加全局 MUI ThemeProvider (Magento 橙色主题 `#eb5202` + CssBaseline)
- [x] **0.7** 移除 React.StrictMode（CI4A 注册与 StrictMode 的 double-effect cleanup 冲突，会导致 exportSchema 返回 []）

---

## 页面迁移清单

### 1️⃣ Dashboard (仪表盘)
- **文件**: `src/pages/Dashboard.jsx`
- **AntDV 组件**: `a-select`, `a-button`, `a-card`, `a-table`, `a-tabs`, `a-tab-pane`
- **MUI 等价**: `Select`, `Button`, `Card`/`Paper`, `Table`, `Tabs`+`Tab`
- **API**: `/api/dashboard/stats`, `/api/dashboard/last-orders`, `/api/dashboard/last-search-terms`, `/api/dashboard/top-search-terms`, `/api/dashboard/bestsellers`, `/api/dashboard/new-customers`, `/api/dashboard/customers`
- **状态**: ✅ 已完成

### 2️⃣ Catalog - Products (产品列表)
- **文件**: `src/pages/CatalogProducts.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-select`, `a-input`, `a-input-number`, `a-date-picker`, `a-pagination`, `a-form`, `a-checkbox-group`, `a-dropdown`, `a-popover`
- **API**: `/api/catalog/products`
- **状态**: ✅ 已完成

### 3️⃣ Catalog - Product Edit (产品编辑)
- **文件**: `src/pages/ProductEdit.jsx`
- **状态**: ✅ 已完成（基础版：Switch/TextField/Select/Table + 锚点导航）

### 4️⃣ Catalog - Product Add (添加产品)
- **文件**: `src/pages/ProductAdd.jsx`
- **状态**: 🔄 进行中

### 4️⃣ Catalog - Product Add (添加产品)
- **文件**: `src/pages/ProductAdd.jsx`
- **AntDV 组件**: `a-form`, `a-input`, `a-select`, `a-button`, `a-tabs`
- **API**: `/api/catalog/products` (POST)
- **状态**: ⬜ 待开始

### 5️⃣ Sales - Orders (订单列表)
- **文件**: `src/pages/SalesOrders.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-select`, `a-input`, `a-date-picker`, `a-pagination`, `a-form`, `a-card`
- **API**: `/api/sales/orders`
- **状态**: ⬜ 待开始

### 6️⃣ Sales - Order View (订单详情)
- **文件**: `src/pages/SalesOrderView.jsx`
- **AntDV 组件**: `a-card`, `a-table`, `a-tag`, `a-button`, `a-descriptions`
- **API**: `/api/sales/orders/:id`
- **状态**: ⬜ 待开始

### 7️⃣ Sales - Invoices (发票列表)
- **文件**: `src/pages/SalesInvoices.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-card`, `a-pagination`
- **API**: `/api/sales/invoices`
- **状态**: ⬜ 待开始

### 8️⃣ Sales - Shipments (发货列表)
- **文件**: `src/pages/SalesShipments.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-card`, `a-pagination`
- **API**: `/api/sales/shipments`
- **状态**: ⬜ 待开始

### 9️⃣ Sales - Credit Memos (退款单)
- **文件**: `src/pages/SalesCreditMemos.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-card`, `a-pagination`
- **API**: `/api/sales/creditmemos`
- **状态**: ⬜ 待开始

### 🔟 Customers - All Customers (所有客户)
- **文件**: `src/pages/AllCustomers.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-input`, `a-select`, `a-pagination`, `a-form`
- **API**: `/api/customers`
- **状态**: ⬜ 待开始

### 1️⃣1️⃣ Customers - Customer Groups (客户组)
- **文件**: `src/pages/CustomerGroups.jsx`
- **AntDV 组件**: `a-table`, `a-button`
- **API**: `/api/customers/groups`
- **状态**: ⬜ 待开始

### 1️⃣2️⃣ Marketing - All Reviews (所有评论)
- **文件**: `src/pages/AllReviews.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-select`, `a-input`, `a-date-picker`, `a-pagination`, `a-form`
- **API**: `/api/marketing/reviews`
- **状态**: ⬜ 待开始

### 1️⃣3️⃣ Marketing - Review Edit (评论编辑)
- **文件**: `src/pages/MarketingReviewEdit.jsx`
- **AntDV 组件**: `a-form`, `a-input`, `a-select`, `a-button`, `a-radio-group`, `a-textarea`
- **API**: `/api/marketing/reviews/:id`
- **状态**: ⬜ 待开始

### 1️⃣4️⃣ Marketing - Pending Reviews (待审核评论)
- **文件**: `src/pages/PendingReviews.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-select`, `a-pagination`, `a-form`
- **API**: `/api/marketing/reviews/pending`
- **状态**: ⬜ 待开始

### 1️⃣5️⃣ Marketing - Catalog Price Rule (目录价格规则)
- **文件**: `src/pages/MarketingCatalogPriceRule.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-pagination`
- **API**: `/api/marketing/catalog-price-rules`
- **状态**: ⬜ 待开始

### 1️⃣6️⃣ Marketing - Catalog Price Rule Add (添加目录价格规则)
- **文件**: `src/pages/MarketingCatalogPriceRuleAdd.jsx`
- **AntDV 组件**: `a-form`, `a-input`, `a-select`, `a-date-picker`, `a-button`, `a-tabs`
- **API**: `/api/marketing/catalog-price-rules` (POST)
- **状态**: ⬜ 待开始

### 1️⃣7️⃣ Marketing - Cart Price Rules (购物车价格规则)
- **文件**: `src/pages/MarketingCartPriceRules.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-pagination`
- **API**: `/api/marketing/cart-price-rules`
- **状态**: ⬜ 待开始

### 1️⃣8️⃣ Marketing - Cart Price Rule Add (添加购物车价格规则)
- **文件**: `src/pages/MarketingCartPriceRuleAdd.jsx`
- **AntDV 组件**: `a-form`, `a-input`, `a-select`, `a-button`, `a-tabs`
- **API**: `/api/marketing/cart-price-rules` (POST)
- **状态**: ⬜ 待开始

### 1️⃣9️⃣ Marketing - Newsletter Subscribers (新闻订阅者)
- **文件**: `src/pages/MarketingNewsletterSubscribers.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-pagination`
- **API**: `/api/marketing/newsletter-subscribers`
- **状态**: ⬜ 待开始

### 2️⃣0️⃣ Marketing - URL Rewrites (URL 重写)
- **文件**: `src/pages/MarketingUrlRewrites.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-pagination`
- **API**: `/api/marketing/url-rewrites`
- **状态**: ⬜ 待开始

### 2️⃣1️⃣ Content - Pages (内容页面列表)
- **文件**: `src/pages/ContentPages.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-select`, `a-input`, `a-pagination`, `a-form`
- **API**: `/api/content/pages`
- **状态**: ⬜ 待开始

### 2️⃣2️⃣ Content - Page Edit (内容页面编辑)
- **文件**: `src/pages/ContentPageEdit.jsx`
- **AntDV 组件**: `a-form`, `a-input`, `a-select`, `a-button`, `a-tabs`, `a-textarea`
- **API**: `/api/content/pages/:id`
- **状态**: ⬜ 待开始

### 2️⃣3️⃣ Content - Page View (内容页面预览)
- **文件**: `src/pages/ContentPageView.jsx`
- **AntDV 组件**: `a-card`, `a-tag`, `a-button`
- **API**: `/api/content/pages/:id`
- **状态**: ⬜ 待开始

### 2️⃣4️⃣ Content - Blocks (内容块)
- **文件**: `src/pages/ContentBlocks.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-pagination`
- **API**: `/api/content/blocks`
- **状态**: ⬜ 待开始

### 2️⃣5️⃣ Content - Widgets (小部件)
- **文件**: `src/pages/ContentWidgets.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-pagination`
- **API**: `/api/content/widgets`
- **状态**: ⬜ 待开始

### 2️⃣6️⃣ Content - Design Configuration (设计配置)
- **文件**: `src/pages/ContentDesignConfig.jsx`
- **AntDV 组件**: `a-form`, `a-select`, `a-input`, `a-button`, `a-card`
- **API**: `/api/content/design-config`
- **状态**: ⬜ 待开始

### 2️⃣7️⃣ Content - Themes (主题列表)
- **文件**: `src/pages/ContentThemes.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-pagination`
- **API**: `/api/content/themes`
- **状态**: ⬜ 待开始

### 2️⃣8️⃣ Content - Theme View (主题详情)
- **文件**: `src/pages/ContentThemeView.jsx`
- **AntDV 组件**: `a-card`, `a-tag`, `a-button`
- **API**: `/api/content/themes/:id`
- **状态**: ⬜ 待开始

### 2️⃣9️⃣ Reports - Bestsellers (畅销报告)
- **文件**: `src/pages/BestsellersReport.jsx`
- **AntDV 组件**: `a-table`, `a-select`, `a-date-picker`, `a-button`, `a-pagination`, `a-form`
- **API**: `/api/reports/bestsellers`
- **状态**: ⬜ 待开始

### 3️⃣0️⃣ Reports - Search Terms (搜索词报告)
- **文件**: `src/pages/SearchTermsReport.jsx`
- **AntDV 组件**: `a-table`, `a-pagination`
- **API**: `/api/reports/search-terms`
- **状态**: ⬜ 待开始

### 3️⃣1️⃣ Reports - Order Count (订单数报告)
- **文件**: `src/pages/OrderCountReport.jsx`
- **AntDV 组件**: `a-table`, `a-date-picker`, `a-button`, `a-pagination`
- **API**: `/api/reports/order-count`
- **状态**: ⬜ 待开始

### 3️⃣2️⃣ Reports - Order Total (订单总额报告)
- **文件**: `src/pages/OrderTotalReport.jsx`
- **AntDV 组件**: `a-table`, `a-date-picker`, `a-button`, `a-pagination`
- **API**: `/api/reports/order-total`
- **状态**: ⬜ 待开始

### 3️⃣3️⃣ Reports - Sales Orders (销售订单报告)
- **文件**: `src/pages/SalesOrdersReport.jsx`
- **AntDV 组件**: `a-table`, `a-date-picker`, `a-button`, `a-pagination`
- **API**: `/api/reports/sales-orders`
- **状态**: ⬜ 待开始

### 3️⃣4️⃣ Reports - Tax (税务报告)
- **文件**: `src/pages/TaxReport.jsx`
- **AntDV 组件**: `a-table`, `a-date-picker`, `a-button`, `a-pagination`
- **API**: `/api/reports/tax`
- **状态**: ⬜ 待开始

### 3️⃣5️⃣ Reports - Shipping (运费报告)
- **文件**: `src/pages/ShippingReport.jsx`
- **AntDV 组件**: `a-table`, `a-date-picker`, `a-button`, `a-pagination`
- **API**: `/api/reports/shipping`
- **状态**: ⬜ 待开始

### 3️⃣6️⃣ Reports - Refunds (退款报告)
- **文件**: `src/pages/RefundsReport.jsx`
- **AntDV 组件**: `a-table`, `a-date-picker`, `a-button`, `a-pagination`
- **API**: `/api/reports/refunds`
- **状态**: ⬜ 待开始

### 3️⃣7️⃣ Reports - Product Views (产品浏览报告)
- **文件**: `src/pages/ProductViewsReport.jsx`
- **AntDV 组件**: `a-table`, `a-date-picker`, `a-button`, `a-pagination`
- **API**: `/api/reports/product-views`
- **状态**: ⬜ 待开始

### 3️⃣8️⃣ Reports - Coupons (优惠券报告)
- **文件**: `src/pages/CouponsReport.jsx`
- **AntDV 组件**: `a-table`, `a-date-picker`, `a-button`, `a-pagination`
- **API**: `/api/reports/coupons`
- **状态**: ⬜ 待开始

### 3️⃣9️⃣ Reports - By Products (按产品评论报告)
- **文件**: `src/pages/ProductReviewsReport.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-pagination`
- **API**: `/api/reports/reviews/by-products`
- **状态**: ⬜ 待开始

### 4️⃣0️⃣ Reports - By Customers (按客户评论报告)
- **文件**: `src/pages/CustomerReviewsReport.jsx`
- **AntDV 组件**: `a-table`, `a-button`, `a-pagination`
- **API**: `/api/reports/reviews/by-customers`
- **状态**: ⬜ 待开始

---

## 进度统计

| 分类 | 总数 | 已完成 | 进行中 | 待开始 |
|------|------|--------|--------|--------|
| 基础设施 | 7 | 7 | 0 | 0 |
| 页面迁移 | 40 | 0 | 1 | 39 |
| **合计** | **47** | **7** | **1** | **39** |

---

## 工作流程

1. 从本文件选择下一个 `⬜ 待开始` 的任务
2. 阅读 WebArenaX 源文件理解页面功能和 AntDV 组件使用
3. 在 mui-ci4a-demo 中创建对应的 React 页面组件
4. 在 App.jsx 中注册该页面
5. 确保页面可正常渲染
6. 通知用户验证
7. 用户验证通过后 → 在本文件中标记 ✅ 已完成
8. 重复下一个页面

---

## 当前焦点

**正在进行**: 等待用户验证 Phase 0 → 下一步: Dashboard

---

*最后更新: 2026-07-25*
