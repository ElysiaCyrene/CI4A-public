<template>
  <div class="sales-orders-report">
    <div class="page-header">
      <h1 class="page-title">Orders Report</h1>
      <a-button
        type="primary"
        style="background: #eb5202; border-color: #eb5202"
        @click="fetchReport"
        >Show Report</a-button
      >
    </div>

    <!-- 筛选栏 -->
    <a-card :bordered="false" style="margin-bottom: 16px">
      <h3 style="margin-bottom: 16px">Filter</h3>
      <a-form layout="vertical" :model="filters" @finish="fetchReport">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Date Used">
              <a-select value="Order Created" disabled>
                <a-select-option value="Order Created"
                  >Order Created</a-select-option
                >
              </a-select>
              <div style="font-size: 12px; color: #666; margin-top: 4px">
                The Order Updated report is created in real time and does not
                require a refresh.
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Period">
              <a-select v-model:value="filters.period">
                <a-select-option value="day">Day</a-select-option>
                <a-select-option value="month">Month</a-select-option>
                <a-select-option value="year">Year</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="From" required>
              <a-date-picker
                v-model:value="filters.from"
                format="MM/DD/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="To" required>
              <a-date-picker
                v-model:value="filters.to"
                format="MM/DD/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Order Status">
              <a-select v-model:value="filters.status">
                <a-select-option value="Any">Any</a-select-option>
                <a-select-option value="pending">Pending</a-select-option>
                <a-select-option value="processing">Processing</a-select-option>
                <a-select-option value="complete">Complete</a-select-option>
                <a-select-option value="closed">Closed</a-select-option>
                <a-select-option value="canceled">Canceled</a-select-option>
              </a-select>
              <div style="font-size: 12px; color: #666; margin-top: 4px">
                Applies to Any of the Specified Order Statuses except canceled
                orders
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Empty Rows">
              <a-select v-model:value="filters.emptyRows">
                <a-select-option value="No">No</a-select-option>
                <a-select-option value="Yes">Yes</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Show Actual Values">
              <a-select v-model:value="filters.showActualValues">
                <a-select-option value="No">No</a-select-option>
                <a-select-option value="Yes">Yes</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <div v-if="hasSearched">
      <div style="margin-bottom: 16px">
        {{ reportData.length }} records found
      </div>
      <a-card :bordered="false">
        <div class="export-bar">
          <span>Export to:</span>
          <a-select v-model:value="exportFormat" style="width: 100px">
            <a-select-option value="csv">CSV</a-select-option>
            <a-select-option value="excel">Excel</a-select-option>
          </a-select>
          <a-button @click="handleExport">Export</a-button>

          <a-popover
            title="Select Columns"
            trigger="click"
            placement="bottomRight"
          >
            <template #content>
              <a-checkbox-group
                v-model:value="visibleColumnKeys"
                style="display: flex; flex-direction: column"
              >
                <a-checkbox
                  v-for="col in allColumns"
                  :key="col.key"
                  :value="col.key"
                  style="margin-left: 0; margin-bottom: 8px"
                >
                  {{ col.title }}
                </a-checkbox>
              </a-checkbox-group>
            </template>
            <a-button style="margin-left: 8px">
              <setting-outlined /> Columns
            </a-button>
          </a-popover>
        </div>

        <a-table
          :columns="columns"
          :data-source="reportData"
          :loading="loading"
          :pagination="false"
          row-key="period"
          class="report-table"
        >
          <template #bodyCell="{ column, record }">
            <template
              v-if="
                [
                  'sales_total',
                  'invoiced',
                  'refunded',
                  'sales_tax',
                  'sales_shipping',
                  'sales_discount',
                  'canceled',
                ].includes(column.key)
              "
            >
              {{ formatCurrency(record[column.key]) }}
            </template>
          </template>
          <template #summary>
            <a-table-summary fixed>
              <a-table-summary-row
                style="
                  background-color: #514943;
                  color: white;
                  font-weight: bold;
                "
              >
                <a-table-summary-cell>Total</a-table-summary-cell>
                <a-table-summary-cell>{{
                  totals.orders_count
                }}</a-table-summary-cell>
                <a-table-summary-cell>{{
                  totals.sales_items
                }}</a-table-summary-cell>
                <a-table-summary-cell>{{
                  formatCurrency(totals.sales_total)
                }}</a-table-summary-cell>
                <a-table-summary-cell>{{
                  formatCurrency(totals.invoiced)
                }}</a-table-summary-cell>
                <a-table-summary-cell>{{
                  formatCurrency(totals.refunded)
                }}</a-table-summary-cell>
                <a-table-summary-cell>{{
                  formatCurrency(totals.sales_tax)
                }}</a-table-summary-cell>
                <a-table-summary-cell>{{
                  formatCurrency(totals.sales_shipping)
                }}</a-table-summary-cell>
                <a-table-summary-cell>{{
                  formatCurrency(totals.sales_discount)
                }}</a-table-summary-cell>
                <a-table-summary-cell>{{
                  formatCurrency(totals.canceled)
                }}</a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { SettingOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

const loading = ref(false);
const reportData = ref([]);
const exportFormat = ref(undefined);
const hasSearched = ref(false);

const filters = reactive({
  period: null,
  from: null,
  to: null,
  status: null,
  emptyRows: null,
  showActualValues: null,
});

const allColumns = [
  { title: "Interval", key: "period", dataIndex: "period" },
  { title: "Orders", key: "orders_count", dataIndex: "orders_count" },
  { title: "Sales Items", key: "sales_items", dataIndex: "sales_items" },
  { title: "Sales Total", key: "sales_total", dataIndex: "sales_total" },
  { title: "Invoiced", key: "invoiced", dataIndex: "invoiced" },
  { title: "Refunded", key: "refunded", dataIndex: "refunded" },
  { title: "Sales Tax", key: "sales_tax", dataIndex: "sales_tax" },
  {
    title: "Sales Shipping",
    key: "sales_shipping",
    dataIndex: "sales_shipping",
  },
  {
    title: "Sales Discount",
    key: "sales_discount",
    dataIndex: "sales_discount",
  },
  { title: "Canceled", key: "canceled", dataIndex: "canceled" },
];

const visibleColumnKeys = ref(allColumns.map((c) => c.key));

const columns = computed(() => {
  return allColumns.filter((c) => visibleColumnKeys.value.includes(c.key));
});

const totals = computed(() => {
  const result = {
    orders_count: 0,
    sales_items: 0,
    sales_total: 0,
    invoiced: 0,
    refunded: 0,
    sales_tax: 0,
    sales_shipping: 0,
    sales_discount: 0,
    canceled: 0,
  };

  reportData.value.forEach((row) => {
    result.orders_count += Number(row.orders_count || 0);
    result.sales_items += Number(row.sales_items || 0);
    result.sales_total += Number(row.sales_total || 0);
    result.invoiced += Number(row.invoiced || 0);
    result.refunded += Number(row.refunded || 0);
    result.sales_tax += Number(row.sales_tax || 0);
    result.sales_shipping += Number(row.sales_shipping || 0);
    result.sales_discount += Number(row.sales_discount || 0);
    result.canceled += Number(row.canceled || 0);
  });

  return result;
});

const handleExport = () => {
  message.success("Export successfully");
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
};

const fetchReport = async () => {
  if (!filters.from || !filters.to) {
    alert("Please select From and To dates.");
    return;
  }

  loading.value = true;
  try {
    const params = new URLSearchParams({
      period: filters.period || "day",
      from: filters.from,
      to: filters.to,
      status: filters.status || "Any",
    });

    const response = await fetch(
      `/api/reports/sales/orders?${params}`
    );
    const data = await response.json();

    reportData.value = data;
    hasSearched.value = true;
  } catch (error) {
    console.error("Failed to fetch report:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.export-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.report-table :deep(.ant-table-thead > tr > th) {
  background: #514943;
  color: white;
  font-weight: bold;
}

.report-table :deep(.ant-table-summary) {
  background: #514943;
}
</style>
