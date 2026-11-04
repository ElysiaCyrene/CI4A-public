<template>
  <el-dialog
    :model-value="visible"
    title="Create Product Configurations"
    width="1000px"
    @update:model-value="(v) => emit('update:visible', v)"
    @close="handleCancel"
  >
    <div class="steps-container">
      <el-steps :active="currentStep" align-center>
        <el-step title="Select Attributes" />
        <el-step title="Attribute Values" />
        <el-step title="Bulk Images & Price" />
        <el-step title="Summary" />
      </el-steps>
    </div>

    <div class="step-content">
      <!-- Step 1: Select Attributes -->
      <div v-if="currentStep === 0">
        <div class="step-header">
          <h3>Step 1: Select Attributes</h3>
          <el-button>Create New Attribute</el-button>
        </div>
        <p style="color: #999; font-size: 13px">Selected Attributes: {{ selectedAttributes.join(', ') }}</p>

        <el-checkbox-group v-model="selectedAttributeKeys" @change="onAttrChange">
          <div v-for="attr in availableAttributes" :key="attr.code" class="attr-item">
            <el-checkbox :value="attr.code">
              <el-row style="width: 100%">
                <el-col :span="8"><strong>{{ attr.label }}</strong></el-col>
                <el-col :span="8" style="color: #666">Code: {{ attr.code }}</el-col>
                <el-col :span="8" style="color: #666">Scope: Global</el-col>
              </el-row>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>

      <!-- Step 2: Attribute Values -->
      <div v-if="currentStep === 1">
        <div class="step-header">
          <h3>Step 2: Attribute Values</h3>
        </div>
        <p style="color: #999; font-size: 13px">
          Select values from each attribute to include in this product. Each
          unique combination of values creates a unique product SKU.
        </p>
        <div v-for="attr in selectedAttributesData" :key="attr.code" class="attr-values-section">
          <h4>{{ attr.label }}</h4>
          <el-checkbox-group v-model="selectedValues[attr.code]">
            <el-row>
              <el-col :span="6" v-for="opt in attr.options" :key="opt">
                <el-checkbox :value="opt">{{ opt }}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
          <div class="attr-actions">
            <a href="#" @click.prevent="selectAll(attr.code)">Select All</a>
            <el-divider direction="vertical" />
            <a href="#" @click.prevent="deselectAll(attr.code)">Deselect All</a>
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
          <el-radio-group v-model="bulkConfig.images">
            <el-radio value="single">Apply single set of images to all SKUs</el-radio>
            <el-radio value="unique">Apply unique images by attribute to each SKU</el-radio>
            <el-radio value="skip">Skip image uploading at this time</el-radio>
          </el-radio-group>
        </div>
        <div class="bulk-section">
          <h4>Price</h4>
          <el-radio-group v-model="bulkConfig.priceType">
            <el-radio value="single">Apply single price to all SKUs</el-radio>
            <el-radio value="unique">Apply unique prices by attribute to each SKU</el-radio>
            <el-radio value="skip">Skip price at this time</el-radio>
          </el-radio-group>
          <div v-if="bulkConfig.priceType === 'single'" style="margin-top: 10px">
            <el-input-number v-model="bulkConfig.singlePrice" style="width: 200px" placeholder="Price" />
          </div>
        </div>
        <div class="bulk-section">
          <h4>Quantity</h4>
          <el-radio-group v-model="bulkConfig.qtyType">
            <el-radio value="single">Apply single quantity to each SKU</el-radio>
            <el-radio value="unique">Apply unique quantity by attribute to each SKU</el-radio>
            <el-radio value="skip">Skip quantity at this time</el-radio>
          </el-radio-group>
          <div v-if="bulkConfig.qtyType === 'single'" style="margin-top: 10px">
            <el-input-number v-model="bulkConfig.singleQty" style="width: 200px" placeholder="Quantity" />
          </div>
        </div>
      </div>

      <!-- Step 4: Summary -->
      <div v-if="currentStep === 3">
        <div class="step-header">
          <h3>Step 4: Summary</h3>
        </div>
        <p style="color: #999; font-size: 13px">Here are the products you're about to create.</p>
        <el-table :data="generatedProducts" row-key="sku" border size="small">
          <el-table-column prop="name" label="Name" />
          <el-table-column v-for="attr in selectedAttributesData" :key="attr.code" :prop="attr.code" :label="attr.label" />
          <el-table-column prop="price" label="Price" />
          <el-table-column prop="quantity" label="Quantity" />
          <el-table-column prop="weight" label="Weight" />
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">Cancel</el-button>
      <el-button v-if="currentStep > 0" @click="prevStep">Back</el-button>
      <el-button v-if="currentStep < 3" type="primary" @click="nextStep">Next</el-button>
      <el-button v-if="currentStep === 3" type="primary" class="gen-btn" @click="handleGenerate">Generate Products</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  productName: String,
  productSku: String,
  productPrice: Number,
})

