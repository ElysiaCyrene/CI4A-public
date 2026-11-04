<template>
  <div class="refunds-report">
    <div class="page-header">
      <h1 class="page-title">Refunds Report</h1>
      <a-button
        type="primary"
        style="background: #eb5202; border-color: #eb5202"
        @click="fetchReport"
        >Show Report</a-button
      >
    </div>

    <div class="info-banner">
      <info-circle-filled style="color: #007bdb; margin-right: 8px" />
      <span>
        Last updated: {{ lastUpdated }}. To refresh last day's
        <a href="#">statistics</a>, click <a href="#">here</a>.
      </span>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <h3>Filter</h3>
      <a-form layout="vertical" :model="filters" @finish="fetchReport">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="Date Used"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 6 }"
            >
              <a-select value="Order Created" disabled>
                <a-select-option value="Order Created"
                  >Order Created</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="Period"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 4 }"
            >
              <a-select v-model:value="filters.period">
                <a-select-option value="day">Day</a-select-option>
                <a-select-option value="month">Month</a-select-option>
                <a-select-option value="year">Year</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="From"
              required
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 6 }"
            >
              <a-date-picker
                v-model:value="filters.from"
                format="MM/DD/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 150px"
              />
              <calendar-outlined style="margin-left: 8px; color: #666" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="To"
              required
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 6 }"
            >
              <a-date-picker
                v-model:value="filters.to"
                format="MM/DD/YYYY"
                value-format="YYYY-MM-DD"
                style="width: 150px"
              />
              <calendar-outlined style="margin-left: 8px; color: #666" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="Order Status"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 6 }"
            >
              <a-select v-model:value="filters.status">
                <a-select-option value="Any">Any</a-select-option>
                <a-select-option value="pending">Pending</a-select-option>
                <a-select-option value="processing">Processing</a-select-option>
                <a-select-option value="complete">Complete</a-select-option>
                <a-select-option value="closed">Closed</a-select-option>
                <a-select-option value="canceled">Canceled</a-select-option>
              </a-select>
              <div class="field-note">
                Applies to Any of the Specified Order Statuses except canceled
                orders
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item
              label="Empty Rows"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 4 }"
            >
              <a-select v-model:value="filters.emptyRows">
                <a-select-option value="No">No</a-select-option>
                <a-select-option value="Yes">Yes</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="export-bar">
      <span>Export to:</span>
      <a-select style="width: 80px; margin: 0 8px">
        <a-select-option value="CSV">CSV</a-select-option>
        <a-select-option value="Excel">Excel XML</a-select-option>
      </a-select>
      <a-button @click="handleExport">Export</a-button>
    </div>

    <!-- Data Table -->
    <div class="data-table">
      <div v-if="data.length === 0" class="no-records">0 records found</div>
      <a-table
        v-else
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :loading="loading"
        row-key="period_group"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'refunded'">
            {{ formatCurrency(record.refunded) }}
          </template>
          <template v-if="column.key === 'online_refunded'">
            {{ formatCurrency(record.online_refunded) }}
          </template>
          <template v-if="column.key === 'offline_refunded'">
            {{ formatCurrency(record.offline_refunded) }}
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { InfoCircleFilled, CalendarOutlined } from "@ant-design/icons-vue";
import axios from "axios";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

const loading = ref(false);
const data = ref([]);
const lastUpdated = ref(dayjs().format("MMM D, YYYY, h:mm:ss A"));

const filters = reactive({
  period: undefined,
  from: undefined,
  to: undefined,
  status: undefined,
  emptyRows: undefined,
});

const columns = [
  { title: "Period", dataIndex: "period_group", key: "period_group" },
  {
    title: "Orders",
    dataIndex: "orders_count",
    key: "orders_count",
    align: "right",
  },
  { title: "Refunded", dataIndex: "refunded", key: "refunded", align: "right" },
  {
    title: "Online Refunded",
    dataIndex: "online_refunded",
    key: "online_refunded",
    align: "right",
  },
  {
    title: "Offline Refunded",
    dataIndex: "offline_refunded",
    key: "offline_refunded",
    align: "right",
  },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
};

const handleExport = () => {
  message.success("Export successfully");
};

const fetchReport = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      "/api/reports/sales/refunds",
      {
        params: filters,
      }
    );
    data.value = response.data;
  } catch (error) {
    console.error("Error fetching refunds report:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Initial fetch is usually not done automatically in Magento reports until "Show Report" is clicked,
  // but we can do it if desired. For now, we'll wait for user action or just show empty state.
});
</script>

<style scoped>
.refunds-report {
  padding: 20px;
  background: #f4f5f7;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 300;
  color: #262626;
  margin: 0;
}

.info-banner {
  background-color: #fffbbb;
  border: 1px solid #e3e3e3;
  padding: 10px 15px;
  margin-bottom: 20px;
  color: #333;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.info-banner a {
  color: #007bdb;
  text-decoration: none;
  margin: 0 4px;
}

.filter-section {
  background: #fff;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #d9d9d9;
}

.filter-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 1px solid #e3e3e3;
  padding-bottom: 10px;
}

.field-note {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.export-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.data-table {
  background: #fff;
  padding: 0;
  border: 1px solid #d9d9d9;
}

.no-records {
  padding: 20px;
  text-align: left;
  color: #333;
}

:deep(.ant-form-item-label) {
  text-align: left;
  font-weight: 600;
}
</style>
