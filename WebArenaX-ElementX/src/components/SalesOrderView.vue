<template>
  <div class="v" v-if="order">
    <div class="ph">
      <div class="hl"><el-button text @click="$emit('back')"><el-icon><ArrowLeft /></el-icon> Back</el-button><h1 class="pt">#{{ order.increment_id }}</h1></div>
      <div class="ha"><el-button>Send Email</el-button><el-button>Hold</el-button><el-button>Invoice</el-button><el-button>Ship</el-button><el-button>Reorder</el-button><el-button type="primary" style="background:#eb5202;border-color:#eb5202">Edit</el-button></div>
    </div>
    <div class="cl">
      <div class="sb"><el-menu default-active="information"><el-menu-item index="information">Information</el-menu-item><el-menu-item index="invoices">Invoices</el-menu-item><el-menu-item index="credit_memos">Credit Memos</el-menu-item><el-menu-item index="shipments">Shipments</el-menu-item><el-menu-item index="comments">Comments History</el-menu-item></el-menu></div>
      <div class="mc">
        <!-- Order & Account -->
        <div class="st">Order & Account Information</div>
        <div class="ig">
          <div class="ib"><h3>Order # {{ order.increment_id }} <span style="color:#999;font-weight:400;font-size:12px">(The order confirmation email was sent)</span></h3>
            <div class="ir"><span class="l">Order Date</span><span class="val">{{fd(order.created_at)}}</span></div>
            <div class="ir"><span class="l">Order Status</span><span class="val">{{order.status}}</span></div>
            <div class="ir"><span class="l">Purchased From</span><span class="val">{{order.store_name}}</span></div>
            <div class="ir"><span class="l">Placed from IP</span><span class="val">{{order.remote_ip}}</span></div>
          </div>
          <div class="ib"><h3>Account Information <a href="#">Edit Customer</a></h3>
            <div class="ir"><span class="l">Customer Name</span><span class="val">{{order.customer_firstname}} {{order.customer_lastname}}</span></div>
            <div class="ir"><span class="l">Email</span><span class="val"><a :href="'mailto:'+order.customer_email">{{order.customer_email}}</a></span></div>
            <div class="ir"><span class="l">Customer Group</span><span class="val">General</span></div>
          </div>
        </div>
        <!-- Addresses -->
        <div class="st">Address Information</div>
        <div class="ig">
          <div class="ib"><h3>Billing Address <a href="#" @click.prevent="startEdit('billing')">Edit</a></h3>
            <div v-if="editBilling"><div class="fi"><span class="fl">First Name</span><el-input v-model="bf.firstname" size="small"/></div><div class="fi"><span class="fl">Last Name</span><el-input v-model="bf.lastname" size="small"/></div><div class="fi"><span class="fl">Street</span><el-input v-model="bf.street" size="small"/></div><div class="fi"><span class="fl">City</span><el-input v-model="bf.city" size="small"/></div><div class="fi"><span class="fl">Region</span><el-input v-model="bf.region" size="small"/></div><div class="fi"><span class="fl">Postcode</span><el-input v-model="bf.postcode" size="small"/></div><div class="fi"><span class="fl">Country</span><el-input v-model="bf.country_id" size="small"/></div><div class="fi"><span class="fl">Telephone</span><el-input v-model="bf.telephone" size="small"/></div><div style="text-align:right;margin-top:8px"><el-button size="small" @click="cancelEdit('billing')">Cancel</el-button><el-button type="primary" size="small" @click="saveEdit('billing')">Save</el-button></div></div>
            <div v-else-if="order.billing_address">{{order.billing_address.firstname}} {{order.billing_address.lastname}}<br/>{{order.billing_address.street}}<br/>{{order.billing_address.city}}, {{order.billing_address.region}}, {{order.billing_address.postcode}}<br/>{{order.billing_address.country_id}}<br/>T: {{order.billing_address.telephone}}</div>
          </div>
          <div class="ib"><h3>Shipping Address <a href="#" @click.prevent="startEdit('shipping')">Edit</a></h3>
            <div v-if="editShipping"><div class="fi"><span class="fl">First Name</span><el-input v-model="sf.firstname" size="small"/></div><div class="fi"><span class="fl">Last Name</span><el-input v-model="sf.lastname" size="small"/></div><div class="fi"><span class="fl">Street</span><el-input v-model="sf.street" size="small"/></div><div class="fi"><span class="fl">City</span><el-input v-model="sf.city" size="small"/></div><div class="fi"><span class="fl">Region</span><el-input v-model="sf.region" size="small"/></div><div class="fi"><span class="fl">Postcode</span><el-input v-model="sf.postcode" size="small"/></div><div class="fi"><span class="fl">Country</span><el-input v-model="sf.country_id" size="small"/></div><div class="fi"><span class="fl">Telephone</span><el-input v-model="sf.telephone" size="small"/></div><div style="text-align:right;margin-top:8px"><el-button size="small" @click="cancelEdit('shipping')">Cancel</el-button><el-button type="primary" size="small" @click="saveEdit('shipping')">Save</el-button></div></div>
            <div v-else-if="order.shipping_address">{{order.shipping_address.firstname}} {{order.shipping_address.lastname}}<br/>{{order.shipping_address.street}}<br/>{{order.shipping_address.city}}, {{order.shipping_address.region}}, {{order.shipping_address.postcode}}<br/>{{order.shipping_address.country_id}}<br/>T: {{order.shipping_address.telephone}}</div>
          </div>
        </div>
        <!-- Payment & Shipping -->
        <div class="st">Payment & Shipping Method</div>
        <div class="ig">
          <div class="ib"><h3>Payment Information</h3><div>{{order.payment?.method||'Check / Money order'}}</div><div style="font-size:13px;color:#666">The order was placed using {{order.order_currency_code}}.</div></div>
          <div class="ib"><h3>Shipping & Handling Information</h3><div>{{order.shipping_description}} ${{fp(order.shipping_amount)}}</div>
            <div class="ts"><div v-if="trk.length" class="trh"><div style="flex:2">Carrier</div><div style="flex:2">Title</div><div style="flex:2">Number</div><div style="flex:.5;text-align:center">Action</div></div>
              <div v-for="(t,i) in trk" :key="i" class="trr"><div style="flex:2"><el-select v-model="t.carrier" size="small" style="width:100%"><el-option v-for="c in carriers" :key="c.value" :label="c.label" :value="c.value"/></el-select></div><div style="flex:2"><el-input v-model="t.title" size="small"/></div><div style="flex:2"><el-input v-model="t.number" size="small"/></div><div style="flex:.5;text-align:center"><el-button text type="danger" @click="trk.splice(i,1)"><el-icon><Delete /></el-icon></el-button></div></div>
              <el-button size="small" style="margin-top:8px" @click="trk.push({carrier:'custom',title:'',number:''})">Add Tracking Number</el-button>
            </div>
          </div>
        </div>
        <!-- Items Ordered -->
        <div class="st">Items Ordered</div>
        <el-table :data="order.items" row-key="item_id" border>
          <el-table-column label="Product"><template #default="{row}"><div>{{row.name}}</div><div style="color:#666;font-size:12px">SKU: {{row.sku}}</div></template></el-table-column>
          <el-table-column label="Item Status" width="100"><template #default>Ordered</template></el-table-column>
          <el-table-column prop="original_price" label="Original Price" width="120" align="right"><template #default="{row}">{{fc(row.original_price)}}</template></el-table-column>
          <el-table-column prop="price" label="Price" width="100" align="right"><template #default="{row}">{{fc(row.price)}}</template></el-table-column>
          <el-table-column prop="qty_ordered" label="Qty" width="60" align="center"/>
          <el-table-column prop="row_total" label="Subtotal" width="100" align="right"><template #default="{row}">{{fc(row.row_total)}}</template></el-table-column>
          <el-table-column prop="tax_amount" label="Tax Amount" width="110" align="right"><template #default="{row}">{{fc(row.tax_amount)}}</template></el-table-column>
          <el-table-column prop="discount_amount" label="Discount Amount" width="130" align="right"><template #default="{row}">{{fc(row.discount_amount)}}</template></el-table-column>
          <el-table-column prop="row_total" label="Row Total" width="100" align="right"><template #default="{row}">{{fc(row.row_total)}}</template></el-table-column>
        </el-table>
        <!-- Order Total -->
        <div class="st">Order Total</div>
        <div class="tl">
          <div class="ns"><h3>Notes for this Order</h3>
            <div class="fi"><span class="fl">Status</span><el-select v-model="stf.status" style="width:200px"><el-option v-for="s in statuses" :key="s" :label="s" :value="s"/></el-select></div>
            <div class="fi"><span class="fl">Comment</span><el-input v-model="stf.comment" type="textarea" :rows="4"/></div>
            <div class="fi"><el-checkbox v-model="stf.notify">Notify Customer by Email</el-checkbox></div>
            <div class="fi"><el-checkbox v-model="stf.visible">Visible on Storefront</el-checkbox></div>
            <el-button type="primary" @click="submitStatus" :loading="sbm">Submit Comment</el-button>
            <div v-if="allComments.length" class="ch"><h4>Comments History</h4>
              <ul><li v-for="(c,i) in allComments" :key="i" class="ci"><div class="cd">{{fd(c.created_at)}} <span style="margin:0 8px;color:#ccc">|</span> Status: {{c.status}}<span v-if="c.is_customer_notified" style="color:green;font-size:12px;margin-left:8px">Customer Notified</span></div><div style="font-size:13px;color:#333">{{c.comment}}</div></li></ul>
            </div>
          </div>
          <div class="ts2"><h3>Order Totals</h3>
            <div class="tr"><span>Subtotal</span><span>{{fc(order.subtotal)}}</span></div><div class="tr"><span>Discount</span><span>{{fc(order.discount_amount)}}</span></div><div class="tr"><span>Shipping & Handling</span><span>{{fc(order.shipping_amount)}}</span></div><div class="tr gt"><span>Grand Total</span><span>{{fc(order.grand_total)}}</span></div><div class="tr"><span>Total Paid</span><span>{{fc(order.total_paid)}}</span></div><div class="tr"><span>Total Refunded</span><span>{{fc(order.total_refunded)}}</span></div><div class="tr gt"><span>Total Due</span><span>{{fc(order.total_due)}}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="loading" style="padding:50px;text-align:center"><p>Loading...</p></div>
  <div v-else style="padding:50px;text-align:center">Order not found</div>
