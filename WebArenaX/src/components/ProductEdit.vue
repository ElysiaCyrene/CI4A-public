<template>
  <div class="product-edit">
    <div class="page-header">
      <div class="header-left">
        <a-button @click="goBack" class="back-button">
          <arrow-left-outlined /> Back
        </a-button>
        <h1 class="page-title">{{ product.name || "Edit Product" }}</h1>
      </div>
      <div class="header-right">
        <a-button class="action-button">Add Attribute</a-button>
        <a-button type="primary" class="save-button" @click="saveProduct">
          Save <down-outlined />
        </a-button>
      </div>
    </div>

    <div class="scope-switcher">
      <span>Scope: </span>
      <a-select default-value="all_store_views" style="width: 200px">
        <a-select-option value="all_store_views"
          >All Store Views</a-select-option
        >
      </a-select>
      <question-circle-outlined style="margin-left: 8px; color: #999" />
    </div>

    <a-spin :spinning="loading">
      <div class="page-content-wrapper">
        <div class="main-content">
          <a-form layout="vertical" :model="product" @finish="saveProduct">
            <div id="basic-settings" class="form-section">
              <div class="enable-product-switch">
                <a-form-item label="Enable Product">
                  <a-switch
                    v-model:checked="product.status"
                    :checked-value="1"
                    :un-checked-value="2"
                  />
                </a-form-item>
              </div>

              <a-form-item label="Attribute Set">
                <a-select v-model:value="product.attribute_set_id" disabled>
                  <a-select-option :value="product.attribute_set_id"
                    >Default</a-select-option
                  >
                </a-select>
              </a-form-item>

              <a-form-item label="Product Name" required>
                <a-input v-model:value="product.name" />
              </a-form-item>

              <a-form-item label="SKU" required>
                <a-input v-model:value="product.sku" />
              </a-form-item>

              <a-form-item label="Price" required>
                <a-input-number
                  v-model:value="product.price"
                  :formatter="
                    (value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  "
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  style="width: 200px"
                />
              </a-form-item>

              <a-form-item label="Tax Class">
                <a-select v-model:value="product.tax_class_id">
                  <a-select-option :value="0">None</a-select-option>
                  <a-select-option :value="2">Taxable Goods</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="Quantity">
                <a-input-number
                  v-model:value="product.quantity"
                  style="width: 200px"
                />
                <div class="advanced-inventory-link">Advanced Inventory</div>
              </a-form-item>

              <a-form-item label="Stock Status">
                <a-select
                  v-model:value="product.stock_status"
                  style="width: 200px"
                >
                  <a-select-option value="In Stock">In Stock</a-select-option>
                  <a-select-option value="Out of Stock"
                    >Out of Stock</a-select-option
                  >
                </a-select>
              </a-form-item>

              <a-form-item label="Weight">
                <a-input-group compact>
                  <a-input-number
                    v-model:value="product.weight"
                    style="width: 120px"
                  />
                  <a-select default-value="lbs" style="width: 80px">
                    <a-select-option value="lbs">lbs</a-select-option>
                    <a-select-option value="kgs">kgs</a-select-option>
                  </a-select>
                  <a-select
                    default-value="has_weight"
                    style="width: 150px; margin-left: 8px"
                  >
                    <a-select-option value="has_weight"
                      >This item has weight</a-select-option
                    >
                    <a-select-option value="no_weight"
                      >This item has no weight</a-select-option
                    >
                  </a-select>
                </a-input-group>
              </a-form-item>

              <a-form-item label="Visibility">
                <a-select v-model:value="product.visibility">
                  <a-select-option value="Not Visible Individually"
                    >Not Visible Individually</a-select-option
                  >
                  <a-select-option value="Catalog">Catalog</a-select-option>
                  <a-select-option value="Search">Search</a-select-option>
                  <a-select-option value="Catalog, Search"
                    >Catalog, Search</a-select-option
                  >
                </a-select>
              </a-form-item>

              <a-form-item label="Set Product as New From">
                <a-range-picker v-model:value="product.news_from_date" />
              </a-form-item>

              <a-form-item label="Country of Manufacture">
                <a-select
                  v-model:value="product.country_of_manufacture"
                  show-search
                >
                  <a-select-option value="US">United States</a-select-option>
                  <a-select-option value="CN">China</a-select-option>
                </a-select>
              </a-form-item>

              <!-- Custom Attributes Section -->
              <a-divider />

              <a-form-item label="Style Bottom">
                <a-select v-model:value="product.style_bottom" mode="multiple">
                  <a-select-option value="104">Base Layer</a-select-option>
                  <a-select-option value="105">Basic</a-select-option>
                  <a-select-option value="106">Capri</a-select-option>
                  <a-select-option value="107">Compression</a-select-option>
                  <a-select-option value="108">Leggings</a-select-option>
                  <a-select-option value="109">Parachute</a-select-option>
                  <a-select-option value="110">Skort</a-select-option>
                  <a-select-option value="111">Snug</a-select-option>
                  <a-select-option value="112">Sweatpants</a-select-option>
                  <a-select-option value="113">Tights</a-select-option>
                  <a-select-option value="114">Track Pants</a-select-option>
                  <a-select-option value="115">Workout Pants</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="Activity">
                <a-select v-model:value="product.activity" mode="multiple">
                  <a-select-option value="4">Hike</a-select-option>
                  <a-select-option value="5">Outdoor</a-select-option>
                  <a-select-option value="6">Running</a-select-option>
                  <a-select-option value="7">Warmup</a-select-option>
                  <a-select-option value="8">Yoga</a-select-option>
                  <a-select-option value="9">Recreation</a-select-option>
                  <a-select-option value="10">Lounge</a-select-option>
                  <a-select-option value="11">Gym</a-select-option>
                  <a-select-option value="12">Climbing</a-select-option>
                  <a-select-option value="13">Crosstraining</a-select-option>
                  <a-select-option value="14">Post-workout</a-select-option>
                  <a-select-option value="15">Cycling</a-select-option>
                  <a-select-option value="16">Athletic</a-select-option>
                  <a-select-option value="17">Sports</a-select-option>
                  <a-select-option value="18">Hiking</a-select-option>
                  <a-select-option value="19">Overnight</a-select-option>
                  <a-select-option value="20">School</a-select-option>
                  <a-select-option value="21">Trail</a-select-option>
                  <a-select-option value="22">Travel</a-select-option>
                  <a-select-option value="23">Urban</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="Material">
                <a-select v-model:value="product.material" mode="multiple">
                  <a-select-option value="31">Burlap</a-select-option>
                  <a-select-option value="32">Canvas</a-select-option>
                  <a-select-option value="33">Cotton</a-select-option>
                  <a-select-option value="34">Faux Leather</a-select-option>
                  <a-select-option value="35">Leather</a-select-option>
                  <a-select-option value="36">Mesh</a-select-option>
                  <a-select-option value="37">Nylon</a-select-option>
                  <a-select-option value="38">Polyester</a-select-option>
                  <a-select-option value="39">Rayon</a-select-option>
                  <a-select-option value="40">Ripstop</a-select-option>
                  <a-select-option value="41">Suede</a-select-option>
                  <a-select-option value="42">Foam</a-select-option>
                  <a-select-option value="43">Metal</a-select-option>
                  <a-select-option value="44">Plastic</a-select-option>
                  <a-select-option value="45">Rubber</a-select-option>
                  <a-select-option value="46">Synthetic</a-select-option>
                  <a-select-option value="47">Stainless Steel</a-select-option>
                  <a-select-option value="48">Silicone</a-select-option>
                  <a-select-option value="142"
                    >Cocona® performance fabric</a-select-option
                  >
                  <a-select-option value="143">Wool</a-select-option>
                  <a-select-option value="144">Fleece</a-select-option>
                  <a-select-option value="145">Hemp</a-select-option>
                  <a-select-option value="146">Jersey</a-select-option>
                  <a-select-option value="147">LumaTech™</a-select-option>
                  <a-select-option value="148">Lycra®</a-select-option>
                  <a-select-option value="149">Microfiber</a-select-option>
                  <a-select-option value="150">Spandex</a-select-option>
                  <a-select-option value="151">HeatTec®</a-select-option>
                  <a-select-option value="152">EverCool™</a-select-option>
                  <a-select-option value="153">Organic Cotton</a-select-option>
                  <a-select-option value="154">TENCEL</a-select-option>
                  <a-select-option value="155">CoolTech™</a-select-option>
                  <a-select-option value="156">Khaki</a-select-option>
                  <a-select-option value="157">Linen</a-select-option>
                  <a-select-option value="158">Wool</a-select-option>
                  <a-select-option value="159">Terry</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="Pattern">
                <a-select v-model:value="product.pattern" mode="multiple">
                  <a-select-option value="192">Color-Blocked</a-select-option>
                  <a-select-option value="193">Checked</a-select-option>
                  <a-select-option value="194">Color-Blocked</a-select-option>
                  <a-select-option value="195">Graphic Print</a-select-option>
                  <a-select-option value="196">Solid</a-select-option>
                  <a-select-option value="197">Solid-Highlight</a-select-option>
                  <a-select-option value="198">Striped</a-select-option>
                  <a-select-option value="199">Camo</a-select-option>
                  <a-select-option value="200">Geometric</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="Climate">
                <a-select v-model:value="product.climate" mode="multiple">
                  <a-select-option value="201">All-Weather</a-select-option>
                  <a-select-option value="202">Cold</a-select-option>
                  <a-select-option value="203">Cool</a-select-option>
                  <a-select-option value="204">Indoor</a-select-option>
                  <a-select-option value="205">Mild</a-select-option>
                  <a-select-option value="206">Rainy</a-select-option>
                  <a-select-option value="207">Spring</a-select-option>
                  <a-select-option value="208">Warm</a-select-option>
                  <a-select-option value="209">Windy</a-select-option>
                  <a-select-option value="210">Wintry</a-select-option>
                  <a-select-option value="211">Hot</a-select-option>
                </a-select>
              </a-form-item>
            </div>

            <!-- Collapsible Sections -->
            <a-collapse
              v-model:activeKey="activeSections"
              :bordered="false"
              ghost
            >
              <a-collapse-panel
                id="section-content"
                key="content"
                header="Content"
              >
                <a-form-item label="Description">
                  <a-textarea v-model:value="product.description" :rows="4" />
                </a-form-item>
                <a-form-item label="Short Description">
                  <a-textarea
                    v-model:value="product.short_description"
                    :rows="2"
                  />
                </a-form-item>
              </a-collapse-panel>

              <a-collapse-panel
                id="section-configurations"
                key="configurations"
                header="Configurations"
              >
                <div class="configurations-section">
                  <p>
                    Configurable products allow customers to choose options (Ex:
                    shirt color). You need to create a simple product for each
                    configuration (Ex: a product for each color).
                  </p>

                  <div style="margin-bottom: 16px; text-align: right">
                    <a-button @click="showConfigModal = true"
                      >Edit Configurations</a-button
                    >
                  </div>

                  <div v-if="configurations.length > 0">
                    <div style="margin-bottom: 10px; font-weight: bold">
                      Current Variations
                    </div>
                    <a-table
                      :columns="configColumns"
                      :data-source="configurations"
                      row-key="sku"
                      :pagination="{ pageSize: 5 }"
                    >
                      <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'image'">
                          <div
                            style="
                              width: 50px;
                              height: 50px;
                              background: #f0f0f0;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            "
                          >
                            <camera-outlined style="color: #ccc" />
                          </div>
                        </template>
                        <template v-if="column.key === 'actions'">
                          <a href="#">Select</a>
                        </template>
                      </template>
                    </a-table>
                  </div>
                </div>
              </a-collapse-panel>

              <a-collapse-panel
                id="section-reviews"
                key="reviews"
                header="Product Reviews"
              >
                <div
                  v-if="reviewsLoading"
                  style="text-align: center; padding: 20px"
                >
                  <a-spin />
                </div>
                <div v-else-if="reviews.length === 0">
                  <p>No reviews found for this product.</p>
                </div>
                <a-table
                  v-else
                  :columns="reviewColumns"
                  :data-source="reviews"
                  row-key="review_id"
                  :pagination="{ pageSize: 5 }"
                  size="small"
                  bordered
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'created_at'">
                      {{ formatDate(record.created_at) }}
                    </template>
                  </template>
                </a-table>
              </a-collapse-panel>

              <a-collapse-panel
                id="section-images"
                key="images"
                header="Images And Videos"
              >
                <div class="image-uploader">
                  <div class="upload-placeholder">
                    <camera-outlined style="font-size: 32px; color: #ccc" />
                    <span>Browse to find or drag image here</span>
                  </div>
                </div>
              </a-collapse-panel>

              <a-collapse-panel
                id="section-seo"
                key="seo"
                header="Search Engine Optimization"
              >
                <a-form-item label="URL Key">
                  <a-input v-model:value="product.url_key" />
                </a-form-item>
                <a-form-item label="Meta Title">
                  <a-input v-model:value="product.meta_title" />
                </a-form-item>
                <a-form-item label="Meta Keywords">
                  <a-textarea v-model:value="product.meta_keyword" :rows="2" />
                </a-form-item>
                <a-form-item label="Meta Description">
                  <a-textarea
                    v-model:value="product.meta_description"
                    :rows="3"
                  />
                </a-form-item>
              </a-collapse-panel>
            </a-collapse>
          </a-form>
        </div>
        <div class="edit-anchor-sidebar">
          <a-anchor :target-offset="150" :bounds="100" :items="anchorItems" />
        </div>
      </div>
    </a-spin>

    <ProductConfigurationsModal
      v-model:visible="showConfigModal"
      :product-name="product.name"
      :product-sku="product.sku"
      :product-price="product.price"
      @generate="handleGenerateConfigurations"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  ArrowLeftOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  CameraOutlined,
} from "@ant-design/icons-vue";
import axios from "axios";
import dayjs from "dayjs";
import ProductConfigurationsModal from "./ProductConfigurationsModal.vue";

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["navigate"]);

