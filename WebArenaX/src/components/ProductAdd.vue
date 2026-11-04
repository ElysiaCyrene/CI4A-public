<template>
  <div class="product-add">
    <div class="page-header">
      <div class="header-left">
        <a-button @click="goBack" class="back-button">
          <arrow-left-outlined /> Back
        </a-button>
        <h1 class="page-title">New Product</h1>
      </div>
      <div class="header-right">
        <a-button class="action-button" @click="handleAddAttributeClick"
          >Add Attribute</a-button
        >
        <a-button type="primary" class="save-button" @click="saveProduct">
          Save <down-outlined />
        </a-button>
      </div>
    </div>

    <a-modal
      v-model:visible="showAddAttributeModal"
      title="Add New Attribute"
      @ok="confirmAddAttribute"
    >
      <a-form layout="vertical">
        <a-form-item label="Attribute Name" required>
          <a-input v-model:value="newAttributeName" />
        </a-form-item>
      </a-form>
    </a-modal>

    <div class="scope-switcher">
      <span>Scope: </span>
      <a-select default-value="all_store_views" style="width: 200px">
        <a-select-option value="all_store_views"
          >All Store Views</a-select-option
        >
      </a-select>
      <question-circle-outlined style="margin-left: 8px; color: #999" />
    </div>

    <a-form layout="vertical" :model="product" @finish="saveProduct">
      <div class="form-section">
        <!-- Custom Attributes Table -->
        <div v-if="customAttributes.length > 0" style="margin-bottom: 24px">
          <h3>Additional Attributes</h3>
          <a-table
            :data-source="customAttributes"
            :pagination="false"
            row-key="name"
            bordered
          >
            <a-table-column title="Attribute" data-index="name" key="name" />
            <a-table-column title="Value" key="value">
              <template #default="{ record }">
                <a-input v-model:value="record.value" />
              </template>
            </a-table-column>
            <a-table-column title="Action" key="action" width="100px">
              <template #default="{ index }">
                <a-button type="text" danger @click="removeAttribute(index)">
                  <delete-outlined />
                </a-button>
              </template>
            </a-table-column>
          </a-table>
        </div>

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
          <a-select v-model:value="product.attribute_set_id">
            <a-select-option :value="4">Default</a-select-option>
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
              (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            "
            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            style="width: 200px"
          />
          <div class="advanced-inventory-link">Advanced Pricing</div>
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
          <a-select v-model:value="product.stock_status" style="width: 200px">
            <a-select-option value="In Stock">In Stock</a-select-option>
            <a-select-option value="Out of Stock">Out of Stock</a-select-option>
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

        <a-form-item label="Categories">
          <a-select
            v-model:value="product.categories"
            mode="multiple"
            placeholder="Select..."
            style="width: calc(100% - 120px)"
          >
            <!-- Mock Categories -->
            <a-select-option value="2">Default Category</a-select-option>
            <a-select-option value="3">Gear</a-select-option>
            <a-select-option value="4">Bags</a-select-option>
          </a-select>
          <a-button
            style="
              margin-left: 8px;
              background: #514943;
              color: #fff;
              border: none;
            "
            >New Category</a-button
          >
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
            placeholder="Select..."
          >
            <a-select-option value="US">United States</a-select-option>
            <a-select-option value="CN">China</a-select-option>
          </a-select>
        </a-form-item>
      </div>

      <!-- Collapsible Sections -->
      <a-collapse v-model:activeKey="activeSections" :bordered="false" ghost>
        <a-collapse-panel key="content" header="Content">
          <a-form-item label="Description">
            <a-textarea v-model:value="product.description" :rows="4" />
          </a-form-item>
          <a-form-item label="Short Description">
            <a-textarea v-model:value="product.short_description" :rows="2" />
          </a-form-item>
        </a-collapse-panel>

        <a-collapse-panel key="configurations" header="Configurations">
          <div class="configurations-section">
            <p>
              Configurable products allow customers to choose options (Ex: shirt
              color). You need to create a simple product for each configuration
              (Ex: a product for each color).
            </p>
            <a-button
              size="small"
              style="background: #514943; color: #fff; border: none"
              >Create Configurations</a-button
            >
          </div>
        </a-collapse-panel>

        <a-collapse-panel key="images" header="Images And Videos">
          <div class="image-uploader">
            <div class="upload-placeholder">
              <camera-outlined style="font-size: 32px; color: #ccc" />
              <span>Browse to find or drag image here</span>
            </div>
          </div>
        </a-collapse-panel>

        <a-collapse-panel key="seo" header="Search Engine Optimization">
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
            <a-textarea v-model:value="product.meta_description" :rows="3" />
          </a-form-item>
        </a-collapse-panel>

        <a-collapse-panel
          key="related"
          header="Related Products, Up-Sells, and Cross-Sells"
        >
        </a-collapse-panel>
        <a-collapse-panel key="customizable" header="Customizable Options">
        </a-collapse-panel>
        <a-collapse-panel key="websites" header="Product in Websites">
        </a-collapse-panel>
        <a-collapse-panel key="design" header="Design"> </a-collapse-panel>
        <a-collapse-panel key="schedule_design" header="Schedule Design Update">
        </a-collapse-panel>
        <a-collapse-panel key="gift_options" header="Gift Options">
        </a-collapse-panel>
        <a-collapse-panel key="downloadable" header="Downloadable Information">
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import {
  ArrowLeftOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  CameraOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const emit = defineEmits(["navigate"]);

const product = reactive({
  status: 1,
  attribute_set_id: 4,
  name: "",
  sku: "",
  price: null,
  tax_class_id: 2,
  quantity: null,
  stock_status: "In Stock",
  weight: null,
  visibility: "Catalog, Search",
  categories: [],
  news_from_date: [],
  country_of_manufacture: undefined,
  description: "",
  short_description: "",
  url_key: "",
  meta_title: "",
  meta_keyword: "",
  meta_description: "",
});

const customAttributes = ref([]);
const showAddAttributeModal = ref(false);
const newAttributeName = ref("");

const handleAddAttributeClick = () => {
  showAddAttributeModal.value = true;
  newAttributeName.value = "";
};

const confirmAddAttribute = () => {
  const name = newAttributeName.value.trim();
  if (!name) {
    message.error("Please enter attribute name");
    return;
  }

  // Check if attribute already exists in standard product fields
  if (Object.keys(product).includes(name)) {
    message.error(
      `The attribute "${name}" already exists in the standard form.`
    );
    return;
  }

  // Check if attribute already exists in custom attributes
  if (customAttributes.value.some((attr) => attr.name === name)) {
    message.error(`The attribute "${name}" has already been added.`);
    return;
  }

  customAttributes.value.push({
    name: name,
    value: "",
  });
  showAddAttributeModal.value = false;
};

const removeAttribute = (index) => {
  customAttributes.value.splice(index, 1);
};

const activeSections = ref([
  "content",
  "configurations",
  "images",
  "seo",
  "related",
  "customizable",
  "websites",
  "design",
  "schedule_design",
  "gift_options",
  "downloadable",
]);

const goBack = () => {
  emit("navigate", "catalog_products");
};

const saveProduct = () => {
  // Mock payload for new product
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
    entity_id: Date.now(), // Temporary ID
    ...product,
    status: product.status, // Keep as integer 1 or 2
    type_id: "simple",
    attribute_set_id: 4,
    visibility: 4, // Catalog, Search
    qty: 0, // Default for mock
    custom_attributes: customAttributes.value,
    thumbnail: null, // No image for mock
  };

  // Ensure API gets numeric stock_status
  if (
    product.stock_status &&
    stockStatusMap[product.stock_status] !== undefined
  ) {
    payload.stock_status = stockStatusMap[product.stock_status];
  }

  // Ensure API gets numeric visibility
  if (product.visibility && visibilityMap[product.visibility] !== undefined) {
    payload.visibility = visibilityMap[product.visibility];
  }

  console.log("Saving new product (mock):", payload);
  message.loading({ content: "Saving...", key: "save" });

  setTimeout(() => {
    message.success({ content: "You saved the product.", key: "save" });
    emit("navigate", "catalog_products", { tempUpdate: payload });
  }, 1000);
};
</script>

<style scoped>
.product-add {
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

.configurations-section {
  background: #fcfcfc;
  padding: 20px;
  border: 1px solid #e3e3e3;
}
</style>