</template>
<script setup>
import {ref,reactive,computed,onMounted} from 'vue';import {ArrowLeft,Delete} from '@element-plus/icons-vue';import dayjs from 'dayjs';import {ElMessage} from 'element-plus'
const props=defineProps({orderId:{type:[String,Number],required:true}});const emit=defineEmits(['back'])
const loading=ref(true),sbm=ref(false),order=ref(null),localComments=ref([]),editBilling=ref(false),editShipping=ref(false),trk=ref([])
const bf=reactive({firstname:'',lastname:'',street:'',city:'',region:'',postcode:'',country_id:'',telephone:''})
const sf=reactive({firstname:'',lastname:'',street:'',city:'',region:'',postcode:'',country_id:'',telephone:''})
const stf=reactive({status:'',comment:'',notify:false,visible:false})
const carriers=[{value:'custom',label:'Custom Value'},{value:'dhl',label:'DHL'},{value:'fedex',label:'Federal Express'},{value:'ups',label:'United Parcel Service'},{value:'usps',label:'United States Postal Service'}]
const statuses=['pending','processing','complete','closed','canceled','holded']
const allComments=computed(()=>{const bc=order.value?.status_history||[];return[...localComments.value,...bc]})
const fd=v=>dayjs(v).format('MMM D, YYYY, h:mm:ss A');const fp=v=>parseFloat(v||0).toFixed(2)
const fc=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v||0)
const startEdit=(t)=>{if(order.value?.[t+'_address']){const a=order.value[t+'_address'];const f=t==='billing'?bf:sf;Object.assign(f,a)};t==='billing'?editBilling.value=true:editShipping.value=true}
const cancelEdit=(t)=>{t==='billing'?editBilling.value=false:editShipping.value=false}
const saveEdit=(t)=>{const a=t==='billing'?bf:sf;const key=t+'_address';order.value[key]={...order.value[key],...a};ElMessage.success(t+' address updated (mock)');cancelEdit(t)}
const submitStatus=async()=>{sbm.value=true;await new Promise(r=>setTimeout(r,600));ElMessage.success('Order status updated (Mock)');localComments.value.unshift({created_at:new Date(),status:stf.status,comment:stf.comment,is_customer_notified:stf.notify});stf.comment='';sbm.value=false}
onMounted(async()=>{loading.value=true;try{const r=await fetch(`/api/sales/orders/${props.orderId}`);order.value=await r.json();stf.status=order.value.status}catch(e){console.error(e)}finally{loading.value=false}})
</script>
<style scoped>.v{min-height:100vh}.ph{background:#fff;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e3e3e3;margin-bottom:20px}.hl{display:flex;align-items:center;gap:16px}.pt{font-size:24px;font-weight:300;margin:0}.ha{display:flex;gap:10px}.cl{display:flex;padding:0 24px;gap:24px}.sb{width:200px;background:#fff;border:1px solid #d9d9d9}.mc{flex:1}.st{font-size:18px;font-weight:400;margin-bottom:16px;margin-top:24px;border-bottom:1px solid #ccc;padding-bottom:10px}.st:first-child{margin-top:0}.ig{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}.ib{background:#fff;padding:20px;border:1px solid #d9d9d9}.ib h3{font-size:16px;font-weight:600;margin:0 0 16px 0;border-bottom:1px solid #eee;padding-bottom:8px}.ir{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px}.ir .l{font-weight:600;color:#303030}.fi{display:flex;align-items:center;gap:8px;margin-bottom:8px}.fl{font-weight:600;font-size:13px;min-width:80px}.ts{background:#f9f9f9;padding:16px;border:1px solid #eee;margin-top:12px}.trh{display:flex;gap:8px;font-weight:600;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #ddd}.trr{display:flex;gap:8px;margin-bottom:8px;align-items:center}.tl{display:flex;gap:24px}.ns{flex:1;background:#fff;padding:20px;border:1px solid #d9d9d9}.ts2{width:400px;background:#fff;padding:20px;border:1px solid #d9d9d9}.ts2 h3{font-size:16px;font-weight:600;margin:0 0 12px 0}.tr{display:flex;justify-content:space-between;margin-bottom:10px;padding:5px 0}.tr.gt{font-weight:bold;font-size:16px;border-top:1px solid #eee;padding-top:10px}.ch{margin-top:24px;border-top:1px solid #eee;padding-top:16px}.ch h4{font-weight:600;margin:0 0 12px 0}.ci{margin-bottom:12px;border-bottom:1px dashed #f0f0f0;padding-bottom:8px}.cd{font-weight:600;margin-bottom:4px;font-size:13px}</style>
