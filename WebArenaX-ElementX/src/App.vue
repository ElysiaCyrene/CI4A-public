<template>
  <AdminLayout :selectedKey="currentPage" @menu-click="handleMenuClick">
    <!-- Dashboard -->
    <Dashboard v-if="currentPage === 'dashboard'" />

    <!-- ===== PLACEHOLDER PAGES ===== -->
    <!-- Each will be replaced by its real component as we migrate -->

    <!-- Reports -->
    <BestsellersReport v-if="currentPage === 'reports_bestsellers'" />
    <SearchTermsReport v-if="currentPage === 'reports_search_terms'" />
    <OrderCountReport v-if="currentPage === 'reports_order_count'" />
    <OrderTotalReport v-if="currentPage === 'reports_order_total'" />
    <SalesOrdersReport v-if="currentPage === 'reports_sales_orders'" />
    <TaxReport v-if="currentPage === 'reports_tax'" />
    <ShippingReport v-if="currentPage === 'reports_shipping'" />
    <RefundsReport v-if="currentPage === 'reports_refunds'" />
    <ProductViewsReport v-if="currentPage === 'reports_views'" />
    <CouponsReport v-if="currentPage === 'reports_coupons'" />
    <ProductReviewsReport v-if="currentPage === 'reports_by_products'" @navigate="handleNavigate" />
    <CustomerReviewsReport v-if="currentPage === 'reports_by_customers'" />

    <!-- Sales -->
    <SalesOrders
      v-if="currentPage === 'sales_orders'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <SalesOrderView
      v-if="currentPage === 'sales_order_view'"
      :order-id="currentParams.id"
      @back="handleSalesOrderBack"
    />
    <SalesInvoices v-if="currentPage === 'sales_invoices'" />
    <SalesShipments v-if="currentPage === 'sales_shipments'" />
    <SalesCreditMemos v-if="currentPage === 'sales_credit_memos'" />

    <!-- Customers -->
    <AllCustomers v-if="currentPage === 'customers_all'" />
    <CustomerGroups v-if="currentPage === 'customers_groups'" />

    <!-- Catalog -->
    <CatalogProducts
      v-if="currentPage === 'catalog_products'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <ProductEdit
      v-if="currentPage === 'catalog_product_edit'"
      :product-id="currentParams.id"
      @navigate="handleNavigate"
    />
    <ProductAdd
      v-if="currentPage === 'catalog_product_add'"
      @navigate="handleNavigate"
    />

    <!-- Marketing -->
    <AllReviews
      v-if="currentPage === 'marketing_all_reviews'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <MarketingReviewEdit
      v-if="currentPage === 'marketing_review_edit'"
      :review-id="currentParams.id"
      @navigate="handleNavigate"
    />
    <PendingReviews
      v-if="currentPage === 'marketing_pending_reviews'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <MarketingCatalogPriceRule
      v-if="currentPage === 'marketing_catalog_price_rule'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <MarketingCatalogPriceRuleAdd
      v-if="currentPage === 'marketing_catalog_price_rule_add'"
      @navigate="handleNavigate"
    />
    <MarketingCartPriceRules
      v-if="currentPage === 'marketing_cart_price_rules'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <MarketingCartPriceRuleAdd
      v-if="currentPage === 'marketing_cart_price_rule_add'"
      @navigate="handleNavigate"
    />
    <MarketingNewsletterSubscribers v-if="currentPage === 'marketing_newsletter_subscribers'" />
    <MarketingUrlRewrites v-if="currentPage === 'marketing_url_rewrites'" />

    <!-- Content -->
    <ContentPages
      v-if="currentPage === 'content_pages'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <ContentPageEdit
      v-if="currentPage === 'content_page_edit'"
      :page-id="currentParams.id"
      @navigate="handleNavigate"
    />
    <ContentPageView
      v-if="currentPage === 'content_page_view'"
      :page-id="currentParams.id"
      @navigate="handleNavigate"
    />
    <ContentBlocks v-if="currentPage === 'content_blocks'" />
    <ContentWidgets v-if="currentPage === 'content_widgets'" />
    <ContentDesignConfig v-if="currentPage === 'content_configuration'" />
    <ContentThemes
      v-if="currentPage === 'content_themes'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <ContentThemeView
      v-if="currentPage === 'content_theme_view'"
      :theme-id="currentParams.id"
      @back="handleContentThemeBack"
    />

    <NoData v-if="!validPages.includes(currentPage)" />
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from './components/AdminLayout.vue'
import Dashboard from './components/Dashboard.vue'
import CatalogProducts from './components/CatalogProducts.vue'
import ProductEdit from './components/ProductEdit.vue'
import ProductAdd from './components/ProductAdd.vue'
import SalesOrders from './components/SalesOrders.vue'
import SalesInvoices from './components/SalesInvoices.vue'
import SalesShipments from './components/SalesShipments.vue'
import SalesCreditMemos from './components/SalesCreditMemos.vue'
import AllCustomers from './components/AllCustomers.vue'
import CustomerGroups from './components/CustomerGroups.vue'
import AllReviews from './components/AllReviews.vue'
import PendingReviews from './components/PendingReviews.vue'
import MarketingCatalogPriceRule from './components/MarketingCatalogPriceRule.vue'
import MarketingCartPriceRules from './components/MarketingCartPriceRules.vue'
import MarketingNewsletterSubscribers from './components/MarketingNewsletterSubscribers.vue'
import MarketingUrlRewrites from './components/MarketingUrlRewrites.vue'
import ContentPages from './components/ContentPages.vue'
import ContentBlocks from './components/ContentBlocks.vue'
import ContentWidgets from './components/ContentWidgets.vue'
import ContentDesignConfig from './components/ContentDesignConfig.vue'
import ContentThemes from './components/ContentThemes.vue'
import BestsellersReport from './components/BestsellersReport.vue'
import SearchTermsReport from './components/SearchTermsReport.vue'
import OrderCountReport from './components/OrderCountReport.vue'
import OrderTotalReport from './components/OrderTotalReport.vue'
import SalesOrdersReport from './components/SalesOrdersReport.vue'
import TaxReport from './components/TaxReport.vue'
import ShippingReport from './components/ShippingReport.vue'
import RefundsReport from './components/RefundsReport.vue'
import ProductViewsReport from './components/ProductViewsReport.vue'
import CouponsReport from './components/CouponsReport.vue'
import ProductReviewsReport from './components/ProductReviewsReport.vue'
import CustomerReviewsReport from './components/CustomerReviewsReport.vue'
import SalesOrderView from './components/SalesOrderView.vue'
import MarketingReviewEdit from './components/MarketingReviewEdit.vue'
import MarketingCatalogPriceRuleAdd from './components/MarketingCatalogPriceRuleAdd.vue'
import MarketingCartPriceRuleAdd from './components/MarketingCartPriceRuleAdd.vue'
import ContentPageEdit from './components/ContentPageEdit.vue'
import ContentPageView from './components/ContentPageView.vue'
import ContentThemeView from './components/ContentThemeView.vue'
import NoData from './components/NoData.vue'
import Placeholder from './components/Placeholder.vue'

