<template>
  <div class="sales-order-view" v-if="order">
    <div class="page-header">
      <div class="header-left">
        <a-button @click="$emit('back')" style="margin-right: 16px">
          <arrow-left-outlined /> Back
        </a-button>
        <h1 class="page-title">#{{ order.increment_id }}</h1>
      </div>
      <div class="header-actions">
        <a-button>Send Email</a-button>
        <a-button>Hold</a-button>
        <a-button>Invoice</a-button>
        <a-button>Ship</a-button>
        <a-button>Reorder</a-button>
        <a-button
          type="primary"
          style="background: #eb5202; border-color: #eb5202"
          >Edit</a-button
        >
      </div>
    </div>

    <div class="content-layout">
      <!-- Left Sidebar -->
      <div class="sidebar">
        <a-menu mode="inline" :selectedKeys="['information']">
          <a-menu-item key="information">Information</a-menu-item>
          <a-menu-item key="invoices">Invoices</a-menu-item>
          <a-menu-item key="credit_memos">Credit Memos</a-menu-item>
          <a-menu-item key="shipments">Shipments</a-menu-item>
          <a-menu-item key="comments">Comments History</a-menu-item>
        </a-menu>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Order & Account Information -->
        <div class="section-title">Order & Account Information</div>
        <div class="info-grid">
          <div class="info-box">
            <h3>
              Order # {{ order.increment_id }} (The order confirmation email was
              sent)
            </h3>
            <div class="info-row">
              <span class="label">Order Date</span>
              <span class="value">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Order Status</span>
              <span class="value">{{ order.status }}</span>
            </div>
            <div class="info-row">
              <span class="label">Purchased From</span>
              <span class="value">{{ order.store_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Placed from IP</span>
              <span class="value">{{ order.remote_ip }}</span>
            </div>
          </div>
          <div class="info-box">
            <h3>Account Information <a href="#">Edit Customer</a></h3>
            <div class="info-row">
              <span class="label">Customer Name</span>
              <span class="value"
                >{{ order.customer_firstname }}
                {{ order.customer_lastname }}</span
              >
            </div>
            <div class="info-row">
              <span class="label">Email</span>
              <span class="value"
                ><a :href="'mailto:' + order.customer_email">{{
                  order.customer_email
                }}</a></span
              >
            </div>
            <div class="info-row">
              <span class="label">Customer Group</span>
              <span class="value">General</span>
              <!-- Assuming General for now -->
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div class="section-title">Address Information</div>
        <div class="info-grid">
          <div class="info-box">
            <h3>
              Billing Address
              <a href="#" @click.prevent="startEditingBillingAddress">Edit</a>
            </h3>
            <div v-if="editingBillingAddress">
              <a-form
                layout="vertical"
                :model="billingAddressForm"
                @finish="saveBillingAddress"
              >
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="First Name">
                      <a-input v-model:value="billingAddressForm.firstname" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="Last Name">
                      <a-input v-model:value="billingAddressForm.lastname" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="Street">
                  <a-input v-model:value="billingAddressForm.street" />
                </a-form-item>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="City">
                      <a-input v-model:value="billingAddressForm.city" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="Region">
                      <a-input v-model:value="billingAddressForm.region" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="Postcode">
                      <a-input v-model:value="billingAddressForm.postcode" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="Country">
                      <a-input v-model:value="billingAddressForm.country_id" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="Telephone">
                  <a-input v-model:value="billingAddressForm.telephone" />
                </a-form-item>
                <div style="text-align: right">
                  <a-button
                    size="small"
                    style="margin-right: 8px"
                    @click="cancelEditingBillingAddress"
                    >Cancel</a-button
                  >
                  <a-button
                    type="primary"
                    size="small"
                    @click="saveBillingAddress"
                    >Save</a-button
                  >
                </div>
              </a-form>
            </div>
            <div v-else-if="order.billing_address">
              {{ order.billing_address.firstname }}
              {{ order.billing_address.lastname }}<br />
              {{ order.billing_address.street }}<br />
              {{ order.billing_address.city }},
              {{ order.billing_address.region }},
              {{ order.billing_address.postcode }}<br />
              {{ order.billing_address.country_id }}<br />
              T: {{ order.billing_address.telephone }}
            </div>
          </div>
          <div class="info-box">
            <h3>
              Shipping Address
              <a href="#" @click.prevent="startEditingShippingAddress">Edit</a>
            </h3>
            <div v-if="editingShippingAddress">
              <a-form
                layout="vertical"
                :model="shippingAddressForm"
                @finish="saveShippingAddress"
              >
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="First Name">
                      <a-input v-model:value="shippingAddressForm.firstname" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="Last Name">
                      <a-input v-model:value="shippingAddressForm.lastname" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="Street">
                  <a-input v-model:value="shippingAddressForm.street" />
                </a-form-item>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="City">
                      <a-input v-model:value="shippingAddressForm.city" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="Region">
                      <a-input v-model:value="shippingAddressForm.region" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item label="Postcode">
                      <a-input v-model:value="shippingAddressForm.postcode" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="Country">
                      <a-input v-model:value="shippingAddressForm.country_id" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="Telephone">
                  <a-input v-model:value="shippingAddressForm.telephone" />
                </a-form-item>
                <div style="text-align: right">
                  <a-button
                    size="small"
                    style="margin-right: 8px"
                    @click="cancelEditingShippingAddress"
                    >Cancel</a-button
                  >
                  <a-button
                    type="primary"
                    size="small"
                    @click="saveShippingAddress"
                    >Save</a-button
                  >
                </div>
              </a-form>
            </div>
            <div v-else-if="order.shipping_address">
              {{ order.shipping_address.firstname }}
              {{ order.shipping_address.lastname }}<br />
              {{ order.shipping_address.street }}<br />
              {{ order.shipping_address.city }},
              {{ order.shipping_address.region }},
              {{ order.shipping_address.postcode }}<br />
              {{ order.shipping_address.country_id }}<br />
              T: {{ order.shipping_address.telephone }}
            </div>
          </div>
        </div>

        <!-- Payment & Shipping Method -->
        <div class="section-title">Payment & Shipping Method</div>
        <div class="info-grid">
          <div class="info-box">
            <h3>Payment Information</h3>
            <div>{{ order.payment?.method || "Check / Money order" }}</div>
            <div>
              The order was placed using {{ order.order_currency_code }}.
            </div>
          </div>
          <div class="info-box">
            <h3>Shipping & Handling Information</h3>
            <div style="margin-bottom: 16px">
              {{ order.shipping_description }} ${{
                formatPrice(order.shipping_amount)
              }}
            </div>

            <div class="tracking-section">
              <div
                v-if="trackingNumbers.length > 0"
                class="tracking-table-header"
              >
                <div style="flex: 2">Carrier</div>
                <div style="flex: 2">Title</div>
                <div style="flex: 2">Number</div>
                <div style="flex: 0.5; text-align: center">Action</div>
              </div>
              <div
                v-for="(track, index) in trackingNumbers"
                :key="index"
                class="tracking-row"
              >
                <div style="flex: 2">
                  <a-select
                    v-model:value="track.carrier"
                    style="width: 100%"
                    :options="carriers"
                  />
                </div>
                <div style="flex: 2">
                  <a-input v-model:value="track.title" />
                </div>
                <div style="flex: 2">
                  <a-input v-model:value="track.number" />
                </div>
                <div style="flex: 0.5; text-align: center">
                  <a-button type="text" @click="removeTrackingNumber(index)">
                    <delete-outlined />
                  </a-button>
                </div>
              </div>
              <a-button style="margin-top: 8px" @click="addTrackingNumber"
                >Add Tracking Number</a-button
              >
            </div>
          </div>
        </div>

        <!-- Items Ordered -->
        <div class="section-title">Items Ordered</div>
        <a-table
          :columns="itemColumns"
          :data-source="order.items"
          :pagination="false"
          row-key="item_id"
          bordered
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template
              v-if="
                [
                  'original_price',
                  'price',
                  'row_total',
                  'tax_amount',
                  'discount_amount',
                ].includes(column.key)
              "
            >
              {{ formatCurrency(record[column.key]) }}
            </template>
            <template v-if="column.key === 'product'">
              <div>{{ record.name }}</div>
              <div style="color: #666; font-size: 12px">
                SKU: {{ record.sku }}
              </div>
            </template>
          </template>
        </a-table>

        <!-- Order Total -->
        <div class="section-title">Order Total</div>
        <div class="totals-layout">
          <div class="notes-section">
            <h3>Notes for this Order</h3>
            <a-form layout="vertical">
              <a-form-item label="Status">
                <a-select
                  v-model:value="statusForm.status"
                  style="width: 200px"
                >
                  <a-select-option value="pending">Pending</a-select-option>
                  <a-select-option value="processing"
                    >Processing</a-select-option
                  >
                  <a-select-option value="complete">Complete</a-select-option>
                  <a-select-option value="closed">Closed</a-select-option>
                  <a-select-option value="canceled">Canceled</a-select-option>
                  <a-select-option value="holded">On Hold</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="Comment">
                <a-textarea v-model:value="statusForm.comment" :rows="4" />
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="statusForm.notify"
                  >Notify Customer by Email</a-checkbox
                >
              </a-form-item>
              <a-form-item>
                <a-checkbox v-model:checked="statusForm.visible"
                  >Visible on Storefront</a-checkbox
                >
              </a-form-item>
              <a-button
                type="primary"
                @click="submitStatusUpdate"
                :loading="submitting"
                >Submit Comment</a-button
              >
            </a-form>

            <div
              v-if="allComments.length > 0"
              class="comments-history"
              style="
                margin-top: 24px;
                border-top: 1px solid #eee;
                padding-top: 16px;
              "
            >
              <h4 style="font-weight: 600; margin-bottom: 12px">
                Comments History
              </h4>
              <ul style="list-style: none; padding: 0">
                <li
                  v-for="(comment, index) in allComments"
                  :key="index"
                  style="
                    margin-bottom: 12px;
                    border-bottom: 1px dashed #f0f0f0;
                    padding-bottom: 8px;
                  "
                >
                  <div
                    style="
                      font-weight: 600;
                      margin-bottom: 4px;
                      font-size: 13px;
                    "
                  >
                    {{ formatDate(comment.created_at) }}
                    <span style="margin: 0 8px; color: #ccc">|</span>
                    Status: {{ comment.status }}
                    <span
                      v-if="comment.is_customer_notified"
                      style="color: green; font-size: 12px; margin-left: 8px"
                      >Customer Notified</span
                    >
                  </div>
                  <div style="font-size: 13px; color: #333">
                    {{ comment.comment }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="totals-section">
            <h3>Order Totals</h3>
            <div class="total-row">
              <span class="label">Subtotal</span>
              <span class="value">{{ formatCurrency(order.subtotal) }}</span>
            </div>
            <div class="total-row">
              <span class="label">Discount</span>
              <span class="value">{{
                formatCurrency(order.discount_amount)
              }}</span>
            </div>
            <div class="total-row">
              <span class="label">Shipping & Handling</span>
              <span class="value">{{
                formatCurrency(order.shipping_amount)
              }}</span>
            </div>
            <div class="total-row grand-total">
              <span class="label">Grand Total</span>
              <span class="value">{{ formatCurrency(order.grand_total) }}</span>
            </div>
            <div class="total-row">
              <span class="label">Total Paid</span>
              <span class="value">{{ formatCurrency(order.total_paid) }}</span>
            </div>
            <div class="total-row">
              <span class="label">Total Refunded</span>
              <span class="value">{{
                formatCurrency(order.total_refunded)
              }}</span>
            </div>
            <div class="total-row grand-total">
              <span class="label">Total Due</span>
              <span class="value">{{ formatCurrency(order.total_due) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="loading" style="padding: 50px; text-align: center">
    <a-spin size="large" />
  </div>
  <div v-else style="padding: 50px; text-align: center">Order not found</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import axios from "axios";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["back"]);

const loading = ref(true);
const submitting = ref(false);
const order = ref(null);
const localComments = ref([]);

const allComments = computed(() => {
  const backendComments = order.value?.status_history || [];
  return [...localComments.value, ...backendComments];
});

const editingBillingAddress = ref(false);
const billingAddressForm = reactive({
  firstname: "",
  lastname: "",
  street: "",
  city: "",
  region: "",
  postcode: "",
  country_id: "",
  telephone: "",
});

const startEditingBillingAddress = () => {
  if (order.value && order.value.billing_address) {
    Object.assign(billingAddressForm, order.value.billing_address);
    editingBillingAddress.value = true;
  }
};

const cancelEditingBillingAddress = () => {
  editingBillingAddress.value = false;
};

const saveBillingAddress = () => {
  if (order.value) {
    order.value.billing_address = {
      ...order.value.billing_address,
      ...billingAddressForm,
    };
    message.success("Billing address updated (mock)");
    editingBillingAddress.value = false;
  }
};

const editingShippingAddress = ref(false);
const shippingAddressForm = reactive({
  firstname: "",
  lastname: "",
  street: "",
  city: "",
  region: "",
  postcode: "",
  country_id: "",
  telephone: "",
});

const startEditingShippingAddress = () => {
  if (order.value && order.value.shipping_address) {
    Object.assign(shippingAddressForm, order.value.shipping_address);
    editingShippingAddress.value = true;
  }
};

const cancelEditingShippingAddress = () => {
  editingShippingAddress.value = false;
};

const saveShippingAddress = () => {
  if (order.value) {
    order.value.shipping_address = {
      ...order.value.shipping_address,
      ...shippingAddressForm,
    };
    message.success("Shipping address updated (mock)");
    editingShippingAddress.value = false;
  }
};

const trackingNumbers = ref([]);
const carriers = [
  { value: "custom", label: "Custom Value" },
  { value: "dhl", label: "DHL" },
  { value: "fedex", label: "Federal Express" },
  { value: "ups", label: "United Parcel Service" },
  { value: "usps", label: "United States Postal Service" },
];

const addTrackingNumber = () => {
  trackingNumbers.value.push({
    carrier: "custom",
    title: "",
    number: "",
  });
};

const removeTrackingNumber = (index) => {
  trackingNumbers.value.splice(index, 1);
};

const statusForm = reactive({
  status: "",
  comment: "",
  notify: false,
  visible: false,
});

const itemColumns = [
  { title: "Product", key: "product", dataIndex: "name" },
  {
    title: "Item Status",
    key: "status",
    dataIndex: "status_id",
    customRender: () => "Ordered",
  }, // Simplified
  {
    title: "Original Price",
    key: "original_price",
    dataIndex: "original_price",
    align: "right",
  },
  { title: "Price", key: "price", dataIndex: "price", align: "right" },
  { title: "Qty", key: "qty", dataIndex: "qty_ordered", align: "center" },
  {
    title: "Subtotal",
    key: "subtotal",
    dataIndex: "row_total",
    align: "right",
  },
  {
    title: "Tax Amount",
    key: "tax_amount",
    dataIndex: "tax_amount",
    align: "right",
  },
  {
    title: "Discount Amount",
    key: "discount_amount",
    dataIndex: "discount_amount",
    align: "right",
  },
  {
    title: "Row Total",
    key: "row_total",
    dataIndex: "row_total",
    align: "right",
  },
];

const formatDate = (date) => {
  return dayjs(date).format("MMM D, YYYY, h:mm:ss A");
};

const formatPrice = (value) => {
  return parseFloat(value || 0).toFixed(2);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
};

const fetchOrder = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `/api/sales/orders/${props.orderId}`
    );
    order.value = response.data;
    statusForm.status = order.value.status;
  } catch (error) {
    console.error("Error fetching order:", error);
    message.error("Failed to load order details");
  } finally {
    loading.value = false;
  }
};

const submitStatusUpdate = async () => {
  submitting.value = true;
  try {
    // MOCK ONLY: Comment out actual API call to keep changes temporary
    /*
    await axios.post(
      `/api/sales/orders/${props.orderId}/status`,
      statusForm
    );
    */

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    message.success("Order status updated successfully (Mock)");

    localComments.value.unshift({
      created_at: new Date(),
      status: statusForm.status,
      comment: statusForm.comment,
      is_customer_notified: statusForm.notify,
    });

    // await fetchOrder(); // No need to fetch as we are mocking
    statusForm.comment = ""; // Clear comment
  } catch (error) {
    console.error("Error updating status:", error);
    message.error("Failed to update order status");
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchOrder();
});
</script>

<style scoped>
.sales-order-view {
  background: #f4f5f7;
  min-height: 100vh;
  padding-bottom: 50px;
}

.page-header {
  background: #fff;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e3e3e3;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 300;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.content-layout {
  display: flex;
  padding: 0 24px;
  gap: 24px;
}

.sidebar {
  width: 200px;
  background: #fff;
  border: 1px solid #d9d9d9;
}

.main-content {
  flex: 1;
}

.section-title {
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 16px;
  margin-top: 24px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.section-title:first-child {
  margin-top: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.info-box {
  background: #fff;
  padding: 20px;
  border: 1px solid #d9d9d9;
}

.info-box h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-row .label {
  font-weight: 600;
  color: #303030;
}

.tracking-section {
  background: #f9f9f9;
  padding: 16px;
  border: 1px solid #eee;
}

.tracking-table-header {
  display: flex;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
}

.tracking-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.totals-layout {
  display: flex;
  gap: 24px;
}

.notes-section {
  flex: 1;
  background: #fff;
  padding: 20px;
  border: 1px solid #d9d9d9;
}

.totals-section {
  width: 400px;
  background: #fff;
  padding: 20px;
  border: 1px solid #d9d9d9;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
}

.total-row.grand-total {
  font-weight: bold;
  font-size: 16px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}
</style>
