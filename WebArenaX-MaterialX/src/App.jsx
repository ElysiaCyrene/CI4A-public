import { useState, useCallback, Component } from 'react';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import CatalogProducts from './pages/CatalogProducts';
import ProductEdit from './pages/ProductEdit';
import ProductAdd from './pages/ProductAdd';
import SalesOrders from './pages/SalesOrders';
import SalesOrderView from './pages/SalesOrderView';
import SalesInvoices from './pages/SalesInvoices';
import SalesShipments from './pages/SalesShipments';
import SalesCreditMemos from './pages/SalesCreditMemos';
import AllCustomers from './pages/AllCustomers';
import CustomerGroups from './pages/CustomerGroups';
import AllReviews from './pages/AllReviews';
import MarketingCatalogPriceRule from './pages/MarketingCatalogPriceRule';
import MarketingCartPriceRules from './pages/MarketingCartPriceRules';
import MarketingNewsletterSubscribers from './pages/MarketingNewsletterSubscribers';
import MarketingUrlRewrites from './pages/MarketingUrlRewrites';
import ContentPages from './pages/ContentPages';
import ContentBlocks from './pages/ContentBlocks';
import ContentWidgets from './pages/ContentWidgets';
import ContentDesignConfig from './pages/ContentDesignConfig';
import ContentThemes from './pages/ContentThemes';
import ContentPageEdit from './pages/ContentPageEdit';
import ContentPageView from './pages/ContentPageView';
import ContentThemeView from './pages/ContentThemeView';
import PendingReviews from './pages/PendingReviews';
import MarketingReviewEdit from './pages/MarketingReviewEdit';
import MarketingCatalogPriceRuleAdd from './pages/MarketingCatalogPriceRuleAdd';
import MarketingCartPriceRuleAdd from './pages/MarketingCartPriceRuleAdd';
import BestsellersReport from './pages/BestsellersReport';
import SearchTermsReport from './pages/SearchTermsReport';
import OrderCountReport from './pages/OrderCountReport';
import OrderTotalReport from './pages/OrderTotalReport';
import SalesOrdersReport from './pages/SalesOrdersReport';
import TaxReport from './pages/TaxReport';
import ShippingReport from './pages/ShippingReport';
import RefundsReport from './pages/RefundsReport';
import ProductViewsReport from './pages/ProductViewsReport';
import CouponsReport from './pages/CouponsReport';
import ProductReviewsReport from './pages/ProductReviewsReport';
import CustomerReviewsReport from './pages/CustomerReviewsReport';
import NoData from './pages/NoData';
import { Box, Typography, Button } from '@mui/material';

