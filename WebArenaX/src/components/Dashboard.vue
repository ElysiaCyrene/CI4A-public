<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <div class="page-actions">
        <div class="scope-selector">
          <span style="font-weight: 600; margin-right: 8px">Scope:</span>
          <a-select
            v-model:value="selectedScope"
            style="width: 200px"
            @change="fetchData"
          >
            <a-select-option value="all">All Store Views</a-select-option>
            <a-select-option value="1">Default Store View</a-select-option>
          </a-select>
          <question-circle-filled style="margin-left: 8px; color: #666" />
        </div>
        <a-button type="primary" class="reload-btn" @click="fetchData"
          >Reload Data</a-button
        >
      </div>
    </div>

    <!-- Advanced Reporting -->
    <div class="advanced-reporting">
      <div class="reporting-content">
        <h3>Advanced Reporting</h3>
        <p>
          Gain new insights and take command of your business' performance,
          using our dynamic product, order, and customer reports tailored to
          your customer data.
        </p>
      </div>
      <a-button type="primary" ghost class="reporting-btn"
        >Go to Advanced Reporting <export-outlined
      /></a-button>
    </div>

    <!-- Chart Section -->
    <a-card class="chart-section" :bordered="false">
      <div class="chart-header">
        <div class="chart-metric">
          <h3>Lifetime Sales</h3>
          <div class="metric-value">{{ formatCurrency(lifetimeSales) }}</div>
        </div>
        <div class="chart-metric">
          <h3>Average Order</h3>
          <div class="metric-value">{{ formatCurrency(averageOrder) }}</div>
        </div>
      </div>

      <div class="chart-content-wrapper">
        <div class="chart-placeholder">
          Chart is disabled. To enable the chart, click <a href="#">here</a>.
        </div>
        <div class="chart-stats">
          <div class="stat-item">
            <span class="stat-label">Revenue</span>
            <span class="stat-value">$0.00</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Tax</span>
            <span class="stat-value">$0.00</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Shipping</span>
            <span class="stat-value">$0.00</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Quantity</span>
            <span class="stat-value">0</span>
          </div>
        </div>
      </div>
    </a-card>

    <!-- Bottom Grid -->
    <!-- <a-row :gutter="24" style="margin-top: 24px">
      <a-col :span="12">
        <div class="section-title">Last Orders</div>
        <a-card :bordered="false" class="table-card">
          <a-table
            :dataSource="lastOrders"
            :columns="lastOrdersColumns"
            :pagination="false"
            size="small"
          >
          </a-table>
        </a-card>

        <div class="section-title" style="margin-top: 24px">
          Last Search Terms
        </div>
        <a-card :bordered="false" class="table-card">
          <a-table
            :dataSource="lastSearchTerms"
            :columns="lastSearchTermsColumns"
            :pagination="false"
            size="small"
          >
          </a-table>
        </a-card>

        <div class="section-title" style="margin-top: 24px">
          Top Search Terms
        </div>
        <a-card :bordered="false" class="table-card">
          <a-table
            :dataSource="topSearchTerms"
            :columns="topSearchTermsColumns"
            :pagination="false"
            size="small"
          >
          </a-table>
        </a-card>
      </a-col>

      <a-col :span="12">
        <a-card :bordered="false" class="tabs-card">
          <a-tabs v-model:activeKey="activeTab">
            <a-tab-pane key="bestsellers" tab="Bestsellers">
              <a-table
                :dataSource="bestsellers"
                :columns="bestsellersColumns"
                :pagination="false"
                size="small"
              >
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="most_viewed" tab="Most Viewed Products">
              <div style="padding: 20px; color: #333">
                We couldn't find any records.
              </div>
            </a-tab-pane>
            <a-tab-pane key="new_customers" tab="New Customers">
              <a-table
                :dataSource="newCustomers"
                :columns="customersColumns"
                :pagination="false"
                size="small"
              >
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="customers" tab="Customers">
              <a-table
                :dataSource="customers"
                :columns="customersColumns"
                :pagination="false"
                size="small"
              >
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { QuestionCircleFilled, ExportOutlined } from "@ant-design/icons-vue";

const activeTab = ref("bestsellers");
const selectedScope = ref("all");

// Data Refs
const lastOrders = ref([]);
const lastSearchTerms = ref([]);
const topSearchTerms = ref([]);
const bestsellers = ref([]);
const newCustomers = ref([]);
const customers = ref([]);
const lifetimeSales = ref(0);
const averageOrder = ref(0);

// Columns
const lastOrdersColumns = [
  { title: "Customer", dataIndex: "customer", key: "customer" },
  { title: "Items", dataIndex: "items", key: "items" },
  { title: "Total", dataIndex: "total", key: "total", align: "right" },
];

