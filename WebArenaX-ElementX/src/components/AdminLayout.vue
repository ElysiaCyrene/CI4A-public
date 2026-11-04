<template>
  <el-container style="min-height: 100vh">
    <!-- ===== SIDEBAR ===== -->
    <el-aside width="260px" style="background: #343434; overflow-y: auto">
      <!-- Logo -->
      <div class="logo">
        <el-icon :size="32" color="#eb5202">
          <ElementPlus />
        </el-icon>
      </div>

      <!-- Navigation Menu -->
      <el-menu
        :default-active="selectedKey"
        background-color="#343434"
        text-color="#b0b0b0"
        active-text-color="#fff"
        :default-openeds="defaultOpeneds"
        @select="handleMenuSelect"
        style="border-right: none"
      >
        <!-- Dashboard -->
        <el-menu-item index="dashboard">
          <el-icon><Monitor /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>

        <!-- Sales -->
        <el-sub-menu index="sales">
          <template #title>
            <el-icon><Money /></el-icon>
            <span>Sales</span>
          </template>
          <el-menu-item index="sales_orders">Orders</el-menu-item>
          <el-menu-item index="sales_invoices">Invoices</el-menu-item>
          <el-menu-item index="sales_shipments">Shipments</el-menu-item>
          <el-menu-item index="sales_credit_memos">Credit Memos</el-menu-item>
        </el-sub-menu>

        <!-- Catalog -->
        <el-sub-menu index="catalog">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>Catalog</span>
          </template>
          <el-menu-item index="catalog_products">Products</el-menu-item>
        </el-sub-menu>

        <!-- Customers -->
        <el-sub-menu index="customers">
          <template #title>
            <el-icon><User /></el-icon>
            <span>Customers</span>
          </template>
          <el-menu-item index="customers_all">All Customers</el-menu-item>
          <el-menu-item index="customers_groups">Customer Groups</el-menu-item>
        </el-sub-menu>

        <!-- Marketing -->
        <el-sub-menu index="marketing">
          <template #title>
            <el-icon><Promotion /></el-icon>
            <span>Marketing</span>
          </template>
          <el-sub-menu index="marketing_promotions">
            <template #title>Promotions</template>
            <el-menu-item index="marketing_catalog_price_rule">Catalog Price Rule</el-menu-item>
            <el-menu-item index="marketing_cart_price_rules">Cart Price Rules</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="marketing_communications">
            <template #title>Communications</template>
            <el-menu-item index="marketing_newsletter_subscribers">Newsletter Subscribers</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="marketing_seo">
            <template #title>SEO &amp; Search</template>
            <el-menu-item index="marketing_url_rewrites">URL Rewrites</el-menu-item>
            <el-menu-item index="marketing_search_terms">Search Terms</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="marketing_user_content">
            <template #title>User Content</template>
            <el-menu-item index="marketing_all_reviews">All Reviews</el-menu-item>
            <el-menu-item index="marketing_pending_reviews">Pending Reviews</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>

        <!-- Content -->
        <el-sub-menu index="content">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>Content</span>
          </template>
          <el-sub-menu index="content_elements">
            <template #title>Elements</template>
            <el-menu-item index="content_pages">Pages</el-menu-item>
            <el-menu-item index="content_blocks">Blocks</el-menu-item>
            <el-menu-item index="content_widgets">Widgets</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="content_design">
            <template #title>Design</template>
            <el-menu-item index="content_configuration">Configuration</el-menu-item>
            <el-menu-item index="content_themes">Themes</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>

        <!-- Reports -->
        <el-sub-menu index="reports">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>Reports</span>
          </template>
          <el-sub-menu index="reports_marketing">
            <template #title>Marketing</template>
            <el-menu-item index="reports_search_terms">Search Terms</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="reports_reviews">
            <template #title>Reviews</template>
            <el-menu-item index="reports_by_customers">By Customers</el-menu-item>
            <el-menu-item index="reports_by_products">By Products</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="reports_sales">
            <template #title>Sales</template>
            <el-menu-item index="reports_sales_orders">Orders</el-menu-item>
            <el-menu-item index="reports_tax">Tax</el-menu-item>
            <el-menu-item index="reports_shipping">Shipping</el-menu-item>
            <el-menu-item index="reports_refunds">Refunds</el-menu-item>
            <el-menu-item index="reports_coupons">Coupons</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="reports_customers">
            <template #title>Customers</template>
            <el-menu-item index="reports_order_total">Order Total</el-menu-item>
            <el-menu-item index="reports_order_count">Order Count</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="reports_products">
            <template #title>Products</template>
            <el-menu-item index="reports_views">Views</el-menu-item>
            <el-menu-item index="reports_bestsellers">Bestsellers</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- ===== MAIN CONTENT AREA ===== -->
    <el-container>
      <!-- Header -->
      <el-header height="64px" class="top-header">
        <div class="header-left"></div>
        <div class="header-right">
          <!-- Search -->
          <el-dropdown
            trigger="click"
            placement="bottom-start"
            :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"
            @visible-change="onSearchVisibleChange"
          >
            <el-icon :size="18" style="color: #666; cursor: pointer">
              <Search />
            </el-icon>
            <template #dropdown>
              <div class="search-dropdown">
                <el-input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  placeholder="search menu..."
                  size="large"
                  @input="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <div class="search-results">
                  <div v-if="filteredItems.length === 0 && searchQuery" class="no-results">
                    No matching menu items found
                  </div>
                  <div
                    v-for="item in filteredItems"
                    :key="item.key"
                    class="search-result-item"
                    @click="handleSearchSelect(item)"
                  >
                    <div class="result-title">{{ item.title }}</div>
                    <div class="result-path">{{ item.path }}</div>
                  </div>
                </div>
              </div>
            </template>
          </el-dropdown>

          <!-- Notifications -->
          <el-icon :size="18" style="color: #666; cursor: pointer">
            <Bell />
          </el-icon>

          <!-- User Profile -->
          <div class="user-profile">
            <div class="user-avatar">
              <el-icon><User /></el-icon>
            </div>
            <span class="user-name">admin</span>
            <el-icon :size="12" style="color: #666">
              <ArrowDown />
            </el-icon>
          </div>
        </div>
      </el-header>

      <!-- Content -->
      <el-main class="main-content">
        <slot></slot>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import {
  Monitor, Money, Goods, User, Promotion, Document,
  DataAnalysis, Search, Bell, ArrowDown, ElementPlus,
} from '@element-plus/icons-vue'

