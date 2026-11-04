<template>
  <div class="marketing-cart-price-rule-add">
    <div class="page-header">
      <h1 class="page-title">New Cart Price Rule</h1>
      <div class="header-actions">
        <a-button @click="handleBack" style="margin-right: 8px">
          <arrow-left-outlined /> Back
        </a-button>
        <a-button @click="handleReset" style="margin-right: 8px"
          >Reset</a-button
        >
        <a-button @click="handleSaveAndContinue" style="margin-right: 8px">
          Save and Continue Edit
        </a-button>
        <a-button
          type="primary"
          @click="handleSave"
          style="background: #eb5202; border-color: #eb5202"
          >Save</a-button
        >
      </div>
    </div>

    <div class="form-container">
      <a-form
        :model="formState"
        :rules="rules"
        layout="vertical"
        ref="formRef"
        @finish="handleSave"
      >
        <a-form-item label="Rule Name" name="name" required>
          <a-input v-model:value="formState.name" />
        </a-form-item>

        <a-form-item label="Description" name="description">
          <a-textarea v-model:value="formState.description" :rows="4" />
        </a-form-item>

        <a-form-item label="Active" name="is_active" required>
          <a-switch
            v-model:checked="formState.is_active"
            checked-children="Yes"
            un-checked-children="No"
          />
        </a-form-item>

        <a-form-item label="Websites" name="website_ids" required>
          <a-select
            v-model:value="formState.website_ids"
            mode="multiple"
            placeholder="Select Websites"
            style="width: 300px; height: 150px"
            :listHeight="150"
          >
            <a-select-option value="1">Main Website</a-select-option>
          </a-select>
          <a-tooltip title="What is this?">
            <question-circle-outlined style="margin-left: 8px; color: #999" />
          </a-tooltip>
        </a-form-item>

        <a-form-item label="Customer Groups" name="customer_group_ids" required>
          <a-select
            v-model:value="formState.customer_group_ids"
            mode="multiple"
            placeholder="Select Customer Groups"
            style="width: 300px; height: 150px"
            :listHeight="150"
          >
            <a-select-option value="NOT LOGGED IN"
              >NOT LOGGED IN</a-select-option
            >
            <a-select-option value="General">General</a-select-option>
            <a-select-option value="Wholesale">Wholesale</a-select-option>
            <a-select-option value="Retailer">Retailer</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Coupon" name="coupon_type" required>
          <a-select v-model:value="formState.coupon_type" style="width: 200px">
            <a-select-option value="No Coupon">No Coupon</a-select-option>
            <a-select-option value="Specific Coupon"
              >Specific Coupon</a-select-option
            >
          </a-select>
        </a-form-item>

        <a-form-item label="Uses per Customer" name="uses_per_customer">
          <a-input v-model:value="formState.uses_per_customer" />
          <div class="field-note">
            Usage limit enforced for logged in customers only.
          </div>
        </a-form-item>

        <a-form-item label="From" name="from_date">
          <a-date-picker
            v-model:value="formState.from_date"
            format="MM/DD/YYYY"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>

        <a-form-item label="To" name="to_date">
          <a-date-picker
            v-model:value="formState.to_date"
            format="MM/DD/YYYY"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>

        <a-form-item label="Priority" name="sort_order">
          <a-input v-model:value="formState.sort_order" />
        </a-form-item>

        <a-form-item label="Public In RSS Feed" name="is_rss">
          <a-switch
            v-model:checked="formState.is_rss"
            checked-children="Yes"
            un-checked-children="No"
          />
        </a-form-item>

        <a-divider />

        <h3 class="section-title">Actions</h3>

        <a-form-item label="Apply" name="simple_action">
          <a-select v-model:value="formState.simple_action">
            <a-select-option value="by_percent"
              >Percent of product price discount</a-select-option
            >
            <a-select-option value="by_fixed"
              >Fixed amount discount</a-select-option
            >
            <a-select-option value="cart_fixed"
              >Fixed amount discount for whole cart</a-select-option
            >
            <a-select-option value="buy_x_get_y"
              >Buy X get Y free (discount amount is Y)</a-select-option
            >
          </a-select>
        </a-form-item>

        <a-form-item label="Discount Amount" name="discount_amount" required>
          <a-input v-model:value="formState.discount_amount" />
        </a-form-item>

        <a-form-item
          label="Maximum Qty Discount is Applied To"
          name="discount_qty"
        >
          <a-input v-model:value="formState.discount_qty" />
        </a-form-item>

        <a-form-item label="Discount Qty Step (Buy X)" name="discount_step">
          <a-input v-model:value="formState.discount_step" />
        </a-form-item>

        <a-form-item label="Apply to Shipping Amount" name="apply_to_shipping">
          <a-switch
            v-model:checked="formState.apply_to_shipping"
            checked-children="Yes"
            un-checked-children="No"
          />
          <div class="field-note">
            Discount amount is applied to subtotal only
          </div>
        </a-form-item>

        <a-form-item
          label="Discard subsequent rules"
          name="stop_rules_processing"
        >
          <a-switch
            v-model:checked="formState.stop_rules_processing"
            checked-children="Yes"
            un-checked-children="No"
          />
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import {
  ArrowLeftOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const emit = defineEmits(["back"]);

const formRef = ref();

const formState = reactive({
  name: "",
  description: "",
  is_active: true,
  website_ids: [],
  customer_group_ids: [],
  coupon_type: "No Coupon",
  uses_per_customer: "",
  from_date: null,
  to_date: null,
  sort_order: "",
  is_rss: true,
  simple_action: "by_percent",
  discount_amount: "",
  discount_qty: "",
  discount_step: "",
  apply_to_shipping: false,
  stop_rules_processing: true,
});

const rules = {
  name: [
    { required: true, message: "Please enter Rule Name", trigger: "blur" },
  ],
  website_ids: [
    {
      required: true,
      message: "Please select Websites",
      trigger: "change",
      type: "array",
    },
  ],
  customer_group_ids: [
    {
      required: true,
      message: "Please select Customer Groups",
      trigger: "change",
      type: "array",
    },
  ],
  discount_amount: [
    {
      required: true,
      message: "Please enter Discount Amount",
      trigger: "blur",
    },
  ],
};

const handleBack = () => {
  emit("back");
};

const handleReset = () => {
  formRef.value.resetFields();
};

const handleSave = () => {
  formRef.value
    .validate()
    .then(() => {
      const groupMap = {
        "NOT LOGGED IN": 0,
        General: 1,
        Wholesale: 2,
        Retailer: 3,
      };
      const couponMap = { "No Coupon": 1, "Specific Coupon": 2 };

      // Create mock rule
      const mockRule = {
        rule_id: Date.now(),
        ...formState,
        customer_group_ids: formState.customer_group_ids.map(
          (g) => groupMap[g] || g
        ),
        coupon_type: couponMap[formState.coupon_type] || formState.coupon_type,
        is_active: formState.is_active ? 1 : 0,
        start_date: formState.from_date,
        end_date: formState.to_date,
        sort_order: formState.sort_order || 0,
      };

      message.loading({ content: "Saving...", key: "save" });

      setTimeout(() => {
        message.success({ content: "You saved the rule.", key: "save" });
        // Use updatedData standard property we used in ProductAdd
        emit("navigate", "marketing_cart_price_rules", {
          updatedData: mockRule,
        });
      }, 500);
    })
    .catch((error) => {
      console.log("error", error);
    });
};

const handleSaveAndContinue = () => {
  formRef.value
    .validate()
    .then(() => {
      message.success("You saved the rule.");
      // Stay on page
    })
    .catch((error) => {
      console.log("error", error);
    });
};
</script>

<style scoped>
.marketing-cart-price-rule-add {
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
  max-width: 1000px;
}

.field-note {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e3e3e3;
}
</style>
