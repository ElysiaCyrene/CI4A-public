<template>
  <a-modal
    :visible="visible"
    title="Create Product Configurations"
    width="1000px"
    @cancel="handleCancel"
    :footer="null"
    class="configurations-modal"
  >
    <div class="steps-container">
      <a-steps :current="currentStep">
        <a-step title="Select Attributes" />
        <a-step title="Attribute Values" />
        <a-step title="Bulk Images & Price" />
        <a-step title="Summary" />
      </a-steps>
    </div>

    <div class="step-content">
      <!-- Step 1: Select Attributes -->
      <div v-if="currentStep === 0">
        <div class="step-header">
          <h3>Step 1: Select Attributes</h3>
          <a-button>Create New Attribute</a-button>
        </div>
        <p>Selected Attributes: {{ selectedAttributes.join(", ") }}</p>

        <div class="attribute-selection">
          <a-checkbox-group
            :value="selectedAttributeKeys"
            @change="onAttributeSelectChange"
            style="width: 100%"
          >
            <div
              v-for="attr in availableAttributes"
              :key="attr.code"
              style="
                margin-bottom: 10px;
                padding: 10px;
                border: 1px solid #f0f0f0;
                border-radius: 4px;
              "
            >
              <a-checkbox :value="attr.code" style="width: 100%">
                <a-row style="width: 100%">
                  <a-col :span="8"
                    ><strong>{{ attr.label }}</strong></a-col
                  >
                  <a-col :span="8" style="color: #666"
                    >Code: {{ attr.code }}</a-col
                  >
                  <a-col :span="8" style="color: #666">Scope: Global</a-col>
                </a-row>
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </div>
      </div>

      <!-- Step 2: Attribute Values -->
      <div v-if="currentStep === 1">
        <div class="step-header">
          <h3>Step 2: Attribute Values</h3>
        </div>
        <p>
          Select values from each attribute to include in this product. Each
          unique combination of values creates a unique product SKU.
        </p>
        <div
          v-for="attr in selectedAttributesData"
          :key="attr.code"
          class="attribute-values-section"
        >
          <h4>{{ attr.label }}</h4>
          <div class="values-grid">
            <a-checkbox-group v-model:value="selectedValues[attr.code]">
              <a-row>
                <a-col :span="6" v-for="opt in attr.options" :key="opt">
                  <a-checkbox :value="opt">{{ opt }}</a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </div>
          <div class="actions">
            <a @click="selectAll(attr.code)">Select All</a>
            <a-divider type="vertical" />
            <a @click="deselectAll(attr.code)">Deselect All</a>
          </div>
        </div>
      </div>

      <!-- Step 3: Bulk Images & Price -->
      <div v-if="currentStep === 2">
        <div class="step-header">
          <h3>Step 3: Bulk Images, Price and Quantity</h3>
        </div>
        <div class="bulk-section">
          <h4>Images</h4>
          <a-radio-group v-model:value="bulkConfig.images">
            <a-radio :value="'single'"
              >Apply single set of images to all SKUs</a-radio
            >
            <a-radio :value="'unique'"
              >Apply unique images by attribute to each SKU</a-radio
            >
            <a-radio :value="'skip'">Skip image uploading at this time</a-radio>
          </a-radio-group>
        </div>
        <div class="bulk-section">
          <h4>Price</h4>
          <a-radio-group v-model:value="bulkConfig.priceType">
            <a-radio :value="'single'">Apply single price to all SKUs</a-radio>
            <a-radio :value="'unique'"
              >Apply unique prices by attribute to each SKU</a-radio
            >
            <a-radio :value="'skip'">Skip price at this time</a-radio>
          </a-radio-group>
          <div
            v-if="bulkConfig.priceType === 'single'"
            style="margin-top: 10px"
          >
            <a-input-number
              v-model:value="bulkConfig.singlePrice"
              prefix="$"
              style="width: 200px"
              placeholder="Price"
            />
          </div>
        </div>
        <div class="bulk-section">
          <h4>Quantity</h4>
          <a-radio-group v-model:value="bulkConfig.qtyType">
            <a-radio :value="'single'"
              >Apply single quantity to each SKUs</a-radio
            >
            <a-radio :value="'unique'"
              >Apply unique quantity by attribute to each SKU</a-radio
            >
            <a-radio :value="'skip'">Skip quantity at this time</a-radio>
          </a-radio-group>
          <div v-if="bulkConfig.qtyType === 'single'" style="margin-top: 10px">
            <a-input-number
              v-model:value="bulkConfig.singleQty"
              style="width: 200px"
              placeholder="Quantity"
            />
          </div>
        </div>
      </div>

      <!-- Step 4: Summary -->
      <div v-if="currentStep === 3">
        <div class="step-header">
          <h3>Step 4: Summary</h3>
        </div>
        <p>Here are the products you're about to create.</p>
        <a-table
          :columns="summaryColumns"
          :data-source="generatedProducts"
          row-key="sku"
          :pagination="{ pageSize: 10 }"
        />
      </div>
    </div>

    <div class="modal-footer">
      <a-button @click="handleCancel">Cancel</a-button>
      <a-button
        v-if="currentStep > 0"
        @click="prevStep"
        style="margin-left: 8px"
        >Back</a-button
      >
      <a-button
        v-if="currentStep < 3"
        type="primary"
        @click="nextStep"
        style="margin-left: 8px"
        >Next</a-button
      >
      <a-button
        v-if="currentStep === 3"
        type="primary"
        @click="handleGenerate"
        style="margin-left: 8px; background: #eb5202; border-color: #eb5202"
        >Generate Products</a-button
      >
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";