const emit = defineEmits(['update:visible', 'generate'])

const currentStep = ref(0)
const selectedAttributeKeys = ref([])
const selectedValues = reactive({})
const bulkConfig = reactive({
  images: 'skip',
  priceType: 'single',
  singlePrice: props.productPrice || 0,
  qtyType: 'single',
  singleQty: 100,
})

const availableAttributes = [
  { code: 'color', label: 'Color', options: ['Black','Blue','Brown','Gray','Green','Lavender','Multi','Orange','Purple','Red','White','Yellow'] },
  { code: 'size', label: 'Size', options: ['XS','S','M','L','XL','28','29','30','31','32'] },
  { code: 'format', label: 'Format', options: ['Download','DVD'] },
]

const selectedAttributesData = computed(() =>
  availableAttributes.filter(a => selectedAttributeKeys.value.includes(a.code))
)
const selectedAttributes = computed(() => selectedAttributesData.value.map(a => a.label))

const generatedProducts = computed(() => {
  if (selectedAttributesData.value.length === 0) return []
  const attrs = selectedAttributesData.value
  let combos = [{}]
  attrs.forEach(attr => {
    const vals = selectedValues[attr.code] || []
    if (vals.length === 0) return
    const next = []
    combos.forEach(existing => { vals.forEach(val => { next.push({ ...existing, [attr.code]: val }) }) })
    combos = next
  })
  return combos.map(combo => {
    const sfx = Object.values(combo).join('-')
    return {
      name: `${props.productName}-${sfx}`,
      sku: `${props.productSku}-${sfx}`,
      price: bulkConfig.priceType === 'single' ? bulkConfig.singlePrice : 0,
      quantity: bulkConfig.qtyType === 'single' ? bulkConfig.singleQty : 0,
      weight: 1,
      status: 'Enabled',
      attributes: Object.entries(combo).map(([k, v]) => {
        const label = availableAttributes.find(a => a.code === k)?.label
        return `${label}: ${v}`
      }).join(', '),
      ...combo,
    }
  })
})

const onAttrChange = (keys) => {
  keys.forEach(k => { if (!selectedValues[k]) selectedValues[k] = [] })
}

const selectAll = (code) => {
  const attr = availableAttributes.find(a => a.code === code)
  if (attr) selectedValues[code] = [...attr.options]
}
const deselectAll = (code) => { selectedValues[code] = [] }

const nextStep = () => { currentStep.value++ }
const prevStep = () => { currentStep.value-- }

const handleCancel = () => {
  emit('update:visible', false)
  currentStep.value = 0
}

const handleGenerate = () => {
  emit('generate', generatedProducts.value)
  emit('update:visible', false)
  currentStep.value = 0
}

watch(() => props.visible, (val) => {
  if (val) {
    currentStep.value = 0
    selectedAttributeKeys.value = []
    Object.keys(selectedValues).forEach(k => delete selectedValues[k])
    if (props.productPrice) bulkConfig.singlePrice = props.productPrice
  }
})
</script>

<style scoped>
.steps-container { margin-bottom: 24px; }
.step-content { min-height: 300px; }
.step-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.step-header h3 { margin: 0; font-size: 16px; }
.attr-item { margin-bottom: 10px; padding: 10px; border: 1px solid #f0f0f0; border-radius: 4px; }
.attr-values-section { margin-bottom: 24px; border: 1px solid #eee; padding: 16px; border-radius: 4px; }
.attr-values-section h4 { margin: 0 0 12px 0; font-size: 14px; font-weight: 600; }
.attr-actions { margin-top: 12px; }
.attr-actions a { font-size: 13px; }
.bulk-section { margin-bottom: 24px; }
.bulk-section h4 { margin-bottom: 8px; font-weight: 600; font-size: 14px; }
.gen-btn { background: #eb5202 !important; border-color: #eb5202 !important; }
</style>
