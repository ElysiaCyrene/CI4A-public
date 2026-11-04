<template>
  <div class="content-theme-view">
    <div class="page-header">
      <h1 class="page-title">Theme: {{ theme.theme_title }}</h1>
      <div class="header-actions">
        <a-button @click="handleBack"> <arrow-left-outlined /> Back </a-button>
      </div>
    </div>

    <div class="view-container">
      <div class="sidebar">
        <div class="sidebar-section">
          <div class="sidebar-title">THEME</div>
          <div class="sidebar-item active">General</div>
        </div>
      </div>
      <div class="main-content">
        <div class="content-section">
          <h2 class="section-title">Theme Settings</h2>
          <div class="info-row">
            <div class="label">Theme Path</div>
            <div class="value">{{ theme.theme_path }}</div>
          </div>
          <div class="info-row">
            <div class="label">Theme Title</div>
            <div class="value">{{ theme.theme_title }}</div>
          </div>
          <div class="info-row">
            <div class="label">Theme Preview Image</div>
            <div class="value">
              <img
                v-if="theme.preview_image"
                :src="theme.preview_image"
                alt="Theme Preview"
                class="preview-image"
              />
              <div v-else class="no-image">No Preview Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import axios from "axios";

const props = defineProps({
  themeId: {
    type: [Number, String],
    required: true,
  },
});

const emit = defineEmits(["back"]);

const theme = ref({});

const handleBack = () => {
  emit("back");
};

const fetchTheme = async () => {
  try {
    const response = await axios.get(
      `/api/content/themes/${props.themeId}`
    );
    theme.value = response.data;
  } catch (error) {
    console.error("Error fetching theme details:", error);
  }
};

onMounted(() => {
  fetchTheme();
});
</script>

<style scoped>
.content-theme-view {
  padding: 24px;
  background: #f4f5f7;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid #e3e3e3;
}

.page-title {
  font-size: 24px;
  font-weight: 300;
  margin: 0;
  color: #333;
}

.view-container {
  display: flex;
  gap: 24px;
}

.sidebar {
  width: 240px;
  background: #f5f5f5;
  border-right: 1px solid #e3e3e3;
  min-height: 500px;
}

.sidebar-section {
  margin-bottom: 16px;
}

.sidebar-title {
  padding: 12px 16px;
  font-weight: bold;
  color: #333;
  background: #e3e3e3;
}

.sidebar-item {
  padding: 12px 16px;
  cursor: pointer;
  color: #333;
  border-left: 3px solid transparent;
}

.sidebar-item.active {
  background: #fff;
  border-left-color: #eb5202;
  font-weight: bold;
}

.main-content {
  flex: 1;
  background: #fff;
  padding: 24px;
  border: 1px solid #e3e3e3;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e3e3e3;
}

.info-row {
  display: flex;
  margin-bottom: 24px;
}

.label {
  width: 200px;
  font-weight: 600;
  color: #333;
  text-align: right;
  padding-right: 24px;
}

.value {
  flex: 1;
  color: #666;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #ccc;
}

.no-image {
  color: #999;
  font-style: italic;
}
</style>
