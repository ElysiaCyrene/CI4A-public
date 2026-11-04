<template>
  <div class="marketing-url-rewrites">
    <div class="page-header">
      <h1 class="page-title">URL Rewrites</h1>
      <a-button type="primary" class="add-button">Add URL Rewrite</a-button>
    </div>

    <!-- Actions Bar -->
    <div class="actions-bar">
      <div class="toolbar">
        <a-button @click="toggleFilters">
          <filter-outlined /> Filters
        </a-button>
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item>Default View</a-menu-item>
            </a-menu>
          </template>
          <a-button> <eye-outlined /> Default View <down-outlined /> </a-button>
        </a-dropdown>
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item>Columns</a-menu-item>
            </a-menu>
          </template>
          <a-button> <setting-outlined /> Columns <down-outlined /> </a-button>
        </a-dropdown>
      </div>
    </div>

    <!-- Filters Section -->
    <div v-if="showFilters" class="filters-section">
      <a-form layout="vertical" :model="filters" @finish="applyFilters">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="ID">
              <div class="range-input">
                <a-input
                  v-model:value="filters.url_rewrite_id_from"
                  placeholder="from"
                />
                <a-input
                  v-model:value="filters.url_rewrite_id_to"
                  placeholder="to"
                  style="margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Request Path">
              <a-input v-model:value="filters.request_path" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Target Path">
              <a-input v-model:value="filters.target_path" />
            </a-form-item>
          </a-col>
        </a-row>
        <div class="filter-actions">
          <a-button @click="resetFilters" style="margin-right: 8px"
            >Cancel</a-button
          >
          <a-button type="primary" @click="applyFilters"
            >Apply Filters</a-button
          >
        </div>
      </a-form>
    </div>

    <!-- Data Table -->
    <div class="data-table">
      <div class="table-header">
        <span>{{ pagination.total }} records found</span>
        <div class="pagination-controls">
          <a-select
            v-model:value="pagination.pageSize"
            style="width: 80px"
            @change="handlePageSizeChange"
          >
            <a-select-option :value="20">20</a-select-option>
            <a-select-option :value="50">50</a-select-option>
            <a-select-option :value="100">100</a-select-option>
            <a-select-option :value="200">200</a-select-option>
          </a-select>
          <span style="margin-left: 8px">per page</span>
          <a-pagination
            v-model:current="pagination.current"
            :total="pagination.total"
            :page-size="pagination.pageSize"
            show-less-items
            @change="handlePageChange"
            style="display: inline-block; margin-left: 16px"
          />
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :loading="loading"
        row-key="url_rewrite_id"
        :scroll="{ x: 1000 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'redirect_type'">
            {{ getRedirectTypeLabel(record.redirect_type) }}
          </template>
          <template v-if="column.key === 'action'">
            <a href="#">Edit</a>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  FilterOutlined,
  EyeOutlined,
  SettingOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";
import axios from "axios";

const showFilters = ref(true);
const loading = ref(false);
const data = ref([]);

const filters = reactive({
  url_rewrite_id_from: "",
  url_rewrite_id_to: "",
  request_path: "",
  target_path: "",
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const columns = [
  {
    title: "ID",
    dataIndex: "url_rewrite_id",
    key: "url_rewrite_id",
    sorter: true,
    width: 80,
  },
  { title: "Store View", dataIndex: "store_id", key: "store_id" }, // Placeholder
  {
    title: "Request Path",
    dataIndex: "request_path",
    key: "request_path",
    sorter: true,
  },
  {
    title: "Target Path",
    dataIndex: "target_path",
    key: "target_path",
    sorter: true,
  },
  {
    title: "Redirect Type",
    dataIndex: "redirect_type",
    key: "redirect_type",
    sorter: true,
  },
  { title: "Action", key: "action" },
];

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const resetFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = undefined;
  });
  filters.url_rewrite_id_from = "";
  filters.url_rewrite_id_to = "";
  filters.request_path = "";
  filters.target_path = "";
  fetchData();
};

const applyFilters = () => {
  pagination.current = 1;
  fetchData();
};

const handlePageChange = (page) => {
  pagination.current = page;
  fetchData();
};

const handlePageSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.current = 1;
  fetchData();
};

const getRedirectTypeLabel = (type) => {
  if (type === 0) return "No";
  if (type === 301) return "Permanent (301)";
  if (type === 302) return "Temporary (302)";
  return type;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      url_rewrite_id: filters.url_rewrite_id_from, // Simplified
      request_path: filters.request_path,
      target_path: filters.target_path,
    };

    const response = await axios.get("/api/marketing/url-rewrites", { params });
    data.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error) {
    console.error("Error fetching url rewrites:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.marketing-url-rewrites {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.actions-bar {
  background: #fff;
  padding: 12px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.filters-section {
  background: #fff;
  padding: 24px;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 16px;
}

.range-input {
  display: flex;
  flex-direction: column;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.data-table {
  background: #fff;
  padding: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pagination-controls {
  display: flex;
  align-items: center;
}
</style>
