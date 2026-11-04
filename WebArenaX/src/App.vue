<template>
  <AdminLayout @menu-click="handleMenuClick">
    <Dashboard v-if="currentPage === 'dashboard'" />
    <BestsellersReport v-if="currentPage === 'reports_bestsellers'" />
    <AllReviews
      v-if="currentPage === 'marketing_all_reviews'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <MarketingReviewEdit
      v-if="currentPage === 'marketing_review_edit'"
      :review-id="currentParams.id"
      @back="handleReviewEditBack"
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
      @back="currentPage = 'marketing_catalog_price_rule'"
      @navigate="handleNavigate"
    />
    <MarketingCartPriceRules
      v-if="currentPage === 'marketing_cart_price_rules'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <MarketingCartPriceRuleAdd
      v-if="currentPage === 'marketing_cart_price_rule_add'"
      @back="currentPage = 'marketing_cart_price_rules'"
      @navigate="handleNavigate"
    />
    <MarketingNewsletterSubscribers
      v-if="currentPage === 'marketing_newsletter_subscribers'"
    />
    <MarketingUrlRewrites v-if="currentPage === 'marketing_url_rewrites'" />
    <SearchTermsReport v-if="currentPage === 'reports_search_terms'" />
    <OrderCountReport v-if="currentPage === 'reports_order_count'" />
    <OrderTotalReport v-if="currentPage === 'reports_order_total'" />
    <SalesOrdersReport v-if="currentPage === 'reports_sales_orders'" />
    <TaxReport v-if="currentPage === 'reports_tax'" />
    <ShippingReport v-if="currentPage === 'reports_shipping'" />
    <RefundsReport v-if="currentPage === 'reports_refunds'" />
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
    <AllCustomers v-if="currentPage === 'customers_all'" />
    <CustomerGroups v-if="currentPage === 'customers_groups'" />
    <CatalogProducts
      v-if="currentPage === 'catalog_products'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <ProductEdit
      v-if="currentPage === 'catalog_product_edit'"
      :product-id="currentParams.id"
      @navigate="handleProductEditNavigate"
    />
    <ProductAdd
      v-if="currentPage === 'catalog_product_add'"
      @navigate="handleNavigate"
    />
    <ProductViewsReport
      v-if="currentPage === 'reports_views'"
      :product-id="currentParams.product_id"
      :product-name="currentParams.product_name"
    />
    <CouponsReport v-if="currentPage === 'reports_coupons'" />
    <ProductReviewsReport
      v-if="currentPage === 'reports_by_products'"
      @navigate="handleNavigate"
    />
    <CustomerReviewsReport
      v-if="currentPage === 'reports_by_customers'"
      @navigate="handleNavigate"
    />
    <ContentPages
      v-if="currentPage === 'content_pages'"
      :initial-filters="currentParams"
      @navigate="handleNavigate"
    />
    <ContentPageEdit
      v-if="currentPage === 'content_page_edit'"
      :page-id="currentParams.id"
      @back="handleContentPageBack"
    />
    <ContentPageView
      v-if="currentPage === 'content_page_view'"
      :page-id="currentParams.id"
      @back="handleContentPageBack"
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
import { ref } from "vue";
import AdminLayout from "./components/AdminLayout.vue";
import Dashboard from "./components/Dashboard.vue";
import BestsellersReport from "./components/BestsellersReport.vue";
import AllReviews from "./components/AllReviews.vue";
import SearchTermsReport from "./components/SearchTermsReport.vue";
import OrderCountReport from "./components/OrderCountReport.vue";
import OrderTotalReport from "./components/OrderTotalReport.vue";
import SalesInvoices from "./components/SalesInvoices.vue";
import SalesShipments from "./components/SalesShipments.vue";
import SalesCreditMemos from "./components/SalesCreditMemos.vue";
import AllCustomers from "./components/AllCustomers.vue";
import CustomerGroups from "./components/CustomerGroups.vue";
import CatalogProducts from "./components/CatalogProducts.vue";
import SalesOrders from "./components/SalesOrders.vue";
import SalesOrdersReport from "./components/SalesOrdersReport.vue";
import TaxReport from "./components/TaxReport.vue";
import ShippingReport from "./components/ShippingReport.vue";
import RefundsReport from "./components/RefundsReport.vue";
import PendingReviews from "./components/PendingReviews.vue";
import ProductReviewsReport from "./components/ProductReviewsReport.vue";
import CustomerReviewsReport from "./components/CustomerReviewsReport.vue";
import MarketingCatalogPriceRule from "./components/MarketingCatalogPriceRule.vue";
import MarketingCartPriceRules from "./components/MarketingCartPriceRules.vue";
import MarketingNewsletterSubscribers from "./components/MarketingNewsletterSubscribers.vue";
import MarketingUrlRewrites from "./components/MarketingUrlRewrites.vue";
import ContentPages from "./components/ContentPages.vue";
import ContentBlocks from "./components/ContentBlocks.vue";
import ContentWidgets from "./components/ContentWidgets.vue";
import ContentDesignConfig from "./components/ContentDesignConfig.vue";
import ContentThemes from "./components/ContentThemes.vue";
import ProductEdit from "./components/ProductEdit.vue";
import ProductViewsReport from "./components/ProductViewsReport.vue";
import CouponsReport from "./components/CouponsReport.vue";
import SalesOrderView from "./components/SalesOrderView.vue";
import ContentPageEdit from "./components/ContentPageEdit.vue";
import ContentPageView from "./components/ContentPageView.vue";
import ContentThemeView from "./components/ContentThemeView.vue";
import ProductAdd from "./components/ProductAdd.vue";
import MarketingCartPriceRuleAdd from "./components/MarketingCartPriceRuleAdd.vue";
import MarketingCatalogPriceRuleAdd from "./components/MarketingCatalogPriceRuleAdd.vue";
import MarketingReviewEdit from "./components/MarketingReviewEdit.vue";
import NoData from "./components/NoData.vue";

