<template>
  <div class="product-reviews-report">
    <div class="page-header">
      <h1 class="page-title">Product Reviews Report</h1>
    </div>

    <!-- 筛选栏 -->
    <a-card :bordered="false" style="margin-bottom: 16px">
      <div class="filter-container">
        <a-form layout="vertical" :model="filters" @finish="handleSearch">
          <a-row :gutter="16">
            <a-col :span="4">
              <a-form-item label="ID">
                <a-input v-model:value="filters.id" placeholder="ID" />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="Product">
                <a-input
                  v-model:value="filters.product"
                  placeholder="Product Name"
                />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="Reviews">
                <a-input
                  v-model:value="filters.reviews_count"
                  placeholder="Count"
                />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="Average">
                <a-input
                  v-model:value="filters.avg_rating"
                  placeholder="Average"
                />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="Avg (Approved)">
                <a-input
                  v-model:value="filters.avg_rating_approved"
                  placeholder="Avg (Approved)"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="4">
              <a-form-item label="Last Review From">
                <a-date-picker
                  v-model:value="filters.last_review_from"
                  format="MM/DD/YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="Last Review To">
                <a-date-picker
                  v-model:value="filters.last_review_to"
                  format="MM/DD/YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8" style="display: flex; align-items: flex-end">
              <a-form-item>
                <a-space>
                  <a-button type="primary" @click="handleSearch"
                    >Search</a-button
                  >
                  <a-button @click="handleResetFilter">Reset Filter</a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false">
      <div class="export-bar">
        <span>Export to:</span>
        <a-select v-model:value="exportFormat" style="width: 100px">
          <a-select-option value="csv">CSV</a-select-option>
          <a-select-option value="excel">Excel</a-select-option>
        </a-select>
        <a-button @click="handleExport">Export</a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="reportData"
        :loading="loading"
        :pagination="false"
        :row-key="(record) => record.product_id"
        :custom-row="customRow"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avg_rating'">
            {{ formatNumber(record.avg_rating) }}
          </template>
          <template v-else-if="column.key === 'avg_rating_approved'">
            {{ formatNumber(record.avg_rating_approved) }}
          </template>
          <template v-else-if="column.key === 'last_review'">
            {{ formatDate(record.last_review) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click.stop="showReviews(record)">Show Reviews</a>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div style="margin-top: 16px; display: flex; justify-content: flex-end">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-total="
            (total) => `of ${Math.ceil(total / pagination.pageSize)}`
          "
          @change="handlePageChange"
        />
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

const loading = ref(false);
const reportData = ref([]);
const exportFormat = ref(undefined);
const hasSearched = ref(false);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const filters = reactive({
  id: null,
  product: null,
  reviews_count: null,
  avg_rating: null,
  avg_rating_approved: null,
  last_review_from: null,
  last_review_to: null,
});

const columns = [
  {
    title: "ID",
    dataIndex: "product_id",
    key: "product_id",
    width: 80,
  },
  {
    title: "Product",
    dataIndex: "product_name",
    key: "product_name",
  },
  {
    title: "Reviews",
    dataIndex: "review_count",
    key: "review_count",
    width: 100,
    align: "right",
  },
  {
    title: "Average",
    dataIndex: "avg_rating",
    key: "avg_rating",
    width: 120,
    align: "right",
  },
  {
    title: "Average (Approved)",
    dataIndex: "avg_rating_approved",
    key: "avg_rating_approved",
    width: 150,
    align: "right",
  },
  {
    title: "Last Review",
    dataIndex: "last_review",
    key: "last_review",
    width: 180,
  },
  {
    title: "Action",
    key: "action",
    width: 120,
  },
];

const formatNumber = (value) => {
  if (value === null || value === undefined) return "N/A";
  return parseFloat(value).toFixed(4);
};

const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("MMM D, YYYY, h:mm:ss A");
};

const handleExport = () => {
  message.success("Export successfully");
};

const fetchReport = async () => {
  loading.value = true;
  hasSearched.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });

    if (filters.id) params.append("id", filters.id);
    if (filters.product) params.append("product", filters.product);
    if (filters.reviews_count)
      params.append("reviews_count", filters.reviews_count);
    if (filters.avg_rating) params.append("avg_rating", filters.avg_rating);
    if (filters.avg_rating_approved)
      params.append("avg_rating_approved", filters.avg_rating_approved);
    if (filters.last_review_from)
      params.append("last_review_from", filters.last_review_from);
    if (filters.last_review_to)
      params.append("last_review_to", filters.last_review_to);

    const response = await fetch(
      `/api/reports/product-reviews?${params}`
    );
    const data = await response.json();

    reportData.value = data.items || [];
    pagination.total = data.total || 0;
  } catch (error) {
    console.error("Failed to fetch report:", error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchReport();
};

const handleResetFilter = () => {
  Object.keys(filters).forEach((key) => (filters[key] = null));
  pagination.current = 1;
  fetchReport();
};

const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchReport();
};

const emit = defineEmits(["navigate"]);

const showReviews = (record) => {
  emit("navigate", "marketing_all_reviews", { product: record.product_name });
};

const customRow = (record) => {
  return {
    onClick: () => {
      showReviews(record);
    },
    style: {
      cursor: "pointer",
    },
  };
};

onMounted(() => {
  fetchReport();
});
</script>

<style scoped>
.page-header {
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
</style>
