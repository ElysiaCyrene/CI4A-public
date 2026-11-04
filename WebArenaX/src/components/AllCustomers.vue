<template>
  <div class="all-customers">
    <div class="page-header">
      <h1 class="page-title">Customers</h1>
      <a-button type="primary" class="add-button">Add New Customer</a-button>
    </div>

    <!-- Search and Actions Bar -->
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
          <a-button> <setting-outlined /> Columns <down-outlined /> </a-button>
        </a-popover>
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item>CSV</a-menu-item>
              <a-menu-item>Excel XML</a-menu-item>
            </a-menu>
          </template>
          <a-button> <upload-outlined /> Export <down-outlined /> </a-button>
        </a-dropdown>
      </div>
    </div>

    <!-- Filters Section -->
    <div v-if="showFilters" class="filters-section">
      <a-form layout="vertical" :model="filters" @finish="applyFilters">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Customer Since">
              <div class="date-range">
                <a-date-picker
                  v-model:value="filters.created_at_from"
                  placeholder="from"
                  style="width: 100%"
                />
                <a-date-picker
                  v-model:value="filters.created_at_to"
                  placeholder="to"
                  style="width: 100%; margin-top: 4px"
                />
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Name">
              <a-input v-model:value="filters.name" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Email">
              <a-input v-model:value="filters.email" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Group ID">
              <a-input v-model:value="filters.group_id" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="Phone">
              <a-input v-model:value="filters.billing_telephone" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="ZIP">
              <a-input v-model:value="filters.billing_postcode" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Country">
              <a-input
                v-model:value="filters.billing_country_id"
                placeholder="Country Code (e.g. US)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="State/Province">
              <a-input v-model:value="filters.billing_region" />
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
        row-key="entity_id"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-if="column.key === 'group'">
            {{ record.customer_group_code || record.group_id }}
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import {
  FilterOutlined,
  EyeOutlined,
  SettingOutlined,
  UploadOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";
import axios from "axios";
import dayjs from "dayjs";

const showFilters = ref(true);
const loading = ref(false);
const data = ref([]);

const filters = reactive({
  created_at_from: null,
  created_at_to: null,
  name: "",
  email: "",
  group_id: "",
  billing_telephone: "",
  billing_postcode: "",
  billing_country_id: "",
  billing_region: "",
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const allColumns = [
  { title: "Name", dataIndex: "name", key: "name", sorter: true },
  { title: "Email", dataIndex: "email", key: "email", sorter: true },
  { title: "Group", key: "group", sorter: true },
  { title: "Phone", dataIndex: "billing_telephone", key: "billing_telephone" },
  { title: "ZIP", dataIndex: "billing_postcode", key: "billing_postcode" },
  {
    title: "Country",
    dataIndex: "billing_country_id",
    key: "billing_country_id",
  },
  {
    title: "State/Province",
    dataIndex: "billing_region",
    key: "billing_region",
  },
  {
    title: "Customer Since",
    dataIndex: "created_at",
    key: "created_at",
    sorter: true,
  },
];

const visibleColumnKeys = ref(allColumns.map((c) => c.key));

const columns = computed(() => {
  return allColumns.filter((c) => visibleColumnKeys.value.includes(c.key));
});

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const resetFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = null;
  });
  filters.name = "";
  filters.email = "";
  filters.group_id = "";
  filters.billing_telephone = "";
  filters.billing_postcode = "";
  filters.billing_country_id = "";
  filters.billing_region = "";
  fetchData();
};

const applyFilters = () => {
  pagination.current = 1;
  fetchData();
};

const handleSearch = () => {
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

const formatDate = (dateString) => {
  if (!dateString) return "";
  return dayjs(dateString).format("MMM D, YYYY h:mm:ss A");
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    };

    // Format dates
    if (filters.created_at_from) {
      params.created_at_from = dayjs(filters.created_at_from).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }
    if (filters.created_at_to) {
      params.created_at_to = dayjs(filters.created_at_to).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }

    const response = await axios.get("/api/customers", {
      params,
    });
    data.value = response.data.items;
    pagination.total = response.data.total;
  } catch (error) {
    console.error("Error fetching customers:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.all-customers {
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

.add-button {
  background-color: #eb5202;
  border-color: #eb5202;
}

.add-button:hover {
  background-color: #d44902;
  border-color: #d44902;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
}

.filters-section {
  background: #fff;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #d9d9d9;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.data-table {
  background: #fff;
  padding: 16px;
  border: 1px solid #d9d9d9;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.date-range {
  display: flex;
  flex-direction: column;
}
</style>