const loading = ref(false);
const product = ref({});
const activeSections = ref([
  "content",
  "configurations",
  "images",
  "seo",
  "reviews",
]);

const anchorItems = [
  {
    key: "basic-settings",
    href: "#basic-settings",
    title: "Basic Settings",
  },
  {
    key: "section-content",
    href: "#section-content",
    title: "Content",
  },
  {
    key: "section-configurations",
    href: "#section-configurations",
    title: "Configurations",
  },
  {
    key: "section-reviews",
    href: "#section-reviews",
    title: "Reviews",
  },
  {
    key: "section-images",
    href: "#section-images",
    title: "Images & Videos",
  },
  {
    key: "section-seo",
    href: "#section-seo",
    title: "Search Engine Optimization",
  },
];

const showConfigModal = ref(false);
const configurations = ref([]);
const reviews = ref([]);
const reviewsLoading = ref(false);

const reviewColumns = [
  { title: "ID", dataIndex: "review_id", key: "review_id", width: 80 },
  { title: "Created", dataIndex: "created_at", key: "created_at", width: 140 },
  { title: "Status", dataIndex: "status_name", key: "status_name", width: 100 },
  { title: "Nickname", dataIndex: "nickname", key: "nickname", width: 120 },
  { title: "Review", dataIndex: "detail", key: "detail" },
];