const validPages = [
  "dashboard",
  "reports_bestsellers",
  "marketing_all_reviews",
  "marketing_review_edit",
  "marketing_pending_reviews",
  "marketing_catalog_price_rule",
  "marketing_catalog_price_rule_add",
  "marketing_cart_price_rules",
  "marketing_cart_price_rule_add",
  "marketing_newsletter_subscribers",
  "marketing_url_rewrites",
  "reports_search_terms",
  "reports_order_count",
  "reports_order_total",
  "reports_sales_orders",
  "reports_tax",
  "reports_shipping",
  "reports_refunds",
  "sales_orders",
  "sales_order_view",
  "sales_invoices",
  "sales_shipments",
  "sales_credit_memos",
  "customers_all",
  "customers_groups",
  "catalog_products",
  "catalog_product_edit",
  "catalog_product_add",
  "reports_views",
  "reports_coupons",
  "reports_by_products",
  "reports_by_customers",
  "content_pages",
  "content_page_edit",
  "content_page_view",
  "content_blocks",
  "content_widgets",
  "content_configuration",
  "content_themes",
  "content_theme_view",
];

const currentPage = ref("dashboard");
const currentParams = ref({});
const productUpdates = ref({});

const handleMenuClick = (key) => {
  console.log("Menu clicked:", key);
  // 如果点击 marketing_search_terms，导航到 reports_search_terms 页面
  if (key === "marketing_search_terms") {
    currentPage.value = "reports_search_terms";
  } else {
    currentPage.value = key;
  }
  currentParams.value = {}; // Clear params on menu click
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleNavigate = (page, params = {}) => {
  console.log("Navigate to:", page, params);
  currentParams.value = params;
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleReviewEditBack = (data) => {
  const sourcePage = currentParams.value.sourcePage || "marketing_all_reviews";

  if (currentParams.value.savedState) {
    currentParams.value = currentParams.value.savedState;
  } else {
    currentParams.value = {};
  }
  if (data && data.updatedData) {
    currentParams.value.tempUpdate = data.updatedData;
  }
  if (data && data.deletedId) {
    const existingIds = currentParams.value.deletedIds || [];
    if (!existingIds.includes(data.deletedId)) {
      currentParams.value.deletedIds = [...existingIds, data.deletedId];
    }
  }
  currentPage.value = sourcePage;
};

const handleSalesOrderBack = () => {
  if (currentParams.value.savedState) {
    currentParams.value = currentParams.value.savedState;
  } else {
    currentParams.value = {};
  }
  currentPage.value = "sales_orders";
};

const handleProductEditNavigate = (page, params = {}) => {
  if (page === "catalog_products") {
    if (currentParams.value.savedState) {
      currentParams.value = currentParams.value.savedState;
    } else {
      currentParams.value = {};
    }
    if (params && params.updatedData) {
      productUpdates.value[params.updatedData.entity_id] = params.updatedData;
    }
    currentParams.value.tempUpdates = Object.values(productUpdates.value);
    currentPage.value = "catalog_products";
  } else {
    handleNavigate(page, params);
  }
};

const handleContentPageBack = (data) => {
  if (currentParams.value.savedState) {
    currentParams.value = currentParams.value.savedState;
  } else {
    currentParams.value = {}; // Reset params if no saved state
    // But we might need to preserve tempUpdate etc. so let's be careful.
    // Actually, currentParams IS the initialFilters for the list page.
  }

  // Important: Merge ANY data returned from edit/add page
  if (data) {
    if (data.updatedData) {
      currentParams.value.tempUpdate = data.updatedData;
    }
    if (data.tempUpdate) {
      currentParams.value.tempUpdate = data.tempUpdate;
    }
    if (data.newPage) {
      currentParams.value.newPage = true;
    }
  }
  currentPage.value = "content_pages";
};

const handleContentThemeBack = () => {
  if (currentParams.value.savedState) {
    currentParams.value = currentParams.value.savedState;
  } else {
    currentParams.value = {};
  }
  currentPage.value = "content_themes";
};
</script>

<style>
body {
  margin: 0;
}
</style>