const props = defineProps({
  selectedKey: { type: String, default: 'dashboard' },
})

const emit = defineEmits(['menu-click'])

const searchQuery = ref('')
const searchInputRef = ref(null)
const filteredItems = ref([])

// Keep parent sub-menus open when an inner page is active
const defaultOpeneds = computedOpeneds(props.selectedKey)

function computedOpeneds(key) {
  // Map page keys to their parent menu keys
  const mapping = {
    'dashboard': [],
    'sales_orders': ['sales'], 'sales_invoices': ['sales'], 'sales_shipments': ['sales'], 'sales_credit_memos': ['sales'],
    'catalog_products': ['catalog'],
    'customers_all': ['customers'], 'customers_groups': ['customers'],
    'marketing_catalog_price_rule': ['marketing', 'marketing_promotions'],
    'marketing_catalog_price_rule_add': ['marketing', 'marketing_promotions'],
    'marketing_cart_price_rules': ['marketing', 'marketing_promotions'],
    'marketing_cart_price_rule_add': ['marketing', 'marketing_promotions'],
    'marketing_newsletter_subscribers': ['marketing', 'marketing_communications'],
    'marketing_url_rewrites': ['marketing', 'marketing_seo'],
    'marketing_all_reviews': ['marketing', 'marketing_user_content'],
    'marketing_review_edit': ['marketing', 'marketing_user_content'],
    'marketing_pending_reviews': ['marketing', 'marketing_user_content'],
    'content_pages': ['content', 'content_elements'],
    'content_page_edit': ['content', 'content_elements'],
    'content_page_view': ['content', 'content_elements'],
    'content_blocks': ['content', 'content_elements'],
    'content_widgets': ['content', 'content_elements'],
    'content_configuration': ['content', 'content_design'],
    'content_themes': ['content', 'content_design'],
    'content_theme_view': ['content', 'content_design'],
    'reports_search_terms': ['reports', 'reports_marketing'],
    'reports_by_customers': ['reports', 'reports_reviews'],
    'reports_by_products': ['reports', 'reports_reviews'],
    'reports_sales_orders': ['reports', 'reports_sales'],
    'reports_tax': ['reports', 'reports_sales'],
    'reports_shipping': ['reports', 'reports_sales'],
    'reports_refunds': ['reports', 'reports_sales'],
    'reports_coupons': ['reports', 'reports_sales'],
    'reports_order_total': ['reports', 'reports_customers'],
    'reports_order_count': ['reports', 'reports_customers'],
    'reports_views': ['reports', 'reports_products'],
    'reports_bestsellers': ['reports', 'reports_products'],
  }
  return mapping[key] || []
}

