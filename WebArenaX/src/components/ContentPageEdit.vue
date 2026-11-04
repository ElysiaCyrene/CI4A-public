<template>
  <div class="content-page-edit">
    <div class="page-header">
      <div class="header-left">
        <a-button @click="$emit('back')" style="margin-right: 16px">
          <arrow-left-outlined /> Back
        </a-button>
        <h1 class="page-title">{{ page.title || "New Page" }}</h1>
      </div>
      <div class="header-actions">
        <a-button @click="$emit('back')">Delete Page</a-button>
        <a-button
          type="primary"
          style="background: #eb5202; border-color: #eb5202"
          @click="savePage"
          :loading="saving"
          >Save</a-button
        >
      </div>
    </div>

    <div v-if="loading" style="text-align: center; padding: 50px">
      <a-spin size="large" />
    </div>

    <a-form
      v-else
      layout="vertical"
      :model="form"
      class="edit-form"
      @finish="savePage"
    >
      <div class="form-section">
        <a-form-item label="Enable Page">
          <a-switch
            v-model:checked="form.is_active"
            checked-children="Yes"
            un-checked-children="No"
          />
        </a-form-item>

        <a-form-item label="Page Title" required>
          <a-input v-model:value="form.title" />
        </a-form-item>
      </div>

      <a-collapse v-model:activeKey="activeKey" :bordered="false" ghost>
        <a-collapse-panel key="content" header="Content">
          <a-form-item label="Content Heading">
            <a-input v-model:value="form.content_heading" />
          </a-form-item>
          <a-form-item>
            <a-textarea v-model:value="form.content" :rows="10" />
            <div style="text-align: right; margin-top: 5px">
              <a-button size="small">Edit with Page Builder</a-button>
            </div>
          </a-form-item>
        </a-collapse-panel>

        <a-collapse-panel key="seo" header="Search Engine Optimization">
          <a-form-item label="URL Key">
            <a-input v-model:value="form.identifier" />
          </a-form-item>
          <a-form-item label="Meta Title">
            <a-input />
          </a-form-item>
          <a-form-item label="Meta Keywords">
            <a-textarea :rows="3" />
          </a-form-item>
          <a-form-item label="Meta Description">
            <a-textarea :rows="3" />
          </a-form-item>
        </a-collapse-panel>

        <a-collapse-panel key="websites" header="Page in Websites">
          <a-form-item label="Store View">
            <a-select
              mode="multiple"
              placeholder="Select Store View"
              style="width: 100%"
            >
              <a-select-option value="all">All Store Views</a-select-option>
              <a-select-option value="main">Main Website</a-select-option>
            </a-select>
          </a-form-item>
        </a-collapse-panel>

        <a-collapse-panel key="design" header="Design">
          <a-form-item label="Layout">
            <a-select>
              <a-select-option value="1column">1 column</a-select-option>
              <a-select-option value="2columns-left"
                >2 columns with left bar</a-select-option
              >
              <a-select-option value="2columns-right"
                >2 columns with right bar</a-select-option
              >
              <a-select-option value="3columns">3 columns</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Custom Layout Update">
            <a-select defaultValue="No update">
              <a-select-option value="No update">No update</a-select-option>
            </a-select>
          </a-form-item>
        </a-collapse-panel>

        <a-collapse-panel key="custom_design" header="Custom Design Update">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="From">
                <a-date-picker style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="To">
                <a-date-picker style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="New Theme">
            <a-select placeholder="-- Please Select --">
              <a-select-option value="luma">Magento Luma</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="New Layout">
            <a-select placeholder="-- Please Select --">
              <a-select-option value="empty">Empty</a-select-option>
            </a-select>
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import axios from "axios";
import { message } from "ant-design-vue";

const props = defineProps({
  pageId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["back"]);

const loading = ref(true);
const saving = ref(false);
const page = ref({});
const activeKey = ref([
  "content",
  "seo",
  "websites",
  "design",
  "custom_design",
]);

const form = reactive({
  is_active: true,
  title: "",
  content_heading: "",
  content: "",
  identifier: "",
});

const fetchPage = async () => {
  if (!props.pageId) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const response = await axios.get(
      `/api/content/pages/${props.pageId}`
    );
    page.value = response.data;
    form.is_active = !!page.value.is_active;
    form.title = page.value.title;
    form.content_heading = page.value.content_heading;
    form.content = page.value.content;
    form.identifier = page.value.identifier;
  } catch (error) {
    console.error("Error fetching page:", error);
    message.error("Failed to load page");
  } finally {
    loading.value = false;
  }
};

const savePage = async () => {
  saving.value = true;
  try {
    // Mock save
    console.log("Saving page (mock)");
    await new Promise((resolve) => setTimeout(resolve, 500));

    message.success("Page saved successfully (Mock)");

    if (props.pageId) {
      // Edit mode
      emit("back", {
        updatedData: {
          page_id: props.pageId,
          ...form,
          is_active: form.is_active ? 1 : 0,
          update_time: new Date().toISOString(),
        },
      });
    } else {
      // Create mode
      emit("back", {
        tempUpdate: {
          page_id: "new_" + new Date().getTime(),
          ...form,
          is_active: form.is_active ? 1 : 0,
          creation_time: new Date().toISOString(),
          update_time: new Date().toISOString(),
        },
        newPage: true,
      });
    }
    /*
    await axios.post(
      `/api/content/pages/${props.pageId}`,
      {
        ...form,
        is_active: form.is_active ? 1 : 0,
      }
    );
    message.success("Page saved successfully");
    emit("back", {
      updatedData: {
        page_id: props.pageId,
        ...form,
        is_active: form.is_active ? 1 : 0,
        update_time: new Date().toISOString(),
      },
    });
    */
  } catch (error) {
    console.error("Error saving page:", error);
    message.error("Failed to save page");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchPage();
});
</script>

<style scoped>
.content-page-edit {
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
  position: sticky;
  top: 0;
  z-index: 100;
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

.edit-form {
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  padding: 24px;
  border: 1px solid #d9d9d9;
}

.form-section {
  margin-bottom: 24px;
}

:deep(.ant-collapse-header) {
  font-weight: 600;
  font-size: 16px;
  padding-left: 0 !important;
}

:deep(.ant-collapse-content-box) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