const props = defineProps({
  visible: Boolean,
  productName: String,
  productSku: String,
  productPrice: Number,
});

const emit = defineEmits(["update:visible", "generate"]);

const currentStep = ref(0);
const selectedAttributeKeys = ref([]);
const selectedValues = reactive({});
const bulkConfig = reactive({
  images: "skip",
  priceType: "single",
  singlePrice: props.productPrice || 0,
  qtyType: "single",
  singleQty: 100,
});

const availableAttributes = [
  {
    code: "color",
    label: "Color",
    options: [
      "Black",
      "Blue",
      "Brown",
      "Gray",
      "Green",
      "Lavender",
      "Multi",
      "Orange",
      "Purple",
      "Red",
      "White",
      "Yellow",
    ],
  },
  {
    code: "size",
    label: "Size",
    options: ["XS", "S", "M", "L", "XL", "28", "29", "30", "31", "32"],
  },
  { code: "format", label: "Format", options: ["Download", "DVD"] },
];

const attributeColumns = [
  { title: "Attribute Code", dataIndex: "code", key: "code" },
  { title: "Attribute Label", dataIndex: "label", key: "label" },
  { title: "Required", key: "required", customRender: () => "No" },
  { title: "System", key: "system", customRender: () => "Yes" },
  { title: "Visible", key: "visible", customRender: () => "Yes" },
  { title: "Scope", key: "scope", customRender: () => "Global" },
];

const selectedAttributesData = computed(() => {
  return availableAttributes.filter((attr) =>
    selectedAttributeKeys.value.includes(attr.code)
  );
});

const selectedAttributes = computed(() => {
  return selectedAttributesData.value.map((attr) => attr.label);
});

const generatedProducts = computed(() => {
  if (selectedAttributesData.value.length === 0) return [];

  // Generate combinations
  const attrs = selectedAttributesData.value;
  let combinations = [{}];

  attrs.forEach((attr) => {
    const values = selectedValues[attr.code] || [];
    if (values.length === 0) return;

    const newCombinations = [];
    combinations.forEach((existing) => {
      values.forEach((val) => {
        newCombinations.push({
          ...existing,
          [attr.code]: val,
        });
      });
    });
    combinations = newCombinations;
  });

  return combinations.map((combo) => {
    const skuSuffix = Object.values(combo).join("-");
    const nameSuffix = Object.values(combo).join("-");

    return {
      name: `${props.productName}-${nameSuffix}`,
      sku: `${props.productSku}-${skuSuffix}`,
      price: bulkConfig.priceType === "single" ? bulkConfig.singlePrice : 0,
      quantity: bulkConfig.qtyType === "single" ? bulkConfig.singleQty : 0,
      weight: 1,
      status: "Enabled",
      attributes: Object.entries(combo)
        .map(([key, val]) => {
          const label = availableAttributes.find((a) => a.code === key)?.label;
          return `${label}: ${val}`;
        })
        .join(", "),
      ...combo,
    };
  });
});

const summaryColumns = computed(() => {
  const cols = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Weight", dataIndex: "weight", key: "weight" },
  ];

  selectedAttributesData.value.forEach((attr) => {
    cols.splice(2, 0, {
      title: attr.label,
      dataIndex: attr.code,
      key: attr.code,
    });
  });

  return cols;
});

const onAttributeSelectChange = (selectedKeys) => {
  selectedAttributeKeys.value = selectedKeys;
  // Initialize selectedValues for new keys
  selectedKeys.forEach((key) => {
    if (!selectedValues[key]) {
      selectedValues[key] = [];
    }
  });
};

const selectAll = (code) => {
  const attr = availableAttributes.find((a) => a.code === code);
  if (attr) {
    selectedValues[code] = [...attr.options];
  }
};

const deselectAll = (code) => {
  selectedValues[code] = [];
};

const nextStep = () => {
  currentStep.value++;
};

const prevStep = () => {
  currentStep.value--;
};

const handleCancel = () => {
  emit("update:visible", false);
  currentStep.value = 0;
};

const handleGenerate = () => {
  emit("generate", generatedProducts.value);
  emit("update:visible", false);
  currentStep.value = 0;
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      // Reset state
      currentStep.value = 0;
      selectedAttributeKeys.value = [];
      // Clear selectedValues
      Object.keys(selectedValues).forEach((key) => delete selectedValues[key]);

      if (props.productPrice) {
        bulkConfig.singlePrice = props.productPrice;
      }
    }
  }
);
</script>

<style scoped>
.steps-container {
  margin-bottom: 24px;
}
.step-content {
  min-height: 300px;
}
.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.attribute-values-section {
  margin-bottom: 24px;
  border: 1px solid #eee;
  padding: 16px;
}
.values-grid {
  margin: 16px 0;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}
.bulk-section {
  margin-bottom: 24px;
}
.bulk-section h4 {
  margin-bottom: 8px;
  font-weight: 600;
}
</style>