const lastSearchTermsColumns = [
  { title: "Search Term", dataIndex: "term", key: "term" },
  { title: "Results", dataIndex: "results", key: "results" },
  { title: "Uses", dataIndex: "uses", key: "uses", align: "right" },
];

const topSearchTermsColumns = [
  { title: "Search Term", dataIndex: "term", key: "term" },
  { title: "Results", dataIndex: "results", key: "results" },
  { title: "Uses", dataIndex: "uses", key: "uses", align: "right" },
];

const bestsellersColumns = [
  { title: "Product", dataIndex: "product", key: "product" },
  { title: "Price", dataIndex: "price", key: "price", align: "right" },
  { title: "Quantity", dataIndex: "quantity", key: "quantity", align: "right" },
];

const customersColumns = [
  { title: "Customer", dataIndex: "customer", key: "customer" },
  { title: "Orders", dataIndex: "orders", key: "orders", align: "right" },
  { title: "Average", dataIndex: "average", key: "average", align: "right" },
  { title: "Total", dataIndex: "total", key: "total", align: "right" },
];

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// Fetch Data
const fetchData = async () => {
  try {
    const params = new URLSearchParams();
    if (selectedScope.value !== "all") {
      params.append("store_id", selectedScope.value);
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";

    // Stats
    const statsRes = await fetch(`/api/dashboard/stats${queryString}`);
    const statsData = await statsRes.json();
    lifetimeSales.value = statsData.lifetime_sales;
    averageOrder.value = statsData.average_order;

    // Last Orders
    const lastOrdersRes = await fetch(
      `/api/dashboard/last-orders${queryString}`
    );
    const lastOrdersData = await lastOrdersRes.json();
    lastOrders.value = lastOrdersData.map((item, index) => ({
      key: index,
      customer: item.customer,
      items: item.items,
      total: formatCurrency(item.total),
    }));

    // Last Search Terms
    const lastSearchRes = await fetch(
      `/api/dashboard/last-search-terms${queryString}`
    );
    const lastSearchData = await lastSearchRes.json();
    lastSearchTerms.value = lastSearchData.map((item, index) => ({
      key: index,
      term: item.term,
      results: item.results,
      uses: item.uses,
    }));

    // Top Search Terms
    const topSearchRes = await fetch(
      `/api/dashboard/top-search-terms${queryString}`
    );
    const topSearchData = await topSearchRes.json();
    topSearchTerms.value = topSearchData.map((item, index) => ({
      key: index,
      term: item.term,
      results: item.results,
      uses: item.uses,
    }));

    // Bestsellers
    const bestsellersRes = await fetch(
      `/api/dashboard/bestsellers${queryString}`
    );
    const bestsellersData = await bestsellersRes.json();
    bestsellers.value = bestsellersData.map((item, index) => ({
      key: index,
      product: item.product,
      price: formatCurrency(item.price),
      quantity: item.quantity,
    }));

    // New Customers
    const newCustomersRes = await fetch(
      `/api/dashboard/new-customers${queryString}`
    );
    const newCustomersData = await newCustomersRes.json();
    newCustomers.value = newCustomersData.map((item, index) => ({
      key: index,
      customer: item.customer,
      orders: item.orders || "",
      average: formatCurrency(item.average),
      total: formatCurrency(item.total),
    }));

    // Customers
    const customersRes = await fetch(`/api/dashboard/customers${queryString}`);
    const customersData = await customersRes.json();
    customers.value = customersData.map((item, index) => ({
      key: index,
      customer: item.customer,
      orders: item.orders,
      average: formatCurrency(item.average),
      total: formatCurrency(item.total),
    }));
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dashboard-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 300;
  margin: 0;
  color: #333;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.scope-selector {
  display: flex;
  align-items: center;
  color: #333;
}

.reload-btn {
  background-color: #eb5202;
  border-color: #eb5202;
  height: 32px;
  font-weight: 600;
}
.reload-btn:hover {
  background-color: #d44902;
  border-color: #d44902;
}

.advanced-reporting {
  background: #fff;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e3e3e3;
}

.reporting-content h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
}
.reporting-content p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.reporting-btn {
  border-color: #007bdb;
  color: #007bdb;
  font-weight: 600;
}

.chart-section {
  margin-bottom: 24px;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-metric {
  margin-bottom: 10px;
}
.chart-metric h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}
.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #eb5202;
}

.chart-content-wrapper {
  display: flex;
  border-top: 1px solid #e3e3e3;
  padding-top: 20px;
}

.chart-placeholder {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #666;
  font-size: 13px;
}

.chart-stats {
  width: 300px;
  padding-left: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.stat-label {
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #eb5202;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.table-card,
.tabs-card {
  min-height: 300px;
}

:deep(.ant-table-thead > tr > th) {
  background: #fff;
  font-weight: 600;
  border-bottom: 1px solid #e3e3e3;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
</style>
