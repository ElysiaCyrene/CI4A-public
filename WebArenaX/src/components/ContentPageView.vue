<template>
  <div class="content-page-view">
    <!-- Mock Header -->
    <div class="luma-header">
      <div class="header-top">
        <div class="container">
          <span>Default welcome msg!</span>
          <div class="header-links">
            <a href="#">Sign In</a> or <a href="#">Create an Account</a>
          </div>
        </div>
      </div>
      <div class="header-main container">
        <div class="logo">
          <img
            src="https://magento.com/sites/default/files/magento-logo.svg"
            alt="LUMA"
            style="height: 40px; filter: grayscale(100%)"
          />
          <span
            style="
              font-size: 24px;
              font-weight: bold;
              margin-left: 10px;
              vertical-align: middle;
            "
            >LUMA</span
          >
        </div>
        <div class="search-bar">
          <a-input-search
            placeholder="Search entire store here..."
            style="width: 300px"
          />
          <shopping-cart-outlined
            style="font-size: 24px; margin-left: 15px; cursor: pointer"
          />
        </div>
      </div>
      <div class="nav-menu container">
        <ul>
          <li><a href="#">What's New</a></li>
          <li><a href="#">Women</a></li>
          <li><a href="#">Men</a></li>
          <li><a href="#">Gear</a></li>
          <li><a href="#">Training</a></li>
          <li><a href="#">Sale</a></li>
        </ul>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-container container">
      <div v-if="loading" style="text-align: center; padding: 50px">
        <a-spin size="large" />
      </div>
      <div v-else>
        <h1 class="page-title">{{ page.content_heading || page.title }}</h1>
        <div class="page-content" v-html="page.content"></div>
      </div>
    </div>

    <!-- Mock Footer -->
    <div class="luma-footer">
      <div class="container footer-content">
        <div class="footer-col">
          <h4>About us</h4>
          <ul>
            <li><a href="#">About us</a></li>
            <li><a href="#">Customer Service</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Privacy and Cookie Policy</h4>
          <ul>
            <li><a href="#">Privacy and Cookie Policy</a></li>
            <li><a href="#">Search Terms</a></li>
            <li><a href="#">Advanced Search</a></li>
            <li><a href="#">Orders and Returns</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
        <div class="footer-col newsletter">
          <a-input-search
            enter-button="Subscribe"
            placeholder="Enter your email address"
          />
        </div>
      </div>
      <div class="container copyright">
        Copyright © 2025 Magento Commerce Inc. All rights reserved.
      </div>
    </div>

    <!-- Back Button (Admin Only) -->
    <div class="admin-back-button">
      <a-button type="primary" @click="$emit('back')">Back to Admin</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ShoppingCartOutlined } from "@ant-design/icons-vue";
import axios from "axios";

const props = defineProps({
  pageId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["back"]);

const loading = ref(true);
const page = ref({});

const fetchPage = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `/api/content/pages/${props.pageId}`
    );
    page.value = response.data;
  } catch (error) {
    console.error("Error fetching page:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPage();
});
</script>

<style scoped>
.content-page-view {
  background: #fff;
  min-height: 100vh;
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.luma-header {
  border-bottom: 1px solid #e1e1e1;
}

.header-top {
  background: #f0f0f0;
  padding: 10px 0;
  font-size: 12px;
  color: #666;
}

.header-top .container {
  display: flex;
  justify-content: space-between;
}

.header-links a {
  color: #666;
  text-decoration: none;
}

.header-main {
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-menu {
  border-top: 1px solid #e1e1e1;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.nav-menu li a {
  display: block;
  padding: 15px 20px;
  text-decoration: none;
  color: #333;
  font-weight: 600;
}

.nav-menu li a:hover {
  background: #f0f0f0;
}

.main-container {
  padding: 40px 20px;
  min-height: 400px;
}

.page-title {
  font-size: 40px;
  font-weight: 300;
  margin-bottom: 20px;
  color: #333;
}

.page-content {
  line-height: 1.6;
  color: #333;
}

.luma-footer {
  background: #f4f4f4;
  padding: 40px 0 20px;
  margin-top: 40px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.footer-col h4 {
  margin-bottom: 15px;
  font-weight: 600;
}

.footer-col ul {
  list-style: none;
  padding: 0;
}

.footer-col li {
  margin-bottom: 8px;
}

.footer-col a {
  color: #666;
  text-decoration: none;
}

.copyright {
  border-top: 1px solid #e1e1e1;
  padding-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.admin-back-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