const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("MMM D, YYYY, h:mm:ss A");
};

const fetchReviews = async (productName) => {
  if (!productName) return;
  reviewsLoading.value = true;
  try {
    const params = new URLSearchParams();
    params.append("product", productName);
    const response = await axios.get(
      `/api/reviews?${params}`
    );
    reviews.value = response.data.items || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
  } finally {
    reviewsLoading.value = false;
  }
};

const configColumns = [
  { title: "Image", key: "image", width: 80 },
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "SKU", dataIndex: "sku", key: "sku" },
  { title: "Price", dataIndex: "price", key: "price" },
  { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  { title: "Weight", dataIndex: "weight", key: "weight" },
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "Attributes", dataIndex: "attributes", key: "attributes" },
  { title: "Actions", key: "actions" },
];

const handleGenerateConfigurations = (newProducts) => {
  configurations.value = [...configurations.value, ...newProducts];
};

const goBack = () => {
  emit("navigate", "catalog_products");
};

const saveProduct = () => {
  // Map string values back to numeric codes before saving
  const stockStatusMap = {
    "In Stock": 1,
    "Out of Stock": 0,
  };

  const visibilityMap = {
    "Not Visible Individually": 1,
    Catalog: 2,
    Search: 3,
    "Catalog, Search": 4,
  };

  const payload = {
    ...product.value,
    entity_id: props.productId,
  };

  if (
    payload.stock_status &&
    stockStatusMap[payload.stock_status] !== undefined
  ) {
    payload.stock_status = stockStatusMap[payload.stock_status];
  }

  if (payload.visibility && visibilityMap[payload.visibility] !== undefined) {
    payload.visibility = visibilityMap[payload.visibility];
  }

  console.log("Saving product:", payload);
  // Mock success
  emit("navigate", "catalog_products", {
    updatedData: payload,
  });
};

