<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      width="260"
      style="background: #343434"
    >
      <div class="logo">
        <div
          style="
            color: #eb5202;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 10px;
          "
        >
          <appstore-outlined />
        </div>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="vertical"
        style="background: #343434"
        @click="handleMenuClick"
      >
        <a-menu-item key="dashboard">
          <template #icon><dashboard-outlined /></template>
          <span>Dashboard</span>
        </a-menu-item>

        <a-sub-menu key="sales">
          <template #icon><dollar-outlined /></template>
          <template #title>Sales</template>
          <a-menu-item key="sales_orders">Orders</a-menu-item>
          <a-menu-item key="sales_invoices">Invoices</a-menu-item>
          <a-menu-item key="sales_shipments">Shipments</a-menu-item>
          <a-menu-item key="sales_credit_memos">Credit Memos</a-menu-item>
          <a-menu-item key="sales_billing_agreements"
            >Billing Agreements</a-menu-item
          >
          <a-menu-item key="sales_transactions">Transactions</a-menu-item>
          <a-menu-item key="sales_braintree"
            >Braintree Virtual Terminal</a-menu-item
          >
        </a-sub-menu>

        <a-sub-menu key="catalog">
          <template #icon><inbox-outlined /></template>
          <template #title>Catalog</template>
          <a-menu-item key="catalog_products">Products</a-menu-item>
          <a-menu-item key="catalog_categories">Categories</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="customers">
          <template #icon><user-outlined /></template>
          <template #title>Customers</template>
          <a-menu-item key="customers_all">All Customers</a-menu-item>
          <a-menu-item key="customers_online">Now Online</a-menu-item>
          <a-menu-item key="customers_login_log"
            >Login as Customer Log</a-menu-item
          >
          <a-menu-item key="customers_groups">Customer Groups</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="marketing">
          <template #icon><sound-outlined /></template>
          <template #title>Marketing</template>
          <a-sub-menu key="marketing_promotions" title="Promotions">
            <a-menu-item key="marketing_catalog_price_rule"
              >Catalog Price Rule</a-menu-item
            >
            <a-menu-item key="marketing_cart_price_rules"
              >Cart Price Rules</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="marketing_communications" title="Communications">
            <a-menu-item key="marketing_email_templates"
              >Email Templates</a-menu-item
            >
            <a-menu-item key="marketing_newsletter_templates"
              >Newsletter Templates</a-menu-item
            >
            <a-menu-item key="marketing_newsletter_queue"
              >Newsletter Queue</a-menu-item
            >
            <a-menu-item key="marketing_newsletter_subscribers"
              >Newsletter Subscribers</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="marketing_seo" title="SEO & Search">
            <a-menu-item key="marketing_url_rewrites">URL Rewrites</a-menu-item>
            <a-menu-item key="marketing_search_terms">Search Terms</a-menu-item>
            <a-menu-item key="marketing_search_synonyms"
              >Search Synonyms</a-menu-item
            >
            <a-menu-item key="marketing_site_map">Site Map</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="marketing_user_content" title="User Content">
            <a-menu-item key="marketing_all_reviews">All Reviews</a-menu-item>
            <a-menu-item key="marketing_pending_reviews"
              >Pending Reviews</a-menu-item
            >
          </a-sub-menu>
        </a-sub-menu>

        <a-sub-menu key="content">
          <template #icon><file-text-outlined /></template>
          <template #title>Content</template>
          <a-sub-menu key="content_elements" title="Elements">
            <a-menu-item key="content_pages">Pages</a-menu-item>
            <a-menu-item key="content_blocks">Blocks</a-menu-item>
            <a-menu-item key="content_widgets">Widgets</a-menu-item>
            <a-menu-item key="content_templates">Templates</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="content_media" title="Media">
            <a-menu-item key="content_media_gallery">Media Gallery</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="content_design" title="Design">
            <a-menu-item key="content_configuration">Configuration</a-menu-item>
            <a-menu-item key="content_themes">Themes</a-menu-item>
            <a-menu-item key="content_schedule">Schedule</a-menu-item>
          </a-sub-menu>
        </a-sub-menu>

        <a-sub-menu key="reports">
          <template #icon><bar-chart-outlined /></template>
          <template #title>Reports</template>
          <a-sub-menu key="reports_marketing" title="Marketing">
            <a-menu-item key="reports_products_in_cart"
              >Products in Cart</a-menu-item
            >
            <a-menu-item key="reports_search_terms">Search Terms</a-menu-item>
            <a-menu-item key="reports_abandoned_carts"
              >Abandoned Carts</a-menu-item
            >
            <a-menu-item key="reports_newsletter_problem_reports"
              >Newsletter Problem Reports</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="reports_reviews" title="Reviews">
            <a-menu-item key="reports_by_customers">By Customers</a-menu-item>
            <a-menu-item key="reports_by_products">By Products</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="reports_sales" title="Sales">
            <a-menu-item key="reports_sales_orders">Orders</a-menu-item>
            <a-menu-item key="reports_tax">Tax</a-menu-item>
            <a-menu-item key="reports_invoiced">Invoiced</a-menu-item>
            <a-menu-item key="reports_shipping">Shipping</a-menu-item>
            <a-menu-item key="reports_refunds">Refunds</a-menu-item>
            <a-menu-item key="reports_coupons">Coupons</a-menu-item>
            <a-menu-item key="reports_paypal_settlement"
              >PayPal Settlement</a-menu-item
            >
            <a-menu-item key="reports_braintree_settlement"
              >Braintree Settlement</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="reports_customers" title="Customers">
            <a-menu-item key="reports_order_total">Order Total</a-menu-item>
            <a-menu-item key="reports_order_count">Order Count</a-menu-item>
            <a-menu-item key="reports_new">New</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="reports_products" title="Products">
            <a-menu-item key="reports_views">Views</a-menu-item>
            <a-menu-item key="reports_bestsellers">Bestsellers</a-menu-item>
            <a-menu-item key="reports_low_stock">Low Stock</a-menu-item>
            <a-menu-item key="reports_ordered">Ordered</a-menu-item>
            <a-menu-item key="reports_downloads">Downloads</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="reports_statistics" title="Statistics">
            <a-menu-item key="reports_refresh_statistics"
              >Refresh Statistics</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="reports_bi" title="Business Intelligence">
            <a-menu-item key="reports_advanced_reporting"
              >Advanced Reporting</a-menu-item
            >
            <a-menu-item key="reports_bi_essentials">BI Essentials</a-menu-item>
          </a-sub-menu>
        </a-sub-menu>

        <a-sub-menu key="stores">
          <template #icon><shop-outlined /></template>
          <template #title>Stores</template>
          <a-sub-menu key="stores_settings" title="Settings">
            <a-menu-item key="stores_all_stores">All Stores</a-menu-item>
            <a-menu-item key="stores_configuration">Configuration</a-menu-item>
            <a-menu-item key="stores_terms_and_conditions"
              >Terms and Conditions</a-menu-item
            >
            <a-menu-item key="stores_order_status">Order Status</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="stores_inventory" title="Inventory">
            <a-menu-item key="stores_sources">Sources</a-menu-item>
            <a-menu-item key="stores_stocks">Stocks</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="stores_taxes" title="Taxes">
            <a-menu-item key="stores_tax_rules">Tax Rules</a-menu-item>
            <a-menu-item key="stores_tax_zones_and_rates"
              >Tax Zones and Rates</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="stores_currency" title="Currency">
            <a-menu-item key="stores_currency_rates"
              >Currency Rates</a-menu-item
            >
            <a-menu-item key="stores_currency_symbols"
              >Currency Symbols</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="stores_attributes" title="Attributes">
            <a-menu-item key="stores_product">Product</a-menu-item>
            <a-menu-item key="stores_attribute_set">Attribute Set</a-menu-item>
            <a-menu-item key="stores_rating">Rating</a-menu-item>
          </a-sub-menu>
        </a-sub-menu>

        <a-sub-menu key="system">
          <template #icon><setting-outlined /></template>
          <template #title>System</template>
          <a-sub-menu key="system_data_transfer" title="Data Transfer">
            <a-menu-item key="system_import">Import</a-menu-item>
            <a-menu-item key="system_export">Export</a-menu-item>
            <a-menu-item key="system_import_export_tax_rates"
              >Import/Export Tax Rates</a-menu-item
            >
            <a-menu-item key="system_import_history"
              >Import History</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="system_extensions" title="Extensions">
            <a-menu-item key="system_integrations">Integrations</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="system_tools" title="Tools">
            <a-menu-item key="system_cache_management"
              >Cache Management</a-menu-item
            >
            <a-menu-item key="system_index_management"
              >Index Management</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu key="system_permissions" title="Permissions">
            <a-menu-item key="system_all_users">All Users</a-menu-item>
            <a-menu-item key="system_locked_users">Locked Users</a-menu-item>
            <a-menu-item key="system_user_roles">User Roles</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="system_action_logs" title="Action Logs">
            <a-menu-item key="system_bulk_actions">Bulk Actions</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="system_other_settings" title="Other Settings">
            <a-menu-item key="system_notifications">Notifications</a-menu-item>
            <a-menu-item key="system_custom_variables"
              >Custom Variables</a-menu-item
            >
            <a-menu-item key="system_manage_encryption_key"
              >Manage Encryption Key</a-menu-item
            >
          </a-sub-menu>
        </a-sub-menu>

        <a-menu-item key="find_partners">
          <template #icon><api-outlined /></template>
          <span>Find Partners & Extensions</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header
        style="
          background: #fff;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e3e3e3;
          height: 64px;
        "
      >
        <div class="header-left"></div>
        <div
          class="header-right"
          style="display: flex; align-items: center; gap: 20px"
        >
          <a-dropdown v-model:open="searchVisible" :trigger="['click']">
            <search-outlined
              style="font-size: 18px; color: #666; cursor: pointer"
              @click="searchVisible = true"
            />
            <template #overlay>
              <div class="search-dropdown">
                <a-input
                  ref="searchInput"
                  v-model:value="searchQuery"
                  placeholder="search menu..."
                  size="large"
                  @input="handleSearch"
                >
                  <template #prefix>
                    <search-outlined style="color: #999" />
                  </template>
                </a-input>
                <div class="search-results">
                  <div
                    v-if="filteredMenuItems.length === 0 && searchQuery"
                    class="no-results"
                  >
                    没有找到匹配的菜单项
                  </div>
                  <div
                    v-for="item in filteredMenuItems"
                    :key="item.key"
                    class="search-result-item"
                    @click="handleMenuSelect(item)"
                  >
                    <div class="result-title">{{ item.title }}</div>
                    <div class="result-path">{{ item.path }}</div>
                  </div>
                </div>
              </div>
            </template>
          </a-dropdown>
          <bell-outlined style="font-size: 18px; color: #666" />
          <div
            class="user-profile"
            style="
              display: flex;
              align-items: center;
              gap: 8px;
              cursor: pointer;
            "
          >
            <div
              style="
                background: #e3e3e3;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <user-outlined style="color: #666" />
            </div>
            <span style="font-weight: 500">admin</span>
            <down-outlined style="font-size: 12px; color: #666" />
          </div>
        </div>
      </a-layout-header>
      <a-layout-content
        style="margin: 0; padding: 24px; background: #f4f4f4; overflow-y: auto"
      >
        <slot></slot>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import {
  DashboardOutlined,
  DollarOutlined,
  InboxOutlined,
  UserOutlined,
  SoundOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ShopOutlined,
  SettingOutlined,
  ApiOutlined,
  AppstoreOutlined,
  SearchOutlined,
  BellOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";

const collapsed = ref(false);
const selectedKeys = ref(["dashboard"]);
const searchVisible = ref(false);
const searchQuery = ref("");
const searchInput = ref(null);
const filteredMenuItems = ref([]);

// 所有菜单项的扁平化列表
const allMenuItems = [
  { key: "dashboard", title: "Dashboard", path: "Dashboard" },
  // Sales
  { key: "sales_orders", title: "Orders", path: "Sales > Orders" },
  { key: "sales_invoices", title: "Invoices", path: "Sales > Invoices" },
  { key: "sales_shipments", title: "Shipments", path: "Sales > Shipments" },
  {
    key: "sales_credit_memos",
    title: "Credit Memos",
    path: "Sales > Credit Memos",
  },
  {
    key: "sales_billing_agreements",
    title: "Billing Agreements",
    path: "Sales > Billing Agreements",
  },
  {
    key: "sales_transactions",
    title: "Transactions",
    path: "Sales > Transactions",
  },
  {
    key: "sales_braintree",
    title: "Braintree Virtual Terminal",
    path: "Sales > Braintree Virtual Terminal",
  },
  // Catalog
  { key: "catalog_products", title: "Products", path: "Catalog > Products" },
  {
    key: "catalog_categories",
    title: "Categories",
    path: "Catalog > Categories",
  },
  // Customers
  {
    key: "customers_all",
    title: "All Customers",
    path: "Customers > All Customers",
  },
  {
    key: "customers_online",
    title: "Now Online",
    path: "Customers > Now Online",
  },
  {
    key: "customers_login_log",
    title: "Login as Customer Log",
    path: "Customers > Login as Customer Log",
  },
  {
    key: "customers_groups",
    title: "Customer Groups",
    path: "Customers > Customer Groups",
  },
  // Marketing
  {
    key: "marketing_catalog_price_rule",
    title: "Catalog Price Rule",
    path: "Marketing > Promotions > Catalog Price Rule",
  },
  {
    key: "marketing_cart_price_rules",
    title: "Cart Price Rules",
    path: "Marketing > Promotions > Cart Price Rules",
  },
  {
    key: "marketing_email_templates",
    title: "Email Templates",
    path: "Marketing > Communications > Email Templates",
  },
  {
    key: "marketing_newsletter_templates",
    title: "Newsletter Templates",
    path: "Marketing > Communications > Newsletter Templates",
  },
  {
    key: "marketing_newsletter_queue",
    title: "Newsletter Queue",
    path: "Marketing > Communications > Newsletter Queue",
  },
  {
    key: "marketing_newsletter_subscribers",
    title: "Newsletter Subscribers",
    path: "Marketing > Communications > Newsletter Subscribers",
  },
  {
    key: "marketing_url_rewrites",
    title: "URL Rewrites",
    path: "Marketing > SEO & Search > URL Rewrites",
  },
  {
    key: "marketing_search_terms",
    title: "Search Terms",
    path: "Marketing > SEO & Search > Search Terms",
  },
  {
    key: "marketing_search_synonyms",
    title: "Search Synonyms",
    path: "Marketing > SEO & Search > Search Synonyms",
  },
  {
    key: "marketing_site_map",
    title: "Site Map",
    path: "Marketing > SEO & Search > Site Map",
  },
  {
    key: "marketing_all_reviews",
    title: "All Reviews",
    path: "Marketing > User Content > All Reviews",
  },
  {
    key: "marketing_pending_reviews",
    title: "Pending Reviews",
    path: "Marketing > User Content > Pending Reviews",
  },
  // Content
  { key: "content_pages", title: "Pages", path: "Content > Elements > Pages" },
  {
    key: "content_blocks",
    title: "Blocks",
    path: "Content > Elements > Blocks",
  },
  {
    key: "content_widgets",
    title: "Widgets",
    path: "Content > Elements > Widgets",
  },
  {
    key: "content_templates",
    title: "Templates",
    path: "Content > Elements > Templates",
  },
  {
    key: "content_media_gallery",
    title: "Media Gallery",
    path: "Content > Media > Media Gallery",
  },
  {
    key: "content_configuration",
    title: "Configuration",
    path: "Content > Design > Configuration",
  },
  { key: "content_themes", title: "Themes", path: "Content > Design > Themes" },
  {
    key: "content_schedule",
    title: "Schedule",
    path: "Content > Design > Schedule",
  },
  // Reports
  {
    key: "reports_products_in_cart",
    title: "Products in Cart",
    path: "Reports > Marketing > Products in Cart",
  },
  {
    key: "reports_search_terms",
    title: "Search Terms",
    path: "Reports > Marketing > Search Terms",
  },
  {
    key: "reports_abandoned_carts",
    title: "Abandoned Carts",
    path: "Reports > Marketing > Abandoned Carts",
  },
  {
    key: "reports_newsletter_problem_reports",
    title: "Newsletter Problem Reports",
    path: "Reports > Marketing > Newsletter Problem Reports",
  },
  {
    key: "reports_by_customers",
    title: "By Customers",
    path: "Reports > Reviews > By Customers",
  },
  {
    key: "reports_by_products",
    title: "By Products",
    path: "Reports > Reviews > By Products",
  },
  {
    key: "reports_sales_orders",
    title: "Orders",
    path: "Reports > Sales > Orders",
  },
  { key: "reports_tax", title: "Tax", path: "Reports > Sales > Tax" },
  {
    key: "reports_invoiced",
    title: "Invoiced",
    path: "Reports > Sales > Invoiced",
  },
  {
    key: "reports_shipping",
    title: "Shipping",
    path: "Reports > Sales > Shipping",
  },
  {
    key: "reports_refunds",
    title: "Refunds",
    path: "Reports > Sales > Refunds",
  },
  {
    key: "reports_coupons",
    title: "Coupons",
    path: "Reports > Sales > Coupons",
  },
  {
    key: "reports_paypal_settlement",
    title: "PayPal Settlement",
    path: "Reports > Sales > PayPal Settlement",
  },
  {
    key: "reports_braintree_settlement",
    title: "Braintree Settlement",
    path: "Reports > Sales > Braintree Settlement",
  },
  {
    key: "reports_order_total",
    title: "Order Total",
    path: "Reports > Customers > Order Total",
  },
  {
    key: "reports_order_count",
    title: "Order Count",
    path: "Reports > Customers > Order Count",
  },
  { key: "reports_new", title: "New", path: "Reports > Customers > New" },
  { key: "reports_views", title: "Views", path: "Reports > Products > Views" },
  {
    key: "reports_bestsellers",
    title: "Bestsellers",
    path: "Reports > Products > Bestsellers",
  },
  {
    key: "reports_low_stock",
    title: "Low Stock",
    path: "Reports > Products > Low Stock",
  },
  {
    key: "reports_ordered",
    title: "Ordered",
    path: "Reports > Products > Ordered",
  },
  {
    key: "reports_downloads",
    title: "Downloads",
    path: "Reports > Products > Downloads",
  },
  {
    key: "reports_refresh_statistics",
    title: "Refresh Statistics",
    path: "Reports > Statistics > Refresh Statistics",
  },
  {
    key: "reports_advanced_reporting",
    title: "Advanced Reporting",
    path: "Reports > Business Intelligence > Advanced Reporting",
  },
  {
    key: "reports_bi_essentials",
    title: "BI Essentials",
    path: "Reports > Business Intelligence > BI Essentials",
  },
  // Stores
  {
    key: "stores_all_stores",
    title: "All Stores",
    path: "Stores > Settings > All Stores",
  },
  {
    key: "stores_configuration",
    title: "Configuration",
    path: "Stores > Settings > Configuration",
  },
  {
    key: "stores_terms_and_conditions",
    title: "Terms and Conditions",
    path: "Stores > Settings > Terms and Conditions",
  },
  {
    key: "stores_order_status",
    title: "Order Status",
    path: "Stores > Settings > Order Status",
  },
  {
    key: "stores_sources",
    title: "Sources",
    path: "Stores > Inventory > Sources",
  },
  {
    key: "stores_stocks",
    title: "Stocks",
    path: "Stores > Inventory > Stocks",
  },
  {
    key: "stores_tax_rules",
    title: "Tax Rules",
    path: "Stores > Taxes > Tax Rules",
  },
  {
    key: "stores_tax_zones_and_rates",
    title: "Tax Zones and Rates",
    path: "Stores > Taxes > Tax Zones and Rates",
  },
  {
    key: "stores_currency_rates",
    title: "Currency Rates",
    path: "Stores > Currency > Currency Rates",
  },
  {
    key: "stores_currency_symbols",
    title: "Currency Symbols",
    path: "Stores > Currency > Currency Symbols",
  },
  {
    key: "stores_product",
    title: "Product",
    path: "Stores > Attributes > Product",
  },
  {
    key: "stores_attribute_set",
    title: "Attribute Set",
    path: "Stores > Attributes > Attribute Set",
  },
  {
    key: "stores_rating",
    title: "Rating",
    path: "Stores > Attributes > Rating",
  },
  // System
  {
    key: "system_import",
    title: "Import",
    path: "System > Data Transfer > Import",
  },
  {
    key: "system_export",
    title: "Export",
    path: "System > Data Transfer > Export",
  },
  {
    key: "system_import_export_tax_rates",
    title: "Import/Export Tax Rates",
    path: "System > Data Transfer > Import/Export Tax Rates",
  },
  {
    key: "system_import_history",
    title: "Import History",
    path: "System > Data Transfer > Import History",
  },
  {
    key: "system_integrations",
    title: "Integrations",
    path: "System > Extensions > Integrations",
  },
  {
    key: "system_cache_management",
    title: "Cache Management",
    path: "System > Tools > Cache Management",
  },
  {
    key: "system_index_management",
    title: "Index Management",
    path: "System > Tools > Index Management",
  },
  {
    key: "system_all_users",
    title: "All Users",
    path: "System > Permissions > All Users",
  },
  {
    key: "system_locked_users",
    title: "Locked Users",
    path: "System > Permissions > Locked Users",
  },
  {
    key: "system_user_roles",
    title: "User Roles",
    path: "System > Permissions > User Roles",
  },
  {
    key: "system_bulk_actions",
    title: "Bulk Actions",
    path: "System > Action Logs > Bulk Actions",
  },
  {
    key: "system_notifications",
    title: "Notifications",
    path: "System > Other Settings > Notifications",
  },
  {
    key: "system_custom_variables",
    title: "Custom Variables",
    path: "System > Other Settings > Custom Variables",
  },
  {
    key: "system_manage_encryption_key",
    title: "Manage Encryption Key",
    path: "System > Other Settings > Manage Encryption Key",
  },
  // Find Partners
  {
    key: "find_partners",
    title: "Find Partners & Extensions",
    path: "Find Partners & Extensions",
  },
];

defineProps({
  selectedMenu: {
    type: String,
    default: "dashboard",
  },
});

const emit = defineEmits(["menu-click"]);

const handleMenuClick = ({ key }) => {
  selectedKeys.value = [key];
  emit("menu-click", key);
};

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    filteredMenuItems.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase();
  filteredMenuItems.value = allMenuItems
    .filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query)
    )
    .slice(0, 10); // 限制最多显示10个结果
};

const handleMenuSelect = (item) => {
  selectedKeys.value = [item.key];
  emit("menu-click", item.key);
  searchVisible.value = false;
  searchQuery.value = "";
  filteredMenuItems.value = [];
};

// 当搜索框显示时，自动聚焦输入框
watch(searchVisible, async (newVal) => {
  if (newVal) {
    await nextTick();
    searchInput.value?.focus();
  } else {
    searchQuery.value = "";
    filteredMenuItems.value = [];
  }
});
</script>

<style scoped>
.logo {
  height: 64px;
  margin: 0;
  background: #343434;
  display: flex;
  justify-content: center;
  align-items: center;
}
:deep(.ant-menu-dark.ant-menu-inline) {
  background: #343434;
}
:deep(.ant-menu-dark .ant-menu-item-selected) {
  background-color: #eb5202; /* Magento Orange */
}

.search-dropdown {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 400px;
  max-width: 500px;
  padding: 12px;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 8px;
}

.search-result-item {
  padding: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.result-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.result-path {
  font-size: 12px;
  color: #999;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