// 错误边界：捕获页面渲染错误
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <Box sx={{ p: 4, bgcolor: '#fff3f3', border: '1px solid red', borderRadius: 1 }}>
          <Typography color="error" variant="h6">Page Error</Typography>
          <Typography component="pre" sx={{ mt: 1, fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
          </Typography>
          <Typography component="pre" sx={{ mt: 1, fontSize: 11, whiteSpace: 'pre-wrap', color: '#666' }}>
            {this.state.error.stack?.slice(0, 500)}
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

// ------ 有效页面清单 ------
const VALID_PAGES = [
  'dashboard',
  // Reports
  'reports_bestsellers', 'reports_search_terms', 'reports_order_count',
  'reports_order_total', 'reports_sales_orders', 'reports_tax',
  'reports_shipping', 'reports_refunds', 'reports_views', 'reports_coupons',
  'reports_by_products', 'reports_by_customers',
  // Sales
  'sales_orders', 'sales_order_view', 'sales_invoices',
  'sales_shipments', 'sales_credit_memos',
  // Customers
  'customers_all', 'customers_groups',
  // Catalog
  'catalog_products', 'catalog_product_edit', 'catalog_product_add',
  // Marketing
  'marketing_all_reviews', 'marketing_review_edit',
  'marketing_pending_reviews', 'marketing_catalog_price_rule',
  'marketing_catalog_price_rule_add', 'marketing_cart_price_rules',
  'marketing_cart_price_rule_add', 'marketing_newsletter_subscribers',
  'marketing_url_rewrites',
  // Content
  'content_pages', 'content_page_edit', 'content_page_view',
  'content_blocks', 'content_widgets', 'content_configuration',
  'content_themes', 'content_theme_view',
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentParams, setCurrentParams] = useState({});

  const handleMenuClick = useCallback((key) => {
    // Map marketing_search_terms to reports_search_terms (as in WebArenaX)
    if (key === 'marketing_search_terms') {
      setCurrentPage('reports_search_terms');
    } else {
      setCurrentPage(key);
    }
    setCurrentParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigate = useCallback((page, params = {}) => {
    // Restore saved state if available
    const saved = currentParams?.savedState;
    if (saved) {
      const { page: sp, pageSize: sps, ...savedFilters } = saved;
      params = { ...savedFilters, page: sp, pageSize: sps, ...params };
    }
    if (params.updatedData) {
      params = { ...params, tempUpdate: params.updatedData };
      delete params.updatedData;
    }
    if (params.deletedId) {
      const fromState = currentParams?.deletedIds || [];
      const fromSaved = currentParams?.savedState?.deletedIds || [];
      const existing = [...fromState, ...fromSaved];
      params = { ...params, deletedIds: [...existing, params.deletedId] };
      delete params.deletedId;
    }
    setCurrentParams(params);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentParams]);

  const handleContentPageBack = useCallback((data) => {
    const restored = currentParams?.savedState || {};
    if (data?.updatedData) restored.tempUpdate = data.updatedData;
    if (data?.tempUpdate) restored.tempUpdate = data.tempUpdate;
    if (data?.newPage) restored.newPage = true;
    setCurrentParams(restored);
    setCurrentPage('content_pages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentParams]);

  const handleContentThemeBack = useCallback(() => {
    const restored = currentParams?.savedState || {};
    setCurrentParams(restored);
    setCurrentPage('content_themes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentParams]);

  // Determine which page component to render
  const isValid = VALID_PAGES.includes(currentPage);

  // Page placeholder — will be replaced one by one as we migrate
  const renderPage = () => {
    if (!isValid) return <NoData />;

    // For now, all valid pages show a placeholder with their name.
    // Each will be replaced with its actual component as we migrate.
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'catalog_products':
        return <CatalogProducts onNavigate={handleNavigate} initialFilters={currentParams} />;
      case 'catalog_product_edit':
        return <ProductEdit productId={currentParams.id} onNavigate={handleNavigate} />;
      case 'catalog_product_add':
        return <ProductAdd onNavigate={handleNavigate} />;
      case 'sales_orders':
        return <SalesOrders initialFilters={currentParams} onNavigate={handleNavigate} />;
      case 'sales_order_view':
        return <SalesOrderView orderId={currentParams.id} onNavigate={handleNavigate} />;
      case 'sales_invoices':
        return <SalesInvoices />;
      case 'sales_shipments':
        return <SalesShipments />;
      case 'sales_credit_memos':
        return <SalesCreditMemos />;
      case 'customers_all':
        return <AllCustomers />;
      case 'customers_groups':
        return <CustomerGroups />;
      case 'marketing_all_reviews':
        return <AllReviews initialFilters={currentParams} onNavigate={handleNavigate} />;
      case 'marketing_catalog_price_rule':
        return <MarketingCatalogPriceRule onNavigate={handleNavigate} />;
      case 'marketing_cart_price_rules':
        return <MarketingCartPriceRules onNavigate={handleNavigate} />;
      case 'marketing_newsletter_subscribers':
        return <MarketingNewsletterSubscribers />;
      case 'marketing_url_rewrites':
        return <MarketingUrlRewrites />;
      case 'content_pages':
        return <ContentPages onNavigate={handleNavigate} />;
      case 'content_blocks':
        return <ContentBlocks />;
      case 'content_widgets':
        return <ContentWidgets />;
      case 'content_configuration':
        return <ContentDesignConfig />;
      case 'content_themes':
        return <ContentThemes onNavigate={handleNavigate} />;
      case 'content_page_edit':
        return <ContentPageEdit pageId={currentParams.id} onNavigate={handleNavigate} />;
      case 'content_page_view':
        return <ContentPageView pageId={currentParams.id} onNavigate={handleNavigate} />;
      case 'content_theme_view':
        return <ContentThemeView themeId={currentParams.id} onBack={handleContentThemeBack} />;
      case 'marketing_pending_reviews':
        return <PendingReviews onNavigate={handleNavigate} />;
      case 'marketing_review_edit':
        return <MarketingReviewEdit reviewId={currentParams.id} onNavigate={handleNavigate} />;
      case 'marketing_catalog_price_rule_add':
        return <MarketingCatalogPriceRuleAdd onNavigate={handleNavigate} />;
      case 'marketing_cart_price_rule_add':
        return <MarketingCartPriceRuleAdd onNavigate={handleNavigate} />;
      case 'reports_bestsellers':
        return <BestsellersReport />;
      case 'reports_search_terms':
        return <SearchTermsReport />;
      case 'reports_order_count':
        return <OrderCountReport />;
      case 'reports_order_total':
        return <OrderTotalReport />;
      case 'reports_sales_orders':
        return <SalesOrdersReport />;
      case 'reports_tax':
        return <TaxReport />;
      case 'reports_shipping':
        return <ShippingReport />;
      case 'reports_refunds':
        return <RefundsReport />;
      case 'reports_views':
        return <ProductViewsReport />;
      case 'reports_coupons':
        return <CouponsReport />;
      case 'reports_by_products':
        return <ProductReviewsReport onNavigate={handleNavigate} />;
      case 'reports_by_customers':
        return <CustomerReviewsReport />;
      default:
        return <NoData />;
    }
  };

  return (
    <AdminLayout
      selectedKey={currentPage}
      onMenuClick={handleMenuClick}
    >
      <ErrorBoundary key={currentPage}>
        {renderPage()}
      </ErrorBoundary>
    </AdminLayout>
  );
}