const validPages = [
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
]

const currentPage = ref('dashboard')
const currentParams = ref({})
// Accumulate multiple product edits (entity_id → updated data)
const productUpdates = ref({})

const handleMenuClick = (key) => {
  if (key === 'marketing_search_terms') {
    currentPage.value = 'reports_search_terms'
  } else {
    currentPage.value = key
  }
  currentParams.value = {}
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSalesOrderBack = () => {
  const saved = currentParams.value.savedState || {}
  currentParams.value = saved
  currentPage.value = 'sales_orders'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleContentThemeBack = () => {
  const saved = currentParams.value.savedState || {}
  currentParams.value = saved
  currentPage.value = 'content_themes'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleNavigate = (page, params = {}) => {
  // Content page edit/view → back to content list
  if (page === 'content_pages' && (params.tempUpdate || params.newPage)) {
    const saved = currentParams.value.savedState || {}
    currentParams.value = { ...saved, ...params }
    currentPage.value = page
  }
  // Product edit/add → back to product list: restore saved state + merge updates
  else if (page === 'catalog_products' && (params.updatedData || params.tempUpdate)) {
    // Restore saved filters/pagination from before edit
    const saved = currentParams.value.savedState || {}
    currentParams.value = { ...saved }
    // Accumulate edit (supports multiple edits) and new products
    const update = params.updatedData || params.tempUpdate
    if (update && update.entity_id) {
      productUpdates.value[update.entity_id] = update
    }
    // Attach all accumulated updates as tempUpdates
    currentParams.value.tempUpdates = Object.values(productUpdates.value)
    currentPage.value = page
  } else {
    if (Object.keys(params).length === 0 && currentParams.value.savedState) {
      currentParams.value = { ...currentParams.value.savedState }
    } else {
      currentParams.value = params
    }
    currentPage.value = page
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
