<template>
  <div class="all-reviews">
    <div class="page-header">
      <h1 class="page-title">Reviews</h1>
      <a-button
        type="primary"
        style="background: #eb5202; border-color: #eb5202"
      >
        New Review
      </a-button>
    </div>

    <!-- 搜索和筛选 -->
    <a-card :bordered="false" style="margin-bottom: 16px">
      <h3 style="margin-bottom: 16px">Filter</h3>

      <!-- 筛选表单 -->
      <a-form layout="vertical" :model="filters" @finish="handleSearch">
        <a-row :gutter="16">
          <a-col :span="4">
            <a-form-item label="ID">
              <a-input v-model:value="filters.id" placeholder="ID" />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="Status">
              <a-select
                v-model:value="filters.status"
                placeholder="Select Status"
                allow-clear
              >
                <a-select-option value="Approved">Approved</a-select-option>
                <a-select-option value="Pending">Pending</a-select-option>
                <a-select-option value="Not Approved"
                  >Not Approved</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="Created From">
              <a-date-picker
                v-model:value="filters.created_from"
                format="MM/DD/YYYY"
                value-format="YYYY-MM-DD"
                :input-read-only="true"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="Created To">
              <a-date-picker
                v-model:value="filters.created_to"
                format="MM/DD/YYYY"
                value-format="YYYY-MM-DD"
                :input-read-only="true"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="Title">
              <a-input v-model:value="filters.title" placeholder="Title" />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="Nickname">
              <a-input
                v-model:value="filters.nickname"
                placeholder="Nickname"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="4">
            <a-form-item label="Type">
              <a-select
                v-model:value="filters.type"
                placeholder="Select Type"
                allow-clear
              >
                <a-select-option value="Customer">Customer</a-select-option>
                <a-select-option value="Guest">Guest</a-select-option>
              </a-select>
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
            <a-form-item label="SKU">
              <a-input v-model:value="filters.sku" placeholder="SKU" />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="Review">
              <a-input v-model:value="filters.review" placeholder="Review" />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item label="Visibility">
              <a-select
                v-model:value="filters.visibility"
                placeholder="Select Visibility"
                allow-clear
              >
                <a-select-option
                  v-for="store in stores"
                  :key="store.name"
                  :value="store.name"
                >
                  {{ store.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="4" style="display: flex; align-items: flex-end">
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">Search</a-button>
                <a-button @click="handleResetFilter">Reset Filter</a-button>
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 操作栏 -->
    <a-card :bordered="false" style="margin-bottom: 16px">
      <div style="display: flex; gap: 16px; align-items: center">
        <a-select
          v-model:value="bulkAction"
          style="width: 200px"
          placeholder="Actions"
        >
          <a-select-option value="delete">Delete</a-select-option>
          <a-select-option value="update_status">Update Status</a-select-option>
        </a-select>
        <a-select
          v-if="bulkAction === 'update_status'"
          v-model:value="targetStatus"
          style="width: 200px"
          placeholder="Select Status"
        >
          <a-select-option value="Approved">Approved</a-select-option>
          <a-select-option value="Pending">Pending</a-select-option>
          <a-select-option value="Not Approved">Not Approved</a-select-option>
        </a-select>
        <a-button @click="handleBulkSubmit">Submit</a-button>

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
          <a-button> <setting-outlined /> Columns </a-button>
        </a-popover>

        <div style="flex: 1; text-align: right">
          <span>{{ pagination.total }} records found</span>
        </div>

        <a-select
          v-model:value="pagination.pageSize"
          style="width: 100px"
          @change="handlePageSizeChange"
        >
          <a-select-option :value="20">20</a-select-option>
          <a-select-option :value="50">50</a-select-option>
          <a-select-option :value="100">100</a-select-option>
        </a-select>
        <span>per page</span>
      </div>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="reviews"
        :loading="loading"
        :pagination="false"
        :row-selection="rowSelection"
        :custom-row="customRow"
        :row-key="(record) => record.review_id"
        @change="handleTableChange"
      >
        <template #headerCell="{ column }">
          <template v-if="column.key === 'created_at'">
            {{ column.title }}
          </template>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'review_id'">
            {{ record.review_id }}
          </template>
          <template v-else-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-else-if="column.key === 'status'">
            {{ record.status_name }}
          </template>
          <template v-else-if="column.key === 'title'">
            {{ record.title }}
          </template>
          <template v-else-if="column.key === 'nickname'">
            {{ record.nickname }}
          </template>
          <template v-else-if="column.key === 'review'">
            {{ truncateText(record.detail, 20) }}
          </template>
          <template v-else-if="column.key === 'visibility'">
            {{ record.store_names }}
          </template>
          <template v-else-if="column.key === 'type'">
            {{ record.type }}
          </template>
          <template v-else-if="column.key === 'product'">
            {{ record.product_name }}
          </template>
          <template v-else-if="column.key === 'sku'">
            {{ record.sku }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="handleEdit(record)">Edit</a>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div
        style="
          margin-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <div></div>
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
import { ref, reactive, onMounted, computed } from "vue";
import { CaretUpFilled, SettingOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

const loading = ref(false);
const reviews = ref([]);
const stores = ref([]);
const bulkAction = ref(undefined);
const selectedRowKeys = ref([]);
const sortState = reactive({
  field: null,
  order: null,
});

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const filters = reactive({
  id: null,
  created_from: null,
  created_to: null,
  status: null,
  title: null,
  nickname: null,
  review: null,
  visibility: null,
  type: null,
  product: null,
  sku: null,
  customer_id: null,
});

const allColumns = [
  {
    title: "ID",
    key: "review_id",
    dataIndex: "review_id",
    width: 60,
    sorter: true,
  },
  {
    title: "Created",
    key: "created_at",
    dataIndex: "created_at",
    width: 140,
    sorter: true,
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status_name",
    width: 90,
    sorter: true,
  },
  {
    title: "Title",
    key: "title",
    dataIndex: "title",
    width: 120,
    sorter: true,
  },
  {
    title: "Nickname",
    key: "nickname",
    dataIndex: "nickname",
    width: 100,
    sorter: true,
  },
  {
    title: "Review",
    key: "review",
    dataIndex: "detail",
    sorter: true,
  },
  {
    title: "Visibility",
    key: "visibility",
    dataIndex: "store_names",
    width: 120,
    sorter: true,
  },
  {
    title: "Type",
    key: "type",
    dataIndex: "type",
    width: 80,
    sorter: true,
  },
  {
    title: "Product",
    key: "product",
    dataIndex: "product_name",
    width: 150,
    sorter: true,
  },
  {
    title: "SKU",
    key: "sku",
    dataIndex: "sku",
    width: 90,
    sorter: true,
  },
  {
    title: "Action",
    key: "action",
    width: 70,
  },
];

const visibleColumnKeys = ref(allColumns.map((c) => c.key));

const columns = computed(() => {
  return allColumns.filter((c) => visibleColumnKeys.value.includes(c.key));
});

const rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
  },
};

const customRow = (record) => {
  return {
    onClick: (event) => {
      // Prevent navigation when clicking on checkbox or action links
      const isCheckbox =
        event.target.closest(".ant-checkbox-wrapper") ||
        event.target.type === "checkbox";
      const isAction =
        event.target.closest("a") || event.target.tagName === "A";

      if (!isCheckbox && !isAction) {
        handleEdit(record);
      }
    },
    style: {
      cursor: "pointer",
    },
  };
};

const formatDate = (date) => {
  return dayjs(date).format("MMM D, YYYY, h:mm:ss A");
};

const truncateText = (text, wordLimit) => {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return text;
};

const fetchStores = async () => {
  try {
    const response = await fetch("/api/stores");
    stores.value = await response.json();
  } catch (error) {
    console.error("Failed to fetch stores:", error);
  }
};

const fetchReviews = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });

    if (filters.id) params.append("id", filters.id);
    if (filters.status) params.append("status", filters.status);
    if (filters.created_from)
      params.append("created_from", filters.created_from);
    if (filters.created_to) params.append("created_to", filters.created_to);
    if (filters.title) params.append("title", filters.title);
    if (filters.nickname) params.append("nickname", filters.nickname);
    if (filters.review) params.append("review", filters.review);
    if (filters.visibility) params.append("visibility", filters.visibility);
    if (filters.type) params.append("type", filters.type);
    if (filters.product) params.append("product", filters.product);
    if (filters.sku) params.append("sku", filters.sku);
    if (filters.customer_id) params.append("customer_id", filters.customer_id);

    if (sortState.field && sortState.order) {
      params.append("sortField", sortState.field);
      params.append("sortOrder", sortState.order);
    }

    const response = await fetch(`/api/reviews?${params}`);
    const data = await response.json();

    reviews.value = data.items || [];
    pagination.total = data.total || 0;

    // Apply temporary updates if any
    if (props.initialFilters && props.initialFilters.tempUpdate) {
      const temp = props.initialFilters.tempUpdate;
      const index = reviews.value.findIndex(
        (r) => r.review_id === temp.review_id
      );
      if (index !== -1) {
        const statusMap = { 1: "Approved", 2: "Pending", 3: "Not Approved" };
        reviews.value[index] = {
          ...reviews.value[index],
          nickname: temp.nickname,
          title: temp.title,
          detail: temp.detail,
          status_name:
            statusMap[temp.status_id] || reviews.value[index].status_name,
        };
      }
    }

    // Apply temporary delete
    if (deletedIds.value.length > 0) {
      console.log("Filtering deletedIds:", deletedIds.value);
      reviews.value = reviews.value.filter(
        (r) => !deletedIds.value.includes(r.review_id)
      );
    }
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag, filters, sorter) => {
  if (sorter.field) {
    sortState.field = sorter.field;
    sortState.order = sorter.order;
  } else {
    sortState.field = null;
    sortState.order = null;
  }
  fetchReviews();
};

