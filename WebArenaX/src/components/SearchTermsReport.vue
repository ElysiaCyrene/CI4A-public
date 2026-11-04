<template>
  <div class="search-terms-report">
    <div class="page-header">
      <h1 class="page-title">Search Terms Report</h1>
    </div>

    <!-- Search and Actions Bar -->
    <div class="actions-bar">
      <div class="search-box">
        <a-button type="primary" @click="handleSearch" class="search-button"
          >Search</a-button
        >
        <a-button @click="resetFilters" class="reset-button"
          >Reset Filter</a-button
        >
        <span class="records-found" v-if="pagination.total !== undefined"
          >{{ pagination.total }} records found</span
        >
      </div>
      <div class="toolbar">
        <div class="pagination-top">
          <a-select
            v-model:value="pagination.pageSize"
            style="width: 70px"
            @change="handlePageSizeChange"
          >
            <a-select-option :value="20">20</a-select-option>
            <a-select-option :value="50">50</a-select-option>
            <a-select-option :value="100">100</a-select-option>
          </a-select>
          <span class="per-page-text">per page</span>
          <a-pagination
            simple
            v-model:current="pagination.current"
            :total="pagination.total"
            :page-size="pagination.pageSize"
            @change="handlePageChange"
          />
        </div>
        <div class="export-control">
          <span>Export to:</span>
          <a-select default-value="CSV" style="width: 80px; margin: 0 8px">
            <a-select-option value="CSV">CSV</a-select-option>
            <a-select-option value="Excel">Excel</a-select-option>
          </a-select>
          <a-button @click="handleExport">Export</a-button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table-container">
      <a-table
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :loading="loading"
        row-key="query_id"
        size="middle"
        bordered
        @change="handleTableChange"
      >
        <!-- Custom Header for Filters -->
        <template #headerCell="{ column }">
          <div class="header-cell-content">
            <span>{{ column.title }}</span>
            <!-- Filter Inputs -->
            <div class="column-filter" v-if="column.key === 'query_text'">
              <a-input
                v-model:value="filters.query_text"
                @pressEnter="handleSearch"
              />
            </div>
            <div class="column-filter" v-if="column.key === 'store_id'">
              <a-select
                v-model:value="filters.store_id"
                style="width: 100%"
                allowClear
              >
                <a-select-option :value="null">All Store Views</a-select-option>
                <!-- We might populate this dynamically later -->
              </a-select>
            </div>
            <div class="column-filter" v-if="column.key === 'num_results'">
              <div class="range-filter">
                <a-input
                  placeholder="From"
                  v-model:value="filters.num_results_from"
                  @pressEnter="handleSearch"
                />
                <a-input
                  placeholder="To"
                  v-model:value="filters.num_results_to"
                  @pressEnter="handleSearch"
                  style="margin-top: 4px"
                />
              </div>
            </div>
            <div class="column-filter" v-if="column.key === 'popularity'">
              <div class="range-filter">
                <a-input
                  placeholder="From"
                  v-model:value="filters.popularity_from"
                  @pressEnter="handleSearch"
                />
                <a-input
                  placeholder="To"
                  v-model:value="filters.popularity_to"
                  @pressEnter="handleSearch"
                  style="margin-top: 4px"
                />
              </div>
            </div>
          </div>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'store_id'">
            <div style="white-space: pre-line">
              {{ getStoreName(record.store_id) }}
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const loading = ref(false);

const handleExport = () => {
  message.success("Export successfully");
};

const data = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const filters = reactive({
  query_text: "",
  store_id: null,
  num_results_from: "",
  num_results_to: "",
  popularity_from: "",
  popularity_to: "",
});

const sorter = reactive({
  field: "",
  order: "",
});

const columns = [
  {
    title: "ID",
    dataIndex: "query_id",
    key: "query_id",
    width: 80,
    sorter: true,
  },
  {
    title: "Search Query",
    dataIndex: "query_text",
    key: "query_text",
    sorter: true,
  },
  {
    title: "Store",
    dataIndex: "store_id",
    key: "store_id",
    sorter: true,
  },
  {
    title: "Results",
    dataIndex: "num_results",
    key: "num_results",
    width: 150,
    sorter: true,
  },
  {
    title: "Hits",
    dataIndex: "popularity",
    key: "popularity",
    width: 150,
    sorter: true,
  },
];

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const resetFilters = () => {
  filters.query_text = "";
  filters.store_id = null;
  filters.num_results_from = "";
  filters.num_results_to = "";
  filters.popularity_from = "";
  filters.popularity_to = "";
  sorter.field = "";
  sorter.order = "";
  handleSearch();
};

const handlePageChange = (page) => {
  pagination.current = page;
  fetchData();
};

const handlePageSizeChange = (value) => {
  pagination.pageSize = value;
  pagination.current = 1;
  fetchData();
};

const handleTableChange = (pagination, filters, sorterResult) => {
  if (sorterResult.order) {
    sorter.field = sorterResult.field;
    sorter.order = sorterResult.order;
  } else {
    sorter.field = "";
    sorter.order = "";
  }
  fetchData();
};

const getStoreName = (storeId) => {
  // This is a placeholder. Ideally we fetch store list from API.
  // Based on screenshot:
  if (storeId == 1)
    return "Main Website\nMain Website Store\nDefault Store View";
  return `Store ID: ${storeId}`;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    };

    const response = await axios.get("/api/search-terms", {
      params,
    });
    data.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error) {
    console.error("Error fetching search terms:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.search-terms-report {
  padding: 24px;
  background: #f4f5f7; /* Magento-like background */
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 300;
  color: #303030;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  background: #fff;
  padding: 10px;
  border: 1px solid #e3e3e3;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-button {
  background-color: #eb5202; /* Magento Orange */
  border-color: #eb5202;
}

.search-button:hover {
  background-color: #ba4000;
  border-color: #ba4000;
}

.reset-button {
  color: #007bdb;
  border: none;
  background: none;
  box-shadow: none;
}

.records-found {
  margin-left: 15px;
  color: #303030;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 20px;
}

.pagination-top {
  display: flex;
  align-items: center;
}

.per-page-text {
  margin: 0 8px;
}

.export-control {
  display: flex;
  align-items: center;
}

.data-table-container {
  background: #fff;
  border: 1px solid #e3e3e3;
}

.header-cell-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-filter {
  font-weight: normal;
}

.range-filter {
  display: flex;
  flex-direction: column;
}

/* Override Ant Design Table Header Styles to match Magento */
:deep(.ant-table-thead > tr > th) {
  background: #514943;
  color: #fff;
  font-weight: 600;
  padding: 10px;
}

:deep(.ant-table-thead > tr > th .ant-input),
:deep(.ant-table-thead > tr > th .ant-select-selector) {
  border-radius: 0;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 10px;
}

:deep(.ant-pagination-simple .ant-pagination-simple-pager input) {
  width: 40px;
}
</style>
