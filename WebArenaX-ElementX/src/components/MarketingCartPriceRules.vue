<template>
  <div class="p">
    <div class="ph"><h1 class="pt">Cart Price Rules</h1><el-button type="primary" class="ob" @click="addNew">Add New Rule</el-button></div>
    <div class="bar"><div class="tools"><el-button @click="sf=!sf"><el-icon><Filter /></el-icon> Filters</el-button></div></div>
    <div v-if="sf" class="fsec">
      <el-row :gutter="16">
        <el-col :span="6"><div class="fl">ID</div><div style="display:flex;gap:8px"><el-input v-model="f.rule_id_from" placeholder="from" size="small"/><el-input v-model="f.rule_id_to" placeholder="to" size="small"/></div></el-col>
        <el-col :span="6"><div class="fl">Rule</div><el-input v-model="f.name" size="small"/></el-col>
        <el-col :span="6"><div class="fl">Start</div><div style="display:flex;gap:8px"><el-date-picker v-model="f.from_date_from" type="date" placeholder="from" value-format="YYYY-MM-DD" size="small" style="width:100%"/><el-date-picker v-model="f.from_date_to" type="date" placeholder="to" value-format="YYYY-MM-DD" size="small" style="width:100%"/></div></el-col>
        <el-col :span="6"><div class="fl">End</div><div style="display:flex;gap:8px"><el-date-picker v-model="f.to_date_from" type="date" placeholder="from" value-format="YYYY-MM-DD" size="small" style="width:100%"/><el-date-picker v-model="f.to_date_to" type="date" placeholder="to" value-format="YYYY-MM-DD" size="small" style="width:100%"/></div></el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top:12px">
        <el-col :span="6"><div class="fl">Status</div><el-select v-model="f.is_active" clearable size="small" style="width:100%"><el-option label="Active" value="Active"/><el-option label="Inactive" value="Inactive"/></el-select></el-col>
      </el-row>
      <div class="fa"><el-button @click="reset">Cancel</el-button><el-button type="primary" @click="apply">Apply Filters</el-button></div>
    </div>
    <div class="tc"><span class="rc">{{ t }} records found</span><div class="right"><el-select v-model="pg.pageSize" style="width:80px" size="small" @change="onPs"><el-option v-for="s in [20,50,100,200]" :key="s" :label="s" :value="s"/></el-select><span class="rc" style="margin-left:8px">per page</span><el-pagination v-model:current-page="pg.current" :total="t" :page-size="pg.pageSize" layout="prev,pager,next" small @current-change="onP"/></div></div>
    <div class="tcard">
      <el-table :data="d" v-loading="l" border stripe @row-click="onRow" style="cursor:pointer">
        <el-table-column prop="rule_id" label="ID" width="80"/>
        <el-table-column prop="name" label="Rule"/>
        <el-table-column prop="coupon_code" label="Coupon" width="150"/>
        <el-table-column prop="from_date" label="Start" width="120"><template #default="{row}">{{fd(row.from_date)}}</template></el-table-column>
        <el-table-column prop="to_date" label="End" width="120"><template #default="{row}">{{fd(row.to_date)}}</template></el-table-column>
        <el-table-column prop="is_active" label="Status" width="100"><template #default="{row}">{{row.is_active==1?'Active':'Inactive'}}</template></el-table-column>
        <el-table-column prop="sort_order" label="Priority" width="80"/>
        <el-table-column label="Action" width="80" fixed="right"><template #default><a href="#">Edit</a></template></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'; import { Filter } from '@element-plus/icons-vue'; import dayjs from 'dayjs'
const emit=defineEmits(['navigate'])
const l=ref(false),d=ref([]),sf=ref(true),t=ref(0)
const f=reactive({rule_id_from:'',rule_id_to:'',name:'',from_date_from:null,from_date_to:null,to_date_from:null,to_date_to:null,is_active:undefined})
const pg=reactive({current:1,pageSize:20})
const fd=v=>v?dayjs(v).format('MMM D, YYYY'):''
const addNew=()=>emit('navigate','marketing_cart_price_rule_add')
const apply=()=>{pg.current=1;fetchData()}
const reset=()=>{f.rule_id_from='';f.rule_id_to='';f.name='';f.from_date_from=null;f.from_date_to=null;f.to_date_from=null;f.to_date_to=null;f.is_active=undefined;sf.value=false;fetchData()}
const onP=(p)=>{pg.current=p;fetchData()};const onPs=()=>{pg.current=1;fetchData()}
const onRow=(r)=>{emit('navigate','marketing_cart_price_rule_add',{id:r.rule_id})}
const fetchData=async()=>{l.value=true;try{const p=new URLSearchParams({page:pg.current,pageSize:pg.pageSize});Object.entries(f).forEach(([k,v])=>{if(v!=null&&v!=='')p.append(k,v)});const r=await fetch(`/api/marketing/cart-rules?${p}`);const j=await r.json();d.value=j.items||[];t.value=j.total||0;const edits=window.__edits__||{};for(const[k,v]of Object.entries(edits)){if(k.startsWith('cartrule_')&&v.name){const idx=d.value.findIndex(x=>x.rule_id==v.rule_id);if(idx!==-1)d.value[idx]={...d.value[idx],...v};else d.value.unshift(v)}} }catch(e){console.error(e)}finally{l.value=false}}
onMounted(()=>fetchData())
</script>
<style scoped>.p{padding:0}.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.pt{font-size:28px;font-weight:300;margin:0;color:#262626}.ob{background-color:#eb5202;border-color:#eb5202}.bar{display:flex;align-items:center;margin-bottom:16px;background:#f5f5f5;padding:12px;border:1px solid #e3e3e3;border-radius:4px;justify-content:flex-end}.tools{display:flex;gap:8px}.fsec{background:#f5f5f5;padding:16px;margin-bottom:16px;border:1px solid #e3e3e3;border-radius:4px}.fl{font-weight:600;font-size:12px;margin-bottom:6px;color:#333}.fa{display:flex;justify-content:flex-end;margin-top:12px;gap:8px}.tc{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.rc{color:#666;font-size:13px}.right{display:flex;align-items:center;gap:0}.tcard{background:#fff;padding:16px;border:1px solid #e3e3e3;border-radius:4px}</style>