const fetchProduct = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `/api/catalog/product/${props.productId}`
    );
    product.value = response.data;

    if (product.value.name) {
      fetchReviews(product.value.name);
    }

    // Parse comma-separated values for multi-selects if needed
    if (typeof product.value.style_bottom === "string") {
      product.value.style_bottom = product.value.style_bottom.split(",");
    }
    if (typeof product.value.activity === "string") {
      product.value.activity = product.value.activity.split(",");
    }
    if (typeof product.value.material === "string") {
      product.value.material = product.value.material.split(",");
    }
    if (typeof product.value.pattern === "string") {
      product.value.pattern = product.value.pattern.split(",");
    }
    if (typeof product.value.climate === "string") {
      product.value.climate = product.value.climate.split(",");
    }

    // Normalize numeric enums from API to descriptive strings for UI selects
    const stockStatusInverseMap = {
      1: "In Stock",
      0: "Out of Stock",
    };
    if (
      product.value.stock_status !== undefined &&
      stockStatusInverseMap[product.value.stock_status] !== undefined
    ) {
      product.value.stock_status =
        stockStatusInverseMap[product.value.stock_status];
    }

    const visibilityInverseMap = {
      1: "Not Visible Individually",
      2: "Catalog",
      3: "Search",
      4: "Catalog, Search",
    };
    if (
      product.value.visibility !== undefined &&
      visibilityInverseMap[product.value.visibility] !== undefined
    ) {
      product.value.visibility = visibilityInverseMap[product.value.visibility];
    }

    // Mock existing configurations for demonstration
    configurations.value = [
      {
        name: `${product.value.name}-XS-Black`,
        sku: `${product.value.sku}-XS-Black`,
        price: product.value.price,
        quantity: 100,
        weight: 1,
        status: "Enabled",
        attributes: "Size: XS, Color: Black",
      },
      {
        name: `${product.value.name}-S-Black`,
        sku: `${product.value.sku}-S-Black`,
        price: product.value.price,
        quantity: 85,
        weight: 1,
        status: "Enabled",
        attributes: "Size: S, Color: Black",
      },
    ];
  } catch (error) {
    console.error("Error fetching product:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (props.productId) {
    fetchProduct();
  }
});
</script>

<style scoped>
.product-edit {
  padding: 20px;
  background: #f4f5f7;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid #e3e3e3;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.back-button {
  border: none;
  box-shadow: none;
  padding: 0;
  font-size: 14px;
  color: #666;
}

.header-right {
  display: flex;
  gap: 12px;
}

.save-button {
  background-color: #eb5202;
  border-color: #eb5202;
}

.save-button:hover {
  background-color: #d44902;
  border-color: #d44902;
}

.scope-switcher {
  padding: 10px 24px;
  background: #f4f5f7;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
}

.form-section {
  background: #fff;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #d9d9d9;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.enable-product-switch {
  margin-bottom: 20px;
}

.advanced-inventory-link {
  font-size: 12px;
  color: #007bdb;
  cursor: pointer;
  margin-top: 4px;
}

:deep(.ant-collapse-header) {
  font-weight: 600;
  font-size: 16px;
  padding: 16px 0 !important;
  border-bottom: 1px solid #e3e3e3;
}

:deep(.ant-collapse-content-box) {
  padding: 24px 0 !important;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  padding: 40px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #999;
}

.page-content-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.edit-anchor-sidebar {
  width: 200px;
  flex-shrink: 0;
  padding-top: 24px; /* Align roughly with content start */
}
</style>