// All menu items (flat for search)
const allMenuItems = [
  { key: 'dashboard', title: 'Dashboard', path: 'Dashboard' },
  // Sales
  { key: 'sales_orders', title: 'Orders', path: 'Sales > Orders' },
  { key: 'sales_invoices', title: 'Invoices', path: 'Sales > Invoices' },
  { key: 'sales_shipments', title: 'Shipments', path: 'Sales > Shipments' },
  { key: 'sales_credit_memos', title: 'Credit Memos', path: 'Sales > Credit Memos' },
  // Catalog
  { key: 'catalog_products', title: 'Products', path: 'Catalog > Products' },
  // Customers
  { key: 'customers_all', title: 'All Customers', path: 'Customers > All Customers' },
  { key: 'customers_groups', title: 'Customer Groups', path: 'Customers > Customer Groups' },
  // Marketing
  { key: 'marketing_catalog_price_rule', title: 'Catalog Price Rule', path: 'Marketing > Promotions > Catalog Price Rule' },
  { key: 'marketing_cart_price_rules', title: 'Cart Price Rules', path: 'Marketing > Promotions > Cart Price Rules' },
  { key: 'marketing_newsletter_subscribers', title: 'Newsletter Subscribers', path: 'Marketing > Communications > Newsletter Subscribers' },
  { key: 'marketing_url_rewrites', title: 'URL Rewrites', path: 'Marketing > SEO & Search > URL Rewrites' },
  { key: 'marketing_search_terms', title: 'Search Terms', path: 'Marketing > SEO & Search > Search Terms' },
  { key: 'marketing_all_reviews', title: 'All Reviews', path: 'Marketing > User Content > All Reviews' },
  { key: 'marketing_pending_reviews', title: 'Pending Reviews', path: 'Marketing > User Content > Pending Reviews' },
  // Content
  { key: 'content_pages', title: 'Pages', path: 'Content > Elements > Pages' },
  { key: 'content_blocks', title: 'Blocks', path: 'Content > Elements > Blocks' },
  { key: 'content_widgets', title: 'Widgets', path: 'Content > Elements > Widgets' },
  { key: 'content_configuration', title: 'Configuration', path: 'Content > Design > Configuration' },
  { key: 'content_themes', title: 'Themes', path: 'Content > Design > Themes' },
  // Reports
  { key: 'reports_search_terms', title: 'Search Terms', path: 'Reports > Marketing > Search Terms' },
  { key: 'reports_by_customers', title: 'By Customers', path: 'Reports > Reviews > By Customers' },
  { key: 'reports_by_products', title: 'By Products', path: 'Reports > Reviews > By Products' },
  { key: 'reports_sales_orders', title: 'Orders', path: 'Reports > Sales > Orders' },
  { key: 'reports_tax', title: 'Tax', path: 'Reports > Sales > Tax' },
  { key: 'reports_shipping', title: 'Shipping', path: 'Reports > Sales > Shipping' },
  { key: 'reports_refunds', title: 'Refunds', path: 'Reports > Sales > Refunds' },
  { key: 'reports_coupons', title: 'Coupons', path: 'Reports > Sales > Coupons' },
  { key: 'reports_order_total', title: 'Order Total', path: 'Reports > Customers > Order Total' },
  { key: 'reports_order_count', title: 'Order Count', path: 'Reports > Customers > Order Count' },
  { key: 'reports_views', title: 'Views', path: 'Reports > Products > Views' },
  { key: 'reports_bestsellers', title: 'Bestsellers', path: 'Reports > Products > Bestsellers' },
]

function handleMenuSelect(key) {
  emit('menu-click', key)
}

function handleSearch() {
  if (!searchQuery.value.trim()) {
    filteredItems.value = []
    return
  }
  const query = searchQuery.value.toLowerCase()
  filteredItems.value = allMenuItems
    .filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query)
    )
    .slice(0, 10)
}

function handleSearchSelect(item) {
  emit('menu-click', item.key)
  searchQuery.value = ''
  filteredItems.value = []
}

async function onSearchVisibleChange(visible) {
  if (visible) {
    await nextTick()
    searchInputRef.value?.focus()
  } else {
    searchQuery.value = ''
    filteredItems.value = []
  }
}
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #343434;
}

/* Override el-menu dark submenu bg */
:deep(.el-menu--inline) {
  background: #2b2b2b !important;
}
:deep(.el-menu .el-menu-item.is-active) {
  background-color: #eb5202 !important;
}

.top-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e3e3e3;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-avatar {
  background: #e3e3e3;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
}

.main-content {
  margin: 0;
  padding: 24px;
  background: #f4f4f4;
  overflow-y: auto;
  min-height: calc(100vh - 64px);
}

/* Search dropdown */
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
  font-size: 13px;
}

.result-path {
  font-size: 12px;
  color: #999;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>
