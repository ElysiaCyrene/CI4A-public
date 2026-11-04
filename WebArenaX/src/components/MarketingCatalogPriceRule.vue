<template>
  <div class="marketing-catalog-price-rule">
    <div class="page-header">
      <h1 class="page-title">Catalog Price Rule</h1>
      <a-button type="primary" class="add-button" @click="handleAddRule"
        >Add New Rule</a-button
      >
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
                  v-model:value="filters.rule_id_from"
                  placeholder="from"
                />
                <a-input
                  v-model:value="filters.rule_id_to"
                  placeholder="to"
                  style="margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Rule">
              <a-input v-model:value="filters.name" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Start">
              <div class="date-range">
                <a-date-picker
                  v-model:value="filters.from_date_from"
                  placeholder="from"
                  style="width: 100%"
                />
                <a-date-picker
                  v-model:value="filters.from_date_to"
                  placeholder="to"
                  style="width: 100%; margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="End">
              <div class="date-range">
                <a-date-picker
                  v-model:value="filters.to_date_from"
                  placeholder="from"
                  style="width: 100%"
                />
                <a-date-picker
                  v-model:value="filters.to_date_to"
                  placeholder="to"
                  style="width: 100%; margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Status">
              <a-select v-model:value="filters.is_active" allow-clear>
                <a-select-option :value="1">Active</a-select-option>
                <a-select-option :value="0">Inactive</a-select-option>
              </a-select>
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
        row-key="rule_id"
        :scroll="{ x: 1000 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'is_active'">
            <a-tag :color="record.is_active ? 'green' : 'red'">
              {{ record.is_active ? "Active" : "Inactive" }}
            </a-tag>
          </template>
          <template v-if="column.key === 'from_date'">
            {{ formatDate(record.from_date) }}
          </template>
          <template v-if="column.key === 'to_date'">
            {{ formatDate(record.to_date) }}
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
import dayjs from "dayjs";

const emit = defineEmits(["navigate"]);

const handleAddRule = () => {
  emit("navigate", "marketing_catalog_price_rule_add");
};

const showFilters = ref(true);
const loading = ref(false);
const data = ref([]);

const filters = reactive({
  rule_id_from: "",
  rule_id_to: "",
  name: "",
  from_date_from: null,
  from_date_to: null,
  to_date_from: null,
  to_date_to: null,
  is_active: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const columns = [
  {
    title: "ID",
    dataIndex: "rule_id",
    key: "rule_id",
    sorter: true,
    width: 80,
  },
  { title: "Rule", dataIndex: "name", key: "name", sorter: true },
  { title: "Start", dataIndex: "from_date", key: "from_date", sorter: true },
  { title: "End", dataIndex: "to_date", key: "to_date", sorter: true },
  { title: "Status", dataIndex: "is_active", key: "is_active", sorter: true },
  { title: "Web Site", key: "website" }, // Placeholder
  { title: "Action", key: "action" },
];

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const resetFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = undefined;
  });
  filters.rule_id_from = "";
  filters.rule_id_to = "";
  filters.name = "";
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

const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("MMM D, YYYY");
};

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      rule_id: filters.rule_id_from, // Simplified for now
      name: filters.name,
      is_active: filters.is_active,
    };

    const response = await axios.get("/api/marketing/catalog-rules", {
      params,
    });
    data.value = response.data.items;
    pagination.total = response.data.total;

    if (props.initialFilters && props.initialFilters.newRule) {
      data.value.unshift(props.initialFilters.newRule);
    }
  } catch (error) {
    console.error("Error fetching catalog rules:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.marketing-catalog-price-rule {
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

.date-range {
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
