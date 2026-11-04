<template>
  <div class="marketing-review-edit">
    <div class="page-header">
      <h1 class="page-title">Edit Review</h1>
      <div class="header-actions">
        <a-button @click="handleBack" style="margin-right: 8px">
          <arrow-left-outlined /> Back
        </a-button>
        <a-button @click="handleDelete" style="margin-right: 8px"
          >Delete Review</a-button
        >
        <a-button @click="handleReset" style="margin-right: 8px"
          >Reset</a-button
        >
        <a-button @click="handleSaveAndNext" style="margin-right: 8px"
          >Save and Next</a-button
        >
        <a-button
          type="primary"
          @click="handleSave"
          style="background: #eb5202; border-color: #eb5202"
          >Save Review</a-button
        >
      </div>
    </div>

    <div class="form-container">
      <h3 class="section-title">Review Details</h3>
      <a-form
        :model="formState"
        :rules="rules"
        layout="vertical"
        ref="formRef"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
        @finish="handleSave"
      >
        <a-form-item label="Product">
          <a href="#">{{ formState.product_name }}</a>
        </a-form-item>

        <a-form-item label="Author">
          <span>{{ formState.author }}</span>
        </a-form-item>

        <a-form-item label="Summary Rating">
          <a-rate v-model:value="formState.summary_rating" disabled />
        </a-form-item>

        <a-form-item label="Detailed Rating" required>
          <div class="rating-row">
            <span class="rating-label">Rating</span>
            <a-rate v-model:value="formState.detailed_rating" />
          </div>
        </a-form-item>

        <a-form-item label="Status" name="status_id" required>
          <a-select v-model:value="formState.status_id" style="width: 200px">
            <a-select-option value="Approved">Approved</a-select-option>
            <a-select-option value="Pending">Pending</a-select-option>
            <a-select-option value="Not Approved">Not Approved</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Nickname" name="nickname" required>
          <a-input v-model:value="formState.nickname" />
        </a-form-item>

        <a-form-item label="Summary of Review" name="title" required>
          <a-input v-model:value="formState.title" />
        </a-form-item>

        <a-form-item label="Review" name="detail" required>
          <a-textarea v-model:value="formState.detail" :rows="6" />
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import axios from "axios";

const props = defineProps({
  reviewId: {
    type: [Number, String],
    required: true,
  },
});

const emit = defineEmits(["back"]);

const formRef = ref();

const formState = reactive({
  product_name: "",
  author: "",
  summary_rating: 0,
  detailed_rating: 0,
  status_id: "Pending",
  nickname: "",
  title: "",
  detail: "",
});

const rules = {
  status_id: [
    { required: true, message: "Please select Status", trigger: "change" },
  ],
  nickname: [
    { required: true, message: "Please enter Nickname", trigger: "blur" },
  ],
  title: [
    {
      required: true,
      message: "Please enter Summary of Review",
      trigger: "blur",
    },
  ],
  detail: [{ required: true, message: "Please enter Review", trigger: "blur" }],
};

const fetchReview = async () => {
  try {
    const response = await fetch(
      `/api/reviews?id=${props.reviewId}`
    );
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const review = data.items[0];
      const statusMap = { 1: "Approved", 2: "Pending", 3: "Not Approved" };
      formState.product_name = review.product_name;
      formState.author = review.type;
      formState.summary_rating = review.rating_value || 0;
      formState.detailed_rating = review.rating_value || 0;
      formState.status_id = statusMap[review.status_id] || "Pending";
      formState.nickname = review.nickname;
      formState.title = review.title;
      formState.detail = review.detail;
    }
  } catch (error) {
    console.error("Error fetching review:", error);
  }
};

const handleBack = () => {
  emit("back");
};

const handleDelete = () => {
  message.success("Review deleted (mock).");
  emit("back", {
    deletedId: props.reviewId,
  });
};

const handleReset = () => {
  fetchReview();
};

const handleSave = () => {
  formRef.value
    .validate()
    .then(() => {
      const statusMap = { Approved: 1, Pending: 2, "Not Approved": 3 };
      message.success("You saved the review.");
      emit("back", {
        updatedData: {
          ...formState,
          status_id: statusMap[formState.status_id] || 2,
          review_id: props.reviewId,
        },
      });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

const handleSaveAndNext = () => {
  formRef.value
    .validate()
    .then(() => {
      message.success("You saved the review.");
      // Logic to go to next review would be here
    })
    .catch((error) => {
      console.log("error", error);
    });
};

onMounted(() => {
  fetchReview();
});
</script>

<style scoped>
.marketing-review-edit {
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

.form-container {
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

.rating-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rating-label {
  font-weight: bold;
}
</style>
