<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Credit Memos</h1></div>
    <div class="bar"><div class="tools">
      <el-button @click="sf=!sf"><el-icon><Filter /></el-icon> Filters</el-button>
    </div></div>
    <div v-if="sf" class="fsec">
      <el-row :gutter="16">
        <el-col :span="6"><div class="fl">Created</div><div style="display:flex;gap:8px"><el-date-picker v-model="f.created_at_from" type="date" placeholder="from" value-format="YYYY-MM-DD" size="small" style="width:100%"/><el-date-picker v-model="f.created_at_to" type="date" placeholder="to" value-format="YYYY-MM-DD" size="small" style="width:100%"/></div></el-col>
        <el-col :span="6"><div class="fl">Order Date</div><div style="display:flex;gap:8px"><el-date-picker v-model="f.order_date_from" type="date" placeholder="from" value-format="YYYY-MM-DD" size="small" style="width:100%"/><el-date-picker v-model="f.order_date_to" type="date" placeholder="to" value-format="YYYY-MM-DD" size="small" style="width:100%"/></div></el-col>
        <el-col :span="6"><div class="fl">Refunded</div><div style="display:flex;gap:8px"><el-input v-model="f.refunded_from" placeholder="from" size="small"/><el-input v-model="f.refunded_to" placeholder="to" size="small"/></div></el-col>
        <el-col :span="6"><div class="fl">Credit Memo #</div><el-input v-model="f.creditmemo_increment_id" size="small"/></el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top:12px">
        <el-col :span="6"><div class="fl">Order #</div><el-input v-model="f.order_increment_id" size="small"/></el-col>
        <el-col :span="6"><div class="fl">Bill-to Name</div><el-input v-model="f.bill_to_name" size="small"/></el-col>
        <el-col :span="6"><div class="fl">Status</div><el-select v-model="f.status" clearable size="small" style="width:100%"><el-option label="Pending" value="Pending"/><el-option label="Refunded" value="Refunded"/><el-option label="Canceled" value="Canceled"/></el-select></el-col>
      </el-row>
      <div class="fa"><el-button @click="reset">Cancel</el-button><el-button type="primary" @click="apply">Apply Filters</el-button></div>
    </div>
    <div class="tc"><span class="rc">{{ t }} records found</span></div>
    <div class="tcard">
      <el-table :data="d" v-loading="l" border stripe>
        <el-table-column prop="creditmemo_increment_id" label="Credit Memo" width="130"/>
        <el-table-column prop="created_at" label="Created" width="180"><template #default="{row}">{{fd(row.created_at)}}</template></el-table-column>
        <el-table-column prop="order_increment_id" label="Order #" width="120"/>
        <el-table-column prop="order_created_at" label="Order Date" width="180"><template #default="{row}">{{fd(row.order_created_at)}}</template></el-table-column>
        <el-table-column prop="bill_to_name" label="Bill-to Name"/>
        <el-table-column prop="status" label="Status" width="100"/>
        <el-table-column prop="refunded" label="Refunded" width="140" align="right"><template #default="{row}">{{fc(row.refunded)}}</template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'; import { Filter } from '@element-plus/icons-vue'; import dayjs from 'dayjs'
const l=ref(false),d=ref([]),sf=ref(true),t=ref(0)
const f=reactive({created_at_from:null,created_at_to:null,order_date_from:null,order_date_to:null,refunded_from:'',refunded_to:'',creditmemo_increment_id:'',order_increment_id:'',bill_to_name:'',status:undefined})
const fd=v=>v?dayjs(v).format('MMM D, YYYY h:mm:ss A'):''
const fc=v=>v==null?'':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v)
const apply=()=>fetchData()
const reset=()=>{f.created_at_from=null;f.created_at_to=null;f.order_date_from=null;f.order_date_to=null;f.refunded_from='';f.refunded_to='';f.creditmemo_increment_id='';f.order_increment_id='';f.bill_to_name='';f.status=undefined;sf.value=false;fetchData()}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:1,pageSize:pagination.pageSize});Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/sales/credit-memos?${p}`);const j=await r.json();d.value=j.items||[];t.value=j.total||0}catch(e){console.error(e)}finally{l.value=false}}
const pagination=reactive({current:1,pageSize:20,total:0})
onMounted(()=>fetchData())
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.bar{display:flex;align-items:center;margin-bottom:16px;background:#f5f5f5;padding:12px;border:1px solid #e3e3e3;border-radius:4px;justify-content:flex-end}.tools{display:flex;gap:8px}.fsec{background:#f5f5f5;padding:16px;margin-bottom:16px;border:1px solid #e3e3e3;border-radius:4px}.fl{font-weight:600;font-size:12px;margin-bottom:6px;color:#333}.fa{display:flex;justify-content:flex-end;margin-top:12px;gap:8px}.tc{margin-bottom:16px}.rc{color:#666;font-size:13px}.tcard{background:#fff;padding:16px;border:1px solid #e3e3e3;border-radius:4px}</style>