const handleSearch = () => {
  pagination.current = 1;
  fetchReviews();
};

const handleResetFilter = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = null;
  });
  pagination.current = 1;
  fetchReviews();
};

const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchReviews();
};

const handlePageSizeChange = () => {
  pagination.current = 1;
  fetchReviews();
};

const emit = defineEmits(["navigate"]);

const deletedIds = ref([]);
const targetStatus = ref(undefined);

const handleBulkSubmit = () => {
  if (!bulkAction.value) {
    message.warning("Please select an action");
    return;
  }
  if (selectedRowKeys.value.length === 0) {
    message.warning("Please select items");
    return;
  }

  if (bulkAction.value === "delete") {
    // Add selected IDs to deletedIds
    const newDeletedIds = selectedRowKeys.value.filter(
      (id) => !deletedIds.value.includes(id)
    );
    deletedIds.value = [...deletedIds.value, ...newDeletedIds];

    // Update the local list immediately
    reviews.value = reviews.value.filter(
      (r) => !deletedIds.value.includes(r.review_id)
    );

    // Clear selection
    selectedRowKeys.value = [];
    message.success(`${newDeletedIds.length} records deleted (mock).`);
  } else if (bulkAction.value === "update_status") {
    if (!targetStatus.value) {
      message.warning("Please select a status");
      return;
    }

    const statusMap = { Approved: 1, Pending: 2, "Not Approved": 3 };
    const newStatusId = statusMap[targetStatus.value];
    const newStatusName = targetStatus.value;

    // Update local list immediately
    reviews.value = reviews.value.map((r) => {
      if (selectedRowKeys.value.includes(r.review_id)) {
        return {
          ...r,
          status_id: newStatusId,
          status_name: newStatusName,
        };
      }
      return r;
    });

    // Clear selection
    selectedRowKeys.value = [];
    targetStatus.value = undefined;
    bulkAction.value = undefined;
    message.success("Status updated (mock).");
  } else {
    message.info("Action not implemented for this demo");
  }
};

const handleEdit = (record) => {
  console.log("Edit review:", record.review_id);
  emit("navigate", "marketing_review_edit", {
    id: record.review_id,
    sourcePage: "marketing_all_reviews",
    savedState: {
      ...filters,
      page: pagination.current,
      pageSize: pagination.pageSize,
      deletedIds: deletedIds.value,
    },
  });
};

onMounted(() => {
  if (props.initialFilters) {
    const {
      page,
      pageSize,
      tempUpdate,
      deletedIds: initialDeletedIds,
      ...rest
    } = props.initialFilters;
    Object.assign(filters, rest);
    if (page) pagination.current = page;
    if (pageSize) pagination.pageSize = pageSize;
    if (initialDeletedIds) {
      deletedIds.value = initialDeletedIds;
    }
  }
  fetchStores();
  fetchReviews();
});
</script>

<style scoped>
.all-reviews {
  padding: 24px;
}

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
</style>
